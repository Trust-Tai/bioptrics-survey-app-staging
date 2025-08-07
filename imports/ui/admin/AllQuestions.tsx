import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuestionBuilderPanel } from '../../features/questions/contexts/QuestionBuilderPanelContext';
import { FaPlus, FaFilter, FaEye, FaEdit, FaTrash, FaFileAlt, FaCheckCircle, FaFileImport, FaTimes, FaChartLine, FaChartPie, FaDownload, FaUsers, FaComments, FaPercentage, FaStar, FaList, FaThLarge, FaEllipsisV, FaFolder } from 'react-icons/fa';
import FolderTree from '../../features/questions/components/admin/FolderTree';
import FolderModal from '../../features/questions/components/admin/FolderModal';
import { Folders } from '../../features/questions/api/folders';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Tooltip, 
  Legend
);
import { ImportQuestions } from '../../features/questions/components/admin';
import { format } from 'date-fns';
import DashboardBg from './DashboardBg';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '../../features/questions/api/questions';
import { WPSCategories } from '../../features/wps-framework/api/wpsCategories';
import { Layers, Layer } from '../../api/layers';
import { SurveyThemes } from '../../features/survey-themes/api/surveyThemes';
import DOMPurify from 'dompurify';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import QuestionPreviewModal from './QuestionPreviewModal';
import AdminRichTextRenderer from './components/AdminRichTextRenderer';
import QuestionStats from './components/QuestionStats';
import QuestionListView from './components/QuestionListView';
import QuestionTableView from './components/QuestionTableView';
import ViewToggle from './components/ViewToggle';

// Alert component for success and error messages
interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    // Only set timers if we're not in a Meteor simulation
    if (Meteor.isClient) {
      // Auto-close the alert after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [onClose]);
  
  return (
    <div className={`alert alert-${type}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '12px 20px',
      borderRadius: '4px',
      backgroundColor: type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
      color: 'white',
      border: `1px solid ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '300px'
    }}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px',
          color: 'white',
        }}
      >
        &times;
      </button>
    </div>
  );
};

// Tag color definitions
const QUE_TYPE_LABELS: Record<string, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  free_text: 'Free Text',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  likert: 'Likert Scale',
  quick_tabs: 'Quick Tabs',
  scale: 'Scale',
  singleSelect: 'Single Select',
  multiSelect: 'Multi Select',
  text: 'Text',
  number: 'Number',
  date: 'Date'
};

// Updated styled components to use theme variables
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
`;

// Modal styled components
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
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    color: var(--color-text);
  }
`;

const ExportButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-secondary);
  }
`;

const Container = styled.div`
  padding: 0;
  min-height: 100vh;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--color-text);
`;

const SearchFilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-accent);
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.active ? '#ffffff' : 'var(--color-text)'};
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 10%, transparent)'};
  }
  
  &:first-child {
    border-right: 1px solid var(--color-accent);
  }
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--color-accent);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  width: 260px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
  
  &::placeholder {
    color: var(--color-accent);
  }
`;

const FilterButton = styled.button`
  background: var(--color-background);
  border: 1px solid var(--color-accent);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: var(--color-primary);
  }
`;

const FilterToggle = styled.button`
  background: var(--color-background);
  border: 1px solid var(--color-accent);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: var(--color-primary);
  }
`;

const Button = styled.button`
  background: var(--color-background);
  border: 1px solid var(--color-accent);
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: var(--color-primary);
  }
  
  &.primary {
    background: var(--color-primary);
    color: #fff;
    border: none;
    
    &:hover {
      background: var(--color-secondary);
    }
  }
`;

const FiltersPanel = styled.div`
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  border: 1px solid var(--color-accent);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
`;

const FilterSelect = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--color-accent);
  font-size: 0.9rem;
  background: var(--color-background);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const QuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 100%;
  overflow: visible;
`;

const QuestionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const QuestionCard = styled.div`
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 8%, transparent);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  height: 100%;
  margin: 0;
  border: 1px solid var(--color-accent);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: visible;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
`;

const QuestionType = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--color-primary, #542A46);
  color: #ffffff;
`;

const QuestionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const QuestionText = styled.div`
  color: var(--color-text);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0 8px 0;
  padding-right: 20px;
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const QuestionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const MetaTag = styled.div`
  background-color: var(--color-primary, #542A46);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
`;

const StatusTag = styled.div<{ published?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.published ? '#e6f7ed' : '#ffebee'};
  color: ${props => props.published ? '#0a8043' : '#d32f2f'};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => props.published ? '#0a8043' : '#d32f2f'};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const DropdownMenu = styled.div<{ position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.position === 'bottom' ? 'top: 50px;' : 'bottom: calc(100% - 15px);'}
  right: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 1000;
  overflow: hidden;
  transform: translateZ(0); /* Ensures the dropdown renders above other elements */
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: #212529;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &.delete {
    color: #dc3545;
  }
`;

const QuestionActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-accent);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--color-accent);
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 4px;
  border: 1px solid ${props => props.active ? 'var(--color-primary)' : 'var(--color-accent)'};
  background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-secondary)' : 'color-mix(in srgb, var(--color-primary) 10%, transparent)'};
    border-color: var(--color-primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-background);
    border-color: var(--color-accent);
    
    &:hover {
      background-color: var(--color-background);
      border-color: var(--color-accent);
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;
  
  &.preview {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
    
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
  }
  
  &.edit {
    background: var(--color-primary);
    color: #fff;
    border: 2px solid var(--color-primary);
    
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 85%, black);
    }
  }
  
  &.delete {
    background: transparent;
    color: var(--color-error);
    border: 2px solid var(--color-error);
    
    &:hover {
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--color-accent);
  
  h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
  }
`;

// Analytics Modal Styled Components
const AnalyticsSubtitle = styled.p`
  color: var(--color-accent);
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 20px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--color-accent);
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: var(--color-text);
  margin: 10px 0;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: var(--color-accent);
  text-align: center;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
`;

const ChartCard = styled.div`
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-accent);
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  color: var(--color-text);
  margin-top: 0;
  margin-bottom: 20px;
