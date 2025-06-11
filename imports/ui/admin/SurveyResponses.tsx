import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { SurveyResponses as SurveyResponsesCollection } from '../../features/surveys/api/surveyResponses';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiChevronRight, 
  FiFilter, 
  FiDownload, 
  FiGrid, 
  FiList, 
  FiFileText, 
  FiBarChart2, 
  FiEye, 
  FiEdit 
} from 'react-icons/fi';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import { format } from 'date-fns';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  justify-content: flex-end;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  color: ${props => props.active ? '#fff' : '#555'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#e0e0e0'};
  }
  
  svg {
    font-size: 18px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
  padding: 4px;
`;

const SurveyCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid #edf2f7;
  position: relative;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(85, 42, 71, 0.12);
    transform: translateY(-3px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #552a47, #7b4068);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #edf2f7;
  background-color: #ffffff;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(to right, #edf2f7, #f8f9fa, #edf2f7);
  }
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a202c;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #718096;
  margin: 0;
  flex-grow: 1;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #f8f9fa;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 16px 20px;
  border-top: 1px solid #edf2f7;
  background-color: #ffffff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const CardStats = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StatValue = styled.div`
  font-weight: 700;
  font-size: 24px;
  color: #552a47;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 24px;
    height: 2px;
    background: linear-gradient(to right, #552a47, rgba(85, 42, 71, 0.2));
    border-radius: 2px;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

const StatusLabel = styled.span<{ status: 'published' | 'draft' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'published' ? '#e6f7eb' : '#f7fafc'};
  color: ${props => props.status === 'published' ? '#2f855a' : '#718096'};
  text-transform: capitalize;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.status === 'published' ? '#2f855a' : '#718096'};
    margin-right: 6px;
    box-shadow: 0 0 0 2px ${props => props.status === 'published' ? 'rgba(47, 133, 90, 0.2)' : 'rgba(113, 128, 150, 0.2)'};
  }
`;

const FilterContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 24px;
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  border: 1px solid #edf2f7;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    color: #552a47;
    font-size: 16px;
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 280px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.2);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  color: #4a5568;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  min-width: 180px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.2);
  }
  
  &:hover {
    border-color: #cbd5e0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #4a5568;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const ClearFiltersButton = styled.button`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 500;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
    color: #2d3748;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #552a47, #7b4068);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(85, 42, 71, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(85, 42, 71, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
`;

const Th = styled.th`
  text-align: left;
  padding: 18px 20px;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
  border-bottom: 1px solid #edf2f7;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
  transition: background-color 0.2s;
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const Td = styled.td`
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.2s;
  line-height: 1.5;
`;

const SurveyRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: #f7fafc;
  }
  
  &:hover td:first-child {
    box-shadow: inset 4px 0 0 #552a47;
  }
  
  &:active {
    background-color: #edf2f7;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const ResponseRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafbfc;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const ResponseDetails = styled.div`
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-top: 8px;
`;

const NoData = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #718096;
  font-size: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
  margin: 20px 0;
  flex-direction: column;
  gap: 12px;
  
  svg {
    color: #a0aec0;
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const ExpandButton = styled.button`
background: none;
border: none;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
color: #a0aec0;
padding: 6px;
border-radius: 6px;
transition: all 0.2s;

&:hover {
  background: rgba(85, 42, 71, 0.08);
  color: #552a47;
}

svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5px;
}
`;

// Use the actual types from the collections
interface SurveyResponse {
  _id?: string;
  surveyId: string;
  answers: Record<string, any>;
  startedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  respondentInfo?: {
    email?: string;
    name?: string;
    userId?: string;
  };
  completionStatus?: 'complete' | 'partial' | 'abandoned';
  timeSpent?: number; // in seconds
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

interface Survey {
  _id?: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  color?: string;
  createdBy?: string;
  shareToken?: string;
  selectedQuestions?: Record<string, any>;
  siteTextQuestions?: Array<any>;
  siteTextQForm?: any;
  selectedDemographics?: string[];
  organizationId?: string;
  defaultSettings?: {
    allowAnonymous?: boolean;
    requireLogin?: boolean;
    showProgressBar?: boolean;
    allowSave?: boolean;
    allowSkip?: boolean;
    showThankYou?: boolean;
    thankYouMessage?: string;
    redirectUrl?: string;
    notificationEmails?: string[];
    expiryDate?: Date;
    responseLimit?: number;
    themes?: string[];
    categories?: string[];
  };
  isActive?: boolean;
  priority?: number;
  keywords?: string[];
}

const SurveyResponses: React.FC = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // State for expanded rows
  const [expandedSurveys, setExpandedSurveys] = React.useState<Record<string, boolean>>({});
  const [expandedResponses, setExpandedResponses] = React.useState<Record<string, boolean>>({});
  
  // View toggle state
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'last7' | 'last30' | 'last90'>('all');
  const [filterResponseCount, setFilterResponseCount] = useState<'all' | 'withResponses' | 'noResponses'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load surveys and responses
  const { surveys, responses, loading, error } = useTracker(() => {
    try {
      const surveysHandle = Meteor.subscribe('surveys.all');
      const responsesHandle = Meteor.subscribe('survey_responses.all');
      
      const isLoading = !surveysHandle.ready() || !responsesHandle.ready();
      
      // Only fetch data if subscriptions are ready
      let surveyDocs: Survey[] = [];
      let responseDocs: SurveyResponse[] = [];
      
      if (!isLoading) {
        surveyDocs = Surveys.find({}, { sort: { updatedAt: -1 } }).fetch() || [];
        // Convert SurveyResponseDoc to SurveyResponse
        const fetchedResponses = SurveyResponsesCollection.find({}).fetch() || [];
        responseDocs = fetchedResponses.map(doc => ({
          _id: doc._id,
          surveyId: doc.surveyId,
          answers: doc.responses ? doc.responses.reduce((acc, resp) => {
            acc[resp.questionId] = resp.answer;
            return acc;
          }, {} as Record<string, any>) : {},
          createdAt: doc.startTime || new Date(),
          startedAt: doc.startTime,
          userId: doc.userId,
          completionStatus: doc.completed ? 'complete' : 'partial'
        }));
      }
      
      return {
        surveys: surveyDocs,
        responses: responseDocs,
        loading: isLoading,
        error: null as string | null
      };
    } catch (err: unknown) {
      console.error('Error loading survey responses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load survey responses';
      return {
        surveys: [] as Survey[],
        responses: [] as SurveyResponse[],
        loading: false,
        error: errorMessage
      };
    }
  }, []);
  
  // Group responses by survey
  const responsesBySurvey = React.useMemo(() => {
    const grouped: Record<string, SurveyResponse[]> = {};
    
    if (responses) {
      responses.forEach(response => {
        if (!grouped[response.surveyId]) {
          grouped[response.surveyId] = [];
        }
        grouped[response.surveyId].push(response);
      });
    }
    
    return grouped;
  }, [responses]);
  
  // Apply filters to surveys
  const filteredSurveys = React.useMemo(() => {
    return surveys.filter(survey => {
      // Filter by search term
      if (searchTerm && !survey.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !survey.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (filterStatus === 'published' && !survey.published) {
        return false;
      }
      if (filterStatus === 'draft' && survey.published) {
        return false;
      }
      
      // Filter by date range
      if (filterDateRange !== 'all') {
        const today = new Date();
        const surveyDate = new Date(survey.updatedAt);
        const diffTime = Math.abs(today.getTime() - surveyDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filterDateRange === 'last7' && diffDays > 7) {
          return false;
        }
        if (filterDateRange === 'last30' && diffDays > 30) {
          return false;
        }
        if (filterDateRange === 'last90' && diffDays > 90) {
          return false;
        }
      }
      
      // Filter by response count
      const surveyId = survey._id || '';
      const surveyResponses = responsesBySurvey[surveyId] || [];
      
      if (filterResponseCount === 'withResponses' && surveyResponses.length === 0) {
        return false;
      }
      if (filterResponseCount === 'noResponses' && surveyResponses.length > 0) {
        return false;
      }
      
      return true;
    });
  }, [surveys, responsesBySurvey, searchTerm, filterStatus, filterDateRange, filterResponseCount]);
  
  // Toggle survey expansion
  const toggleSurveyExpansion = (surveyId: string) => {
    setExpandedSurveys(prev => ({
      ...prev,
      [surveyId]: !prev[surveyId]
    }));
  };
  
  // Handle dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if the click is on a dropdown button
      if ((event.target as Element).closest('button')) {
        return;
      }
      
      // Close all dropdowns if clicking outside
      if (!(event.target as Element).closest('.export-dropdown')) {
        document.querySelectorAll('.export-dropdown').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Toggle response expansion
  const toggleResponseExpansion = (responseId: string) => {
    setExpandedResponses(prev => ({
      ...prev,
      [responseId]: !prev[responseId]
    }));
  };
  
  // Export responses as CSV with enhanced options
  const exportResponses = (surveyId: string, surveyTitle: string, exportType: 'basic' | 'detailed' | 'analytics' = 'basic') => {
    const surveyResponses = responsesBySurvey[surveyId] || [];
    if (surveyResponses.length === 0) return;
    
    // Get the survey for question metadata
    const survey = surveys.find(s => s._id === surveyId);
    
    // Get all unique question IDs
    const allQuestionIds = new Set<string>();
    surveyResponses.forEach(response => {
      Object.keys(response.answers).forEach(qId => allQuestionIds.add(qId));
    });
    
    // Create CSV header based on export type
    let csv = '';
    
    if (exportType === 'basic') {
      // Basic export: Just response ID, date, and answers
      csv = 'Response ID,Submitted Date';
      allQuestionIds.forEach(qId => {
        // Try to get question text if available
        let questionText = `Question ${qId}`;
        if (survey?.selectedQuestions?.[qId]?.questionText) {
          questionText = survey.selectedQuestions[qId].questionText;
          // Escape quotes and commas
          questionText = questionText.replace(/"/g, '""');
          if (questionText.includes(',')) {
            questionText = `"${questionText}"`;
          }
        }
        csv += `,${questionText}`;
      });
    } else if (exportType === 'detailed') {
      // Detailed export: Include respondent info and completion data
      csv = 'Response ID,Submitted Date,Started Date,Time to Complete (sec),Completion Status,Respondent Email';
      allQuestionIds.forEach(qId => {
        let questionText = `Question ${qId}`;
        if (survey?.selectedQuestions?.[qId]?.questionText) {
          questionText = survey.selectedQuestions[qId].questionText;
          questionText = questionText.replace(/"/g, '""');
          if (questionText.includes(',')) {
            questionText = `"${questionText}"`;
          }
        }
        csv += `,${questionText}`;
      });
    } else if (exportType === 'analytics') {
      // Analytics export: Include all metadata for deeper analysis
      csv = 'Response ID,Survey ID,Submitted Date,Started Date,Time to Complete (sec),Completion Status,Respondent Email,Respondent Name,Respondent User ID,Browser,OS,Device,Question Count,Answer Count';
      allQuestionIds.forEach(qId => {
        let questionText = `Question ${qId}`;
        if (survey?.selectedQuestions?.[qId]?.questionText) {
          questionText = survey.selectedQuestions[qId].questionText;
          questionText = questionText.replace(/"/g, '""');
          if (questionText.includes(',')) {
            questionText = `"${questionText}"`;
          }
        }
        csv += `,${questionText}`;
      });
    }
    
    csv += '\n';
    
    // Add response data
    surveyResponses.forEach(response => {
      // Use a default ID if _id is undefined
      const responseId = response._id || 'unknown';
      
      if (exportType === 'basic') {
        csv += `${responseId},${response.createdAt ? response.createdAt.toISOString() : new Date().toISOString()}`;
      } else if (exportType === 'detailed') {
        // Calculate time to complete if available
        let timeToComplete = '';
        if (response.startedAt && response.createdAt) {
          const startTime = new Date(response.startedAt).getTime();
          const endTime = new Date(response.createdAt).getTime();
          timeToComplete = Math.floor((endTime - startTime) / 1000).toString();
        }
        
        // Get completion status
        const completionStatus = response.completionStatus || 'unknown';
        
        // Get respondent email
        const respondentEmail = response.respondentInfo?.email || '';
        
        csv += `${responseId},${response.createdAt ? response.createdAt.toISOString() : new Date().toISOString()},${response.startedAt ? new Date(response.startedAt).toISOString() : ''},${timeToComplete},${completionStatus},${respondentEmail}`;
      } else if (exportType === 'analytics') {
        // Calculate time to complete if available
        let timeToComplete = '';
        if (response.startedAt && response.createdAt) {
          const startTime = new Date(response.startedAt).getTime();
          const endTime = new Date(response.createdAt).getTime();
          timeToComplete = Math.floor((endTime - startTime) / 1000).toString();
        }
        
        // Get completion status
        const completionStatus = response.completionStatus || 'unknown';
        
        // Get respondent info
        const respondentEmail = response.respondentInfo?.email || '';
        const respondentName = response.respondentInfo?.name || '';
        const respondentUserId = response.respondentInfo?.userId || '';
        
        // Get device info
        const browser = response.deviceInfo?.browser || '';
        const os = response.deviceInfo?.os || '';
        const device = response.deviceInfo?.device || '';
        
        // Get question and answer counts
        const totalQuestions = survey?.selectedQuestions ? Object.keys(survey.selectedQuestions).length : 0;
        const answeredQuestions = Object.keys(response.answers).length;
        
        csv += `${responseId},${response.surveyId},${response.createdAt ? response.createdAt.toISOString() : new Date().toISOString()},${response.startedAt ? new Date(response.startedAt).toISOString() : ''},${timeToComplete},${completionStatus},${respondentEmail},${respondentName},${respondentUserId},${browser},${os},${device},${totalQuestions},${answeredQuestions}`;
      }
      
      // Add answer data for all export types
      allQuestionIds.forEach(qId => {
        const answer = response.answers[qId];
        let formattedAnswer = '';
        
        if (answer !== undefined) {
          if (typeof answer === 'object') {
            if (answer.label) {
              formattedAnswer = answer.label;
            } else if (Array.isArray(answer)) {
              formattedAnswer = answer.map((a: any) => a.label || a).join('; ');
            } else {
              formattedAnswer = JSON.stringify(answer);
            }
          } else {
            formattedAnswer = String(answer);
          }
        }
        
        // Escape commas and quotes
        formattedAnswer = formattedAnswer.replace(/"/g, '""');
        if (formattedAnswer.includes(',')) {
          formattedAnswer = `"${formattedAnswer}"`;
        }
        
        csv += `,${formattedAnswer}`;
      });
      
      csv += '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    // Ensure title is a string before using replace
    const safeTitle = (surveyTitle || 'survey').replace(/\s+/g, '_');
    const exportTypeText = exportType === 'basic' ? '' : `_${exportType}`;
    link.setAttribute('download', `${safeTitle}_responses${exportTypeText}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    setNotification({
      type: 'success',
      message: `${surveyResponses.length} responses exported successfully!`
    });
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Format response for display
  const formatResponse = (answer: any): string => {
    if (answer === undefined || answer === null) {
      return 'No response';
    }
    
    if (typeof answer === 'object') {
      if (answer.label) {
        return answer.label;
      } else if (Array.isArray(answer)) {
        return answer.map((a: any) => a.label || a).join(', ');
      } else {
        return JSON.stringify(answer);
      }
    }
    
    return String(answer);
  };
  
  if (loading) {
    return <Container>Loading survey responses...</Container>;
  }
  
  return (
    <AdminLayout>
      <DashboardBg>
        {/* Notification Bar */}
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: notification.type === 'success' ? '#2ecc40' : '#e74c3c',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              zIndex: 2000,
              boxShadow: '0 2px 12px #552a4733',
              minWidth: 280,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ flex: 1 }}>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 18, padding: '32px 32px 40px 32px', background: 'transparent' }}>
          <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>Survey Responses</h2>
          
          <Container>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: '1px', height: '1px' }}></div>
              <ViewToggleContainer>
                <ViewToggleButton 
                  active={viewMode === 'table'} 
                  onClick={() => setViewMode('table')}
                  aria-label="Table View"
                >
                  <FiList />
                </ViewToggleButton>
                <ViewToggleButton 
                  active={viewMode === 'grid'} 
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                >
                  <FiGrid />
                </ViewToggleButton>
              </ViewToggleContainer>
            </div>
            
            <FilterContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px', 
                    background: 'rgba(85, 42, 71, 0.08)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <FiFilter style={{ color: '#552a47', strokeWidth: 2.5 }} />
                  </div>
                  <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '16px' }}>Filters</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <SearchInput
                    type="text"
                    placeholder="Search surveys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    color: searchTerm ? '#552a47' : '#a0aec0'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>
              
              <FilterGrid>
                <FilterGroup>
                  <FilterLabel>Status</FilterLabel>
                  <FilterSelect 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Draft Only</option>
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Date Range</FilterLabel>
                  <FilterSelect 
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value as 'all' | 'last7' | 'last30' | 'last90')}
                  >
                    <option value="all">All Time</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="last90">Last 90 Days</option>
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Responses</FilterLabel>
                  <FilterSelect 
                    value={filterResponseCount}
                    onChange={(e) => setFilterResponseCount(e.target.value as 'all' | 'withResponses' | 'noResponses')}
                  >
                    <option value="all">All Surveys</option>
                    <option value="withResponses">With Responses</option>
                    <option value="noResponses">No Responses</option>
                  </FilterSelect>
                </FilterGroup>
                
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <ClearFiltersButton
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterDateRange('all');
                      setFilterResponseCount('all');
                      setSearchTerm('');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M19 12H5"></path>
                      <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Clear Filters
                  </ClearFiltersButton>
                </div>
              </FilterGrid>
            </FilterContainer>
            
            {surveys.length === 0 ? (
              <NoData>
                <FiFileText />
                <div>No surveys found</div>
                <div style={{ fontSize: '13px', color: '#a0aec0', maxWidth: '400px', textAlign: 'center' }}>
                  Try adjusting your filters or create a new survey to get started
                </div>
              </NoData>
            ) : viewMode === 'table' ? (
              <Table>
                <thead>
                  <tr>
                    <Th style={{ width: '5%' }}></Th>
                    <Th style={{ width: '30%' }}>Survey</Th>
                    <Th style={{ width: '15%' }}>Created</Th>
                    <Th style={{ width: '15%' }}>Last Updated</Th>
                    <Th style={{ width: '15%' }}>Status</Th>
                    <Th style={{ width: '10%' }}>Responses</Th>
                    <Th style={{ width: '10%' }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.map(survey => {
                    // Ensure survey._id is defined with a fallback
                    const surveyId = survey._id || `survey-${Math.random().toString(36).substring(2, 9)}`;
                    const surveyResponses = responsesBySurvey[surveyId] || [];
                    const isExpanded = expandedSurveys[surveyId] || false;
                    
                    return (
                      <React.Fragment key={surveyId}>
                        <SurveyRow onClick={() => toggleSurveyExpansion(surveyId)}>
                          <Td>
                            <ExpandButton>
                              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                            </ExpandButton>
                          </Td>
                          <Td>
                            <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>{survey.title}</div>
                            {survey.description && (
                              <div style={{ fontSize: '13px', color: '#718096', lineHeight: '1.4' }}>
                                {survey.description.length > 80 ? `${survey.description.substring(0, 80)}...` : survey.description}
                              </div>
                            )}
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{format(survey.createdAt, 'MMM d, yyyy')}</span>
                              <span style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{format(survey.createdAt, 'h:mm a')}</span>
                            </div>
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{format(survey.updatedAt, 'MMM d, yyyy')}</span>
                              <span style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{format(survey.updatedAt, 'h:mm a')}</span>
                            </div>
                          </Td>
                          <Td>
                            <StatusLabel status={survey.published ? 'published' : 'draft'}>
                              {survey.published ? 'Published' : 'Draft'}
                            </StatusLabel>
                          </Td>
                          <Td>
                            <span style={{
                              fontWeight: '600',
                              color: surveyResponses.length > 0 ? '#2f855a' : '#718096',
                              background: surveyResponses.length > 0 ? 'rgba(47, 133, 90, 0.1)' : 'transparent',
                              padding: surveyResponses.length > 0 ? '4px 10px' : '0',
                              borderRadius: '16px',
                              display: 'inline-block',
                              fontSize: '13px'
                            }}>
                              {surveyResponses.length}
                            </span>
                          </Td>
                          <Td>
                            {surveyResponses.length > 0 && (
                              <div style={{ position: 'relative' }}>
                                <ExportButton 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Toggle dropdown visibility
                                    const dropdown = e.currentTarget.nextElementSibling as HTMLDivElement;
                                    if (dropdown) {
                                      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                                    }
                                  }}
                                >
                                  <FiDownload />
                                  Export
                                </ExportButton>
                                <div 
                                  style={{
                                    display: 'none',
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: 4,
                                    background: '#fff',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    borderRadius: 6,
                                    zIndex: 10,
                                    width: 200
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div 
                                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportResponses(surveyId, survey.title || 'Survey', 'basic');
                                      (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                    }}
                                  >
                                    Basic Export
                                  </div>
                                  <div 
                                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportResponses(surveyId, survey.title || 'Survey', 'detailed');
                                      (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                    }}
                                  >
                                    Detailed Export
                                  </div>
                                  <div 
                                    style={{ padding: '10px 16px', cursor: 'pointer' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportResponses(surveyId, survey.title || 'Survey', 'analytics');
                                      (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                    }}
                                  >
                                    Analytics Export
                                  </div>
                                </div>
                              </div>
                            )}
                          </Td>
                        </SurveyRow>
                  
                  {isExpanded && (
                    <tr>
                      <Td colSpan={7} style={{ padding: 0 }}>
                        <div style={{ padding: '16px 20px 24px 48px', backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px' }}>
                          {surveyResponses.length === 0 ? (
                            <NoData>No responses for this survey</NoData>
                          ) : (
                            <Table>
                              <thead>
                                <tr>
                                  <Th style={{ width: '5%' }}></Th>
                                  <Th style={{ width: '30%' }}>Response ID</Th>
                                  <Th style={{ width: '65%' }}>Submitted</Th>
                                </tr>
                              </thead>
                              <tbody>
                                {surveyResponses.map((response: SurveyResponse) => {
                                  const responseId = response._id || 'unknown';
                                  const isResponseExpanded = expandedResponses[responseId] || false;
                                  
                                  return (
                                    <React.Fragment key={responseId}>
                                      <ResponseRow 
                                        onClick={() => toggleResponseExpansion(responseId)}
                                      >
                                        <Td>
                                          <ExpandButton>
                                            {isResponseExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                          </ExpandButton>
                                        </Td>
                                        <Td>
                                          <div style={{ fontWeight: 500 }}>{responseId}</div>
                                          {response.respondentInfo && (
                                            <div style={{ fontSize: '0.85em', color: '#666', marginTop: 4 }}>
                                              {response.respondentInfo.email || 'Anonymous'}
                                            </div>
                                          )}
                                        </Td>
                                        <Td>
                                          <div>{(response.createdAt || new Date()).toLocaleString()}</div>
                                          <div style={{ fontSize: '0.85em', color: '#666', marginTop: 4 }}>
                                            {(() => {
                                              const now = new Date();
                                              const submitted = new Date(response.createdAt || new Date());
                                              const diffTime = Math.abs(now.getTime() - submitted.getTime());
                                              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                              const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                              const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
                                              
                                              if (diffDays > 0) {
                                                return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                              } else if (diffHours > 0) {
                                                return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                                              } else if (diffMinutes > 0) {
                                                return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                                              } else {
                                                return 'Just now';
                                              }
                                            })()}
                                          </div>
                                        </Td>
                                      </ResponseRow>
                                      
                                      {isResponseExpanded && (
                                        <tr>
                                          <Td colSpan={3} style={{ padding: 0 }}>
                                            <div style={{ padding: '20px 24px 24px 48px', backgroundColor: '#f1f3f5', borderRadius: '8px', margin: '8px 0' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>Response Details</h4>
                                                <div>
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      // Create a single response export
                                                      let csv = 'Question ID,Question Text,Response\n';
                                                      Object.entries(response.answers).forEach(([questionId, answer]) => {
                                                        csv += `${questionId},"Question ${questionId}","${formatResponse(answer).replace(/"/g, '""')}"\n`;
                                                      });
                                                      
                                                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                                      const url = URL.createObjectURL(blob);
                                                      const link = document.createElement('a');
                                                      link.setAttribute('href', url);
                                                      link.setAttribute('download', `response_${responseId}.csv`);
                                                      link.style.visibility = 'hidden';
                                                      document.body.appendChild(link);
                                                      link.click();
                                                      document.body.removeChild(link);
                                                    }}
                                                    style={{ 
                                                      background: '#f0f0f0', 
                                                      border: 'none', 
                                                      borderRadius: 4, 
                                                      padding: '6px 12px',
                                                      display: 'flex', 
                                                      alignItems: 'center', 
                                                      justifyContent: 'center',
                                                      cursor: 'pointer',
                                                      color: '#4a5568',
                                                      fontSize: '13px',
                                                      fontWeight: 500,
                                                      transition: 'all 0.2s ease'
                                                    }}
                                                  >
                                                    <FiDownload size={14} />
                                                    Export This Response
                                                  </button>
                                                </div>
                                              </div>
                                              
                                              {/* Response metadata */}
                                              <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                                gap: 16,
                                                marginBottom: 24,
                                                background: '#f9f9f9',
                                                padding: 16,
                                                borderRadius: 8
                                              }}>
                                                <div>
                                                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Respondent</div>
                                                  <div style={{ fontWeight: 500 }}>
                                                    {response.respondentInfo?.email || 'Anonymous'}
                                                  </div>
                                                </div>
                                                
                                                <div>
                                                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Submitted</div>
                                                  <div style={{ fontWeight: 500 }}>
                                                    {(response.createdAt || new Date()).toLocaleString()}
                                                  </div>
                                                </div>
                                                
                                                <div>
                                                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Time to Complete</div>
                                                  <div style={{ fontWeight: 500 }}>
                                                    {response.startedAt && response.createdAt && (
                                                      (() => {
                                                        const start = new Date(response.startedAt);
                                                        const end = new Date(response.createdAt);
                                                        const diffTime = Math.abs(end.getTime() - start.getTime());
                                                        const diffMinutes = Math.floor(diffTime / (1000 * 60));
                                                        const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);
                                                        
                                                        return `${diffMinutes}m ${diffSeconds}s`;
                                                      })()
                                                    ) || 'Unknown'}
                                                  </div>
                                                </div>
                                                
                                                <div>
                                                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Completion Rate</div>
                                                  <div style={{ fontWeight: 500 }}>
                                                    {(() => {
                                                      // Count questions with answers vs total questions in survey
                                                      const answeredQuestions = Object.keys(response.answers).length;
                                                      const survey = surveys.find(s => s._id === response.surveyId);
                                                      const totalQuestions = survey ? Object.keys(survey.selectedQuestions || {}).length : 0;
                                                      
                                                      if (totalQuestions === 0) return 'N/A';
                                                      const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
                                                      return `${percentage}%`;
                                                    })()}
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {/* Response answers */}
                                              <div style={{ marginTop: 12 }}>
                                                <h5 style={{ marginBottom: 16, fontWeight: 600 }}>Response Answers</h5>
                                                {Object.entries(response.answers).map(([questionId, answer]) => {
                                                  // Find the question in the survey
                                                  const survey = surveys.find(s => s._id === response.surveyId);
                                                  const questionData = survey?.selectedQuestions?.[questionId];
                                                  const questionText = questionData?.questionText || `Question ${questionId}`;
                                                  
                                                  return (
                                                    <div key={questionId} style={{ marginBottom: 20, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                                                      <div style={{ 
                                                        fontWeight: 500, 
                                                        padding: '10px 16px', 
                                                        background: '#f5f5f5', 
                                                        borderBottom: '1px solid #eee'
                                                      }}>
                                                        {questionText}
                                                      </div>
                                                      <div style={{ padding: '12px 16px', background: '#fff' }}>
                                                        {formatResponse(answer)}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </Td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </Table>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </Table>
            ):
            
            (viewMode === 'grid' && (
              <GridContainer>
                {filteredSurveys.map(survey => {
                  const surveyId = survey._id || `survey-${Math.random().toString(36).substring(2, 9)}`;
                  const surveyResponses = responsesBySurvey[surveyId] || [];
                  
                  return (
                    <SurveyCard key={surveyId} onClick={() => toggleSurveyExpansion(surveyId)}>
                      <CardHeader>
                        <StatusLabel status={survey.published ? 'published' : 'draft'}>
                          {survey.published ? 'Published' : 'Draft'}
                        </StatusLabel>
                        <span style={{ 
                          fontSize: '0.8em',
                          color: '#718096',
                          fontWeight: 500
                        }}>
                          {new Date(survey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </CardHeader>
                      
                      <CardContent>
                        <CardTitle>{survey.title || 'Untitled Survey'}</CardTitle>
                        <CardDescription>
                          {survey.description || 'No description provided'}
                        </CardDescription>
                      </CardContent>
                      
                      <CardFooter>
                        <CardStats>
                          <StatItem>
                            <StatValue>{surveyResponses.length}</StatValue>
                            <StatLabel>Responses</StatLabel>
                          </StatItem>
                        </CardStats>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ position: 'relative' }}>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const dropdown = e.currentTarget.nextElementSibling as HTMLDivElement;
                                 dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                               }}
                              style={{ 
                                background: 'linear-gradient(135deg, #552a47, #7b4068)', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: 44, 
                                height: 44, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(85, 42, 71, 0.3)',
                                transition: 'all 0.3s ease',
                                transform: 'translateY(0)'
                              }}
                            >
                              <FiDownload style={{ fontSize: '18px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
                            </button>
                            <div className="export-dropdown" style={{ 
                              position: 'absolute', 
                              bottom: '100%', 
                              right: '0', 
                              marginBottom: '10px',
                              background: 'white', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)', 
                              zIndex: 999, 
                              display: 'none',
                              minWidth: '200px',
                              overflow: 'hidden'
                            }}>
                              <div 
                                style={{ 
                                  padding: '12px 16px', 
                                  cursor: 'pointer', 
                                  borderBottom: '1px solid #eee',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.2s ease',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportResponses(surveyId, survey.title || 'Survey', 'basic');
                                  (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                }}
                              >
                                <FiFileText style={{ color: '#552a47' }} /> Basic Export
                              </div>
                              <div 
                                style={{ 
                                  padding: '12px 16px', 
                                  cursor: 'pointer', 
                                  borderBottom: '1px solid #eee',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.2s ease',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportResponses(surveyId, survey.title || 'Survey', 'detailed');
                                  (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                }}
                              >
                                <FiList style={{ color: '#552a47' }} /> Detailed Export
                              </div>
                              <div 
                                style={{ 
                                  padding: '12px 16px', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.2s ease',
                                  fontSize: '14px',
                                  fontWeight: 500
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportResponses(surveyId, survey.title || 'Survey', 'analytics');
                                  (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
                                }}
                              >
                                <FiBarChart2 style={{ color: '#552a47' }} /> Analytics Export
                              </div>
                            </div>
                          </div>

                        </div>
                      </CardFooter>
                    </SurveyCard>
                  );
                })}
              </GridContainer>
            ))}
          </Container>
        </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyResponses;
