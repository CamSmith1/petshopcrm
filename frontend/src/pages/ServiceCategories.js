import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { toast } from 'react-toastify';

// Components
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

/**
 * Service Categories Management page
 * Allows creating, editing, and deleting service categories
 */
const ServiceCategories = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#2563eb',
    isActive: true
  });
  
  // Context
  const { 
    fetchServiceCategories, 
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    businessLoading 
  } = useBusiness();
  
  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await fetchServiceCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast.error('Failed to load service categories');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, [fetchServiceCategories]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#2563eb',
      isActive: true
    });
    setShowCreateModal(true);
  };
  
  // Open edit modal
  const handleOpenEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#2563eb',
      isActive: category.isActive === undefined ? true : category.isActive
    });
    setShowEditModal(true);
  };
  
  // Open delete modal
  const handleOpenDeleteModal = (category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };
  
  // Create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createServiceCategory(formData);
      
      if (result.success) {
        toast.success('Service category created successfully');
        setShowCreateModal(false);
        setCategories([...categories, result.category]);
      } else {
        toast.error(result.error || 'Failed to create service category');
      }
    } catch (error) {
      toast.error('An error occurred while creating the category');
    }
  };
  
  // Update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateServiceCategory(currentCategory._id, formData);
      
      if (result.success) {
        toast.success('Service category updated successfully');
        setShowEditModal(false);
        
        // Update categories list
        setCategories(
          categories.map(cat => 
            cat._id === currentCategory._id ? result.category : cat
          )
        );
      } else {
        toast.error(result.error || 'Failed to update service category');
      }
    } catch (error) {
      toast.error('An error occurred while updating the category');
    }
  };
  
  // Delete category
  const handleDeleteCategory = async () => {
    try {
      const result = await deleteServiceCategory(currentCategory._id);
      
      if (result.success) {
        toast.success('Service category deleted successfully');
        setShowDeleteModal(false);
        
        // Update categories list
        setCategories(
          categories.filter(cat => cat._id !== currentCategory._id)
        );
      } else {
        toast.error(result.error || 'Failed to delete service category');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the category');
    }
  };
  
  // Get icon display
  const getIconDisplay = (iconName) => {
    const commonIcons = {
      'grooming': '✂️',
      'training': '🦮',
      'daycare': '🐕',
      'boarding': '🏠',
      'walking': '🚶‍♂️',
      'veterinary': '🩺',
      'consultation': '💬',
      'other': '📦'
    };
    
    return commonIcons[iconName] || iconName || '📦';
  };
  
  // If loading
  if (isLoading || businessLoading) {
    return <LoadingSpinner text="Loading service categories..." />;
  }
  
  return (
    <div className="service-categories-page">
      <PageHeader 
        title="Service Categories" 
        description="Organize your services into categories for easier management and discovery."
        actionButton={
          <Button 
            primary 
            onClick={handleOpenCreateModal}
            leftIcon="+"
          >
            New Category
          </Button>
        }
      />
      
      {categories.length === 0 ? (
        <EmptyState
          title="No Categories Yet"
          description="Create your first service category to organize your services."
          actionButton={
            <Button primary onClick={handleOpenCreateModal}>
              Create Category
            </Button>
          }
          icon="🗂️"
        />
      ) : (
        <div className="category-cards-grid">
          {categories.map(category => (
            <Card key={category._id} className="category-card">
              <div className="category-header">
                <div 
                  className="category-icon" 
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color
                  }}
                >
                  {getIconDisplay(category.icon)}
                </div>
                <div className="category-status">
                  {category.isActive !== false ? (
                    <span className="status-badge active">Active</span>
                  ) : (
                    <span className="status-badge inactive">Inactive</span>
                  )}
                </div>
              </div>
              
              <h3 className="category-name">{category.name}</h3>
              
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              
              <div className="category-meta">
                <span>
                  {category.serviceCount || 0} service{category.serviceCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="category-actions">
                <Button 
                  small
                  to={`/services?category=${category._id}`}
                >
                  View Services
                </Button>
                <Button 
                  small 
                  secondary
                  onClick={() => handleOpenEditModal(category)}
                >
                  Edit
                </Button>
                <Button 
                  small 
                  danger
                  onClick={() => handleOpenDeleteModal(category)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Category Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Service Category"
      >
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Grooming, Training, Boarding"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the category (optional)"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon">Icon</label>
              <select
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
              >
                <option value="">Select an icon</option>
                <option value="grooming">Grooming (✂️)</option>
                <option value="training">Training (🦮)</option>
                <option value="daycare">Daycare (🐕)</option>
                <option value="boarding">Boarding (🏠)</option>
                <option value="walking">Walking (🚶‍♂️)</option>
                <option value="veterinary">Veterinary (🩺)</option>
                <option value="consultation">Consultation (💬)</option>
                <option value="other">Other (📦)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active
            </label>
            <span className="checkbox-help">Inactive categories won't appear in booking widget</span>
          </div>
          
          <div className="modal-actions">
            <Button type="button" secondary onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" primary>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Service Category"
      >
        {currentCategory && (
          <form onSubmit={handleUpdateCategory}>
            <div className="form-group">
              <label htmlFor="edit-name">Category Name *</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-icon">Icon</label>
                <select
                  id="edit-icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                >
                  <option value="">Select an icon</option>
                  <option value="grooming">Grooming (✂️)</option>
                  <option value="training">Training (🦮)</option>
                  <option value="daycare">Daycare (🐕)</option>
                  <option value="boarding">Boarding (🏠)</option>
                  <option value="walking">Walking (🚶‍♂️)</option>
                  <option value="veterinary">Veterinary (🩺)</option>
                  <option value="consultation">Consultation (💬)</option>
                  <option value="other">Other (📦)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-color">Color</label>
                <input
                  type="color"
                  id="edit-color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
              <span className="checkbox-help">Inactive categories won't appear in booking widget</span>
            </div>
            
            <div className="modal-actions">
              <Button type="button" secondary onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" primary>
                Update Category
              </Button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Delete Category Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Service Category"
      >
        {currentCategory && (
          <div className="delete-confirmation">
            <p>
              Are you sure you want to delete the <strong>{currentCategory.name}</strong> category?
            </p>
            
            <p className="warning-text">
              This action cannot be undone. Services in this category will not be deleted,
              but they will no longer be associated with this category.
            </p>
            
            <div className="modal-actions">
              <Button type="button" secondary onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button type="button" danger onClick={handleDeleteCategory}>
                Delete Category
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceCategories;