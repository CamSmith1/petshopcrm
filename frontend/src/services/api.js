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
        // If token is expired or invalid, remove it from local storage
        if (localStorage.getItem('token')) {
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
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
  
  // Booking endpoints
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
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
  
  // Direct axios methods for custom requests
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
};