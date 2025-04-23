// models/document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
      ref: 'Room',
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true, // pdf, image, video
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
documentSchema.index({ roomId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;