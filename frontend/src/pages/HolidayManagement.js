import React, { useState, useEffect } from 'react';
import { format, parse, isAfter, differenceInDays, addMonths, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import { useBusiness } from '../context/BusinessContext';

// Components
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

/**
 * Holiday Management page
 * Allows businesses to create and manage holiday and closure dates
 */
const HolidayManagement = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    isFullDay: true,
    startTime: '00:00',
    endTime: '23:59',
    recurrence: 'none',
    recurrenceEndDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
    notes: '',
    affectsAllServices: true,
    affectedServices: []
  });
  const [services, setServices] = useState([]);
  const [upcomingFilter, setUpcomingFilter] = useState(true);

  // Context
  const { fetchServices, businessLoading } = useBusiness();

  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch services
        const servicesData = await fetchServices();
        setServices(servicesData);
        
        // Fetch holidays (this would be an API call in a real application)
        // For demo purposes, we'll use mock data
        const mockHolidays = [
          {
            _id: 'hol1',
            name: 'Independence Day',
            startDate: '2025-07-04',
            endDate: '2025-07-04',
            isFullDay: true,
            startTime: null,
            endTime: null,
            recurrence: 'yearly',
            recurrenceEndDate: '2030-12-31',
            notes: 'Closed for Independence Day',
            affectsAllServices: true,
            affectedServices: []
          },
          {
            _id: 'hol2',
            name: 'Staff Training',
            startDate: '2025-04-15',
            endDate: '2025-04-15',
            isFullDay: false,
            startTime: '13:00',
            endTime: '17:00',
            recurrence: 'none',
            recurrenceEndDate: null,
            notes: 'Afternoon closure for staff training session',
            affectsAllServices: true,
            affectedServices: []
          },
          {
            _id: 'hol3',
            name: 'Christmas Break',
            startDate: '2025-12-24',
            endDate: '2025-12-26',
            isFullDay: true,
            startTime: null,
            endTime: null,
            recurrence: 'yearly',
            recurrenceEndDate: '2030-12-31',
            notes: 'Closed for Christmas holidays',
            affectsAllServices: true,
            affectedServices: []
          },
          {
            _id: 'hol4',
            name: 'System Maintenance',
            startDate: '2025-03-20',
            endDate: '2025-03-20',
            isFullDay: false,
            startTime: '18:00',
            endTime: '20:00',
            recurrence: 'none',
            recurrenceEndDate: null,
            notes: 'No online bookings during system maintenance',
            affectsAllServices: false,
            affectedServices: ['serv1', 'serv2']
          }
        ];
        
        setHolidays(mockHolidays);
      } catch (error) {
        console.error('Error loading holiday data:', error);
        toast.error('Failed to load holiday data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchServices]);

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setHolidayForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle service selection for affected services
  const handleServiceSelection = (serviceId) => {
    setHolidayForm(prev => {
      const updatedServices = [...prev.affectedServices];
      
      if (updatedServices.includes(serviceId)) {
        // Remove service if already selected
        return {
          ...prev,
          affectedServices: updatedServices.filter(id => id !== serviceId)
        };
      } else {
        // Add service if not selected
        return {
          ...prev,
          affectedServices: [...updatedServices, serviceId]
        };
      }
    });
  };

  // Open add holiday modal
  const handleOpenAddModal = () => {
    setHolidayForm({
      name: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      isFullDay: true,
      startTime: '00:00',
      endTime: '23:59',
      recurrence: 'none',
      recurrenceEndDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
      notes: '',
      affectsAllServices: true,
      affectedServices: []
    });
    
    setShowAddModal(true);
  };

  // Open edit holiday modal
  const handleOpenEditModal = (holiday) => {
    setSelectedHoliday(holiday);
    
    setHolidayForm({
      name: holiday.name,
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      isFullDay: holiday.isFullDay,
      startTime: holiday.startTime || '00:00',
      endTime: holiday.endTime || '23:59',
      recurrence: holiday.recurrence || 'none',
      recurrenceEndDate: holiday.recurrenceEndDate || format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
      notes: holiday.notes || '',
      affectsAllServices: holiday.affectsAllServices,
      affectedServices: holiday.affectedServices || []
    });
    
    setShowEditModal(true);
  };

  // Save a new holiday
  const handleSaveHoliday = () => {
    try {
      // Validate form
      if (!holidayForm.name.trim()) {
        toast.error('Please enter a holiday name');
        return;
      }
      
      const startDate = parse(holidayForm.startDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(holidayForm.endDate, 'yyyy-MM-dd', new Date());
      
      if (isAfter(startDate, endDate)) {
        toast.error('End date must be after start date');
        return;
      }
      
      // For non-full day holidays, validate times
      if (!holidayForm.isFullDay) {
        if (holidayForm.startTime >= holidayForm.endTime) {
          toast.error('End time must be after start time');
          return;
        }
      }
      
      // Check affected services if not affecting all
      if (!holidayForm.affectsAllServices && holidayForm.affectedServices.length === 0) {
        toast.error('Please select at least one service');
        return;
      }
      
      // This would be an API call in a real application
      // For demo purposes, we'll update our local state
      
      const newHoliday = {
        _id: `hol${Date.now()}`,
        ...holidayForm
      };
      
      setHolidays(prev => [...prev, newHoliday]);
      
      toast.success('Holiday added successfully');
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error('Failed to save holiday');
    }
  };

  // Update an existing holiday
  const handleUpdateHoliday = () => {
    try {
      // Validate form
      if (!holidayForm.name.trim()) {
        toast.error('Please enter a holiday name');
        return;
      }
      
      const startDate = parse(holidayForm.startDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(holidayForm.endDate, 'yyyy-MM-dd', new Date());
      
      if (isAfter(startDate, endDate)) {
        toast.error('End date must be after start date');
        return;
      }
      
      // For non-full day holidays, validate times
      if (!holidayForm.isFullDay) {
        if (holidayForm.startTime >= holidayForm.endTime) {
          toast.error('End time must be after start time');
          return;
        }
      }
      
      // Check affected services if not affecting all
      if (!holidayForm.affectsAllServices && holidayForm.affectedServices.length === 0) {
        toast.error('Please select at least one service');
        return;
      }
      
      // This would be an API call in a real application
      // For demo purposes, we'll update our local state
      
      const updatedHolidays = holidays.map(holiday => 
        holiday._id === selectedHoliday._id ? { ...holiday, ...holidayForm } : holiday
      );
      
      setHolidays(updatedHolidays);
      
      toast.success('Holiday updated successfully');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast.error('Failed to update holiday');
    }
  };

  // Delete a holiday
  const handleDeleteHoliday = () => {
    try {
      // This would be an API call in a real application
      // For demo purposes, we'll update our local state
      
      const updatedHolidays = holidays.filter(holiday => 
        holiday._id !== selectedHoliday._id
      );
      
      setHolidays(updatedHolidays);
      
      toast.success('Holiday deleted successfully');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    
    if (isSameDay(start, end)) {
      return format(start, 'MMMM d, yyyy');
    }
    
    if (format(start, 'yyyy') === format(end, 'yyyy')) {
      if (format(start, 'MMMM') === format(end, 'MMMM')) {
        return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
    }
    
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  // Format time range for display
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'All Day';
    
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes.padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get service names for display
  const getServiceNames = (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) return 'All Services';
    
    return serviceIds.map(id => {
      const service = services.find(s => s._id === id);
      return service ? service.name : 'Unknown Service';
    }).join(', ');
  };

  // Filter holidays based on current view
  const filteredHolidays = upcomingFilter 
    ? holidays.filter(holiday => {
        const endDate = parse(holiday.endDate, 'yyyy-MM-dd', new Date());
        return isAfter(endDate, new Date()) || isSameDay(endDate, new Date());
      })
    : holidays;

  // Sort holidays by start date
  const sortedHolidays = [...filteredHolidays].sort((a, b) => {
    const dateA = parse(a.startDate, 'yyyy-MM-dd', new Date());
    const dateB = parse(b.startDate, 'yyyy-MM-dd', new Date());
    return dateA - dateB;
  });

  // Get recurrence text
  const getRecurrenceText = (recurrence) => {
    switch(recurrence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'none':
      default:
        return 'One-time';
    }
  };

  // Get status of holiday (upcoming, active, past)
  const getHolidayStatus = (holiday) => {
    const today = new Date();
    const startDate = parse(holiday.startDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(holiday.endDate, 'yyyy-MM-dd', new Date());
    
    if (isAfter(startDate, today)) {
      // Upcoming
      const daysUntil = differenceInDays(startDate, today);
      return {
        status: 'upcoming',
        label: `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
      };
    } else if (isAfter(endDate, today) || isSameDay(endDate, today)) {
      // Active
      return {
        status: 'active',
        label: 'Active Now'
      };
    } else {
      // Past
      return {
        status: 'past',
        label: 'Past'
      };
    }
  };

  // Loading state
  if (isLoading || businessLoading) {
    return <LoadingSpinner text="Loading holidays..." />;
  }

  return (
    <div className="holiday-management-page">
      <PageHeader 
        title="Holidays & Closures" 
        description="Manage your business holidays, closures, and special hours."
        actionButton={
          <Button 
            primary 
            onClick={handleOpenAddModal}
            leftIcon="+"
          >
            Add Holiday
          </Button>
        }
      />
      
      <div className="view-controls">
        <div className="view-tabs">
          <button 
            className={`view-tab ${upcomingFilter ? 'active' : ''}`}
            onClick={() => setUpcomingFilter(true)}
          >
            Upcoming & Active
          </button>
          <button 
            className={`view-tab ${!upcomingFilter ? 'active' : ''}`}
            onClick={() => setUpcomingFilter(false)}
          >
            All Holidays
          </button>
        </div>
      </div>
      
      {sortedHolidays.length === 0 ? (
        <EmptyState
          title={upcomingFilter ? "No Upcoming Holidays" : "No Holidays Set"}
          description={upcomingFilter ? "You don't have any upcoming holidays or closures scheduled." : "You haven't set any holidays or closures yet."}
          actionButton={
            <Button primary onClick={handleOpenAddModal}>
              Add Holiday
            </Button>
          }
          icon="🏖️"
        />
      ) : (
        <div className="holidays-list">
          {sortedHolidays.map(holiday => {
            const { status, label } = getHolidayStatus(holiday);
            
            return (
              <div key={holiday._id} className={`holiday-card ${status}`}>
                <div className="holiday-header">
                  <h3 className="holiday-name">{holiday.name}</h3>
                  <div className={`status-badge ${status}`}>
                    {label}
                  </div>
                </div>
                
                <div className="holiday-dates">
                  <div className="date-range">
                    <span className="icon">📅</span>
                    {formatDateRange(holiday.startDate, holiday.endDate)}
                  </div>
                  
                  {!holiday.isFullDay && (
                    <div className="time-range">
                      <span className="icon">⏰</span>
                      {formatTimeRange(holiday.startTime, holiday.endTime)}
                    </div>
                  )}
                </div>
                
                {holiday.recurrence !== 'none' && (
                  <div className="recurrence-info">
                    <span className="icon">🔄</span>
                    {getRecurrenceText(holiday.recurrence)} 
                    {holiday.recurrenceEndDate && (
                      <span> until {format(parse(holiday.recurrenceEndDate, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}</span>
                    )}
                  </div>
                )}
                
                {!holiday.affectsAllServices && (
                  <div className="affected-services">
                    <span className="icon">🛠️</span>
                    <span className="label">Affects: </span>
                    {getServiceNames(holiday.affectedServices)}
                  </div>
                )}
                
                {holiday.notes && (
                  <div className="holiday-notes">
                    <span className="icon">📝</span>
                    {holiday.notes}
                  </div>
                )}
                
                <div className="holiday-actions">
                  <Button 
                    small 
                    secondary 
                    onClick={() => handleOpenEditModal(holiday)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add Holiday Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Holiday or Closure"
      >
        <form>
          <div className="form-group">
            <label htmlFor="name">Holiday Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={holidayForm.name}
              onChange={handleFormChange}
              placeholder="e.g., Christmas, Staff Training, etc."
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={holidayForm.startDate}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date*</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={holidayForm.endDate}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isFullDay"
                checked={holidayForm.isFullDay}
                onChange={handleFormChange}
              />
              Full day (closed all day)
            </label>
          </div>
          
          {!holidayForm.isFullDay && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={holidayForm.startTime}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={holidayForm.endTime}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="recurrence">Recurrence</label>
            <select
              id="recurrence"
              name="recurrence"
              value={holidayForm.recurrence}
              onChange={handleFormChange}
            >
              <option value="none">One-time only</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          {holidayForm.recurrence !== 'none' && (
            <div className="form-group">
              <label htmlFor="recurrenceEndDate">Recurrence End Date</label>
              <input
                type="date"
                id="recurrenceEndDate"
                name="recurrenceEndDate"
                value={holidayForm.recurrenceEndDate}
                onChange={handleFormChange}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={holidayForm.notes}
              onChange={handleFormChange}
              placeholder="Additional information about this holiday or closure"
              rows={3}
            ></textarea>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="affectsAllServices"
                checked={holidayForm.affectsAllServices}
                onChange={handleFormChange}
              />
              Affects all services
            </label>
          </div>
          
          {!holidayForm.affectsAllServices && (
            <div className="form-group">
              <label>Select Affected Services</label>
              <div className="services-selection">
                {services.map(service => (
                  <div key={service._id} className="service-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={holidayForm.affectedServices.includes(service._id)}
                        onChange={() => handleServiceSelection(service._id)}
                      />
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            <Button type="button" secondary onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="button" primary onClick={handleSaveHoliday}>
              Save Holiday
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Holiday Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Holiday or Closure"
      >
        {selectedHoliday && (
          <form>
            <div className="form-group">
              <label htmlFor="edit-name">Holiday Name*</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={holidayForm.name}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-startDate">Start Date*</label>
                <input
                  type="date"
                  id="edit-startDate"
                  name="startDate"
                  value={holidayForm.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-endDate">End Date*</label>
                <input
                  type="date"
                  id="edit-endDate"
                  name="endDate"
                  value={holidayForm.endDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isFullDay"
                  checked={holidayForm.isFullDay}
                  onChange={handleFormChange}
                />
                Full day (closed all day)
              </label>
            </div>
            
            {!holidayForm.isFullDay && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startTime">Start Time</label>
                  <input
                    type="time"
                    id="edit-startTime"
                    name="startTime"
                    value={holidayForm.startTime}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-endTime">End Time</label>
                  <input
                    type="time"
                    id="edit-endTime"
                    name="endTime"
                    value={holidayForm.endTime}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="edit-recurrence">Recurrence</label>
              <select
                id="edit-recurrence"
                name="recurrence"
                value={holidayForm.recurrence}
                onChange={handleFormChange}
              >
                <option value="none">One-time only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            {holidayForm.recurrence !== 'none' && (
              <div className="form-group">
                <label htmlFor="edit-recurrenceEndDate">Recurrence End Date</label>
                <input
                  type="date"
                  id="edit-recurrenceEndDate"
                  name="recurrenceEndDate"
                  value={holidayForm.recurrenceEndDate}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                name="notes"
                value={holidayForm.notes}
                onChange={handleFormChange}
                placeholder="Additional information about this holiday or closure"
                rows={3}
              ></textarea>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="affectsAllServices"
                  checked={holidayForm.affectsAllServices}
                  onChange={handleFormChange}
                />
                Affects all services
              </label>
            </div>
            
            {!holidayForm.affectsAllServices && (
              <div className="form-group">
                <label>Select Affected Services</label>
                <div className="services-selection">
                  {services.map(service => (
                    <div key={service._id} className="service-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={holidayForm.affectedServices.includes(service._id)}
                          onChange={() => handleServiceSelection(service._id)}
                        />
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <Button type="button" danger onClick={handleDeleteHoliday}>
                Delete
              </Button>
              <Button type="button" secondary onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="button" primary onClick={handleUpdateHoliday}>
                Update Holiday
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HolidayManagement;