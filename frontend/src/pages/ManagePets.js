import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const ManagePets = () => {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    isNeutered: false,
    medicalConditions: '',
    allergies: '',
    dietaryRestrictions: '',
    behavioralNotes: '',
    profilePhoto: null
  });
  
  useEffect(() => {
    fetchPets();
  }, []);
  
  const fetchPets = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.getPets();
      // setPets(response.data.pets);
      
      // Mock pets data
      setPets([
        {
          id: '1',
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3,
          weight: 65,
          gender: 'male',
          isNeutered: true,
          medicalConditions: 'None',
          allergies: 'Chicken',
          dietaryRestrictions: 'No chicken products',
          behavioralNotes: 'Friendly with other dogs and children',
          profilePhoto: null
        },
        {
          id: '2',
          name: 'Max',
          breed: 'German Shepherd',
          age: 2,
          weight: 80,
          gender: 'male',
          isNeutered: true,
          medicalConditions: 'Hip dysplasia',
          allergies: 'None',
          dietaryRestrictions: 'None',
          behavioralNotes: 'Protective, needs proper introduction to strangers',
          profilePhoto: null
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      setError('Error fetching pets. Please try again.');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePhoto: e.target.files[0]
      });
    }
  };
  
  const handleAddPet = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, we would call API
      // const response = await api.createPet(formData);
      
      // Mock response
      const newPet = {
        id: Date.now().toString(),
        ...formData,
        profilePhoto: null
      };
      
      setPets([...pets, newPet]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError('Error adding pet. Please try again.');
    }
  };
  
  const handleEditPet = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, we would call API
      // await api.updatePet(selectedPet.id, formData);
      
      // Update local state
      setPets(pets.map(pet => 
        pet.id === selectedPet.id 
          ? { ...pet, ...formData }
          : pet
      ));
      
      setShowEditForm(false);
      setSelectedPet(null);
      resetForm();
    } catch (err) {
      setError('Error updating pet. Please try again.');
    }
  };
  
  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real app, we would call API
      // await api.deletePet(petId);
      
      // Update local state
      setPets(pets.filter(pet => pet.id !== petId));
    } catch (err) {
      setError('Error deleting pet. Please try again.');
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      gender: 'male',
      isNeutered: false,
      medicalConditions: '',
      allergies: '',
      dietaryRestrictions: '',
      behavioralNotes: '',
      profilePhoto: null
    });
  };
  
  const startEditPet = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      gender: pet.gender,
      isNeutered: pet.isNeutered,
      medicalConditions: pet.medicalConditions,
      allergies: pet.allergies,
      dietaryRestrictions: pet.dietaryRestrictions,
      behavioralNotes: pet.behavioralNotes,
      profilePhoto: null
    });
    setShowEditForm(true);
  };
  
  if (!user || user.role !== 'pet_owner') {
    return (
      <div className="unauthorized-message">
        <h2>Access Denied</h2>
        <p>You must be a pet owner to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="manage-pets-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Pets</h1>
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
              setShowEditForm(false);
            }}
          >
            Add New Pet
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading pets...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="pets-content">
            {showAddForm && (
              <div className="pet-form-container">
                <h2>Add New Pet</h2>
                <form onSubmit={handleAddPet} className="pet-form">
                  <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                      <label htmlFor="name">Pet Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="breed">Breed</label>
                      <input
                        type="text"
                        id="breed"
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="age">Age (years)</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="weight">Weight (lbs)</label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="isNeutered"
                            checked={formData.isNeutered}
                            onChange={handleInputChange}
                          />
                          Neutered/Spayed
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Health Information</h3>
                    <div className="form-group">
                      <label htmlFor="medicalConditions">Medical Conditions</label>
                      <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="allergies">Allergies</label>
                      <textarea
                        id="allergies"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
                      <textarea
                        id="dietaryRestrictions"
                        name="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Additional Information</h3>
                    <div className="form-group">
                      <label htmlFor="behavioralNotes">Behavioral Notes</label>
                      <textarea
                        id="behavioralNotes"
                        name="behavioralNotes"
                        value={formData.behavioralNotes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any information about your pet's behavior that service providers should know"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profilePhoto">Profile Photo</label>
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Add Pet
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {showEditForm && selectedPet && (
              <div className="pet-form-container">
                <h2>Edit Pet: {selectedPet.name}</h2>
                <form onSubmit={handleEditPet} className="pet-form">
                  <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                      <label htmlFor="name">Pet Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="breed">Breed</label>
                      <input
                        type="text"
                        id="breed"
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="age">Age (years)</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="weight">Weight (lbs)</label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="isNeutered"
                            checked={formData.isNeutered}
                            onChange={handleInputChange}
                          />
                          Neutered/Spayed
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Health Information</h3>
                    <div className="form-group">
                      <label htmlFor="medicalConditions">Medical Conditions</label>
                      <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="allergies">Allergies</label>
                      <textarea
                        id="allergies"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
                      <textarea
                        id="dietaryRestrictions"
                        name="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="None if not applicable"
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Additional Information</h3>
                    <div className="form-group">
                      <label htmlFor="behavioralNotes">Behavioral Notes</label>
                      <textarea
                        id="behavioralNotes"
                        name="behavioralNotes"
                        value={formData.behavioralNotes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any information about your pet's behavior that service providers should know"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profilePhoto">Update Profile Photo</label>
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Update Pet
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedPet(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {(!showAddForm && !showEditForm) && (
              <>
                {pets.length === 0 ? (
                  <div className="no-pets">
                    <p>You haven't added any pets yet.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add Your First Pet
                    </button>
                  </div>
                ) : (
                  <div className="pets-grid">
                    {pets.map(pet => (
                      <div key={pet.id} className="pet-card">
                        <div className="pet-photo">
                          {pet.profilePhoto ? (
                            <img src={pet.profilePhoto} alt={pet.name} />
                          ) : (
                            <div className="pet-avatar">
                              🐕
                            </div>
                          )}
                        </div>
                        <div className="pet-details">
                          <h3>{pet.name}</h3>
                          <p>{pet.breed}</p>
                          <p>Age: {pet.age} years</p>
                          <p>Weight: {pet.weight} lbs</p>
                          <p>Gender: {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}</p>
                          <p>{pet.isNeutered ? 'Neutered/Spayed' : 'Not Neutered/Spayed'}</p>
                          
                          {(pet.medicalConditions || pet.allergies) && (
                            <div className="pet-health">
                              {pet.medicalConditions && (
                                <p><strong>Medical:</strong> {pet.medicalConditions}</p>
                              )}
                              {pet.allergies && (
                                <p><strong>Allergies:</strong> {pet.allergies}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="pet-actions">
                          <button 
                            className="btn btn-secondary"
                            onClick={() => startEditPet(pet)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDeletePet(pet.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePets;