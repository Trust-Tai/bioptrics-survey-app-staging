import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  FiFilter, 
  FiX, 
  FiMessageSquare, 
  FiUser, 
  FiBarChart2,
  FiFileText,
  FiActivity,
  FiUsers,
  FiDownload
} from 'react-icons/fi';
import { 
  FaUsers, 
  FaPercentage, 
  FaChartPie, 
  FaClock,
  FaChartBar
} from 'react-icons/fa';
import { useResponseRateData } from '../../hooks/useResponseRateData';
import { useParticipantData } from '../../hooks/useParticipantData';
import { useCompletionTimeData } from '../../hooks/useCompletionTimeData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import tab components
import TabsContainer, { TabItem } from './TabsContainer';
import OverviewTab from './tabs/OverviewTab';
import QuestionsTab, { QuestionsTabRef } from './tabs/QuestionsTab';
import { exportQuestionsToPDF } from '/imports/features/surveys/utils/AnalyticsSurveyQuestionPdf';
// import GroupsTab from './tabs/GroupsTab';
import CommentsTab from './tabs/CommentsTab';
import ActivityTab from './tabs/ActivityTab';

// Define interfaces for props and state
interface SurveyAnalyticsTabProps {
  surveyId: string;
}

interface FilterParams {
  surveyIds?: string[];
  tagIds?: string[];
  questionIds?: string[];
  startDate?: string;
  endDate?: string;
}

interface AnalyticsData {
  completedSurveysCount: number;
  participationRate: number;
  responseRate: number;
  engagementScore: number;
  completionTime: number;
  responseTrends: Array<{
    date: string;
    responses: number;
    completions: number;
  }>;
}

// ResponseRateContent component will be defined after the styled components

// Styled components
const AnalyticsDashboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 0 24px 0;
`;

const FilterSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  display:none;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ResetFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const FilterControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
  }
`;

const DateRangePicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background-color: white;
`;

const ToLabel = styled.span`
  color: #6b7280;
  font-size: 14px;
`;

const CustomSelect = styled.div`
  position: relative;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  cursor: pointer;
`;

const KpiSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const KpiCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const KpiIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f1f5f9;
  color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const KpiContent = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }
`;

const KpiValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const KpiTrend = styled.div<{ trend: 'positive' | 'negative' | 'neutral' }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => 
    props.trend === 'positive' ? '#10b981' : 
    props.trend === 'negative' ? '#ef4444' : 
    '#6b7280'
  };

  span {
    color: #6b7280;
    font-weight: 400;
  }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const ChartContainer = styled.div<{ size?: 'large' | 'medium' | 'small' }>`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  grid-column: ${props => props.size === 'large' ? 'span 2' : 'span 1'};

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ChartPlaceholder = styled.div`
  min-height: 200px;
`;

const ModernLineChart = styled.div`
  position: relative;
  height: 200px;
`;

const ChartYAxis = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
`;

const YAxisLabel = styled.div`
  position: absolute;
  right: 10px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6b7280;
`;

const ChartContent = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 20px;
`;

const ChartXAxis = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  bottom: 0;
  height: 20px;
  display: flex;
  justify-content: space-between;
`;

const XAxisLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const DonutChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const DonutChartLegend = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
`;

const LegendText = styled.div`
  font-size: 14px;
  color: #4b5563;
  flex: 1;
`;

const LegendCount = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const LegendTotal = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const MockBarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 0 10px;
`;

const MockBar = styled.div`
  width: 30px;
  background-color: #552a47;
  border-radius: 4px 4px 0 0;
`;

const ActivitySection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: #46223b;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Main component
// ResponseRateContent component to display dynamic response rate
interface ResponseRateContentProps {
  surveyId: string;
}

