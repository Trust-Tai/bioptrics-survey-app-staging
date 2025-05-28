import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  FiUsers, 
  FiStar, 
  FiMessageSquare, 
  FiCalendar, 
  FiDownload, 
  FiShare2, 
  FiFileText,
  FiAlertTriangle
} from 'react-icons/fi';

// Import from new feature-based structure
import { AdminLayout } from '../../layouts';
import { Surveys } from '../../features/surveys/api';
import { SurveyResponses } from '../../features/surveys/api';

// Import analytics components directly until index is properly set up
import AnalyticsFilterBar from '../../features/analytics/components/admin/AnalyticsFilterBar';
import KPIGrid from '../../features/analytics/components/admin/KPIGrid';
import ResponseRateChart from '../../features/analytics/components/admin/ResponseRateChart';
import SentimentChart from '../../features/analytics/components/admin/SentimentChart';
import TopicDistributionChart from '../../features/analytics/components/admin/TopicDistributionChart';
import CommentsList from '../../features/analytics/components/admin/CommentsList';

// Types
interface FilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

// Define the interfaces to match the existing components
interface SurveyOption {
  id: string;
  name: string;
}

// Mock data for filters
const mockSites = ['Site A', 'Site B', 'Site C'];
const mockDepartments = ['Engineering', 'HR', 'Marketing', 'Operations'];
const mockRoles = ['Manager', 'Individual Contributor', 'Executive'];

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

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e9e9e9;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ChartActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const CommentsSection = styled.div`
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ddd;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    max-width: 400px;
  }
`;

const AdminAnalytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    sites: [],
    departments: [],
    roles: [],
    surveys: []
  });
  
  const [timeRange, setTimeRange] = useState('30d');
  const [hasData, setHasData] = useState(true);
  
  // Get surveys data
  const { surveys, loading, responseData, kpiData } = useTracker(() => {
    const surveysSub = Meteor.subscribe('surveys.all');
    const responsesSub = Meteor.subscribe('surveyResponses.analytics');
    
    if (!surveysSub.ready() || !responsesSub.ready()) {
      return { surveys: [], loading: true, responseData: null };
    }
    
    const surveysData = Surveys.find({}).fetch();
    const responsesData = SurveyResponses.find({}).fetch();
    
    // Process response data for analytics
    // Create analytics data
    const analyticsData = {
      totalResponses: responsesData.length,
      completionRate: calculateCompletionRate(responsesData),
      averageSentiment: calculateAverageSentiment(responsesData),
      responsesByDepartment: groupResponsesByDepartment(responsesData),
      responsesByDate: groupResponsesByDate(responsesData, timeRange),
      topComments: getTopComments(responsesData),
      topTopics: {}
    };
    
    // Create KPI data in the format expected by KPIGrid
    const kpiData = {
      participationRate: {
        value: analyticsData.completionRate,
        icon: FiUsers
      },
      engagementScore: {
        value: analyticsData.averageSentiment.toFixed(1),
        icon: FiStar
      },
      responsesCount: {
        value: analyticsData.totalResponses,
        icon: FiMessageSquare
      },
      daysRemaining: {
        value: 14, // Example value
        icon: FiCalendar
      }
    };
    
    return { 
      surveys: surveysData, 
      loading: false,
      responseData: analyticsData,
      kpiData: kpiData
    };
  }, [timeRange, selectedFilters]);
  
  // Check if we have data after loading
  useEffect(() => {
    if (!loading) {
      setHasData(responseData ? responseData.totalResponses > 0 : false);
    }
  }, [loading, responseData]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setSelectedFilters(newFilters);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  // Export data as CSV
  const handleExportData = () => {
    Meteor.call('analytics.exportCSV', selectedFilters, (error: any, result: string) => {
      if (error) {
        console.error('Error exporting data:', error);
      } else {
        // Create a download link
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(result));
        element.setAttribute('download', `survey-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    });
  };
  
  // Share report
  const handleShareReport = () => {
    // Implementation for sharing report
    console.log('Share report with filters:', selectedFilters);
  };
  
  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Survey Analytics Dashboard</Title>
          <ActionButtons>
            <Button onClick={handleExportData}>
              <FiDownload /> Export Data
            </Button>
            <Button onClick={handleShareReport}>
              <FiShare2 /> Share Report
            </Button>
          </ActionButtons>
        </Header>
        
        <AnalyticsFilterBar 
          sites={mockSites}
          departments={mockDepartments}
          roles={mockRoles}
          surveys={surveys.map(s => ({ id: s._id || '', name: s.title || '' })) as any}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
        
        {loading ? (
          <div>Loading analytics data...</div>
        ) : !hasData ? (
          <NoDataMessage>
            <FiAlertTriangle />
            <h3>No data available</h3>
            <p>There are no survey responses matching your current filters. Try adjusting your filters or time range.</p>
          </NoDataMessage>
        ) : (
          <>
            <KPIGrid data={kpiData!} isLoading={false} isBlurred={false} />
            
            <ChartsContainer>
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Response Rate Over Time</ChartTitle>
                  <ChartActions>
                    <IconButton><FiDownload /></IconButton>
                  </ChartActions>
                </ChartHeader>
                <ResponseRateChart data={responseData!.responsesByDate} />
              </ChartCard>
              
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Sentiment Analysis</ChartTitle>
                  <ChartActions>
                    <IconButton><FiDownload /></IconButton>
                  </ChartActions>
                </ChartHeader>
                <SentimentChart data={responseData!} />
              </ChartCard>
              
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Responses by Department</ChartTitle>
                  <ChartActions>
                    <IconButton><FiDownload /></IconButton>
                  </ChartActions>
                </ChartHeader>
                <TopicDistributionChart data={responseData!.responsesByDepartment} />
              </ChartCard>
              
              <ChartCard>
                <ChartHeader>
                  <ChartTitle>Top Topics</ChartTitle>
                  <ChartActions>
                    <IconButton><FiDownload /></IconButton>
                  </ChartActions>
                </ChartHeader>
                <TopicDistributionChart data={responseData!.topTopics} />
              </ChartCard>
            </ChartsContainer>
            
            <CommentsSection>
              <ChartHeader>
                <ChartTitle>Notable Comments</ChartTitle>
                <ChartActions>
                  <IconButton><FiFileText /></IconButton>
                </ChartActions>
              </ChartHeader>
              <CommentsList comments={responseData!.topComments} />
            </CommentsSection>
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

// Helper functions for data processing
function calculateCompletionRate(responses: any[]): number {
  if (responses.length === 0) return 0;
  const completed = responses.filter(r => r.completed).length;
  return (completed / responses.length) * 100;
}

function calculateAverageSentiment(responses: any[]): number {
  if (responses.length === 0) return 0;
  // This would use a sentiment analysis algorithm in a real implementation
  return 3.7; // Placeholder value
}

function groupResponsesByDepartment(responses: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  responses.forEach(response => {
    const dept = response.demographics?.department || 'Unknown';
    result[dept] = (result[dept] || 0) + 1;
  });
  return result;
}

function groupResponsesByDate(responses: any[], timeRange: string): any[] {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  // Group responses by date
  const dateMap: Record<string, number> = {};
  
  // Initialize all dates in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dateMap[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count responses by date
  responses.forEach(response => {
    const date = new Date(response.createdAt);
    if (date >= startDate && date <= endDate) {
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    }
  });
  
  // Convert to array format for charts
  return Object.entries(dateMap).map(([date, count]) => ({
    date,
    count
  }));
}

function getTopComments(responses: any[]): any[] {
  // In a real implementation, this would use NLP to find insightful comments
  return responses
    .filter(r => r.feedback?.comments)
    .map(r => ({
      id: r._id,
      text: r.feedback.comments,
      department: r.demographics?.department || 'Unknown',
      sentiment: r.feedback?.rating || 3,
      date: r.createdAt
    }))
    .slice(0, 5);
}

export default AdminAnalytics;
