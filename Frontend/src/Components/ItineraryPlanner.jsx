// src/pages/ItineraryPlanner.js
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaCalendarAlt, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

const ItineraryPlanner = () => {
  const { roomId } = useParams();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.get(`http://localhost:5100/api/itineraries/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItineraries(response.data.itineraries);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load itineraries');
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [roomId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItinerary({
      ...newItinerary,
      [name]: value
    });
  };

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
      const response = await axios.post(
        'http://localhost:5100/api/itineraries',
        {
          ...newItinerary,
          roomId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setItineraries([...itineraries, response.data.itinerary]);
      setShowNewForm(false);
      setNewItinerary({
        title: '',
        startDate: '',
        endDate: ''
      });
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError('Failed to create itinerary');
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        await axios.delete(`http://localhost:5100/api/itineraries/${itineraryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setItineraries(itineraries.filter(item => item._id !== itineraryId));
      } catch (err) {
        console.error('Error deleting itinerary:', err);
        setError('Failed to delete itinerary');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <div className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to={`/room/${roomId}`} className="mr-4 text-gray-400 hover:text-blue-400 transition">
              <FaArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-bold text-blue-400">Itinerary Planner</h1>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition"
          >
            <FaPlus className="mr-2" /> Create New Itinerary
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showNewForm && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Create New Itinerary</h2>
            <form onSubmit={handleCreateItinerary}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newItinerary.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newItinerary.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newItinerary.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="mr-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Itinerary
                </button>
              </div>
            </form>
          </div>
        )}

        {itineraries.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-700">
            <FaCalendarAlt className="text-5xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-4">No Itineraries Yet</h2>
            <p className="text-gray-500 mb-6">
              Start planning your trip by creating your first itinerary
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition"
            >
              <FaPlus className="mr-2" /> Create Itinerary
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(itinerary => (
              <div key={itinerary._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300">
                <div className="bg-blue-900 p-4">
                  <h3 className="text-xl font-bold text-white truncate">{itinerary.title}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-blue-400 mr-2" />
                      <span className="text-gray-300">
                        {format(new Date(itinerary.startDate), 'MMM d, yyyy')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Created by: {itinerary.createdBy?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                      {itinerary.activities?.length || 0} Activities
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => handleDeleteItinerary(itinerary._id)}
                        className="mr-2 text-red-400 hover:text-red-300 transition"
                      >
                        <FaTrash />
                      </button>
                      <Link
                        to={`/room/${roomId}/itinerary/${itinerary._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition"
                      >
                        <FaEdit className="mr-2" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPlanner;