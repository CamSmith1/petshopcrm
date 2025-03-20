import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Set token in request headers
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Remove token from request headers
const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        // If token is expired or invalid, and not a demo token, remove it
        const token = localStorage.getItem('token');
        if (token && !token.startsWith('mock-bypass-token-')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      
      // Log detailed error information
      console.error('API Error:', {
        status,
        message: data.error || 'An error occurred',
        url: error.config.url,
        method: error.config.method,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service with methods for common operations
export default {
  // Set auth token
  setAuthToken,
  removeAuthToken,
  
  // Auth endpoints
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
  
  // User endpoints
  getUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Venue endpoints
  getVenues: (params) => {
    // In development mode, return mock venues if requested
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        data: {
          venues: [
            {
              id: '1',
              name: 'Community Hall',
              category: 'hall',
              description: 'Large community hall ideal for events, conferences, and gatherings up to 200 people.',
              address: {
                street: '123 Main St',
                city: 'Townsville',
                state: 'TS',
                zipCode: '12345',
                country: 'USA'
              },
              maxCapacity: 200,
              amenities: ['WiFi', 'AV Equipment', 'Kitchen', 'Parking', 'Accessible Entrance'],
              accessibilityFeatures: ['Wheelchair Access', 'Hearing Loop', 'Accessible Restrooms'],
              layouts: [
                { id: '101', name: 'Theater', capacity: 200 },
                { id: '102', name: 'Banquet', capacity: 150 },
                { id: '103', name: 'Classroom', capacity: 100 }
              ],
              pricing: {
                standard: { amount: 150, unit: 'hour' },
                commercial: { amount: 200, unit: 'hour' },
                community: { amount: 100, unit: 'hour' }
              },
              isPaused: false,
              images: [
                { url: 'https://example.com/venue1_1.jpg', isPrimary: true },
                { url: 'https://example.com/venue1_2.jpg' }
              ],
              ratings: {
                average: 4.8,
                count: 25
              },
              bookings: {
                total: 42,
                upcoming: 3
              }
            },
            {
              id: '2',
              name: 'Conference Room A',
              category: 'meeting',
              description: 'Modern conference room with high-speed internet and video conferencing capabilities.',
              address: {
                street: '456 Business Ave',
                city: 'Metropolis',
                state: 'MP',
                zipCode: '67890',
                country: 'USA'
              },
              maxCapacity: 30,
              amenities: ['WiFi', 'Video Conferencing', 'Whiteboard', 'Coffee Service'],
              accessibilityFeatures: ['Wheelchair Access', 'Accessible Restrooms'],
              layouts: [
                { id: '201', name: 'Boardroom', capacity: 20 },
                { id: '202', name: 'U-Shape', capacity: 16 }
              ],
              pricing: {
                standard: { amount: 75, unit: 'hour' },
                commercial: { amount: 100, unit: 'hour' },
                community: { amount: 50, unit: 'hour' }
              },
              isPaused: false,
              images: [
                { url: 'https://example.com/venue2_1.jpg', isPrimary: true }
              ],
              ratings: {
                average: 4.6,
                count: 18
              },
              bookings: {
                total: 35,
                upcoming: 2
              }
            },
            {
              id: '3',
              name: 'Banquet Hall',
              category: 'banquet',
              description: 'Elegant banquet hall perfect for weddings, parties, and formal events.',
              address: {
                street: '789 Celebration Blvd',
                city: 'Festivity',
                state: 'FT',
                zipCode: '45678',
                country: 'USA'
              },
              maxCapacity: 150,
              amenities: ['Dance Floor', 'Sound System', 'Kitchen', 'Bar Area', 'Coat Check'],
              accessibilityFeatures: ['Wheelchair Access', 'Accessible Parking', 'Accessible Restrooms'],
              layouts: [
                { id: '301', name: 'Banquet', capacity: 150 },
                { id: '302', name: 'Reception', capacity: 200 }
              ],
              pricing: {
                standard: { amount: 2000, unit: 'day' },
                commercial: { amount: 2500, unit: 'day' },
                community: { amount: 1500, unit: 'day' }
              },
              isPaused: true,
              images: [
                { url: 'https://example.com/venue3_1.jpg', isPrimary: true },
                { url: 'https://example.com/venue3_2.jpg' }
              ],
              ratings: {
                average: 4.7,
                count: 15
              },
              bookings: {
                total: 120,
                upcoming: 0
              }
            }
          ]
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get('/venues', { params });
  },
  getVenue: (id) => api.get(`/venues/${id}`),
  createVenue: (venueData) => api.post('/venues', venueData),
  updateVenue: (id, venueData) => api.put(`/venues/${id}`, venueData),
  deleteVenue: (id) => api.delete(`/venues/${id}`),
  
  // Venue layouts
  getVenueLayouts: (venueId) => api.get(`/venues/${venueId}/layouts`),
  getVenueLayout: (venueId, layoutId) => api.get(`/venues/${venueId}/layouts/${layoutId}`),
  createVenueLayout: (venueId, layoutData) => api.post(`/venues/${venueId}/layouts`, layoutData),
  updateVenueLayout: (venueId, layoutId, layoutData) => api.put(`/venues/${venueId}/layouts/${layoutId}`, layoutData),
  deleteVenueLayout: (venueId, layoutId) => api.delete(`/venues/${venueId}/layouts/${layoutId}`),
  
  // Venue equipment
  getVenueEquipment: (venueId) => api.get(`/venues/${venueId}/equipment`),
  getVenueEquipmentItem: (venueId, equipmentId) => api.get(`/venues/${venueId}/equipment/${equipmentId}`),
  createVenueEquipment: (venueId, equipmentData) => api.post(`/venues/${venueId}/equipment`, equipmentData),
  updateVenueEquipment: (venueId, equipmentId, equipmentData) => api.put(`/venues/${venueId}/equipment/${equipmentId}`, equipmentData),
  deleteVenueEquipment: (venueId, equipmentId) => api.delete(`/venues/${venueId}/equipment/${equipmentId}`),
  
  // Venue bonds
  getVenueBonds: (venueId) => api.get(`/venues/${venueId}/bonds`),
  getVenueBond: (venueId, bondId) => api.get(`/venues/${venueId}/bonds/${bondId}`),
  createVenueBond: (venueId, bondData) => api.post(`/venues/${venueId}/bonds`, bondData),
  updateVenueBond: (venueId, bondId, bondData) => api.put(`/venues/${venueId}/bonds/${bondId}`, bondData),
  deleteVenueBond: (venueId, bondId) => api.delete(`/venues/${venueId}/bonds/${bondId}`),
  
  // Venue availability
  getVenueAvailability: (venueId, params) => api.get(`/venues/${venueId}/availability`, { params }),
  createVenueAvailability: (venueId, availabilityData) => api.post(`/venues/${venueId}/availability`, availabilityData),
  updateVenueAvailability: (venueId, availabilityId, availabilityData) => api.put(`/venues/${venueId}/availability/${availabilityId}`, availabilityData),
  deleteVenueAvailability: (venueId, availabilityId) => api.delete(`/venues/${venueId}/availability/${availabilityId}`),
  
  // Venue images
  getVenueImages: (venueId) => api.get(`/venues/${venueId}/images`),
  uploadVenueImage: (venueId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData.file);
    if (imageData.description) formData.append('description', imageData.description);
    if (imageData.isPrimary !== undefined) formData.append('is_primary', imageData.isPrimary);
    
    return api.post(`/venues/${venueId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateVenueImage: (venueId, imageId, imageData) => api.put(`/venues/${venueId}/images/${imageId}`, imageData),
  deleteVenueImage: (venueId, imageId) => api.delete(`/venues/${venueId}/images/${imageId}`),
  setPrimaryVenueImage: (venueId, imageId) => api.put(`/venues/${venueId}/images/${imageId}/set-primary`),
  
  // Booking endpoints
  getBookings: (params) => {
    // In development mode, return mock bookings from localStorage
    if (process.env.NODE_ENV === 'development') {
      const storedBookings = localStorage.getItem('mockBookings');
      let bookings = storedBookings ? JSON.parse(storedBookings) : [];
      
      // Filter bookings based on params if they exist
      if (params) {
        if (params.status) {
          const statusArray = Array.isArray(params.status) ? params.status : [params.status];
          bookings = bookings.filter(booking => statusArray.includes(booking.status));
        }
        
        if (params.startDate) {
          const startDate = new Date(params.startDate);
          bookings = bookings.filter(booking => new Date(booking.startTime) >= startDate);
        }
        
        if (params.endDate) {
          const endDate = new Date(params.endDate);
          bookings = bookings.filter(booking => new Date(booking.startTime) <= endDate);
        }
      }
      
      return Promise.resolve({
        data: {
          bookings: bookings
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get('/bookings', { params });
  },
  getBooking: (id) => {
    // In development mode, return mock booking from localStorage
    if (process.env.NODE_ENV === 'development') {
      const storedBookings = localStorage.getItem('mockBookings');
      let bookings = storedBookings ? JSON.parse(storedBookings) : [];
      const booking = bookings.find(b => b._id === id);
      
      if (booking) {
        return Promise.resolve({
          data: {
            booking: booking
          }
        });
      }
      
      // If booking not found in localStorage and it's the mock data, return that
      if (id === 'service1' || id === 'service2') {
        // This is a fallback for mock services
        return Promise.resolve({
          data: {
            booking: {
              _id: id,
              title: id === 'service1' ? 'Basic Dog Grooming' : 'Deluxe Dog Grooming',
              status: 'confirmed',
              startTime: new Date().toISOString(),
              endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString()
            }
          }
        });
      }
      
      // Return a 404 error
      return Promise.reject({
        response: {
          status: 404,
          data: { error: 'Booking not found' }
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get(`/bookings/${id}`);
  },
  createBooking: (bookingData) => {
    // In development mode, update mock data and modify local state
    if (process.env.NODE_ENV === 'development') {
      const mockBookingId = 'booking-' + Math.random().toString(36).substring(2, 9);
      
      // Create a mock booking that will be visible in the UI
      const mockBooking = {
        _id: mockBookingId,
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      // If localStorage has bookings, update it
      const storedBookings = localStorage.getItem('mockBookings');
      let bookings = storedBookings ? JSON.parse(storedBookings) : [];
      bookings.push(mockBooking);
      localStorage.setItem('mockBookings', JSON.stringify(bookings));
      
      return Promise.resolve({
        data: {
          booking: mockBooking
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.post('/bookings', bookingData);
  },
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancelBooking: (id, reason) => 
    api.put(`/bookings/${id}/cancel`, { reason }),
  completeBooking: (id) => api.put(`/bookings/${id}/complete`),
  
  // Payment endpoints
  createPaymentIntent: (bookingId) => 
    api.post('/payments/create-intent', { bookingId }),
  
  // Reviews
  createReview: (bookingId, reviewData) => 
    api.post(`/bookings/${bookingId}/review`, reviewData),
    
  // Customer endpoints
  getCustomers: (params) => {
    // In development mode, return mock customer data
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        data: {
          customers: [
            {
              id: 'cust1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '(555) 123-4567',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip_code: '90210',
              country: 'USA',
              total_spent: 210.50,
              last_booking_date: '2025-02-28',
              status: 'active'
            },
            {
              id: 'cust2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              phone: '(555) 987-6543',
              street: '456 Oak Ave',
              city: 'Somewhere',
              state: 'NY',
              zip_code: '10001',
              country: 'USA',
              total_spent: 75.00,
              last_booking_date: '2025-03-01',
              status: 'active'
            },
            {
              id: 'cust3',
              name: 'Michael Brown',
              email: 'michael.brown@example.com',
              phone: '(555) 456-7890',
              street: '789 Pine St',
              city: 'Other City',
              state: 'TX',
              zip_code: '75001',
              country: 'USA',
              total_spent: 350.75,
              last_booking_date: '2025-02-15',
              status: 'active'
            }
          ]
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get('/customers', { params });
  },
  
  getCustomer: (id) => {
    // In development mode, return mock customer data
    if (process.env.NODE_ENV === 'development') {
      const mockCustomers = {
        'cust1': {
          id: 'cust1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip_code: '90210',
          country: 'USA',
          preferred_contact_method: 'email',
          preferred_appointment_day: 'Tuesday',
          preferred_appointment_time: 'afternoon',
          receive_marketing_emails: true,
          send_appointment_reminders: true,
          notes: 'Prefers afternoon appointments. Always pays promptly.'
        },
        'cust2': {
          id: 'cust2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 987-6543',
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zip_code: '10001',
          country: 'USA',
          preferred_contact_method: 'phone',
          preferred_appointment_day: 'Friday',
          preferred_appointment_time: 'morning',
          receive_marketing_emails: false,
          send_appointment_reminders: true,
          notes: 'Prefers morning appointments. Has a service dog.'
        },
        'cust3': {
          id: 'cust3',
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          phone: '(555) 456-7890',
          street: '789 Pine St',
          city: 'Other City',
          state: 'TX',
          zip_code: '75001',
          country: 'USA',
          preferred_contact_method: 'sms',
          preferred_appointment_day: 'Monday',
          preferred_appointment_time: 'evening',
          receive_marketing_emails: true,
          send_appointment_reminders: true,
          notes: 'Prefers evening appointments after work.'
        }
      };
      
      return Promise.resolve({
        data: {
          customer: mockCustomers[id] || null
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get(`/customers/${id}`);
  },
  
  createOrUpdateCustomer: (customerData) => {
    console.log('API service - Creating/updating customer:', customerData);
    
    // ALWAYS use the real API for customer creation
    console.log('Making POST request to /customers');
    try {
      return api.post('/customers', customerData);
    } catch (error) {
      console.error('Error in createOrUpdateCustomer:', error);
      throw error;
    }
  },
  
  updateCustomer: (id, customerData) => {
    // In development mode, return mock customer data
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        data: {
          customer: {
            id: id,
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            street: customerData.street,
            city: customerData.city,
            state: customerData.state,
            zip_code: customerData.zip_code,
            country: customerData.country,
            custom_fields: customerData.custom_fields
          }
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.put(`/customers/${id}`, customerData);
  },
  
  // Direct axios methods for custom requests
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};