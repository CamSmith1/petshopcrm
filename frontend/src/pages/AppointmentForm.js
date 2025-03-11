import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const AppointmentForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const isEditing = appointmentId && appointmentId !== 'new';
  
  const [loading, setLoading] = useState(isEditing);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [formData, setFormData] = useState({
    serviceId: '',
    customerId: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
  });

  useEffect(() => {
    // Fetch services, customers and pets data
    const fetchFormData = async () => {
      try {
        // Fetch services
        const servicesResponse = await api.getServices();
        setServices(servicesResponse.data.services || []);
        
        // Fetch customers (using mock data for now)
        const customersData = [
          { _id: 'cust1', name: 'John Smith', email: 'john@example.com' },
          { _id: 'cust2', name: 'Mary Johnson', email: 'mary@example.com' },
          { _id: 'cust3', name: 'David Williams', email: 'david@example.com' },
          { _id: 'cust4', name: 'Sarah Miller', email: 'sarah@example.com' },
        ];
        setCustomers(customersData);
        
        // Pets data removed
        
        // If editing, fetch appointment data
        if (isEditing) {
          const appointmentResponse = await api.getBooking(appointmentId);
          const appointment = appointmentResponse.data.booking;
          
          // Set customer
          if (appointment.client?._id) {
            setSelectedCustomer(appointment.client._id);
          }
          
          // Format the date and time
          const appointmentDate = new Date(appointment.startTime);
          const formattedDate = appointmentDate.toISOString().split('T')[0];
          const formattedTime = appointmentDate.toTimeString().slice(0, 5);
          
          // Calculate duration in minutes
          const endTime = new Date(appointment.endTime);
          const durationMinutes = Math.round((endTime - appointmentDate) / 60000);
          
          setFormData({
            serviceId: appointment.service?._id || '',
            customerId: appointment.client?._id || '',
            date: formattedDate,
            time: formattedTime,
            duration: durationMinutes,
            notes: appointment.notes?.client || '',
          });
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [appointmentId, isEditing]);
  
  // Update customer selection
  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer,
      }));
    }
  }, [selectedCustomer]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // If customer is changed, update selected customer
    if (name === 'customerId') {
      setSelectedCustomer(value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format date and time for API
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + formData.duration * 60000);
      
      const appointmentData = {
        service: formData.serviceId,
        client: formData.customerId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: {
          client: formData.notes,
        },
        status: 'pending',
      };
      
      // Create or update appointment
      if (isEditing) {
        await api.updateBooking(appointmentId, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await api.createBooking(appointmentData);
        toast.success('Appointment created successfully');
      }
      
      // Navigate back to appointments list
      navigate('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="page-container">
      <PageHeader 
        title={isEditing ? 'Edit Appointment' : 'New Appointment'} 
        backLink="/appointments"
      />
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="serviceId">Service</label>
              <select 
                id="serviceId" 
                name="serviceId" 
                className="form-control"
                value={formData.serviceId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service._id} value={service._id}>
                    {service.title} (${service.price?.amount || 0})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="customerId">Customer</label>
              <select 
                id="customerId" 
                name="customerId" 
                className="form-control"
                value={formData.customerId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 1, marginRight: '10px' }}>
                <label htmlFor="date">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="time">Time</label>
                <input 
                  type="time" 
                  id="time" 
                  name="time" 
                  className="form-control"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <select
                id="duration" 
                name="duration" 
                className="form-control"
                value={formData.duration}
                onChange={handleInputChange}
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea 
                id="notes" 
                name="notes" 
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Add any special instructions or notes"
              ></textarea>
            </div>
            
            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/appointments')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Appointment' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;