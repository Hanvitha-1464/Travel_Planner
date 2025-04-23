// routes/itineraryRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/AuthValidation'); // Assuming you have auth middleware
const {
  createItinerary,
  getRoomItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  addActivity,
  updateActivity,
  deleteActivity
} = require('../Controllers/ItineraryController');

// Base route is /api/itineraries

// Itinerary routes
router.post('/', protect, createItinerary);
router.get('/room/:roomId', protect, getRoomItineraries);
router.get('/:itineraryId', protect, getItinerary);
router.put('/:itineraryId', protect, updateItinerary);
router.delete('/:itineraryId', protect, deleteItinerary);

// Activity routes
router.post('/:itineraryId/activities', protect, addActivity);
router.put('/:itineraryId/activities/:activityId', protect, updateActivity);
router.delete('/:itineraryId/activities/:activityId', protect, deleteActivity);

module.exports = router;