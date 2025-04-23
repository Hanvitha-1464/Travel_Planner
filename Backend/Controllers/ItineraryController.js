// controllers/itineraryController.js
const Itinerary = require('../Models/Itinerary');
const Room = require('../Models/Room'); // Assuming you have a Room model

// Create a new itinerary
// Create a new itinerary
exports.createItinerary = async (req, res) => {
  try {
    const { roomId, title, startDate, endDate } = req.body;
    
    // Validate if the room exists
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Add user to room members if not already a member
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    
    const newItinerary = new Itinerary({
      roomId: room._id,
      title,
      startDate,
      endDate,
      activities: [],
      createdBy: req.user._id
    });
    
    const savedItinerary = await newItinerary.save();
    
    res.status(201).json({
      success: true,
      itinerary: savedItinerary
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// Get all itineraries for a specific room
exports.getRoomItineraries = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Validate if the room exists using roomId field instead of _id
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Fetch itineraries for the room using the room's _id
    const itineraries = await Itinerary.find({ roomId: room._id })
      .sort({ startDate: 1 })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: itineraries.length,
      itineraries
    });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a specific itinerary
exports.getItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    
    const itinerary = await Itinerary.findById(itineraryId)
      .populate('createdBy', 'name')
      .populate('activities.createdBy', 'name');
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    res.status(200).json({
      success: true,
      itinerary
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an itinerary
exports.updateItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { title, startDate, endDate } = req.body;
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Update fields
    itinerary.title = title || itinerary.title;
    itinerary.startDate = startDate || itinerary.startDate;
    itinerary.endDate = endDate || itinerary.endDate;
    
    const updatedItinerary = await itinerary.save();
    
    res.status(200).json({
      success: true,
      itinerary: updatedItinerary
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an itinerary
exports.deleteItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    await Itinerary.findByIdAndDelete(itineraryId);
    
    res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add an activity to an itinerary
exports.addActivity = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { title, description, location, date, startTime, endTime, cost, notes } = req.body;
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    const newActivity = {
      title,
      description,
      location,
      date,
      startTime,
      endTime,
      cost: cost || 0,
      notes,
      createdBy: req.user.id
    };
    
    itinerary.activities.push(newActivity);
    
    const updatedItinerary = await itinerary.save();
    
    res.status(201).json({
      success: true,
      activity: updatedItinerary.activities[updatedItinerary.activities.length - 1],
      itinerary: updatedItinerary
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an activity
exports.updateActivity = async (req, res) => {
  try {
    const { itineraryId, activityId } = req.params;
    const updates = req.body;
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    const activityIndex = itinerary.activities.findIndex(
      activity => activity._id.toString() === activityId
    );
    
    if (activityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    // Update activity fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        itinerary.activities[activityIndex][key] = updates[key];
      }
    });
    
    const updatedItinerary = await itinerary.save();
    
    res.status(200).json({
      success: true,
      activity: updatedItinerary.activities[activityIndex],
      itinerary: updatedItinerary
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
  try {
    const { itineraryId, activityId } = req.params;
    
    const itinerary = await Itinerary.findById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Filter out the activity to delete
    itinerary.activities = itinerary.activities.filter(
      activity => activity._id.toString() !== activityId
    );
    
    const updatedItinerary = await itinerary.save();
    
    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      itinerary: updatedItinerary
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};