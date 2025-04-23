// src/pages/DocumentSharingPage.js
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserCircle, 
  FaChevronDown, 
  FaUpload, 
  FaArrowLeft,
  FaFileAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaDownload, 
  FaTrashAlt,
  FaSignOutAlt 
} from 'react-icons/fa';

const DocumentSharingPage = () => {
  const { roomId } = useParams();
  console.log('roomId from URL:', roomId);

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserData(JSON.parse(storedUserInfo));
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }

    // Fetch documents
    fetchDocuments();
  }, [roomId, navigate]);

  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const decodedRoomId = decodeURIComponent(roomId);

const response = await axios.get(
  `http://localhost:5100/api/documents/room/${decodedRoomId}`,
  config
);
      
      setDocuments(response.data.documents);
      setLoading(false);
    } catch (err) {
      setError('Failed to load documents. Please try again.');
      setLoading(false);
      console.error('Error fetching documents:', err);
    }
  };

  const handleExit = () => {
    navigate(`/room/${roomId}`);
  };
  const handleDownload = async (doc) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // First approach: use fetch API for direct download
      const response = await fetch(
        `http://localhost:5100/api/documents/download/${doc._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download the file. Please try again.');
    }
  };
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File size exceeds 50MB limit');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
    }
  };

  // Update this handleUpload function in your DocumentSharingPage.js

const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
  
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
  
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      
      if (!token) {
        throw new Error('You must be logged in to upload files');
      }
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('roomId', roomId);
      formData.append('description', description);
      
      // Log what's in the FormData to debug
      console.log('Uploading file:', selectedFile.name);
      console.log('Room ID:', roomId);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
  
      const response = await axios.post(
        'http://localhost:5100/api/documents/upload', 
        formData, 
        config
      );
      
      console.log('Upload response:', response.data);
      
      setUploadSuccess('File uploaded successfully!');
      setSelectedFile(null);
      setDescription('');
      document.getElementById('file-upload').value = '';
      
      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError(
        err.response?.data?.message || 'Failed to upload file. Please try again.'
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`http://localhost:5100/api/documents/${documentId}`, config);
      
      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-red-400 text-2xl" />;
      case 'image':
        return <FaFileImage className="text-blue-400 text-2xl" />;
      case 'video':
        return <FaFileVideo className="text-purple-400 text-2xl" />;
      default:
        return <FaFileAlt className="text-yellow-400 text-2xl" />;
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
        <nav className="bg-gray-800 shadow-md px-6 py-4">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
        <footer className="py-6 bg-gray-800 text-gray-300 text-center">
          <p>&copy; 2025 VoyageVault. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <nav className="bg-gray-800 shadow-md px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-400">
            <Link to="/">VoyageVault</Link>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-200"
            >
              <FaUserCircle className="text-blue-400" />
              <span className="font-medium">{userData?.name || 'User'}</span>
              <FaChevronDown className="text-gray-400" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-400">Document Sharing</h3>
                  <p className="text-sm text-gray-300 mt-1">{userData?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleExit}
                    className="flex items-center px-3 py-2 w-full text-left hover:bg-gray-700 rounded transition"
                  >
                    <FaSignOutAlt className="mr-3 text-purple-400" />
                    Back to Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto py-12 px-4">
      <div className="flex items-center p-4 bg-gray-900">
      <Link to={`/room/${roomId}`} className="text-gray-400 hover:text-gray-300">
        <FaArrowLeft />
      </Link>
      <h1 className="ml-3 text-2xl font-bold text-purple-400">
        Document Sharing
      </h1>
    </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Upload Document</h3>
              
              {uploadError && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4 text-sm">
                  {uploadError}
                </div>
              )}
              
              {uploadSuccess && (
                <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4 text-sm">
                  {uploadSuccess}
                </div>
              )}
              
              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Choose File
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FaUpload className="text-3xl text-purple-400 mb-2" />
                      <span className="text-gray-300 mb-2">
                        {selectedFile ? selectedFile.name : 'Click to select a file'}
                      </span>
                      <span className="text-xs text-gray-400">
                        (Max: 50MB - PDF, Images, Videos, Documents)
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this document..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                  disabled={uploadLoading || !selectedFile}
                >
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Documents List */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 h-full">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Shared Documents</h3>
              
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No documents have been shared yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Be the first to upload a document!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between border border-gray-600 hover:border-purple-500 transition duration-200"
                    >
                      <div className="flex items-center mb-3 md:mb-0">
                        <div className="mr-4">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{doc.fileName}</h4>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploadedBy.name} • {new Date(doc.createdAt).toLocaleString()}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-gray-300 mt-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
<button
  onClick={() => handleDownload(doc)}
  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
  title="Download"
>
  <FaDownload />
</button>
                        {userData?._id === doc.uploadedBy._id && (
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition duration-200"
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 bg-gray-800 text-gray-300 text-center">
        <p>&copy; 2025 VoyageVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DocumentSharingPage;