const ResponseRateContent: React.FC<ResponseRateContentProps> = ({ surveyId }) => {
  const { rate, trend, isLoading, error } = useResponseRateData(surveyId);
  
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value}` : value.toString();
  };
  
  if (isLoading) {
    return (
      <>
        <KpiValue>Loading...</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <KpiValue>--</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  return (
    <>
      <KpiValue>{rate}%</KpiValue>
      <KpiTrend trend={trend.direction}>
        {formatTrend(trend.value)}% <span>vs prev. period</span>
      </KpiTrend>
    </>
  );
};

// ParticipantsContent component to display dynamic participant count
interface ParticipantsContentProps {
  surveyId: string;
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({ surveyId }) => {
  const { count, trend, isLoading, error } = useParticipantData(surveyId);
  
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value}` : value.toString();
  };
  
  if (isLoading) {
    return (
      <>
        <KpiValue>Loading...</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <KpiValue>--</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  return (
    <>
      <KpiValue>{count}</KpiValue>
      <KpiTrend trend={trend.direction}>
        {formatTrend(trend.value)}% <span>vs prev. period</span>
      </KpiTrend>
    </>
  );
};


// CompletionTimeContent component to display dynamic completion time
interface CompletionTimeContentProps {
  surveyId: string;
}

const CompletionTimeContent: React.FC<CompletionTimeContentProps> = ({ surveyId }) => {
  const { time, trend, isLoading, error } = useCompletionTimeData(surveyId);
  
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    
    // Convert seconds to minutes and seconds format
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    
    // Format as M:SS
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatTrend = (value: number) => {
    return value > 0 ? `+${value}` : value.toString();
  };
  
  if (isLoading) {
    return (
      <>
        <KpiValue>Loading...</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <KpiValue>--</KpiValue>
        <KpiTrend trend="neutral">-- <span>vs prev. period</span></KpiTrend>
      </>
    );
  }
  
  return (
    <>
      <KpiValue>{formatTime(time)}</KpiValue>
      <KpiTrend trend={trend.direction}>
        {formatTrend(trend.value)}% <span>vs prev. period</span>
      </KpiTrend>
    </>
  );
};

const SurveyAnalyticsTab: React.FC<SurveyAnalyticsTabProps> = ({ surveyId }) => {
  // Ref for QuestionsTab component
  const questionsTabRef = useRef<QuestionsTabRef>(null);
  
  // State for PDF export
  const [exportingPDF, setExportingPDF] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    completedSurveysCount: 0,
    participationRate: 0,
    responseRate: 0,
    engagementScore: 0,
    completionTime: 0,
    responseTrends: []
  });

  // State for filters
  const [filterParams, setFilterParams] = useState<FilterParams>({
    surveyIds: [surveyId],
    tagIds: [],
    questionIds: [],
    startDate: undefined,
    endDate: undefined
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use Promise.all to fetch all data in parallel
      const [
        completedSurveysCount,
        participationRate,
        responseRate,
        engagementScore,
        completionTime,
        responseTrends
      ] = await Promise.all([
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredSurveysCount', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredParticipationRate', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredResponseRate', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredEngagementScore', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result || 0);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredCompletionTime', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<any[]>((resolve, reject) => {
          Meteor.call('getResponseTrendsData', filterParams, (error: Error, result: any[]) => {
            if (error) reject(error);
            else resolve(result || []);
          });
        })
      ]);
      
      // Update analytics data state
      setAnalyticsData({
        completedSurveysCount,
        participationRate,
        responseRate,
        engagementScore,
        completionTime,
        responseTrends
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, surveyId]);

  // Handle date range change
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates);
    const [start, end] = dates;
    
    if (start && end) {
      setFilterParams(prev => ({
        ...prev,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }));
    }
  };

  // Handle tag selection
  const handleTagSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setFilterParams(prev => ({
        ...prev,
        tagIds: [value]
      }));
    } else {
      setFilterParams(prev => ({
        ...prev,
        tagIds: []
      }));
    }
  };

  // Handle response status selection
  const handleStatusSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // This would be implemented to filter by response status
    // For now, we're just logging the selection
    console.log('Selected status:', e.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange([null, null]);
    setFilterParams({
      surveyIds: [surveyId],
      tagIds: [],
      questionIds: [],
      startDate: undefined,
      endDate: undefined
    });
  };

  // Format time for display (e.g., 4:32)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to handle PDF export
  const handleExportPDF = () => {
    setExportingPDF(true);
    
    // Check if we can get questions from the ref
    const getQuestionsFromRef = () => {
      if (questionsTabRef.current) {
        const questions = questionsTabRef.current.getAnalyticsQuestions();
        if (questions && questions.length > 0) {
          return questions;
        }
      }
      return null;
    };
    
    // Try to get questions from ref first
    const refQuestions = getQuestionsFromRef();
    
    if (refQuestions) {
      // If we have questions from the ref, use them directly
      try {
        exportQuestionsToPDF(refQuestions, {
          surveyTitle: surveyTitle,
          surveyDescription: surveyDescription,
          surveyId: surveyId
        });
        setExportingPDF(false);
      } catch (error) {
        console.error('Error generating PDF from ref questions:', error);
        setExportingPDF(false);
      }
    } else {
      // If questions aren't available from ref, fetch them directly
      Meteor.call(
        'AnalyticsQuestionGetTitles', 
        surveyId,
        (error: any, result: any) => {
          if (error) {
            console.error('Error fetching questions for PDF:', error);
            setExportingPDF(false);
          } else {
            try {
              // Use the utility function to export questions to PDF
              exportQuestionsToPDF(result, {
                surveyTitle: surveyTitle,
                surveyDescription: surveyDescription,
                surveyId: surveyId
              });
            } catch (exportError) {
              console.error('Error generating PDF:', exportError);
            } finally {
              setExportingPDF(false);
            }
          }
        }
      );
    }
  };

  // Fetch survey details
  useEffect(() => {
    // Fetch survey details for PDF export
    Meteor.call(
      'surveys.getSurvey',
      surveyId,
      (error: any, result: any) => {
        if (error) {
          console.error('Error fetching survey details:', error);
        } else {
          console.log('Fetched survey details:', result);
          setSurveyTitle(result.title || '');
          setSurveyDescription(result.description || '');
        }
      }
    );
    
    fetchAnalyticsData();
  }, [fetchAnalyticsData, surveyId]);

  if (!surveyId) {
    return <div>No survey selected</div>;
  }

  // Define tabs for the TabsContainer
  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FiBarChart2 size={16} />,
      content: (
        <>
          {/* Only show KPI Cards if there are participants */}
          {analyticsData.completedSurveysCount > 0 ? (
            <KpiSection>
              <KpiCard>
                <KpiIcon>
                  <FaUsers size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Total Participants</h4>
                  <ParticipantsContent surveyId={surveyId} />
                </KpiContent>
              </KpiCard>
              
              <KpiCard>
                <KpiIcon>
                  <FaPercentage size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Response Rate</h4>
                  <ResponseRateContent surveyId={surveyId} />
                </KpiContent>
              </KpiCard>
              
              {/* <KpiCard>
                <KpiIcon>
                  <FaChartPie size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Engagement Score</h4>
                  <KpiValue>{analyticsData.engagementScore.toFixed(1)}</KpiValue>
                  <KpiTrend trend="negative">-0.3 <span>vs prev. period</span></KpiTrend>
                </KpiContent>
              </KpiCard> */}
              
              <KpiCard>
                <KpiIcon>
                  <FaClock size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Avg. Completion Time</h4>
                  <CompletionTimeContent surveyId={surveyId} />
                </KpiContent>
              </KpiCard>
            </KpiSection>
          ) : null}
          
          <OverviewTab analyticsData={analyticsData} isLoading={isLoading} surveyId={surveyId} />
          
          {/* No additional components needed */}
        </>
      )
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: <FiFileText size={16} />,
      content: <QuestionsTab ref={questionsTabRef} isLoading={isLoading} surveyId={surveyId} />
    },
    // {
    //   id: 'groups',
    //   label: 'Groups',
    //   icon: <FiUsers size={16} />,
    //   content: <GroupsTab isLoading={isLoading} />
    // },
    {
      id: 'comments',
      label: 'Comments',
      icon: <FiMessageSquare size={16} />,
      content: <CommentsTab isLoading={isLoading} />
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <FiActivity size={16} />,
      content: <ActivityTab isLoading={isLoading} />
    }
  ];

  return (
    <AnalyticsDashboard>
      {/* Filter Section */}
      <FilterSection>
        <FilterHeader>
          <h3>Filter Data</h3>
          <ResetFiltersButton onClick={resetFilters}>
            <FiX size={14} /> Reset Filters
          </ResetFiltersButton>
        </FilterHeader>
        <FilterControls>
          <FilterRow>
            <FilterGroup>
              <label>Date Range</label>
              <DateRangePicker>
                <DatePicker
                  selected={dateRange[0]}
                  onChange={handleDateRangeChange}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  selectsRange
                  customInput={<DateInput placeholder="dd-mm-yyyy" />}
                />
              </DateRangePicker>
            </FilterGroup>
            <FilterGroup>
              <label>Question Tags</label>
              <CustomSelect>
                <FilterSelect onChange={handleTagSelection}>
                  <option value="">All Tags</option>
                  <option value="engagement">Engagement</option>
                  <option value="satisfaction">Satisfaction</option>
                  <option value="feedback">Feedback</option>
                </FilterSelect>
              </CustomSelect>
            </FilterGroup>
            <FilterGroup>
              <label>Response Status</label>
              <CustomSelect>
                <FilterSelect onChange={handleStatusSelection}>
                  <option value="">All Responses</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </FilterSelect>
              </CustomSelect>
            </FilterGroup>
          </FilterRow>
        </FilterControls>
      </FilterSection>
      
      {isLoading ? (
        <LoadingIndicator>Loading analytics data...</LoadingIndicator>
      ) : (
        <TabsContainer 
          tabs={tabs} 
          defaultActiveTab="overview" 
          headerActions={
            <ExportButton 
              onClick={handleExportPDF} 
              disabled={exportingPDF}
            >
              <FiDownload size={16} />
              {exportingPDF ? 'Exporting...' : 'Export PDF'}
            </ExportButton>
          }
        />
      )}
    </AnalyticsDashboard>
  );
};

export default SurveyAnalyticsTab;
