import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    appliesTo: 'pet', // pet, customer, service, appointment
    description: ''
  });
  const [newOption, setNewOption] = useState('');
  
  // Field type options
  const fieldTypes = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'select', name: 'Dropdown' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'radio', name: 'Radio Buttons' },
    { id: 'date', name: 'Date' },
    { id: 'textarea', name: 'Text Area' }
  ];
  
  // Applies to options
  const entityTypes = [
    { id: 'pet', name: 'Pet' },
    { id: 'customer', name: 'Customer' },
    { id: 'service', name: 'Service' },
    { id: 'appointment', name: 'Appointment' }
  ];
  
  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockFields = [
          {
            id: '1',
            name: 'allergies',
            label: 'Allergies',
            type: 'textarea',
            required: false,
            options: [],
            appliesTo: 'pet',
            description: 'List any known allergies for the pet'
          },
          {
            id: '2',
            name: 'microchip_id',
            label: 'Microchip ID',
            type: 'text',
            required: false,
            options: [],
            appliesTo: 'pet',
            description: 'The pet\'s microchip identification number'
          },
          {
            id: '3',
            name: 'coat_type',
            label: 'Coat Type',
            type: 'select',
            required: true,
            options: ['Short', 'Medium', 'Long', 'Double', 'Curly', 'Wire'],
            appliesTo: 'pet',
            description: 'The type of coat the pet has'
          },
          {
            id: '4',
            name: 'emergency_contact',
            label: 'Emergency Contact',
            type: 'text',
            required: true,
            options: [],
            appliesTo: 'customer',
            description: 'Name and phone number for emergency contact'
          }
        ];
        
        setFields(mockFields);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        toast.error('Failed to load custom fields');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomFields();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      appliesTo: 'pet',
      description: ''
    });
    setNewOption('');
  };
  
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()]
    }));
    
    setNewOption('');
  };
  
  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Field name is required');
      return false;
    }
    
    if (!formData.label.trim()) {
      toast.error('Field label is required');
      return false;
    }
    
    // Check for spaces and special characters in name
    if (!/^[a-z0-9_]+$/.test(formData.name)) {
      toast.error('Field name can only contain lowercase letters, numbers, and underscores');
      return false;
    }
    
    // Check if dropdown/radio has options
    if (['select', 'radio'].includes(formData.type) && formData.options.length === 0) {
      toast.error(`${formData.type === 'select' ? 'Dropdown' : 'Radio buttons'} must have at least one option`);
      return false;
    }
    
    return true;
  };
  
  const handleAddField = async () => {
    try {
      if (!validateForm()) return;
      
      // In a real app, this would be an API call
      // Mock adding for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newField = {
        id: Date.now().toString(),
        ...formData
      };
      
      setFields(prev => [...prev, newField]);
      resetForm();
      setShowAddModal(false);
      toast.success('Custom field added successfully');
    } catch (error) {
      console.error('Error adding custom field:', error);
      toast.error('Failed to add custom field');
    }
  };
  
  const handleEditField = (field) => {
    setSelectedField(field);
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: [...field.options],
      appliesTo: field.appliesTo,
      description: field.description
    });
    setShowEditModal(true);
  };
  
  const handleUpdateField = async () => {
    try {
      if (!validateForm()) return;
      
      // In a real app, this would be an API call
      // Mock updating for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFields(prev => 
        prev.map(field => 
          field.id === selectedField.id ? { ...field, ...formData } : field
        )
      );
      
      resetForm();
      setShowEditModal(false);
      setSelectedField(null);
      toast.success('Custom field updated successfully');
    } catch (error) {
      console.error('Error updating custom field:', error);
      toast.error('Failed to update custom field');
    }
  };
  
  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this custom field? This may affect existing records.')) {
      try {
        // In a real app, this would be an API call
        // Mock deleting for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFields(prev => prev.filter(field => field.id !== fieldId));
        toast.success('Custom field deleted successfully');
      } catch (error) {
        console.error('Error deleting custom field:', error);
        toast.error('Failed to delete custom field');
      }
    }
  };
  
  const getEntityName = (entityId) => {
    const entity = entityTypes.find(type => type.id === entityId);
    return entity ? entity.name : 'Unknown';
  };
  
  const getTypeName = (typeId) => {
    const type = fieldTypes.find(type => type.id === typeId);
    return type ? type.name : 'Unknown';
  };
  
  const renderAddEditModalContent = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Field Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. microchip_id"
            disabled={showEditModal} // Can't change name when editing
            required
          />
          <small className="form-text text-muted">
            Use only lowercase letters, numbers, and underscores. This is used internally.
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="label" className="form-label">Display Label</label>
          <input
            type="text"
            id="label"
            name="label"
            className="form-control"
            value={formData.label}
            onChange={handleInputChange}
            placeholder="e.g. Microchip ID"
            required
          />
          <small className="form-text text-muted">
            This is what users will see on forms.
          </small>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type" className="form-label">Field Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleInputChange}
            disabled={showEditModal} // Can't change type when editing
            required
          >
            {fieldTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="appliesTo" className="form-label">Applies To</label>
          <select
            id="appliesTo"
            name="appliesTo"
            className="form-control"
            value={formData.appliesTo}
            onChange={handleInputChange}
            disabled={showEditModal} // Can't change entity when editing
            required
          >
            {entityTypes.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the purpose of this field..."
          rows={2}
        />
      </div>
      
      <div className="form-group">
        <div className="custom-checkbox">
          <input
            type="checkbox"
            id="required"
            name="required"
            checked={formData.required}
            onChange={handleInputChange}
          />
          <label htmlFor="required">Required Field</label>
        </div>
      </div>
      
      {['select', 'radio'].includes(formData.type) && (
        <div className="form-group">
          <label className="form-label">Options</label>
          <div className="options-list">
            {formData.options.map((option, index) => (
              <div key={index} className="option-item">
                <span>{option}</span>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => handleRemoveOption(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="options-add">
            <input
              type="text"
              className="form-control"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add new option"
            />
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleAddOption}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
  
  const renderAddModal = () => (
    <Modal
      isOpen={showAddModal}
      onClose={() => setShowAddModal(false)}
      title="Add Custom Field"
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
            onClick={handleAddField}
          >
            Add Field
          </button>
        </>
      }
    >
      {renderAddEditModalContent()}
    </Modal>
  );
  
  const renderEditModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setSelectedField(null);
        resetForm();
      }}
      title="Edit Custom Field"
      footer={
        <>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setShowEditModal(false);
              setSelectedField(null);
              resetForm();
            }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUpdateField}
          >
            Update Field
          </button>
        </>
      }
    >
      {renderAddEditModalContent()}
    </Modal>
  );
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="custom-fields-page">
      <PageHeader
        title="Custom Fields"
        subtitle="Create and manage custom fields for pets, customers, services, and appointments"
        actions={
          <button 
            className="btn btn-primary" 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add Field
          </button>
        }
      />
      
      {fields.length > 0 ? (
        <div className="grid grid-3">
          {fields.map(field => (
            <Card key={field.id}>
              <div className="field-header">
                <h3>{field.label}</h3>
                <div className="field-badges">
                  <span className="badge badge-primary">
                    {getEntityName(field.appliesTo)}
                  </span>
                  {field.required && (
                    <span className="badge badge-warning">
                      Required
                    </span>
                  )}
                </div>
              </div>
              
              <div className="field-details">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{field.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{getTypeName(field.type)}</span>
                </div>
                
                {field.description && (
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{field.description}</span>
                  </div>
                )}
                
                {['select', 'radio'].includes(field.type) && field.options.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Options:</span>
                    <span className="detail-value">
                      {field.options.join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="field-actions">
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleEditField(field)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDeleteField(field.id)}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Custom Fields"
          message="You haven't created any custom fields yet. Custom fields allow you to collect additional information about pets, customers, services, and appointments."
          actionText="Add Field"
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

export default CustomFields;