import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ServiceTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: ''
  });
  
  // Mock categories for dropdown
  const serviceCategories = [
    { id: 'grooming', name: 'Grooming' },
    { id: 'walking', name: 'Walking' },
    { id: 'daycare', name: 'Daycare' },
    { id: 'boarding', name: 'Boarding' },
    { id: 'training', name: 'Training' }
  ];
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockTemplates = [
          {
            id: '1',
            name: 'Basic Grooming Package',
            description: 'Bath, brush, and nail trim',
            duration: 60,
            price: 45.00,
            category: 'grooming'
          },
          {
            id: '2',
            name: 'Premium Grooming Package',
            description: 'Bath, brush, nail trim, ear cleaning, teeth brushing',
            duration: 90,
            price: 75.00,
            category: 'grooming'
          },
          {
            id: '3',
            name: 'Dog Walking (30 min)',
            description: '30 minute neighborhood walk',
            duration: 30,
            price: 20.00,
            category: 'walking'
          },
          {
            id: '4',
            name: 'Overnight Boarding',
            description: 'Overnight care with feeding and playtime',
            duration: 1440, // 24 hours in minutes
            price: 65.00,
            category: 'boarding'
          }
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching service templates:', error);
        toast.error('Failed to load service templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: ''
    });
  };
  
  const handleAddTemplate = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.category || formData.price <= 0 || formData.duration <= 0) {
        toast.error('Please fill all required fields with valid values');
        return;
      }
      
      // In a real app, this would be an API call
      // Mock adding for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTemplate = {
        id: Date.now().toString(),
        ...formData
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      resetForm();
      setShowAddModal(false);
      toast.success('Service template added successfully');
    } catch (error) {
      console.error('Error adding service template:', error);
      toast.error('Failed to add service template');
    }
  };
  
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      duration: template.duration,
      price: template.price,
      category: template.category
    });
    setShowEditModal(true);
  };
  
  const handleUpdateTemplate = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.category || formData.price <= 0 || formData.duration <= 0) {
        toast.error('Please fill all required fields with valid values');
        return;
      }
      
      // In a real app, this would be an API call
      // Mock updating for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTemplates(prev => 
        prev.map(template => 
          template.id === selectedTemplate.id ? { ...template, ...formData } : template
        )
      );
      
      resetForm();
      setShowEditModal(false);
      setSelectedTemplate(null);
      toast.success('Service template updated successfully');
    } catch (error) {
      console.error('Error updating service template:', error);
      toast.error('Failed to update service template');
    }
  };
  
  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this service template?')) {
      try {
        // In a real app, this would be an API call
        // Mock deleting for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        toast.success('Service template deleted successfully');
      } catch (error) {
        console.error('Error deleting service template:', error);
        toast.error('Failed to delete service template');
      }
    }
  };
  
  const getCategoryName = (categoryId) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const renderAddModal = () => (
    <Modal
      isOpen={showAddModal}
      onClose={() => setShowAddModal(false)}
      title="Add Service Template"
      footer={
        <>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAddTemplate}
          >
            Add Template
          </button>
        </>
      }
    >
      <div className="form-group">
        <label htmlFor="name" className="form-label">Service Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Basic Grooming"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the service..."
          rows={3}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="duration" className="form-label">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            className="form-control"
            value={formData.duration}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price" className="form-label">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            className="form-control"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="category" className="form-label">Category</label>
        <select
          id="category"
          name="category"
          className="form-control"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Category</option>
          {serviceCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
  
  const renderEditModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setSelectedTemplate(null);
        resetForm();
      }}
      title="Edit Service Template"
      footer={
        <>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setShowEditModal(false);
              setSelectedTemplate(null);
              resetForm();
            }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUpdateTemplate}
          >
            Update Template
          </button>
        </>
      }
    >
      <div className="form-group">
        <label htmlFor="edit-name" className="form-label">Service Name</label>
        <input
          type="text"
          id="edit-name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Basic Grooming"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="edit-description" className="form-label">Description</label>
        <textarea
          id="edit-description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the service..."
          rows={3}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-duration" className="form-label">Duration (minutes)</label>
          <input
            type="number"
            id="edit-duration"
            name="duration"
            className="form-control"
            value={formData.duration}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="edit-price" className="form-label">Price ($)</label>
          <input
            type="number"
            id="edit-price"
            name="price"
            className="form-control"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="edit-category" className="form-label">Category</label>
        <select
          id="edit-category"
          name="category"
          className="form-control"
          value={formData.category}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Category</option>
          {serviceCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="service-templates-page">
      <PageHeader
        title="Service Templates"
        subtitle="Create and manage your service templates"
        actions={
          <button 
            className="btn btn-primary" 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add Template
          </button>
        }
      />
      
      {templates.length > 0 ? (
        <div className="grid grid-3">
          {templates.map(template => (
            <Card key={template.id}>
              <div className="template-header">
                <h3>{template.name}</h3>
                <span className="badge badge-primary">
                  {getCategoryName(template.category)}
                </span>
              </div>
              
              <p className="template-description">{template.description || 'No description'}</p>
              
              <div className="template-details">
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {template.duration >= 60 && Math.floor(template.duration / 60)}
                    {template.duration >= 60 && template.duration % 60 > 0 && 'h '}
                    {template.duration % 60 > 0 && `${template.duration % 60}m`}
                    {template.duration >= 1440 && ' (overnight)'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">${template.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="template-actions">
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleEditTemplate(template)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Service Templates"
          message="You haven't created any service templates yet. Templates help you quickly add services to your offerings."
          actionText="Add Template"
          onActionClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        />
      )}
      
      {renderAddModal()}
      {renderEditModal()}
    </div>
  );
};

export default ServiceTemplates;