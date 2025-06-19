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

import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';
import { Surveys } from '../../features/surveys/api/surveys';
import DatabaseStats from './DatabaseStats';
import CheckDatabase from './CheckDatabase';
import DbChecker from './DbChecker';

// Import components from the feature-based structure
import {
  AnalyticsFilterBar,
  KPIGrid,
  SiteParticipationChart,
  ThemeHeatmap,
  EngagementTrendLine,
  FlaggedIssuesList,
  CommentClusterView
} from '/imports/features/analytics/components/admin';

// Import the KPIData interface
import type { KPIData } from '/imports/features/analytics/components/admin/KPIGrid';

// Types
interface FilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HalfWidthCard = styled.div`
  grid-column: span 6;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const FullWidthCard = styled.div`
  grid-column: span 12;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const AnonymityWarning = styled.div`
  background: #fff5f5;
  color: #e53e3e;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    flex-shrink: 0;
    font-size: 20px;
  }
`;

const QuickActionsContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.primary ? '#552a47' : '#ffffff'};
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.2s, background-color 0.2s;
  
  &:hover {
    transform: scale(1.05);
    background: ${props => props.primary ? '#693658' : '#f5f5f5'};
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TabContainer = styled.div`
  margin-top: 24px;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: ${props => props.active ? '2px solid #552a47' : '2px solid transparent'};
  color: ${props => props.active ? '#552a47' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #552a47;
  }
`;

const AdminAnalytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'charts' | 'comments'>('charts');
  const [directDbCount, setDirectDbCount] = useState<number | null>(null);
  
  // Direct database check for completed surveys
  useEffect(() => {
    Meteor.call('getCompletedSurveysCount', (error: any, result: number) => {
      if (error) {
        console.error('Error getting completed surveys count:', error);
      } else {
        console.log('Direct DB query result - completed surveys count:', result);
        setDirectDbCount(result);
      }
    });
  }, []);
  
  // Parse URL query params
  const queryParams = new URLSearchParams(location.search);
  
  // Initialize filters from URL or with defaults
  const [filters, setFilters] = useState<FilterState>({
    sites: queryParams.get('site')?.split(',') || ['all'],
    departments: queryParams.get('dept')?.split(',') || ['all'],
    roles: queryParams.get('role')?.split(',') || ['all'],
    surveys: queryParams.get('survey')?.split(',') || ['latest']
  });
  
  // Fetch data
  const { responses, surveys, isLoading, responseCount, completedSurveysCount, avgCompletionTime, avgEngagementScore } = useTracker(() => {
    const responsesSubscription = Meteor.subscribe('responses.all');
    const surveysSubscription = Meteor.subscribe('surveys.all');
    const loading = !responsesSubscription.ready() || !surveysSubscription.ready();
    
    // Apply filters
    let responsesQuery = {};
    
    if (filters.sites[0] !== 'all') {
      responsesQuery = { ...responsesQuery, site: { $in: filters.sites } };
    }
    
    // Add more filter criteria here when available
    
    const allResponses = SurveyResponses.find(responsesQuery).fetch();
    const allSurveys = Surveys.find().fetch();
    
    // Debug: Log all responses to see what's in the database
    console.log('All survey responses:', allResponses);
    console.log('Total responses count:', allResponses.length);
    
    // Count completed survey responses
    const completedResponses = SurveyResponses.find({ ...responsesQuery, completed: true }).count();
    console.log('Completed survey responses count:', completedResponses);
    
    // Calculate average completion time in minutes
    let avgCompletionTimeValue = 0;
    const responsesWithCompletionTime = allResponses.filter(r => r.completionTime && r.completed);
    if (responsesWithCompletionTime.length > 0) {
      const totalCompletionTimeSeconds = responsesWithCompletionTime.reduce(
        (sum, r) => sum + (r.completionTime || 0), 0
      );
      avgCompletionTimeValue = Math.round((totalCompletionTimeSeconds / responsesWithCompletionTime.length) / 60 * 10) / 10; // Convert to minutes and round to 1 decimal
    }
    
    // Calculate average engagement score
    let avgEngagementScoreValue = 0;
    // Calculate engagement score based on responses
    // This is a simplified example - you may need to adjust based on your actual data structure
    if (allResponses.length > 0) {
      // Example: calculate average of all numeric answers as a proxy for engagement
      let totalScore = 0;
      let scoreCount = 0;
      
      allResponses.forEach(response => {
        if (response.responses && Array.isArray(response.responses)) {
          response.responses.forEach(answer => {
            // Check if the answer is a number between 1-5 (assuming Likert scale)
            if (typeof answer.answer === 'number' && answer.answer >= 1 && answer.answer <= 5) {
              totalScore += answer.answer;
              scoreCount++;
            }
          });
        }
      });
      
      if (scoreCount > 0) {
        avgEngagementScoreValue = Math.round((totalScore / scoreCount) * 10) / 10; // Round to 1 decimal
      }
    }
    
    return {
      responses: allResponses,
      surveys: allSurveys,
      isLoading: loading,
      responseCount: allResponses.length,
      completedSurveysCount: completedResponses,
      avgCompletionTime: avgCompletionTimeValue,
      avgEngagementScore: avgEngagementScoreValue
    };
  }, [filters]);
  
  // Determine if we should hide data for anonymity (less than 5 responses)
  const showAnonymityWarning = responseCount < 5;
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.sites[0] !== 'all') {
      params.set('site', filters.sites.join(','));
    }
    
    if (filters.departments[0] !== 'all') {
      params.set('dept', filters.departments.join(','));
    }
    
    if (filters.roles[0] !== 'all') {
      params.set('role', filters.roles.join(','));
    }
    
    if (filters.surveys[0] !== 'latest') {
      params.set('survey', filters.surveys.join(','));
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [filters, navigate, location.pathname]);
  
  // Filter change handler
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    console.log('Exporting CSV...');
    // Implement export functionality
  };
  
  // Export to PDF
  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    // Implement export functionality
  };
  
  // Share link
  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };
  
  // Sample data for demonstration
  const siteData = [
    { name: 'Rainy River', completed: 70, pending: 20 },
    { name: 'New Afton', completed: 55, pending: 15 },
    { name: 'Corporate', completed: 40, pending: 10 }
  ];
  
  const themeData = [
    { theme: 'Engagement', scores: [4.2, 3.9, 4.1] },
    { theme: 'Leadership', scores: [3.7, 2.9, 3.1] },
    { theme: 'Team Dynamics', scores: [4.5, 4.3, 4.2] },
    { theme: 'Communication', scores: [3.5, 4.1, 3.7] },
    { theme: 'Recognition', scores: [3.1, 3.0, 3.4] },
    { theme: 'Work-Life Balance', scores: [2.8, 2.7, 3.2] }
  ];
  
  const trendData = [
    { name: 'May 2024', score: 3.6 },
    { name: 'Sep 2024', score: 4.0 },
    { name: 'Jan 2025', score: 4.2 }
  ];
  
  // Sample data for FlaggedIssuesList component
  const flaggedIssues = [
    { id: '1', severity: 'high' as const, message: 'Communication score dropped from 4.1 to 3.5', date: '2025-05-15' },
    { id: '2', severity: 'high' as const, message: 'Leadership Trust fell below threshold: 2.9', date: '2025-05-16' },
    { id: '3', severity: 'medium' as const, message: 'Team Collaboration declined by 12% since last survey', date: '2025-05-17' },
    { id: '4', severity: 'medium' as const, message: 'Work-Life Balance flagged in multiple sites', date: '2025-05-18' },
    { id: '5', severity: 'low' as const, message: 'Manager Feedback score critically low at 2.5', date: '2025-05-19' }
  ];
  
  // Sample data for CommentClusterView component
  const commentClusters = [
    { 
      theme: 'Communication', 
      keywords: ['meetings', 'clarity', 'transparency'], 
      comments: [
        'Too many meetings without clear outcomes',
        'Need more transparency from leadership',
        'Communication between teams could be improved'
      ]
    },
    { 
      theme: 'Work-Life Balance', 
      keywords: ['overtime', 'workload', 'flexibility'], 
      comments: [
        'Workload is often unmanageable',
        'More flexibility for remote work would help',
        'Difficult to maintain work-life balance during busy periods'
      ]
    }
  ];
  
  // KPI data
  const kpiData: KPIData = {
    participationRate: {
      value: responseCount > 0 ? Math.round((completedSurveysCount / responseCount) * 100) : 0,
      icon: FiUsers
    },
    engagementScore: {
      value: avgEngagementScore || '0.0',
      icon: FiStar
    },
    responsesCount: {
      value: responseCount,
      icon: FiMessageSquare
    },
    completedSurveys: {
      // Use the direct database count if available, otherwise fall back to the tracker count
      value: directDbCount !== null ? directDbCount : completedSurveysCount,
      icon: FiFileText
    },
    timeToComplete: {
      value: avgCompletionTime || 0,
      icon: FiCalendar
    }
  };
  
  return (
    <AdminLayout>
      <Container>
        {/* 1. Filter Bar */}
        <AnalyticsFilterBar 
          sites={['All Sites', 'Rainy River', 'New Afton', 'Corporate']}
          departments={['All Departments', 'Engineering', 'Operations', 'HR', 'Finance']}
          roles={['All Roles', 'Manager', 'Supervisor', 'Individual Contributor']}
          surveys={['Latest', 'Jan 2025', 'Sep 2024', 'May 2024']}
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
        />
        
        {/* Anonymity Warning */}
        {showAnonymityWarning && (
          <AnonymityWarning>
            <FiAlertTriangle />
            <div>
              <strong>Insufficient responses to display data.</strong> Some analytics are hidden to protect employee anonymity (requires 5+ responses).
            </div>
          </AnonymityWarning>
        )}
        
        {/* Debug Info */}
        {directDbCount !== null && (
          <div style={{ background: '#f0f8ff', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Debug Information</h4>
            <p><strong>Direct DB Query - Completed Surveys Count:</strong> {directDbCount}</p>
            <p><strong>Tracker Method - Completed Surveys Count:</strong> {completedSurveysCount}</p>
            <p><strong>Total Responses Count:</strong> {responseCount}</p>
          </div>
        )}
        
        {/* 2. KPI Cards */}
        <KPIGrid 
          data={kpiData} 
          isLoading={isLoading}
          isBlurred={showAnonymityWarning}
        />
        
        {/* Tabs for Charts/Comments */}
        <TabContainer>
          <TabHeader>
            <Tab active={activeTab === 'charts'} onClick={() => setActiveTab('charts')}>
              Charts & Metrics
            </Tab>
            <Tab active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>
              Open-Text Insights
            </Tab>
          </TabHeader>
          
          {activeTab === 'charts' ? (
            <ChartGrid>
              {/* 3A. Participation by Site */}
              <HalfWidthCard>
                <SiteParticipationChart 
                  data={siteData} 
                  isLoading={isLoading}
                  isBlurred={showAnonymityWarning}
                />
              </HalfWidthCard>
              
              {/* 3B. Theme Heat Map */}
              <HalfWidthCard>
                <ThemeHeatmap 
                  data={themeData} 
                  surveyLabels={['Jan 2025', 'Sep 2024', 'May 2024']}
                  isLoading={isLoading}
                  isBlurred={showAnonymityWarning}
                />
              </HalfWidthCard>
              
              {/* 3C. Engagement Trend Line */}
              <HalfWidthCard>
                <EngagementTrendLine 
                  data={trendData} 
                  isLoading={isLoading}
                  isBlurred={showAnonymityWarning}
                />
              </HalfWidthCard>
              
              {/* 4. Flagged Issues */}
              <HalfWidthCard>
                <FlaggedIssuesList 
                  issues={flaggedIssues} 
                  isLoading={isLoading}
                  isBlurred={showAnonymityWarning}
                />
              </HalfWidthCard>
            </ChartGrid>
          ) : (
            <FullWidthCard>
              <CommentClusterView 
                clusters={commentClusters} 
                isLoading={isLoading}
                isBlurred={showAnonymityWarning}
              />
            </FullWidthCard>
          )}
        </TabContainer>
        
        {/* Database Statistics Component */}
        <DbChecker />
        
        {/* 6. Quick Actions */}
        <QuickActionsContainer>
          <ActionButton
            title="Export CSV"
            onClick={handleExportCSV}
            disabled={showAnonymityWarning}
          >
            <FiDownload />
          </ActionButton>
          <ActionButton
            title="Export PDF"
            onClick={handleExportPDF}
            disabled={showAnonymityWarning}
          >
            <FiFileText />
          </ActionButton>
          <ActionButton
            primary
            title="Share Link"
            onClick={handleShareLink}
          >
            <FiShare2 />
          </ActionButton>
        </QuickActionsContainer>
      </Container>
    </AdminLayout>
  );
};

export default AdminAnalytics;
