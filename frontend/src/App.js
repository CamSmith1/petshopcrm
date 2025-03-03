import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';

// Page Components
import BusinessDashboard from './pages/BusinessDashboard';
import ScheduleCalendar from './pages/ScheduleCalendar';
import AppointmentsList from './pages/AppointmentsList';
import AppointmentDetail from './pages/AppointmentDetail';
import CustomersList from './pages/CustomersList';
import CustomerDetail from './pages/CustomerDetail';
import PetsList from './pages/PetsList';
import ServicesList from './pages/ServicesList';
import ServiceDetail from './pages/ServiceDetail';
import WidgetIntegration from './pages/WidgetIntegration';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import WidgetPreview from './pages/WidgetPreview';

// Styles
import './styles/business-portal.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Main application UI - no authentication required
  return (
    <div className="business-portal">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar collapsed={isSidebarCollapsed} />
      
      <div className={`main-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <TopNav toggleSidebar={toggleSidebar} />
        
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Business Routes */}
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/calendar" element={<ScheduleCalendar />} />
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/appointments/:appointmentId" element={<AppointmentDetail />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:customerId" element={<CustomerDetail />} />
            <Route path="/pets" element={<PetsList />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/widget-integration" element={<WidgetIntegration />} />
            <Route path="/widget-preview" element={<WidgetPreview />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;