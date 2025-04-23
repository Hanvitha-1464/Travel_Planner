const Expense = require('../Models/Expenses');
const Room = require('../Models/Room');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { roomId, description, amount, category, splitBetween, receipt } = req.body;
    
    // Validate room exists
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Create new expense
    const expense = new Expense({
      roomId,
      description,
      amount,
      paidBy: req.user.id,
      paidByName: req.user.name,
      category,
      splitBetween,
      receipt
    });
    
    await expense.save();
    
    res.status(201).json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all expenses for a room
// Get all expenses for a room
exports.getRoomExpenses = async (req, res) => {
    try {
      const { roomId } = req.params;
      
      // Validate room exists and populate members
      const room = await Room.findOne({ roomId }).populate('members', 'name email');
      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }
      
      const expenses = await Expense.find({ roomId }).sort({ date: -1 });
      
      res.json({
        success: true,
        expenses,
        roomMembers: room.members.map(member => ({
          _id: member._id,
          name: member.name,
          email: member.email
        }))
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, amount, category, splitBetween, receipt } = req.body;
    
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    // Check if user is the one who created the expense
    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this expense' });
    }
    
    // Update fields
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.splitBetween = splitBetween || expense.splitBetween;
    expense.receipt = receipt || expense.receipt;
    
    await expense.save();
    
    res.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    // Check if user is the one who created the expense
    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this expense' });
    }
    
    await Expense.findByIdAndDelete(expenseId);
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get expense summary for a room
// Get expense summary for a room
exports.getExpenseSummary = async (req, res) => {
    try {
      const { roomId } = req.params;
      
      // Validate room exists and populate members
      const room = await Room.findOne({ roomId }).populate('members', 'name email');
      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }
      
      // Create a map of member IDs to member objects for quick access
      const membersMap = {};
      room.members.forEach(member => {
        membersMap[member._id.toString()] = {
          _id: member._id,
          name: member.name,
          email: member.email
        };
      });
      
      // Get all expenses for this room
      const expenses = await Expense.find({ roomId });
      
      // Calculate total expenses
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      });
      
      // Calculate who owes whom
      const balances = {};
      const settlements = [];
      
      expenses.forEach(expense => {
        const paidById = expense.paidBy.toString();
        
        // Initialize balance for payer if not exists
        if (!balances[paidById]) {
          balances[paidById] = {
            id: paidById,
            name: expense.paidByName,
            paid: 0,
            owed: 0,
            netBalance: 0
          };
        }
        
        // Add amount to what payer paid
        balances[paidById].paid += expense.amount;
        
        // Process split between users
        expense.splitBetween.forEach(split => {
          const splitUserId = split.userId.toString();
          
          // Initialize balance for user if not exists
          if (!balances[splitUserId]) {
            balances[splitUserId] = {
              id: splitUserId,
              name: split.userName,
              paid: 0,
              owed: 0,
              netBalance: 0
            };
          }
          
          // Add amount to what this user owes
          balances[splitUserId].owed += split.amount;
        });
      });
      
      // Calculate net balances
      Object.keys(balances).forEach(userId => {
        balances[userId].netBalance = balances[userId].paid - balances[userId].owed;
      });
      
      // Convert balances object to array
      const balanceSummary = Object.values(balances);
      
      // Calculate settlement plan (who pays whom)
      const debtors = balanceSummary.filter(user => user.netBalance < 0)
        .sort((a, b) => a.netBalance - b.netBalance);
      const creditors = balanceSummary.filter(user => user.netBalance > 0)
        .sort((a, b) => b.netBalance - a.netBalance);
      
      let i = 0, j = 0;
      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const debtAmount = Math.abs(debtor.netBalance);
        const creditAmount = creditor.netBalance;
        
        const settlementAmount = Math.min(debtAmount, creditAmount);
        
        if (settlementAmount > 0) {
          settlements.push({
            from: debtor.name,
            fromId: debtor.id,
            to: creditor.name,
            toId: creditor.id,
            amount: parseFloat(settlementAmount.toFixed(2))
          });
        }
        
        debtor.netBalance += settlementAmount;
        creditor.netBalance -= settlementAmount;
        
        if (Math.abs(debtor.netBalance) < 0.01) i++;
        if (Math.abs(creditor.netBalance) < 0.01) j++;
      }
      
      res.json({
        success: true,
        summary: {
          totalAmount,
          expensesByCategory,
          balanceSummary,
          settlements,
          // Include room member details to eliminate the need for separate user API calls
          roomMembers: room.members.map(member => ({
            _id: member._id,
            name: member.name,
            email: member.email
          }))
        }
      });
    } catch (error) {
      console.error('Error getting expense summary:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };