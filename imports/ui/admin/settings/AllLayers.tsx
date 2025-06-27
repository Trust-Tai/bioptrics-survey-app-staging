import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaLayerGroup, FaPencilAlt, FaPlus, FaSpinner, FaToggleOff, FaToggleOn, FaTrash, FaTable, FaList, FaChevronDown, FaChevronRight, FaSave, FaTimes, FaFolder, FaArrowDown, FaChartBar, FaFont, FaHashtag, FaCheck, FaCalendar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { Layers, LayerField, Layer } from '../../../api/layers';
import { Questions } from '../../../features/questions/api/questions';
import { Surveys } from '../../../features/surveys/api/surveys';

// Define local Layer interface that extends the imported one
interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'boolean' | 'date';
  required: boolean;
  options?: string[];
}

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
  color?: string;
  questionCount?: number;
  surveyCount?: number;
  customFields?: CustomField[];
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
  width: fit-content;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const StatIcon = styled.div<{ color?: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#552a47'};
`;

const TagHierarchyTitle = styled.h2`
  font-size: 1.2rem;
  padding: 1rem;
  margin: 0;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const ListItem = styled.div<{ level: number }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  background: white;
  margin-left: ${props => props.level * 40}px;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const ListItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 0.5rem;
`;

const ListItemName = styled.div<{ isParent?: boolean; color?: string }>`
  font-weight: ${props => props.isParent ? '500' : '400'};
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  
  &:before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.color || '#7a4e7a'};
    margin-right: 8px;
  }
`;

const ListItemLocation = styled.span`
  font-size: 0.8rem;
  color: #777;
  text-transform: capitalize;
  margin-bottom: 0.25rem;
`;

const ListItemFields = styled.div`
  font-size: 0.9rem;
  color: #777;
  margin-left: auto;
  display: flex;
  gap: 8px;
`;

const UsageTag = styled.span`
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
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
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #999;
  
  &:hover {
    color: #333;
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
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-top: 0.25rem;
  
  &.nested-tag-select option {
    font-family: monospace;
    padding: 4px;
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
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  // Initialize with all items expanded by default
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
      customFields: [] // Initialize custom fields array
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
    customFields: [] // Initialize custom fields array
  });
  
  // Custom field state
  const [customFields, setCustomFields] = useState<Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'dropdown' | 'boolean' | 'date';
    required: boolean;
    options?: string[];
  }>>([]);
  
  // New custom field state
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'dropdown' | 'boolean' | 'date',
    required: false,
    options: ''
  });
  
  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});
  
  // Subscribe to layers collection and get usage data
  const { layers, isLoading } = useTracker(() => {
    const layersSub = Meteor.subscribe('layers.all');
    const questionsSub = Meteor.subscribe('questions.all');
    const surveysSub = Meteor.subscribe('surveys.all');
    
    const isReady = layersSub.ready() && questionsSub.ready() && surveysSub.ready();
    const layers = Layers.find({}, { sort: { createdAt: -1 } }).fetch();
    
    // Get all questions and surveys to calculate usage
    const questions = Questions.find({}).fetch();
    const surveys = Surveys.find({}).fetch();
    
    // Count tag usage in questions and surveys
    const tagUsage = new Map();
    
    // Count question usage
    questions.forEach(question => {
      const currentVersion = question.versions[question.currentVersion - 1];
      if (currentVersion) {
        // Check categoryTags
        if (currentVersion.categoryTags && Array.isArray(currentVersion.categoryTags)) {
          currentVersion.categoryTags.forEach(tagId => {
            if (!tagUsage.has(tagId)) {
              tagUsage.set(tagId, { questions: 0, surveys: 0 });
            }
            tagUsage.get(tagId).questions += 1;
          });
        }
        
        // Check labels (as shown in the screenshot)
        if (currentVersion.labels && Array.isArray(currentVersion.labels)) {
          currentVersion.labels.forEach(tagId => {
            if (!tagUsage.has(tagId)) {
              tagUsage.set(tagId, { questions: 0, surveys: 0 });
            }
            tagUsage.get(tagId).questions += 1;
          });
        }
      }
    });
    
    // Count survey usage
    surveys.forEach(survey => {
      // Check selectedTags array
      if (survey.selectedTags && Array.isArray(survey.selectedTags)) {
        survey.selectedTags.forEach(tagId => {
          if (!tagUsage.has(tagId)) {
            tagUsage.set(tagId, { questions: 0, surveys: 0 });
          }
          tagUsage.get(tagId).surveys += 1;
        });
      }
      
      // Check templateTags if present
      if (survey.templateTags && Array.isArray(survey.templateTags)) {
        survey.templateTags.forEach(tagId => {
          if (!tagUsage.has(tagId)) {
            tagUsage.set(tagId, { questions: 0, surveys: 0 });
          }
          tagUsage.get(tagId).surveys += 1;
        });
      }
    });
    
    // Add usage counts to layers
    const layersWithUsage = layers.map(layer => ({
      ...layer,
      questionCount: (tagUsage.get(layer._id) || { questions: 0 }).questions,
      surveyCount: (tagUsage.get(layer._id) || { surveys: 0 }).surveys
    }));
    
    console.log('Subscription ready:', isReady);
    console.log('Layers found:', layersWithUsage.length);
    
    return {
      layers: layersWithUsage,
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

  // Set all items to be expanded by default when layers are loaded
  useEffect(() => {
    if (layers.length > 0) {
      const allItemIds = layers.map(layer => layer._id || '');
      setExpandedItems(allItemIds);
    }
  }, [layers]);

  // Render nested tag options for the parent tag dropdown
  const renderNestedTagOptions = (allLayers: any[], currentLayerId: string) => {
    // Build a hierarchical structure of tags
    const tagMap = new Map();
    const rootTags: any[] = [];
    
    // First pass: create a map of all tags with empty children arrays
    allLayers.forEach(tag => {
      if (tag && tag._id && tag._id !== currentLayerId) {
        tagMap.set(tag._id, { ...tag, children: [] });
      }
    });
    
    // Second pass: build the hierarchy
    allLayers.forEach(tag => {
      if (tag._id !== currentLayerId) { // Skip the current layer to avoid self-reference
        if (tag.parentId && tagMap.has(tag.parentId)) {
          // This tag has a parent, add it to the parent's children
          const parent = tagMap.get(tag.parentId);
          if (parent && parent.children) {
            parent.children.push(tagMap.get(tag._id));
          }
        } else {
          // This is a root tag (no parent)
          if (tag._id && tagMap.has(tag._id)) {
            rootTags.push(tagMap.get(tag._id));
          }
        }
      }
    });
    
    // Function to render options recursively with proper indentation
    const renderOptions = (tags: any[], depth = 0) => {
      return tags.flatMap(tag => {
        if (!tag || tag._id === currentLayerId) return [];
        
        // Create indentation based on depth
        const indent = '\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for indentation
        const prefix = depth > 0 ? '\u2514\u2500 ' : ''; // Box drawing characters: └─
        
        // Create the option for this tag
        const option = (
          <option key={tag._id} value={tag._id}>
            {indent}{prefix}{tag.name}
          </option>
        );
        
        // Recursively render children options
        if (tag.children && tag.children.length > 0) {
          return [option, ...renderOptions(tag.children, depth + 1)];
        }
        
        return option;
      });
    };
    
    // Start rendering from root tags
    return renderOptions(rootTags);
  };
  
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
      customFields: [] // Reset custom fields
    });
    
    // Reset custom fields state
    setCustomFields([]);
    setErrors({});
    setIsModalOpen(true);
  };
  
  // Edit existing tag
  const editTag = (tagId: string) => {
    // Find the tag to edit
    const tagToEdit = layers.find(l => l._id === tagId);
    
    if (tagToEdit) {
      // Set the layer state with the tag data
      setLayer({
        ...tagToEdit,
        id: tagToEdit.id || `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        parentId: tagToEdit.parentId || '',
        fields: tagToEdit.fields || [],
        active: tagToEdit.active !== undefined ? tagToEdit.active : true,
        color: tagToEdit.color || '#552a47',
        location: tagToEdit.location || 'surveys',
        customFields: tagToEdit.customFields || []
      });
      
      // Set custom fields state
      setCustomFields(tagToEdit.customFields || []);
      
      // Clear errors
      setErrors({});
      
      // Open the modal
      setIsModalOpen(true);
    }
  };
  
  // Close the modal function is already defined above
  
  // Handle adding a new custom field
  const handleAddCustomField = () => {
    if (!newCustomField.name) return;
    
    const newField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newCustomField.name,
      type: newCustomField.type,
      required: newCustomField.required,
      options: newCustomField.type === 'dropdown' ? newCustomField.options.split(',').map(opt => opt.trim()) : undefined
    };
    
    setCustomFields([...customFields, newField]);
    
    // Update layer state with the new custom field
    setLayer(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField]
    }));
    
    // Reset new custom field form
    setNewCustomField({
      name: '',
      type: 'text',
      required: false,
      options: ''
    });
  };
  
  // Handle removing a custom field
  const handleRemoveCustomField = (id: string) => {
    const updatedFields = customFields.filter(field => field.id !== id);
    setCustomFields(updatedFields);
    
    // Update layer state
    setLayer(prev => ({
      ...prev,
      customFields: updatedFields
    }));
  };
  
  // Handle custom field input changes
  const handleCustomFieldInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewCustomField(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewCustomField(prev => ({ ...prev, [name]: value }));
    }
  };
  
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
        fields: layer.fields || [],
        customFields: layer.customFields || []
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
      
      // Ensure custom fields are included in the new tag
      const newLayer = {
        ...layer,
        customFields: customFields // Explicitly include the custom fields from state
      };
      
      console.log('Creating new tag with data:', newLayer);
      
      Meteor.call('layers.create', newLayer, (error: Meteor.Error) => {
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {hasChildren ? (
                <div style={{ marginRight: '8px', color: '#555' }}>
                  <FaFolder size={16} color={layer.color || '#7a4e7a'} />
                </div>
              ) : (
                <div style={{ marginRight: '8px', width: '16px' }}></div>
              )}
              <ListItemName isParent={hasChildren} color={layer.color}>{layer.name}</ListItemName>
            </div>
            <ListItemFields>
              <UsageTag title="Total uses in questions and surveys">
                {(layer.questionCount || 0) + (layer.surveyCount || 0)} uses
              </UsageTag>
            </ListItemFields>
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
  
  // Calculate statistics for the dashboard
  const stats = useMemo(() => {
    // Total tags count
    const totalTags = layers.length;
    
    // Count unique categories (parent tags)
    const categories = new Set();
    layers.forEach(layer => {
      if (!layer.parentId) {
        categories.add(layer._id);
      }
    });
    
    // Calculate max depth of the tag hierarchy
    const getDepth = (layerId: string, currentDepth = 1): number => {
      const children = layers.filter(l => l.parentId === layerId);
      if (children.length === 0) return currentDepth;
      
      return Math.max(...children.map(child => getDepth(child._id || '', currentDepth + 1)));
    };
    
    const rootLayers = layers.filter(l => !l.parentId);
    const maxDepth = rootLayers.length > 0 
      ? Math.max(...rootLayers.map(root => getDepth(root._id || ''))) 
      : 0;
    
    // Calculate total usage (sum of question and survey usage across all tags)
    const totalUsage = layers.reduce((sum, layer) => {
      return sum + (layer.questionCount || 0) + (layer.surveyCount || 0);
    }, 0);
    
    return {
      totalTags,
      categories: categories.size,
      maxDepth,
      totalUsage
    };
  }, [layers]);

  // Organize layers into hierarchical structure for tree view
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
        
        <StatsContainer>
          <StatCard>
            <StatContent>
              <StatTitle>Total Tags</StatTitle>
              <StatValue>{stats.totalTags}</StatValue>
            </StatContent>
            <StatIcon color="#3498db">
              <FaLayerGroup size={24} />
            </StatIcon>
          </StatCard>
          
          <StatCard>
            <StatContent>
              <StatTitle>Max Depth</StatTitle>
              <StatValue>{stats.maxDepth}</StatValue>
            </StatContent>
            <StatIcon color="#9b59b6">
              <FaArrowDown size={24} />
            </StatIcon>
          </StatCard>
          
          <StatCard>
            <StatContent>
              <StatTitle>Total Usage</StatTitle>
              <StatValue>{stats.totalUsage}</StatValue>
            </StatContent>
            <StatIcon color="#e67e22">
              <FaChartBar size={24} />
            </StatIcon>
          </StatCard>
        </StatsContainer>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search tags..."
            style={{ 
              height: '38px', 
              fontSize: '14px', 
              padding: '0 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              width: '300px'
            }}
          />
          
          <ViewToggleGroup>
            <ViewToggleButton 
              active={viewMode === 'tree'} 
              onClick={() => setViewMode('tree')}
            >
              <FaList /> Tree
            </ViewToggleButton>
            <ViewToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FaTable /> List
            </ViewToggleButton>
          </ViewToggleGroup>
        </div>

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
        ) : viewMode === 'list' ? (
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
            <TagHierarchyTitle>Tag Hierarchy</TagHierarchyTitle>
            <div style={{ padding: '1rem' }}>
              {hierarchicalLayers.map(layer => renderTagItem(layer))}
            </div>
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
                  className="nested-tag-select"
                >
                  <option value="">None (Top Level Tag)</option>
                  {renderNestedTagOptions(layers, layer._id)}
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
              
              {/* Custom Fields Section */}
              <FormGroup>
                <Label style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginTop: '30px', 
                  marginBottom: '20px',
                  color: '#333'
                }}>Custom Fields</Label>
                
                {/* Add new custom field form */}
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '24px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  border: '1px solid #eaeaea'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '20px' 
                  }}>
                    <div>
                      <Label htmlFor="customFieldName" style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'block',
                        color: '#444'
                      }}>Field Name</Label>
                      <div style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        <Input
                          id="customFieldName"
                          name="name"
                          type="text"
                          value={newCustomField.name}
                          onChange={handleCustomFieldInputChange}
                          placeholder="Enter field name"
                          style={{
                            width: '100%',
                            height: '42px',
                            fontSize: '14px',
                            borderColor: '#d0d0d0',
                            borderRadius: '6px',
                            paddingLeft: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="customFieldType" style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'block',
                        color: '#444'
                      }}>Field Type</Label>
                      <div style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        <Select
                          id="customFieldType"
                          name="type"
                          value={newCustomField.type}
                          onChange={handleCustomFieldInputChange}
                          style={{
                            width: '100%',
                            height: '42px',
                            fontSize: '14px',
                            borderColor: '#d0d0d0',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            paddingLeft: '10px',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px top 50%',
                            backgroundSize: '10px auto',
                            paddingRight: '30px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="boolean">Yes/No</option>
                          <option value="date">Date</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {newCustomField.type === 'dropdown' && (
                    <div style={{ marginBottom: '20px' }}>
                      <Label htmlFor="customFieldOptions" style={{ 
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'block',
                        color: '#444'
                      }}>Options (comma separated)</Label>
                      <div style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        <Input
                          id="customFieldOptions"
                          name="options"
                          type="text"
                          value={newCustomField.options}
                          onChange={handleCustomFieldInputChange}
                          placeholder="Option 1, Option 2, Option 3"
                          style={{
                            width: '100%',
                            height: '42px',
                            fontSize: '14px',
                            borderColor: '#d0d0d0',
                            borderRadius: '6px',
                            paddingLeft: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                        Enter options separated by commas
                      </div>
                    </div>
                  )}
                  
                  <div style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    alignItems: 'center',
                    background: '#f0f0f0',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '20px',
                      height: '20px',
                      marginRight: '10px'
                    }}>
                      <input
                        id="customFieldRequired"
                        name="required"
                        type="checkbox"
                        checked={newCustomField.required}
                        onChange={handleCustomFieldInputChange}
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#552a47'
                        }}
                      />
                    </div>
                    <Label htmlFor="customFieldRequired" style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      fontWeight: '500',
                      marginLeft: '8px',
                      cursor: 'pointer',
                      color: '#444'
                    }}>Required Field</Label>
                    
                    <div style={{ marginLeft: 'auto' }}>
                      <Button 
                        onClick={handleAddCustomField} 
                        style={{ 
                          padding: '8px 16px',
                          background: '#552a47',
                          color: 'white',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(85, 42, 71, 0.2)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <FaPlus size={12} /> Add Field
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* List of added custom fields */}
                {customFields.length > 0 && (
                  <div style={{ 
                    marginTop: '20px',
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #eaeaea',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <Label style={{ 
                        fontSize: '15px', 
                        fontWeight: '600',
                        margin: 0,
                        color: '#444'
                      }}>Custom Fields</Label>
                      <div style={{ 
                        background: '#e8f4fd', 
                        padding: '4px 10px', 
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#0277bd'
                      }}>{customFields.length} {customFields.length === 1 ? 'field' : 'fields'}</div>
                    </div>
                    
                    <div style={{ 
                      maxHeight: '250px', 
                      overflowY: 'auto', 
                      borderRadius: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid #e0e0e0'
                    }}>
                      {customFields.length > 0 ? (
                        customFields.map((field, index) => (
                          <div key={field.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: index < customFields.length - 1 ? '1px solid #eee' : 'none',
                            background: '#fff',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <div>
                              <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#555'
                                }}>
                                  {field.type === 'text' && <FaFont size={12} />}
                                  {field.type === 'number' && <FaHashtag size={12} />}
                                  {field.type === 'dropdown' && <FaList size={12} />}
                                  {field.type === 'boolean' && <FaCheck size={12} />}
                                  {field.type === 'date' && <FaCalendar size={12} />}
                                </div>
                                <span style={{ 
                                  fontWeight: '600', 
                                  fontSize: '14px',
                                  color: '#333'
                                }}>{field.name}</span>
                                {field.required && (
                                  <span style={{ 
                                    color: '#e74c3c',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: '#ffebee',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>Required</span>
                                )}
                              </div>
                              <div style={{ 
                                color: '#666', 
                                fontSize: '13px',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span style={{ 
                                  background: '#f5f5f5',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  textTransform: 'capitalize',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}>{field.type}</span>
                                {field.type === 'dropdown' && field.options && (
                                  <span style={{ fontSize: '12px' }}>
                                    Options: {field.options.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleRemoveCustomField(field.id)}
                              style={{ 
                                padding: '6px 10px', 
                                background: '#fff', 
                                color: '#c62828',
                                border: '1px solid #ffcdd2',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              title="Remove field"
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#666',
                          fontStyle: 'italic'
                        }}>
                          No custom fields added yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
