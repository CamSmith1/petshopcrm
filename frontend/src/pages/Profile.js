import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    // Fields for service providers
    businessName: '',
    businessDescription: '',
    // Password fields
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        },
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Set avatar preview if user has one
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would use FormData to handle file uploads
      // const formDataToSend = new FormData();
      // formDataToSend.append('name', formData.name);
      // formDataToSend.append('phone', formData.phone);
      // formDataToSend.append('address', JSON.stringify(formData.address));
      
      // if (user.role === 'service_provider') {
      //   formDataToSend.append('businessName', formData.businessName);
      //   formDataToSend.append('businessDescription', formData.businessDescription);
      // }
      
      // if (avatarFile) {
      //   formDataToSend.append('avatar', avatarFile);
      // }
      
      // const response = await api.updateProfile(formDataToSend);
      
      // Mock success response
      await updateProfile(formData);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call API
      // await api.updatePassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });
      
      // Mock success
      toast.success('Password updated successfully!');
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error('Error updating password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>
        
        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <p className="user-role">
                {user?.role === 'pet_owner' ? 'Pet Owner' : 
                 user?.role === 'service_provider' ? 'Service Provider' : 
                 'Administrator'}
              </p>
            </div>
            
            <div className="profile-tabs">
              <button 
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
              </button>
              <button 
                className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Password & Security
              </button>
              {user?.role === 'pet_owner' && (
                <button 
                  className={`tab ${activeTab === 'pets' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pets')}
                >
                  My Pets
                </button>
              )}
              {user?.role === 'service_provider' && (
                <button 
                  className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  My Services
                </button>
              )}
            </div>
          </div>
          
          <div className="profile-detail">
            {activeTab === 'profile' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Profile Information</h2>
                  {!isEditing ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to user data
                        if (user) {
                          setFormData({
                            ...formData,
                            name: user.name || '',
                            phone: user.phone || '',
                            address: user.address || {
                              street: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: ''
                            },
                            businessName: user.businessName || '',
                            businessDescription: user.businessDescription || ''
                          });
                        }
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                {!isEditing ? (
                  <div className="profile-view">
                    <div className="profile-section">
                      <h3>Basic Information</h3>
                      <div className="profile-field">
                        <span className="field-label">Name:</span>
                        <span className="field-value">{user?.name}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{user?.email}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Phone:</span>
                        <span className="field-value">{user?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div className="profile-section">
                      <h3>Address</h3>
                      {user?.address?.street ? (
                        <>
                          <div className="profile-field">
                            <span className="field-label">Street:</span>
                            <span className="field-value">{user.address.street}</span>
                          </div>
                          <div className="profile-field">
                            <span className="field-label">City:</span>
                            <span className="field-value">{user.address.city}</span>
                          </div>
                          <div className="profile-field">
                            <span className="field-label">State:</span>
                            <span className="field-value">{user.address.state}</span>
                          </div>
                          <div className="profile-field">
                            <span className="field-label">Zip Code:</span>
                            <span className="field-value">{user.address.zipCode}</span>
                          </div>
                          <div className="profile-field">
                            <span className="field-label">Country:</span>
                            <span className="field-value">{user.address.country}</span>
                          </div>
                        </>
                      ) : (
                        <p>No address information provided.</p>
                      )}
                    </div>
                    
                    {user?.role === 'service_provider' && (
                      <div className="profile-section">
                        <h3>Business Information</h3>
                        <div className="profile-field">
                          <span className="field-label">Business Name:</span>
                          <span className="field-value">{user.businessName || 'Not provided'}</span>
                        </div>
                        <div className="profile-field">
                          <span className="field-label">Business Description:</span>
                          <span className="field-value">{user.businessDescription || 'Not provided'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-section">
                      <h3>Basic Information</h3>
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email (Cannot be changed)</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="avatar">Profile Picture</label>
                        <input
                          type="file"
                          id="avatar"
                          name="avatar"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        {avatarPreview && (
                          <div className="avatar-preview">
                            <img src={avatarPreview} alt="Avatar Preview" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-section">
                      <h3>Address</h3>
                      <div className="form-group">
                        <label htmlFor="address.street">Street</label>
                        <input
                          type="text"
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="address.city">City</label>
                          <input
                            type="text"
                            id="address.city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="address.state">State</label>
                          <input
                            type="text"
                            id="address.state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="address.zipCode">Zip Code</label>
                          <input
                            type="text"
                            id="address.zipCode"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="address.country">Country</label>
                          <input
                            type="text"
                            id="address.country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {user?.role === 'service_provider' && (
                      <div className="form-section">
                        <h3>Business Information</h3>
                        <div className="form-group">
                          <label htmlFor="businessName">Business Name</label>
                          <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="businessDescription">Business Description</label>
                          <textarea
                            id="businessDescription"
                            name="businessDescription"
                            value={formData.businessDescription}
                            onChange={handleChange}
                            rows="4"
                          />
                        </div>
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                )}
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Password & Security</h2>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <small>Password must be at least 6 characters</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'pets' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Pets</h2>
                  <button className="btn btn-primary">
                    Add New Pet
                  </button>
                </div>
                
                <div className="pets-list">
                  <p>Go to the Manage Pets page to see your pets.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'services' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Services</h2>
                  <button className="btn btn-primary">
                    Add New Service
                  </button>
                </div>
                
                <div className="services-list">
                  <p>Go to the Manage Services page to see your services.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;