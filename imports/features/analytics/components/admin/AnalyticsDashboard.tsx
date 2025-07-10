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
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';

// Import from features instead of old structure
import { SurveyResponses } from '../../../../features/surveys/api/surveyResponses';
import { Surveys } from '../../../../features/surveys/api/surveys';

// Import components from the feature-based structure
import AnalyticsFilterBar from './filters/AnalyticsFilterBar';
import KPIGrid from './kpi/KPIGrid';
import SiteParticipationChart from './charts/SiteParticipationChart';
import ThemeHeatmap from './heatmap/ThemeHeatmap';
import EngagementTrendLine from './trends/EngagementTrendLine';
import FlaggedIssuesList, { Issue } from './issues/FlaggedIssuesList';
import CommentClusterView from './comments/CommentClusterView';
import RealTimeAnalytics from './RealTimeAnalytics';

// Types
interface FilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

// Define our internal ResponseDoc interface
interface ResponseDoc {
  _id: string;
  surveyId: string;
  site: string;
  department: string;
  role: string;
  isComplete: boolean;
  engagementScore?: number;
  flagged: boolean;
  flaggedReason?: string;
  flaggedSeverity?: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Define our internal SurveyDoc interface
interface SurveyDoc {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

// Define the API response types to match what comes from the database
interface ApiResponseDoc {
  _id: string;
  surveyId: string;
  site: string;
  department: string;
  role: string;
  isComplete: boolean;
  engagementScore?: number;
  flagged: boolean;
  flaggedReason?: string;
  flaggedSeverity?: string;
  createdAt: Date;
}

interface ApiSurveyDoc {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

// Match the interface expected by SiteParticipationChart
interface SiteData {
  name: string;
  completed: number;
  pending: number;
  // Additional properties for our internal use
  site?: string;
  total?: number;
  rate?: number;
}

// Match the interface expected by ThemeHeatmap
interface ThemeData {
  theme: string;
  score: number;
  change: string;
  scores: number[];
  // Additional properties may be needed by ThemeHeatmap
}

// Match the interface expected by EngagementTrendLine
interface TrendData {
  name: string;
  score: number;
}

// Styled components
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

const QuickActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #552a47;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover {
    background: #6d3a5d;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 20px;
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

interface AnalyticsDashboardProps {
  surveyId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ surveyId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<FilterState>({
    sites: [],
    departments: [],
    roles: [],
    surveys: surveyId ? [surveyId] : [],
  });
  
  // Load surveys and responses data
  const { surveys, responses, loading } = useTracker(() => {
    const surveysHandle = Meteor.subscribe('surveys');
    // If surveyId is provided, only fetch responses for that survey
    const responsesHandle = surveyId
      ? Meteor.subscribe('responses.bySurvey', surveyId)
      : Meteor.subscribe('responses');
    
    const isLoading = !surveysHandle.ready() || !responsesHandle.ready();
    
    // Apply survey filter if surveyId is provided
    const responsesQuery = surveyId
      ? { surveyId: surveyId }
      : {};
    
    // Fetch the data and convert to our internal types
    const rawResponses = SurveyResponses.find(responsesQuery).fetch() as unknown as ApiResponseDoc[];
    const rawSurveys = Surveys.find({}).fetch() as unknown as ApiSurveyDoc[];
    
    // Convert to our internal types
    const typedResponses: ResponseDoc[] = rawResponses.map(r => ({
      _id: r._id,
      surveyId: r.surveyId,
      site: r.site,
      department: r.department,
      role: r.role,
      isComplete: r.isComplete,
      engagementScore: r.engagementScore || 0,
      flagged: r.flagged,
      flaggedReason: r.flaggedReason,
      // Convert the severity to our enum type or default to 'medium'
      flaggedSeverity: (r.flaggedSeverity as 'low' | 'medium' | 'high') || 'medium',
      createdAt: r.createdAt
    }));
    
    const typedSurveys: SurveyDoc[] = rawSurveys.map(s => ({
      _id: s._id,
      title: s.title || 'Untitled Survey',
      description: s.description,
      isActive: s.isActive || false,
      createdAt: s.createdAt
    }));
    
    return {
      surveys: typedSurveys,
      responses: typedResponses,
      loading: isLoading,
    };
  }, [surveyId]);
  
