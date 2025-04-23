// src/pages/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-400">
          <Link to="/">VoyageVault</Link>
        </div>
        <div className="flex gap-4">
          {/* <Link to="/login" className="px-4 py-2 text-blue-400 hover:bg-gray-700 rounded-md transition">Login</Link> */}
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Login</Link>
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
    <Link
      to="/signup"
      className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-md hover:bg-amber-600 transform hover:-translate-y-1 transition duration-300"
    >
      Get Started
    </Link>
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