import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { SurveyResponses as SurveyResponsesCollection } from '../../features/surveys/api/surveyResponses';
import styled from 'styled-components';
import { FiChevronDown, FiChevronRight, FiDownload, FiFilter } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9e9e9;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #9a7025;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #ddd;
  font-weight: 600;
  color: #555;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const SurveyRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ResponseRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const ResponseDetails = styled.div`
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-top: 8px;
`;

const NoData = styled.div`
  text-align: center;
  padding: 32px;
  color: #777;
  font-style: italic;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: #777;
  
  &:hover {
    color: #333;
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
            <FilterContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div>
                  <FilterButton onClick={() => setShowFilters(!showFilters)}>
                    <FiFilter />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </FilterButton>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search surveys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1px solid #ddd',
                      width: 250,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
              
              {showFilters && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  background: '#f9f9f9', 
                  borderRadius: 8, 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Status</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published Only</option>
                      <option value="draft">Draft Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Date Range</label>
                    <select 
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value as 'all' | 'last7' | 'last30' | 'last90')}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                    >
                      <option value="all">All Time</option>
                      <option value="last7">Last 7 Days</option>
                      <option value="last30">Last 30 Days</option>
                      <option value="last90">Last 90 Days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Responses</label>
                    <select 
                      value={filterResponseCount}
                      onChange={(e) => setFilterResponseCount(e.target.value as 'all' | 'withResponses' | 'noResponses')}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                    >
                      <option value="all">All Surveys</option>
                      <option value="withResponses">With Responses</option>
                      <option value="noResponses">No Responses</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button 
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterDateRange('all');
                        setFilterResponseCount('all');
                        setSearchTerm('');
                      }}
                      style={{ 
                        background: '#f0f0f0', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '8px 16px', 
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </FilterContainer>
            
            {surveys.length === 0 ? (
              <NoData>No surveys found</NoData>
            ) : (
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
                      <div style={{ fontWeight: 500 }}>{survey.title}</div>
                      {survey.description && (
                        <div style={{ fontSize: '0.9em', color: '#777', marginTop: 4 }}>
                          {survey.description}
                        </div>
                      )}
                    </Td>
                    <Td>{survey.createdAt.toLocaleDateString()}</Td>
                    <Td>{survey.updatedAt.toLocaleDateString()}</Td>
                    <Td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 12, 
                        fontSize: '0.85em',
                        backgroundColor: survey.published ? '#e6f7e6' : '#f7f7e7',
                        color: survey.published ? '#2e7d32' : '#9e9d24'
                      }}>
                        {survey.published ? 'Published' : 'Draft'}
                      </span>
                    </Td>
                    <Td>{surveyResponses.length}</Td>
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
                        <div style={{ padding: '0 16px 16px 48px' }}>
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
                                            <div style={{ padding: '16px 16px 16px 48px' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <h4 style={{ margin: 0 }}>Response Details</h4>
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
                                                      fontSize: 13,
                                                      cursor: 'pointer',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: 6
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
      )}
          </Container>
        </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyResponses;
