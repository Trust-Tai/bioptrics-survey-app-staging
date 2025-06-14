import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { Layers, Layer } from '../../../api/layers';
import { TagItems, TagItem } from '../../../api/tagItems';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaCheck, 
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaLayerGroup,
  FaUpload,
  FaEye
} from 'react-icons/fa';

// Using TagItem and TagItemField interfaces imported from the API file

// Styled components
const Container = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: ${props => props.primary ? '#7a4e7a' : '#f5f5f5'};
  color: ${props => props.primary ? '#fff' : '#333'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#6a3e6a' : '#e5e5e5'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.2s;
  border: 1px solid #eee;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const ItemTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const ItemField = styled.div`
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const FieldValue = styled.div`
  font-size: 1rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
  }
`;

const StatusMessage = styled.div<{ error?: boolean; success?: boolean }>`
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 6px;
  background-color: ${props => 
    props.error ? '#fff2f2' : 
    props.success ? '#f2fff5' : 
    '#f5f5f5'
  };
  color: ${props => 
    props.error ? '#d32f2f' : 
    props.success ? '#388e3c' : 
    '#333'
  };
  border-left: 4px solid ${props => 
    props.error ? '#d32f2f' : 
    props.success ? '#388e3c' : 
    '#ddd'
  };
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

// Use the TagItems collection imported from the API file

// Add a style for the spinner animation
const SpinnerAnimation = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
`;

// Empty state styled components
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  color: #7a3e68;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  svg {
    filter: drop-shadow(0 4px 6px rgba(85, 42, 71, 0.25));
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const EmptyStateDescription = styled.p`
  color: #666;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const EmptyStateAction = styled.button`
  background: linear-gradient(180deg, #552a47 0%, #3d1f33 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(180deg, #7a3e68 0%, #552a47 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 0.875rem;
  }
`;

// Color picker styled components
const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
`;

const ColorPreview = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const ColorInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  opacity: 1;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ColorValue = styled.span`
  font-family: monospace;
  font-size: 0.9rem;
  color: #555;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  border: 1px solid #ddd;
`;

// Image upload styled components
const ImageUploadContainer = styled.div`
  width: 100%;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: block;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.8);
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
  color: #d32f2f;
  transition: all 0.2s;
  
  &:hover {
    background: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;

const ImageUploadButton = styled.label<{disabled?: boolean}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;
  gap: 0.5rem;
  
  &:hover {
    border-color: ${props => props.disabled ? '#ccc' : '#7a3e68'};
    background-color: ${props => props.disabled ? 'transparent' : 'rgba(122, 62, 104, 0.05)'};
  }
  
  svg {
    color: #7a3e68;
    font-size: 1.5rem;
  }
  
  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const ImageInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
`;

// Main component
const TagItemsComponent: React.FC = () => {
  const { tagId } = useParams<{ tagId: string }>();
  const navigate = useNavigate();
  
  // State for the component
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<TagItem | null>(null);
  const [viewingItem, setViewingItem] = useState<TagItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<TagItem>>({
    tagId: tagId || '',
    name: '',
    fields: [],
    active: true
  });
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    type: 'info'
  });

  // Subscribe to the tag and its items
  const { tag, items, isLoading } = useTracker(() => {
    // Show loading state while subscriptions are not ready
    console.log('Subscribing to layers.single with tagId:', tagId);
    const tagHandle = Meteor.subscribe('layers.single', tagId);
    console.log('Subscribing to tagItems.byTag with tagId:', tagId);
    const itemsHandle = Meteor.subscribe('tagItems.byTag', tagId);
    
    const isReady = tagHandle.ready() && itemsHandle.ready();
    console.log('Subscriptions ready:', isReady, 'tagHandle ready:', tagHandle.ready(), 'itemsHandle ready:', itemsHandle.ready());
    
    // Only fetch data when subscriptions are ready
    const tag = isReady ? Layers.findOne({ _id: tagId }) : undefined;
    const items = isReady ? TagItems.find({ tagId }).fetch() : [];
    
    console.log('Tag found:', tag ? 'yes' : 'no', 'Items found:', items.length);
    
    return {
      tag,
      items,
      isLoading: !isReady
    };
  }, [tagId]);

  // Reset form when tag changes
  useEffect(() => {
    if (tagId) {
      setNewItem({
        tagId,
        name: '',
        fields: [],
        active: true
      });
    }
  }, [tagId]);

  // Initialize fields based on tag definition
  useEffect(() => {
    if (tag && tag.fields) {
      console.log('Initializing fields for tag:', tag.name);
      const initialFields = tag.fields.map(field => ({
        fieldId: field.id,
        value: field.type === 'boolean' ? false : ''
      }));
      
      setNewItem(prev => ({
        ...prev,
        tagId: tag._id || '',
        fields: initialFields
      }));
    }
  }, [tag]);

  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: string | boolean | number | string[]) => {
    setNewItem(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.fieldId === fieldId ? { ...field, value } : field
      ) || []
    }));
  };

  // Handle creating a new item
  const handleCreateItem = () => {
    // Validate required fields
    if (!newItem.name) {
      setStatus({
        loading: false,
        message: 'Please provide a name for the item',
        type: 'error'
      });
      return;
    }
    
    // Ensure fields are properly formatted
    const validFields = newItem.fields?.map(field => {
      // Ensure each field has a fieldId and value
      return {
        fieldId: field.fieldId,
        value: field.value !== undefined ? field.value : ''
      };
    }) || [];
    
    // Create a clean item object with only the required properties
    const itemToCreate = {
      tagId: tagId || '',
      name: newItem.name.trim(),
      fields: validFields,
      active: newItem.active !== undefined ? newItem.active : true
    };
    
    console.log('Creating tag item with data:', itemToCreate);
    
    setStatus({
      loading: true,
      message: 'Creating item...',
      type: 'info'
    });
    
    Meteor.call('tagItems.create', itemToCreate, (error: Error | null, result: any) => {
      if (error) {
        console.error('Error creating tag item:', error);
        setStatus({
          loading: false,
          message: `Error: ${error.message}`,
          type: 'error'
        });
      } else {
        console.log('Tag item created successfully with ID:', result);
        setStatus({
          loading: false,
          message: 'Item created successfully!',
          type: 'success'
        });
        
        // Reset form and close modal
        setNewItem({
          tagId: tagId || '',
          name: '',
          fields: tag?.fields.map(field => ({
            fieldId: field.id,
            value: field.type === 'boolean' ? false : ''
          })) || [],
          active: true
        });
        
        setShowAddModal(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({
            loading: false,
            message: '',
            type: 'info'
          });
        }, 3000);
      }
    });
  };

  // Handle updating an item
  const handleUpdateItem = () => {
    if (!currentItem || !currentItem._id) return;
    
    // Create a clean item object with only the necessary properties
    const itemToUpdate = {
      name: currentItem.name,
      fields: currentItem.fields?.map(field => ({
        fieldId: field.fieldId,
        value: field.value !== undefined ? field.value : ''
      })) || [],
      active: currentItem.active !== undefined ? currentItem.active : true
    };
    
    console.log('Updating tag item with data:', itemToUpdate);
    
    setStatus({
      loading: true,
      message: 'Updating item...',
      type: 'info'
    });
    
    Meteor.call('tagItems.update', currentItem._id, itemToUpdate, (error: Error | null, result: any) => {
      if (error) {
        console.error('Error updating tag item:', error);
        setStatus({
          loading: false,
          message: `Error: ${error.message}`,
          type: 'error'
        });
      } else {
        console.log('Tag item updated successfully, result:', result);
        setStatus({
          loading: false,
          message: 'Item updated successfully!',
          type: 'success'
        });
        
        setShowEditModal(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({
            loading: false,
            message: '',
            type: 'info'
          });
        }, 3000);
      }
    });
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      console.log(`Deleting tag item with ID: ${itemId}`);
      
      setStatus({
        loading: true,
        message: 'Deleting item...',
        type: 'info'
      });
      
      Meteor.call('tagItems.remove', itemId, (error: Error | null, result: any) => {
        if (error) {
          console.error('Error deleting tag item:', error);
          setStatus({
            loading: false,
            message: `Error: ${error.message}`,
            type: 'error'
          });
        } else {
          console.log('Tag item deleted successfully, result:', result);
          setStatus({
            loading: false,
            message: 'Item deleted successfully!',
            type: 'success'
          });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({
              loading: false,
              message: '',
              type: 'info'
            });
          }, 3000);
        }
      });
    }
  };

  // Handle toggling item status
  const handleToggleStatus = (itemId: string, active: boolean) => {
    console.log(`Toggling status for item ${itemId} from ${active ? 'active' : 'inactive'} to ${!active ? 'active' : 'inactive'}`);
    
    setStatus({
      loading: true,
      message: `${!active ? 'Activating' : 'Deactivating'} item...`,
      type: 'info'
    });
    
    // Add a small delay to ensure UI feedback is visible
    setTimeout(() => {
      Meteor.call('tagItems.updateStatus', itemId, !active, (error: Error | null, result: any) => {
        if (error) {
          console.error('Error updating tag item status:', error);
          setStatus({
            loading: false,
            message: `Error: ${error.message}`,
            type: 'error'
          });
        } else {
          console.log('Tag item status updated successfully, result:', result);
          setStatus({
            loading: false,
            message: `Item ${active ? 'deactivated' : 'activated'} successfully!`,
            type: 'success'
          });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({
              loading: false,
              message: '',
              type: 'info'
            });
          }, 3000);
        }
      });
    }, 100); // Short delay for UI feedback
  };

  // Render field input based on field type
  const renderFieldInput = (field: any, value: any, onChange: (value: any) => void, disabled = false) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <Textarea 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            value={value || ''} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            disabled={disabled}
          />
        );
      case 'boolean':
        return (
          <div 
            onClick={() => !disabled && onChange(!value)} 
            style={{ 
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: value ? '#4CAF50' : '#ccc',
              opacity: disabled ? 0.6 : 1
            }}
          >
            {value ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
            <span style={{ marginLeft: '0.5rem' }}>{value ? 'Yes' : 'No'}</span>
          </div>
        );
      case 'dropdown':
        return (
          <Select 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        );
      case 'date':
        return (
          <Input 
            type="date" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
          />
        );
      case 'color':
        return (
          <ColorPickerContainer>
            <ColorPickerWrapper>
              <ColorInput
                type="color"
                value={value || '#7a4e7a'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                disabled={disabled}
              />
            </ColorPickerWrapper>
            <ColorValue>{value || '#7a4e7a'}</ColorValue>
          </ColorPickerContainer>
        );
      case 'image':
        return (
          <ImageUploadContainer>
            {value ? (
              <ImagePreviewContainer>
                <ImagePreview src={value} alt="Uploaded image" />
                {!disabled && (
                  <RemoveImageButton onClick={() => onChange('')}>
                    <FaTimes /> Remove
                  </RemoveImageButton>
                )}
              </ImagePreviewContainer>
            ) : (
              <ImageUploadButton disabled={disabled}>
                <FaUpload />
                <span>Upload Image</span>
                <ImageInput
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        onChange(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={disabled}
                />
              </ImageUploadButton>
            )}
          </ImageUploadContainer>
        );
      default:
        return (
          <Input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            disabled={disabled}
          />
        );
    }
  };

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <AdminLayout>
        <Container>
          <SpinnerAnimation>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2rem' }} />
            </div>
          </SpinnerAnimation>
        </Container>
      </AdminLayout>
    );
  }

  // If tag not found, show error
  if (!tag) {
    return (
      <AdminLayout>
        <Container>
          <StatusMessage error>
            Tag not found. Please select a valid tag.
          </StatusMessage>
          <Button onClick={() => navigate('/admin/settings/all-layers')}>
            Back to All Tags
          </Button>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>{tag.name}</Title>
          <ButtonGroup>
            <Button primary onClick={() => setShowAddModal(true)}>
              <FaPlus /> Add New {tag.name}
            </Button>
          </ButtonGroup>
        </Header>

        {status.message && (
          <StatusMessage error={status.type === 'error'} success={status.type === 'success'}>
            {status.message}
          </StatusMessage>
        )}

        {items.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateIcon>
              <FaLayerGroup size={48} />
            </EmptyStateIcon>
            <EmptyStateTitle>No {tag.name} Found</EmptyStateTitle>
            <EmptyStateDescription>
              Get started by adding your first {tag.name.toLowerCase()}.
              This will help you organize and categorize your content effectively.
            </EmptyStateDescription>
            <EmptyStateAction onClick={() => setShowAddModal(true)}>
              <FaPlus /> Create Your First {tag.name}
            </EmptyStateAction>
          </EmptyStateContainer>
        ) : (
          <ItemsGrid>
            {items.map(item => (
              <ItemCard key={item._id}>
                <ItemHeader>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemActions>
                    <ActionButton 
                      onClick={() => setViewingItem(item)}
                      title="View Details"
                    >
                      <FaEye color="#3776a8" />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleToggleStatus(item._id!, item.active)}
                      title={item.active ? 'Deactivate' : 'Activate'}
                    >
                      {item.active ? <FaToggleOn color="#4CAF50" /> : <FaToggleOff />}
                    </ActionButton>
                    <ActionButton 
                      onClick={() => {
                        setCurrentItem(item);
                        setShowEditModal(true);
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDeleteItem(item._id!)}
                      title="Delete"
                    >
                      <FaTrash color="#d32f2f" />
                    </ActionButton>
                  </ItemActions>
                </ItemHeader>

                {/* Display only description if available */}
                {item.fields.map(field => {
                  const fieldDef = tag.fields.find(f => f.id === field.fieldId);
                  if (!fieldDef || !fieldDef.label.toLowerCase().includes('description')) return null;
                  
                  return (
                    <ItemField key={field.fieldId}>
                      <FieldLabel>{fieldDef.label}</FieldLabel>
                      <FieldValue>
                        {fieldDef.type === 'boolean' ? (
                          field.value ? 'Yes' : 'No'
                        ) : (
                          String(field.value || 'N/A')
                        )}
                      </FieldValue>
                    </ItemField>
                  );
                })}
              </ItemCard>
            ))}
          </ItemsGrid>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Add New {tag.name}</ModalTitle>
                <CloseButton onClick={() => setShowAddModal(false)}>&times;</CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label htmlFor="itemName">Name</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${tag.name.toLowerCase()} name`}
                />
              </FormGroup>

              {tag.fields.map(field => (
                <FormGroup key={field.id}>
                  <Label htmlFor={`field-${field.id}`}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </Label>
                  {renderFieldInput(
                    field,
                    newItem.fields?.find(f => f.fieldId === field.id)?.value,
                    (value) => handleFieldChange(field.id, value)
                  )}
                </FormGroup>
              ))}

              <ButtonGroup>
                <Button onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button primary onClick={handleCreateItem} disabled={status.loading}>
                  {status.loading ? (
                    <SpinnerAnimation>
                      <>
                        <FaSpinner className="spinner" />
                        <span style={{ marginLeft: '0.5rem' }}>Creating...</span>
                      </>
                    </SpinnerAnimation>
                  ) : `Create ${tag.name}`}
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}

        {/* View Item Modal */}
        {viewingItem && (
          <Modal>
            <ModalContent style={{ 
              padding: 0, 
              overflow: 'hidden',
              maxWidth: '600px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Header */}
              <div style={{
                background: '#7a4e7a',
                padding: '16px 20px',
                color: 'white',
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                    {viewingItem.name}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
                    {tag.name} Details
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: viewingItem.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {viewingItem.active ? <FaCheck size={10} /> : <FaTimes size={10} />}
                  {viewingItem.active ? 'Active' : 'Inactive'}
                </div>
                
                <CloseButton 
                  onClick={() => setViewingItem(null)}
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px',
                    color: 'white',
                    fontSize: '1.2rem',
                    opacity: 0.8
                  }}
                >
                  &times;
                </CloseButton>
              </div>
              
              {/* Content area */}
              <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #eee'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: '#444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaLayerGroup style={{ color: '#7a4e7a' }} /> Fields
                  </h3>
                </div>
                
                {/* Field items - styled to match the screenshots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {viewingItem.fields.map(field => {
                    const fieldDef = tag.fields.find(f => f.id === field.fieldId);
                    if (!fieldDef) return null;
                    
                    return (
                      <div key={field.fieldId}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 500, 
                          color: '#666',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaLayerGroup size={10} style={{ color: '#7a4e7a', opacity: 0.7 }} />
                          {fieldDef.label}
                        </div>
                        
                        {/* Display field value based on type - styled to match screenshots */}
                        {fieldDef.type === 'boolean' ? (
                          <div>
                            {field.value ? 'Yes' : 'No'}
                          </div>
                        ) : fieldDef.type === 'image' && String(field.value).startsWith('data:image') ? (
                          <div>
                            <img 
                              src={String(field.value)} 
                              alt={fieldDef.label}
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '180px',
                                borderRadius: '4px'
                              }} 
                            />
                          </div>
                        ) : (
                          <div style={{ 
                            fontSize: '0.95rem',
                            color: '#333',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {String(field.value || 'N/A')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Metadata section - styled to match screenshots */}
                {viewingItem.createdAt && (
                  <div style={{ 
                    marginTop: '24px', 
                    paddingTop: '16px',
                    borderTop: '1px solid #eee',
                    fontSize: '0.8rem',
                    color: '#777'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>Metadata</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>Created:</span> {new Date(viewingItem.createdAt).toLocaleString()}
                      </div>
                      {viewingItem.updatedAt && (
                        <div>
                          <span style={{ fontWeight: 500 }}>Updated:</span> {new Date(viewingItem.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer with actions - styled to match screenshots */}
              <div style={{ 
                borderTop: '1px solid #eee', 
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                background: '#fff'
              }}>
                <Button 
                  onClick={() => {
                    setCurrentItem(viewingItem);
                    setViewingItem(null);
                    setShowEditModal(true);
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: '#f5f5f5',
                    color: '#555',
                    padding: '8px 16px',
                    fontSize: '0.9rem'
                  }}
                >
                  <FaEdit size={14} /> Edit
                </Button>
                <Button 
                  primary 
                  onClick={() => setViewingItem(null)}
                  style={{
                    background: '#7a4e7a',
                    padding: '8px 20px',
                    fontSize: '0.9rem'
                  }}
                >
                  Close
                </Button>
              </div>
            </ModalContent>
          </Modal>
        )}
        
        {/* Edit Item Modal */}
        {showEditModal && currentItem && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Edit {tag.name} Item</ModalTitle>
                <CloseButton onClick={() => setShowEditModal(false)}>&times;</CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label htmlFor="editItemName">Name</Label>
                <Input
                  id="editItemName"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter item name"
                />
              </FormGroup>

              {tag.fields.map(field => {
                const fieldValue = currentItem.fields?.find(f => f.fieldId === field.id)?.value;
                
                return (
                  <FormGroup key={field.id}>
                    <Label htmlFor={`edit-field-${field.id}`}>
                      {field.label}
                      {field.required && <span style={{ color: 'red' }}> *</span>}
                    </Label>
                    {renderFieldInput(
                      field,
                      fieldValue,
                      (value) => {
                        setCurrentItem(prev => {
                          if (!prev) return null;
                          
                          return {
                            ...prev,
                            fields: prev.fields.map(f => 
                              f.fieldId === field.id ? { ...f, value } : f
                            )
                          };
                        });
                      }
                    )}
                  </FormGroup>
                );
              })}

              <ButtonGroup>
                <Button onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button primary onClick={handleUpdateItem} disabled={status.loading}>
                  {status.loading ? (
                    <SpinnerAnimation>
                      <>
                        <FaSpinner className="spinner" />
                        <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
                      </>
                    </SpinnerAnimation>
                  ) : 'Update Item'}
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

export default TagItemsComponent;
