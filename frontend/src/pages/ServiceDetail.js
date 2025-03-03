import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [userPets, setUserPets] = useState([]);
  
  useEffect(() => {
    fetchServiceDetails();
    if (isAuthenticated && user?.role === 'pet_owner') {
      fetchUserPets();
    }
  }, [serviceId, isAuthenticated, user]);
  
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.getService(serviceId);
      // setService(response.data.service);
      
      // Mock service details
      setService({
        id: serviceId,
        title: 'Professional Dog Grooming',
        category: 'grooming',
        description: 'Our professional dog grooming service includes a bath with premium shampoo, haircut, nail trimming, ear cleaning, and teeth brushing. We cater to all breeds and sizes of dogs, ensuring your furry friend looks and feels their best.',
        price: {
          amount: 50,
          currency: 'USD',
          unit: 'per_session'
        },
        duration: 60, // in minutes
        provider: {
          id: '123',
          name: 'Happy Paws Grooming',
          rating: 4.8,
          reviewCount: 125,
          description: 'Professional dog grooming service with over 10 years of experience. We specialize in all breeds and sizes.',
          address: '123 Pet Street, New York, NY'
        },
        availability: {
          monday: [{start: '09:00', end: '17:00'}],
          tuesday: [{start: '09:00', end: '17:00'}],
          wednesday: [{start: '09:00', end: '17:00'}],
          thursday: [{start: '09:00', end: '17:00'}],
          friday: [{start: '09:00', end: '17:00'}],
          saturday: [{start: '10:00', end: '15:00'}],
          sunday: []
        },
        reviews: [
          {
            id: '1',
            user: 'Sarah M.',
            rating: 5,
            comment: 'My dog looks amazing after her grooming session! Will definitely come back.',
            date: '2023-12-15T10:00:00Z'
          },
          {
            id: '2',
            user: 'Michael R.',
            rating: 4,
            comment: 'Good service overall. My dog was a bit anxious but they handled him well.',
            date: '2023-11-28T14:30:00Z'
          }
        ]
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error fetching service details. Please try again.');
      setLoading(false);
    }
  };
  
  const fetchUserPets = async () => {
    try {
      // In a real app, we would fetch from API
      // const response = await api.getPets();
      // setUserPets(response.data.pets);
      
      // Mock pets
      setUserPets([
        { id: '1', name: 'Buddy', breed: 'Golden Retriever' },
        { id: '2', name: 'Max', breed: 'German Shepherd' }
      ]);
    } catch (err) {
      console.error('Error fetching pets:', err);
    }
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };
  
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };
  
  const handlePetChange = (e) => {
    setSelectedPet(e.target.value);
  };
  
  const handleBooking = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/services/${serviceId}` } });
      return;
    }
    
    if (!selectedTime || !selectedPet) {
      alert('Please select a time and pet for your booking.');
      return;
    }
    
    // Create booking object
    const bookingData = {
      serviceId,
      petId: selectedPet,
      startTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`).toISOString(),
      // Add more booking details as needed
    };
    
    // In a real app, we would call the API to create a booking
    console.log('Booking data:', bookingData);
    
    // Redirect to a booking confirmation page
    navigate('/bookings');
  };
  
  // Generate available time slots based on service availability
  const getAvailableTimeSlots = () => {
    if (!service) return [];
    
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const availabilityForDay = service.availability[dayOfWeek] || [];
    
    if (availabilityForDay.length === 0) {
      return [];
    }
    
    const timeSlots = [];
    availabilityForDay.forEach(slot => {
      const startHour = parseInt(slot.start.split(':')[0]);
      const startMinute = parseInt(slot.start.split(':')[1]);
      const endHour = parseInt(slot.end.split(':')[0]);
      const endMinute = parseInt(slot.end.split(':')[1]);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const formattedHour = currentHour.toString().padStart(2, '0');
        const formattedMinute = currentMinute.toString().padStart(2, '0');
        timeSlots.push(`${formattedHour}:${formattedMinute}`);
        
        // Increment by service duration (default to 30 minutes if not specified)
        const incrementMinutes = service.duration || 30;
        currentMinute += incrementMinutes;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute %= 60;
        }
      }
    });
    
    return timeSlots;
  };
  
  if (loading) {
    return <div className="loading">Loading service details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!service) {
    return <div className="not-found">Service not found</div>;
  }
  
  const availableTimeSlots = getAvailableTimeSlots();
  
  return (
    <div className="service-detail-page">
      <div className="container">
        <div className="service-header">
          <h1>{service.title}</h1>
          <div className="service-meta">
            <span className="service-category">{service.category}</span>
            <span className="service-rating">⭐ {service.provider.rating} ({service.provider.reviewCount} reviews)</span>
          </div>
        </div>
        
        <div className="service-content">
          <div className="service-info">
            <div className="service-description">
              <h2>Description</h2>
              <p>{service.description}</p>
            </div>
            
            <div className="provider-info">
              <h2>About the Provider</h2>
              <h3>{service.provider.name}</h3>
              <p>{service.provider.description}</p>
              <p>📍 {service.provider.address}</p>
            </div>
            
            <div className="pricing-info">
              <h2>Pricing</h2>
              <p className="price">
                ${service.price.amount} 
                {service.price.unit === 'per_hour' ? ' per hour' : 
                  service.price.unit === 'per_session' ? ' per session' : 
                  service.price.unit === 'per_night' ? ' per night' : ''}
              </p>
              <p>Duration: {service.duration} minutes</p>
            </div>
            
            <div className="reviews-section">
              <h2>Reviews</h2>
              {service.reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <div className="reviews-list">
                  {service.reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="review-author">{review.user}</span>
                        <span className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </span>
                        <span className="review-date">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="booking-sidebar">
            <div className="booking-card">
              <h2>Book This Service</h2>
              
              <div className="booking-form">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <select 
                    value={selectedTime}
                    onChange={handleTimeChange}
                    disabled={availableTimeSlots.length === 0}
                  >
                    <option value="">Select a time</option>
                    {availableTimeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {availableTimeSlots.length === 0 && (
                    <p className="error-text">No available time slots for this date.</p>
                  )}
                </div>
                
                {isAuthenticated && user?.role === 'pet_owner' && (
                  <div className="form-group">
                    <label>Select Pet</label>
                    <select 
                      value={selectedPet}
                      onChange={handlePetChange}
                    >
                      <option value="">Select a pet</option>
                      {userPets.map(pet => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="price-summary">
                  <p>Price: ${service.price.amount}</p>
                </div>
                
                <button 
                  className="btn btn-primary btn-block"
                  onClick={handleBooking}
                  disabled={!selectedTime || (!selectedPet && isAuthenticated && user?.role === 'pet_owner')}
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;