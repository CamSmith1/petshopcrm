import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    fetchBookings();
  }, [activeTab]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API with filters
      // const response = await api.getBookings({ status: activeTab });
      // setBookings(response.data.bookings);
      
      // Mock bookings
      setBookings(getMockBookings());
      setLoading(false);
    } catch (err) {
      setError('Error fetching bookings. Please try again.');
      setLoading(false);
    }
  };
  
  const getMockBookings = () => {
    // Different mock data based on active tab
    switch (activeTab) {
      case 'upcoming':
        return [
          {
            id: '1',
            service: {
              id: '1',
              title: 'Dog Grooming Service'
            },
            provider: {
              id: '101',
              name: 'Happy Paws Grooming'
            },
            pet: {
              id: '201',
              name: 'Buddy',
              breed: 'Golden Retriever'
            },
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 90000000).toISOString(),
            status: 'confirmed',
            totalPrice: {
              amount: 50,
              currency: 'USD'
            }
          },
          {
            id: '2',
            service: {
              id: '2',
              title: 'Dog Training Session'
            },
            provider: {
              id: '102',
              name: 'Master Trainers'
            },
            pet: {
              id: '202',
              name: 'Max',
              breed: 'German Shepherd'
            },
            startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            endTime: new Date(Date.now() + 176400000).toISOString(),
            status: 'pending',
            totalPrice: {
              amount: 40,
              currency: 'USD'
            }
          }
        ];
      case 'past':
        return [
          {
            id: '3',
            service: {
              id: '1',
              title: 'Dog Grooming Service'
            },
            provider: {
              id: '101',
              name: 'Happy Paws Grooming'
            },
            pet: {
              id: '201',
              name: 'Buddy',
              breed: 'Golden Retriever'
            },
            startTime: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            endTime: new Date(Date.now() - 601200000).toISOString(),
            status: 'completed',
            totalPrice: {
              amount: 50,
              currency: 'USD'
            },
            review: {
              rating: 5,
              comment: 'Great service! My dog looks amazing.'
            }
          },
          {
            id: '4',
            service: {
              id: '3',
              title: 'Dog Boarding'
            },
            provider: {
              id: '103',
              name: 'Cozy Pet Stays'
            },
            pet: {
              id: '201',
              name: 'Buddy',
              breed: 'Golden Retriever'
            },
            startTime: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
            endTime: new Date(Date.now() - 1123200000).toISOString(),
            status: 'completed',
            totalPrice: {
              amount: 120,
              currency: 'USD'
            }
          }
        ];
      case 'cancelled':
        return [
          {
            id: '5',
            service: {
              id: '2',
              title: 'Dog Training Session'
            },
            provider: {
              id: '102',
              name: 'Master Trainers'
            },
            pet: {
              id: '202',
              name: 'Max',
              breed: 'German Shepherd'
            },
            startTime: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            endTime: new Date(Date.now() - 255600000).toISOString(),
            status: 'cancelled',
            cancellationReason: 'Schedule conflict',
            totalPrice: {
              amount: 40,
              currency: 'USD'
            }
          }
        ];
      default:
        return [];
    }
  };
  
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      // In a real app, we would call API
      // await api.cancelBooking(bookingId, { reason: 'Schedule conflict' });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled', cancellationReason: 'User cancellation' } 
          : booking
      ));
      
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert('Error cancelling booking. Please try again.');
    }
  };
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="bookings-page">
      <div className="container">
        <h1>My Bookings</h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
          <button 
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>
        
        <div className="bookings-content">
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No {activeTab} bookings found.</p>
              {activeTab === 'upcoming' && (
                <Link to="/services" className="btn btn-primary">
                  Browse Services
                </Link>
              )}
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service.title}</h3>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-info">
                      <p><strong>Provider:</strong> {booking.provider.name}</p>
                      <p><strong>Pet:</strong> {booking.pet.name} ({booking.pet.breed})</p>
                      <p><strong>Date & Time:</strong> {formatDateTime(booking.startTime)}</p>
                      <p><strong>Total Price:</strong> ${booking.totalPrice.amount}</p>
                      
                      {booking.cancellationReason && (
                        <p><strong>Cancellation Reason:</strong> {booking.cancellationReason}</p>
                      )}
                      
                      {booking.review && (
                        <div className="booking-review">
                          <p><strong>Your Review:</strong> {'⭐'.repeat(booking.review.rating)}</p>
                          <p>"{booking.review.comment}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="booking-actions">
                      <Link to={`/bookings/${booking.id}`} className="btn btn-secondary">
                        View Details
                      </Link>
                      
                      {booking.status === 'pending' || booking.status === 'confirmed' ? (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      ) : booking.status === 'completed' && !booking.review ? (
                        <Link to={`/bookings/${booking.id}/review`} className="btn btn-primary">
                          Leave Review
                        </Link>
                      ) : null}
                    </div>
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

export default Bookings;