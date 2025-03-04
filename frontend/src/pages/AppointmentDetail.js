import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.getBooking(appointmentId);
      const booking = response.data.booking;
      
      // Transform the booking data to fit our component
      const formattedAppointment = {
        id: booking._id,
        customerName: booking.client?.name || 'Unknown Client',
        customerId: booking.client?._id || '',
        customerEmail: booking.client?.email || '',
        customerPhone: booking.client?.phone || '',
        petName: booking.subject?.name || 'No pet specified',
        petId: booking.subject?._id || '',
        petBreed: booking.subject?.breed || '',
        petAge: booking.subject?.age || '',
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
        assignedStaff: booking.assignedStaff,
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
      await api.updateBooking(appointmentId, { status: newStatus });
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
      await api.cancelBooking(appointmentId, cancelReason);
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
        <PageHeader title="Appointment Not Found" />
        <div className="card">
          <div className="card-body empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Appointment Not Found</h3>
            <p>The appointment you're looking for doesn't exist or has been removed.</p>
            <Link to="/appointments" className="btn btn-primary">
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title={`Appointment: ${appointment.service}`}
        backLink="/appointments"
      />

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Appointment Details</h3>
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
                <h4>Service Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service:</span>
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
                <p className="detail-value notes-box">{appointment.notes || 'No notes for this appointment.'}</p>
              </div>
              
              <div className="action-buttons">
                {appointment.status === 'pending' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusChange('confirmed')}
                  >
                    Confirm Appointment
                  </button>
                )}
                
                {['pending', 'confirmed'].includes(appointment.status) && (
                  <button 
                    className="btn btn-danger"
                    onClick={handleCancelClick}
                  >
                    Cancel Appointment
                  </button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button 
                    className="btn btn-info"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Mark as Completed
                  </button>
                )}
                
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/appointments/${appointmentId}/edit`)}
                >
                  Edit Appointment
                </button>
              </div>
              
              {confirmingCancel && (
                <div className="confirmation-modal">
                  <div className="confirmation-modal-content">
                    <h3>Cancel Appointment</h3>
                    <p>Are you sure you want to cancel this appointment?</p>
                    <div className="confirmation-actions">
                      <button className="btn btn-outline-secondary" onClick={() => setConfirmingCancel(false)}>
                        No, Keep It
                      </button>
                      <button className="btn btn-danger" onClick={confirmCancel}>
                        Yes, Cancel Appointment
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
                <p><i className="icon-email"></i> {appointment.customerEmail}</p>
                <p><i className="icon-phone"></i> {appointment.customerPhone}</p>
                <Link to={`/customers/${appointment.customerId}`} className="btn btn-sm btn-outline-primary">
                  View Customer Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-header">
              <h3>Pet Details</h3>
            </div>
            <div className="card-body">
              <div className="pet-info">
                <h4>{appointment.petName}</h4>
                <p><strong>Breed:</strong> {appointment.petBreed}</p>
                <p><strong>Age:</strong> {appointment.petAge}</p>
                <Link to={`/pets/${appointment.petId}`} className="btn btn-sm btn-outline-primary">
                  View Pet Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;