import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  FiClock, 
  FiUsers, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiActivity,
  FiMap,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiGlobe,
  FiCpu
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// Import from features
import { SurveyResponses } from '../../../../features/surveys/api/surveyResponses';
import { Surveys } from '../../../../features/surveys/api/surveys';
import { IncompleteSurveyResponses } from '../../../../features/surveys/api/incompleteSurveyResponses';

// Types
interface RealTimeMetrics {
  activeUsers: number;
  completedSurveys: number;
  averageCompletionTime: number;
  dropoutRate: number;
  questionsAnswered: number;
  responseRate: number;
}

interface ActiveUser {
  id: string;
  surveyId: string;
  surveyTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  startTime: Date;
  lastActivity: Date;
  progress: number;
  device: string;
  browser: string;
  location?: string;
}

interface QuestionMetric {
  questionId: string;
  questionText: string;
  averageTimeSpent: number;
  dropoutCount: number;
  responseCount: number;
}

interface SectionMetric {
  sectionId: string;
  sectionTitle: string;
  averageTimeSpent: number;
  dropoutCount: number;
  completionRate: number;
}

interface DeviceDistribution {
  device: string;
  count: number;
  percentage: number;
}

// Styled components
const Container = styled.div`
  margin-top: 24px;
  width: 100%;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #4a90e2;
  }
`;

const ChartWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 300px;
`;

const SmallChartWrapper = styled(ChartWrapper)`
  height: 200px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChartGridThree = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0;
    font-size: 14px;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: #552a47;
    }
  }
  
  .value {
    font-size: 28px;
    font-weight: 600;
    margin: 12px 0 8px;
    color: #2d3748;
  }
  
  .change {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.positive {
      color: #48bb78;
    }
    
    &.negative {
      color: #e53e3e;
    }
  }
