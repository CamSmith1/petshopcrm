import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'rating'
  });
  
  const location = useLocation();
  
  useEffect(() => {
    // Parse query params from URL
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam
      }));
    }
    
    fetchServices();
  }, [location.search]);
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      // In a real app, we would pass filters as params
      const response = await api.getServices();
      setServices(response.data.services || []);
      setLoading(false);
    } catch (err) {
      setError('Error fetching services. Please try again.');
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const applyFilters = (e) => {
    e.preventDefault();
    fetchServices();
  };
  
  // Mock services for demo
  const mockServices = [
    {
      id: '1',
      title: 'Professional Dog Grooming',
      category: 'grooming',
      description: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning for all breeds.',
      price: {
        amount: 75,
        currency: 'NZD',
        unit: 'per_session'
      },
      provider: {
        name: 'Clean Canines Wellington',
        rating: 4.8
      },
      location: {
        city: 'Wellington',
        region: 'Wellington'
      }
    },
    {
      id: '2',
      title: 'Certified Dog Training',
      category: 'training',
      description: 'Professional dog training with focus on obedience and behaviour correction.',
      price: {
        amount: 65,
        currency: 'NZD',
        unit: 'per_hour'
      },
      provider: {
        name: 'Top Dog Training NZ',
        rating: 4.9
      },
      location: {
        city: 'Auckland',
        region: 'Auckland'
      }
    },
    {
      id: '3',
      title: 'Luxury Dog Boarding',
      category: 'boarding',
      description: 'Spacious, comfortable dog boarding in a home environment with 24/7 supervision and large play areas.',
      price: {
        amount: 55,
        currency: 'NZD',
        unit: 'per_night'
      },
      provider: {
        name: 'Paws & Relax Boarding',
        rating: 4.7
      },
      location: {
        city: 'Christchurch',
        region: 'Canterbury'
      }
    },
    {
      id: '4',
      title: 'Dog Walking Service',
      category: 'walking',
      description: '45-minute dog walking service with exercise, play time and bathroom breaks.',
      price: {
        amount: 25,
        currency: 'NZD',
        unit: 'per_session'
      },
      provider: {
        name: 'Walkies NZ',
        rating: 4.6
      },
      location: {
        city: 'Dunedin',
        region: 'Otago'
      }
    }
  ];
  
  return (
    <div className="services-list-page">
      <div className="container">
        <h1>Dog Services in New Zealand</h1>
        
        <div className="services-container">
          <div className="filters-sidebar">
            <div className="filter-card">
              <h3>Filters</h3>
              <form onSubmit={applyFilters}>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select 
                    id="category" 
                    name="category" 
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    <option value="grooming">Grooming</option>
                    <option value="boarding">Boarding</option>
                    <option value="daycare">Daycare</option>
                    <option value="training">Training</option>
                    <option value="walking">Walking</option>
                    <option value="sitting">Sitting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <select 
                    id="location" 
                    name="location" 
                    value={filters.location}
                    onChange={handleFilterChange}
                  >
                    <option value="">All of New Zealand</option>
                    <option value="Auckland">Auckland</option>
                    <option value="Wellington">Wellington</option>
                    <option value="Christchurch">Christchurch</option>
                    <option value="Hamilton">Hamilton</option>
                    <option value="Tauranga">Tauranga</option>
                    <option value="Dunedin">Dunedin</option>
                    <option value="Queenstown">Queenstown</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="minPrice">Min Price (NZ$)</label>
                  <input 
                    type="number" 
                    id="minPrice" 
                    name="minPrice" 
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxPrice">Max Price (NZ$)</label>
                  <input 
                    type="number" 
                    id="maxPrice" 
                    name="maxPrice" 
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sortBy">Sort By</label>
                  <select 
                    id="sortBy" 
                    name="sortBy" 
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary btn-block">
                  Apply Filters
                </button>
              </form>
            </div>
          </div>
          
          <div className="services-results">
            {loading ? (
              <div className="loading">Loading services...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : mockServices.length === 0 ? (
              <div className="no-results">
                <p>No services found matching your criteria.</p>
              </div>
            ) : (
              <div className="services-grid">
                {mockServices.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-image">
                      {/* Placeholder image */}
                      <div className="placeholder-image">
                        {service.category === 'grooming' && '✂️'}
                        {service.category === 'training' && '🎓'}
                        {service.category === 'boarding' && '🏠'}
                        {service.category === 'walking' && '🚶‍♂️'}
                        {service.category === 'daycare' && '🐕'}
                        {service.category === 'sitting' && '🛋️'}
                        {service.category === 'other' && '🐾'}
                      </div>
                    </div>
                    <div className="service-content">
                      <span className="service-category">{service.category}</span>
                      <h3>{service.title}</h3>
                      <p className="service-description">{service.description}</p>
                      <div className="service-provider">
                        <span>{service.provider.name}</span>
                        <span className="rating">⭐ {service.provider.rating}</span>
                      </div>
                      <div className="service-location">
                        📍 {service.location.city}, {service.location.region}
                      </div>
                      <div className="service-price">
                        NZ${service.price.amount} {service.price.unit === 'per_hour' ? '/ hour' : 
                          service.price.unit === 'per_session' ? '/ session' : 
                          service.price.unit === 'per_night' ? '/ night' : ''}
                      </div>
                      <Link to={`/services/${service.id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesList;