// src/pages/Home.jsx
import { Link,useNavigate } from 'react-router-dom';
import {FaUserCircle,FaSignOutAlt,FaDoorOpen} from 'react-icons/fa';
import { useEffect,useState } from 'react';
const Home = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        name: "User",
        email: "",
      });
      useEffect(() => {
        const loadUser = () => {
          try {
            const storedUserInfo = localStorage.getItem("userInfo");
            if (storedUserInfo) {
              const parsedUserInfo = JSON.parse(storedUserInfo);
              setUserInfo(parsedUserInfo);
              console.log("Loaded user info:", parsedUserInfo);
            }
          } catch (error) {
            console.log("Error parsing user info:", error);
          }
        };
      
        loadUser();
      }, []);
      
            const handleLogout = () => {
              localStorage.clear();
              navigate('/');
            };
            const handleRoom = () => {
              navigate('/rooms');
            };
            
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-400">
          <Link to="/">VoyageVault</Link>
        </div>
        <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-600 transition shadow-md"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-inner">
                  <FaUserCircle size={20} />
                </div>
                <span>{userInfo.name || "User"}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden z-10 border border-gray-700 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium">{userInfo.name}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{userInfo.email}</p>
                  </div>
                  <div className="py-1">
                  <button
                    onClick={handleRoom}
                    className="flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-700 text-red-400 transition"
                  >
                    <FaDoorOpen className="mr-3" />
                    Join Room
                  </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-700 text-red-400 transition"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative py-32 bg-gray-800 text-white text-center">
  <div className="absolute inset-0 bg-black opacity-40"></div> {/* Overlay */}
  <div className="relative z-10 max-w-3xl mx-auto px-4">
    <h1 className="text-5xl font-bold mb-4">Plan Your Travels Together</h1>
    <p className="text-xl mb-8 text-gray-300">
      Collaborate with friends and family to create the perfect trip itinerary
    </p>
  </div>
</section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-900">
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-12">Everything You Need For Collaborative Travel Planning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:transform hover:-translate-y-2 transition duration-300 border border-gray-700">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Create Rooms</h3>
            <p className="text-gray-300">Invite friends and family to private planning spaces</p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:transform hover:-translate-y-2 transition duration-300 border border-gray-700">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Itinerary Planning</h3>
            <p className="text-gray-300">Build day-by-day plans with real-time collaboration</p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:transform hover:-translate-y-2 transition duration-300 border border-gray-700">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Expense Tracking</h3>
            <p className="text-gray-300">Track and split costs among all travelers</p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg hover:transform hover:-translate-y-2 transition duration-300 border border-gray-700">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Document Sharing</h3>
            <p className="text-gray-300">Share important documents, tickets, and reservations</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-800 text-gray-300 text-center">
        <p>&copy; 2025 VoyageVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;