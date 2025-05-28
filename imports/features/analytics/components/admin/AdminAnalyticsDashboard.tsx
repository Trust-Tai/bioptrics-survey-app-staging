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
  FiBarChart2,
  FiCheckCircle
} from 'react-icons/fi';

// Import from features instead of api
// Using the old imports temporarily until we fully migrate the API
import { SurveyResponses } from '../../../surveys/api/surveyResponses';
import { Surveys } from '../../../../features/surveys/api/surveys';

// Types for responses and surveys
interface ResponseDoc {
  _id: string;
  surveyId: string;
  userId?: string;
  site: string;
  department: string;
  role: string;
  isComplete: boolean;
  engagementScore?: number;
  flagged: boolean;
  flaggedReason?: string;
  flaggedSeverity?: 'low' | 'medium' | 'high';
  createdAt: Date;
  [key: string]: any;
}

interface SurveyDoc {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  [key: string]: any;
}

// Import all migrated components from feature directories
import { AnalyticsFilterBar, AnalyticsFilterBarProps } from './filters';
import { KPIGrid, KPIData } from './kpi';
import { SiteParticipationChart, SiteData as ChartSiteData } from './charts';
import { ThemeHeatmap, ThemeData as HeatmapThemeData } from './heatmap';
import { EngagementTrendLine, TrendData as EngagementTrendData } from './trends';
import { FlaggedIssuesList, Issue as FlaggedIssue } from './issues';
import { CommentClusterView, CommentCluster } from './comments';

// Define local FilterState interface to avoid conflicts
interface LocalFilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

// Types for the analytics components that haven't been migrated yet
interface LocalSiteData {
  site: string;
  name?: string;
  total: number;
  completed: number;
  pending?: number;
  rate: number;
}

interface LocalThemeData {
  theme: string;
  score: number;
  change: string;
  scores?: number[];
}

interface LocalTrendData {
  month: string;
  name?: string;
  score: number;
}

interface LocalIssue {
  id: string;
  site: string;
  department: string;
  issue: string;
  message?: string;
  severity: string;
  date: string;
}

interface CommentClusterViewProps {
  clusters: any[];
  isLoading: boolean;
  isBlurred: boolean;
}

interface AdminAnalyticsDashboardProps {
  surveyId?: string;
}

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

const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ surveyId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LocalFilterState>({
    sites: [],
    departments: [],
    roles: [],
    surveys: []
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
    
    return {
      surveys: Surveys.find({}).fetch() as SurveyDoc[],
      responses: SurveyResponses.find(responsesQuery).fetch() as unknown as ResponseDoc[],
      loading: isLoading,
    };
  }, [surveyId]);
  
  const handleFilterChange = (newFilters: LocalFilterState) => {
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
  const sites = [...new Set(responses.map((r: any) => r.site))];
  const siteParticipation: LocalSiteData[] = sites.map(site => {
    const total = responses.filter((r: any) => r.site === site).length;
    const completed = responses.filter((r: any) => r.site === site && r.isComplete).length;
    return {
      site,
      total,
      completed,
      rate: (completed / (total || 1)) * 100
    };
  }).sort((a, b) => b.rate - a.rate);
  
  // Get engagement trend data
  const engagementTrend: LocalTrendData[] = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthResponses = responses.filter((r: any) => {
      const responseDate = new Date(r.createdAt);
      return responseDate.getMonth() === month.getMonth() && 
             responseDate.getFullYear() === month.getFullYear();
    });
    
    const avgScore = monthResponses.reduce((sum: number, r: any) => sum + (r.engagementScore || 0), 0) / (monthResponses.length || 1);
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      score: avgScore
    };
  }).reverse();
  
  // Get theme data for heatmap
  const themes = ['Leadership', 'Communication', 'Work Environment', 'Recognition', 'Growth', 'Teamwork'];
  const themeData: LocalThemeData[] = themes.map(theme => {
    return {
      theme,
      score: Math.random() * 5, // This would come from actual data in a real app
      change: (Math.random() * 2 - 1).toFixed(1), // Random change between -1 and +1
      scores: [Math.random() * 5, Math.random() * 5, Math.random() * 5] // Sample scores for different metrics
    };
  }).sort((a, b) => b.score - a.score);
  
  // Get flagged issues for list
  const flaggedIssuesList: LocalIssue[] = filteredResponses
    .filter((r: any) => r.flagged)
    .map((r: any) => ({
      id: r._id,
      site: r.site,
      department: r.department,
      issue: r.flaggedReason || 'Unspecified issue',
      message: r.flaggedReason || 'Unspecified issue', // Adding message property to match Issue interface
      severity: r.flaggedSeverity || 'medium',
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
      
      <AnalyticsFilterBar
        sites={sites}
        departments={Array.from(new Set(responses.map((r: any) => r.department)))}
        roles={Array.from(new Set(responses.map((r: any) => r.role)))}
        surveys={surveys.map(s => s._id)}
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
            value: avgEngagementScore,
            icon: FiBarChart2
          },
          responsesCount: {
            value: totalParticipants,
            icon: FiCheckCircle
          },
          daysRemaining: {
            value: 14, // Example value, replace with actual data
            icon: FiCalendar
          }
        }}
        isLoading={loading}
        isBlurred={false}
      />
      
      <ChartGrid>
        <HalfWidthCard>
          <SiteParticipationChart 
            data={siteParticipation.map(site => ({
              name: site.name || site.site,
              completed: site.completed,
              pending: site.pending || (site.total - site.completed)
            }))}
            isLoading={loading}
            isBlurred={false}
          />
        </HalfWidthCard>
        
        <HalfWidthCard>
          <ThemeHeatmap 
            data={themeData.map(item => ({
              theme: item.theme,
              score: item.score,
              change: item.change,
              scores: item.scores || []
            }))}
            isLoading={loading}
            isBlurred={false}
          />
        </HalfWidthCard>
        
        <FullWidthCard>
          <EngagementTrendLine 
            data={engagementTrend.map(item => ({
              name: item.month,
              score: item.score,
              date: item.month
            }))}
            isLoading={loading}
            isBlurred={false}
          />
        </FullWidthCard>
        
        <HalfWidthCard>
          <FlaggedIssuesList 
            issues={flaggedIssuesList.map(item => ({
              id: item.id,
              severity: item.severity as 'low' | 'medium' | 'high',
              message: item.message || 'Unspecified issue',
              date: item.date
            }))}
            isLoading={loading}
            isBlurred={false}
          />
        </HalfWidthCard>
        
        <HalfWidthCard>
          <CommentClusterView 
            clusters={[]} 
            isLoading={loading}
            isBlurred={false}
          />
        </HalfWidthCard>
      </ChartGrid>
      
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

export default AdminAnalyticsDashboard;
