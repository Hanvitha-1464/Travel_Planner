// controllers/documentController.js
const Document = require('../Models/Document');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// Upload a document
const uploadDocument = asyncHandler(async (req, res) => {
  const { roomId, description, isPublic } = req.body;
  
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Create document entry
  const newDocument = await Document.create({
    roomId,
    fileName: req.file.originalname,
    fileType: getFileType(req.file.mimetype),
    fileSize: req.file.size,
    fileUrl: req.file.path,
    uploadedBy: req.user._id,
    description: description || '',
    isPublic: isPublic === 'false' ? false : true,
  });

  if (newDocument) {
    res.status(201).json({
      _id: newDocument._id,
      fileName: newDocument.fileName,
      fileType: newDocument.fileType,
      fileSize: newDocument.fileSize,
      fileUrl: newDocument.fileUrl,
      uploadedBy: newDocument.uploadedBy,
      description: newDocument.description,
      isPublic: newDocument.isPublic,
      createdAt: newDocument.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid document data');
  }
});

// Get all documents for a room
const getDocumentsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  const documents = await Document.find({ roomId })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({ documents });
});

// Get document by ID
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('uploadedBy', 'name email');
  
  if (document) {
    res.status(200).json({ document });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// Delete document
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check user permission (only uploader or admin can delete)
  if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this document');
  }
  
  // Delete file from storage
  try {
    fs.unlinkSync(document.fileUrl);
  } catch (err) {
    console.error('Error deleting file:', err);
    // Continue even if file deletion fails
  }
  
  // Delete from database
  await document.remove();
  
  res.status(200).json({ message: 'Document removed' });
});
// Add this to your controllers/documentController.js
// Add to controllers/documentController.js
const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Optional: Check if user has access to this document based on room membership
  
  // Send the file as a download
  res.download(document.fileUrl, document.fileName, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

// Don't forget to add this to your module.exports

// Remember to export this function in the module.exports
// Update document details
const updateDocument = asyncHandler(async (req, res) => {
  const { description, isPublic } = req.body;
  
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check user permission
  if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this document');
  }
  
  document.description = description || document.description;
  document.isPublic = isPublic === 'false' ? false : true;
  
  const updatedDocument = await document.save();
  
  res.status(200).json({
    _id: updatedDocument._id,
    description: updatedDocument.description,
    isPublic: updatedDocument.isPublic,
  });
});

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/pdf') return 'pdf';
  return 'other';
};

module.exports = {
  uploadDocument,
  getDocumentsByRoom,
  getDocumentById,
  deleteDocument,
  updateDocument,
  downloadDocument,
};