`;

// Helper function to get the latest version of a question
const getLatestVersion = (question: any) => {
  if (!question) return null;
  if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) return null;
  
  const currentVersion = question.currentVersion;
  const latestVersion = question.versions.find((v: any) => v.version === currentVersion);
  return latestVersion || question.versions[question.versions.length - 1];
};

// Helper function to strip HTML tags and sanitize text
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Create a temporary div to hold the sanitized HTML
  const tempDiv = document.createElement('div');
  // Sanitize the HTML to prevent XSS attacks
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  // Return the text content only (no HTML tags)
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper function to truncate text to a specific length
const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

const AllQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { openPanel } = useQuestionBuilderPanel();
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [questionForAnalytics, setQuestionForAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterFolder, setFilterFolder] = useState<string | null>(null);
  const [filterQuestionType, setFilterQuestionType] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  // View toggle state - default to list view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  
  // Folder management state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'edit'>('create');
  const [folderToEdit, setFolderToEdit] = useState<any>(null);
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  
  // Get categories and themes for filtering
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  
  // Get folders for filtering
  const folders = useTracker(() => {
    Meteor.subscribe('folders.all');
    return Folders.find({}).fetch();
  }, []);
  
  // Extend Layer interface to include children for hierarchy
  interface LayerWithChildren extends Layer {
    children?: LayerWithChildren[];
    depth?: number;
  }

  // Helper function to build a flat list of tags with depth information
  const buildFlatTagList = (tags: LayerWithChildren[], depth = 0, result: LayerWithChildren[] = []) => {
    if (!tags || !Array.isArray(tags)) return result;
    
    tags.forEach(tag => {
      if (tag) {
        // Add the current tag with its depth
        result.push({ ...tag, depth });
        
        // Recursively process children if they exist
        if (tag.children && Array.isArray(tag.children) && tag.children.length > 0) {
          buildFlatTagList(tag.children, depth + 1, result);
        }
      }
    });
    
    return result;
  };

  // Get layers (tags) for statistics and filtering
  const { layers, hierarchicalLayers } = useTracker(() => {
    Meteor.subscribe('layers.all');
    const rawLayers = Layers.find({}).fetch() as LayerWithChildren[];
    
    // Process tags to create proper parent-child relationships
    const processedLayers: LayerWithChildren[] = [];
    const layerMap: Record<string, LayerWithChildren> = {};
    
    // First, create a map of all tags by ID
    rawLayers.forEach(layer => {
      if (layer && layer._id) {
        // Initialize children array
        layer.children = [];
        layerMap[layer._id] = layer;
      }
    });
    
    // Then, build the hierarchy
    rawLayers.forEach(layer => {
      if (layer && layer._id) {
        if (layer.parentId && layerMap[layer.parentId]) {
          // This tag has a parent, add it to parent's children
          layerMap[layer.parentId].children?.push(layer);
        } else {
          // This is a root tag
          processedLayers.push(layer);
        }
      }
    });
    
    return {
      layers: rawLayers, // Original flat list for backward compatibility
      hierarchicalLayers: processedLayers // Hierarchical structure
    };
  }, []);
  
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);
  
  // Create a map of category IDs to names for easier lookup
  const wpsCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    wpsCategories.forEach((cat: any) => {
      if (cat._id) map[cat._id] = cat.name;
    });
    return map;
  }, [wpsCategories]);
  
  // Create a map of layer IDs to names for tag display
  const layerMap = useMemo(() => {
    const map: Record<string, string> = {};
    layers.forEach((layer: any) => {
      if (layer._id) map[layer._id] = layer.name;
      if (layer.id) map[layer.id] = layer.name; // Some layers might use 'id' instead of '_id'
    });
    return map;
  }, [layers]);
  
  const surveyThemeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    surveyThemes.forEach((theme: any) => { map[theme._id] = theme.name; });
    return map;
  }, [surveyThemes]);
  
  // Subscribe to Questions collection
  const { questions, loading } = useTracker(() => {
    const handle = Meteor.subscribe('questions.all');
    return {
      loading: !handle.ready(),
      // Sort by createdAt in descending order to show latest questions first
      questions: Questions.find({}, { sort: { createdAt: -1 } }).fetch()
    };
  }, []);
  
  // Calculate question statistics
  const questionStats = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        totalQuestions: 0,
        avgQualityScore: 0,
        totalTags: 0,
        totalFolders: 0
      };
    }
    
    const totalQuestions = questions.length;
    let totalScore = 0;
    let scoredQuestions = 0;
    
    questions.forEach((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return;
      
      // Add quality score if available
      if (latestVersion.qualityScore) {
        totalScore += latestVersion.qualityScore;
        scoredQuestions++;
      }
    });
    
    // Get total tags count from Layers collection
    // This matches the "Categories" count shown in the UI screenshot
    const totalTags = layers ? layers.length : 0;
    
    // Get total folders count
    const totalFolders = folders ? folders.length : 0;
    
    // Calculate average score (default to 4.5 if no scores available)
    const avgQualityScore = scoredQuestions > 0 ? totalScore / scoredQuestions : 4.5;
    
    return {
      totalQuestions,
      avgQualityScore,
      totalTags,
      totalFolders
    };
  }, [questions, layers, folders]);

  // Filter questions based on search and filters
  const filteredQuestions = React.useMemo(() => {
    if (!questions) return [];
    
    return questions.filter((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return false;
      
      // Apply search term filter
      if (searchTerm && !latestVersion.questionText.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply active filter
      if (filterActive !== null && latestVersion.isActive !== filterActive) {
        return false;
      }
      
      // Apply question type filter
      if (filterQuestionType && latestVersion.responseType !== filterQuestionType) {
        return false;
      }
      
      // Apply theme filter
      if (filterTheme && (!latestVersion.surveyThemes || !latestVersion.surveyThemes.includes(filterTheme))) {
        return false;
      }
      
      // Apply folder filter
      if (filterFolder) {
        // Special case for 'none' filter - show questions without a folder
        if (filterFolder === 'none') {
          return q.folderId === null || q.folderId === undefined;
        }
        // Otherwise match the specific folder ID
        return q.folderId === filterFolder;
      }
      
      // Apply tag filter
      if (filterTag) {
        // Check in labels array which is where tags are actually stored
        if (latestVersion.labels && Array.isArray(latestVersion.labels)) {
          // Check if any label matches the selected tag
          for (const label of latestVersion.labels) {
            if (typeof label === 'string' && label === filterTag) {
              return true;
            }
            // Handle case where label might be an object with an id property
            if (typeof label === 'object' && label && label.id === filterTag) {
              return true;
            }
          }
        }
        // Also check in categoryTags array as a fallback
        if (latestVersion.categoryTags && Array.isArray(latestVersion.categoryTags) && latestVersion.categoryTags.includes(filterTag)) {
          return true;
        }
        // Also check in category field for backward compatibility
        if (latestVersion.category === filterTag) {
          return true;
        }
        // If we get here and filterTag is set, this question doesn't match
        return false;
      }
      
      return true;
    });
  }, [questions, searchTerm, filterActive, filterQuestionType, filterTheme, filterTag, filterFolder]);
  
  // Handle importing questions and completion
  const handleImportQuestions = (importedQuestions: any[]) => {
    // Process the imported questions
    importedQuestions.forEach(question => {
      Meteor.call('questions.insert', question, (error: any) => {
        if (error) {
          console.error('Error importing question:', error);
        }
      });
    });
    
    // Close modal and show success message
    setShowImportModal(false);
    setAlert({
      type: 'success',
      message: `Successfully imported ${importedQuestions.length} questions!`
    });
  };
  
  // Handle deleting a question
  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await Meteor.callAsync('questions.delete', questionToDelete);
        // Show success message
        setAlert({
          type: 'success',
          message: 'Question deleted successfully!'
        });
      } catch (error: any) {
        console.error('Error deleting question:', error);
        setAlert({
          type: 'error',
          message: `Error deleting question: ${error.reason || error.message || 'Unknown error'}`
        });
      }
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    }
  };
  
  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          )}
        
        <TitleRow>
          <Title>All Questions</Title>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              className="primary" 
              onClick={() => openPanel()}
            >
              <FaPlus size={14} />
              New Question
            </Button>
            
          </div>
        </TitleRow>
        
        {/* Question Statistics */}
        <QuestionStats 
          totalQuestions={questionStats?.totalQuestions || 0}
          avgQualityScore={questionStats?.avgQualityScore || 0}
          totalTags={questionStats?.totalTags || 0}
          totalFolders={questionStats?.totalFolders || 0}
          isLoading={loading}
        />
        
        <SearchFilterRow>
          <SearchInput 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Toggle */}
            <ViewToggle 
              view={viewMode} 
              onViewChange={setViewMode} 
            />
            
            <FilterToggle onClick={() => setShowFilters(!showFilters)}>
              <FaFilter size={14} />
              Filters {showFilters ? '(on)' : ''}
            </FilterToggle>
          </div>
        </SearchFilterRow>
        
        {showFilters && (
          <FiltersPanel>
            <FilterGroup>
              <FilterLabel>Active Status</FilterLabel>
              <FilterSelect 
                value={filterActive === null ? '' : String(filterActive)}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterActive(val === '' ? null : val === 'true');
                }}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Question Type</FilterLabel>
              <FilterSelect 
                value={filterQuestionType || ''}
                onChange={(e) => setFilterQuestionType(e.target.value || null)}
              >
                <option value="">All Types</option>
                {Object.entries(QUE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Tag</FilterLabel>
              <FilterSelect 
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
              >
                <option value="">All Tags</option>
                {/* Render hierarchical tags with proper indentation */}
                {buildFlatTagList(hierarchicalLayers).map((layer: LayerWithChildren) => {
                  if (!layer._id) return null;
                  const depth = layer.depth || 0;
                  const indent = '\u00A0\u00A0'.repeat(depth);
                  const prefix = depth > 0 ? '└── ' : '';
                  return (
                    <option 
                      key={layer._id} 
                      value={layer._id}
                      style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
                    >
                      {indent}{prefix}{layer.name}
                    </option>
                  );
                })}
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Folder</FilterLabel>
              <FilterSelect 
                value={filterFolder || ''}
                onChange={(e) => setFilterFolder(e.target.value || null)}
              >
                <option value="">All Folders</option>
                <option value="none">No Folder</option>
                {folders && folders.map((folder: any) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>
          </FiltersPanel>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Showing {filteredQuestions.length} questions {searchTerm ? `matching "${searchTerm}"` : ''}
          </div>
        </div>
        
        {/* Questions View - Grid or List based on viewMode */}
        {viewMode === 'grid' ? (
          <QuestionsGrid>
            {filteredQuestions.map((doc: any) => {
              const latestVersion = getLatestVersion(doc);
              if (!latestVersion) return null;
            
              return (
                <QuestionCard 
                  key={doc._id} 
                  onClick={() => openPanel(doc._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <QuestionHeader>
                    <div>
                      {latestVersion.status === 'published' ? (
                        <StatusTag published>
                          Published
                        </StatusTag>
                      ) : (
                        <StatusTag>
                          Draft
                        </StatusTag>
                      )}
                      {(QUE_TYPE_LABELS[latestVersion.responseType] || latestVersion.responseType) && (
                        <QuestionType>
                          {QUE_TYPE_LABELS[latestVersion.responseType] || latestVersion.responseType}
                        </QuestionType>
                      )}
                    </div>
                    <HeaderActions onClick={(e) => e.stopPropagation()} ref={dropdownRef}>
                      <DropdownButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === doc._id ? null : doc._id);
                          
                          // Check if dropdown should open upward or downward
                          if (e.clientY > window.innerHeight * 0.7) {
                            setDropdownPosition('top');
                          } else {
                            setDropdownPosition('bottom');
                          }
                        }}
                      >
                        <FaEllipsisV />
                      </DropdownButton>
                      
                      {openDropdown === doc._id && (
                        <DropdownMenu position={dropdownPosition}>
                          <DropdownItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuestionForAnalytics(doc);
                              setAnalyticsModalOpen(true);
                              setOpenDropdown(null);
                            }}
                          >
                            <FaEye size={14} />
                            Preview
                          </DropdownItem>
                          <DropdownItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openPanel(doc._id);
                              setOpenDropdown(null);
                            }}
                          >
                            <FaEdit size={14} />
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            className="delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(doc._id);
                              setOpenDropdown(null);
                            }}
                          >
                            <FaTrash size={14} />
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      )}
                    </HeaderActions>
                  </QuestionHeader>
                  
                  <QuestionContent>
                    <QuestionText>
                      <AdminRichTextRenderer content={latestVersion.questionText} truncate={120} />
                    </QuestionText>
                    
                    <QuestionMeta>
                      {latestVersion.categoryTags && latestVersion.categoryTags.length > 0 
                        ? latestVersion.categoryTags.slice(0, 2).map((catId: string, index: number) => (
                            <MetaTag key={index}>{layerMap[catId] || catId}</MetaTag>
                          )).concat(latestVersion.categoryTags.length > 2 ? [<MetaTag key="more">+{latestVersion.categoryTags.length - 2}</MetaTag>] : [])
                        : (latestVersion.category 
                            ? <MetaTag>{layerMap[latestVersion.category] || latestVersion.category}</MetaTag>
                            : null)
                      }
                      
                      {latestVersion.surveyThemes && latestVersion.surveyThemes.slice(0, 1).map((themeId: string) => (
                        <MetaTag key={themeId}>{surveyThemeMap[themeId] || themeId}</MetaTag>
                      ))}
                      {latestVersion.surveyThemes && latestVersion.surveyThemes.length > 1 && (
                        <MetaTag>+{latestVersion.surveyThemes.length - 1}</MetaTag>
                      )}
                      
                      {latestVersion.isReusable && <MetaTag>Reusable</MetaTag>}
                      {latestVersion.isActive === false && <MetaTag>Inactive</MetaTag>}
                    </QuestionMeta>
                    
                    {/* Action buttons moved to dropdown menu in header */}
                  </QuestionContent>
                </QuestionCard>
              );
            })}
            
            {filteredQuestions.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: '#666' }}>
                No questions found matching your criteria.
              </div>
            )}
          </QuestionsGrid>
        ) : (
          /* Table View */
          <>
            <QuestionTableView 
              questions={filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
              onPreview={(question) => {
                setPreviewQuestion(question);
                setPreviewOpen(true);
              }}
              onAnalytics={(question) => {
                setQuestionForAnalytics(question);
                setAnalyticsModalOpen(true);
              }}
              onEdit={(questionId) => openPanel(questionId)}
              onDelete={(questionId) => {
                setQuestionToDelete(questionId);
                setShowDeleteConfirm(true);
              }}
              layerMap={layerMap}
            />
            
            {/* Pagination Controls */}
            <PaginationContainer>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Items per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    marginRight: '20px'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredQuestions.length)} - {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}</span>
              </div>
              
              <div>
                <PaginationButton 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                >
                  First
                </PaginationButton>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                {(() => {
                  // Show current page and 2 pages before and after
                  const pageNumbers = [];
                  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
                  
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, currentPage + 2);
                  
                  // Adjust if we're near the start or end
                  if (currentPage <= 3) {
                    endPage = Math.min(5, totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    startPage = Math.max(1, totalPages - 4);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <PaginationButton 
                        key={i} 
                        onClick={() => setCurrentPage(i)}
                        active={i === currentPage}
                      >
                        {i}
                      </PaginationButton>
                    );
                  }
                  
                  return pageNumbers;
                })()}
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredQuestions.length / itemsPerPage)))} 
                  disabled={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage)}
                >
                  Next
                </PaginationButton>
                <PaginationButton 
                  onClick={() => setCurrentPage(Math.ceil(filteredQuestions.length / itemsPerPage))} 
                  disabled={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage)}
                >
                  Last
                </PaginationButton>
              </div>
            </PaginationContainer>
          </>
        )}
          
        {/* Import Questions Modal */}
        {showImportModal && (
          <ImportQuestions
            onImportComplete={handleImportQuestions}
            organizationId={undefined}
          />
        )}

        {/* Question Analytics Modal */}
        {analyticsModalOpen && questionForAnalytics && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <div>
                  <h3>Question Analytics</h3>
                  <AnalyticsSubtitle>
                    Performance insights for "{questionForAnalytics.versions[questionForAnalytics.versions.length - 1].questionText.replace(/<[^>]*>/g, '')}"  
                  </AnalyticsSubtitle>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ExportButton onClick={() => window.alert('Exporting data...')}>
                    <FaDownload size={14} /> Export Data
                  </ExportButton>
                  <CloseButton onClick={() => setAnalyticsModalOpen(false)}>
                    <FaTimes />
                  </CloseButton>
                </div>
              </ModalHeader>
              
              <ModalBody>
                {/* Metrics Cards */}
                <MetricsGrid>
                  <MetricCard>
                    <IconWrapper>
                      <FaUsers size={20} />
                    </IconWrapper>
                    <MetricValue>31</MetricValue>
                    <MetricLabel>Total Usage</MetricLabel>
                  </MetricCard>
                  
                  <MetricCard>
                    <IconWrapper>
                      <FaComments size={20} />
                    </IconWrapper>
                    <MetricValue>1,247</MetricValue>
                    <MetricLabel>Total Responses</MetricLabel>
                  </MetricCard>
                  
                  <MetricCard>
                    <IconWrapper>
                      <FaPercentage size={20} />
                    </IconWrapper>
                    <MetricValue>87%</MetricValue>
                    <MetricLabel>Avg Response Rate</MetricLabel>
                  </MetricCard>
                  
                  <MetricCard>
                    <IconWrapper>
                      <FaStar size={20} />
                    </IconWrapper>
                    <MetricValue>4.9</MetricValue>
                    <MetricLabel>Quality Score</MetricLabel>
                  </MetricCard>
                </MetricsGrid>

                {/* Charts */}
                <ChartContainer>
                  <ChartCard>
                    <ChartTitle>Usage Over Time</ChartTitle>
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Usage',
                            data: [2, 4, 3, 6, 8, 5],
                            borderColor: '#3e95cd',
                            backgroundColor: 'rgba(62, 149, 205, 0.1)',
                            tension: 0.4,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </ChartCard>
                  
                  <ChartCard>
                    <ChartTitle>Response Distribution</ChartTitle>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                      <Doughnut 
                        data={{
                          labels: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
                          datasets: [
                            {
                              data: [35, 42, 15, 6, 2],
                              backgroundColor: [
                                '#36A2EB', // Blue
                                '#4BC0C0', // Teal
                                '#FFCD56', // Yellow
                                '#FF9F40', // Orange
                                '#FF6384'  // Red
                              ],
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </ChartCard>
                </ChartContainer>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <Modal>
              <ModalContent style={{ maxWidth: 400 }}>
                <ModalHeader>
                  <h3>Confirm Delete</h3>
                  <CloseButton onClick={() => {
                    setShowDeleteConfirm(false);
                    setQuestionToDelete(null);
                  }}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete this question? This action cannot be undone.</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setQuestionToDelete(null);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        background: '#f5f5f5',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteQuestion}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#f44336',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default AllQuestions;
