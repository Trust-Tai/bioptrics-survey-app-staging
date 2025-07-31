import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FiFilter, FiDownload, FiX } from 'react-icons/fi';
import ReactSelect from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import custom hook
import { useSurveyAnalytics } from '../../hooks/useSurveyAnalytics';

// Import chart components
import ResponseTrendsChart from './ResponseTrendsChart';
import DeviceUsageChart from './DeviceUsageChart';
import QuestionPerformanceChart from './QuestionPerformanceChart';
import ResponseRateChart from './ResponseRateChart';
import CompletionTimeChart from './CompletionTimeChart';
import CompletionRateChart from './CompletionRateChart';
import FunnelChart from './FunnelChart';
import DropoutAnalysis from './DropoutAnalysis';
import RealTimeAnalytics from './RealTimeAnalytics';

// Props interface for SurveyAnalytics component
interface SurveyAnalyticsProps {
  surveyId?: string; // Survey ID to filter by
  embedded?: boolean; // Whether the component is embedded in another component
}

// Styled components
const DashboardContainer = styled.div<{ embedded?: boolean }>`
  max-width: 100%;
  margin: ${props => props.embedded ? '0' : '0 auto'};
  background: #fff;
  min-height: ${props => props.embedded ? 'auto' : '100vh'};
  padding: 1.5rem;
  box-shadow: ${props => props.embedded ? 'none' : '0px 0px 10px 0px #0000001A'};
  border-radius: ${props => props.embedded ? '0' : '20px'};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.primary ? 'var(--color-primary)' : 'var(--color-background)')};
  color: ${(props) => (props.primary ? '#ffffff !important' : 'var(--color-primary)')};
  border: ${(props) => (props.primary ? 'none' : '1px solid var(--color-primary)')};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.primary ? 'var(--color-primary-dark)' : 'var(--color-background-hover)')};
  }

  svg {
    font-size: 18px;
  }
`;

const FilterBar = styled.div`
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  background: #fff;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled.div`
  grid-column: span 2;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1200px) {
    grid-column: span 3;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-primary);
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
`;

const CardTrend = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.positive ? 'var(--color-success)' : 'var(--color-danger)')};
`;

const ChartCard = styled.div<{ size?: 'small' | 'medium' | 'large' | 'full' }>`
  grid-column: ${(props) => {
    switch (props.size) {
      case 'small':
        return 'span 4';
      case 'medium':
        return 'span 6';
      case 'large':
        return 'span 8';
      case 'full':
        return 'span 12';
      default:
        return 'span 6';
    }
  }};
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1200px) {
    grid-column: span 6;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
`;

const ChartActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ChartContent = styled.div`
  flex: 1;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  min-height: 200px;
  color: var(--color-text-light);
  font-size: 14px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-background);
  padding: 28px 40px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: var(--color-primary);
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

const ModalDescription = styled.p`
  color: var(--color-accent);
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 1.5;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-accent);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
 
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
`;

// Memoized component for KPI Card to prevent unnecessary re-renders
const KPICardMemo = React.memo(({ title, value, icon, trend, trendValue }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <KPICard>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardIcon>{icon}</CardIcon>
    </CardHeader>
    <CardValue>{value}</CardValue>
    {trend && trendValue && (
      <CardTrend positive={trend === 'up'}>
        {trend === 'up' ? '↑' : '↓'} {trendValue}
      </CardTrend>
    )}
  </KPICard>
));

KPICardMemo.displayName = 'KPICardMemo';

// Main SurveyAnalytics component
const SurveyAnalytics: React.FC<SurveyAnalyticsProps> = ({ surveyId, embedded = false }) => {
  // Use our custom hook to fetch and manage analytics data
  const {
    analyticsData,
    tags,
    surveys,
    questions,
    isLoadingAnalytics,
    isLoadingTags,
    isLoadingSurveys,
    isLoadingQuestions,
    filterParams,
    updateFilters,
    getDateRangeParams
  } = useSurveyAnalytics(surveyId);
  
  // Local state for UI
  const [activeTab, setActiveTab] = useState('overview');
  const [filterVisible, setFilterVisible] = useState(!embedded);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDateRange, setSelectedDateRange] = useState('last_7_days');
  
  // Modal states
  const [showQuestionPerformance, setShowQuestionPerformance] = useState(false);
  const [showResponseRateChart, setShowResponseRateChart] = useState(false);
  const [showCompletionTimeChart, setShowCompletionTimeChart] = useState(false);
  const [showCompletionRateChart, setShowCompletionRateChart] = useState(false);
  
  // Handle date range change
  const handleDateRangeChange = useCallback((dates: [Date | null, Date | null]) => {
    setDateRange(dates);
    const [start, end] = dates;
    
    if (start && end) {
      updateFilters({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
    }
  }, [updateFilters]);
  
  // Handle tag selection
  const handleTagSelection = useCallback((selectedOptions: any) => {
    const tagIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    updateFilters({ tagIds });
  }, [updateFilters]);
  
  // Handle survey selection
  const handleSurveySelection = useCallback((selectedOptions: any) => {
    const surveyIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    updateFilters({ surveyIds });
  }, [updateFilters]);
  
  // Handle question selection
  const handleQuestionSelection = useCallback((selectedOptions: any) => {
    const questionIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    updateFilters({ questionIds });
  }, [updateFilters]);
  
  // Memoize tag options to prevent unnecessary recalculations
  const tagOptions = useMemo(() => {
    return tags.map(tag => ({
      value: tag._id,
      label: tag.name,
      color: tag.color || '#cccccc'
    }));
  }, [tags]);
  
  // Memoize survey options to prevent unnecessary recalculations
  const surveyOptions = useMemo(() => {
    return surveys.map(survey => ({
      value: survey._id,
      label: survey.title
    }));
  }, [surveys]);
  
  // Memoize question options to prevent unnecessary recalculations
  const questionOptions = useMemo(() => {
    return questions.map(question => ({
      value: question._id,
      label: question.questionText || 'Untitled Question'
    }));
  }, [questions]);
  
  // Format numbers for display
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  }, []);
  
  // Format percentages for display
  const formatPercentage = useCallback((value: number): string => {
    return value.toFixed(1) + '%';
  }, []);
  
  // Format time for display
  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 1) {
      return Math.round(minutes * 60) + ' sec';
    } else if (minutes < 60) {
      return minutes.toFixed(1) + ' min';
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return hours + 'h ' + mins + 'm';
    }
  }, []);
  
  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setFilterVisible(prev => !prev);
  }, []);
  
  // Export data as CSV
  const exportData = useCallback(() => {
    // Implementation for exporting data
    console.log('Exporting data...');
  }, []);
  
  // Render loading state
  if (isLoadingAnalytics && !analyticsData) {
    return (
      <DashboardContainer embedded={embedded}>
        <LoadingIndicator>Loading analytics data...</LoadingIndicator>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer embedded={embedded}>
      {!embedded && (
        <PageHeader>
          <PageTitle>Survey Analytics</PageTitle>
          <ActionButtons>
            <Button onClick={toggleFilter}>
              <FiFilter /> {filterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button onClick={exportData}>
              <FiDownload /> Export Data
            </Button>
          </ActionButtons>
        </PageHeader>
      )}
      
      {filterVisible && !surveyId && (
        <FilterBar>
          <FilterGroup>
            <FilterLabel>Tags</FilterLabel>
            <ReactSelect
              isMulti
              options={tagOptions}
              placeholder="Select tags"
              onChange={handleTagSelection}
              isLoading={isLoadingTags}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Surveys</FilterLabel>
            <ReactSelect
              isMulti
              options={surveyOptions}
              placeholder="Select surveys"
              onChange={handleSurveySelection}
              isLoading={isLoadingSurveys}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Questions</FilterLabel>
            <ReactSelect
              isMulti
              options={questionOptions}
              placeholder="Select questions"
              onChange={handleQuestionSelection}
              isLoading={isLoadingQuestions}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Date Range</FilterLabel>
            <DateRangeContainer>
              <StyledDatePicker
                selectsRange={true}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={handleDateRangeChange}
                placeholderText="Select date range"
              />
            </DateRangeContainer>
          </FilterGroup>
        </FilterBar>
      )}
      
      {/* KPI Cards */}
      <AnalyticsGrid>
        <KPICardMemo
          title="Completed Surveys"
          value={formatNumber(analyticsData.completedSurveysCount)}
          icon={<span>📊</span>}
        />
        
        <KPICardMemo
          title="Participation Rate"
          value={formatPercentage(analyticsData.participationRate)}
          icon={<span>👥</span>}
          trend="up"
          trendValue="2.5% from last week"
        />
        
        <KPICardMemo
          title="Completion Rate"
          value={formatPercentage(analyticsData.completionRate)}
          icon={<span>✅</span>}
        />
        
        <KPICardMemo
          title="Avg. Engagement Score"
          value={analyticsData.avgEngagementScore.toFixed(1)}
          icon={<span>⭐</span>}
          trend="up"
          trendValue="0.3 from last month"
        />
        
        <KPICardMemo
          title="Avg. Completion Time"
          value={formatTime(analyticsData.avgCompletionTime)}
          icon={<span>⏱️</span>}
        />
        
        <KPICardMemo
          title="Response Rate"
          value={formatPercentage(analyticsData.responseRate)}
          icon={<span>📝</span>}
        />
      </AnalyticsGrid>
      
      {/* Charts */}
      <AnalyticsGrid>
        {/* Response Trends Chart */}
        <ChartCard size="large">
          <ChartHeader>
            <ChartTitle>Response Trends</ChartTitle>
            <ChartActions>
              <Button onClick={() => setShowResponseRateChart(true)}>View Full</Button>
            </ChartActions>
          </ChartHeader>
          <ChartContent>
            {isLoadingAnalytics ? (
              <LoadingIndicator>Loading response trends...</LoadingIndicator>
            ) : (
              <ResponseTrendsChart data={analyticsData.responseTrendsData} />
            )}
          </ChartContent>
        </ChartCard>
        
        {/* Device Usage Chart */}
        <ChartCard size="medium">
          <ChartHeader>
            <ChartTitle>Device Usage</ChartTitle>
          </ChartHeader>
          <ChartContent>
            <DeviceUsageChart />
          </ChartContent>
        </ChartCard>
        
        {/* Question Performance Chart */}
        <ChartCard size="medium">
          <ChartHeader>
            <ChartTitle>Question Performance</ChartTitle>
            <ChartActions>
              <Button onClick={() => setShowQuestionPerformance(true)}>View Details</Button>
            </ChartActions>
          </ChartHeader>
          <ChartContent>
            <QuestionPerformanceChart />
          </ChartContent>
        </ChartCard>
        
        {/* Completion Rate Chart */}
        <ChartCard size="medium">
          <ChartHeader>
            <ChartTitle>Completion Rate</ChartTitle>
            <ChartActions>
              <Button onClick={() => setShowCompletionRateChart(true)}>View Details</Button>
            </ChartActions>
          </ChartHeader>
          <ChartContent>
            <CompletionRateChart data={analyticsData.completionRateData} />
          </ChartContent>
        </ChartCard>
        
        {/* Dropout Analysis */}
        <ChartCard size="full">
          <ChartHeader>
            <ChartTitle>Dropout Analysis</ChartTitle>
          </ChartHeader>
          <ChartContent>
            <DropoutAnalysis />
          </ChartContent>
        </ChartCard>
      </AnalyticsGrid>
      
      {/* Modals */}
      {showResponseRateChart && (
        <Modal>
          <ModalContent>
            <ModalTitle>Response Rate Over Time</ModalTitle>
            <ModalDescription>
              This chart shows the number of responses received over time.
            </ModalDescription>
            <ResponseRateChart data={analyticsData.responseRateData} height={400} />
            <ModalCloseButton onClick={() => setShowResponseRateChart(false)}>
              <FiX />
            </ModalCloseButton>
          </ModalContent>
        </Modal>
      )}
      
      {showCompletionTimeChart && (
        <Modal>
          <ModalContent>
            <ModalTitle>Average Completion Time</ModalTitle>
            <ModalDescription>
              This chart shows the average time taken to complete surveys over time.
            </ModalDescription>
            <CompletionTimeChart data={analyticsData.completionTimeData} height={400} />
            <ModalCloseButton onClick={() => setShowCompletionTimeChart(false)}>
              <FiX />
            </ModalCloseButton>
          </ModalContent>
        </Modal>
      )}
      
      {showCompletionRateChart && (
        <Modal>
          <ModalContent>
            <ModalTitle>Survey Completion Rate</ModalTitle>
            <ModalDescription>
              This chart shows the percentage of surveys that were completed versus abandoned.
            </ModalDescription>
            <CompletionRateChart data={analyticsData.completionRateData} height={400} />
            <ModalCloseButton onClick={() => setShowCompletionRateChart(false)}>
              <FiX />
            </ModalCloseButton>
          </ModalContent>
        </Modal>
      )}
      
      {showQuestionPerformance && (
        <Modal>
          <ModalContent>
            <ModalTitle>Question Performance Analysis</ModalTitle>
            <ModalDescription>
              This chart shows detailed performance metrics for each question.
            </ModalDescription>
            <QuestionPerformanceChart height={500} />
            <ModalCloseButton onClick={() => setShowQuestionPerformance(false)}>
              <FiX />
            </ModalCloseButton>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default React.memo(SurveyAnalytics);
