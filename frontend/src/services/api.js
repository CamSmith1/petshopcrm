import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  
  // Pet endpoints
  getPets: () => api.get('/pets'),
  getPet: (id) => api.get(`/pets/${id}`),
  createPet: (petData) => api.post('/pets', petData),
  updatePet: (id, petData) => api.put(`/pets/${id}`, petData),
  deletePet: (id) => api.delete(`/pets/${id}`),
  
  // Service endpoints
  getServices: (params) => {
    // In development mode, return mock services if requested
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        data: {
          services: [
            {
              _id: 'service1',
              title: 'Basic Dog Grooming',
              description: 'Complete grooming service including bath, brush, nail trim, ear cleaning, and basic haircut.',
              category: 'Grooming',
              price: { amount: 45.00, currency: 'USD' },
              duration: 60,
              location_options: ['In-store'],
              capacity: 1
            },
            {
              _id: 'service2',
              title: 'Deluxe Dog Grooming',
              description: 'Premium grooming package with specialized shampoo, conditioner, teeth brushing, and styled haircut.',
              category: 'Grooming',
              price: { amount: 65.00, currency: 'USD' },
              duration: 90,
              location_options: ['In-store'],
              capacity: 1
            },
            {
              _id: 'service3',
              title: 'Dog Walking - 30 min',
              description: 'A 30-minute walk for your dog with personalized attention and exercise.',
              category: 'Exercise',
              price: { amount: 25.00, currency: 'USD' },
              duration: 30,
              location_options: ['Home visit'],
              capacity: 3
            },
            {
              _id: 'service4',
              title: 'Dog Training Session',
              description: 'One-hour training session focusing on basic commands, leash training, and behavior correction.',
              category: 'Training',
              price: { amount: 75.00, currency: 'USD' },
              duration: 60,
              location_options: ['In-store', 'Home visit'],
              capacity: 1
            },
            {
              _id: 'service5',
              title: 'Nail Trim',
              description: 'Quick and stress-free nail trimming service for your dog.',
              category: 'Grooming',
              price: { amount: 15.00, currency: 'USD' },
              duration: 15,
              location_options: ['In-store'],
              capacity: 1
            },
            {
              _id: 'service6',
              title: 'Teeth Cleaning',
              description: "Professional teeth cleaning to maintain your dog's dental health and fresh breath.",
              category: 'Health',
              price: { amount: 40.00, currency: 'USD' },
              duration: 30,
              location_options: ['In-store'],
              capacity: 1
            }
          ]
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.get('/services', { params });
  },
  getService: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
  
  // Booking endpoints
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => {
    // In development mode, return mock booking confirmation
    if (process.env.NODE_ENV === 'development') {
      const mockBookingId = 'booking-' + Math.random().toString(36).substring(2, 9);
      return Promise.resolve({
        data: {
          booking: {
            _id: mockBookingId,
            ...bookingData,
            status: 'confirmed',
            createdAt: new Date().toISOString()
          }
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
  createOrUpdateCustomer: (customerData) => {
    // In development mode, return mock customer data
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        data: {
          customer: {
            _id: 'mock-customer-id',
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone
          }
        }
      });
    }
    
    // Otherwise, make the actual API call
    return api.post('/customers', customerData);
  },
  
  // Direct axios methods for custom requests
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};