import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FiChevronDown, FiChevronUp, FiDownload, FiExternalLink, FiUsers, FiPieChart, FiBarChart2, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { SurveyResponses as SurveyResponsesCollection } from '../../../features/surveys/api/surveyResponses';
import { Mongo } from 'meteor/mongo';
import { Surveys } from '../../../features/surveys/api/surveys';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #552a47;
  font-size: 24px;
  font-weight: 700;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(85, 42, 71, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Stats components
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f2f5;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatCardContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
`;

const StatCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StatCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const StatCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f7f2f5;
  border-radius: 8px;
  color: #552a47;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #552a47;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const TestDataButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 10px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResponsesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #212529;
`;

const StatusBadge = styled.span<{ complete: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.complete ? '#e6f7ed' : '#fff4e5'};
  color: ${props => props.complete ? '#0a8043' : '#ff9800'};
`;

const SurveyLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #552a47;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #552a47;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DetailRow = styled.tr`
  background-color: #f8f9fa;
`;

const DetailCell = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailSection = styled.div`
  margin-bottom: 12px;
`;

const DetailTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 16px;
  color: #552a47;
`;

const DetailList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
`;

const DetailItem = styled.div`
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DetailItemLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
`;

const DetailItemValue = styled.div`
  font-size: 14px;
  color: #212529;
  word-break: break-word;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.active ? '#552a47' : '#dee2e6'};
  background-color: ${props => props.active ? '#552a47' : 'white'};
  color: ${props => props.active ? 'white' : '#212529'};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#7b4068' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #6c757d;
  font-size: 18px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #6c757d;
  
  p {
    font-size: 18px;
    margin: 16px 0;
  }
