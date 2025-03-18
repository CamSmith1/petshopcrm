import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenueImages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const fileInputRef = useRef(null);
  
  // Load venue and images data
  useEffect(() => {
    fetchVenueData();
  }, [id]);
  
  const fetchVenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch venue details
      const venueResponse = await api.getVenue(id);
      setVenue(venueResponse.data.venue);
      
      // Fetch images
      const imagesResponse = await api.getVenueImages(id);
      setImages(imagesResponse.data.images || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venue data:', err);
      setError('Error loading venue data. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP).');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Clear form
  const clearForm = () => {
    setImagePreview(null);
    setImageDescription('');
    setIsPrimary(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle form submission
  const handleUploadImage = async (e) => {
    e.preventDefault();
    
    if (!imagePreview) {
      setError('Please select an image to upload.');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const file = fileInputRef.current.files[0];
      
      // In a real implementation, this would upload the file to the server
      // For now, we'll simulate a successful upload with a mock response
      
      // Mock upload response
      const newImage = {
        id: Date.now().toString(),
        venue_id: id,
        url: imagePreview,
        description: imageDescription,
        is_primary: isPrimary,
        created_at: new Date().toISOString()
      };
      
      // If this is set as primary, update all other images to not be primary
      if (isPrimary) {
        setImages(prevImages => 
          prevImages.map(img => ({
            ...img,
            is_primary: false
          }))
        );
      }
      
      // Add new image to state
      setImages(prev => [...prev, newImage]);
      
      // Clear form
      clearForm();
      
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error uploading image. Please try again.');
      setUploadingImage(false);
    }
  };
  
  // Set image as primary
  const handleSetPrimary = async (imageId) => {
    try {
      // In a real implementation, this would call the API
      // For now, we'll update the local state directly
      
      setImages(prevImages => 
        prevImages.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );
    } catch (err) {
      console.error('Error setting primary image:', err);
      setError('Error setting primary image. Please try again.');
    }
  };
  
  // Delete image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real implementation, this would call the API
      // For now, we'll update the local state directly
      
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Error deleting image. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to manage images
  
  if (loading) {
    return <div className="loading">Loading venue images...</div>;
  }
  
  if (!venue) {
    return <div className="error-message">Venue not found.</div>;
  }
  
  return (
    <div className="venue-images-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Manage Images - {venue.name}</h1>
            <Link to="/manage-venues" className="btn btn-link">
              Back to Venues
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="row">
          <div className="col-md-4">
            <div className="upload-form-container">
              <h2>Upload New Image</h2>
              <form onSubmit={handleUploadImage}>
                <div className="form-group">
                  <label htmlFor="image">Select Image <span className="required">*</span></label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    className="form-control-file"
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                    required
                  />
                  <small className="form-text text-muted">
                    Max size: 5MB. Supported formats: JPEG, PNG, GIF, WEBP.
                  </small>
                </div>
                
                {imagePreview && (
                  <div className="image-preview mb-3">
                    <img src={imagePreview} alt="Preview" className="img-fluid" />
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="description">Image Description</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    className="form-control"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="e.g., Front view, Main hall, Kitchen area"
                  />
                </div>
                
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    id="is_primary"
                    name="is_primary"
                    className="form-check-input"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                  />
                  <label htmlFor="is_primary" className="form-check-label">
                    Set as primary image (main venue photo)
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={uploadingImage || !imagePreview}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="images-container">
              <h2>Venue Images</h2>
              
              {images.length === 0 ? (
                <div className="no-images">
                  <p>No images have been uploaded for this venue yet.</p>
                  <p>Upload images to showcase your venue to potential customers.</p>
                </div>
              ) : (
                <div className="images-grid">
                  {images.map(image => (
                    <div key={image.id} className={`image-card ${image.is_primary ? 'primary-image' : ''}`}>
                      <div className="image-wrapper">
                        <img src={image.url} alt={image.description || 'Venue image'} />
                        {image.is_primary && (
                          <div className="primary-badge">
                            Primary Image
                          </div>
                        )}
                      </div>
                      
                      <div className="image-details">
                        {image.description && (
                          <p className="image-description">{image.description}</p>
                        )}
                        
                        <div className="image-actions">
                          {!image.is_primary && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleSetPrimary(image.id)}
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueImages;