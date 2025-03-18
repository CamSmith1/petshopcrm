import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ScheduleCalendar = () => {
  // Get today's date
  const today = new Date();
  
  // State for current month/year
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load appointments from API/localStorage
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.getBookings();
        
        // Process appointments to match our display format
        const formattedAppointments = response.data.bookings.map(booking => {
          const startDate = new Date(booking.startTime);
          const serviceTitle = booking.service?.title || 'Unknown Service';
          const clientName = booking.client?.name || 'Unknown Client';
          
          return {
            id: booking._id,
            title: `${serviceTitle}${booking.subject?.name ? ' - ' + booking.subject.name : ''}`,
            customer: clientName,
            date: startDate.toISOString().split('T')[0],
            startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: booking.status,
            type: serviceTitle.toLowerCase().includes('meeting') ? 'meeting' : 
                  serviceTitle.toLowerCase().includes('sports') ? 'sports' : 'event'
          };
        });
        
        // Add pre-existing mock data for demonstration purposes
        const defaultAppointments = [
          {
            id: 'appt-1',
            title: 'Conference Room A - Corporate Meeting',
            customer: 'John Smith',
            date: '2025-03-03',
            startTime: '10:00',
            endTime: '11:30',
            status: 'confirmed',
            type: 'meeting'
          },
          {
            id: 'appt-2',
            title: 'Lakeside Pavilion - Birthday Party',
            customer: 'Mary Johnson',
            date: '2025-03-03',
            startTime: '13:30',
            endTime: '17:00',
            status: 'confirmed',
            type: 'event'
          },
          {
            id: 'appt-3',
            title: 'Sports Field 2 - Soccer Practice',
            customer: 'David Williams',
            date: '2025-03-03',
            startTime: '15:45',
            endTime: '17:30',
            status: 'pending',
            type: 'sports'
          },
          {
            id: 'appt-4',
            title: 'Exhibition Hall - Art Show',
            customer: 'Sarah Miller',
            date: '2025-03-04',
            startTime: '09:15',
            endTime: '16:15',
            status: 'confirmed',
            type: 'event'
          },
          {
            id: 'appt-5',
            title: 'Auditorium - Community Forum',
            customer: 'Michael Brown',
            date: '2025-03-04',
            startTime: '11:00',
            endTime: '12:30',
            status: 'confirmed',
            type: 'meeting'
          },
          {
            id: 'appt-6',
            title: 'Waterway Section A - Boat Race',
            customer: 'Jennifer Taylor',
            date: '2025-03-05',
            startTime: '14:00',
            endTime: '17:30',
            status: 'confirmed',
            type: 'event'
          },
          {
            id: 'appt-7',
            title: 'Meeting Room B - Workshop',
            customer: 'Robert Wilson',
            date: '2025-03-07',
            startTime: '16:00',
            endTime: '17:00',
            status: 'confirmed',
            type: 'meeting'
          },
          {
            id: 'appt-8',
            title: 'Community Center - Fundraiser',
            customer: 'Emily Davis',
            date: '2025-03-10',
            startTime: '13:00',
            endTime: '19:30',
            status: 'confirmed',
            type: 'event'
          }
        ];
        
        // Combine existing mock data with new appointments
        setAppointments([...defaultAppointments, ...formattedAppointments]);
        
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Fallback to existing mock data if API fails
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Format date
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  // Render the calendar grid
  const renderCalendar = () => {
    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get the name of the current month
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    
    // Create calendar days
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day different-month"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(currentYear, currentMonth, day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = day === today.getDate() && 
                       currentMonth === today.getMonth() && 
                       currentYear === today.getFullYear();
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="calendar-day-number">{day}</div>
          
          {dayAppointments.map(appointment => {
            let eventClass = 'calendar-event-primary';
            
            if (appointment.type === 'meeting') {
              eventClass = 'calendar-event-success';
            } else if (appointment.type === 'sports') {
              eventClass = 'calendar-event-warning';
            } else if (appointment.type === 'event') {
              eventClass = 'calendar-event-primary';
            } else if (appointment.status === 'pending') {
              eventClass = 'calendar-event-warning';
            } else if (appointment.status === 'cancelled') {
              eventClass = 'calendar-event-danger';
            }
            
            return (
              <div 
                key={appointment.id} 
                className={`calendar-event ${eventClass}`}
                onClick={() => window.location.href = `/appointments/${appointment.id}`}
              >
                {appointment.startTime} - {appointment.title}
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-title">{monthName} {currentYear}</div>
          <div className="calendar-controls">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => prevMonth()}
            >
              Previous
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setCurrentMonth(today.getMonth())}
              style={{ margin: '0 10px' }}
            >
              Today
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => nextMonth()}
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="calendar-grid">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {/* Calendar days */}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule Calendar</h1>
          <p className="page-description">
            View and manage your upcoming venue bookings
          </p>
        </div>
        
        <div className="header-actions">
          <Link to="/bookings/new" className="btn btn-primary">
            <span className="btn-icon">➕</span>
            New Booking
          </Link>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <div className="calendar-view-options">
            <button 
              className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('week')}
              style={{ margin: '0 10px' }}
            >
              Week
            </button>
            <button 
              className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('day')}
            >
              Day
            </button>
          </div>
        </div>
        
        <div className="card-body" style={{ padding: 0 }}>
          {renderCalendar()}
        </div>
      </div>
      
      <div className="grid grid-2 mt-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Today's Bookings</h2>
          </div>
          
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getAppointmentsForDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate())).length > 0 ? (
                    getAppointmentsForDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate()))
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(appointment => (
                        <tr key={appointment.id}>
                          <td>{appointment.startTime}</td>
                          <td>{appointment.customer}</td>
                          <td>{appointment.title.split(' - ')[0]}</td>
                          <td>
                            <span className={`badge badge-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No bookings scheduled for today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Bookings</h2>
          </div>
          
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Service</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter(appointment => new Date(`${appointment.date}T${appointment.startTime}`) > new Date())
                    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
                    .slice(0, 5)
                    .map(appointment => (
                      <tr key={appointment.id}>
                        <td>
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td>{appointment.startTime}</td>
                        <td>{appointment.customer}</td>
                        <td>{appointment.title.split(' - ')[0]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;