import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { SurveyResponses, SurveyResponseDoc as BaseResponseDoc } from '../../features/surveys/api/surveyResponses';
import { FiBarChart2, FiUsers, FiCheckCircle, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';

// Extend the SurveyResponseDoc interface to include all required properties
interface SurveyResponseDoc extends BaseResponseDoc {
  sectionData?: Record<string, { completed: boolean; timeSpent?: number }>;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
}

// Styled components for the dashboard summary
const SummaryContainer = styled.div`
  margin-bottom: 32px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div<{ accentColor?: string }>`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.accentColor || '#552a47'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CardIcon = styled.div<{ bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bgColor || '#f5f0f5'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#552a47'};
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 8px 0;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  gap: 6px;
`;

const TrendUp = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #2ecc71;
  font-weight: 500;
`;

const TrendDown = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e74c3c;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const TabGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#552a47' : '#f5f0f5'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#e5d6c7'};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: string; color?: string }>`
  height: 100%;
  width: ${props => props.width};
  background: ${props => props.color || '#552a47'};
  border-radius: 4px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: right;
`;

interface SurveyDashboardSummaryProps {
  surveyId?: string;
}

const SurveyDashboardSummary: React.FC<SurveyDashboardSummaryProps> = ({ surveyId }) => {
  // Ensure surveyId is a string
  const surveyIdString = surveyId || '';
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  
  // Fetch survey and response data
  const { survey, totalResponses, completionRate, averageCompletionTime, responsesByDay, isLoading } = useTracker(() => {
    const surveySub = Meteor.subscribe('surveys.single', surveyIdString);
    const responsesSub = Meteor.subscribe('surveyResponses.bySurvey', surveyIdString);
    
    const isLoading = !surveySub.ready() || !responsesSub.ready();
    const survey = Surveys.findOne(surveyIdString);
    const responses = SurveyResponses.find({ surveyId: surveyIdString }).fetch();
    
    // Calculate metrics
    const totalResponses = responses.length;
    
    const completedResponses = responses.filter((r: SurveyResponseDoc) => r.completed).length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
    
    // Calculate average completion time (in minutes)
    const completionTimes = responses
      .filter((r: SurveyResponseDoc) => r.startTime && r.endTime)
      .map((r: SurveyResponseDoc) => (new Date(r.endTime as Date).getTime() - new Date(r.startTime).getTime()) / (1000 * 60));
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum: number, time: number) => sum + time, 0) / completionTimes.length
      : 0;
    
    // Group responses by day for the chart
    const responsesByDay: Record<string, number> = {};
    const now = new Date();
    const daysToShow = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
    
    // Initialize days
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      responsesByDay[dateString] = 0;
    }
    
    // Count responses by day
    responses.forEach((response: SurveyResponseDoc) => {
      if (response.createdAt) {
        const date = new Date(response.createdAt);
        const dateString = date.toISOString().split('T')[0];
        if (responsesByDay[dateString] !== undefined) {
          responsesByDay[dateString]++;
        }
      }
    });
    
    return {
      survey,
      totalResponses,
      completionRate,
      averageCompletionTime,
      responsesByDay,
      isLoading
    };
  }, [surveyIdString, timeframe]);
  
  if (isLoading) {
    return <div>Loading dashboard summary...</div>;
  }
  
  if (!survey) {
    return <div>Survey not found</div>;
  }
  
  // Calculate response trend (comparing to previous period)
  const calculateTrend = () => {
    const sortedDates = Object.keys(responsesByDay).sort();
    const halfwayPoint = Math.floor(sortedDates.length / 2);
    
    const recentResponses = sortedDates
      .slice(0, halfwayPoint)
      .reduce((sum, date) => sum + responsesByDay[date], 0);
    
    const previousResponses = sortedDates
      .slice(halfwayPoint)
      .reduce((sum, date) => sum + responsesByDay[date], 0);
    
    if (previousResponses === 0) return 100; // If no previous responses, show 100% increase
    
    return ((recentResponses - previousResponses) / previousResponses) * 100;
  };
  
  const responseTrend = calculateTrend();
  
  // Calculate section completion rates
  const calculateSectionCompletionRates = () => {
    // Use either sections or surveySections property
    const surveySection = survey?.sections || survey?.surveySections || [];
    if (!surveySection.length) return [];
    
    // Get all responses for this survey
    const allResponses = SurveyResponses.find({ surveyId: surveyIdString }).fetch();
    
    return surveySection.map((section: any) => {
      // Get responses for this section
      const sectionResponses = allResponses.filter((r: SurveyResponseDoc) => {
        // Check if the response has data for this section
        return r.sectionData && r.sectionData[section.id] && r.sectionData[section.id].completed;
      }).length;
      
      // Calculate completion rate
      const completionRate = totalResponses > 0 ? (sectionResponses / totalResponses) * 100 : 0;
      
      return {
        id: section.id,
        name: section.name || 'Unnamed Section',
        completionRate,
        totalResponses: sectionResponses
      };
    });
  };
  
  const sectionCompletionRates = calculateSectionCompletionRates();
  
  return (
    <SummaryContainer>
      <SummaryGrid>
        <SummaryCard accentColor="#552a47">
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
            <CardIcon bgColor="#f5f0f5" color="#552a47">
              <FiUsers size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{totalResponses}</CardValue>
          <CardFooter>
            {responseTrend > 0 ? (
              <TrendUp>
                <FiTrendingUp size={14} /> {Math.abs(responseTrend).toFixed(1)}% increase
              </TrendUp>
            ) : (
              <TrendDown>
                <FiTrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> {Math.abs(responseTrend).toFixed(1)}% decrease
              </TrendDown>
            )}
            <span>vs previous {timeframe}</span>
          </CardFooter>
        </SummaryCard>
        
        <SummaryCard accentColor="#2ecc71">
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardIcon bgColor="#eafaf1" color="#2ecc71">
              <FiCheckCircle size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{completionRate.toFixed(1)}%</CardValue>
          <CardFooter>
            Based on {totalResponses} total responses
          </CardFooter>
        </SummaryCard>
        
        <SummaryCard accentColor="#3498db">
          <CardHeader>
            <CardTitle>Avg. Completion Time</CardTitle>
            <CardIcon bgColor="#eaf2fa" color="#3498db">
              <FiClock size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{averageCompletionTime.toFixed(1)} min</CardValue>
          <CardFooter>
            Based on completed responses
          </CardFooter>
        </SummaryCard>
        
        <SummaryCard accentColor="#e67e22">
          <CardHeader>
            <CardTitle>Active Days</CardTitle>
            <CardIcon bgColor="#fef5ec" color="#e67e22">
              <FiCalendar size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>
            {survey?.startDate ? Math.max(0, Math.floor((new Date().getTime() - new Date(survey.startDate as Date).getTime()) / (1000 * 60 * 60 * 24))) : 0}
          </CardValue>
          <CardFooter>
            Since {survey?.startDate ? new Date(survey.startDate as Date).toLocaleDateString() : 'creation'}
          </CardFooter>
        </SummaryCard>
      </SummaryGrid>
      
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Response Trend</ChartTitle>
          <TabGroup>
            <TabButton 
              active={timeframe === 'week'} 
              onClick={() => setTimeframe('week')}
            >
              Last 7 Days
            </TabButton>
            <TabButton 
              active={timeframe === 'month'} 
              onClick={() => setTimeframe('month')}
            >
              Last 30 Days
            </TabButton>
            <TabButton 
              active={timeframe === 'year'} 
              onClick={() => setTimeframe('year')}
            >
              Last Year
            </TabButton>
          </TabGroup>
        </ChartHeader>
        
        {/* This would be replaced with an actual chart library like recharts */}
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          {Object.entries(responsesByDay)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .slice(-14) // Show last 14 days for visualization
            .map(([date, count]: [string, number], index: number) => {
              const maxCount = Math.max(...Object.values(responsesByDay) as number[]);
              const height = maxCount > 0 ? (count as number / maxCount) * 100 : 0;
              
              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>{count}</div>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${Math.max(5, height)}%`, 
                      backgroundColor: '#552a47',
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.7 + (index / 20)
                    }} 
                  />
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })
          }
        </div>
      </ChartContainer>
      
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Section Completion Rates</ChartTitle>
        </ChartHeader>
        
        <div>
          {sectionCompletionRates.map((section, index) => (
            <div key={section.id || index} style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#552a47' }}>{section.name}</span>
                <span style={{ fontSize: '14px', color: '#666' }}>{section.totalResponses} responses</span>
              </div>
              <ProgressContainer>
                <ProgressBar>
                  <ProgressFill 
                    width={`${section.completionRate}%`} 
                    color={section.completionRate > 75 ? '#2ecc71' : section.completionRate > 50 ? '#f39c12' : '#e74c3c'} 
                  />
                </ProgressBar>
                <ProgressLabel>{section.completionRate.toFixed(1)}%</ProgressLabel>
              </ProgressContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: '#666' }}>
                <span>Completion rate</span>
                <span>{section.totalResponses} of {totalResponses} respondents</span>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </SummaryContainer>
  );
};

export default SurveyDashboardSummary;
