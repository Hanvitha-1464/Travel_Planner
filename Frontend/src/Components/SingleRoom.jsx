import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaClipboardList, FaMoneyBillWave, FaFileAlt, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const SingleRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserData(JSON.parse(storedUserInfo));
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }

    // Fetch room details
    const fetchRoomDetails = async () => {
      try {
        // Get the token from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.get(
          `http://localhost:5100/api/rooms/${roomId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setRoomDetails(response.data.room);
        setLoading(false);
      } catch (err) {
        setError('Failed to load room details');
        setLoading(false);
        console.error('Error fetching room details:', err);
      }
    };
    if (roomId) {
      fetchRoomDetails();
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roomId, navigate]);

  const handleExit = () => {
    navigate('/rooms');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <nav className="bg-gray-800 shadow-md px-6 py-4">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <footer className="py-6 bg-gray-800 text-gray-300 text-center">
          <p>&copy; 2025 VoyageVault. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <nav className="bg-gray-800 shadow-md px-6 py-4">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <button
              onClick={handleExit}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Back to Rooms
            </button>
          </div>
        </div>
        <footer className="py-6 bg-gray-800 text-gray-300 text-center">
          <p>&copy; 2025 VoyageVault. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <nav className="bg-gray-800 shadow-md px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-200"
            >
              <FaUserCircle className="text-blue-400" />
              <span className="font-medium">{userData?.name || 'User'}</span>
              <FaChevronDown className="text-gray-400" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-400">Room: {roomDetails?.roomId}</h3>
                  <p className="text-sm text-gray-300 mt-1">{userData?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {roomDetails?.createdAt ? new Date(roomDetails.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleExit}
                    className="flex items-center px-3 py-2 w-full text-left hover:bg-gray-700 text-red-400 rounded transition"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Exit Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-12">
          Room Activities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Itinerary Planning Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition duration-300 hover:transform hover:scale-105">
            <div className="bg-blue-900 p-4">
              <div className="flex items-center justify-center h-16">
                <FaClipboardList className="text-4xl text-blue-300" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-3">Itinerary Planning</h3>
              <p className="text-gray-300 mb-4">Plan your travel activities, set schedules, and organize your journey together.</p>
              <Link 
                to={`/room/${roomId}/itinerary`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded transition duration-300"
              >
                Plan Now
              </Link>
            </div>
          </div>

          {/* Expense Tracking Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition duration-300 hover:transform hover:scale-105">
            <div className="bg-green-900 p-4">
              <div className="flex items-center justify-center h-16">
                <FaMoneyBillWave className="text-4xl text-green-300" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">Expense Tracking</h3>
              <p className="text-gray-300 mb-4">Track shared expenses, split costs, and manage your travel budget together.</p>
              <Link 
                to={`/room/${roomId}/expenses`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-2 px-4 rounded transition duration-300"
              >
                Track Expenses
              </Link>
            </div>
          </div>

          {/* Document Sharing Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition duration-300 hover:transform hover:scale-105">
            <div className="bg-purple-900 p-4">
              <div className="flex items-center justify-center h-16">
                <FaFileAlt className="text-4xl text-purple-300" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-3">Document Sharing</h3>
              <p className="text-gray-300 mb-4">Share important documents, tickets, reservations, and travel guides.</p>
              <Link 
                to={`/room/${roomId}/documents`}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-bold py-2 px-4 rounded transition duration-300"
              >
                Share Documents
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 bg-gray-800 text-gray-300 text-center">
        <p>&copy; 2025 VoyageVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SingleRoom;