// src/pages/ItineraryDetail.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, 
  FaClock, FaMoneyBillWave, FaStickyNote 
} from 'react-icons/fa';
import { format } from 'date-fns';

const ItineraryDetail = () => {
  const { roomId, itineraryId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    cost: '',
    notes: ''
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.get(`http://localhost:5100/api/itineraries/${itineraryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItinerary(response.data.itinerary);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching itinerary details:', err);
        setError('Failed to load itinerary details');
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for cost field to prevent automatic conversion
    if (name === 'cost') {
      setNewActivity({
        ...newActivity,
        [name]: value // Store as string without conversion
      });
    } else {
      setNewActivity({
        ...newActivity,
        [name]: value
      });
    }
  };

  const resetActivityForm = () => {
    setNewActivity({
      title: '',
      description: '',
      location: '',
      date: '',
      startTime: '',
      endTime: '',
      cost: '',
      notes: ''
    });
    setEditingActivity(null);
    setShowActivityForm(false);
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity._id);
    setNewActivity({
      title: activity.title,
      description: activity.description || '',
      location: activity.location || '',
      date: activity.date ? format(new Date(activity.date), 'yyyy-MM-dd') : '',
      startTime: activity.startTime,
      endTime: activity.endTime,
      cost: activity.cost || '',
      notes: activity.notes || ''
    });
    setShowActivityForm(true);
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
      let response;
      
      if (editingActivity) {
        // Update existing activity
        response = await axios.put(
          `http://localhost:5100/api/itineraries/${itineraryId}/activities/${editingActivity}`,
          newActivity,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Create new activity
        response = await axios.post(
          `http://localhost:5100/api/itineraries/${itineraryId}/activities`,
          newActivity,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      setItinerary(response.data.itinerary);
      resetActivityForm();
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Failed to save activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.delete(
          `http://localhost:5100/api/itineraries/${itineraryId}/activities/${activityId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setItinerary(response.data.itinerary);
      } catch (err) {
        console.error('Error deleting activity:', err);
        setError('Failed to delete activity');
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

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <div className="flex-1 container mx-auto py-12 px-4">
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            Itinerary not found
          </div>
          <button
            onClick={() => navigate(`/room/${roomId}/itinerary`)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition"
          >
            <FaArrowLeft className="mr-2" /> Back to Itineraries
          </button>
        </div>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = {};
  if (itinerary.activities && itinerary.activities.length > 0) {
    itinerary.activities.forEach(activity => {
      const dateKey = format(new Date(activity.date), 'yyyy-MM-dd');
      if (!groupedActivities[dateKey]) {
        groupedActivities[dateKey] = [];
      }
      groupedActivities[dateKey].push(activity);
    });
    
    // Sort activities by start time for each day
    Object.keys(groupedActivities).forEach(date => {
      groupedActivities[date].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to={`/room/${roomId}/itinerary`} className="mr-4 text-gray-400 hover:text-blue-400 transition">
              <FaArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-bold text-blue-400">{itinerary.title}</h1>
          </div>
          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition"
          >
            <FaPlus className="mr-2" /> Add Activity
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-wrap mb-4">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <FaClock className="text-blue-400 mr-2" />
                <span className="text-xl font-semibold text-gray-300">
                  {format(new Date(itinerary.startDate), 'MMMM d, yyyy')} - {format(new Date(itinerary.endDate), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="text-gray-400">
                Created by: {itinerary.createdBy?.name || 'Unknown'}
              </div>
            </div>
            <div className="w-full md:w-1/2 md:text-right">
              <div className="text-gray-400">
                {itinerary.activities?.length || 0} Activities Planned
              </div>
              <div className="mt-2">
                <button
                  onClick={() => navigate(`/room/${roomId}/itinerary/${itineraryId}/edit`)}
                  className="text-blue-400 hover:text-blue-300 transition mr-4"
                >
                  <FaEdit className="inline mr-1" /> Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {showActivityForm && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              {editingActivity ? 'Edit Activity' : 'Add New Activity'}
            </h2>
            <form onSubmit={handleActivitySubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newActivity.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newActivity.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newActivity.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={newActivity.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={newActivity.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Estimated Cost</label>
                <input
                  type="number"
                  name="cost"
                  value={newActivity.cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={newActivity.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetActivityForm}
                  className="mr-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  {editingActivity ? 'Update Activity' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        )}

        {Object.keys(groupedActivities).length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-700">
            <FaClock className="text-5xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-4">No Activities Planned Yet</h2>
            <p className="text-gray-500 mb-6">
              Start adding activities to your itinerary
            </p>
            <button
              onClick={() => setShowActivityForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition"
            >
              <FaPlus className="mr-2" /> Add Activity
            </button>
          </div>
        ) : (
          <div>
            {Object.keys(groupedActivities).sort().map(date => (
              <div key={date} className="mb-8">
                <h2 className="text-xl font-bold text-blue-400 mb-4 px-4 py-2 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h2>
                <div className="space-y-4">
                  {groupedActivities[date].map(activity => (
                    <div 
                      key={activity._id} 
                      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition"
                    >
                      <div className="bg-blue-900 p-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">{activity.title}</h3>
                        <div className="text-gray-300">
                          {activity.startTime} - {activity.endTime}
                        </div>
                      </div>
                      <div className="p-4">
                        {activity.description && (
                          <div className="mb-3">
                            <p className="text-gray-300">{activity.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activity.location && (
                            <div className="flex items-start">
                              <FaMapMarkerAlt className="text-red-400 mr-2 mt-1" />
                              <div>
                                <p className="text-sm text-gray-400">Location</p>
                                <p className="text-gray-300">{activity.location}</p>
                              </div>
                            </div>
                          )}
                          
                          {activity.cost > 0 && (
                            <div className="flex items-start">
                              <FaMoneyBillWave className="text-green-400 mr-2 mt-1" />
                              <div>
                                <p className="text-sm text-gray-400">Estimated Cost</p>
                                <p className="text-gray-300">₹{Number(activity.cost).toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {activity.notes && (
                          <div className="mt-3 flex items-start">
                            <FaStickyNote className="text-yellow-400 mr-2 mt-1" />
                            <div>
                              <p className="text-sm text-gray-400">Notes</p>
                              <p className="text-gray-300">{activity.notes}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleDeleteActivity(activity._id)}
                            className="text-red-400 hover:text-red-300 transition mr-3"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => handleEditClick(activity)}
                            className="text-blue-400 hover:text-blue-300 transition"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryDetail;