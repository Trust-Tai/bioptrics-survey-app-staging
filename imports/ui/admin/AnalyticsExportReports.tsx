import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { useTheme } from '/imports/contexts/ThemeContext';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { FaChevronDown, FaFilter, FaFileDownload, FaChartBar, FaCheck, FaChartLine, FaUsers, FaPercentage, FaClock } from 'react-icons/fa';
import { FiAlertCircle, FiInfo } from 'react-icons/fi';
import { Surveys, SurveyDoc } from '/imports/features/surveys/api/surveys';
import { useTracker } from 'meteor/react-meteor-data';
import { generateAnalyticsExportPDF, SurveyAnalyticsData } from '/imports/features/surveys/services/AnalyticsExportPDF';
import { useResponseRateData } from '/imports/features/surveys/hooks/useResponseRateData';
import { useParticipantData } from '/imports/features/surveys/hooks/useParticipantData';
import { useCompletionTimeData } from '/imports/features/surveys/hooks/useCompletionTimeData';
import { ResponseRateService } from '/imports/features/surveys/services/ResponseRateService';

// Interface for analytics question data
interface AnalyticsQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  progress: Record<string, number>;
  latestResponses?: Array<{
    answer: string;
    date: Date;
  }>;
}

// Styled Components
const Container = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.textColor || '#333'};
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor ? `${theme.textColor}80` : '#666'};
  margin: 0;
  font-weight: 400;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  align-items: center;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundColor || '#f8f8f8'};
  border: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}20` : '#e0e0e0'};
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textColor || '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  
  svg {
    margin-right: 10px;
    font-size: 16px;
    color: ${({ theme }) => theme.primaryColor || '#552a47'};
  }
  
  .chevron {
    margin-left: 10px;
    margin-right: 0;
    opacity: 0.6;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundColor ? `${theme.backgroundColor}90` : '#f2f2f2'};
    border-color: ${({ theme }) => theme.accentColor ? `${theme.accentColor}30` : '#d0d0d0'};
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.primaryColor || '#552a47'};
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.primaryColor ? `${theme.primaryColor}90` : '#46223b'};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundColor || '#f8f8f8'};
  border: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}20` : '#e0e0e0'};
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textColor || '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  
  svg {
    margin-right: 8px;
    font-size: 16px;
    color: ${({ theme }) => theme.primaryColor || '#552a47'};
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundColor ? `${theme.backgroundColor}90` : '#f2f2f2'};
    border-color: ${({ theme }) => theme.accentColor ? `${theme.accentColor}30` : '#d0d0d0'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const ResultsCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 48px 32px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}15` : '#e8e8e8'};
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  &.has-results {
    padding: 32px;
    align-items: stretch;
    text-align: left;
    justify-content: flex-start;
  }
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.textColor ? `${theme.textColor}20` : '#e0e0e0'};
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  
  svg {
    opacity: 0.6;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor || '#333'};
  margin-bottom: 12px;
  letter-spacing: -0.3px;
`;

const EmptyStateText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.textColor ? `${theme.textColor}70` : '#777'};
  max-width: 450px;
  margin: 0 auto;
`;

// Question visualization components
const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
`;

const QuestionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 28px;
  width: 100%;
  margin-bottom: 24px;
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const QuestionType = styled.div`
  display: inline-flex;
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.primaryColor || '#552a47'};
  color: white;
`;

const FlagsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Flag = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.type === 'high-neutral' ? '#f59e0b' : '#ef4444'};
  background-color: ${props => props.type === 'high-neutral' ? '#fef3c7' : '#fee2e2'};
  padding: 2px 8px;
  border-radius: 4px;
`;

const BarChartContainer = styled.div`
  margin-bottom: 16px;
`;

const BarContainer = styled.div`
  display: flex;
  height: 32px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
`;

const Bar = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  height: 100%;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding: 4px 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  color: #64748b;
`;

const LatestResponsesContainer = styled.div`
  margin-top: 24px;
`;

const ResponsesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
`;

const ResponseItem = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 4px;
`;

const ResponseText = styled.div`
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
`;

const ResponseDate = styled.div`
  font-size: 12px;
  color: #64748b;
  font-style: italic;
`;

const SurveyTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.textColor || '#333'};
  margin: 24px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}15` : '#e8e8e8'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin: 16px 0;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}20` : '#e8e8e8'};
  margin-top: 8px;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}15` : '#f0f0f0'};
  font-weight: 600;
  color: ${({ theme }) => theme.textColor || '#333'};
  font-size: 15px;
`;

const DropdownList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const DropdownItem = styled.div<{ isSelected: boolean }>`
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: ${props => props.isSelected ? props.theme.primaryColor + '08' : 'white'};
  transition: all 0.15s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundColor || '#f8f8f8'};
  }
  
  .survey-title {
    font-size: 14px;
    color: ${({ theme }) => theme.textColor || '#333'};
    font-weight: ${props => props.isSelected ? '500' : '400'};
  }
  
  .check-icon {
    color: ${({ theme }) => theme.primaryColor || '#552a47'};
  }
`;

const DropdownFooter = styled.div`
  padding: 14px 18px;
  border-top: 1px solid ${({ theme }) => theme.accentColor ? `${theme.accentColor}15` : '#f0f0f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primaryColor || '#552a47'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SelectedCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textColor ? `${theme.textColor}70` : '#777'};
  font-weight: 500;
`;

// KPI Stats Styled Components
const KpiSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
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

// KPI Content Components
// ParticipantsContent component to display dynamic participant count
interface ParticipantsContentProps {
  surveyIds: string[];
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({ surveyIds }) => {
  const [count, setCount] = useState<number>(0);
  const [trend, setTrend] = useState<{ value: number; direction: 'positive' | 'negative' | 'neutral' }>({ 
    value: 0, 
    direction: 'neutral' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (surveyIds.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    // Call the new method that properly counts both completed and incomplete responses
    console.log('Calling getTotalParticipantsCount with surveyIds:', surveyIds);
    Meteor.call('getTotalParticipantsCount', surveyIds, (error: any, result: number) => {
      if (error) {
        console.error('Error fetching participant count:', error);
        setError(error);
        setIsLoading(false);
      } else {
        console.log(`Total participants for selected surveys (${surveyIds.join(', ')}):`, result);
        setCount(result);
      
        // For trend data, we'll use the first survey ID or calculate aggregate trend
        if (surveyIds.length === 1) {
          // For a single survey, use its trend directly
          ResponseRateService.getParticipantCountTrend(surveyIds[0])
            .then(trendResult => {
              setTrend(trendResult);
            })
            .catch(error => {
              console.error('Error fetching participant trend:', error);
              setError(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else if (surveyIds.length > 1) {
          // For multiple surveys, calculate an aggregate trend
          Promise.all(surveyIds.map(id => ResponseRateService.getParticipantCountTrend(id)))
            .then(trendResults => {
              // Calculate average trend value
              const avgValue = trendResults.reduce((sum, curr) => sum + curr.value, 0) / trendResults.length;
              
              // Determine overall direction based on average value
              const direction = avgValue > 0 ? 'positive' : avgValue < 0 ? 'negative' : 'neutral';
              
              setTrend({
                value: Math.round(avgValue),
                direction
              });
            })
            .catch(error => {
              console.error('Error fetching participant trends:', error);
              setError(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }
    });
  }, [surveyIds]);
  
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

// ResponseRateContent component to display dynamic response rate
interface ResponseRateContentProps {
  surveyIds: string[];
}

const ResponseRateContent: React.FC<ResponseRateContentProps> = ({ surveyIds }) => {
  const [rate, setRate] = useState<number>(0);
  const [trend, setTrend] = useState<{ value: number; direction: 'positive' | 'negative' | 'neutral' }>({ 
    value: 0, 
    direction: 'neutral' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (surveyIds.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    // Call the filtered response rate method with proper parameter format
    // The method expects an object with surveyIds, tagIds, etc.
    Meteor.call('getFilteredResponseRate', surveyIds, [], [], null, null, (error: any, result: number) => {
      if (error) {
        console.error('Error fetching response rate:', error);
        setError(error);
        setIsLoading(false);
      } else {
        console.log(`Response rate for selected surveys (${surveyIds.join(', ')}):`, result + '%');
        setRate(result);
      
        // For trend data, handle both single and multiple survey selections
        if (surveyIds.length === 1) {
          // For a single survey, use its trend directly
          ResponseRateService.getResponseRateTrend(surveyIds[0])
            .then(trendResult => {
              setTrend(trendResult);
            })
            .catch(error => {
              console.error('Error fetching response rate trend:', error);
              setError(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else if (surveyIds.length > 1) {
          // For multiple surveys, calculate an aggregate trend
          Promise.all(surveyIds.map(id => ResponseRateService.getResponseRateTrend(id)))
            .then(trendResults => {
              // Calculate average trend value
              const avgValue = trendResults.reduce((sum, curr) => sum + curr.value, 0) / trendResults.length;
              
              // Determine overall direction based on average value
              const direction = avgValue > 0 ? 'positive' : avgValue < 0 ? 'negative' : 'neutral';
              
              setTrend({
                value: Math.round(avgValue),
                direction
              });
            })
            .catch(error => {
              console.error('Error fetching response rate trends:', error);
              setError(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }
    });
  }, [surveyIds]);
  
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

// CompletionTimeContent component to display dynamic completion time
interface CompletionTimeContentProps {
  surveyIds: string[];
}

const CompletionTimeContent: React.FC<CompletionTimeContentProps> = ({ surveyIds }) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [trend, setTrend] = useState<{ value: number; direction: 'positive' | 'negative' | 'neutral' }>({ 
    value: 0, 
    direction: 'neutral' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (surveyIds.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    // Call the new accurate completion time method
    Meteor.call('getAccurateCompletionTime', surveyIds, (error: any, result: number) => {
      if (error) {
        console.error('Error fetching accurate completion time:', error);
        setError(error);
        setIsLoading(false);
      } else {
        console.log(`Accurate completion time for selected surveys (${surveyIds.join(', ')}):`, result, 'seconds');
        setSeconds(result);
      
        // For trend data, we'll use the first survey ID
        if (surveyIds.length > 0) {
          ResponseRateService.getCompletionTimeTrend(surveyIds[0])
            .then(trendResult => {
              setTrend(trendResult);
            })
            .catch(error => {
              console.error('Error fetching completion time trend:', error);
              setError(error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }
    });
  }, [surveyIds]);
  
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '00:00';
    
    // The backend now returns time in seconds
    // Convert to minutes:seconds format
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    
    // Format as MM:SS style (with two digits for both minutes and seconds)
    // This will match the format in the Analytics Dashboard
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <KpiValue>{formatTime(seconds)}</KpiValue>
      <KpiTrend trend={trend.direction === 'positive' ? 'negative' : trend.direction === 'negative' ? 'positive' : 'neutral'}>
        {formatTrend(trend.value)}% <span>vs prev. period</span>
      </KpiTrend>
    </>
  );
};

// Type guard to ensure survey ID is a string
const isSurveyIdDefined = (id: string | undefined): id is string => {
  return id !== undefined;
};

// Base color mapping for common response categories
const baseColorMap = {
  'Strongly Disagree': '#ef4444', // Red
  'Disagree': '#f97316', // Orange
  'Neutral': '#6b7280', // Gray
  'Neither Agree nor Disagree': '#6b7280', // Gray (same as Neutral)
  'Agree': '#10b981', // Green
  'Strongly Agree': '#059669', // Dark Green
};

// Predefined colors for dynamic options
const predefinedColors = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#6b7280', // Gray
  '#3b82f6', // Blue
  '#10b981', // Green
  '#059669', // Dark Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#0891b2', // Cyan
];

// Function to get color for any option name
const getColorForOption = (optionName: string): string => {
  // First check if we have a predefined color
  if (baseColorMap[optionName as keyof typeof baseColorMap]) {
    return baseColorMap[optionName as keyof typeof baseColorMap];
  }
  
  // For custom options, hash the name to get a consistent color
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Use the hash to select a color from our predefined list
  const colorIndex = hashCode(optionName) % predefinedColors.length;
  return predefinedColors[colorIndex];
};

const AnalyticsExportReports: React.FC = () => {
  const themeContext = useTheme();
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State for analytics questions
  const [analyticsQuestions, setAnalyticsQuestions] = useState<Record<string, AnalyticsQuestion[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  
  // Fetch surveys from the database
  const { surveys, surveysLoading } = useTracker(() => {
    const handle = Meteor.subscribe('surveys.all');
    const surveyData = Surveys.find({}, { sort: { title: 1 } }).fetch();
    return {
      surveys: surveyData,
      surveysLoading: !handle.ready(),
    };
  }, []);
  
  // Fetch question data when surveys are selected
  useEffect(() => {
    if (selectedSurveys.length > 0) {
      setLoadingQuestions(true);
      
      // Process each selected survey
      selectedSurveys.forEach(surveyId => {
        Meteor.call(
          'AnalyticsQuestionGetTitles',
          surveyId,
          (error: any, result: AnalyticsQuestion[]) => {
            if (error) {
              console.error(`Error fetching questions for survey ${surveyId}:`, error);
            } else {
              console.log(`Fetched questions for survey ${surveyId}:`, result);
              setAnalyticsQuestions(prev => ({
                ...prev,
                [surveyId]: result || []
              }));
            }
            setLoadingQuestions(false);
          }
        );
      });
    } else {
      // Reset questions when no surveys are selected
      setAnalyticsQuestions({});
    }
  }, [selectedSurveys]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleSurveySelection = (surveyId: string) => {
    setSelectedSurveys(prev => {
      if (prev.includes(surveyId)) {
        return prev.filter(id => id !== surveyId);
      } else {
        return [...prev, surveyId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (!surveysLoading && surveys.length > 0) {
      // Filter out undefined IDs and cast to string[]
      const definedIds = surveys
        .map((survey: SurveyDoc) => survey._id)
        .filter(isSurveyIdDefined);
      
      setSelectedSurveys(definedIds);
    }
  };
  
  const handleClearAll = () => {
    setSelectedSurveys([]);
  };
  
  const handleExportPDF = () => {
    if (selectedSurveys.length === 0) {
      alert('Please select at least one survey to export');
      return;
    }
    
    // Check if we have question data for all selected surveys
    const missingSurveys = selectedSurveys.filter(id => !analyticsQuestions[id]);
    if (missingSurveys.length > 0) {
      setLoadingQuestions(true);
      
      // Fetch missing question data
      const promises = missingSurveys.map(surveyId => 
        new Promise<void>((resolve) => {
          Meteor.call(
            'AnalyticsQuestionGetTitles',
            surveyId,
            (error: any, result: AnalyticsQuestion[]) => {
              if (error) {
                console.error(`Error fetching questions for survey ${surveyId}:`, error);
              } else {
                setAnalyticsQuestions(prev => ({
                  ...prev,
                  [surveyId]: result || []
                }));
              }
              resolve();
            }
          );
        })
      );
      
      // Generate PDF after all data is fetched
      Promise.all(promises).then(() => {
        setLoadingQuestions(false);
        generatePDF();
      });
    } else {
      // We already have all the data, generate PDF immediately
      generatePDF();
    }
  };
  
  // Function to generate the PDF
  const generatePDF = () => {
    // Prepare data for PDF generation
    const surveyIds = selectedSurveys
      .filter(surveyId => {
        const questions = analyticsQuestions[surveyId] || [];
        // Check if survey has any questions with responses
        return questions.some(question => {
          if (['text', 'textarea', 'date'].includes(question.questionType)) {
            return question.latestResponses && question.latestResponses.length > 0;
          }
          return Object.values(question.progress).some(value => value > 0);
        });
      });
    
    // Check if there are any surveys with data to export
    if (surveyIds.length === 0) {
      alert('No data available for the selected surveys. Please select surveys with response data.');
      return;
    }
    
    // Set loading state
    setLoadingQuestions(true);
    
    // Fetch survey data with sections for each survey
    const surveyPromises = surveyIds.map(surveyId => 
      new Promise<any>((resolve) => {
        Meteor.call('surveys.getSurvey', surveyId, (error: any, surveyData: any) => {
          if (error) {
            console.error(`Error fetching survey data for ${surveyId}:`, error);
            resolve(null);
          } else {
            const questions = analyticsQuestions[surveyId] || [];
            
            // Filter questions to only include those with responses
            const filteredQuestions = questions.filter(question => {
              if (['text', 'textarea', 'date'].includes(question.questionType)) {
                return question.latestResponses && question.latestResponses.length > 0;
              }
              return Object.values(question.progress).some(value => value > 0);
            });
            
            resolve({
              surveyId,
              surveyTitle: surveyData.title || 'Untitled Survey',
              questions: filteredQuestions,
              surveySections: surveyData.surveySections || [],
              sectionQuestions: surveyData.sectionQuestions || []
            });
          }
        });
      })
    );
    
    // When all survey data is fetched, generate the PDF
    Promise.all(surveyPromises).then((results) => {
      setLoadingQuestions(false);
      
      // Filter out null results (failed fetches)
      const surveyData = results.filter(Boolean) as SurveyAnalyticsData[];
      
      if (surveyData.length === 0) {
        alert('Failed to fetch survey data. Please try again.');
        return;
      }
      
      // Generate the PDF
      generateAnalyticsExportPDF({
        reportTitle: 'Survey Analytics Report',
        date: new Date().toLocaleDateString(),
        logoUrl: '/bioptrics_fixed_black.png',
        surveys: surveyData
      });
      
      console.log('Exporting PDF with selected surveys:', 
        surveyData.map(s => s.surveyTitle));
    });
  };

  return (
    <AdminLayout>
      <ThemeProvider theme={themeContext}>
        <Container>
          <Header>
            <Title>Results</Title>
            <Subtitle>Analyze survey responses and generate insights</Subtitle>
          </Header>
          
          <ActionBar>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <SelectButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FaChartBar />
                {selectedSurveys.length > 0 ? `${selectedSurveys.length} Sources Selected` : 'Select Sources'}
                <FaChevronDown className="chevron" />
              </SelectButton>
              
              {isDropdownOpen && (
                <DropdownContainer>
                  <DropdownHeader>Select Survey Sources</DropdownHeader>
                  <DropdownList>
                    {surveysLoading ? (
                      <DropdownItem isSelected={false}>Loading surveys...</DropdownItem>
                    ) : surveys.length === 0 ? (
                      <DropdownItem isSelected={false}>No surveys available</DropdownItem>
                    ) : (
                      surveys.map((survey: SurveyDoc) => {
                        const surveyId = survey._id;
                        return surveyId ? (
                          <DropdownItem 
                            key={surveyId} 
                            isSelected={selectedSurveys.includes(surveyId)}
                            onClick={() => toggleSurveySelection(surveyId)}
                          >
                            <span className="survey-title">{survey.title}</span>
                            {selectedSurveys.includes(surveyId) && (
                              <FaCheck className="check-icon" />
                            )}
                          </DropdownItem>
                        ) : null;
                      })
                    )}
                  </DropdownList>
                  <DropdownFooter>
                    <SelectedCount>{selectedSurveys.length} selected</SelectedCount>
                    <div>
                      <FooterButton onClick={handleClearAll}>Clear</FooterButton>
                      {' | '}
                      <FooterButton onClick={handleSelectAll}>Select All</FooterButton>
                    </div>
                  </DropdownFooter>
                </DropdownContainer>
              )}
            </div>
            
            <ButtonGroup>
              {/* <FilterButton>
                <FaFilter />
                Filters
              </FilterButton> */}
              
              <ExportButton 
                onClick={handleExportPDF}
                style={{ opacity: selectedSurveys.length === 0 ? 0.6 : 1 }}
              >
                <FaFileDownload />
                Export PDF
              </ExportButton>
            </ButtonGroup>
          </ActionBar>
          
          {/* KPI Stats Section */}
          {selectedSurveys.length > 0 && (
            <KpiSection>
              {/* Total Participants KPI */}
              <KpiCard>
                <KpiIcon>
                  <FaUsers size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Total Participants</h4>
                  <ParticipantsContent surveyIds={selectedSurveys} />
                </KpiContent>
              </KpiCard>
              
              {/* Response Rate KPI */}
              <KpiCard>
                <KpiIcon>
                  <FaPercentage size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Response Rate</h4>
                  <ResponseRateContent surveyIds={selectedSurveys} />
                </KpiContent>
              </KpiCard>
              
              {/* Avg. Completion Time KPI */}
              <KpiCard>
                <KpiIcon>
                  <FaClock size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Avg. Completion Time</h4>
                  <CompletionTimeContent surveyIds={selectedSurveys} />
                </KpiContent>
              </KpiCard>
            </KpiSection>
          )}
          
          <ResultsCard className={selectedSurveys.length > 0 ? 'has-results' : ''}>
            {selectedSurveys.length > 0 ? (
              loadingQuestions ? (
                <LoadingContainer>Loading question data...</LoadingContainer>
              ) : (
                <QuestionContainer>
                  {selectedSurveys.map(surveyId => {
                    const questions = analyticsQuestions[surveyId] || [];
                    const survey = surveys.find(s => s._id === surveyId);
                    
                    return (
                      <div key={surveyId}>
                        <SurveyTitle>{survey?.title || 'Survey'}</SurveyTitle>
                        
                        {questions.length === 0 ? (
                          <EmptyState>No questions found for this survey.</EmptyState>
                        ) : (
                          // Filter questions to only show those with responses
                          questions
                            .filter(question => {
                              // For text/textarea/date questions, check if there are any responses
                              if (['text', 'textarea', 'date'].includes(question.questionType)) {
                                return question.latestResponses && question.latestResponses.length > 0;
                              }
                              // For other question types, check if there are any non-zero values in progress
                              return Object.values(question.progress).some(value => value > 0);
                            })
                            .map(question => (
                            <QuestionCard key={question.questionId}>
                              <QuestionText>
                                <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                <QuestionType>{question.questionType}</QuestionType>
                              </QuestionText>
                              
                              {/* For text, textarea, and date questions, show latest responses */}
                              {(question.questionType === 'text' || 
                                question.questionType === 'textarea' || 
                                question.questionType === 'date') && question.latestResponses ? (
                                <LatestResponsesContainer>
                                  
                                  
                                  <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 500, 
                                    color: '#4b5563',
                                    marginBottom: '8px'
                                  }}>
                                    Latest Responses ({question.latestResponses.length})
                                  </div>
                                  
                                  {question.latestResponses.length > 0 ? (
                                    <ResponsesList>
                                      {question.latestResponses.map((response, index) => (
                                        <ResponseItem key={index}>
                                          <ResponseText>{response.answer}</ResponseText>
                                          <ResponseDate>
                                            {new Date(response.date).toLocaleDateString()} {new Date(response.date).toLocaleTimeString()}
                                          </ResponseDate>
                                        </ResponseItem>
                                      ))}
                                    </ResponsesList>
                                  ) : (
                                    <div style={{ 
                                      padding: '20px 0', 
                                      textAlign: 'center', 
                                      color: '#666',
                                      backgroundColor: '#f9fafb',
                                      borderRadius: '4px',
                                      border: '1px dashed #d1d5db'
                                    }}>
                                      <p style={{ margin: 0 }}>No responses yet</p>
                                    </div>
                                  )}
                                </LatestResponsesContainer>
                              ) : (
                                /* For other question types, show progress bars */
                                <BarChartContainer>
                                  {/* Check if there are any non-zero responses */}
                                  {Object.values(question.progress).some(value => value > 0) ? (
                                    <>
                                      <BarContainer>
                                        {Object.entries(question.progress).map(([label, percentage]) => (
                                          <Bar 
                                            key={label} 
                                            width={percentage} 
                                            color={getColorForOption(label)}
                                          />
                                        ))}
                                      </BarContainer>
                                      
                                      <LegendContainer>
                                        {Object.entries(question.progress).map(([label, percentage]) => (
                                          <LegendItem key={label}>
                                            <LegendColor color={getColorForOption(label)} />
                                            {label}: {percentage}%
                                          </LegendItem>
                                        ))}
                                      </LegendContainer>
                                    </>
                                  ) : (
                                    <div style={{ 
                                      padding: '20px 0', 
                                      textAlign: 'center', 
                                      color: '#666',
                                      backgroundColor: '#f9fafb',
                                      borderRadius: '4px',
                                      border: '1px dashed #d1d5db',
                                      marginBottom: '10px'
                                    }}>
                                      <p style={{ margin: 0 }}>No responses yet</p>
                                    </div>
                                  )}
                                </BarChartContainer>
                              )}
                            </QuestionCard>
                          ))
                        )}
                        
                        {/* Show message if all questions were filtered out due to no responses */}
                        {questions.length > 0 && 
                         questions.filter(q => {
                           if (['text', 'textarea', 'date'].includes(q.questionType)) {
                             return q.latestResponses && q.latestResponses.length > 0;
                           }
                           return Object.values(q.progress).some(value => value > 0);
                         }).length === 0 && (
                          <EmptyState>No responses available for this survey yet.</EmptyState>
                        )}
                      </div>
                    );
                  })}
                </QuestionContainer>
              )
            ) : (
              <>
                <EmptyStateIcon>
                  <FaChartLine size={42} />
                </EmptyStateIcon>
                <EmptyStateTitle>Select Sources to View Results</EmptyStateTitle>
                <EmptyStateText>
                  Choose one or more survey sources to analyze results and generate insights.
                </EmptyStateText>
              </>
            )}
          </ResultsCard>
        </Container>
      </ThemeProvider>
    </AdminLayout>
  );
};

export default AnalyticsExportReports;
