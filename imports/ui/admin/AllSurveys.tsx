import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import DashboardBg from './DashboardBg';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { FaEdit, FaTrash, FaEye, FaTasks, FaSearch, FaPlus, FaCopy, FaExternalLinkAlt, FaClock, FaChartBar, FaEllipsisV, FaUndo } from 'react-icons/fa';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';
import TermLabel from '../components/TermLabel';

// Import our new components
import SurveyStatsSummary from './components/SurveyStatsSummary';
import SurveyListView from './components/SurveyListView';
import ViewToggle from './components/ViewToggle';
import SurveyResponsesModal from './components/SurveyResponsesModal';

// Import the survey stats method
import '../../features/surveys/api/surveyStats';

// Styled components for theme support
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 18px;
  padding: 0px;
  background: transparent;
  box-sizing: border-box;
  overflow: visible;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  max-width: 280px;
`;

const SearchInput = styled.input`
  height: 44px;
  font-size: 16px;
  padding: 0 16px 0 42px;
  border-radius: 8px;
  border: 1.5px solid var(--color-accent);
  width: auto;
  color: var(--color-text);
  font-weight: 500;
  outline: none;
  background: var(--color-background);
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
  
  &::placeholder {
    color: var(--color-accent);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  opacity: 0.6;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterSelect = styled.select`
  height: 44px;
  font-size: 15px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1.5px solid var(--color-accent);
  color: var(--color-text);
  font-weight: 500;
  outline: none;
  background: var(--color-background);
  min-width: 140px;
  cursor: pointer;
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 0 22px;
  font-size: 16px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-secondary);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.18);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: var(--color-background);
  border-radius: 14px;
  box-shadow: 0 2px 18px color-mix(in srgb, var(--color-primary) 20%, transparent);
  padding: 38px 40px 32px 40px;
  min-width: 340px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  position: relative;
`;

const ModalTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--color-text);
`;

const ModalText = styled.div`
  font-size: 16px;
  color: var(--color-text);
  margin-bottom: 12px;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 18px;
  margin-top: 18px;
`;

const DeleteButton = styled.button`
  background: var(--color-error);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 8px 28px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-error) 85%, black);
  }
`;

const CancelButton = styled.button`
  background: var(--color-background);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 700;
  padding: 8px 28px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 100%;
  overflow: visible;
`;

const SurveyCard = styled.div`
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return '#e6f7ed';
      case 'inactive': return '#ffebee';
      case 'draft': 
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#0a8043';
      case 'inactive': return '#d32f2f';
      case 'draft':
      default: return '#666666';
    }
  }};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => {
      switch (props.status) {
        case 'active': return '#0a8043';
        case 'inactive': return '#d32f2f';
        case 'draft':
        default: return '#666666';
      }
    }};
  }
`;

// StatusDot is no longer needed since we're using ::before pseudo-element
const StatusDot = styled.div<{ published: boolean }>`
  display: none; /* Hide this since we're using ::before in StatusBadge */
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 500;
`;

const SurveyTitle = styled.h3`
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
  
  &:hover {
    color: var(--color-primary);
  }
`;

const PublicUrlSection = styled.div`
  margin-top: auto;
  padding: 14px 16px;
  border-top: 1px solid var(--color-accent);
  background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
`;

const PublicUrlLabel = styled.span`
  font-weight: 600;
  color: var(--color-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CopyUrlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 15%, transparent);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
    background: var(--color-secondary);
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-accent);
`;

const ActionButton = styled.button`
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 15%, transparent);
  }
  
  &.delete:hover {
    background: color-mix(in srgb, var(--color-error) 10%, transparent);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-error) 15%, transparent);
  }
`;

const DropdownButton = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.2s ease;
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  color: var(--color-text);
  font-size: 14px;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  }
  
  &.delete:hover {
    background: color-mix(in srgb, var(--color-error) 5%, transparent);
    color: var(--color-error);
  }
  
  svg {
    font-size: 16px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const NoResultsText = styled.div`
  text-align: center;
  padding: 40px 0;
  color: var(--color-accent);
`;

const Notification = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  z-index: 2000;
  box-shadow: 0 2px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  flex: 1;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: var(--color-primary);
`;

const InfoValue = styled.span`
  color: var(--color-text);
`;

