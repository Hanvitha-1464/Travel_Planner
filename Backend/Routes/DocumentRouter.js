// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  uploadDocument, 
  getDocumentsByRoom, 
  getDocumentById,
  deleteDocument,
  updateDocument,
  downloadDocument
} = require('../Controllers/DocumentController');
const { protect } = require('../Middleware/AuthValidation');
const upload = require('../Middleware/UploadValidation');

// Routes
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/room/:roomId', protect, getDocumentsByRoom);
router.get('/:id', protect, getDocumentById);
router.delete('/:id', protect, deleteDocument);
router.put('/:id', protect, updateDocument);
router.get('/download/:id', protect, downloadDocument);

module.exports = router;