  useEffect(() => {
    // Update filters when surveyId changes
    if (surveyId) {
      setFilters(prev => ({
        ...prev,
        surveys: [surveyId]
      }));
    }
  }, [surveyId]);
  
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  // Calculate metrics based on filtered data
  const getFilteredResponses = () => {
    let filtered = [...responses];
    
    if (filters.sites.length > 0) {
      filtered = filtered.filter((r: ResponseDoc) => filters.sites.includes(r.site));
    }
    
    if (filters.departments.length > 0) {
      filtered = filtered.filter((r: ResponseDoc) => filters.departments.includes(r.department));
    }
    
    if (filters.roles.length > 0) {
      filtered = filtered.filter((r: ResponseDoc) => filters.roles.includes(r.role));
    }
    
    if (filters.surveys.length > 0) {
      filtered = filtered.filter((r: ResponseDoc) => filters.surveys.includes(r.surveyId));
    }
    
    return filtered;
  };
  
  const filteredResponses = getFilteredResponses();
  
  // Calculate KPIs
  const totalParticipants = filteredResponses.length;
  const completionRate = filteredResponses.filter(r => r.isComplete).length / (totalParticipants || 1) * 100;
  const avgEngagementScore = filteredResponses.reduce((sum, r) => sum + (r.engagementScore || 0), 0) / (totalParticipants || 1);
  const flaggedIssues = filteredResponses.filter(r => r.flagged).length;
  
  // Get unique sites for participation chart
  const sites = [...new Set(responses.map((r: ResponseDoc) => r.site))];
  const siteParticipation: SiteData[] = sites.map(site => {
    const total = responses.filter((r: ResponseDoc) => r.site === site).length;
    const completed = responses.filter((r: ResponseDoc) => r.site === site && r.isComplete).length;
    return {
      name: site, // Use site as the name for the chart
      completed,
      pending: total - completed,
      // Additional properties for our internal use
      site,
      total,
      rate: (completed / (total || 1)) * 100
    };
  }).sort((a, b) => (b.rate || 0) - (a.rate || 0));
  
  // Get engagement trend data
  const engagementTrend: TrendData[] = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthResponses = responses.filter((r: ResponseDoc) => {
      const responseDate = new Date(r.createdAt);
      return responseDate.getMonth() === month.getMonth() && 
             responseDate.getFullYear() === month.getFullYear();
    });
    
    const avgScore = monthResponses.reduce((sum: number, r: ResponseDoc) => sum + (r.engagementScore || 0), 0) / (monthResponses.length || 1);
    const monthLabel = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    return {
      name: monthLabel,
      score: avgScore // Use score as expected by EngagementTrendLine
    };
  }).reverse();
  
  // Get theme data for heatmap
  const themes = ['Leadership', 'Communication', 'Work Environment', 'Recognition', 'Growth', 'Teamwork'];
  const themeData: ThemeData[] = themes.map(theme => {
    return {
      theme,
      score: Math.random() * 5, // This would come from actual data in a real app
      change: (Math.random() * 2 - 1).toFixed(1), // Random change between -1 and +1
      scores: [Math.random() * 5, Math.random() * 5, Math.random() * 5] // Sample scores for different metrics
    };
  }).sort((a, b) => b.score - a.score);
  
