import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { FaLayerGroup, FaPencilAlt, FaPlus, FaSpinner, FaToggleOff, FaToggleOn, FaTrash, FaTable, FaList, FaChevronDown, FaChevronRight, FaSave, FaTimes, FaFolder, FaArrowDown, FaChartBar, FaFont, FaHashtag, FaCheck, FaCalendar, FaSearch, FaFilter, FaChevronLeft, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { Layers, LayerField, Layer } from '../../../api/layers';
import { Questions } from '../../../features/questions/api/questions';
import { Surveys } from '../../../features/surveys/api/surveys';
import { useTheme } from '../../../contexts/ThemeContext';
import ReactSelect, { components } from 'react-select';

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
  color?: string;
  questionCount?: number;
  surveyCount?: number;
  description?: string; // Added description field
}

// Styled Components
const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  padding: 1.5rem;
  box-shadow: 0px 0px 10px 0px #0000001A;
  border-radius: 20px;
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
  width: max-content;
  margin: auto;
`;

const ViewToggleButton = styled.button<{ active?: boolean; theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? `linear-gradient(135deg, ${props.theme?.primaryColor || '#552a47'} 0%, ${props.theme?.secondaryColor || '#7a4e7a'} 100%)` : 'transparent'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? `linear-gradient(135deg, ${props.theme?.primaryColor || '#552a47'} 0%, ${props.theme?.secondaryColor || '#7a4e7a'} 100%)` : '#e0e0e0'};
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

const Button = styled.button<{ primary?: boolean; theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.primary ? `linear-gradient(135deg, ${props.theme?.primaryColor || '#552a47'} 0%, ${props.theme?.secondaryColor || '#7a4e7a'} 100%)` : '#f5f5f5'};
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
    background: ${props => props.primary ? `linear-gradient(135deg, ${props.theme?.primaryColor || '#4a2540'} 0%, ${props.theme?.secondaryColor || '#6a4269'} 100%)` : '#eaeaea'};
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

const ActionButton = styled.button<{ theme?: any }>`
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme?.secondaryColor || '#7a4e7a'};
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.theme?.primaryColor || '#552a47'};
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
    margin: 1rem 0 0.5rem;
    color: #333;
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
  background-color: rgba(0, 0, 0, 0.7); /* Darker overlay for better contrast */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  z-index: 9999; /* Significantly increased z-index to ensure modal appears above all elements */
  width: 100vw; /* Ensure full width coverage */
  height: 100vh; /* Ensure full height coverage */
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); /* Enhanced shadow for better depth */
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  z-index: 10000; /* Even higher z-index than the overlay to ensure content is above everything */
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

