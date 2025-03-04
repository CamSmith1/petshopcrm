import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import MobileMenu from './components/layout/MobileMenu';

// Auth and Context Providers
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components - Dashboard
import BusinessDashboard from './pages/BusinessDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import RevenueTracking from './pages/RevenueTracking';

// Page Components - Scheduling
import ScheduleCalendar from './pages/ScheduleCalendar';
import StaffScheduling from './pages/StaffScheduling';
import HolidayManagement from './pages/HolidayManagement';

// Page Components - Appointments
import AppointmentsList from './pages/AppointmentsList';
import AppointmentDetail from './pages/AppointmentDetail';
import RecurringAppointments from './pages/RecurringAppointments';

// Page Components - Customers
import CustomersList from './pages/CustomersList';
import CustomerDetail from './pages/CustomerDetail';
import PetsList from './pages/PetsList';
import PetDetail from './pages/PetDetail';

// Page Components - Services
import ServicesList from './pages/ServicesList';
import ServiceDetail from './pages/ServiceDetail';
import ServiceCategories from './pages/ServiceCategories';
import ServiceTemplates from './pages/ServiceTemplates';
import CustomFields from './pages/CustomFields';

// Page Components - Integration
import WidgetIntegration from './pages/WidgetIntegration';
import WidgetPreview from './pages/WidgetPreview';
import APIIntegration from './pages/APIIntegration';
import WebhooksManagement from './pages/WebhooksManagement';

// Page Components - Settings
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import BusinessProfile from './pages/BusinessProfile';
import StaffManagement from './pages/StaffManagement';
import LocationManagement from './pages/LocationManagement';
import Notifications from './pages/Notifications';

// Page Components - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import BusinessManagement from './pages/admin/BusinessManagement';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import WhiteLabelSettings from './pages/admin/WhiteLabelSettings';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Error Pages
import NotFound from './pages/NotFound';

// Styles
import './styles/business-portal.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('business'); // business, admin, client
  const location = useLocation();
  
  // Check if current route is auth related
  const isAuthRoute = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Check for Supabase session and listen for changes
  useEffect(() => {
    import('./services/supabaseClient').then(({ default: supabase }) => {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          // Get user role from metadata
          const role = session.user.user_metadata?.role || 'business';
          setUserRole(role);
        }
      });
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
          if (session?.user) {
            // Get user role from metadata
            const role = session.user.user_metadata?.role || 'business';
            setUserRole(role);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    });
  }, []);

  // Main application UI with auth flow and responsive design
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <div className="business-portal">
            <ToastContainer position="top-right" autoClose={3000} />
            
            {!isAuthRoute && isAuthenticated && (
              <>
                <Sidebar 
                  collapsed={isSidebarCollapsed} 
                  userRole={userRole}
                />
                
                <MobileMenu 
                  isOpen={isMobileMenuOpen} 
                  onClose={toggleMobileMenu}
                  userRole={userRole}
                />
              </>
            )}
            
            <div className={`main-container ${isSidebarCollapsed ? 'expanded' : ''} ${isAuthRoute ? 'auth-page' : ''}`}>
              {!isAuthRoute && isAuthenticated && (
                <TopNav 
                  toggleSidebar={toggleSidebar} 
                  toggleMobileMenu={toggleMobileMenu}
                  userRole={userRole}
                />
              )}
              
              <div className="content-container">
                <Routes>
                  {/* Redirect root to appropriate dashboard based on role */}
                  <Route 
                    path="/" 
                    element={
                      <Navigate 
                        to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                      />
                    } 
                  />
                  
                  {/* Auth Routes - Public */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Business Routes - Protected */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/revenue" element={
                    <ProtectedRoute>
                      <RevenueTracking />
                    </ProtectedRoute>
                  } />
                  
                  {/* Calendar & Scheduling Routes */}
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <ScheduleCalendar />
                    </ProtectedRoute>
                  } />
                  <Route path="/staff-scheduling" element={
                    <ProtectedRoute>
                      <StaffScheduling />
                    </ProtectedRoute>
                  } />
                  <Route path="/holidays" element={
                    <ProtectedRoute>
                      <HolidayManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Appointment Routes */}
                  <Route path="/appointments" element={
                    <ProtectedRoute>
                      <AppointmentsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/appointments/:appointmentId" element={
                    <ProtectedRoute>
                      <AppointmentDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/recurring-appointments" element={
                    <ProtectedRoute>
                      <RecurringAppointments />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Routes */}
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <CustomersList />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers/:customerId" element={
                    <ProtectedRoute>
                      <CustomerDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/pets" element={
                    <ProtectedRoute>
                      <PetsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/pets/:petId" element={
                    <ProtectedRoute>
                      <PetDetail />
                    </ProtectedRoute>
                  } />
                  
                  {/* Service Management Routes */}
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <ServicesList />
                    </ProtectedRoute>
                  } />
                  <Route path="/services/:serviceId" element={
                    <ProtectedRoute>
                      <ServiceDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/service-categories" element={
                    <ProtectedRoute>
                      <ServiceCategories />
                    </ProtectedRoute>
                  } />
                  <Route path="/service-templates" element={
                    <ProtectedRoute>
                      <ServiceTemplates />
                    </ProtectedRoute>
                  } />
                  <Route path="/custom-fields" element={
                    <ProtectedRoute>
                      <CustomFields />
                    </ProtectedRoute>
                  } />
                  
                  {/* Integration Routes */}
                  <Route path="/widget-integration" element={
                    <ProtectedRoute>
                      <WidgetIntegration />
                    </ProtectedRoute>
                  } />
                  <Route path="/widget-preview" element={
                    <ProtectedRoute>
                      <WidgetPreview />
                    </ProtectedRoute>
                  } />
                  <Route path="/api-access" element={
                    <ProtectedRoute>
                      <APIIntegration />
                    </ProtectedRoute>
                  } />
                  <Route path="/webhooks" element={
                    <ProtectedRoute>
                      <WebhooksManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/business-profile" element={
                    <ProtectedRoute>
                      <BusinessProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/staff" element={
                    <ProtectedRoute>
                      <StaffManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/locations" element={
                    <ProtectedRoute>
                      <LocationManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes - Protected with Admin Role */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/businesses" element={
                    <ProtectedRoute requiredRole="admin">
                      <BusinessManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/subscriptions" element={
                    <ProtectedRoute requiredRole="admin">
                      <SubscriptionManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/white-label" element={
                    <ProtectedRoute requiredRole="admin">
                      <WhiteLabelSettings />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              
              {!isAuthRoute && isAuthenticated && <Footer />}
            </div>
          </div>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;