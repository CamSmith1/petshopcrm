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

// Page Components - Bookings
import AppointmentsList from './pages/AppointmentsList';
import AppointmentDetail from './pages/AppointmentDetail';
import AppointmentForm from './pages/AppointmentForm';
import RecurringAppointments from './pages/RecurringAppointments';

// Page Components - Customers
import CustomersList from './pages/CustomersList';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';

// Page Components - Venues
import ManageVenues from './pages/ManageVenues';
import VenueForm from './pages/VenueForm';
import VenueLayouts from './pages/VenueLayouts';
import VenuePricing from './pages/VenuePricing';
import VenueEquipment from './pages/VenueEquipment';
import VenueBonds from './pages/VenueBonds';
import VenueImages from './pages/VenueImages';

// Booking Page Components
import BookingPageSetup from './pages/BookingPageSetup';
import BookingPage from './pages/BookingPage';

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
import './styles/venue-management.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Always false now - sidebar not collapsible
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('business'); // business, admin, client
  const location = useLocation();
  
  // Check if current route is auth related or booking page
  const isAuthRoute = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
  const isBookingRoute = location.pathname === '/booking'; // Only the standalone booking page
  
  // Toggle sidebar - now disabled as per requirements
  const toggleSidebar = () => {
    // No longer collapsible, keeping function for compatibility
    setIsSidebarCollapsed(false);
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
    // In development mode, set authenticated by default
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Set as authenticated with business role in development
      setIsAuthenticated(true);
      setUserRole('business');
      console.log('Development mode: Authentication bypassed');
    } else {
      // Normal authentication flow for production
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
    }
  }, []);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  // Force development mode for now to fix navigation issues
  const forceDevMode = true;

  // Main application UI with auth flow and responsive design
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <div className="business-portal">
            <ToastContainer position="top-right" autoClose={3000} />
            
            {/* Show sidebar for authenticated users or in development mode, but never on booking page */}
            {(!isAuthRoute && !isBookingRoute && (isAuthenticated || isDevelopment || forceDevMode)) && (
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
            
            <div className={`main-container ${isSidebarCollapsed ? 'expanded' : ''} ${isAuthRoute || isBookingRoute ? 'auth-page' : ''}`}>
              {/* Show navigation for authenticated users or in development mode, but never on booking page */}
              {(!isAuthRoute && !isBookingRoute && (isAuthenticated || isDevelopment || forceDevMode)) && (
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
                  
                  {/* Booking Routes */}
                  <Route path="/bookings" element={
                    <ProtectedRoute>
                      <AppointmentsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings/new" element={
                    <ProtectedRoute>
                      <AppointmentForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings/:bookingId/edit" element={
                    <ProtectedRoute>
                      <AppointmentForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings/:bookingId" element={
                    <ProtectedRoute>
                      <AppointmentDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/recurring-bookings" element={
                    <ProtectedRoute>
                      <RecurringAppointments />
                    </ProtectedRoute>
                  } />
                  
                  {/* Legacy routes for compatibility */}
                  <Route path="/appointments" element={<Navigate to="/bookings" />} />
                  <Route path="/appointments/new" element={<Navigate to="/bookings/new" />} />
                  <Route path="/appointments/:appointmentId" element={<Navigate to={(params) => `/bookings/${params.appointmentId}`} />} />
                  
                  {/* Customer Routes */}
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <CustomersList />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers/add" element={
                    <ProtectedRoute>
                      <CustomerForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers/:customerId/edit" element={
                    <ProtectedRoute>
                      <CustomerForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers/:customerId" element={
                    <ProtectedRoute>
                      <CustomerDetail />
                    </ProtectedRoute>
                  } />
                  
                  {/* Venue Management Routes */}
                  <Route path="/manage-venues" element={<ManageVenues />} />
                  <Route path="/manage-venues/create" element={<VenueForm />} />
                  <Route path="/manage-venues/edit/:id" element={<VenueForm />} />
                  <Route path="/manage-venues/:id/layouts" element={<VenueLayouts />} />
                  <Route path="/manage-venues/:id/pricing" element={<VenuePricing />} />
                  <Route path="/manage-venues/:id/equipment" element={<VenueEquipment />} />
                  <Route path="/manage-venues/:id/bonds" element={<VenueBonds />} />
                  <Route path="/manage-venues/:id/images" element={<VenueImages />} />
                  
                  {/* Booking Page Routes */}
                  <Route path="/booking-page-setup" element={
                    <ProtectedRoute>
                      <BookingPageSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/booking" element={<BookingPage standalone={true} />} />
                  
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
              
              {!isAuthRoute && !isBookingRoute && isAuthenticated && <Footer />}
            </div>
          </div>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;