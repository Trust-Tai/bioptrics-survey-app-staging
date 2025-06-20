import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaLayerGroup, FaPencilAlt, FaPlus, FaSpinner, FaToggleOff, FaToggleOn, FaTrash, FaTable, FaList, FaChevronDown, FaChevronRight, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { Layers, LayerField, Layer } from '../../../api/layers';

// Define local Layer interface that extends the imported one
interface LayerDisplay {
  _id?: string;
  name: string;
  location: string; // Changed from 'surveys' | 'questions' to string to match actual data
  priority?: number; // Made optional to match actual data
  fields: LayerField[] | []; // Allow empty array
  createdAt: Date;
  active?: boolean;
  parentId?: string;
  children?: LayerDisplay[];
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

const ViewToggleGroup = styled.div`
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ViewToggleButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : '#e0e0e0'};
  }
`;

const ListViewContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 1rem;
`;

const ListItem = styled.div<{ level: number }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #7a4e7a;
  margin-left: ${props => props.level * 20}px;
  margin-bottom: 0.5rem;
  width: calc(100% - ${props => props.level * 20}px);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ListItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 0.5rem;
`;

const ListItemName = styled.span<{ isParent?: boolean }>`
  font-weight: ${props => props.isParent ? '700' : '600'};
  color: ${props => props.isParent ? '#552a47' : '#333'};
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const ListItemLocation = styled.span`
  font-size: 0.8rem;
  color: #777;
  text-transform: capitalize;
  margin-bottom: 0.25rem;
`;

const ListItemFields = styled.span`
  font-size: 0.8rem;
  color: #777;
`;

const ListItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const ToggleIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 8px;
  color: #552a47;
  
  &:hover {
    color: #7a4e7a;
  }
`;

const StatusIndicator = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.active ? '#4CAF50' : '#ccc'};
  font-size: 1.2rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #552a47 0%, #7a4e7a 100%)' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: ${props => props.primary ? 'linear-gradient(135deg, #4a2540 0%, #6a4269 100%)' : '#eaeaea'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  
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
  
  tr:last-child td {
    border-bottom: none;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #777;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px dashed #ddd;
  
  h3 {
    margin-bottom: 1rem;
    color: #555;
    font-weight: 500;
  }
  
  p {
    margin-bottom: 1.5rem;
    max-width: 400px;
    line-height: 1.5;
  }
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #aaa;
  }