const CardStyles = createGlobalStyle`
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .info-label {
    font-weight: 600;
    color: var(--color-primary);
  }
  
  .info-value {
    color: var(--color-text);
  }
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

interface SurveyDisplay {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  createdBy?: string;
  createdByName?: string;
  shareToken?: string;
  sections?: any[];
  questionCount?: number;
  responseStats?: {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
  };
  scheduledFor?: string;
  potentialRespondents?: number;
  isOwned?: boolean; // Whether the current user is the owner
  isSharedByMe?: boolean; // Whether the current user shared this survey
  isSharedWithMe?: boolean; // Whether this survey is shared with the current user
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

const SurveyLink: React.FC<{ surveyId: string }> = ({ surveyId }) => {
  const [token, setToken] = useState('');

  useEffect(() => {
    Meteor.call('surveys.generateEncryptedToken', surveyId, (err: Meteor.Error | null, res: string) => {
      if (err) {
        console.error(err);
      } else {
        setToken(res);
      }
    });
  }, [surveyId]);

  return (
    <div style={{ marginTop: 6, wordBreak: 'break-all', fontWeight: 700 }}>
      <a href={`${window.location.origin}/public/${token}`} target="_blank" rel="noopener noreferrer">{`${window.location.origin}/public/${token}`}</a>
    </div>
  );
};

const AllSurveys: React.FC = () => {
  const navigate = useNavigate();
  const { getTerminology } = useOrganization();
  
  // Get the customized survey label
  const surveyLabel = getTerminology('surveyLabel');
  const surveyLabelPlural = `${surveyLabel}s`;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; title: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResponsesModal, setShowResponsesModal] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Functions for handling survey actions
  const onDelete = (id: string, title: string) => {
    setConfirmDelete({ _id: id, title });
  };
  
  const onViewResponses = (id: string, title: string) => {
    navigate(`/admin/analytics/${id}`);
  };
  
  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Filter state variables already declared above

  // State for responses modal
  const [responsesModal, setResponsesModal] = useState<{ isOpen: boolean; surveyId: string; surveyTitle: string }>({ 
    isOpen: false, 
    surveyId: '', 
    surveyTitle: '' 
  });

  // Get the current user ID
  const userId = Meteor.userId();

  // Fetch surveys data - only get surveys owned by or shared with the current user
  const { surveys, loading } = useTracker(() => {
    const handle = Meteor.subscribe('surveys.ownedAndCollaborated');
    const data = Surveys.find({}, { sort: { updatedAt: -1 } }).fetch();
    
    // Ensure all required fields are present in the survey data
    const processedData = data.map((survey: any) => ({
      ...survey,
      _id: survey._id || '', // Ensure _id is always a string
    }));
    
    return {
      loading: !handle.ready(),
      surveys: processedData
    };
  }, []);

  // Define interface for survey data
  interface SurveyData {
    _id: string;
    title: string;
    description: string;
    published: boolean;
    status?: 'active' | 'draft' | 'inactive';
    createdBy: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    sections?: Array<{
      questions?: Array<any>;
    }>;
    responses?: Array<{
      completed: boolean;
    }>;
    collaborators?: Array<{
      userId: string;
      role: string;
    }>;
    [key: string]: any; // Allow for other properties
  }

  // Define interface for processed survey data
  interface ProcessedSurvey extends Omit<SurveyData, 'sections'> {
    sections: number;
    questionCount: number;
    responseStats: {
      total: number;
      completed: number;
      completion: number;
    };
    createdByName: string;
    isOwned: boolean;
    isSharedByMe: boolean;
    isSharedWithMe: boolean;
  }

  // Subscribe to all users to ensure we have their data for creator names
  useTracker(() => {
    Meteor.subscribe('allUsersBasic');
  }, []);
  
  // Process surveys for display with ownership and collaboration info
  const processedSurveys = useMemo(() => {
    // Create a map of user IDs to names for the creator column
    const userMap: Record<string, string> = {};
    
    // Get all users for creator name lookup
    Meteor.users.find({}).forEach((user) => {
      if (user._id) {
        // Try to get the user's name from different possible fields
        userMap[user._id] = user.profile?.name || 
                           user.username || 
                           (user.emails && user.emails[0] && user.emails[0].address) || 
                           'Unknown User';
      }
    });
    
    console.log('User map:', userMap); // Debug: Log the user map
    
    return surveys.map((s: SurveyData) => {
      // Calculate sections and questions count
      const sections = s.sections?.length || 0;
      const questionCount = s.sections?.reduce((total: number, section: any) => total + (section.questions?.length || 0), 0) || 0;
      
      // Calculate response stats
      const total = s.responses?.length || 0;
      const completed = s.responses?.filter((r: any) => r.completed)?.length || 0;
      const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
      const responseStats = { total, completed, completion };
      
      // Always get the original creator's name from the user map
      // This ensures we show the main owner's name even for shared surveys
      let createdByName = 'Unknown User';
      if (s.createdBy) {
        if (userMap[s.createdBy]) {
          createdByName = userMap[s.createdBy];
        } else {
          // If we don't have the user in our map yet, try to get it directly
          const user = Meteor.users.findOne(s.createdBy);
          if (user) {
            createdByName = user.profile?.name || 
                          user.username || 
                          (user.emails && user.emails[0] && user.emails[0].address) || 
                          'Unknown User';
            // Update the map for future use
            userMap[s.createdBy] = createdByName;
          }
        }
      }
      
      // Determine ownership and collaboration relationships
      const isOwned = s.createdBy === userId;
      const isSharedByMe = isOwned && Array.isArray(s.collaborators) && s.collaborators.length > 0;
      const isSharedWithMe = !isOwned && Array.isArray(s.collaborators) && 
        s.collaborators.some((collab: any) => collab.userId === userId);
      
      return {
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : String(s.updatedAt),
        sections,
        questionCount,
        responseStats,
        createdByName,
        isOwned,
        isSharedByMe,
        isSharedWithMe
      };
    });
  }, [userId, surveys]);

  // Using itemsPerPage state variable instead of fixed pageSize
  const filtered = processedSurveys.filter((s: ProcessedSurvey) => {
    // Text search filter
    const matchesSearch = 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && (s.status === 'active' || (s.published && !s.status))) ||
      (statusFilter === 'draft' && (s.status === 'draft' || (!s.published && !s.status))) ||
      (statusFilter === 'inactive' && s.status === 'inactive');
    
    // Created By filter
    const matchesCreatedBy = 
      createdByFilter === 'all' ||
      (createdByFilter === 'owned' && s.isOwned) ||
      (createdByFilter === 'shared_by_me' && s.isSharedByMe) ||
      (createdByFilter === 'shared_with_me' && s.isSharedWithMe);
    
    return matchesSearch && matchesStatus && matchesCreatedBy;
  });
  
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, createdByFilter]);

  return (
    <AdminLayout>
      <CardStyles />
      <DashboardBg>
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <Modal>
            <ModalContent>
              <ModalTitle>Delete {surveyLabel}</ModalTitle>
              <ModalText>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>'{confirmDelete.title}'</span>? This action cannot be undone.
              </ModalText>
              <ModalButtons>
                <DeleteButton
                  onClick={async () => {
                    try {
                      await Meteor.callAsync('surveys.remove', confirmDelete._id);
                      setNotification({ type: 'success', message: `${surveyLabel} deleted successfully.` });
                    } catch (err: any) {
                      setNotification({ type: 'error', message: `Error deleting ${surveyLabel.toLowerCase()}: ${err.reason || err.message || 'Unknown error'}` });
                    }
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </DeleteButton>
                <CancelButton
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </CancelButton>
              </ModalButtons>
            </ModalContent>
          </Modal>
        )}
        <Container>
          <TitleRow>
            <Title>All {surveyLabelPlural}</Title>
            <AddButton
              onClick={() => {
                window.location.href = '/admin/surveys/builder';
              }}
            >
              <FaPlus style={{ fontSize: 14 }} />
              <span style={{ marginLeft: 6 }}>Add Survey</span>
            </AddButton>
          </TitleRow>
          {/* Survey Statistics Summary */}
          <SurveyStatsSummary />
          
          <SearchContainer>
            <div style={{ display: 'flex', gap: 20 }}>
            <SearchInputWrapper>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder={`Search ${surveyLabelPlural.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchInputWrapper>
            
            <FilterContainer>
              {/* Status Filter */}
              <FilterSelect
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </FilterSelect>

              <FilterSelect
                value={createdByFilter}
                onChange={(e) => {
                  setCreatedByFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <option value="all">All</option>
                <option value="owned">Survey I Own</option>
                <option value="shared_by_me">Survey I've Shared</option>
                <option value="shared_with_me">Shared With Me</option>
              </FilterSelect>
            </FilterContainer>
            </div>
            
            <ActionsContainer>
              {/* View Toggle */}
              <ViewToggle view={view} onViewChange={setView} />
            </ActionsContainer>
          </SearchContainer>
          {/* Notification Bar */}
          {notification && (
            <Notification type={notification.type}>
              <span style={{ flex: 1 }}>{notification.message}</span>
              <NotificationCloseButton
                onClick={() => setNotification(null)}
              >
                ×
              </NotificationCloseButton>
            </Notification>
          )}
          {/* Survey List */}
          {filtered.length === 0 && <NoResultsText>No {surveyLabelPlural.toLowerCase()} found.</NoResultsText>}
          {paginated.length > 0 && (
            view === 'grid' ? (
              <GridContainer>
                {paginated.map((s) => (
                  <SurveyCard
                    key={s._id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(85, 42, 71, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(85, 42, 71, 0.08)';
                    }}
                  >
                    <CardHeader>
                      <StatusBadge status={s.status || (s.published ? 'active' : 'draft')}>
                        {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : (s.published ? 'Active' : 'Draft')}
                      </StatusBadge>
                      <DropdownContainer ref={openDropdown === s._id ? dropdownRef : null}>
                        <DropdownButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === s._id ? null : s._id);
                          }}
                          title="Actions"
                        >
                          <FaEllipsisV style={{ color: 'var(--color-primary)', fontSize: 16 }} />
                        </DropdownButton>
                        
                        {openDropdown === s._id && (
                          <DropdownMenu>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Preview survey
                                Meteor.call('surveys.generateEncryptedToken', s._id, (tokenErr, token) => {
                                  if (!tokenErr && token) {
                                    window.open(`/public/${token}?preview=true`, '_blank');
                                  }
                                });
                              }}
                            >
                              Preview
                            </DropdownItem>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/surveys/manage/${s._id}`);
                              }}
                            >
                              Edit
                            </DropdownItem>
                            {s.published && (
                              <DropdownItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Copy shareable link
                                  Meteor.call('surveys.generateEncryptedToken', s._id, (err: Meteor.Error | null, token: string) => {
                                    if (!err && token) {
                                      navigator.clipboard.writeText(`${window.location.origin}/public/${token}`);
                                      setNotification({ type: 'success', message: 'Survey URL copied to clipboard!' });
                                    }
                                  });
                                }}
                              >
                                Copy Public Link
                              </DropdownItem>
                            )}
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewResponses(s._id, s.title);
                              }}
                            >
                              Analytics
                            </DropdownItem>
                            {s.status === 'inactive' ? (
                              <DropdownItem
                                className="restore"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  // Restore the survey
                                  Meteor.call('surveys.restore', s._id, (err: Meteor.Error | null) => {
                                    if (err) {
                                      console.error('Error restoring survey:', err);
                                      setNotification({ type: 'error', message: `Error restoring ${surveyLabel.toLowerCase()}: ${err.reason || err.message || 'Unknown error'}` });
                                    } else {
                                      setNotification({ type: 'success', message: `${surveyLabel} restored successfully.` });
                                    }
                                  });
                                  setOpenDropdown(null);
                                }}
                                style={{ color: '#000000' }}
                              >
                                Restore
                              </DropdownItem>
                            ) : (
                              <DropdownItem
                                className="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onDelete(s._id, s.title);
                                }}
                                style={{ color: '#dc3545' }}
                              >
                                Delete
                              </DropdownItem>
                            )}
                          </DropdownMenu>
                        )}
                      </DropdownContainer>
                    </CardHeader>
                    <SurveyTitle 
                      onClick={() => navigate(`/admin/surveys/manage/${s._id}`)}
                      title="Click to manage this survey"
                    >
                      {s.title}
                    </SurveyTitle>
                    
                    <div className="card-info">
                      <div className="info-item">
                        <span className="info-label">Updated:</span>
                        <span className="info-value">
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </SurveyCard>
                ))}
              </GridContainer>
            ) : (
              <SurveyListView 
                surveys={paginated} 
                onEdit={(id) => navigate(`/admin/surveys/builder/${id}`)}
                onDelete={(id, title) => setConfirmDelete({ _id: id, title })}
                onViewResponses={(id, title) => setResponsesModal({ isOpen: true, surveyId: id, surveyTitle: title })}
                onCopyLink={(id) => {
                  Meteor.call('surveys.generateEncryptedToken', id, (err: Meteor.Error | null, token: string) => {
                    if (err || !token) {
                      console.error('Error generating token for copying link:', err);
                      setNotification({ type: 'error', message: 'Failed to generate sharable link' });
                      return;
                    }
                    
                    // Create the full URL
                    const url = `${window.location.origin}/public/${token}`;
                    
                    // Copy to clipboard
                    navigator.clipboard.writeText(url)
                      .then(() => {
                        setNotification({ type: 'success', message: 'Sharable link copied to clipboard!' });
                      })
                      .catch((clipboardErr) => {
                        console.error('Failed to copy link to clipboard:', clipboardErr);
                        setNotification({ type: 'error', message: 'Failed to copy link to clipboard' });
                      });
                  });
                }}
                onPreview={(id, isPublic) => {
                  if (isPublic) {
                    // For public surveys, just open the URL directly
                    Meteor.call('surveys.generateEncryptedToken', id, (err: Meteor.Error | null, token: string) => {
                      if (!err && token) {
                        window.open(`/public/${token}`, '_blank');
                      }
                    });
                  } else {
                    // For preview, fetch the latest survey data first
                    Meteor.call('surveys.get', id, (err: Meteor.Error | null, surveyData: any) => {
                      if (err) {
                        console.error('Error fetching survey data for preview:', err);
                        setNotification({ type: 'error', message: 'Failed to prepare survey preview' });
                        return;
                      }
                      
                      // Generate token for preview
                      Meteor.call('surveys.generateEncryptedToken', id, (tokenErr: Meteor.Error | null, token: string) => {
                        if (tokenErr || !token) {
                          console.error('Error generating token for preview:', tokenErr);
                          setNotification({ type: 'error', message: 'Failed to generate preview URL' });
                          return;
                        }
                        
                        try {
                          // Save the latest survey data to localStorage
                          localStorage.setItem(`survey-preview-${token}`, JSON.stringify(surveyData));
                          
                          // Open preview in new tab
                          window.open(`/public/${token}?status=preview`, '_blank');
                        } catch (saveErr) {
                          console.error('Error saving preview data:', saveErr);
                          setNotification({ type: 'error', message: 'Failed to prepare survey preview' });
                        }
                      });
                    });
                  }
                }}
              />
            )
          )}
          {/* Pagination Controls */}
          <PaginationContainer>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>Items per page:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1); // Reset to first page when changing items per page
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
              <span>Showing {Math.min((page - 1) * itemsPerPage + 1, filtered.length)} - {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}</span>
            </div>
            
            <div>
              <PaginationButton 
                onClick={() => setPage(1)} 
                disabled={page === 1}
              >
                First
              </PaginationButton>
              <PaginationButton 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                disabled={page === 1}
              >
                Previous
              </PaginationButton>
              {(() => {
                // Show current page and 2 pages before and after
                const pageNumbers = [];
                
                let startPage = Math.max(1, page - 2);
                let endPage = Math.min(pageCount, page + 2);
                
                // Adjust if we're near the start or end
                if (page <= 3) {
                  endPage = Math.min(5, pageCount);
                } else if (page >= pageCount - 2) {
                  startPage = Math.max(1, pageCount - 4);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <PaginationButton 
                      key={i} 
                      onClick={() => setPage(i)}
                      active={i === page}
                    >
                      {i}
                    </PaginationButton>
                  );
                }
                
                return pageNumbers;
              })()}
              <PaginationButton 
                onClick={() => setPage(prev => Math.min(prev + 1, pageCount))} 
                disabled={page === pageCount}
              >
                Next
              </PaginationButton>
              <PaginationButton 
                onClick={() => setPage(pageCount)} 
                disabled={page === pageCount}
              >
                Last
              </PaginationButton>
            </div>
          </PaginationContainer>
        </Container>
      </DashboardBg>
      
      {/* Survey Responses Modal */}
      <SurveyResponsesModal
        isOpen={responsesModal.isOpen}
        onClose={() => setResponsesModal({ ...responsesModal, isOpen: false })}
        surveyId={responsesModal.surveyId}
        surveyTitle={responsesModal.surveyTitle}
      />
    </AdminLayout>
  );
};

export default AllSurveys;