`;

const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: #552a47;
    }
  }
`;

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: #552a47;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }
    
    td {
      font-size: 14px;
      color: #2d3748;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  
  &:after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: #552a47;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const GradientChartContainer = styled.div`
  background: linear-gradient(to bottom right, #f7f9fc, #edf2f7);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  height: 300px;
`;

const TransparentChartContainer = styled.div`
  background: transparent;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  height: 300px;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: #f7fafc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  font-size: 14px;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface RealTimeAnalyticsProps {
  surveyId?: string;
  isLoading?: boolean;
  isBlurred?: boolean;
}

const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ 
  surveyId,
  isLoading = false,
  isBlurred = false
}) => {
  // Simulate real-time data with useState and useEffect
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    completedSurveys: 0,
    averageCompletionTime: 0,
    dropoutRate: 0,
    questionsAnswered: 0,
    responseRate: 0
  });
  
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [questionMetrics, setQuestionMetrics] = useState<QuestionMetric[]>([]);
  const [sectionMetrics, setSectionMetrics] = useState<SectionMetric[]>([]);
  const [deviceDistribution, setDeviceDistribution] = useState<DeviceDistribution[]>([]);
  
  // Get real data from Meteor collections
  const { surveys, responses, incompleteResponses, loading } = useTracker(() => {
    // First try the specific publications
    const surveysHandle = Meteor.subscribe('surveys');
    
    // For responses, try both specific and general publications
    let responsesHandle;
    try {
      responsesHandle = surveyId
        ? Meteor.subscribe('responses.bySurvey', surveyId)
        : Meteor.subscribe('surveyResponses');
    } catch (e) {
      console.log('Error subscribing to responses:', e);
      responsesHandle = { ready: () => true }; // Fallback to prevent blocking
    }
    
    // For incomplete responses, try both specific and general publications
    let incompleteHandle;
    try {
      incompleteHandle = surveyId
        ? Meteor.subscribe('incompleteSurveyResponses.bySurvey', surveyId)
        : Meteor.subscribe('incompleteSurveyResponses.all');
    } catch (e) {
      console.log('Error subscribing to incomplete responses:', e);
      incompleteHandle = { ready: () => true }; // Fallback to prevent blocking
    }
    
    // Check if subscriptions are ready
    const isLoading = !surveysHandle.ready() || !responsesHandle.ready() || !incompleteHandle.ready();
    
    const responsesQuery = surveyId ? { surveyId } : {};
    const incompleteQuery = surveyId ? { surveyId } : {};
    
    return {
      surveys: Surveys.find({}).fetch(),
      responses: SurveyResponses.find(responsesQuery).fetch(),
      incompleteResponses: IncompleteSurveyResponses.find(incompleteQuery).fetch() || [],
      loading: isLoading,
    };
  }, [surveyId]);
  
  // Simulate real-time data updates
  useEffect(() => {
    if (loading) return;
    
    // Calculate metrics from actual data
    const totalResponses = responses.length + incompleteResponses.length;
    const completedCount = responses.length;
    
    // Get completion times from responses if available
    const completionTimes = responses
      .filter((r: any) => r.startTime && r.endTime)
      .map((r: any) => {
        const start = new Date(r.startTime).getTime();
        const end = new Date(r.endTime).getTime();
        return (end - start) / 1000 / 60; // minutes
      });
    
    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum: number, time: number) => sum + time, 0) / completionTimes.length
      : 0;
    
    // Calculate dropout rate
    const dropoutRate = totalResponses > 0
      ? (incompleteResponses.length / totalResponses) * 100
      : 0;
    
    // Set metrics based on real data
    setMetrics({
      activeUsers: Math.min(incompleteResponses.length, 15), // Assume some are active now
      completedSurveys: completedCount,
      averageCompletionTime: avgCompletionTime,
      dropoutRate,
      questionsAnswered: responses.reduce((sum: number, r: any) => sum + (r.answers?.length || 0), 0),
      responseRate: totalResponses > 0 ? (completedCount / totalResponses) * 100 : 0
    });
    
    // Generate mock active users based on incomplete responses
    const mockActiveUsers = incompleteResponses.slice(0, 10).map((r: any, index: number) => {
      const survey = surveys.find((s: any) => s._id === r.surveyId) || { title: 'Unknown Survey' };
      const startTime = r.startTime ? new Date(r.startTime) : new Date();
      const lastActivity = r.lastUpdated ? new Date(r.lastUpdated) : new Date();
      
      // Calculate progress
      const totalQuestions = 20; // This would come from actual survey data
      const currentQuestion = r.answers?.length || 0;
      const progress = (currentQuestion / totalQuestions) * 100;
      
      // Generate mock device data
      const devices = ['Desktop', 'Mobile', 'Tablet'];
      const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
      const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Berlin'];
      
      return {
        id: r._id,
        surveyId: r.surveyId,
        surveyTitle: survey.title,
        currentQuestion,
        totalQuestions,
        startTime,
        lastActivity,
        progress,
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        location: locations[Math.floor(Math.random() * locations.length)]
      };
    });
    
    setActiveUsers(mockActiveUsers);
    
    // Generate mock question metrics
    const mockQuestionMetrics = Array.from({ length: 5 }, (_, i) => ({
      questionId: `q${i + 1}`,
      questionText: `Question ${i + 1}: How satisfied are you with...`,
      averageTimeSpent: Math.floor(Math.random() * 60) + 10, // 10-70 seconds
      dropoutCount: Math.floor(Math.random() * 5),
      responseCount: Math.floor(Math.random() * 50) + 50 // 50-100 responses
    }));
    
    setQuestionMetrics(mockQuestionMetrics);
    
    // Generate mock section metrics
    const mockSectionMetrics = Array.from({ length: 3 }, (_, i) => ({
      sectionId: `s${i + 1}`,
      sectionTitle: `Section ${i + 1}: ${['Demographics', 'Work Environment', 'Leadership'][i]}`,
      averageTimeSpent: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
      dropoutCount: Math.floor(Math.random() * 10),
      completionRate: Math.random() * 30 + 70 // 70-100%
    }));
    
    setSectionMetrics(mockSectionMetrics);
    
    // Generate mock device distribution
    const mockDeviceDistribution = [
      { device: 'Desktop', count: Math.floor(Math.random() * 50) + 50, percentage: 0 },
      { device: 'Mobile', count: Math.floor(Math.random() * 40) + 20, percentage: 0 },
      { device: 'Tablet', count: Math.floor(Math.random() * 20) + 10, percentage: 0 }
    ];
    
    const totalDevices = mockDeviceDistribution.reduce((sum, item) => sum + item.count, 0);
    const withPercentages = mockDeviceDistribution.map(item => ({
      ...item,
      percentage: (item.count / totalDevices) * 100
    }));
    
    setDeviceDistribution(withPercentages);
    
    // Set up interval to simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1, // -1, 0, or +1
        questionsAnswered: prev.questionsAnswered + Math.floor(Math.random() * 5)
      }));
      
      // Update active users progress
      setActiveUsers(prev => 
        prev.map(user => ({
          ...user,
          currentQuestion: Math.min(user.totalQuestions, user.currentQuestion + (Math.random() > 0.7 ? 1 : 0)),
          progress: Math.min(100, user.progress + (Math.random() > 0.7 ? 5 : 0)),
          lastActivity: Math.random() > 0.3 ? new Date() : user.lastActivity
        }))
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loading, responses, incompleteResponses, surveys]);
  
  // State for time-series data
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [completionTimeData, setCompletionTimeData] = useState<any[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<any[]>([]);
  const [browserData, setBrowserData] = useState<any[]>([]);
  
  // Initialize with sample data if nothing is available
  useEffect(() => {
    if (!loading && !isLoading && incompleteResponses.length === 0 && activeUsers.length === 0) {
      // Generate sample data for demonstration
      const sampleActiveUsers = [];
      for (let i = 0; i < 5; i++) {
        sampleActiveUsers.push({
          id: `sample-${i}`,
          surveyId: 'sample-survey',
          surveyTitle: 'Employee Satisfaction Survey',
          currentQuestion: Math.floor(Math.random() * 10) + 1,
          totalQuestions: 20,
          startTime: new Date(Date.now() - Math.random() * 1000 * 60 * 15),
          lastActivity: new Date(),
          progress: Math.floor(Math.random() * 80) + 10,
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
          location: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)]
        });
      }
      setActiveUsers(sampleActiveUsers);
      
      // Sample question metrics
      const sampleQuestions = [
        { questionId: 'q1', questionText: 'How satisfied are you with your work environment?', averageTimeSpent: 28, dropoutCount: 3, responseCount: 42 },
        { questionId: 'q2', questionText: 'Rate your work-life balance', averageTimeSpent: 15, dropoutCount: 1, responseCount: 45 },
        { questionId: 'q3', questionText: 'How would you rate management support?', averageTimeSpent: 32, dropoutCount: 5, responseCount: 39 },
        { questionId: 'q4', questionText: 'Do you feel valued at work?', averageTimeSpent: 18, dropoutCount: 2, responseCount: 44 },
        { questionId: 'q5', questionText: 'How likely are you to recommend this company?', averageTimeSpent: 25, dropoutCount: 1, responseCount: 46 }
      ];
      setQuestionMetrics(sampleQuestions);
      
      // Sample section metrics
      const sampleSections = [
        { sectionId: 's1', sectionTitle: 'Work Environment', averageTimeSpent: 95, dropoutCount: 4, completionRate: 92.5 },
        { sectionId: 's2', sectionTitle: 'Management & Leadership', averageTimeSpent: 120, dropoutCount: 7, completionRate: 88.3 },
        { sectionId: 's3', sectionTitle: 'Personal Growth', averageTimeSpent: 85, dropoutCount: 2, completionRate: 95.1 },
        { sectionId: 's4', sectionTitle: 'Team Dynamics', averageTimeSpent: 105, dropoutCount: 3, completionRate: 90.8 },
        { sectionId: 's5', sectionTitle: 'Company Culture', averageTimeSpent: 110, dropoutCount: 5, completionRate: 89.5 }
      ];
      setSectionMetrics(sampleSections);
      
      // Sample device distribution
      const sampleDevices = [
        { device: 'Desktop', count: 32, percentage: 64 },
        { device: 'Mobile', count: 12, percentage: 24 },
        { device: 'Tablet', count: 6, percentage: 12 }
      ];
      setDeviceDistribution(sampleDevices);
      
      // Sample browser data
      const sampleBrowsers = [
        { name: 'Chrome', value: 58 },
        { name: 'Safari', value: 22 },
        { name: 'Firefox', value: 12 },
        { name: 'Edge', value: 8 }
      ];
      setBrowserData(sampleBrowsers);
      
      // Sample metrics
      setMetrics({
        activeUsers: 5,
        completedSurveys: 47,
        averageCompletionTime: 8.3,
        dropoutRate: 12.5,
        questionsAnswered: 423,
        responseRate: 78.3
      });
      
      // Generate time series data for active users over time
      const now = new Date();
      const timeSeriesSample = [];
      for (let i = 30; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        timeSeriesSample.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          activeUsers: Math.floor(Math.random() * 10) + 1,
          completedSurveys: Math.floor(Math.random() * 3)
        });
      }
      setTimeSeriesData(timeSeriesSample);
      
      // Sample location data
      const sampleLocations = [
        { name: 'New York', value: 35 },
        { name: 'London', value: 28 },
        { name: 'Tokyo', value: 18 },
        { name: 'Sydney', value: 12 },
        { name: 'Berlin', value: 7 }
      ];
      setLocationData(sampleLocations);
      
      // Sample completion time distribution
      const sampleCompletionTimes = [
        { range: '0-5 min', count: 12 },
        { range: '5-10 min', count: 18 },
        { range: '10-15 min', count: 9 },
        { range: '15-20 min', count: 5 },
        { range: '20+ min', count: 3 }
      ];
      setCompletionTimeData(sampleCompletionTimes);
      
      // Sample hourly activity
      const sampleHourlyActivity = [];
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`;
        sampleHourlyActivity.push({
          hour,
          activeUsers: Math.floor(Math.random() * 8) + (i > 8 && i < 20 ? 5 : 0), // More activity during work hours
          submissions: Math.floor(Math.random() * 3) + (i > 8 && i < 20 ? 2 : 0)
        });
      }
      setHourlyActivity(sampleHourlyActivity);
    }
  }, [loading, isLoading, incompleteResponses.length, activeUsers.length]);
  
  // Show loading indicator only briefly
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  if ((isLoading || loading) && showLoading) {
    return <div>Loading real-time analytics...</div>;
  }
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Prepare data for doughnut chart
  const deviceChartData = {
    labels: deviceDistribution.map(item => item.device),
    datasets: [
      {
        data: deviceDistribution.map(item => item.count),
        backgroundColor: COLORS.slice(0, deviceDistribution.length),
        borderWidth: 0,
      },
    ],
  };
  
  return (
    <Container>
      <MetricsGrid>
        <MetricCard>
          <h3><FiUsers /> Active Users</h3>
          <div className="value">{metrics.activeUsers}</div>
          <div className="change positive">+2 in last minute</div>
        </MetricCard>
        
        <MetricCard>
          <h3><FiCheckCircle /> Completed Surveys</h3>
          <div className="value">{metrics.completedSurveys}</div>
          <div className="change positive">+5 today</div>
        </MetricCard>
        
        <MetricCard>
          <h3><FiClock /> Avg. Completion Time</h3>
          <div className="value">{metrics.averageCompletionTime.toFixed(1)} min</div>
          <div className="change negative">+0.5 min from avg</div>
        </MetricCard>
        
        <MetricCard>
          <h3><FiAlertCircle /> Dropout Rate</h3>
          <div className="value">{metrics.dropoutRate.toFixed(1)}%</div>
          <div className="change positive">-1.2% from avg</div>
        </MetricCard>
        
        <MetricCard>
          <h3><FiBarChart2 /> Questions Answered</h3>
          <div className="value">{metrics.questionsAnswered}</div>
          <div className="change positive">+42 today</div>
        </MetricCard>
        
        <MetricCard>
          <h3><FiPieChart /> Response Rate</h3>
          <div className="value">{metrics.responseRate.toFixed(1)}%</div>
          <div className="change positive">+3.5% from avg</div>
        </MetricCard>
      </MetricsGrid>
      
      {/* New visualization: Active Users Over Time */}
      <ChartGrid>
        <ChartWrapper>
          <ChartTitle><FiTrendingUp /> Active Users & Completions (Last 30 Minutes)</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#0088FE" strokeWidth={2} dot={{ r: 2 }} name="Active Users" />
              <Line type="monotone" dataKey="completedSurveys" stroke="#00C49F" strokeWidth={2} dot={{ r: 2 }} name="Completed Surveys" />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
        
        {/* New visualization: Hourly Activity */}
        <ChartWrapper>
          <ChartTitle><FiActivity /> Hourly Activity Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" name="Active Users" fill="#0088FE" />
              <Bar dataKey="submissions" name="Submissions" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartGrid>
      
      {/* New visualization: Completion Time Distribution & Geographic Distribution */}
      <ChartGridThree>
        {/* Completion Time Distribution */}
        <SmallChartWrapper>
          <ChartTitle><FiClock /> Completion Time Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={completionTimeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" name="Respondents" fill="#8884d8">
                {completionTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SmallChartWrapper>
        
        {/* Geographic Distribution */}
        <SmallChartWrapper>
          <ChartTitle><FiGlobe /> Geographic Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SmallChartWrapper>
        
        {/* Browser Distribution */}
        <SmallChartWrapper>
          <ChartTitle><FiCpu /> Browser Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={browserData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {browserData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SmallChartWrapper>
      </ChartGridThree>
      
      <TwoColumnGrid>
        <ChartContainer>
          <h3><FiActivity /> Live Response Activity</h3>
          <ChartPlaceholder>
            [Line chart showing responses per minute over the last hour]
          </ChartPlaceholder>
        </ChartContainer>
        
        <ChartContainer>
          <h3><FiMap /> Geographic Distribution</h3>
          <ChartPlaceholder>
            [World map showing respondent locations]
          </ChartPlaceholder>
        </ChartContainer>
      </TwoColumnGrid>
      
      <TableContainer>
        <h3><FiUsers /> Currently Active Users ({activeUsers.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Progress</th>
              <th>Device / Browser</th>
              <th>Location</th>
              <th>Started</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map(user => (
              <tr key={user.id}>
                <td>{user.surveyTitle}</td>
                <td>
                  <div style={{ marginBottom: '4px' }}>
                    {user.currentQuestion} of {user.totalQuestions} ({Math.round(user.progress)}%)
                  </div>
                  <ProgressBar progress={user.progress} />
                </td>
                <td>{user.device} / {user.browser}</td>
                <td>{user.location || 'Unknown'}</td>
                <td>{user.startTime.toLocaleTimeString()}</td>
                <td>{user.lastActivity.toLocaleTimeString()}</td>
              </tr>
            ))}
            {activeUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No active users at the moment</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>
      
      <TwoColumnGrid>
        <TableContainer>
          <h3><FiBarChart2 /> Question Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Avg. Time</th>
                <th>Dropouts</th>
                <th>Responses</th>
              </tr>
            </thead>
            <tbody>
              {questionMetrics.map(q => (
                <tr key={q.questionId}>
                  <td>{q.questionText}</td>
                  <td>{q.averageTimeSpent}s</td>
                  <td>{q.dropoutCount}</td>
                  <td>{q.responseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
        
        <TableContainer>
          <h3><FiBarChart2 /> Section Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Avg. Time</th>
                <th>Dropouts</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {sectionMetrics.map(s => (
                <tr key={s.sectionId}>
                  <td>{s.sectionTitle}</td>
                  <td>{s.averageTimeSpent}s</td>
                  <td>{s.dropoutCount}</td>
                  <td>{s.completionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </TwoColumnGrid>
      
      <ChartGrid>
        {/* Device Distribution with actual chart */}
        <ChartWrapper>
          <ChartTitle><FiPieChart /> Device Distribution</ChartTitle>
          <div style={{ display: 'flex', height: '90%' }}>
            <div style={{ flex: 1, maxWidth: '50%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <Doughnut 
                  data={deviceChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                />
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, maxWidth: '50%', overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceDistribution.map(d => (
                    <tr key={d.device}>
                      <td>{d.device}</td>
                      <td>{d.count}</td>
                      <td>{d.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ChartWrapper>
        
        {/* Question Performance Visualization */}
        <ChartWrapper>
          <ChartTitle><FiBarChart2 /> Question Response Time vs. Dropout Rate</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart 
              data={questionMetrics.map(q => ({
                name: q.questionText.length > 25 ? q.questionText.substring(0, 25) + '...' : q.questionText,
                responseTime: q.averageTimeSpent,
                dropoutRate: (q.dropoutCount / (q.responseCount + q.dropoutCount)) * 100
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="responseTime" name="Avg. Response Time (s)" fill="#0088FE" />
              <Bar dataKey="dropoutRate" name="Dropout Rate (%)" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartGrid>
    </Container>
  );
};

export default RealTimeAnalytics;
