const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const roomController = require('../Controllers/RoomController');
const { validateRequest } = require('../Middleware/validate');
const { protect } = require('../Middleware/AuthValidation'); // Import your auth middleware

// Create a new room (with auth)
router.post(
  '/',
  protect, // Add authentication middleware
  [
    check('roomId', 'Room ID is required').notEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  validateRequest,
  roomController.createRoom
);

// Join an existing room (with auth)
router.post(
  '/join',
  protect, // Add authentication middleware
  [
    check('roomId', 'Room ID is required').notEmpty(),
    check('password', 'Password is required').notEmpty()
  ],
  validateRequest,
  roomController.joinRoom
);

// Get room details
router.get('/:roomId', roomController.getRoomDetails);

module.exports = router;