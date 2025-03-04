import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'upcoming') {
        params.startDate = new Date().toISOString();
        params.status = ['pending', 'confirmed'];
      } else if (filter === 'past') {
        params.endDate = new Date().toISOString();
        params.status = ['completed', 'cancelled'];
      } else if (filter === 'pending') {
        params.status = 'pending';
      }

      const response = await api.getBookings(params);
      const formattedAppointments = response.data.bookings.map(booking => ({
        id: booking._id,
        customerName: booking.client?.name || 'Unknown',
        petName: booking.subject?.name || 'No pet specified',
        service: booking.service?.title || 'Unknown service',
        date: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        location: booking.location,
        totalPrice: booking.totalPrice
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    navigate('/appointments/new');
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return appointmentDate >= today && appointment.status !== 'completed';
    } else if (filter === 'past') {
      return appointmentDate < today || appointment.status === 'completed';
    } else if (filter === 'pending') {
      return appointment.status === 'pending';
    }
    return true;
  });

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
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
      case 'no_show': return 'badge-danger';
      case 'rescheduled': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <PageHeader title="Appointments" />

      <div className="card">
        <div className="card-header">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>
          <div className="card-actions">
            <button 
              className="btn btn-primary"
              onClick={handleCreateAppointment}
            >
              + New Appointment
            </button>
          </div>
        </div>

        <div className="card-body">
          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No appointments found</h3>
              <p>There are no {filter} appointments to display.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Pet</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{formatDate(appointment.date)}</td>
                      <td>{appointment.customerName}</td>
                      <td>{appointment.petName}</td>
                      <td>{appointment.service}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-outline-primary">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;