const FilterSection = styled.div`
  /* React Select Styling */
  .react-select-container .react-select__control {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    min-height: 38px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    background-color: white;
  }
  
  .react-select-container .react-select__control:hover {
    border-color: #552a47;
  }
  
  .react-select-container .react-select__control--is-focused {
    border-color: transparent;
    box-shadow: none;
    background-color: white;
  }
  
  .react-select-container .react-select__menu {
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    background-color: white;
  }
  
  .react-select-container .react-select__option {
    padding: 8px 12px;
    background-color: white;
  }
  
  .react-select-container .react-select__option--is-focused {
    background-color: #f0e6ee;
    color: #552a47;
  }
  
  .react-select-container .react-select__option--is-selected {
    background-color: #552a47;
    color: white;
  }
  
  .react-select-container .react-select__multi-value {
    background-color: #f7f2f5;
    border-radius: 4px;
  }
  
  .react-select-container .react-select__multi-value__label {
    color: #552a47;
    font-size: 14px;
    padding: 2px 6px;
  }
  
  .react-select-container .react-select__multi-value__remove {
    color: #552a47;
  }
  
  .react-select-container .react-select__multi-value__remove:hover {
    background-color: #552a47;
    color: white;
  }
  
  .react-select-container .react-select__placeholder {
    color: #999;
  }
  
  .react-select-container .react-select__value-container {
    background-color: white;
  }
  
  .react-select-container .react-select__input {
    color: #333;
    box-shadow: none;
    outline: none;
    border: none;
  }
  
  .react-select-container .react-select__input-container {
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
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

const StatusMessage = styled.div<{ success?: boolean; error?: boolean; warning?: boolean }>`
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  background-color: ${props => 
    props.success ? '#e6f7e6' : 
    props.error ? '#ffebee' : 
    props.warning ? '#fff8e1' : 
    '#e3f2fd'};
  color: ${props => 
    props.success ? '#2e7d32' : 
    props.error ? '#c62828' : 
    props.warning ? '#f57c00' : 
    '#0d47a1'};
  border-left: 4px solid ${props => 
    props.success ? '#2e7d32' : 
    props.error ? '#c62828' : 
    props.warning ? '#f57c00' : 
    '#0d47a1'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// ... (rest of the code remains the same)
const findQuestionsByTagId = (tagId: string | undefined): string[] => {
  if (!tagId) return [];
  // Use Questions collection directly instead of questions variable
  const allQuestions = Questions.find({}).fetch();
  if (!allQuestions || !Array.isArray(allQuestions)) return [];
  
  return allQuestions
    .filter(q => q.versions.some(v => {
      // Handle potential undefined labels
      const labels = (v as any).labels || [];
      return labels.includes(tagId);
    }))
    .map(q => q._id);
};

const getTagsForQuestion = (questionId: string | undefined): string[] => {
  if (!questionId) return [];
  // Use Questions collection directly instead of questions variable
  const question = Questions.findOne({ _id: questionId });
  if (!question) return [];
  
  // Get all unique tag IDs from all versions
  const allTagIds = question.versions.flatMap(v => (v as any).labels || []);
  return [...new Set(allTagIds)];
};

const AllLayers = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  
  // Modal state is defined below
  // Initialize with all items expanded by default
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
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
  
  // Auto-save state
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'unsaved' | 'saving' | 'saved' | ''>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to close the modal and reset form
  const closeModal = () => {
    // If there are unsaved changes, auto-save before closing
    if (hasChanges && autoSaveStatus !== 'saving') {
      handleAutoSave(true);
    }
    
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    
    setIsModalOpen(false);
    setLayer({
      name: '',
      parentId: '',
      fields: [],
      active: true,
      color: '#552a47',
      location: 'surveys',
      description: ''
    });
    setErrors({});
    setHasChanges(false);
    setAutoSaveStatus('');
  };
  
  // Tag form state
  const [layer, setLayer] = useState<Partial<Layer>>({
    name: '',
    parentId: '',
    fields: [],
    active: true,
    color: '#552a47',
    location: 'surveys',
    description: ''
  });
  

  
  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});
  
  // Subscribe to layers collection and get usage data
  const { layers, isLoading, questions, surveys } = useTracker(() => {
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
          currentVersion.categoryTags.forEach((tagId: string) => {
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
      questions,
      surveys,
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
    const renderOptions = (tags: any[], depth = 0): React.ReactElement[] => {
      return tags.flatMap((tag): React.ReactElement[] => {
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
        
        return [option];
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
      description: ''
    });
    
    // Reset errors
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
        description: tagToEdit.description || ''
      });
      
      // Clear errors
      setErrors({});
      
      // Open the modal
      setIsModalOpen(true);
    }
  };
  
  // Close the modal function is already defined above
  

  
  // Auto-save function
  const handleAutoSave = useCallback((isClosing = false) => {
    // Don't auto-save if there are no changes or if the form is invalid
    if (!hasChanges || !validateForm(false)) {
      return;
    }
    
    setAutoSaveStatus('saving');
    
    if (layer._id) {
      // Update existing tag
      const updatedLayer = {
        id: layer.id,
        name: layer.name || '',
        location: layer.location || 'surveys',
        active: layer.active !== undefined ? layer.active : true,
        parentId: layer.parentId || undefined,
        color: layer.color || '#552a47',
        description: layer.description || '',
        fields: layer.fields || []
      };
      
      Meteor.call('layers.update', layer._id, updatedLayer, (error: Meteor.Error) => {
        if (error) {
          console.error('Error auto-saving tag:', error);
          setAutoSaveStatus('unsaved');
        } else {
          console.log('Tag auto-saved successfully');
          setAutoSaveStatus('saved');
          setHasChanges(false);
          
          // Clear saved status after 3 seconds
          setTimeout(() => {
            if (autoSaveStatus === 'saved') {
              setAutoSaveStatus('');
            }
          }, 3000);
          
          // If we're closing the modal, do it now that save is complete
          if (isClosing) {
            setIsModalOpen(false);
          }
        }
      });
    } else {
      // Create new tag
      const newLayer = {
        ...layer
      };
      
      Meteor.call('layers.create', newLayer, (error: Meteor.Error, result: string) => {
        if (error) {
          console.error('Error auto-saving tag:', error);
          setAutoSaveStatus('unsaved');
        } else {
          console.log('Tag auto-saved successfully');
          setAutoSaveStatus('saved');
          setHasChanges(false);
          
          // Update the layer with the new ID
          if (result) {
            setLayer(prev => ({ ...prev, _id: result }));
          }
          
          // Clear saved status after 3 seconds
          setTimeout(() => {
            if (autoSaveStatus === 'saved') {
              setAutoSaveStatus('');
            }
          }, 3000);
          
          // If we're closing the modal, do it now that save is complete
          if (isClosing) {
            setIsModalOpen(false);
          }
        }
      });
    }
  }, [layer, hasChanges, autoSaveStatus]);

  // Setup debounced auto-save
  useEffect(() => {
    if (hasChanges) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set auto-save status to unsaved
      setAutoSaveStatus('unsaved');
      
      // Set a new timer for auto-save
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3500); // 3.5 seconds delay for auto-save
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [layer, hasChanges, handleAutoSave]);

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
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
    
    // Mark that we have changes to save
    setHasChanges(true);
  };
  
  // Validate form
  const validateForm = (updateErrors = true) => {
    const newErrors: { name?: string } = {};
    
    if (!layer.name) {
      newErrors.name = 'Tag name is required';
    }
    
    if (updateErrors) {
      setErrors(newErrors);
    }
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
        description: layer.description || '',
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
      
      const newLayer = {
        ...layer
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
              theme={theme}
            >
              <FaPencilAlt size={14} />
            </ActionButton>
            <ActionButton
              title="Delete Tag"
              onClick={() => deleteTag(layer._id || '', layer.name || 'Unnamed Tag')}
              disabled={status.loading}
              theme={theme}
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
      return sum + (layer.questionCount ?? 0) + (layer.surveyCount ?? 0);
    }, 0);
    
    return {
      totalTags,
      categories: categories.size,
      maxDepth,
      totalUsage
    };
  }, [layers]);

  // Filter layers based on search term and dropdown selections
  const filteredLayers = useMemo(() => {
    return layers.filter(layer => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        (layer.name && layer.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by selected surveys (multiple selection)
      const matchesSurvey = selectedSurveys.length === 0 || 
        (layer.surveyCount && layer.surveyCount > 0 && 
         surveys.some(survey => 
           selectedSurveys.includes(survey._id) && (
             (survey.selectedTags && layer._id && survey.selectedTags.includes(layer._id)) || 
             (survey.templateTags && layer._id && survey.templateTags.includes(layer._id))
           )
         ));
      
      // Filter by selected questions (multiple selection)
      const matchesQuestion = selectedQuestions.length === 0 || 
        (layer.questionCount && layer.questionCount > 0 && 
         questions.some(question => {
           const currentVersion = question.versions[question.currentVersion - 1];
           return selectedQuestions.includes(question._id) && 
             currentVersion && (
               (currentVersion.categoryTags && layer._id && currentVersion.categoryTags.includes(layer._id)) || 
               ((currentVersion as any).labels && layer._id && (currentVersion as any).labels.includes(layer._id))
             );
         }));
      
      return matchesSearch && matchesSurvey && matchesQuestion;
    });
  }, [layers, searchTerm, selectedSurveys, selectedQuestions, surveys, questions]);
  
  // Get current items for pagination
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredLayers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredLayers, currentPage, itemsPerPage]);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Organize layers into hierarchical structure for tree view
  const hierarchicalLayers = useMemo(() => {
    // First pass: create a map of all layers with empty children arrays
    const layerMap = new Map<string, LayerDisplay>();
    filteredLayers.forEach(layer => {
      layerMap.set(layer._id || '', {
        ...layer,
        children: []
      });
    });
    
    // Second pass: build the hierarchy by adding children to their parents
    const rootLayers: LayerDisplay[] = [];
    
    filteredLayers.forEach(layer => {
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
  }, [filteredLayers]); // Use filteredLayers as dependency instead of layers

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Tags</Title>
          <ButtonGroup>
            <Button primary onClick={createNewTag} theme={theme}>
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
        
        <FilterSection style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative'}}>
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                style={{
                  height: '38px', 
                  fontSize: '14px', 
                  padding: '0 12px 0 36px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  width: '100%'
                }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', color: '#777' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '300px' }}>
                  <ReactSelect
                    id="surveyFilter"
                    isMulti
                    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                    value={surveys
                      .filter(survey => selectedSurveys.includes(survey._id))
                      .map(survey => ({ value: survey._id, label: survey.title || 'Untitled Survey' }))}
                    onChange={(selected) => {
                      const selectedValues = selected ? selected.map(option => option.value) : [];
                      setSelectedSurveys(selectedValues as string[]);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                    options={surveys.map(survey => ({
                      value: survey._id,
                      label: survey.title || 'Untitled Survey'
                    }))}
                    placeholder="Select surveys..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    filterOption={(option, inputValue) => {
                      if (!inputValue) return false;
                      return option.label.toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    noOptionsMessage={({inputValue}) => !inputValue ? "Type to search..." : "No options found"}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '300px' }}>
                  <ReactSelect
                    id="questionFilter"
                    isMulti
                    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                    value={questions
                      .filter(question => selectedQuestions.includes(question._id))
                      .map(question => {
                        const currentVersion = question.versions?.[question.currentVersion - 1];
                        const cleanText = stripHtmlTags(currentVersion?.questionText);
                        const text = cleanText.substring(0, 30);
                        return { 
                          value: question._id, 
                          label: text + (cleanText.length > 30 ? '...' : '') 
                        };
                      })}
                    onChange={(selected) => {
                      const selectedValues = selected ? selected.map(option => option.value) : [];
                      setSelectedQuestions(selectedValues as string[]);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                    options={questions.map(question => {
                      const currentVersion = question.versions?.[question.currentVersion - 1];
                      const cleanText = stripHtmlTags(currentVersion?.questionText);
                      const text = cleanText.substring(0, 30);
                      return {
                        value: question._id,
                        label: text + (cleanText.length > 30 ? '...' : '')
                      };
                    })}
                    placeholder="Select questions..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    filterOption={(option, inputValue) => {
                      if (!inputValue) return false;
                      return option.label.toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    noOptionsMessage={({inputValue}) => !inputValue ? "Type to search..." : "No options found"}
                  />
                </div>
              </div>
            </div>
            
            <ViewToggleGroup>
              <ViewToggleButton 
                active={viewMode === 'tree'} 
                onClick={() => setViewMode('tree')}
              >
                <FaList />
              </ViewToggleButton>
              <ViewToggleButton 
                active={viewMode === 'list'} 
                onClick={() => setViewMode('list')}
              >
                <FaTable />
              </ViewToggleButton>
            </ViewToggleGroup>
          </div>
        </FilterSection>

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
            <Button primary onClick={createNewTag} theme={theme}>
              Create Your First Tag
            </Button>
          </EmptyState>
        ) : viewMode === 'list' ? (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Tag Name</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(layer => (
                  <tr key={layer._id}>
                    <td>{layer.name}</td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <UsageTag title="Questions using this tag">
                          <FaFont size={12} /> {layer.questionCount || 0}
                        </UsageTag>
                        <UsageTag title="Surveys using this tag">
                          <FaLayerGroup size={12} /> {layer.surveyCount || 0}
                        </UsageTag>
                      </div>
                    </td>
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
            
            {/* Pagination */}
            {filteredLayers.length > itemsPerPage && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '1.5rem',
                gap: '0.5rem'
              }}>
                <button 
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaChevronLeft size={14} />
                </button>
                
                {Array.from({ length: Math.ceil(filteredLayers.length / itemsPerPage) }).map((_, index) => {
                  // Show limited page numbers with ellipsis for better UX
                  const pageNum = index + 1;
                  const totalPages = Math.ceil(filteredLayers.length / itemsPerPage);
                  
                  // Always show first, last, current, and pages around current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: currentPage === pageNum ? '#552a47' : 'white',
                          color: currentPage === pageNum ? 'white' : '#333',
                          cursor: 'pointer',
                          minWidth: '2rem',
                          textAlign: 'center'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNum} style={{ padding: '0.5rem' }}>...</span>;
                  }
                  
                  return null;
                })}
                
                <button 
                  onClick={() => paginate(currentPage < Math.ceil(filteredLayers.length / itemsPerPage) ? currentPage + 1 : currentPage)}
                  disabled={currentPage === Math.ceil(filteredLayers.length / itemsPerPage)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: currentPage === Math.ceil(filteredLayers.length / itemsPerPage) ? '#f5f5f5' : 'white',
                    cursor: currentPage === Math.ceil(filteredLayers.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
            
            {/* Results summary */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '1rem', 
              fontSize: '0.9rem', 
              color: '#666' 
            }}>
              Showing {filteredLayers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredLayers.length)} of {filteredLayers.length} tags
              {searchTerm || selectedSurveys || selectedQuestions ? ' (filtered)' : ''}
            </div>
          </>
        ) : (
          <ListViewContainer>
            <div style={{ padding: '1rem' }}>
              {hierarchicalLayers && hierarchicalLayers.map((layer, index) => renderTagItem(layer, 0))}
            </div>
          </ListViewContainer>
        )}
      </Container>
      
      {/* Tag Creation Modal */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{layer && layer._id ? 'Edit Tag' : 'Create New Tag'}</ModalTitle>
              <CloseButton onClick={() => closeModal()}>
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
                  value={layer?.name || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '97%',
                  }}
                  placeholder="Enter tag name"
                />
                {errors?.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Tag Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={layer?.description || ''}
                  onChange={handleInputChange}
                  placeholder="Enter tag description"
                  style={{
                    width: '97%',
                    minHeight: '120px', /* Approximately 4-5 lines */
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="parentId">Parent Tag</Label>
                <Select
                  id="parentId"
                  name="parentId"
                  value={layer?.parentId || ''}
                  onChange={handleInputChange}
                  className="nested-tag-select"
                >
                  <option value="">None (Top Level Tag)</option>
                  {/* Options would be rendered here */}
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
                      backgroundColor: layer?.color || '#552a47',
                      border: '1px solid #ddd',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      marginRight: '10px'
                    }}
                  />
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={layer?.color || '#552a47'}
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
                      onClick={() => {
                        setLayer(prev => ({ ...prev, active: !prev.active }));
                        setHasChanges(true);
                        
                        // Set auto-save status to unsaved
                        setAutoSaveStatus('unsaved');
                        
                        // Clear any existing timer
                        if (autoSaveTimerRef.current) {
                          clearTimeout(autoSaveTimerRef.current);
                        }
                        
                        // Set a new timer for auto-save
                        autoSaveTimerRef.current = setTimeout(() => {
                          handleAutoSave();
                        }, 3500); // 3.5 seconds delay for auto-save
                      }} 
                      style={{ 
                        cursor: 'pointer',
                        color: layer?.active ? '#4CAF50' : '#ccc'
                      }}
                    >
                      {layer?.active ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                    </div>
                    <span>{layer?.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </FormGroup>
            </ModalBody>
            
            <ModalFooter>
              {/* Auto-save status indicator */}
              {autoSaveStatus && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginRight: 'auto',
                  fontSize: '0.9rem',
                  color: autoSaveStatus === 'saved' ? '#2e7d32' : 
                         autoSaveStatus === 'saving' ? '#0d47a1' : 
                         '#f57c00'
                }}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <FaSpinner 
                        size={14} 
                        style={{ 
                          marginRight: '0.5rem',
                          animation: 'spin 1s linear infinite' 
                        }} 
                      />
                      Saving...
                    </>
                  )}
                  {autoSaveStatus === 'unsaved' && (
                    <>
                      <span style={{ color: '#f57c00' }}>Unsaved changes</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <FaCheck size={14} style={{ marginRight: '0.5rem' }} />
                      Saved
                    </>
                  )}
                </div>
              )}
              <Button onClick={() => closeModal()}>Cancel</Button>
              <Button primary onClick={handleSaveTag} disabled={status?.loading || autoSaveStatus === 'saving'}>
                {status.loading || autoSaveStatus === 'saving' ? (
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
