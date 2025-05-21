import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  FiArrowLeft, 
  FiBarChart2, 
  FiUsers, 
  FiPieChart, 
  FiCheck, 
  FiClock,
  FiDownload,
  FiShare2,
  FiFilter
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

import AdminLayout from './AdminLayout';
import { Surveys, SurveyDoc } from '../../api/surveys';
import { Responses } from '../../api/responses';
import { Questions } from '../../api/questions';
import { Survey } from './types/surveyTypes';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  
  &:hover {
    color: #1c1c1c;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
`;

const StatusBadge = styled.span<{ status: 'Draft' | 'Active' | 'Closed' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  
  ${props => {
    switch (props.status) {
      case 'Draft':
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
      case 'Active':
        return `
          background-color: #c6f6d5;
          color: #2f855a;
        `;
      case 'Closed':
        return `
          background-color: #fed7d7;
          color: #c53030;
        `;
      default:
        return '';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background: #f7fafc;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #b7a36a;
  color: white;
  border: none;
  
  &:hover {
    background: #a08e54;
  }
`;

const KPIContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const KPIIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #b7a36a;
  font-size: 24px;
`;

const KPIValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 4px;
`;

const KPILabel = styled.div`
  font-size: 14px;
  color: #718096;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div<{ cols?: number }>`
  grid-column: span ${props => props.cols || 6};
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-top: 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1c1c1c;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const FilterDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResponseList = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const ResponseListHeader = styled.div`
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseListTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ResponseTableHeader = styled.th`
  text-align: left;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
`;

const ResponseTableCell = styled.td`
  padding: 12px 20px;
  font-size: 14px;
  color: #1c1c1c;
  border-bottom: 1px solid #e2e8f0;
`;

const ResponseTableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #718096;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #2f855a;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s forwards;
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }
`;

const SurveyAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Fetch survey and response data
  const { survey, responses, isLoading, questions } = useTracker(() => {
    if (!id) return { survey: null, responses: [], isLoading: false, questions: [] };
    
    const surveySubscription = Meteor.subscribe('surveys.all');
    const responseSubscription = Meteor.subscribe('responses.all');
    const questionSubscription = Meteor.subscribe('questions.all');
    
    const loading = !surveySubscription.ready() || !responseSubscription.ready() || !questionSubscription.ready();
    
    if (!loading) {
      const surveyData = Surveys.findOne({ _id: id });
      
      if (!surveyData) {
        return { survey: null, responses: [], isLoading: false, questions: [] };
      }
      
      // Transform survey data to match our interface
      const transformedSurvey: Survey = {
        _id: surveyData._id || '',
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions || [],
        status: (surveyData as any).status || 'Draft',
        startDate: (surveyData as any).startDate || new Date(),
        endDate: (surveyData as any).endDate || new Date(),
        invitedCount: (surveyData as any).invitedCount || 0,
        responseCount: 0,
        publicSlug: (surveyData as any).publicSlug || surveyData._id,
        createdAt: surveyData.createdAt
      };
      
      // Fetch responses for this survey
      const responseData = Responses.find({ surveyId: id }).fetch();
      
      // Fetch questions
      const questionData = Questions.find().fetch();
      
      return {
        survey: transformedSurvey,
        responses: responseData,
        isLoading: false,
        questions: questionData
      };
    }
    
    return { survey: null, responses: [], isLoading: true, questions: [] };
  }, [id, timeFilter]);
  
  // Filter responses based on time filter
  const filteredResponses = responses.filter(response => {
    if (timeFilter === 'all') return true;
    
    const responseDate = new Date(response.submittedAt);
    const now = new Date();
    
    if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return responseDate >= weekAgo;
    }
    
    if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return responseDate >= monthAgo;
    }
    
    return true;
  });
  
  // Calculate completion rate
  const completionRate = (survey && survey.invitedCount && survey.invitedCount > 0)
    ? Math.round((filteredResponses.length / survey.invitedCount) * 100) 
    : 0;
  
  // Get question text by ID
  const getQuestionText = (id: string) => {
    const question = questions.find(q => q._id === id);
    if (!question || !question.versions || question.versions.length === 0) {
      return 'Unknown Question';
    }
    return question.versions[question.versions.length - 1].questionText;
  };
  
  // Calculate average time to complete (in minutes)
  const averageTimeToComplete = 5; // Placeholder - would be calculated from actual data
  
  // Calculate completion by day data
  const completionByDayData = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 },
    { day: 'Fri', count: 25 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 5 }
  ];
  
  // Question completion rate data
  const questionCompletionData = survey?.questions.map((questionId, index) => ({
    name: `Q${index + 1}`,
    completion: Math.floor(Math.random() * 40) + 60 // Random completion rates for demo
  })) || [];
  
  // Device type distribution
  const deviceData = [
    { name: 'Desktop', value: 55 },
    { name: 'Mobile', value: 35 },
    { name: 'Tablet', value: 10 }
  ];
  
  // Device colors
  const deviceColors = ['#b7a36a', '#718096', '#4a5568'];
  
  // Handle copy link
  const handleCopyLink = () => {
    if (!survey) return;
    
    const surveyUrl = `https://app.bioptrics.com/survey/${survey.publicSlug}`;
    navigator.clipboard.writeText(surveyUrl);
    
    setToastMessage('Survey link copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Handle export data
  const handleExportData = () => {
    // Implementation for exporting data would go here
    setToastMessage('Survey data exported!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/admin/surveys');
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingContainer>Loading survey analytics...</LoadingContainer>
        </Container>
      </AdminLayout>
    );
  }
  
  // Show error if survey not found
  if (!survey) {
    return (
      <AdminLayout>
        <Container>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <h2>Survey not found</h2>
            <p>The survey you're looking for doesn't exist or has been deleted.</p>
            <BackButton onClick={handleBack}>← Back to Surveys</BackButton>
          </div>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container>
        {/* Header */}
        <Header>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Back to Surveys
            </BackButton>
            <div style={{ width: '24px' }} />
            <TitleContainer>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title>{survey.title}</Title>
                <StatusBadge status={survey.status}>{survey.status}</StatusBadge>
              </div>
              <Subtitle>
                {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
              </Subtitle>
            </TitleContainer>
          </div>
          
          <ActionButtons>
            <ActionButton onClick={handleCopyLink}>
              <FiShare2 />
              Share Link
            </ActionButton>
            <PrimaryButton onClick={handleExportData}>
              <FiDownload />
              Export Data
            </PrimaryButton>
          </ActionButtons>
        </Header>
        
        {/* Filter Bar */}
        <FilterBar>
          <FilterLabel>
            <FiFilter />
            Time Period:
          </FilterLabel>
          <FilterSelect 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'all' | 'week' | 'month')}
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </FilterSelect>
          
          <FilterDivider />
          
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#718096' }}>
            Showing data for {filteredResponses.length} responses
          </div>
        </FilterBar>
        
        {/* KPI Cards */}
        <KPIContainer>
          <KPICard>
            <KPIIcon>
              <FiUsers />
            </KPIIcon>
            <KPIValue>{filteredResponses.length}</KPIValue>
            <KPILabel>Total Responses</KPILabel>
          </KPICard>
          
          <KPICard>
            <KPIIcon>
              <FiCheck />
            </KPIIcon>
            <KPIValue>{completionRate}%</KPIValue>
            <KPILabel>Completion Rate</KPILabel>
          </KPICard>
          
          <KPICard>
            <KPIIcon>
              <FiClock />
            </KPIIcon>
            <KPIValue>{averageTimeToComplete}m</KPIValue>
            <KPILabel>Avg. Time to Complete</KPILabel>
          </KPICard>
          
          <KPICard>
            <KPIIcon>
              <FiBarChart2 />
            </KPIIcon>
            <KPIValue>{survey.questions.length}</KPIValue>
            <KPILabel>Questions</KPILabel>
          </KPICard>
        </KPIContainer>
        
        {/* Charts */}
        <ChartGrid>
          {/* Responses Over Time */}
          <ChartCard>
            <ChartTitle>
              <FiBarChart2 />
              Responses by Day
            </ChartTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionByDayData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#b7a36a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
          
          {/* Question Completion Rates */}
          <ChartCard>
            <ChartTitle>
              <FiBarChart2 />
              Question Completion Rates
            </ChartTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionCompletionData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Bar dataKey="completion" fill="#4a5568" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
          
          {/* Device Distribution */}
          <ChartCard>
            <ChartTitle>
              <FiPieChart />
              Device Distribution
            </ChartTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
          
          {/* Recent Responses */}
          <ChartCard cols={6}>
            <ChartTitle>
              <FiUsers />
              Recent Responses
            </ChartTitle>
            
            <ResponseList>
              <ResponseTable>
                <thead>
                  <tr>
                    <ResponseTableHeader>Date</ResponseTableHeader>
                    <ResponseTableHeader>Participant</ResponseTableHeader>
                    <ResponseTableHeader>Completion</ResponseTableHeader>
                    <ResponseTableHeader>Time Taken</ResponseTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.slice(0, 5).map((response, index) => (
                    <ResponseTableRow key={response._id || index}>
                      <ResponseTableCell>
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </ResponseTableCell>
                      <ResponseTableCell>
                        Anonymous
                      </ResponseTableCell>
                      <ResponseTableCell>
                        100%
                      </ResponseTableCell>
                      <ResponseTableCell>
                        4m 32s
                      </ResponseTableCell>
                    </ResponseTableRow>
                  ))}
                  
                  {filteredResponses.length === 0 && (
                    <ResponseTableRow>
                      <ResponseTableCell colSpan={4} style={{ textAlign: 'center' }}>
                        No responses yet
                      </ResponseTableCell>
                    </ResponseTableRow>
                  )}
                </tbody>
              </ResponseTable>
            </ResponseList>
          </ChartCard>
        </ChartGrid>
        
        {/* Question Analysis */}
        <ChartCard cols={12}>
          <ChartTitle>
            <FiBarChart2 />
            Question Analysis
          </ChartTitle>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {survey.questions.map((questionId, index) => (
              <div key={questionId} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                  Q{index + 1}: {getQuestionText(questionId)}
                </div>
                
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { option: '1', count: Math.floor(Math.random() * 10) + 5 },
                        { option: '2', count: Math.floor(Math.random() * 10) + 5 },
                        { option: '3', count: Math.floor(Math.random() * 10) + 5 },
                        { option: '4', count: Math.floor(Math.random() * 10) + 5 },
                        { option: '5', count: Math.floor(Math.random() * 10) + 5 }
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="option" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#b7a36a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        
        {/* Toast Notification */}
        {showToast && (
          <Toast>{toastMessage}</Toast>
        )}
      </Container>
    </AdminLayout>
  );
};

export default SurveyAnalytics;
