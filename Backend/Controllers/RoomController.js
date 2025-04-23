const Room = require('../Models/Room');

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room ID already exists' });
    }
    
    // Create new room
    const roomData = {
      roomId,
      password
    };
    
    // If user is authenticated, add user info
    if (req.user) {
      roomData.createdBy = req.user.id;
      roomData.members = [req.user.id];
    }
    
    const room = new Room(roomData);
    await room.save();
    
    // Return success but don't include password
    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Join an existing room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;
    
    // Find the room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Verify password
    const isMatch = await room.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    
    // Check if user is authenticated and add to members
    if (req.user) {
      console.log('User ID to add:', req.user.id);
      console.log('Current members array:', room.members);
      
      // Check if user is not already a member
      if (!room.members.includes(req.user.id)) {
        room.members.push(req.user.id);
        await room.save();
        console.log('Updated members array:', room.members);
      }
    } else {
      console.log('No authenticated user found in request');
    }
    
    res.json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        createdAt: room.createdAt,
        members: room.members // Include members in response
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Get room details
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId })
      .select('-password'); // Exclude password
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};