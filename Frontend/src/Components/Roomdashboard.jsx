import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoomDashboard = ({ roomId }) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserData(JSON.parse(storedUserInfo));
    }

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

    fetchRoomDetails();
  }, [roomId]);

  const handleExit = () => {
    navigate('/rooms');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={handleExit}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Room: {roomDetails?.roomId}</h2>
      
      <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
        <p className="text-gray-300 mb-2">
          <span className="font-bold">User:</span> {userData?.name || 'Unknown User'}
        </p>
        <p className="text-gray-300 mb-2">
          <span className="font-bold">Email:</span> {userData?.email || 'No email found'}
        </p>
        <p className="text-gray-300 mb-2">
          <span className="font-bold">Created:</span> {roomDetails?.createdAt ? new Date(roomDetails.createdAt).toLocaleString() : 'Unknown'}
        </p>
        
        {/* Display number of members */}
        <p className="text-gray-300">
          <span className="font-bold">Members:</span> {roomDetails?.members?.length || 0}
        </p>
      </div>

      <button
        onClick={handleExit}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
      >
        Exit Room
      </button>
    </div>
  );
};

export default RoomDashboard;