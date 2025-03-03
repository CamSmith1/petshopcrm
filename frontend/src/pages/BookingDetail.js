import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);
  
  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.getBooking(bookingId);
      // setBooking(response.data.booking);
      
      // Mock booking detail
      setBooking({
        id: bookingId,
        service: {
          id: '1',
          title: 'Dog Grooming Service',
          category: 'grooming',
          description: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning.'
        },
        provider: {
          id: '101',
          name: 'Happy Paws Grooming',
          email: 'contact@happypaws.com',
          phone: '(555) 123-4567'
        },
        pet: {
          id: '201',
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3
        },
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 90000000).toISOString(),
        status: 'confirmed',
        location: 'at_provider',
        totalPrice: {
          amount: 50,
          currency: 'USD'
        },
        paymentStatus: 'paid',
        notes: {
          client: 'Buddy gets anxious during nail trimming.',
          provider: 'We will take extra care during nail trimming.'
        },
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error fetching booking details. Please try again.');
      setLoading(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      // In a real app, we would call API
      // await api.cancelBooking(bookingId, { reason: 'Schedule conflict' });
      
      // Update local state
      setBooking({
        ...booking,
        status: 'cancelled',
        cancellationReason: 'User cancellation',
        cancellationTime: new Date().toISOString(),
        cancellationBy: user.role === 'pet_owner' ? 'client' : 'provider'
      });
      
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert('Error cancelling booking. Please try again.');
    }
  };
  
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: value
    });
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, we would call API
      // await api.createReview(bookingId, reviewData);
      
      // Update local state
      setBooking({
        ...booking,
        review: {
          ...reviewData,
          date: new Date().toISOString()
        }
      });
      
      setShowReviewForm(false);
      alert('Review submitted successfully.');
    } catch (err) {
      alert('Error submitting review. Please try again.');
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
  
  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!booking) {
    return <div className="not-found">Booking not found</div>;
  }
  
  const isPastBooking = new Date(booking.endTime) < new Date();
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.review && user?.role === 'pet_owner';
  
  return (
    <div className="booking-detail-page">
      <div className="container">
        <div className="booking-header">
          <h1>Booking Details</h1>
          <span className={`status-badge status-${booking.status}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        
        <div className="booking-content">
          <div className="booking-info-card">
            <h2>Service Information</h2>
            <div className="booking-info-content">
              <p><strong>Service:</strong> {booking.service.title}</p>
              <p><strong>Category:</strong> {booking.service.category}</p>
              <p><strong>Description:</strong> {booking.service.description}</p>
              <p><strong>Provider:</strong> {booking.provider.name}</p>
              <p><strong>Contact:</strong> {booking.provider.email} | {booking.provider.phone}</p>
              <p><strong>Location:</strong> {booking.location === 'at_provider' ? 'Service Provider Location' : 'Your Location'}</p>
            </div>
          </div>
          
          <div className="booking-info-card">
            <h2>Booking Details</h2>
            <div className="booking-info-content">
              <p><strong>Booking ID:</strong> {booking.id}</p>
              <p><strong>Date & Time:</strong> {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}</p>
              <p><strong>Pet:</strong> {booking.pet.name} ({booking.pet.breed}, {booking.pet.age} years old)</p>
              <p><strong>Status:</strong> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</p>
              <p><strong>Total Price:</strong> ${booking.totalPrice.amount}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
              <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
              
              {booking.cancellationReason && (
                <>
                  <p><strong>Cancellation Reason:</strong> {booking.cancellationReason}</p>
                  <p><strong>Cancelled On:</strong> {new Date(booking.cancellationTime).toLocaleDateString()}</p>
                  <p><strong>Cancelled By:</strong> {booking.cancellationBy === 'client' ? 'You' : 'Service Provider'}</p>
                </>
              )}
            </div>
          </div>
          
          {(booking.notes?.client || booking.notes?.provider) && (
            <div className="booking-info-card">
              <h2>Notes</h2>
              <div className="booking-info-content">
                {booking.notes.client && (
                  <div className="note">
                    <h4>Your Note:</h4>
                    <p>{booking.notes.client}</p>
                  </div>
                )}
                {booking.notes.provider && (
                  <div className="note">
                    <h4>Provider Note:</h4>
                    <p>{booking.notes.provider}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {booking.review && (
            <div className="booking-info-card">
              <h2>Your Review</h2>
              <div className="booking-info-content">
                <div className="review">
                  <p className="review-rating">{'⭐'.repeat(booking.review.rating)}</p>
                  <p className="review-comment">"{booking.review.comment}"</p>
                  <p className="review-date">Submitted on {new Date(booking.review.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {showReviewForm && (
            <div className="booking-info-card">
              <h2>Leave a Review</h2>
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <label key={star} className="star-label">
                        <input
                          type="radio"
                          name="rating"
                          value={star}
                          checked={parseInt(reviewData.rating) === star}
                          onChange={handleReviewChange}
                        />
                        ⭐
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comment">Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewData.comment}
                    onChange={handleReviewChange}
                    placeholder="Share your experience..."
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="booking-actions">
            <Link to="/bookings" className="btn btn-secondary">
              Back to Bookings
            </Link>
            
            {canCancel && (
              <button 
                className="btn btn-danger"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </button>
            )}
            
            {canReview && !showReviewForm && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowReviewForm(true)}
              >
                Leave a Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;