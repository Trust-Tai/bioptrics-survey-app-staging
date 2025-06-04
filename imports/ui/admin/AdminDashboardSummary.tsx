import React, { useState } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { SurveyResponses } from '../../features/surveys/api/surveyResponses';
import { FiBarChart2, FiUsers, FiCheckCircle, FiClock, FiActivity, FiEdit } from 'react-icons/fi';

// Styled components for the dashboard summary
const SummaryContainer = styled.div`
  margin-bottom: 32px;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  position: relative;
  padding-bottom: 12px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #5e3b5e 0%, #7a4e7a 100%);
    border-radius: 3px;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: #552a47;
  margin: 0;
  letter-spacing: -0.5px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #5e3b5e 0%, #7a4e7a 100%);
    border-radius: 6px;
    margin-right: 4px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f4f9 100%);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(85, 42, 71, 0.08);
  padding: 28px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(85, 42, 71, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle at top right, rgba(85, 42, 71, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(85, 42, 71, 0.12);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #5e3b5e 0%, #7a4e7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 10px rgba(94, 59, 94, 0.2);
  margin-right: 4px;
  z-index: 1;
`;

const MetricTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #552a47;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  z-index: 1;
  position: relative;
`;

const MetricTrend = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.positive ? '#2ecc71' : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.positive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
  width: fit-content;
  z-index: 1;
  position: relative;
  
  &::before {
    content: ${props => props.positive ? '"↑"' : '"↓"'};
  }
`;

// const ChartsContainer = styled.div`
//   display: grid;
//   grid-template-columns: 2fr 1fr;
//   gap: 24px;
//   margin-bottom: 32px;
//   
//   @media (max-width: 992px) {
//     grid-template-columns: 1fr;
//   }
// `;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
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
  color: #552a47;
  margin: 0;
`;

// const TimeframeSelector = styled.div`
//   display: flex;
//   gap: 8px;
// `;

// const TimeframeButton = styled.button<{ active?: boolean }>`
//   background: ${props => props.active ? '#552a47' : 'transparent'};
//   color: ${props => props.active ? 'white' : '#666'};
//   border: 1px solid ${props => props.active ? '#552a47' : '#ddd'};
//   border-radius: 4px;
//   padding: 6px 12px;
//   font-size: 14px;
//   cursor: pointer;
//   transition: all 0.2s;
//   
//   &:hover {
//     background: ${props => props.active ? '#552a47' : '#f5f5f5'};
//   }
// `;

// const COLORS = ['#552a47', '#8e44ad', '#3498db', '#2ecc71', '#f39c12', '#e74c3c'];

interface AdminDashboardSummaryProps {
  organizationId?: string;
}