`;

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

// Modal components for tag creation popup
const ModalOverlay = styled.div`
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
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
    box-shadow: 0 0 0 2px rgba(122, 78, 122, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #7a4e7a;
    box-shadow: 0 0 0 2px rgba(122, 78, 122, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const StatusMessage = styled.div<{ success?: boolean; error?: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#e7f7ed' : props.error ? '#ffebee' : '#f5f5f5'};
  color: ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#555'};
  border-left: 4px solid ${props => props.success ? '#2e7d32' : props.error ? '#c62828' : '#ddd'};
`;

// AllLayers Component
const AllLayers = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [status, setStatus] = useState<{ 
    loading: boolean; 
    message: string; 
    type: 'success' | 'error' | 'info' 
  }>({ 
    loading: false, 
    message: '', 
    type: 'info' 
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Function to close the modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setLayer({
      name: '',
      parentId: '',
      fields: [],
      active: true,
      color: '#552a47',
      location: 'surveys',
    });
    setErrors({});
  };
  
  // Tag form state
  const [layer, setLayer] = useState<Partial<Layer>>({
    name: '',
    parentId: '',
    fields: [],
    active: true,
    color: '#552a47',
    location: 'surveys', // Default location - surveys only
  });
  
  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});
  
  // Subscribe to layers collection
  const { layers, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    const isReady = subscription.ready();
    const layers = Layers.find({}, { sort: { createdAt: -1 } }).fetch();
    
    console.log('Subscription ready:', isReady);
    console.log('Layers found:', layers.length);
    
    return {
      layers,
      isLoading: !isReady
    };
  }, []);
  
  // Force the component to show the empty state after a timeout
  // This ensures that even if the subscription is stuck, we'll show something
  const [forceShowContent, setForceShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowContent(true);
    }, 3000); // Wait 3 seconds before forcing content display
    
    // Check for success message in localStorage
    const successMessage = localStorage.getItem('layerActionSuccess');
    if (successMessage) {
      setStatus({
        loading: false,
        message: successMessage,
        type: 'success'
      });
      
      // Clear the message from localStorage
      localStorage.removeItem('layerActionSuccess');
      
      // Auto-hide the success message after 5 seconds
      setTimeout(() => {
        setStatus({
          loading: false,
          message: '',
          type: 'info'
        });
      }, 5000);
    }
    
    // Check for error message in localStorage
    const errorMessage = localStorage.getItem('layerActionError');
    if (errorMessage) {
      setStatus({
        loading: false,
        message: errorMessage,
        type: 'error'
      });
      
      // Clear the message from localStorage
      localStorage.removeItem('layerActionError');
      
      // Auto-hide the error message after 8 seconds
      setTimeout(() => {
        setStatus({
          loading: false,
          message: '',
          type: 'info'
        });
      }, 8000);
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Delete a tag
  const deleteTag = (layerId: string, layerName: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${layerName}"?`)) {
      setStatus({ loading: true, message: 'Deleting tag...', type: 'info' });
      
      Meteor.call('layers.remove', layerId, (error: Error | null, result: string) => {
        if (error) {
          console.error('Error deleting tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag deleted successfully:', result);
          setStatus({ loading: false, message: `Tag "${layerName}" deleted successfully!`, type: 'success' });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({ loading: false, message: '', type: 'info' });
          }, 3000);
        }
      });
    }
  };

  // Edit a tag
  const editTag = (layerId: string) => {
    // Find the layer by ID
    const layerToEdit = Layers.findOne(layerId);
    
    if (layerToEdit) {
      // Set the layer data in the form
      setLayer({
        _id: layerToEdit._id,
        id: layerToEdit.id,
        name: layerToEdit.name || '',
        location: layerToEdit.location || 'surveys',
        fields: layerToEdit.fields || [],
        active: layerToEdit.active !== undefined ? layerToEdit.active : true,
        parentId: layerToEdit.parentId || '',
        color: layerToEdit.color || '#552a47',
      });
      
      // Open the modal
      setIsModalOpen(true);
    } else {
      console.error('Layer not found:', layerId);
      setStatus({ loading: false, message: 'Error: Tag not found', type: 'error' });
    }
  };

  // Toggle tag active status
  const toggleTagStatus = (layerId: string, newActiveStatus: boolean) => {
    setStatus({ loading: true, message: `${newActiveStatus ? 'Activating' : 'Deactivating'} tag...`, type: 'info' });
    
    Meteor.call('layers.updateStatus', layerId, newActiveStatus, (error: Error | null) => {
      if (error) {
        console.error('Error updating tag status:', error);
        setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
      } else {
        console.log(`Tag status updated to ${newActiveStatus ? 'active' : 'inactive'}`);
        setStatus({ 
          loading: false, 
          message: `Tag ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`, 
          type: 'success' 
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({ loading: false, message: '', type: 'info' });
        }, 3000);
      }
    });
  };

  // Open the create tag modal
  const createNewTag = () => {
    // Reset form state
    setLayer({
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
      name: '',
      parentId: '',
      fields: [],
      active: true,
      color: '#552a47',
      location: 'surveys', // Default location - surveys only
    });
    setErrors({});
    setIsModalOpen(true);
  };
  
  // Close the modal
  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear validation error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLayer(prev => ({ ...prev, [name]: checked }));
    } else {
      setLayer(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: { name?: string } = {};
    
    if (!layer.name) {
      newErrors.name = 'Tag name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save tag (create or update)
  const handleSaveTag = () => {
    if (!validateForm()) {
      return;
    }
    
    if (layer._id) {
      // Update existing tag
      setStatus({ loading: true, message: 'Updating tag...', type: 'info' });
      
      const updatedLayer = {
        id: layer.id,
        name: layer.name || '',
        location: layer.location || 'surveys',
        active: layer.active !== undefined ? layer.active : true,
        parentId: layer.parentId || undefined,
        color: layer.color || '#552a47',
        fields: layer.fields || []
      };
      
      Meteor.call('layers.update', layer._id, updatedLayer, (error: Meteor.Error) => {
        if (error) {
          console.error('Error updating tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag updated successfully');
          setStatus({ loading: false, message: 'Tag updated successfully!', type: 'success' });
          closeModal();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({ loading: false, message: '', type: 'info' });
          }, 3000);
        }
      });
    } else {
      // Create new tag
      setStatus({ loading: true, message: 'Creating tag...', type: 'info' });
      
      Meteor.call('layers.create', layer, (error: Meteor.Error) => {
        if (error) {
          console.error('Error creating tag:', error);
          setStatus({ loading: false, message: `Error: ${error.message}`, type: 'error' });
        } else {
          console.log('Tag created successfully');
          setStatus({ loading: false, message: 'Tag created successfully!', type: 'success' });
          closeModal();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setStatus({ loading: false, message: '', type: 'info' });
          }, 3000);
        }
      });
    }
  };

  // Toggle item expansion in list view
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Function to render a tag item with its children recursively
  const renderTagItem = (layer: LayerDisplay, level: number = 0): React.ReactNode => {
    const hasChildren = layer.children && layer.children.length > 0;
    const isExpanded = expandedItems.includes(layer._id || '');
    
    return (
      <React.Fragment key={layer._id}>
        <ListItem level={level}>
          {hasChildren && (
            <ToggleIcon onClick={() => toggleItemExpansion(layer._id || '')}>
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </ToggleIcon>
          )}
          {!hasChildren && <div style={{ width: 24, marginRight: 8 }} />}
          
          <StatusIndicator active={layer.active} onClick={() => toggleTagStatus(layer._id || '', !layer.active)}>
            {layer.active ? <FaToggleOn /> : <FaToggleOff />}
          </StatusIndicator>
          
          <ListItemContent>
            <ListItemName isParent={hasChildren}>{layer.name}</ListItemName>
            <ListItemLocation>{layer.location}</ListItemLocation>
            <ListItemFields>{layer.fields.length} fields</ListItemFields>
          </ListItemContent>
          
          <ListItemActions>
            <ActionButton
              title="Edit Tag"
              onClick={() => editTag(layer._id || '')}
              disabled={status.loading}
            >
              <FaPencilAlt size={14} />
            </ActionButton>
            <ActionButton
              title="Delete Tag"
              onClick={() => deleteTag(layer._id || '', layer.name || 'Unnamed Tag')}
              disabled={status.loading}
            >
              {status.loading ? <FaSpinner size={14} /> : <FaTrash size={14} color="#e74c3c" />}
            </ActionButton>
          </ListItemActions>
        </ListItem>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && layer.children?.map(child => renderTagItem(child, level + 1))}
      </React.Fragment>
    );
  };
  
  // Organize layers into hierarchical structure for list view
  const hierarchicalLayers = useMemo(() => {
    // First pass: create a map of all layers with empty children arrays
    const layerMap = new Map<string, LayerDisplay>();
    layers.forEach(layer => {
      layerMap.set(layer._id || '', {
        ...layer,
        children: []
      });
    });
    
    // Second pass: build the hierarchy by adding children to their parents
    const rootLayers: LayerDisplay[] = [];
    
    layers.forEach(layer => {
      if (layer.parentId && layerMap.has(layer.parentId)) {
        // This layer has a parent, add it to the parent's children
        const parent = layerMap.get(layer.parentId);
        if (parent && parent.children) {
          parent.children.push(layerMap.get(layer._id || '') as LayerDisplay);
        }
      } else {
        // This is a root layer (no parent)
        rootLayers.push(layerMap.get(layer._id || '') as LayerDisplay);
      }
    });
    
    // Sort the root layers and their children by name
    const sortLayersByName = (layers: LayerDisplay[]): LayerDisplay[] => {
      return layers.sort((a, b) => a.name.localeCompare(b.name)).map(layer => {
        if (layer.children && layer.children.length > 0) {
          return {
            ...layer,
            children: sortLayersByName(layer.children)
          };
        }
        return layer;
      });
    };
    
    return sortLayersByName(rootLayers);
  }, [layers]);

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Tags and Classifications</Title>
          <ButtonGroup>
            <Button primary onClick={createNewTag}>
              <FaPlus /> Create New Tag
            </Button>
          </ButtonGroup>
        </Header>
        
        <ViewToggleGroup>
          <ViewToggleButton 
            active={viewMode === 'table'} 
            onClick={() => setViewMode('table')}
          >
            <FaTable /> Table View
          </ViewToggleButton>
          <ViewToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <FaList /> List View
          </ViewToggleButton>
        </ViewToggleGroup>

        {status.message && (
          <StatusMessage success={status.type === 'success'} error={status.type === 'error'}>
            {status.message}
          </StatusMessage>
        )}

        {isLoading && !forceShowContent ? (
          <LoadingSpinner>
            <FaSpinner size={24} />
            <span style={{ marginLeft: '0.5rem' }}>Loading tags...</span>
          </LoadingSpinner>
        ) : layers.length === 0 ? (
          <EmptyState>
            <FaLayerGroup size={48} />
            <h3>No Tags Available</h3>
            <p>You haven't created any tags yet. Tags help you organize fields and customize your surveys and questions.</p>
            <Button primary onClick={createNewTag}>
              Create Your First Tag
            </Button>
          </EmptyState>
        ) : viewMode === 'table' ? (
          <Table>
            <thead>
              <tr>
                <th>Tag Name</th>
                {/* Location column removed */}
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Fields</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {layers.map(layer => (
                <tr key={layer._id}>
                  <td>{layer.name}</td>
                  {/* Location column data removed */}
                  <td>{layer.priority}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div 
                        onClick={() => toggleTagStatus(layer._id || '', !layer.active)}
                        style={{ 
                          cursor: 'pointer',
                          color: layer.active ? '#4CAF50' : '#ccc'
                        }}
                      >
                        {layer.active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </div>
                      <span>{layer.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>{layer.createdAt.toLocaleDateString()}</td>
                  <td>{layer.fields.length} fields</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionButton
                        title="Edit Tag"
                        onClick={() => editTag(layer._id || '')}
                        disabled={status.loading}
                      >
                        <FaPencilAlt />
                      </ActionButton>
                      <ActionButton
                        title="Delete Tag"
                        onClick={() => deleteTag(layer._id || '', layer.name || 'Unnamed Tag')}
                        disabled={status.loading}
                      >
                        {status.loading ? <FaSpinner /> : <FaTrash color="#e74c3c" />}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <ListViewContainer>
            {hierarchicalLayers.map(layer => renderTagItem(layer))}
          </ListViewContainer>
        )}
      </Container>
      
      {/* Tag Creation Modal */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{layer._id ? 'Edit Tag' : 'Create New Tag'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
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
                <Label htmlFor="parentId">Parent Tag</Label>
                <Select
                  id="parentId"
                  name="parentId"
                  value={layer.parentId || ''}
                  onChange={handleInputChange}
                >
                  <option value="">None (Top Level Tag)</option>
                  {layers.filter(l => l._id !== layer._id).map(parentLayer => (
                    <option key={parentLayer._id} value={parentLayer._id}>
                      {parentLayer.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="color">Tag Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      backgroundColor: layer.color || '#552a47',
                      border: '1px solid #ddd',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      marginRight: '10px'
                    }}
                  />
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={layer.color || '#552a47'}
                    onChange={handleInputChange}
                    style={{
                      width: '100px',
                      height: '36px',
                      padding: '2px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
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
            </ModalBody>
            
            <ModalFooter>
              <Button onClick={closeModal}>Cancel</Button>
              <Button primary onClick={handleSaveTag} disabled={status.loading}>
                {status.loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '0.5rem' }}>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave style={{ marginRight: '0.5rem' }} />
                    Save Tag
                  </>
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

export default AllLayers;
