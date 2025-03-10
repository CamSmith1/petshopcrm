import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Create context for business management
const BusinessContext = createContext();

// Custom hook to use the business context
export const useBusiness = () => {
  const context = useContext(BusinessContext);
  
  // For development mode, provide a mock business context if real context is not available
  if (process.env.NODE_ENV === 'development' && !context) {
    console.warn('Business context not found, using development fallback');
    return {
      // Business profile
      businessProfile: {
        id: 'dev-business-123',
        name: 'Development Business',
        email: 'dev-business@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Dev St',
          city: 'Development City',
          state: 'DS',
          zipCode: '12345',
          country: 'DevLand'
        },
        businessHours: {
          monday: { isOpen: true, start: '09:00', end: '17:00' },
          tuesday: { isOpen: true, start: '09:00', end: '17:00' },
          wednesday: { isOpen: true, start: '09:00', end: '17:00' },
          thursday: { isOpen: true, start: '09:00', end: '17:00' },
          friday: { isOpen: true, start: '09:00', end: '17:00' },
          saturday: { isOpen: false, start: '', end: '' },
          sunday: { isOpen: false, start: '', end: '' }
        },
      },
      updateBusinessProfile: async () => ({ success: true }),
      
      // Mock service management
      services: [],
      fetchServices: async () => [],
      createService: async () => ({ success: true }),
      updateService: async () => ({ success: true }),
      deleteService: async () => ({ success: true }),
      
      // Mock service categories
      serviceCategories: [],
      fetchServiceCategories: async () => [],
      createServiceCategory: async () => ({ success: true }),
      
      // Mock staff management
      staff: [],
      fetchStaff: async () => [],
      
      // Mock customer management
      customers: [],
      fetchCustomers: async () => ({ customers: [], total: 0, pages: 0 }),
      
      // Mock appointment management
      appointments: [],
      fetchAppointments: async () => ({ appointments: [], total: 0, pages: 0 }),
      
      // Mock widget integration
      getWidgetSettings: async () => ({ success: true, settings: {} }),
      updateWidgetSettings: async () => ({ success: true }),
      
      // Loading and error states
      businessLoading: false,
      businessError: null
    };
  }
  
  return context;
};

