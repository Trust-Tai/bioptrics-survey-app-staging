import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaPencilAlt, 
  FaSpinner,
  FaSave, 
  FaArrowRight, 
  FaArrowLeft, 
  FaToggleOn, 
  FaToggleOff,
  FaLayerGroup,
  FaEdit
} from 'react-icons/fa';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { Layers, Layer, LayerField } from '../../../api/layers';
import { FiPlus } from 'react-icons/fi';

// Loading indicator
const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #7a4e7a;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.div<{ success?: boolean; error?: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#e7f7ed' : props.error ? '#ffebee' : '#f5f5f5'};
  color: ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#555'};
  border-left: 4px solid ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#ddd'};
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #4a2540 0%, #6a4269 100%)' : '#f5f5f5'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
    color: #555;
    background: #f9f9f9;
  }
  
  tr:hover td {
    background: rgba(122, 78, 122, 0.05);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #7a4e7a;
  transition: all 0.2s;
  
  &:hover {
    color: #552a47;
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  position: relative;
  padding-left: 16px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: linear-gradient(to bottom, #552a47, #7a4e7a);
    border-radius: 2px;
  }
`;

const StepContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.03);
`;

const StepTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background: linear-gradient(to bottom, #552a47, #7a4e7a);
    border-radius: 2px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
    box-shadow: 0 0 0 2px rgba(122, 78, 122, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
    box-shadow: 0 0 0 2px rgba(122, 78, 122, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.primary ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: ${props => props.primary ? 'none' : '1px solid #ddd'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: ${props => props.primary ? 'linear-gradient(135deg, #4a2540 0%, #6a4269 100%)' : '#f9f9f9'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

// LayerBuilder Component
// Tag Builder Component (previously LayerBuilder)
const LayerBuilder: React.FC = () => {
  // Get URL parameters for editing
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const editLayerId = searchParams.get('edit');
  
  // State for the active tab (builder or list)
  const [activeTab, setActiveTab] = useState<'builder' | 'list'>('builder');
  
  // State for the current step in builder
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // State for layer data
  const [layer, setLayer] = useState<Partial<Layer>>({ name: '', location: 'surveys', priority: 1, fields: [], active: true });
  
  // State to track if we're editing an existing layer
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // State for available fields
  const [availableFields, setAvailableFields] = useState<LayerField[]>([
    { id: 'description', name: 'description', type: 'textarea', label: 'Description', required: false, enabled: false },
    { id: 'color', name: 'color', type: 'color', label: 'Color', required: false, enabled: false },
    { id: 'image', name: 'image', type: 'image', label: 'Image', required: false, enabled: false },
    { id: 'startDate', name: 'startDate', type: 'date', label: 'Start Date', required: false, enabled: false },
    { id: 'endDate', name: 'endDate', type: 'date', label: 'End Date', required: false, enabled: false },
  ]);
  
  // Status state
  const [status, setStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | 'info' }>({ 
    loading: false, 
    message: '', 
    type: 'info' 
  });
  
  // Subscribe to layers collection
  const { layers, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    const isReady = subscription.ready();
    const layers = Layers.find({}, { sort: { createdAt: -1 } }).fetch();
    
    console.log('LayerBuilder - Subscription ready:', isReady);
    console.log('LayerBuilder - Layers found:', layers.length);
    
    return {
      layers,
      isLoading: !isReady
    };
  }, []);
  
  // Load layer data when editing
  useEffect(() => {
    if (editLayerId && layers.length > 0 && !isLoading) {
      const layerToEdit = layers.find(l => l._id === editLayerId);
      
      if (layerToEdit) {
        console.log('Loading layer for editing:', layerToEdit);
        
        // Update layer state with the found layer
        setLayer({
          _id: layerToEdit._id,
          id: layerToEdit.id,
          name: layerToEdit.name,
          location: layerToEdit.location,
          priority: layerToEdit.priority || 1, // Ensure priority has a default value
          fields: layerToEdit.fields || [],
          active: layerToEdit.active !== undefined ? layerToEdit.active : true // Default to active if not specified
        });
        
        // Mark standard fields as enabled if they exist in the layer
        setAvailableFields(prev => {
          return prev.map(field => {
            const existingField = layerToEdit.fields?.find(f => f.id === field.id);
            return {
              ...field,
              enabled: !!existingField
            };
          });
        });
        
        // Extract custom fields (fields not in the standard availableFields)
        const standardFieldIds = availableFields.map(f => f.id);
        const customLayerFields = layerToEdit.fields?.filter(f => !standardFieldIds.includes(f.id)) || [];
        
        if (customLayerFields.length > 0) {
          setCustomFields(customLayerFields);
        }
        
        setIsEditing(true);
        setActiveTab('builder');
        setCurrentStep(1);
      }
    }
  }, [editLayerId, layers, isLoading]); // Removed availableFields from dependency array to prevent circular updates
  
  // Force the component to show the empty state after a timeout
  // This ensures that even if the subscription is stuck, we'll show something
  const [forceShowContent, setForceShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowContent(true);
    }, 3000); // Wait 3 seconds before forcing content display
    
    return () => clearTimeout(timer);
  }, []);
  
  // State for custom fields
  const [customFields, setCustomFields] = useState<LayerField[]>([]);
  
  // State for new custom field
  const [newCustomField, setNewCustomField] = useState<Partial<LayerField>>({
    name: '',
    type: 'text',
    label: '',
    required: false,
    options: []
  });
  
  // State for managing dropdown options
  const [dropdownOption, setDropdownOption] = useState<string>('');
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  
  // State for validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    location?: string;
    priority?: string;
  }>({});
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert to number for number inputs
    const processedValue = type === 'number' ? Number(value) : value;
    
    console.log(`Updating ${name} to:`, processedValue);
    
    // Force update the layer state with the new value
    setLayer(prevLayer => {
      const updatedLayer = { ...prevLayer, [name]: processedValue };
      console.log('Updated layer state:', updatedLayer);
      return updatedLayer;
    });
    
    // Clear error when field is updated
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Validate step 1
  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!layer.name?.trim()) {
      newErrors.name = 'Layer Name is required';
    }
    
    if (!layer.location) {
      newErrors.location = 'Location is required';
    }
    
    if (layer.priority === undefined || layer.priority < 1) {
      newErrors.priority = 'Priority must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    console.log('Attempting to move to next step');
    console.log('Current layer data:', layer);
    
    // Force validation to pass in edit mode if we have layer data
    if (isEditing && layer._id) {
      console.log('Edit mode - moving to step 2');
      setCurrentStep(2);
      return;
    }
    
    // Normal validation for new layers
    if (validateStep1()) {
      console.log('Validation passed, moving to step 2');
      setCurrentStep(2);
    } else {
      console.log('Validation failed:', errors);
    }
  };
  
  // Handle previous step navigation
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Toggle field selection
  const toggleField = (fieldId: string) => {
    setAvailableFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };
  
  // Handle adding a dropdown option
  const addDropdownOption = () => {
    if (!dropdownOption.trim()) return;
    
    setDropdownOptions(prev => [...prev, dropdownOption.trim()]);
    setDropdownOption('');
  };
  
  // Handle removing a dropdown option
  const removeDropdownOption = (optionToRemove: string) => {
    setDropdownOptions(prev => prev.filter(option => option !== optionToRemove));
  };
  
  // Add custom field
  const addCustomField = () => {
    if (!newCustomField.name || !newCustomField.label) {
      return; // Validation failed
    }
    
    // Validate dropdown options if field type is dropdown
    if (newCustomField.type === 'dropdown' && dropdownOptions.length === 0) {
      alert('Please add at least one option for the dropdown field');
      return;
    }
    
    const newField: LayerField = {
      id: `custom-${Date.now()}`,
      name: newCustomField.name || '',
      type: newCustomField.type || 'text',
      label: newCustomField.label || '',
      required: newCustomField.required || false,
      enabled: true,
      options: newCustomField.type === 'dropdown' ? [...dropdownOptions] : undefined
    };
    
    setCustomFields(prev => [...prev, newField]);
    
    // Reset the form
    setNewCustomField({
      name: '',
      type: 'text',
      label: '',
      required: false,
      options: []
    });
    
    // Reset dropdown options
    setDropdownOptions([]);
    setDropdownOption('');
  };
  
  // Remove custom field
  const removeCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== fieldId));
  };
  
  // Edit custom field
  const editCustomField = (field: LayerField) => {
    setNewCustomField({
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      required: field.required,
      options: field.options || []
    });
    
    // If it's a dropdown field, load the options
    if (field.type === 'dropdown' && field.options && field.options.length > 0) {
      setDropdownOptions(field.options);
    } else {
      setDropdownOptions([]);
    }
    
    // Remove the field from the list
    removeCustomField(field.id);
    
    // Scroll to the custom field form
    document.getElementById('customFieldForm')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // No duplicate declaration here
  
  // Delete a tag
  const deleteTag = (layerId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      setStatus({ loading: true, message: 'Deleting tag...', type: 'info' });
      
      Meteor.call('layers.remove', layerId, (error: Error | null) => {
        if (error) {
          console.error('Error deleting tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          setStatus({ loading: false, message: 'Tag deleted successfully!', type: 'success' });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({ loading: false, message: '', type: 'info' });
          }, 3000);
        }
      });
    }
  };

  // Save layer configuration
  const saveLayerConfiguration = () => {
    // Combine selected standard fields and custom fields
    const selectedStandardFields = availableFields.filter((field: LayerField) => field.enabled);
    
    // Make sure we have valid field objects with all required properties
    const validatedStandardFields = selectedStandardFields.map(field => ({
      id: field.id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: field.name || '',
      type: field.type || 'text',
      label: field.label || '',
      required: !!field.required,
      options: Array.isArray(field.options) ? field.options : [],
      enabled: !!field.enabled
    }));
    
    const validatedCustomFields = customFields.map(field => ({
      id: field.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: field.name || '',
      type: field.type || 'text',
      label: field.label || '',
      required: !!field.required,
      options: Array.isArray(field.options) ? field.options : [],
      enabled: true
    }));
    
    const allSelectedFields = [...validatedStandardFields, ...validatedCustomFields];
    
    // Validate fields
    if (!layer.name?.trim()) {
      setStatus({ loading: false, message: 'Layer name is required', type: 'error' });
      return;
    }
    
    if (!layer.location) {
      setStatus({ loading: false, message: 'Location is required', type: 'error' });
      return;
    }
    
    if (layer.priority === undefined || layer.priority < 1) {
      setStatus({ loading: false, message: 'Priority must be a positive number', type: 'error' });
      return;
    }
    
    // Set loading state
    setStatus({ loading: true, message: isEditing ? 'Updating tag...' : 'Saving tag...', type: 'info' });
    
    if (isEditing && layer._id) {
      // Update existing tag
      const updatedLayer = {
        id: layer.id,
        name: layer.name || '',
        location: layer.location as 'surveys' | 'questions',
        priority: Number(layer.priority) || 1,
        active: layer.active !== undefined ? layer.active : true,
        fields: allSelectedFields
      };
      
      console.log('Updating tag:', updatedLayer);
      
      // Update in database using Meteor method - wait for completion before redirecting
      Meteor.call('layers.update', layer._id, updatedLayer, (error: Error | null) => {
        if (error) {
          console.error('Error updating layer:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag updated successfully');
          
          // Store success message in localStorage before redirecting
          const successMessage = `Tag "${layer.name}" updated successfully!`;
          localStorage.setItem('layerActionSuccess', successMessage);
          
          // Only redirect after successful update
          navigate('/admin/settings/all-layers');
        }
      });
    } else {
      // Create new tag
      const newLayer = {
        id: `layer-${Date.now()}`,
        name: layer.name || '',
        location: layer.location as 'surveys' | 'questions',
        priority: Number(layer.priority) || 1,
        active: layer.active !== undefined ? layer.active : true,
        fields: allSelectedFields
      };
      
      console.log('Creating new tag:', newLayer);
      
      // Save to database using Meteor method - wait for completion before redirecting
      Meteor.call('layers.create', newLayer, (error: Error | null) => {
        if (error) {
          console.error('Error creating tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag created successfully');
          
          // Store success message in localStorage before redirecting
          const successMessage = `Tag "${layer.name}" created successfully!`;
          localStorage.setItem('layerActionSuccess', successMessage);
          
          // Only redirect after successful creation
          navigate('/admin/settings/all-layers');
        }
      });
    }
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>{isEditing ? 'Edit Tag' : 'Tag Builder'}</Title>
          <ButtonGroup>
            {activeTab === 'list' && (
              <Button primary onClick={() => { 
                // Reset form when creating a new layer
                if (isEditing) {
                  setLayer({
                    name: '',
                    location: 'surveys',
                    priority: 1,
                    fields: []
                  });
                  setAvailableFields(prev => prev.map(field => ({ ...field, enabled: false })));
                  setCustomFields([]);
                  setIsEditing(false);
                }
                setActiveTab('builder'); 
                setCurrentStep(1); 
              }}>
                <FaPlus /> Create New Tag
              </Button>
            )}
          </ButtonGroup>
        </Header>
        
       
        
        
        {activeTab === 'builder' && currentStep === 1 && (
          <StepContainer>
            <StepTitle>Step 1: Tag Basic Info</StepTitle>
            
            <FormGroup>
              <Label htmlFor="name">Tag Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={layer.name}
                onChange={handleInputChange}
                placeholder="Enter tag name"
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="location">Location</Label>
              <Select
                id="location"
                name="location"
                value={layer.location}
                onChange={handleInputChange}
              >
                <option value="surveys">Surveys</option>
                <option value="questions">Questions</option>
              </Select>
              {errors.location && <ErrorMessage>{errors.location}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="priority">Priority (Numeric)</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                min="1"
                value={layer.priority}
                onChange={handleInputChange}
                placeholder="Enter priority"
              />
              {errors.priority && <ErrorMessage>{errors.priority}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Label htmlFor="active" style={{ margin: 0 }}>Status</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={() => setLayer(prev => ({ ...prev, active: !prev.active }))} 
                    style={{ 
                      cursor: 'pointer',
                      color: layer.active ? '#4CAF50' : '#ccc'
                    }}
                  >
                    {layer.active ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                  </div>
                  <span>{layer.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </FormGroup>
            
            <ButtonGroup>
              <Button primary onClick={handleNextStep}>
                Next <FaArrowRight />
              </Button>
            </ButtonGroup>
          </StepContainer>
        )}
        
        {activeTab === 'builder' && currentStep === 2 && (
          <StepContainer>
            <StepTitle>Step 2: Select Tag Fields to Include</StepTitle>
            
            <div>
              {/* Standard Fields */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#555' }}>Standard Fields</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {availableFields.map(field => (
                    <div 
                      key={field.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0.75rem', 
                        border: '1px solid #eee', 
                        borderRadius: '8px',
                        background: field.enabled ? 'rgba(122, 78, 122, 0.05)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => toggleField(field.id)}
                    >
                      <div style={{ marginRight: '1rem', color: field.enabled ? '#7a4e7a' : '#aaa' }}>
                        {field.enabled ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{field.label}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777' }}>{field.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Custom Fields */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#555', display: 'flex', alignItems: 'center' }}>
                  Custom Fields
                </h3>
                
                {/* Add new custom field form */}
                <div 
                  id="customFieldForm"
                  style={{ 
                    padding: '1rem', 
                    border: '1px dashed #ddd', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem',
                    background: '#f9f9f9'
                  }}
                >
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#666' }}>
                    {newCustomField.id ? (
                      <>
                        <FaEdit style={{ marginRight: '0.5rem' }} /> Edit Custom Field
                      </>
                    ) : (
                      <>
                        <FaPlus style={{ marginRight: '0.5rem' }} /> Add New Custom Field
                      </>
                    )}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <FormGroup>
                      <Label htmlFor="customFieldName">Field Name</Label>
                      <Input
                        id="customFieldName"
                        value={newCustomField.name}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., customField"
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="customFieldLabel">Display Label</Label>
                      <Input
                        id="customFieldLabel"
                        value={newCustomField.label}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Custom Field"
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="customFieldType">Field Type</Label>
                      <Select
                        id="customFieldType"
                        value={newCustomField.type}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, type: e.target.value as LayerField['type'] }))}
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                      </Select>
                    </FormGroup>
                    
                    {/* Show dropdown options UI when dropdown type is selected */}
                    {newCustomField.type === 'dropdown' && (
                      <FormGroup style={{ gridColumn: '1 / -1' }}>
                        <Label>Dropdown Options</Label>
                        <div style={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          padding: '12px',
                          background: '#f9f9f9',
                          marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <Input
                              value={dropdownOption}
                              onChange={(e) => setDropdownOption(e.target.value)}
                              placeholder="Enter option"
                              style={{ flex: 1 }}
                            />
                            <Button onClick={addDropdownOption}>
                              <FaPlus /> Add
                            </Button>
                          </div>
                          
                          {dropdownOptions.length > 0 ? (
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px',
                              maxHeight: '120px',
                              overflowY: 'auto',
                              padding: '8px'
                            }}>
                              {dropdownOptions.map((option, index) => (
                                <div key={index} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  background: '#fff', 
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '14px'
                                }}>
                                  {option}
                                  <span 
                                    onClick={() => removeDropdownOption(option)}
                                    style={{ 
                                      marginLeft: '8px', 
                                      cursor: 'pointer',
                                      color: '#d32f2f',
                                      fontSize: '16px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <FaTimes />
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#777', fontSize: '14px', padding: '8px', textAlign: 'center' }}>
                              No options added yet. Add at least one option for the dropdown.
                            </div>
                          )}
                        </div>
                      </FormGroup>
                    )}
                    
                    <FormGroup style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox" 
                          id="customFieldRequired" 
                          checked={newCustomField.required} 
                          onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))} 
                          style={{ marginRight: '0.5rem' }} 
                        />
                        <Label htmlFor="customFieldRequired" style={{ margin: 0 }}>Required</Label>
                      </div>
                      
                      <Button 
                        primary 
                        onClick={addCustomField}
                        style={{ marginLeft: 'auto' }}
                      >
                        {newCustomField.id ? (
                          <>
                            <FaSave /> Update Field
                          </>
                        ) : (
                          <>
                            <FaPlus /> Add Field
                          </>
                        )}
                      </Button>
                    </FormGroup>
                  </div>
                </div>
                
                {/* List of added custom fields */}
                {customFields.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#666' }}>Added Custom Fields</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {customFields.map(field => (
                        <div 
                          key={field.id} 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: '0.75rem', 
                            border: '1px solid #eee', 
                            borderRadius: '8px',
                            background: 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: field.type === 'dropdown' ? '8px' : '0' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{field.label}</div>
                              <div style={{ fontSize: '0.8rem', color: '#777' }}>
                                {field.type} {field.required && <span style={{ color: '#d32f2f' }}>(Required)</span>}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <ActionButton onClick={() => editCustomField(field)} title="Edit Field">
                                <FaEdit color="#3776a8" />
                              </ActionButton>
                              <ActionButton onClick={() => removeCustomField(field.id)} title="Remove Field">
                                <FaTrash color="#d32f2f" />
                              </ActionButton>
                            </div>
                          </div>
                          
                          {/* Show options for dropdown fields */}
                          {field.type === 'dropdown' && field.options && field.options.length > 0 && (
                            <div style={{ 
                              marginTop: '8px',
                              padding: '8px',
                              background: '#f9f9f9',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ fontWeight: 500, marginBottom: '4px', color: '#555' }}>Options:</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {field.options.map((option, index) => (
                                  <span 
                                    key={index}
                                    style={{ 
                                      background: '#fff', 
                                      border: '1px solid #e0e0e0',
                                      borderRadius: '4px',
                                      padding: '2px 6px',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {status.message && (
              <StatusMessage error={status.type === 'error'} success={status.type === 'success'}>
                {status.message}
              </StatusMessage>
            )}
            
            <ButtonGroup>
              <Button 
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null} 
                disabled={status.loading || currentStep <= 1}
              >
                <FaArrowLeft /> Back
              </Button>
              {isEditing && (
                <Button 
                  onClick={() => {
                    // Reset form and redirect to All Tags page
                    setLayer({
                      name: '',
                      location: 'surveys',
                      priority: 1,
                      fields: []
                    });
                    setAvailableFields(prev => prev.map(field => ({ ...field, enabled: false })));
                    setCustomFields([]);
                    setIsEditing(false);
                    
                    // Redirect to All Tags page
                    navigate('/admin/settings/all-layers');
                  }}
                  style={{ backgroundColor: '#f5f5f5', color: '#555' }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button primary onClick={saveLayerConfiguration} disabled={status.loading}>
                {status.loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '0.5rem' }}>{isEditing ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : isEditing ? 'Update Tag' : 'Save Tag'}
              </Button>
            </ButtonGroup>
        </StepContainer>
    )}
    
    {status.message && (
      <StatusMessage error={status.type === 'error'} success={status.type === 'success'}>
        {status.message}
      </StatusMessage>
    )}
    

  
        
      </Container>
    </AdminLayout>
  );
};

export default LayerBuilder;