`;

// Interface for survey response
interface SurveyResponse {
  _id?: string;
  surveyId: string;
  responses: Array<{
    questionId: string;
    answer: any;
    sectionId?: string;
  }>;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  userId?: string;
  metadata?: {
    browser?: string;
    device?: string;
    os?: string;
    deviceType?: string;
  };
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for survey
interface Survey {
  _id?: string;
  title: string;
  description?: string;
  questions?: any[];
}

const AllSurveyResponses: React.FC = () => {
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [responsesPerPage] = useState(10);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Stats state variables
  const [completedSurveysCount, setCompletedSurveysCount] = useState<number>(0);
  const [participationRate, setParticipationRate] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [avgEngagementScore, setAvgEngagementScore] = useState<number>(0);
  const [avgCompletionTime, setAvgCompletionTime] = useState<number>(0);
  const [responseRate, setResponseRate] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  
  // Fetch stats data
  useEffect(() => {
    setIsLoadingStats(true);
    
    // Prepare empty filter parameters (to get all data)
    const filterParams = {};
    
    // Fetch completed surveys count
    Meteor.call('getFilteredSurveysCount', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching completed surveys count:', error);
      } else {
        console.log('Completed surveys count:', result);
        setCompletedSurveysCount(result);
      }
    });
    
    // Fetch participation rate
    Meteor.call('getFilteredParticipationRate', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching participation rate:', error);
      } else {
        console.log('Participation rate:', result);
        setParticipationRate(result);
      }
    });
    
    // Fetch question completion rate
    Meteor.call('getQuestionCompletionRate', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching question completion rate:', error);
      } else {
        console.log('Question completion rate:', result);
        setCompletionRate(result);
      }
    });
    
    // Fetch average engagement score
    Meteor.call('getFilteredEngagementScore', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching enhanced engagement score:', error);
      } else {
        console.log('Average engagement score:', result);
        setAvgEngagementScore(result || 0);
      }
    });
    
    // Fetch average completion time
    Meteor.call('getFilteredCompletionTime', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching filtered completion time:', error);
      } else {
        console.log('Average completion time (minutes):', result);
        setAvgCompletionTime(result);
      }
    });
    
    // Fetch response rate
    Meteor.call('getFilteredResponseRate', filterParams, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching filtered response rate:', error);
      } else {
        console.log('Response rate:', result);
        setResponseRate(result);
      }
      setIsLoadingStats(false);
    });
  }, []);
  
  // Use Meteor's useTracker to subscribe to and fetch data
  const { responses: fetchedResponses, surveys, loading } = useTracker(() => {
    // Subscribe to all survey responses
    const responsesSub = Meteor.subscribe('responses.all');
    const surveysSub = Meteor.subscribe('surveys.all');
    
    // For backward compatibility, also try the older publication name
    const oldResponsesSub = Meteor.subscribe('survey_responses.all');
    
    // Check if subscriptions are ready
    const isLoading = !responsesSub.ready() || !surveysSub.ready() || !oldResponsesSub.ready();
    console.log('Subscriptions ready:', {
      'responses.all': responsesSub.ready(),
      'surveys.all': surveysSub.ready(),
      'survey_responses.all': oldResponsesSub.ready()
    });
    
    let allResponses: SurveyResponse[] = [];
    let allSurveys: Survey[] = [];
    
    if (!isLoading) {
      // IMPORTANT: Log the collection name to verify
      console.log('Collection name:', (SurveyResponsesCollection as any)._collection.name);
      
      // Check what collections are available in development mode
      if (Meteor.isDevelopment) {
        console.log('Checking available collections');
      }
      
      // Use the existing SurveyResponsesCollection
      allResponses = SurveyResponsesCollection.find({}, { 
        sort: { startTime: -1 } 
      }).fetch() as SurveyResponse[];
      console.log('Fetched responses from SurveyResponsesCollection:', allResponses.length);
      
      // If we're in development and have no responses, call our debug method
      if (allResponses.length === 0 && Meteor.isDevelopment) {
        console.log('No responses found, checking collection on server');
        
        // Call our debug method to check the collection on the server
        
      }
      
      // Fetch all surveys
      allSurveys = Surveys.find({}).fetch() as Survey[];
      console.log('Fetched surveys:', allSurveys.length);
      
      // Log survey details for debugging
      if (allSurveys.length > 0) {
        console.log('First survey details:', {
          id: allSurveys[0]._id,
          name: allSurveys[0].name,
          description: allSurveys[0].description
        });
      } else {
        console.warn('No surveys found in the database');
      }
      
      // Try direct database access if in development
      if (Meteor.isDevelopment) {
        // Add debug info for development
        console.log('Development mode: Checking subscription data');
        
        // If we don't have any responses but we're in development, add some mock data
        if (allResponses.length === 0) {
          console.log('No responses found, you can use the "Create Test Data" button to add test responses');
        }
      }
    }
    
    return {
      responses: allResponses,
      surveys: allSurveys,
      loading: isLoading,
    };
  }, []);
  
  // Store responses in state
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  
  // Update responses when fetched
  useEffect(() => {
    if (fetchedResponses) {
      setResponses(fetchedResponses);
    }
  }, [fetchedResponses]);
  
  // Toggle response details
  const toggleResponseDetails = (responseId: string) => {
    if (expandedResponseIds.includes(responseId)) {
      setExpandedResponseIds(expandedResponseIds.filter(id => id !== responseId));
    } else {
      setExpandedResponseIds([...expandedResponseIds, responseId]);
    }
  };
  
  // Format response for display
  const formatResponse = (answer: any): string => {
    if (answer === null || answer === undefined) {
      return 'No response';
    }
    
    if (typeof answer === 'object') {
      return JSON.stringify(answer);
    }
    
    return String(answer);
  };
  
  // Get survey title by ID
  const getSurveyTitle = (surveyId: string): string => {
    if (!surveys || !Array.isArray(surveys)) {
      console.warn('Surveys data is not available or not an array');
      return 'Unknown Survey';
    }
    const survey = surveys.find(s => s._id === surveyId);
    if (!survey) {
      console.warn(`Survey with ID ${surveyId} not found`);
      return 'Unknown Survey';
    }
    return survey.title || 'Untitled Survey';
  };
  
  // Get question text by ID with character limit
  const getQuestionText = (surveyId: string, questionId: string, maxLength = 30): string => {
    if (!surveys || !Array.isArray(surveys)) {
      console.warn('Surveys data is not available or not an array');
      return `Question ${questionId.substring(0, 8)}...`;
    }
    
    const survey = surveys.find(s => s._id === surveyId);
    if (!survey) {
      console.log(`Survey with ID ${surveyId} not found`);
      return `Question ${questionId.substring(0, 8)}...`;
    }
    
    // Log the survey structure for debugging
    console.log(`Looking for question: ${questionId} in survey ${surveyId}`);
    console.log('Survey structure:', JSON.stringify(survey, null, 2).substring(0, 500) + '...');
    
    // Try to find the question in different possible locations
    let question = null;
    
    // Check in direct questions array if it exists
    if (survey.questions && Array.isArray(survey.questions)) {
      question = survey.questions.find((q: any) => q.id === questionId);
    }
    
    // If not found and sectionQuestions exists, check there
    if (!question && survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      // Flatten all questions from all sections
      for (let i = 0; i < survey.sectionQuestions.length; i++) {
        const sectionQuestion = survey.sectionQuestions[i];
        if (sectionQuestion.id === questionId) {
          question = sectionQuestion;
          break;
        }
      }
    }
    
    // If still not found, check in surveyQuestions if it exists
    if (!question && survey.surveyQuestions && Array.isArray(survey.surveyQuestions)) {
      question = survey.surveyQuestions.find((q: any) => q.id === questionId);
    }
    
    if (!question) {
      console.log(`Question with ID ${questionId} not found in survey ${surveyId}`);
      return `Question ${questionId}`;
    }
    
    // Get the question title or text
    let questionTitle = '';
    
    // Try to get the title from different possible properties
    if (question.title) {
      questionTitle = question.title;
    } else if (question.text) {
      questionTitle = question.text;
    } else if (question.content) {
      questionTitle = question.content;
    } else {
      console.log(`Question: ${questionId} has no title or text property`);
      return `Question ${questionId}`;
    }
    
    // Truncate long question titles
    const questionText = questionTitle.trim();
    if (questionText.length <= maxLength) {
      return `${questionText}`;
    } else {
      return `${questionText.substring(0, maxLength)}...`;
    }
  };
  
  // Format CSV data
  const formatCSV = (data: any[]) => {
    return data.map(row => row.map((item: any) => `"${item}"`).join(',')).join('\n');
  };
  
  
  // Generate CSV data for export
  const generateCSV = () => {
    if (!responses.length) return '';
    
    // Headers
    const headers = ['Survey ID', 'Survey Name', 'Start Time', 'End Time', 'Completed', 'Browser', 'Device', 'OS'];
    
    // Data rows
    const rows = responses.map(response => {
      const survey = surveys.find(s => s._id === response.surveyId) || { name: 'Unknown Survey' };
      return [
        response.surveyId,
        survey.name,
        response.startTime ? format(new Date(response.startTime), 'yyyy-MM-dd HH:mm:ss') : '',
        response.endTime ? format(new Date(response.endTime), 'yyyy-MM-dd HH:mm:ss') : '',
        response.completed ? 'Yes' : 'No',
        response.metadata?.browser || '',
        response.metadata?.device || '',
        response.metadata?.os || ''
      ];
    });
    
    // Combine headers and rows
    return formatCSV([headers, ...rows]);
  };
  
  // Export all responses as CSV
  const handleExportCSV = () => {
    if (!responses.length) return;
    
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_responses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    setNotification({
      type: 'success',
      message: `${responses.length} responses exported successfully!`
    });
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Pagination logic
  const indexOfLastResponse = currentPage * responsesPerPage;
  const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
  const currentResponses = responses.slice(indexOfFirstResponse, indexOfLastResponse);
  const totalPages = Math.ceil(responses.length / responsesPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  if (loading) {
    return <LoadingState>Loading survey responses...</LoadingState>;
  }
  
  // Show empty state if no responses
  if (responses.length === 0) {
    return (
      <Container>
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
            {notification.message}
          </div>
        )}
        
        <Header>
          <Title>All Survey Responses</Title>
          
        </Header>
        
        {/* Stats Section */}
        <StatsContainer>
          <StatCardContainer>
            <StatCardHeader>
              <StatCardTitle>Participation</StatCardTitle>
              <StatCardIcon>
                <FiUsers />
              </StatCardIcon>
            </StatCardHeader>
            <StatCard>
              <StatValue>{isLoadingStats ? '...' : completedSurveysCount}</StatValue>
              <StatLabel>Responses</StatLabel>
            </StatCard>
          </StatCardContainer>

          <StatCardContainer>
            <StatCardHeader>
              <StatCardTitle>Completion Rate</StatCardTitle>
              <StatCardIcon>
                <FiPieChart />
              </StatCardIcon>
            </StatCardHeader>
            <StatCard>
              <StatValue>{isLoadingStats ? '...' : `${completionRate}%`}</StatValue>
              <StatLabel>Answered / Total Questions</StatLabel>
            </StatCard>
          </StatCardContainer>

          <StatCardContainer>
            <StatCardHeader>
              <StatCardTitle>Avg. Engagement</StatCardTitle>
              <StatCardIcon>
                <FiBarChart2 />
              </StatCardIcon>
            </StatCardHeader>
            <StatCard>
              <StatValue>{isLoadingStats ? '...' : avgEngagementScore.toFixed(1)}</StatValue>
              <StatLabel>Out of 5.0</StatLabel>
            </StatCard>
          </StatCardContainer>

          <StatCardContainer>
            <StatCardHeader>
              <StatCardTitle>Time to Complete</StatCardTitle>
              <StatCardIcon>
                <FiCalendar />
              </StatCardIcon>
            </StatCardHeader>
            <StatCard>
              <StatValue>{isLoadingStats ? '...' : avgCompletionTime.toFixed(1)}</StatValue>
              <StatLabel>Minutes (Average)</StatLabel>
            </StatCard>
          </StatCardContainer>

          <StatCardContainer>
            <StatCardHeader>
              <StatCardTitle>Response Rate</StatCardTitle>
              <StatCardIcon>
                <FiTrendingUp />
              </StatCardIcon>
            </StatCardHeader>
            <StatCard>
              <StatValue>{isLoadingStats ? '...' : `${responseRate}%`}</StatValue>
              <StatLabel>Started / Completed</StatLabel>
            </StatCard>
          </StatCardContainer>
        </StatsContainer>
        
        <EmptyState>
          <p>No survey responses found.</p>
        </EmptyState>
      </Container>
    );
  }
  
  // Render responses table
  return (
    <Container>
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
          {notification.message}
        </div>
      )}
      
      <Header>
        <Title>All Survey Responses</Title>
        
      </Header>
      
      {/* Stats Section */}
      <StatsContainer>
        <StatCardContainer>
          <StatCardHeader>
            <StatCardTitle>Participation</StatCardTitle>
            <StatCardIcon>
              <FiUsers />
            </StatCardIcon>
          </StatCardHeader>
          <StatCard>
            <StatValue>{isLoadingStats ? '...' : completedSurveysCount}</StatValue>
            <StatLabel>Responses</StatLabel>
          </StatCard>
        </StatCardContainer>

        <StatCardContainer>
          <StatCardHeader>
            <StatCardTitle>Completion Rate</StatCardTitle>
            <StatCardIcon>
              <FiPieChart />
            </StatCardIcon>
          </StatCardHeader>
          <StatCard>
            <StatValue>{isLoadingStats ? '...' : `${completionRate}%`}</StatValue>
            <StatLabel>Answered / Total Questions</StatLabel>
          </StatCard>
        </StatCardContainer>

        <StatCardContainer>
          <StatCardHeader>
            <StatCardTitle>Avg. Engagement</StatCardTitle>
            <StatCardIcon>
              <FiBarChart2 />
            </StatCardIcon>
          </StatCardHeader>
          <StatCard>
            <StatValue>{isLoadingStats ? '...' : avgEngagementScore.toFixed(1)}</StatValue>
            <StatLabel>Out of 5.0</StatLabel>
          </StatCard>
        </StatCardContainer>

        <StatCardContainer>
          <StatCardHeader>
            <StatCardTitle>Time to Complete</StatCardTitle>
            <StatCardIcon>
              <FiCalendar />
            </StatCardIcon>
          </StatCardHeader>
          <StatCard>
            <StatValue>{isLoadingStats ? '...' : avgCompletionTime.toFixed(1)}</StatValue>
            <StatLabel>Minutes (Average)</StatLabel>
          </StatCard>
        </StatCardContainer>

        <StatCardContainer>
          <StatCardHeader>
            <StatCardTitle>Response Rate</StatCardTitle>
            <StatCardIcon>
              <FiTrendingUp />
            </StatCardIcon>
          </StatCardHeader>
          <StatCard>
            <StatValue>{isLoadingStats ? '...' : `${responseRate}%`}</StatValue>
            <StatLabel>Started / Completed</StatLabel>
          </StatCard>
        </StatCardContainer>
      </StatsContainer>
      
      <ResponsesTable>
        <TableHeader>
          <tr>
            <TableHeaderCell>Survey</TableHeaderCell>
            <TableHeaderCell>Submitted</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Respondent</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {currentResponses.map((response: SurveyResponse) => {
            const isExpanded = expandedResponseIds.includes(response._id || '');
            const surveyTitle = getSurveyTitle(response.surveyId);
            
            return (
              <React.Fragment key={response._id}>
                <TableRow>
                  <TableCell>
                    <SurveyLink href={`/admin/surveys/builder/${response.surveyId}`} target="_blank">
                      {surveyTitle || `Survey ID: ${response.surveyId.substring(0, 8)}...`}
                      <FiExternalLink size={14} />
                    </SurveyLink>
                  </TableCell>
                  <TableCell>
                    {response.startTime ? format(new Date(response.startTime), 'MMM d, yyyy h:mm a') : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge complete={!!response.completed}>
                      {response.completed ? 'Complete' : 'Incomplete'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {response.userId || 'Anonymous'}
                  </TableCell>
                  <TableCell>
                    <ExpandButton onClick={() => toggleResponseDetails(response._id || '')}>
                      {isExpanded ? (
                        <>
                          <FiChevronUp style={{ marginRight: '4px' }} />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <FiChevronDown style={{ marginRight: '4px' }} />
                          View Details
                        </>
                      )}
                    </ExpandButton>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <DetailRow>
                    <DetailCell colSpan={5}>
                      <DetailContent>
                        {/* Metadata Section */}
                        <DetailSection>
                          <DetailTitle>Metadata</DetailTitle>
                          <DetailList>
                            <DetailItem>
                              <DetailItemLabel>Start Time</DetailItemLabel>
                              <DetailItemValue>
                                {response.startTime 
                                  ? format(new Date(response.startTime), 'MMM d, yyyy h:mm:ss a')
                                  : 'Unknown'}
                              </DetailItemValue>
                            </DetailItem>
                            <DetailItem>
                              <DetailItemLabel>End Time</DetailItemLabel>
                              <DetailItemValue>
                                {response.endTime 
                                  ? format(new Date(response.endTime), 'MMM d, yyyy h:mm:ss a')
                                  : 'Not completed'}
                              </DetailItemValue>
                            </DetailItem>
                          </DetailList>
                        </DetailSection>
                        
                        {/* Responses Section */}
                        <DetailSection>
                          <DetailTitle>Responses</DetailTitle>
                          <DetailList>
                            {response.responses.map((item, index) => (
                              <DetailItem key={index}>
                                <DetailItemLabel>
                                  {getQuestionText(response.surveyId, item.questionId)}
                                </DetailItemLabel>
                                <DetailItemValue>
                                  {formatResponse(item.answer)}
                                </DetailItemValue>
                              </DetailItem>
                            ))}
                          </DetailList>
                        </DetailSection>
                      </DetailContent>
                    </DetailCell>
                  </DetailRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </ResponsesTable>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
          >
            First
          </PageButton>
          
          <PageButton 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Prev
          </PageButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <PageButton
                key={pageNum}
                onClick={() => paginate(pageNum)}
                active={currentPage === pageNum}
              >
                {pageNum}
              </PageButton>
            );
          })}
          
          <PageButton 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
          
          <PageButton 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
          >
            Last
          </PageButton>
        </Pagination>
      )}
    </Container>
  );
};

export default AllSurveyResponses;