// Provider component
export const BusinessProvider = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // Business state
  const [businessProfile, setBusinessProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState(null);
  
  // Fetch business profile on authentication
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      try {
        setBusinessLoading(true);
        setBusinessError(null);
        
        const response = await api.get('/business/profile');
        
        if (response.data && response.data.business) {
          setBusinessProfile(response.data.business);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
        setBusinessError('Failed to load business profile');
      } finally {
        setBusinessLoading(false);
      }
    };
    
    fetchBusinessProfile();
  }, [isAuthenticated, currentUser]);
  
  // Service management
  const fetchServices = async (options = {}) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.category) queryParams.append('category', options.category);
      if (options.active !== undefined) queryParams.append('active', options.active);
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.limit) queryParams.append('limit', options.limit);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`/services${query}`);
      
      if (response.data && response.data.services) {
        setServices(response.data.services);
        return response.data.services;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching services:', error);
      setBusinessError('Failed to load services');
      return [];
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const createService = async (serviceData) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.post('/services', serviceData);
      
      if (response.data && response.data.service) {
        // Update services list
        setServices(prevServices => [...prevServices, response.data.service]);
        return { success: true, service: response.data.service };
      }
      
      return { success: false, error: 'Failed to create service' };
    } catch (error) {
      console.error('Error creating service:', error);
      setBusinessError(error.response?.data?.message || 'Failed to create service');
      return { success: false, error: error.response?.data?.message || 'Failed to create service' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const updateService = async (serviceId, serviceData) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.put(`/services/${serviceId}`, serviceData);
      
      if (response.data && response.data.service) {
        // Update services list
        setServices(prevServices => 
          prevServices.map(service => 
            service._id === serviceId ? response.data.service : service
          )
        );
        return { success: true, service: response.data.service };
      }
      
      return { success: false, error: 'Failed to update service' };
    } catch (error) {
      console.error('Error updating service:', error);
      setBusinessError(error.response?.data?.message || 'Failed to update service');
      return { success: false, error: error.response?.data?.message || 'Failed to update service' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const deleteService = async (serviceId) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      await api.delete(`/services/${serviceId}`);
      
      // Update services list
      setServices(prevServices => 
        prevServices.filter(service => service._id !== serviceId)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      setBusinessError(error.response?.data?.message || 'Failed to delete service');
      return { success: false, error: error.response?.data?.message || 'Failed to delete service' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Service category management
  const fetchServiceCategories = async () => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.get('/service-categories');
      
      if (response.data && response.data.categories) {
        setServiceCategories(response.data.categories);
        return response.data.categories;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      setBusinessError('Failed to load service categories');
      return [];
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const createServiceCategory = async (categoryData) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.post('/service-categories', categoryData);
      
      if (response.data && response.data.category) {
        // Update categories list
        setServiceCategories(prevCategories => [...prevCategories, response.data.category]);
        return { success: true, category: response.data.category };
      }
      
      return { success: false, error: 'Failed to create service category' };
    } catch (error) {
      console.error('Error creating service category:', error);
      setBusinessError(error.response?.data?.message || 'Failed to create service category');
      return { success: false, error: error.response?.data?.message || 'Failed to create service category' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Staff management
  const fetchStaff = async () => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.get('/staff');
      
      if (response.data && response.data.staff) {
        setStaff(response.data.staff);
        return response.data.staff;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      setBusinessError('Failed to load staff');
      return [];
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Customer management
  const fetchCustomers = async (options = {}) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.search) queryParams.append('search', options.search);
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.page) queryParams.append('page', options.page);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`/customers${query}`);
      
      if (response.data && response.data.customers) {
        setCustomers(response.data.customers);
        return {
          customers: response.data.customers,
          total: response.data.total,
          pages: response.data.pages
        };
      }
      
      return { customers: [], total: 0, pages: 0 };
    } catch (error) {
      console.error('Error fetching customers:', error);
      setBusinessError('Failed to load customers');
      return { customers: [], total: 0, pages: 0 };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Appointment management
  const fetchAppointments = async (options = {}) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.startDate) queryParams.append('startDate', options.startDate);
      if (options.endDate) queryParams.append('endDate', options.endDate);
      if (options.status) queryParams.append('status', options.status);
      if (options.serviceId) queryParams.append('serviceId', options.serviceId);
      if (options.staffId) queryParams.append('staffId', options.staffId);
      if (options.customerId) queryParams.append('customerId', options.customerId);
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.page) queryParams.append('page', options.page);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await api.get(`/appointments${query}`);
      
      if (response.data && response.data.appointments) {
        setAppointments(response.data.appointments);
        return {
          appointments: response.data.appointments,
          total: response.data.total,
          pages: response.data.pages
        };
      }
      
      return { appointments: [], total: 0, pages: 0 };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setBusinessError('Failed to load appointments');
      return { appointments: [], total: 0, pages: 0 };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Business profile management
  const updateBusinessProfile = async (profileData) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.put('/business/profile', profileData);
      
      if (response.data && response.data.business) {
        setBusinessProfile(response.data.business);
        return { success: true, business: response.data.business };
      }
      
      return { success: false, error: 'Failed to update business profile' };
    } catch (error) {
      console.error('Error updating business profile:', error);
      setBusinessError(error.response?.data?.message || 'Failed to update business profile');
      return { success: false, error: error.response?.data?.message || 'Failed to update business profile' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  // Widget integration
  const getWidgetSettings = async () => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.get('/widget/settings');
      
      if (response.data && response.data.settings) {
        return { success: true, settings: response.data.settings };
      }
      
      return { success: false, error: 'Failed to get widget settings' };
    } catch (error) {
      console.error('Error getting widget settings:', error);
      setBusinessError(error.response?.data?.message || 'Failed to get widget settings');
      return { success: false, error: error.response?.data?.message || 'Failed to get widget settings' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const updateWidgetSettings = async (settingsData) => {
    try {
      setBusinessLoading(true);
      setBusinessError(null);
      
      const response = await api.put('/widget/settings', settingsData);
      
      if (response.data && response.data.settings) {
        return { success: true, settings: response.data.settings };
      }
      
      return { success: false, error: 'Failed to update widget settings' };
    } catch (error) {
      console.error('Error updating widget settings:', error);
      setBusinessError(error.response?.data?.message || 'Failed to update widget settings');
      return { success: false, error: error.response?.data?.message || 'Failed to update widget settings' };
    } finally {
      setBusinessLoading(false);
    }
  };
  
  return (
    <BusinessContext.Provider
      value={{
        // Business profile
        businessProfile,
        updateBusinessProfile,
        
        // Service management
        services,
        fetchServices,
        createService,
        updateService,
        deleteService,
        
        // Service categories
        serviceCategories,
        fetchServiceCategories,
        createServiceCategory,
        
        // Staff management
        staff,
        fetchStaff,
        
        // Customer management
        customers,
        fetchCustomers,
        
        // Appointment management
        appointments,
        fetchAppointments,
        
        // Widget integration
        getWidgetSettings,
        updateWidgetSettings,
        
        // Loading and error states
        businessLoading,
        businessError
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext;