import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, formatISO, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { useBusiness } from '../context/BusinessContext';

// Components
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

const StaffScheduling = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    staffId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    recurrencePattern: 'weekly',
    maxBookings: 8,
    breakTimes: []
  });
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakForm, setBreakForm] = useState({
    startTime: '12:00',
    endTime: '13:00',
    description: 'Lunch Break'
  });

  // Context
  const { fetchStaff, businessLoading } = useBusiness();

  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch staff
        const staffData = await fetchStaff();
        setStaff(staffData);
        
        if (staffData.length > 0) {
          setSelectedStaff(staffData[0]._id);
        }
        
        // Generate week days
        generateWeekDays(currentWeek);
        
        // Fetch schedules (this would connect to your API)
        await fetchSchedules();
        
      } catch (error) {
        console.error('Error loading scheduling data:', error);
        toast.error('Failed to load scheduling data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchStaff]);
  
  // Generate days for the current week view
  const generateWeekDays = (dateInWeek) => {
    const start = startOfWeek(dateInWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(dateInWeek, { weekStartsOn: 1 }); // Sunday
    
    const days = eachDayOfInterval({ start, end });
    setWeekDays(days);
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(prevWeek);
    generateWeekDays(prevWeek);
    fetchSchedules(prevWeek);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(nextWeek);
    generateWeekDays(nextWeek);
    fetchSchedules(nextWeek);
  };
  
  // Fetch schedules for the selected week and staff
  const fetchSchedules = async (week = currentWeek) => {
    // This would be an API call in a real application
    // For now, we'll use mock data
    
    // Example mock data structure
    const mockSchedules = {
      // Staff ID -> Date -> Schedule
      'staff1': {
        '2025-03-04': {
          startTime: '09:00',
          endTime: '17:00',
          maxBookings: 8,
          breakTimes: [
            { startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }
          ]
        },
        '2025-03-05': {
          startTime: '10:00',
          endTime: '18:00',
          maxBookings: 10,
          breakTimes: [
            { startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }
          ]
        }
      },
      'staff2': {
        '2025-03-04': {
          startTime: '08:00',
          endTime: '16:00',
          maxBookings: 6,
          breakTimes: []
        }
      }
    };
    
    setSchedules(mockSchedules);
  };
  
  // Handle staff change
  const handleStaffChange = (staffId) => {
    setSelectedStaff(staffId);
  };
  
  // Handle schedule form input change
  const handleScheduleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleForm({
      ...scheduleForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle break form input change
  const handleBreakFormChange = (e) => {
    const { name, value } = e.target;
    setBreakForm({
      ...breakForm,
      [name]: value
    });
  };
  
  // Add a break to the schedule
  const addBreak = () => {
    // Validate break times
    if (breakForm.startTime >= breakForm.endTime) {
      toast.error('Break end time must be after start time');
      return;
    }
    
    const updatedBreaks = [
      ...scheduleForm.breakTimes,
      { ...breakForm }
    ];
    
    setScheduleForm({
      ...scheduleForm,
      breakTimes: updatedBreaks
    });
    
    setBreakForm({
      startTime: '12:00',
      endTime: '13:00',
      description: 'Break'
    });
    
    setShowBreakModal(false);
  };
  
  // Remove a break from the schedule
  const removeBreak = (index) => {
    const updatedBreaks = [...scheduleForm.breakTimes];
    updatedBreaks.splice(index, 1);
    
    setScheduleForm({
      ...scheduleForm,
      breakTimes: updatedBreaks
    });
  };
  
  // Open the add schedule modal
  const handleOpenAddModal = (date) => {
    const formattedDate = formatISO(date, { representation: 'date' });
    
    setScheduleForm({
      staffId: selectedStaff,
      date: formattedDate,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      recurrencePattern: 'weekly',
      maxBookings: 8,
      breakTimes: []
    });
    
    setShowAddModal(true);
  };
  
  // Open the edit schedule modal
  const handleOpenEditModal = (staffId, date, schedule) => {
    setCurrentSchedule({ staffId, date });
    
    setScheduleForm({
      staffId: staffId,
      date: date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isRecurring: false,
      recurrencePattern: 'weekly',
      maxBookings: schedule.maxBookings,
      breakTimes: [...schedule.breakTimes]
    });
    
    setShowEditModal(true);
  };
  
  // Save a new schedule
  const handleSaveSchedule = async () => {
    try {
      // Validate form
      if (scheduleForm.startTime >= scheduleForm.endTime) {
        toast.error('End time must be after start time');
        return;
      }
      
      // This would be an API call in a real application
      // For now, we'll update our local state
      
      const { staffId, date } = scheduleForm;
      
      const updatedSchedules = { ...schedules };
      
      if (!updatedSchedules[staffId]) {
        updatedSchedules[staffId] = {};
      }
      
      updatedSchedules[staffId][date] = {
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        maxBookings: scheduleForm.maxBookings,
        breakTimes: [...scheduleForm.breakTimes]
      };
      
      setSchedules(updatedSchedules);
      
      toast.success('Schedule saved successfully');
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    }
  };
  
  // Update an existing schedule
  const handleUpdateSchedule = async () => {
    try {
      // Validate form
      if (scheduleForm.startTime >= scheduleForm.endTime) {
        toast.error('End time must be after start time');
        return;
      }
      
      // This would be an API call in a real application
      // For now, we'll update our local state
      
      const { staffId, date } = currentSchedule;
      
      const updatedSchedules = { ...schedules };
      
      updatedSchedules[staffId][date] = {
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        maxBookings: scheduleForm.maxBookings,
        breakTimes: [...scheduleForm.breakTimes]
      };
      
      setSchedules(updatedSchedules);
      
      toast.success('Schedule updated successfully');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };
  
  // Delete a schedule
  const handleDeleteSchedule = async () => {
    try {
      // This would be an API call in a real application
      // For now, we'll update our local state
      
      const { staffId, date } = currentSchedule;
      
      const updatedSchedules = { ...schedules };
      
      delete updatedSchedules[staffId][date];
      
      setSchedules(updatedSchedules);
      
      toast.success('Schedule deleted successfully');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };
  
  // Get the staff name by ID
  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s._id === staffId);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };
  
  // Check if there's a schedule for a specific day
  const getScheduleForDay = (staffId, date) => {
    const formattedDate = formatISO(date, { representation: 'date' });
    
    if (schedules[staffId] && schedules[staffId][formattedDate]) {
      return schedules[staffId][formattedDate];
    }
    
    return null;
  };
  
  // Render time slots for a day
  const renderTimeSlots = (day) => {
    const schedule = getScheduleForDay(selectedStaff, day);
    
    if (!schedule) {
      return (
        <div className="empty-schedule">
          <Button 
            small 
            secondary 
            onClick={() => handleOpenAddModal(day)}
          >
            + Add Hours
          </Button>
        </div>
      );
    }
    
    return (
      <div className="schedule-card">
        <div className="schedule-time">
          {schedule.startTime} - {schedule.endTime}
        </div>
        <div className="schedule-capacity">
          Capacity: {schedule.maxBookings} bookings
        </div>
        
        {schedule.breakTimes.length > 0 && (
          <div className="schedule-breaks">
            <div className="break-title">Breaks:</div>
            {schedule.breakTimes.map((breakTime, index) => (
              <div key={index} className="break-time">
                {breakTime.description}: {breakTime.startTime} - {breakTime.endTime}
              </div>
            ))}
          </div>
        )}
        
        <Button 
          small 
          secondary 
          onClick={() => handleOpenEditModal(selectedStaff, formatISO(day, { representation: 'date' }), schedule)}
        >
          Edit
        </Button>
      </div>
    );
  };
  
  // If loading
  if (isLoading || businessLoading) {
    return <LoadingSpinner text="Loading staff scheduling..." />;
  }
  
  return (
    <div className="staff-scheduling-page">
      <PageHeader 
        title="Staff Scheduling" 
        description="Manage your staff's available working hours and capacity."
      />
      
      {staff.length === 0 ? (
        <EmptyState
          title="No Staff Members Yet"
          description="Add staff members to start scheduling."
          actionButton={
            <Button to="/staff" primary>
              Manage Staff
            </Button>
          }
          icon="👥"
        />
      ) : (
        <>
          <div className="scheduling-controls">
            <div className="staff-selector">
              <label htmlFor="staff-select">Select Staff Member:</label>
              <select
                id="staff-select"
                value={selectedStaff || ''}
                onChange={(e) => handleStaffChange(e.target.value)}
              >
                {staff.map(staffMember => (
                  <option key={staffMember._id} value={staffMember._id}>
                    {staffMember.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="week-navigation">
              <Button secondary small onClick={goToPreviousWeek} leftIcon="◀">
                Previous
              </Button>
              
              <h3 className="current-week">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[weekDays.length - 1], 'MMM d, yyyy')}
              </h3>
              
              <Button secondary small onClick={goToNextWeek} rightIcon="▶">
                Next
              </Button>
            </div>
          </div>
          
          <div className="schedule-grid">
            {weekDays.map(day => (
              <div key={day.toString()} className="day-column">
                <div className="day-header">
                  <div className="day-name">{format(day, 'EEEE')}</div>
                  <div className="day-date">{format(day, 'MMM d')}</div>
                </div>
                
                <div className="day-schedule">
                  {renderTimeSlots(day)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Add Schedule Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add Schedule for ${getStaffName(scheduleForm.staffId)}`}
      >
        <form>
          <div className="form-group">
            <label>Date</label>
            <div className="form-text">
              {scheduleForm.date ? format(parseISO(scheduleForm.date), 'EEEE, MMMM d, yyyy') : ''}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={scheduleForm.startTime}
                onChange={handleScheduleFormChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={scheduleForm.endTime}
                onChange={handleScheduleFormChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="maxBookings">Maximum Bookings</label>
            <input
              type="number"
              id="maxBookings"
              name="maxBookings"
              min="1"
              value={scheduleForm.maxBookings}
              onChange={handleScheduleFormChange}
            />
            <div className="form-help">Maximum number of appointments this staff member can handle on this day</div>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRecurring"
                checked={scheduleForm.isRecurring}
                onChange={handleScheduleFormChange}
              />
              Set as recurring schedule
            </label>
          </div>
          
          {scheduleForm.isRecurring && (
            <div className="form-group">
              <label htmlFor="recurrencePattern">Recurrence Pattern</label>
              <select
                id="recurrencePattern"
                name="recurrencePattern"
                value={scheduleForm.recurrencePattern}
                onChange={handleScheduleFormChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (same day each week)</option>
                <option value="biweekly">Bi-weekly (every 2 weeks)</option>
                <option value="monthly">Monthly (same date each month)</option>
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label>Breaks</label>
            
            {scheduleForm.breakTimes.length === 0 ? (
              <div className="no-breaks-message">No breaks scheduled</div>
            ) : (
              <div className="breaks-list">
                {scheduleForm.breakTimes.map((breakTime, index) => (
                  <div key={index} className="break-item">
                    <div className="break-info">
                      <strong>{breakTime.description}</strong>: {breakTime.startTime} - {breakTime.endTime}
                    </div>
                    <Button 
                      small 
                      danger 
                      onClick={() => removeBreak(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              secondary 
              small 
              type="button" 
              onClick={() => setShowBreakModal(true)}
            >
              + Add Break
            </Button>
          </div>
          
          <div className="modal-actions">
            <Button secondary onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button primary onClick={handleSaveSchedule}>
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Schedule Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Schedule for ${currentSchedule ? getStaffName(currentSchedule.staffId) : ''}`}
      >
        {currentSchedule && (
          <form>
            <div className="form-group">
              <label>Date</label>
              <div className="form-text">
                {currentSchedule.date ? format(parseISO(currentSchedule.date), 'EEEE, MMMM d, yyyy') : ''}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-startTime">Start Time</label>
                <input
                  type="time"
                  id="edit-startTime"
                  name="startTime"
                  value={scheduleForm.startTime}
                  onChange={handleScheduleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-endTime">End Time</label>
                <input
                  type="time"
                  id="edit-endTime"
                  name="endTime"
                  value={scheduleForm.endTime}
                  onChange={handleScheduleFormChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-maxBookings">Maximum Bookings</label>
              <input
                type="number"
                id="edit-maxBookings"
                name="maxBookings"
                min="1"
                value={scheduleForm.maxBookings}
                onChange={handleScheduleFormChange}
              />
              <div className="form-help">Maximum number of appointments this staff member can handle on this day</div>
            </div>
            
            <div className="form-group">
              <label>Breaks</label>
              
              {scheduleForm.breakTimes.length === 0 ? (
                <div className="no-breaks-message">No breaks scheduled</div>
              ) : (
                <div className="breaks-list">
                  {scheduleForm.breakTimes.map((breakTime, index) => (
                    <div key={index} className="break-item">
                      <div className="break-info">
                        <strong>{breakTime.description}</strong>: {breakTime.startTime} - {breakTime.endTime}
                      </div>
                      <Button 
                        small 
                        danger 
                        onClick={() => removeBreak(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                secondary 
                small 
                type="button" 
                onClick={() => setShowBreakModal(true)}
              >
                + Add Break
              </Button>
            </div>
            
            <div className="modal-actions">
              <Button danger onClick={handleDeleteSchedule}>
                Delete
              </Button>
              <Button secondary onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button primary onClick={handleUpdateSchedule}>
                Update Schedule
              </Button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Add Break Modal */}
      <Modal
        show={showBreakModal}
        onClose={() => setShowBreakModal(false)}
        title="Add Break"
      >
        <form>
          <div className="form-group">
            <label htmlFor="break-description">Description</label>
            <input
              type="text"
              id="break-description"
              name="description"
              value={breakForm.description}
              onChange={handleBreakFormChange}
              placeholder="e.g., Lunch Break"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="break-startTime">Start Time</label>
              <input
                type="time"
                id="break-startTime"
                name="startTime"
                value={breakForm.startTime}
                onChange={handleBreakFormChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="break-endTime">End Time</label>
              <input
                type="time"
                id="break-endTime"
                name="endTime"
                value={breakForm.endTime}
                onChange={handleBreakFormChange}
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <Button secondary onClick={() => setShowBreakModal(false)}>
              Cancel
            </Button>
            <Button primary onClick={addBreak}>
              Add Break
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffScheduling;