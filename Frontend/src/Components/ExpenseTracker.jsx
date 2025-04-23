import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaMoneyBillWave, 
  FaTrash, 
  FaEdit, 
  FaUserCircle, 
  FaArrowLeft,
  FaChartPie,
  FaExchangeAlt 
} from 'react-icons/fa';

// Currency conversion rate (example rate - can be updated)
const USD_TO_INR_RATE = 75;

const RoomExpenses = () => {
  const { roomId } = useParams();
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    splitType: 'equal',
    specificSplits: []
  });
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserData(JSON.parse(storedUserInfo));
    }
  
    const fetchExpenses = async () => {
      try {
        // Fetch room details 
        const roomResponse = await axios.get(`http://localhost:5100/api/rooms/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(storedUserInfo).token}`
          }
        });
        
        // Fetch expenses - this now includes room members
        const expensesResponse = await axios.get(`http://localhost:5100/api/expenses/room/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(storedUserInfo).token}`
          }
        });
        
        setExpenses(expensesResponse.data.expenses);
        
        // Use room members from the expenses response
        const members = expensesResponse.data.roomMembers || [];
        setRoomMembers(members);
        
        // Initialize specificSplits with all members
        setFormData(prev => ({
          ...prev,
          specificSplits: members.map(member => ({
            userId: member._id,
            userName: member.name,
            amount: 0
          }))
        }));
        
        // Fetch expense summary
        const summaryResponse = await axios.get(`http://localhost:5100/api/expenses/summary/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(storedUserInfo).token}`
          }
        });
        
        setSummary(summaryResponse.data.summary);
        
        // If members weren't in expenses response, use them from summary
        if (members.length === 0 && summaryResponse.data.summary.roomMembers) {
          setRoomMembers(summaryResponse.data.summary.roomMembers);
          
          setFormData(prev => ({
            ...prev,
            specificSplits: summaryResponse.data.summary.roomMembers.map(member => ({
              userId: member._id,
              userName: member.name,
              amount: 0
            }))
          }));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load expenses');
        setLoading(false);
        console.error('Error fetching expenses:', err);
      }
    };
  
    if (roomId && storedUserInfo) {
      fetchExpenses();
    }
  }, [roomId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // If amount or split type changes, update the specific splits
    if (e.target.name === 'amount' || e.target.name === 'splitType') {
      updateSplitAmounts(e.target.name === 'amount' ? e.target.value : formData.amount);
    }
  };

  const updateSplitAmounts = (totalAmount) => {
    const amount = parseFloat(totalAmount) || 0;
    
    if (formData.splitType === 'equal') {
      // Calculate per-person amount with higher precision
      const perPersonAmount = amount / roomMembers.length;
      
      // For equal splits, ensure the total adds up exactly by adjusting the last person's amount
      setFormData(prev => {
        const updatedSplits = prev.specificSplits.map((split, index) => {
          if (index === prev.specificSplits.length - 1) {
            // For the last person, calculate the amount that makes the total exact
            const sumOfOthers = prev.specificSplits.slice(0, -1)
              .reduce((sum, s) => sum + perPersonAmount, 0);
            return {
              ...split,
              amount: parseFloat((amount - sumOfOthers).toFixed(2))
            };
          }
          return {
            ...split,
            amount: parseFloat(perPersonAmount.toFixed(2))
          };
        });
        
        return {
          ...prev,
          specificSplits: updatedSplits
        };
      });
    }
  };

  const handleSplitAmountChange = (userId, value) => {
    setFormData(prev => ({
      ...prev,
      specificSplits: prev.specificSplits.map(split => 
        split.userId === userId ? { ...split, amount: parseFloat(value) } : split
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // For backend storage, we need USD - but we want to minimize rounding errors
      // Store the original rupee amount for precise calculations
      const amountInRupees = parseFloat(formData.amount);
      
      // Convert to USD with higher precision (not rounding yet)
      const amountInUSD = amountInRupees / USD_TO_INR_RATE;
      
      // Prepare the expense data
      const expenseData = {
        roomId,
        description: formData.description,
        // Store with 4 decimal places in USD to minimize rounding errors
        amount: parseFloat(amountInUSD.toFixed(4)),
        category: formData.category,
        // Handle split amounts with precision as well
        splitBetween: formData.specificSplits.map(split => {
          // Get the original split amount in rupees
          const splitAmountInRupees = parseFloat(split.amount);
          // Convert to USD with higher precision
          const splitAmountInUSD = splitAmountInRupees / USD_TO_INR_RATE;
          
          return {
            userId: split.userId,
            userName: split.userName,
            // Store with 4 decimal places to minimize rounding errors
            amount: parseFloat(splitAmountInUSD.toFixed(4))
          };
        })
      };
      
      // Validate that split amounts sum up to total (within rounding margin)
      if (formData.splitType === 'custom') {
        const totalSplitInRupees = formData.specificSplits.reduce(
          (sum, split) => sum + parseFloat(split.amount || 0), 
          0
        );
        
        // Check if the totals match within a small tolerance (1 rupee)
        if (Math.abs(totalSplitInRupees - amountInRupees) > 1) {
          alert(`Your split total (₹${totalSplitInRupees.toFixed(2)}) doesn't match the expense amount (₹${amountInRupees.toFixed(2)})`);
          return;
        }
      }
      
      const response = await axios.post('http://localhost:5100/api/expenses', expenseData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      // Add the new expense to the list (backend returns in USD)
      setExpenses([response.data.expense, ...expenses]);
      
      // Clear form and close modal
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        splitType: 'equal',
        specificSplits: roomMembers.map(member => ({
          userId: member._id,
          userName: member.name,
          amount: 0
        }))
      });
      setShowAddModal(false);
      
      // Refresh summary
      const summaryResponse = await axios.get(`http://localhost:5100/api/expenses/summary/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      setSummary(summaryResponse.data.summary);
      
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    }
  };
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`http://localhost:5100/api/expenses/${expenseId}`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });
        
        // Remove expense from list
        setExpenses(expenses.filter(expense => expense._id !== expenseId));
        
        // Refresh summary
        const summaryResponse = await axios.get(`http://localhost:5100/api/expenses/summary/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });
        setSummary(summaryResponse.data.summary);
        
      } catch (error) {
        console.error('Error deleting expense:', error);
        setError('Failed to delete expense');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to convert USD to INR for display
 // Function to convert USD to INR for display - using proper rounding
const convertToRupees = (amountInUSD) => {
  // For display purposes, round to the nearest rupee to avoid confusion
  return Math.round(amountInUSD * USD_TO_INR_RATE);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <nav className="bg-gray-800 shadow-md px-6 py-4">
          <div className="text-2xl font-bold text-green-400">
            <Link to="/">VoyageVault</Link>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <nav className="bg-gray-800 shadow-md px-6 py-4">
          <div className="text-2xl font-bold text-green-400">
            <Link to="/">VoyageVault</Link>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <nav className="bg-gray-800 shadow-md px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">
            <Link to="/">VoyageVault</Link>
          </div>
          <div className="flex items-center space-x-2">
            <FaUserCircle className="text-green-400" />
            <span className="font-medium">{userData?.name || 'User'}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4 flex-1">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link to={`/room/${roomId}`} className="mr-4 text-gray-400 hover:text-gray-300">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold text-green-400">Expense Tracking</h1>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <FaPlus />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Total Expenses</h3>
              <div className="text-3xl font-bold">₹{convertToRupees(summary.totalAmount)}</div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Categories</h3>
              <div className="space-y-2">
                {Object.entries(summary.expensesByCategory || {}).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span>{category}</span>
                    <span className="font-medium">₹{convertToRupees(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Settlements</h3>
              <div className="space-y-2">
                {summary.settlements && summary.settlements.length > 0 ? (
                  summary.settlements.map((settlement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{settlement.from}</span>
                        <FaExchangeAlt className="text-blue-400 mx-2" />
                        <span>{settlement.to}</span>
                      </div>
                      <span className="font-medium">₹{convertToRupees(settlement.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No settlements needed</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800">
              <thead>
                <tr className="bg-gray-700 text-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {expenses.length > 0 ? (
                  expenses.map(expense => (
                    <tr key={expense._id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">₹{convertToRupees(expense.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          expense.category === 'Food' ? 'bg-red-900 text-red-200' :
                          expense.category === 'Transportation' ? 'bg-blue-900 text-blue-200' :
                          expense.category === 'Accommodation' ? 'bg-purple-900 text-purple-200' :
                          expense.category === 'Activities' ? 'bg-yellow-900 text-yellow-200' :
                          expense.category === 'Shopping' ? 'bg-pink-900 text-pink-200' :
                          'bg-gray-600 text-gray-200'
                        }`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{expense.paidByName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          {expense.paidBy === userData?._id && (
                            <>
                              <button 
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="text-red-400 hover:text-red-300 transition"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No expenses added yet. Click "Add Expense" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="border-b border-gray-700 px-6 py-4">
              <h3 className="text-2xl font-bold text-green-400">Add New Expense</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-100"
                  placeholder="What was this expense for?"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-8 pr-4 text-gray-100"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-100"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Split Type</label>
                <select
                  name="splitType"
                  value={formData.splitType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-100"
                >
                  <option value="equal">Equal Split</option>
                  <option value="custom">Custom Split</option>
                </select>
              </div>
              
              {formData.splitType === 'custom' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Custom Split</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                    {formData.specificSplits.map(split => (
                      <div key={split.userId} className="flex justify-between items-center">
                        <span>{split.userName}</span>
                        <div className="relative w-32">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={split.amount}
                            onChange={(e) => handleSplitAmountChange(split.userId, e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-1 pl-8 pr-2 text-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            
              <div className="flex justify-end space-x-4 border-t border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     

      <footer className="py-6 bg-gray-800 text-gray-300 text-center">
        <p>&copy; 2025 VoyageVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RoomExpenses;