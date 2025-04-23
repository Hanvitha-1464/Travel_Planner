import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RoomListing = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserData(JSON.parse(storedUserInfo));
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <nav className="bg-gray-800 shadow-md px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
          {userData && (
            <div className="text-sm text-gray-300">
              Welcome, <span className="font-semibold">{userData.name}</span>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Room Management</h2>

          <div className="space-y-6">
            <Link to="/create-room">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300">
                Create New Room
              </button>
            </Link>

            <Link to="/join-room">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300">
                Join Existing Room
              </button>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">
              Back to Dashboard
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

export default RoomListing;