// src/pages/ItineraryEdit.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { format } from 'date-fns';

const ItineraryEdit = () => {
  const { roomId, itineraryId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.get(`http://localhost:5100/api/itineraries/${itineraryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const itineraryData = response.data.itinerary;
        setItinerary(itineraryData);
        
        // Format dates for form inputs
        setFormData({
          title: itineraryData.title,
          startDate: format(new Date(itineraryData.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(itineraryData.endDate), 'yyyy-MM-dd')
        });
        
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
      const response = await axios.put(
        `http://localhost:5100/api/itineraries/${itineraryId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Navigate back to itinerary detail page
      navigate(`/room/${roomId}/itinerary/${itineraryId}`);
    } catch (err) {
      console.error('Error updating itinerary:', err);
      setError('Failed to update itinerary');
      setSaveLoading(false);
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
        <div className="flex items-center mb-8">
          <Link to={`/room/${roomId}/itinerary/${itineraryId}`} className="mr-4 text-gray-400 hover:text-blue-400 transition">
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-3xl font-bold text-blue-400">Edit Itinerary</h1>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Itinerary Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
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
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link
                to={`/room/${roomId}/itinerary/${itineraryId}`}
                className="mr-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saveLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItineraryEdit;