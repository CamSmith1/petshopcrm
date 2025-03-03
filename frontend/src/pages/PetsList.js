import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PetsList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Simulated data for now
    // In a real implementation, this would fetch from API
    const mockPets = [
      {
        id: 'pet1',
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: '3 years',
        ownerName: 'John Smith',
        ownerId: 'cust1',
        lastVisit: '2025-02-28',
        status: 'active'
      },
      {
        id: 'pet2',
        name: 'Max',
        type: 'Dog',
        breed: 'German Shepherd',
        age: '2 years',
        ownerName: 'John Smith',
        ownerId: 'cust1',
        lastVisit: '2025-01-15',
        status: 'active'
      },
      {
        id: 'pet3',
        name: 'Luna',
        type: 'Cat',
        breed: 'Siamese',
        age: '4 years',
        ownerName: 'Sarah Johnson',
        ownerId: 'cust2',
        lastVisit: '2025-03-01',
        status: 'active'
      },
      {
        id: 'pet4',
        name: 'Charlie',
        type: 'Bird',
        breed: 'Parakeet',
        age: '1 year',
        ownerName: 'Michael Brown',
        ownerId: 'cust3',
        lastVisit: '2025-02-15',
        status: 'active'
      }
    ];
    
    setTimeout(() => {
      setPets(mockPets);
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filteredPets = pets.filter(pet => {
    // Apply search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchLower) ||
      pet.breed.toLowerCase().includes(searchLower) ||
      pet.ownerName.toLowerCase().includes(searchLower);
    
    // Apply type filter
    const matchesType = filterType === 'all' || pet.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get unique pet types for the filter
  const petTypes = ['all', ...new Set(pets.map(pet => pet.type.toLowerCase()))];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <PageHeader title="Pets" />

      <div className="card">
        <div className="card-header">
          <div className="filter-container">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search pets..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="type-filter">
              {petTypes.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? 'active' : ''}`}
                  onClick={() => handleFilterChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="card-actions">
            <Link to="/pets/add" className="btn btn-primary">
              + Add Pet
            </Link>
          </div>
        </div>

        <div className="card-body">
          {filteredPets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🐾</div>
              <h3>No pets found</h3>
              <p>
                {searchTerm || filterType !== 'all'
                  ? `No pets matching your search criteria`
                  : 'You don\'t have any pets yet. Add your first pet to get started.'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <Link to="/pets/add" className="btn btn-primary">
                  Add Pet
                </Link>
              )}
            </div>
          ) : (
            <div className="pets-grid">
              {filteredPets.map(pet => (
                <div key={pet.id} className="pet-card">
                  <div className="pet-card-header">
                    <div className="pet-icon">
                      {pet.type === 'Dog' ? '🐕' : pet.type === 'Cat' ? '🐈' : pet.type === 'Bird' ? '🦜' : '🐾'}
                    </div>
                    <h4>{pet.name}</h4>
                  </div>
                  <div className="pet-card-body">
                    <div className="pet-detail">
                      <span className="pet-detail-label">Type:</span>
                      <span className="pet-detail-value">{pet.type}</span>
                    </div>
                    <div className="pet-detail">
                      <span className="pet-detail-label">Breed:</span>
                      <span className="pet-detail-value">{pet.breed}</span>
                    </div>
                    <div className="pet-detail">
                      <span className="pet-detail-label">Age:</span>
                      <span className="pet-detail-value">{pet.age}</span>
                    </div>
                    <div className="pet-detail">
                      <span className="pet-detail-label">Owner:</span>
                      <span className="pet-detail-value">
                        <Link to={`/customers/${pet.ownerId}`} className="pet-owner-link">
                          {pet.ownerName}
                        </Link>
                      </span>
                    </div>
                    <div className="pet-detail">
                      <span className="pet-detail-label">Last Visit:</span>
                      <span className="pet-detail-value">{formatDate(pet.lastVisit)}</span>
                    </div>
                  </div>
                  <div className="pet-card-footer">
                    <Link to={`/pets/${pet.id}`} className="btn btn-sm btn-outline-primary">
                      View Details
                    </Link>
                    <Link to={`/appointments/new?petId=${pet.id}`} className="btn btn-sm btn-outline-primary">
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetsList;