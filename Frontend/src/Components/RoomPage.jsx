import { useState } from 'react';
import RoomForm from './RoomForm';
import RoomDashboard from './Roomdashboard';
import axios from 'axios';

const HomePage = () => {
  const [view, setView] = useState('main'); // 'main', 'create', 'join', 'dashboard'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);

  const API_URL = 'http://localhost:5100/api';

  const handleCreateRoom = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/rooms`, formData);
      setCurrentRoom(response.data.room);
      setView('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/rooms/join`, formData);
      setCurrentRoom(response.data.room);
      setView('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
      console.error('Error joining room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    setView('main');
    setCurrentRoom(null);
    setError('');
  };

  // Main view
  const renderMainView = () => (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold">Room System</h1>
      <button
        onClick={() => setView('create')}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Room
      </button>
      <button
        onClick={() => setView('join')}
        className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
      >
        Join Room
      </button>
    </div>
  );

  // Create room view
  const renderCreateView = () => (
    <div className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Create a New Room</h2>
      {error && <p className="text-red-500">{error}</p>}
      <RoomForm type="create" onSubmit={handleCreateRoom} loading={loading} />
      <button
        onClick={() => {
          setView('main');
          setError('');
        }}
        className="text-blue-500 hover:underline"
      >
        Back to Home
      </button>
    </div>
  );

  // Join room view
  const renderJoinView = () => (
    <div className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Join an Existing Room</h2>
      {error && <p className="text-red-500">{error}</p>}
      <RoomForm type="join" onSubmit={handleJoinRoom} loading={loading} />
      <button
        onClick={() => {
          setView('main');
          setError('');
        }}
        className="text-blue-500 hover:underline"
      >
        Back to Home
      </button>
    </div>
  );

  // Dashboard view
  const renderDashboardView = () => (
    <div className="max-w-xl mx-auto">
      <RoomDashboard roomId={currentRoom.roomId} onExit={handleExit} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {view === 'main' && renderMainView()}
      {view === 'create' && renderCreateView()}
      {view === 'join' && renderJoinView()}
      {view === 'dashboard' && renderDashboardView()}
    </div>
  );
};

export default HomePage;
