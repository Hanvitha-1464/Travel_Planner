import { useState } from 'react';

const RoomForm = ({ type, onSubmit, loading }) => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!roomId || !password) {
      setError('All fields are required');
      return;
    }

    if (type === 'create' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onSubmit({ roomId, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="roomId" className="block text-gray-300 text-sm font-bold mb-2">Room ID</label>
        <input
          id="roomId"
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-gray-100 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          placeholder="Enter room ID"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-gray-100 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          placeholder="Enter password"
          disabled={loading}
        />
      </div>

      {type === 'create' && (
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-bold mb-2">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-gray-100 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="Confirm password"
            disabled={loading}
          />
        </div>
      )}

      {error && <p className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">{error}</p>}

      <button
        type="submit"
        className={`w-full py-3 px-4 rounded font-bold ${loading ? 'bg-gray-600' : type === 'create' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white transition duration-300`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {type === 'create' ? 'Creating...' : 'Joining...'}
          </span>
        ) : (
          type === 'create' ? 'Create Room' : 'Join Room'
        )}
      </button>
    </form>
  );
};

export default RoomForm;