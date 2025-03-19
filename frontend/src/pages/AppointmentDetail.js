import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { Search, Check, Cancel, Edit, Email, Phone } from '@mui/icons-material';

const AppointmentDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
  }, [bookingId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.getBooking(bookingId);
      const booking = response.data.booking;
      
      // Transform the booking data to fit our component
      const formattedAppointment = {
        id: booking._id,
        customerName: booking.client?.name || 'Unknown Client',
        customerId: booking.client?._id || '',
        customerEmail: booking.client?.email || '',
        customerPhone: booking.client?.phone || '',
        service: booking.service?.title || 'Unknown Service',
        serviceId: booking.service?._id || '',
        serviceDuration: calculateDuration(booking.startTime, booking.endTime),
        servicePrice: formatPrice(booking.totalPrice),
        date: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        notes: booking.notes?.client || booking.notes?.provider || '',
        paymentStatus: booking.paymentStatus || 'pending',
        location: booking.location,
        createdAt: booking.createdAt,
      };
      
      setAppointment(formattedAppointment);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateBooking(bookingId, { status: newStatus });
      setAppointment({
        ...appointment,
        status: newStatus
      });
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleCancelClick = () => {
    setConfirmingCancel(true);
  };

  const confirmCancel = async () => {
    try {
      await api.cancelBooking(bookingId, cancelReason);
      setAppointment({
        ...appointment,
        status: 'cancelled'
      });
      toast.success('Appointment cancelled successfully');
      setConfirmingCancel(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };
  
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`;
    }
  };
  
  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A';
    return `${price.currency || '$'}${price.amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!appointment) {
    return (
      <div className="page-container">
        <PageHeader title="Booking Not Found" />
        <div className="card">
          <div className="card-body empty-state">
            <div className="empty-state-icon"><Search style={{ fontSize: '3rem' }} /></div>
            <h3>Booking Not Found</h3>
            <p>The booking you're looking for doesn't exist or has been removed.</p>
            <Link to="/bookings" className="btn btn-primary">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title={`Booking: ${appointment.service}`}
        backLink="/bookings"
      />

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Booking Details</h3>
              <div className="status-pill">
                <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="detail-section">
                <h4>Scheduled Time</h4>
                <p className="detail-value">{formatDate(appointment.date)}</p>
              </div>

              <div className="detail-section">
                <h4>Venue Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Event Type:</span>
                    <span className="detail-value">{appointment.service}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{appointment.serviceDuration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{appointment.servicePrice}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`detail-value ${appointment.paymentStatus === 'paid' ? 'text-success' : 'text-danger'}`}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Notes</h4>
                <p className="detail-value notes-box">{appointment.notes || 'No notes for this booking.'}</p>
              </div>
              
              <div className="action-buttons">
                {appointment.status === 'pending' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusChange('confirmed')}
                  >
                    <Check style={{ marginRight: '4px' }} /> Confirm Booking
                  </button>
                )}
                
                {['pending', 'confirmed'].includes(appointment.status) && (
                  <button 
                    className="btn btn-danger"
                    onClick={handleCancelClick}
                  >
                    <Cancel style={{ marginRight: '4px' }} /> Cancel Booking
                  </button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button 
                    className="btn btn-info"
                    onClick={() => handleStatusChange('completed')}
                  >
                    <Check style={{ marginRight: '4px' }} /> Mark as Completed
                  </button>
                )}
                
                <Link 
                  to={`/bookings/${bookingId}/edit`}
                  className="btn btn-outline-primary"
                >
                  <Edit style={{ marginRight: '4px' }} /> Edit Booking
                </Link>
              </div>
              
              {confirmingCancel && (
                <div className="confirmation-modal">
                  <div className="confirmation-modal-content">
                    <h3>Cancel Booking</h3>
                    <p>Are you sure you want to cancel this venue booking?</p>
                    <div className="confirmation-actions">
                      <button className="btn btn-outline-secondary" onClick={() => setConfirmingCancel(false)}>
                        No, Keep It
                      </button>
                      <button className="btn btn-danger confirm-cancel-btn" onClick={confirmCancel}>
                        Yes, Cancel Booking
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3>Customer Details</h3>
            </div>
            <div className="card-body">
              <div className="customer-info">
                <h4>{appointment.customerName}</h4>
                <p><Email style={{ fontSize: '1rem', marginRight: '8px', verticalAlign: 'middle' }} /> {appointment.customerEmail}</p>
                <p><Phone style={{ fontSize: '1rem', marginRight: '8px', verticalAlign: 'middle' }} /> {appointment.customerPhone}</p>
                <Link to={`/customers/${appointment.customerId}`} className="btn btn-sm btn-outline-primary">
                  View Customer Profile
                </Link>
              </div>
            </div>
          </div>
          
          {/* Pet details section removed */}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;