const AdminDashboardSummary: React.FC<AdminDashboardSummaryProps> = ({ organizationId }) => {
  const [timeframe /*, setTimeframe*/] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Fetch dashboard data
  const { 
    totalSurveys,
    activeSurveys,
    totalResponses,
    completionRate,
    averageTimeSpent,
    // responseData,
    // surveyTypeData,
    recentActivity
  } = useTracker(() => {
    const surveysSub = Meteor.subscribe('surveys.all');
    const responsesSub = Meteor.subscribe('surveyResponses.all');
    
    if (!surveysSub.ready() || !responsesSub.ready()) {
      return { 
        totalSurveys: 0,
        activeSurveys: 0,
        totalResponses: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        responseData: [],
        surveyTypeData: [],
        recentActivity: []
      };
    }
    
    // Get all surveys, filtered by organization if provided
    const query = organizationId ? { organizationId } : {};
    const allSurveys = Surveys.find(query).fetch();
    
    // Get active surveys (published and not expired)
    const now = new Date();
    const active = allSurveys.filter(s => 
      s.published && 
      (!s.endDate || new Date(s.endDate) > now)
    );
    
    // Get all responses
    const allResponses = SurveyResponses.find({}).fetch();
    
    // Calculate completion rate
    const completed = allResponses.filter(r => r.completed).length;
    const completionRate = allResponses.length > 0 
      ? Math.round((completed / allResponses.length) * 100) 
      : 0;
    
    // Calculate average time spent
    const timesSpent = allResponses
      .filter(r => r.completionTime)
      .map(r => r.completionTime || 0);
    
    const averageTimeSpent = timesSpent.length > 0
      ? Math.round(timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length)
      : 0;
    
    // Prepare response data for chart
    // This would typically be grouped by date
    const responseData = generateResponseData(timeframe);
    
    // Prepare survey type data for pie chart
    const surveyTypeData = [
      { name: 'Employee Engagement', value: Math.round(allSurveys.length * 0.4) },
      { name: 'Pulse Surveys', value: Math.round(allSurveys.length * 0.3) },
      { name: 'Exit Interviews', value: Math.round(allSurveys.length * 0.15) },
      { name: 'Onboarding', value: Math.round(allSurveys.length * 0.1) },
      { name: 'Other', value: allSurveys.length - (
        Math.round(allSurveys.length * 0.4) + 
        Math.round(allSurveys.length * 0.3) + 
        Math.round(allSurveys.length * 0.15) + 
        Math.round(allSurveys.length * 0.1)
      ) }
    ].filter(item => item.value > 0);
    
    // Generate recent activity (this would typically come from a real activity log)
    const recentActivity = generateRecentActivity();
    
    return {
      totalSurveys: allSurveys.length,
      activeSurveys: active.length,
      totalResponses: allResponses.length,
      completionRate,
      averageTimeSpent,
      responseData,
      surveyTypeData,
      recentActivity
    };
  }, [timeframe, organizationId]);
  
  // Helper function to generate mock response data
  const generateResponseData = (timeframe: 'week' | 'month' | 'quarter') => {
    let days: number;
    let interval: string;
    
    switch (timeframe) {
      case 'week':
        days = 7;
        interval = 'day';
        break;
      case 'month':
        days = 30;
        interval = 'day';
        break;
      case 'quarter':
        days = 90;
        interval = 'week';
        break;
    }
    
    return Array.from({ length: interval === 'day' ? days : Math.ceil(days / 7) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (interval === 'day' ? i : i * 7));
      
      return {
        name: interval === 'day' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `Week ${Math.ceil(days / 7) - i}`,
        responses: Math.floor(Math.random() * 50) + 10,
        completions: Math.floor(Math.random() * 40) + 5
      };
    }).reverse();
  };
  
  // Helper function to generate mock recent activity
  const generateRecentActivity = () => {
    const activities = [
      { type: 'survey_created', message: 'New survey created: Employee Engagement 2023' },
      { type: 'survey_published', message: 'Survey published: Customer Satisfaction Q2' },
      { type: 'response_received', message: '15 new responses received for Exit Interview' },
      { type: 'survey_completed', message: 'Survey completed: Department Pulse Check' },
      { type: 'survey_edited', message: 'Survey edited: Onboarding Experience' }
    ];
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 48));
      
      return {
        ...activities[i],
        timestamp: date
      };
    });
  };
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <SummaryContainer>
      <SummaryHeader>
        <SummaryTitle>Dashboard Overview</SummaryTitle>
      </SummaryHeader>
      
      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiBarChart2 size={20} />
            </MetricIcon>
            <MetricTitle>Total Surveys</MetricTitle>
          </MetricHeader>
          <MetricValue>{totalSurveys}</MetricValue>
          <MetricTrend positive={true}>12% from last month</MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiActivity size={20} />
            </MetricIcon>
            <MetricTitle>Active Surveys</MetricTitle>
          </MetricHeader>
          <MetricValue>{activeSurveys}</MetricValue>
          <MetricTrend positive={true}>3 more than last month</MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiUsers size={20} />
            </MetricIcon>
            <MetricTitle>Total Responses</MetricTitle>
          </MetricHeader>
          <MetricValue>{totalResponses}</MetricValue>
          <MetricTrend positive={true}>28% from last month</MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiCheckCircle size={20} />
            </MetricIcon>
            <MetricTitle>Completion Rate</MetricTitle>
          </MetricHeader>
          <MetricValue>{completionRate}%</MetricValue>
          <MetricTrend positive={completionRate >= 75}>5% from last month</MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiClock size={20} />
            </MetricIcon>
            <MetricTitle>Average Time Spent</MetricTitle>
          </MetricHeader>
          <MetricValue>{formatTime(averageTimeSpent)}</MetricValue>
          <MetricTrend positive={false}>2m longer than last month</MetricTrend>
        </MetricCard>
      </MetricsGrid>
      
      {/* Charts container removed to avoid duplicate sections */}
      {/* These sections have been moved to the main dashboard */}
      
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Recent Activity</ChartTitle>
        </ChartHeader>
        
        <div>
          {recentActivity.map((activity, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: index < recentActivity.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: '#f9f4f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#552a47'
                }}>
                  {activity.type === 'survey_created' && <FiBarChart2 size={18} />}
                  {activity.type === 'survey_published' && <FiUsers size={18} />}
                  {activity.type === 'response_received' && <FiCheckCircle size={18} />}
                  {activity.type === 'survey_completed' && <FiActivity size={18} />}
                  {activity.type === 'survey_edited' && <FiEdit size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{activity.message}</div>
                </div>
              </div>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {activity.timestamp.toLocaleString('en-US', { 
                  hour: 'numeric', 
                  minute: 'numeric',
                  hour12: true,
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </SummaryContainer>
  );
};

export default AdminDashboardSummary;