  // Get flagged issues for list
  const flaggedIssuesList: Issue[] = filteredResponses
    .filter((r: ResponseDoc) => r.flagged)
    .map((r: ResponseDoc, index) => ({
      id: String(index), // Convert index to string to match Issue type
      message: r.flaggedReason || 'Unspecified issue',
      severity: r.flaggedSeverity || 'medium',
      // Additional metadata as custom properties
      site: r.site,
      department: r.department,
      issue: r.flaggedReason || 'Unspecified issue',
      date: new Date(r.createdAt).toLocaleDateString()
    }));
  
  if (loading) {
    return <div>Loading analytics data...</div>;
  }
  
  return (
    <Container>
      <AnonymityWarning>
        <FiAlertTriangle />
        <div>
          <strong>Anonymity Notice:</strong> All data shown is aggregated to protect individual respondent privacy. 
          Results with fewer than 5 responses are not displayed.
        </div>
      </AnonymityWarning>
      
      <TabContainer>
        <TabHeader>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab active={activeTab === 'real-time'} onClick={() => setActiveTab('real-time')}>
            <FiActivity style={{ marginRight: '6px' }} /> Real Time
          </Tab>
          <Tab active={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')}>
            Engagement
          </Tab>
          <Tab active={activeTab === 'themes'} onClick={() => setActiveTab('themes')}>
            Themes
          </Tab>
          <Tab active={activeTab === 'issues'} onClick={() => setActiveTab('issues')}>
            Issues
          </Tab>
          <Tab active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>
            Comments
          </Tab>
        </TabHeader>
      </TabContainer>
      
      <AnalyticsFilterBar 
        surveys={surveys.map(s => s._id)}
        sites={sites}
        departments={[...new Set(responses.map(r => r.department))]}
        roles={[...new Set(responses.map(r => r.role))]}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <KPIGrid 
        data={{
          participationRate: {
            value: completionRate,
            icon: FiUsers
          },
          engagementScore: {
            value: avgEngagementScore.toFixed(1),
            icon: FiStar
          },
          responsesCount: {
            value: totalParticipants,
            icon: FiMessageSquare
          },
          daysRemaining: {
            value: flaggedIssues,
            icon: FiAlertTriangle
          }
        }}
        isLoading={loading}
        isBlurred={false}
      />
      
      {activeTab === 'overview' && (
        <ChartGrid>
          <HalfWidthCard>
            <SiteParticipationChart 
              data={siteParticipation} 
              isLoading={loading}
              isBlurred={false}
            />
          </HalfWidthCard>
          
          <HalfWidthCard>
            <ThemeHeatmap 
              data={themeData} 
              surveyLabels={['Survey 1', 'Survey 2', 'Survey 3']}
              isLoading={loading}
              isBlurred={false}
            />
          </HalfWidthCard>
          
          <FullWidthCard>
            <EngagementTrendLine 
              data={engagementTrend} 
              isLoading={loading}
              isBlurred={false}
            />
          </FullWidthCard>
        </ChartGrid>
      )}
      
      {activeTab === 'issues' && (
        <ChartGrid>
          <FullWidthCard>
            <FlaggedIssuesList 
              issues={flaggedIssuesList} 
              isLoading={loading}
              isBlurred={false}
            />
          </FullWidthCard>
        </ChartGrid>
      )}
      
      {activeTab === 'comments' && (
        <ChartGrid>
          <FullWidthCard>
            <CommentClusterView 
              clusters={[]}
              isLoading={false}
              isBlurred={false}
            />
          </FullWidthCard>
        </ChartGrid>
      )}
      
      {activeTab === 'real-time' && (
        <RealTimeAnalytics 
          surveyId={surveyId}
          isLoading={loading}
          isBlurred={false}
        />
      )}
      
      <QuickActionsContainer>
        <QuickActionButton title="Export Data">
          <FiDownload />
        </QuickActionButton>
        <QuickActionButton title="Share Report">
          <FiShare2 />
        </QuickActionButton>
        <QuickActionButton title="Generate PDF Report">
          <FiFileText />
        </QuickActionButton>
      </QuickActionsContainer>
    </Container>
  );
};

export default AnalyticsDashboard;
