import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RoomForm from './RoomForm';
import axios from 'axios';

const CreateRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5100/api';

  const handleCreateRoom = async (formData) => {
    setLoading(true);
    setError('');

    try {
      // Get the token from localStorage or wherever you store it
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
      
      const response = await axios.post(
        `${API_URL}/rooms`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      navigate(`/room/${response.data.room.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
      console.error('Error creating room:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <nav className="bg-gray-800 shadow-md px-6 py-4">
        <div className="text-2xl font-bold text-blue-400">
          <Link to="/">VoyageVault</Link>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Create a New Room</h2>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <RoomForm type="create" onSubmit={handleCreateRoom} loading={loading} />

          <div className="text-center mt-8">
            <Link to="/rooms" className="text-blue-400 hover:text-blue-300 font-medium">
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 bg-gray-800 text-gray-300 text-center">
        <p>&copy; 2025 VoyageVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreateRoom;