import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUsers, 
  FaQuestionCircle, 
  FaClipboardList, 
  FaChartLine, 
  FaFileExport, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaFilter, 
  FaChevronRight, 
  FaCheck, 
  FaUndo,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBell,
  FaRobot,
  FaBrain,
  FaLightbulb,
  FaMagic,
  FaArrowRight
} from 'react-icons/fa';
import Countdown from '../../ui/admin/Countdown';

import { useTracker } from 'meteor/react-meteor-data';
import { useResponses } from '../../ui/useResponses';
import { Meteor } from 'meteor/meteor';

import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Custom scrollbar styling
const GlobalScrollbarStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #aaaaaa;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #888888;
  }
`;

const GoldHeaderCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.primaryColor || '#542A46'}, ${props => props.theme.secondaryColor || '#3B1D31'});
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 1.75rem 2.5rem;
  margin: 0 0 1.75rem 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 30%;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 60%);
    border-radius: 50%;
  }
`;

const HeaderLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
  opacity: 0.9;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  padding-left: 12px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4));
    border-radius: 2px;
  }
`;

const HeaderTitle = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.2px;
`;

const HeaderEnds = styled.div`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;



const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  height: auto;
  min-height: 100%;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #552a47, #7a4e7a);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translate(0, -5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const SectionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  padding-left: 12px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(0, -50%);
    width: 4px;
    height: 18px;
    background: linear-gradient(to bottom, #552a47, #7a4e7a);
    border-radius: 2px;
  }
`;
const DonutChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`;
const DonutLegend = styled.div`
  margin-top: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;



const HalfWidthCard = styled(Card)`
  grid-column: span 6;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const QuarterWidthCard = styled(Card)`
  grid-column: span 3;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

// Welcome back section styled components
const WelcomeBackSection = styled.div`
  background: #a0cf4e;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WelcomeTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
`;

// Response Trends and Survey Categories styled components
const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
`;

const ChartSelect = styled.select`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-bottom: 16px;
  align-self: flex-end;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const BarChart = styled.div`
  margin: 1rem 0;
  width: 100%;
`;
const BarBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  width: 100%;
`;
const BarLabel = styled.div`
  width: 100px;
  font-size: 0.875rem;
  color: #1c1c1c;
  font-weight: 600;
`;


const FilterContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.03);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, #552a47 0%, #7a4e7a 100%);
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  svg {
    color: #552a47;
    font-size: 1.1rem;
  }
  
  span {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    cursor: pointer;
  }
`;

const FilterContent = styled.div<{ isOpen?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.1);
  }
  
  &:hover {
    border-color: #c0c0c0;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.primary ? '#552a47' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border: ${props => props.primary ? 'none' : '1px solid #e0e0e0'};
  
  &:hover {
    background: ${props => props.primary ? '#693658' : '#f5f5f5'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const QuickActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  color: #1c1c1c;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.primary {
    background: #552a47;
    border-color: #552a47;
    color: white;
    
    &:hover {
      background: #693658;
    }
  }
`;
const FlaggedList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const FlaggedItem = styled.li<{ severity?: 'high' | 'medium' | 'low' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1c1c;
  border-left: 3px solid ${props => 
    props.severity === 'high' ? '#e74c3c' : 
    props.severity === 'medium' ? '#f39c12' : 
    '#27ae60'};
  background: ${props => 
    props.severity === 'high' ? '#fef5f5' : 
    props.severity === 'medium' ? '#fef9ef' : 
    '#f1faee'};
  border-radius: 4px;
`;



const KpiCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
  width: 100%;
`;

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: 130px repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex: 1;
  overflow: hidden;
`;

const HeatMapHeader = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 0.25rem;
  text-align: center;
  background: #f5f5f5;
  border-radius: 6px;
`;

const HeatMapRow = styled.div`
  display: contents;
`;

const HeatMapLabel = styled.div`
  font-size: 0.875rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
`;

const HeatMapCell = styled.div<{ score: number }>`
  padding: 0.5rem 0.25rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  background: ${props => {
    if (props.score >= 4.0) return '#7ec16c';
    if (props.score >= 3.0) return '#ffd166';
    return '#ef476f';
  }};
  color: ${props => props.score >= 3.0 ? '#1c1c1c' : '#fff'};
  border-radius: 6px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.03);
  }
`;

const AnonymityAlert = styled.div`
  background: #ffe9e9;
  color: #e74c3c;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;
const TrendBar = styled.div`
  margin-top: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;
const TrendRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
`;
const TrendLabel = styled.div`
  width: 70px;
  font-size: 1.08rem;
  color: #552a47;
  font-weight: 600;
`;
const TrendFill = styled.div<{ width: number; color?: string }>`
  height: 14px;
  background: linear-gradient(90deg, #5e3b5e 0%, #7a4e7a 100%);
  border-radius: 8px;
  margin: 0 12px 0 0;
  width: ${({ width }) => width}%;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(85, 42, 71, 0.2);
`;
const TrendValue = styled.div`
  width: 60px;
  font-weight: 700;
  color: #444;
`;



// Type for filter state
interface DashboardFilters {
  site: string;
  department: string;
  role: string;
  survey: string;
}

const AdminDashboard: React.FC = () => {
  // const navigate = useNavigate();
  
  // Apply custom scrollbar styling
  return (
    <>
      <GlobalScrollbarStyle />
      <AdminDashboardContent />
    </>
  );
};

const AdminDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Dynamically import the Questions and Surveys collections for client-side use
  const [QuestionsCollection, setQuestionsCollection] = useState<any>(null);
  const [SurveysCollection, setSurveysCollection] = useState<any>(null);
  
  // Get current user data
  const user = useTracker(() => Meteor.user(), []);
  const userName = user?.profile?.name || user?.username || 'Admin';
  
  // State for metrics
  const [responseRate, setResponseRate] = useState(0);
  const [participationRate, setParticipationRate] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(0);
  
  // State for response trends data
  const [responseTrendsData, setResponseTrendsData] = useState<{labels: string[], data: number[]}>({ 
    labels: [], 
    data: [] 
  });
  const [isLoadingTrends, setIsLoadingTrends] = useState<boolean>(true);
  
  // Fetch enhanced metrics and trends data
  useEffect(() => {
    // Get enhanced response rate
    Meteor.call('getEnhancedResponseRate', (error: any, result: number) => {
      if (error) {
        console.error('Error fetching enhanced response rate:', error);
      } else {
        setResponseRate(result);
      }
    });
    
    // Get enhanced participation rate
    Meteor.call('getEnhancedParticipationRate', (error: any, result: number) => {
      if (error) {
        console.error('Error fetching enhanced participation rate:', error);
      } else {
        console.log('Participation rate received:', result);
        setParticipationRate(result);
      }
    });
    
    // Get participant count from SurveyResponses collection
    Meteor.call('getUniqueParticipantCount', (error: any, result: number) => {
      if (error) {
        console.error('Error fetching participant count:', error);
      } else {
        console.log('Participant count received:', result);
        setParticipantCount(result);
      }
    });
    
    // Get response trends data
    Meteor.call('getResponseTrendsData', (error: any, result: any[]) => {
      if (error) {
        console.error('Error fetching response trends data:', error);
        setIsLoadingTrends(false);
      } else {
        // Format data for the chart
        const labels = result.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = result.map(item => item.responses);
        
        setResponseTrendsData({ labels, data });
        setIsLoadingTrends(false);
      }
    });
  }, []);
  
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>({
    site: 'all',
    department: 'all',
    role: 'all',
    survey: 'all'
  });
  
  // Temporary filter state for apply/reset functionality
  const [tempFilters, setTempFilters] = useState<DashboardFilters>({
    site: 'all',
    department: 'all',
    role: 'all',
    survey: 'all'
  });
  
  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    // Here you would typically fetch filtered data or update the dashboard
    console.log('Filters applied:', tempFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      site: 'all',
      department: 'all',
      role: 'all',
      survey: 'all'
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    console.log('Filters reset to default');
  };
  
  // Anonymity warning state
  const [showAnonymityWarning, setShowAnonymityWarning] = useState(false);
  
  // Check if responses for current filter are below the anonymity threshold
  useEffect(() => {
    // This would be a real check against response counts for the selected filters
    // For demo, we'll toggle based on role filter
    setShowAnonymityWarning(filters.role === 'analyst' || filters.department === 'hr');
  }, [filters]);

  useEffect(() => {
    import('../../features/questions').then(mod => {
      setQuestionsCollection(mod.Questions);
    });
    import('../../features/surveys').then(mod => {
      setSurveysCollection(mod.Surveys);
    });
  }, []);

  // Fetch questions from MongoDB (if available)
  const questions = useTracker(() => {
    if (!QuestionsCollection) return [];
    Meteor.subscribe('questions.all');
    return QuestionsCollection.find().fetch();
  }, [QuestionsCollection]);

  // Fetch surveys from MongoDB (if available)
  const surveys = useTracker(() => {
    if (!SurveysCollection) return [];
    Meteor.subscribe('surveys.all');
    return SurveysCollection.find().fetch();
  }, [SurveysCollection]);

  // Filter for active vs all surveys
  const activeSurveys = surveys.filter((s: any) => 
    // In a real implementation, check survey.isActive or startDate/endDate
    true // Placeholder - all surveys are considered active for now
  );

  // Count total questions and unique participants/responses
  const totalQuestions = questions.length;
  const responses = useResponses();

  // Dynamic stats
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.completed).length;
  const uniqueParticipants = new Set(responses.map(r => r.userId)).size;

  const stats = [
    { label: 'Total Surveys', value: surveys.length, icon: FaClipboardList, link: '/admin/surveys/all' },
    { label: 'Active Surveys', value: activeSurveys.length, icon: FaCalendarAlt, link: '/admin/surveys/all' },
    { label: 'Question Bank', value: totalQuestions, icon: FaQuestionCircle, link: '/admin/questions/all' },
    { label: 'Survey Responses', value: participantCount, icon: FaUsers, link: '/admin/analytics' }
  ];

  // Participation percentage
  const participationPct = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  // Response data by site
  const siteData = [
    { name: 'Rainy River', value: 70, color: '#7ec16c' },
    { name: 'New Afton', value: 55, color: '#f7ca51' },
    { name: 'Corporate', value: 40, color: '#f28b63' },
    { name: 'Other', value: 0, color: '#dddddd' }
  ];

  // Heat map data - Themes x Recent Surveys
  const heatMapData = [
    { theme: 'Engagement', surveyScores: [4.2, 3.9, 4.1] },
    { theme: 'Manager Relations', surveyScores: [3.7, 2.9, 3.1] },
    { theme: 'Team Dynamics', surveyScores: [4.5, 4.3, 4.2] },
    { theme: 'Communication', surveyScores: [3.5, 4.1, 3.7] },
    { theme: 'Recognition', surveyScores: [3.1, 3.0, 3.4] },
    { theme: 'Work-Life Balance', surveyScores: [2.8, 2.7, 3.2] },
  ];

  // Flagged issues - based on threshold crossings
  const flaggedIssues = [
    { id: 1, text: 'Communication score dropped from 4.1 → 3.5', severity: 'high' as const },
    { id: 2, text: 'Leadership Trust fell below threshold: 2.9', severity: 'high' as const },
    { id: 3, text: 'Team Collaboration declined by 12% since last survey', severity: 'medium' as const },
    { id: 4, text: 'Work-Life Balance flagged in multiple sites', severity: 'medium' as const },
    { id: 5, text: 'Manager Feedback score critically low at 2.5', severity: 'low' as const }
  ];



  return (
    <AdminLayout>
      <div className="dashboard-bg">
      
        {/* Welcome Back Section */}
        <WelcomeBackSection>
          <WelcomeTitle>
            Welcome back, {userName} <span role="img" aria-label="wave">👋</span>
          </WelcomeTitle>
          <WelcomeSubtitle>
            Here's what's happening with your organizational intelligence platform.
          </WelcomeSubtitle>
          <MetricsRow>
            <MetricItem>
              <FaClipboardList /> {activeSurveys.length} active surveys
            </MetricItem>
            <MetricItem>
              <FaChartLine /> {responseRate}% response rate
            </MetricItem>
            {/* <MetricItem>
              <FaUsers /> {participationRate}% participation rate
            </MetricItem> */}
          </MetricsRow>
        </WelcomeBackSection>

                {/* Marvin AI Coming Soon Section */}
                <MarvinAICard>
                  <BackgroundDecoration />
                  <BackgroundDecoration2 />
                  
                  <MarvinAIContainer>
                    {/* Left Side - Header */}
                    <MarvinAILeft>
                      <MarvinAIHeader>
                        <ComingSoonBadge>
                          <FaRobot size={14} /> Coming Soon
                        </ComingSoonBadge>
                        <MarvinAITitle>Meet Marvin AI</MarvinAITitle>
                        <MarvinAIDescription>
                          Your intelligent assistant for creating better surveys. Marvin helps admins design effective questions, 
                          optimize survey flow, and generate insights from responses.
                        </MarvinAIDescription>
                      </MarvinAIHeader>
                    </MarvinAILeft>
                    
                    {/* Right Side - Features */}
                    <MarvinAIRight>
                      <FeaturesGrid>
                        <FeatureCard>
                          <FeatureIcon>
                            <FaLightbulb size={18} />
                          </FeatureIcon>
                          <FeatureTitle>Smart Question Generation</FeatureTitle>
                          <FeatureDescription>
                            Marvin helps you craft clear, unbiased questions that get you the insights you need.
                          </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard>
                          <FeatureIcon>
                            <FaBrain size={18} />
                          </FeatureIcon>
                          <FeatureTitle>Survey Flow Optimization</FeatureTitle>
                          <FeatureDescription>
                            Create logical, engaging survey flows that keep respondents interested.
                          </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard>
                          <FeatureIcon>
                            <FaMagic size={18} />
                          </FeatureIcon>
                          <FeatureTitle>Best Practice Recommendations</FeatureTitle>
                          <FeatureDescription>
                            Get expert advice on survey design based on industry best practices.
                          </FeatureDescription>
                        </FeatureCard>
                        
                        <FeatureCard>
                          <FeatureIcon>
                            <FaChartLine size={18} />
                          </FeatureIcon>
                          <FeatureTitle>Instant Response Analysis</FeatureTitle>
                          <FeatureDescription>
                            Turn raw survey data into actionable insights and understand what your data means.
                          </FeatureDescription>
                        </FeatureCard>
                      </FeaturesGrid>
                    </MarvinAIRight>
                  </MarvinAIContainer>
                </MarvinAICard>
        
        {/* KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px', 
          margin: '24px 0 40px 0',
          background: 'linear-gradient(135deg, rgba(248, 248, 252, 0.9) 0%, rgba(252, 248, 252, 0.9) 100%)',
          padding: '24px 24px 50px 24px',
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
          alignItems: 'stretch',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <style jsx>{`
            @media (max-width: 1024px) {
              div {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 480px) {
              div {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
          
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <KPICard key={index} onClick={() => navigate(stat.link)}>
                <KPIIcon>
                  <Icon />
                </KPIIcon>
                <KPIContent>
                  <KPIValue>{stat.value}</KPIValue>
                  <KPILabel>{stat.label}</KPILabel>
                </KPIContent>
                <ViewDetails>
                  View details <FaChevronRight size={10} />
                </ViewDetails>
              </KPICard>
            );
          })}
        </div>
        
        {/* Filter Section - Hidden but preserved in code */}
        <FilterContainer style={{ display: 'none' }}>
          <FilterHeader>
            <FaFilter />
            <span>Dashboard Filters</span>
          </FilterHeader>
          
          <FilterContent isOpen={true}>
            <FilterGroup>
              <FilterLabel htmlFor="site-filter">Site</FilterLabel>
              <FilterSelect 
                id="site-filter"
                value={tempFilters.site} 
                onChange={(e) => setTempFilters({...tempFilters, site: e.target.value})}
              >
                <option value="all">All Sites</option>
                <option value="rainy-river">Rainy River</option>
                <option value="new-afton">New Afton</option>
                <option value="corporate">Corporate</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="department-filter">Department</FilterLabel>
              <FilterSelect 
                id="department-filter"
                value={tempFilters.department} 
                onChange={(e) => setTempFilters({...tempFilters, department: e.target.value})}
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="operations">Operations</option>
                <option value="hr">Human Resources</option>
                <option value="finance">Finance</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="role-filter">Role</FilterLabel>
              <FilterSelect 
                id="role-filter"
                value={tempFilters.role} 
                onChange={(e) => setTempFilters({...tempFilters, role: e.target.value})}
              >
                <option value="all">All Roles</option>
                <option value="manager">Managers</option>
                <option value="supervisor">Supervisors</option>
                <option value="engineer">Engineers</option>
                <option value="analyst">Analysts</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="survey-filter">Survey Period</FilterLabel>
              <FilterSelect 
                id="survey-filter"
                value={tempFilters.survey} 
                onChange={(e) => setTempFilters({...tempFilters, survey: e.target.value})}
              >
                <option value="all">Current Survey</option>
                <option value="q1-2025">Q1 2025</option>
                <option value="q4-2024">Q4 2024</option>
                <option value="q3-2024">Q3 2024</option>
              </FilterSelect>
            </FilterGroup>
          </FilterContent>
          
          <FilterActions>
            <FilterButton primary onClick={() => applyFilters()}>
              <FaCheck /> Apply Filters
            </FilterButton>
            <FilterButton onClick={() => resetFilters()}>
              <FaUndo /> Reset
            </FilterButton>
          </FilterActions>
        </FilterContainer>
        
        {/* Charts Section - Response Trends and Survey Categories */}
        <ChartContainer>
          {/* Response Trends Chart */}
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Response Trends</ChartTitle>
              <ChartSelect>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </ChartSelect>
            </ChartHeader>
            <div style={{ height: '250px', position: 'relative' }}>
              {isLoadingTrends ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <span>Loading chart data...</span>
                </div>
              ) : (
                <Line 
                  data={{
                    labels: responseTrendsData.labels.length > 0 ? responseTrendsData.labels : ['No data available'],
                    datasets: [
                      {
                        label: 'Responses',
                        data: responseTrendsData.data.length > 0 ? responseTrendsData.data : [0],
                        borderColor: '#3a7bfd',
                        backgroundColor: 'rgba(58, 123, 253, 0.1)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        intersect: false,
                        mode: 'index'
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    onHover: (event, elements) => {
                      // Prevent any layout shifts when hovering
                      if (event.native) {
                        event.native.preventDefault();
                      }
                    }
                  }}
                />
              )}
              </div>
          </ChartCard>
          
          {/* Survey Tags Chart */}
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Survey Tags</ChartTitle>
            </ChartHeader>
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
              {(() => {
                // Default data in case the API call fails
                const defaultData = {
                  labels: ['Engagement', 'Safety', 'Leadership', 'Culture'],
                  datasets: [
                    {
                      data: [25, 20, 30, 25],
                      backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#9b59b6'
                      ],
                      borderWidth: 0
                    }
                  ]
                };
                
                const [chartData, setChartData] = useState(defaultData);
                const [isLoading, setIsLoading] = useState(true);
                
                // Fetch tag data on component mount
                useEffect(() => {
                  setIsLoading(true);
                  Meteor.call('getMostUsedTags', 4, (error: any, result: any) => {
                    if (error) {
                      console.error('Error fetching tag data:', error);
                      setIsLoading(false);
                    } else if (result && result.length > 0) {
                      console.log('Tag data received:', result);
                      
                      // Fixed colors for consistency
                      const colors = ['#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
                      
                      // Transform the data for the chart
                      const newData = {
                        labels: result.map((item: any) => item.tag),
                        datasets: [
                          {
                            data: result.map((item: any) => item.count),
                            backgroundColor: result.map((item: any, index: number) => 
                              item.color || colors[index % colors.length]
                            ),
                            borderWidth: 0
                          }
                        ]
                      };
                      
                      setChartData(newData);
                      setIsLoading(false);
                    } else {
                      console.log('No tag data received, using default');
                      setIsLoading(false);
                    }
                  });
                }, []);
                
                return (
                  <>
                    {isLoading && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div style={{ marginBottom: '10px' }}>Loading tag data...</div>
                        <div className="spinner" style={{ 
                          width: '30px', 
                          height: '30px', 
                          border: '3px solid rgba(0, 0, 0, 0.1)', 
                          borderRadius: '50%',
                          borderTop: '3px solid #552a47',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto'
                        }} />
                      </div>
                    )}
                    <Doughnut
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.raw} uses`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </>
                );
              })()}
            </div>
          </ChartCard>
        </ChartContainer>
        
        {/* Anonymity Alert */}
        {showAnonymityWarning && (
          <AnonymityAlert>
            <FaExclamationTriangle />
            <div>Anonymity Warning: This filter selection contains fewer than 5 responses. Data has been hidden to protect employee privacy.</div>
          </AnonymityAlert>
        )}
      
        <MainGrid style={{ marginTop: '16px' }}>
        {/* First Row: Engagement Score Trend and Heat Map with Recent Activity */}
          <QuarterWidthCard style={{ gridColumn: '1 / span 3' }}>
            <SectionTitle>
              <FaChartLine size={14} /> Engagement Score Trend
            </SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', background: 'rgba(248, 248, 252, 0.5)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#666', fontSize: 14, flex: 1 }}>Track how employee engagement has changed over recent surveys.</div>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', background: `linear-gradient(135deg, ${theme.primaryColor || '#542A46'}, ${theme.secondaryColor || '#3B1D31'})`, padding: '6px 12px', borderRadius: '16px', color: 'white', fontSize: '13px' }}>AVERAGE: 4/5</div>
            </div>

            <TrendBar>
              {(() => {
                const data = [
                  { month: 'Sep', score: 4.2 },
                  { month: 'Jun', score: 4.0 },
                  { month: 'Mar', score: 3.6 },
                ];
                return data.map((d, i) => (
                  <TrendRow key={i}>
                    <TrendLabel>{d.month}</TrendLabel>
                    <TrendFill width={d.score * 20} />
                    <TrendValue>{d.score}/5</TrendValue>
                  </TrendRow>
                ));
              })()}
            </TrendBar>
          </QuarterWidthCard>
          
          {/* Heat Map */}
          <HalfWidthCard style={{ gridColumn: '4 / span 6' }}>
            <SectionTitle>
              <FaChartLine size={14} /> Engagement Score Heat Map
            </SectionTitle>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '0.5rem' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6c6c6c' }}>
                Track how employee engagement has changed over recent surveys with a quick view of average scores and trends.
              </div>
              <div style={{ fontWeight: 600, color: '#1c1c1c' }}>
                AVERAGE: 4/5
              </div>
            </div>
            
            <HeatMapGrid>
              <HeatMapHeader style={{ background: 'transparent' }}></HeatMapHeader>
              <HeatMapHeader>JAN 25</HeatMapHeader>
              <HeatMapHeader>SEP 24</HeatMapHeader>
              <HeatMapHeader>MAY 24</HeatMapHeader>
              
              {heatMapData.map((row, index) => (
                <HeatMapRow key={index}>
                  <HeatMapLabel>{row.theme}</HeatMapLabel>
                  {row.surveyScores.map((score, i) => (
                    <HeatMapCell key={i} score={score}>
                      {score.toFixed(1)}
                    </HeatMapCell>
                  ))}
                </HeatMapRow>
              ))}
            </HeatMapGrid>
          </HalfWidthCard>
          
          {/* Recent Activity - Positioned at top right after Heat Map */}
          <QuarterWidthCard style={{ gridColumn: '10 / span 3' }}>
            <SectionTitle>
              <FaBell size={14} /> Recent Activity
            </SectionTitle>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflow: 'auto', maxHeight: '400px' }}>
              {[
                { time: '2 hours ago', action: 'Jane Smith created a new survey: "Q2 Employee Feedback"' },
                { time: '5 hours ago', action: 'John Davis exported survey results for "Leadership Assessment"' },
                { time: 'Yesterday', action: 'Admin sent 45 new invitations to Operations department' },
                { time: '2 days ago', action: 'Survey threshold alert: Communication score below target' },
                { time: '3 days ago', action: 'Mike Johnson added 3 new questions to the Question Bank' }
              ].map((activity, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem', 
                  borderLeft: '3px solid #5e3b5e',
                  background: 'rgba(94, 59, 94, 0.05)',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }} 
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(3px)';
                  e.currentTarget.style.background = 'rgba(94, 59, 94, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.background = 'rgba(94, 59, 94, 0.05)';
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#5e3b5e', marginBottom: '0.25rem', fontWeight: '600' }}>
                    {activity.time}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {activity.action}
                  </div>
                </div>
              ))}
            </div>
          </QuarterWidthCard>
          
          {/* Second Row: Survey Participation, Responses by Site, Flagged Issues */}
          <QuarterWidthCard style={{ gridColumn: '1 / span 3', marginTop: '20px' }}>
            <SectionTitle>
              <FaChartLine size={14} /> Survey Participation
            </SectionTitle>
            <div style={{ fontSize: '0.875rem', color: '#6c6c6c', marginBottom: '1rem' }}>
              Quickly see how many participants have completed the survey.
            </div>
            
            <DonutChart>
              <svg viewBox="0 0 36 36" style={{ width: '140px', height: '140px' }}>
                <circle cx="18" cy="18" r="16" fill="#f5f5f5" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="transparent"
                  stroke="#7ec16c" 
                  strokeWidth={3}
                  strokeDasharray={`${participationPct}, 100`}
                  transform="rotate(-90 18 18)"
                />
                <text x={18} y={18} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1c1c1c">
                  {participationPct}%
                </text>
                <text x={18} y={22} textAnchor="middle" fontSize={4} fill="#6c6c6c">
                  COMPLETED
                </text>
              </svg>
            </DonutChart>
            
            <DonutLegend>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', background: '#7ec16c', borderRadius: '2px' }} />
                <div>COMPLETED</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', background: '#f5f5f5', borderRadius: '2px' }} />
                <div>PENDING</div>
              </div>
            </DonutLegend>
          </QuarterWidthCard>
          
          {/* Responses by Site */}
          <HalfWidthCard style={{ gridColumn: '4 / span 6', marginTop: '50px' }}>
            <SectionTitle>
              <FaChartLine size={14} /> Responses by Site
            </SectionTitle>
            <div style={{ fontSize: '0.875rem', color: '#6c6c6c', marginBottom: '1rem' }}>
              Breakdown of total responses received from each site or department to help monitor participation across locations.
            </div>
            
            <div style={{ fontWeight: 600, color: '#1c1c1c', marginBottom: '0.75rem' }}>
              TOTAL RESPONSES: 165
            </div>
            
            <BarChart>
              {siteData.map((site) => (
                <BarBar key={site.name}>
                  <BarLabel>{site.name}</BarLabel>
                  <div style={{ 
                    height: '14px', 
                    width: `${site.value * 2}px`, 
                    background: site.color,
                    borderRadius: '7px'
                  }} />
                  <div style={{ marginLeft: '10px', fontSize: '0.875rem', fontWeight: 600, color: '#1c1c1c' }}>
                    {site.value}
                  </div>
                </BarBar>
              ))}
            </BarChart>
            
            <div style={{ fontSize: '0.8rem', color: '#6c6c6c', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaInfoCircle size={12} />
                <span>Total invitations sent: 218</span>
              </div>
            </div>
          </HalfWidthCard>
          
          {/* Flagged Issues */}
          <QuarterWidthCard style={{ gridColumn: '10 / span 3', marginTop: '20px' }}>
            <SectionTitle>
              <FaExclamationTriangle size={14} color="#e74c3c" /> Flagged Issues
            </SectionTitle>
            
            <FlaggedList>
              {flaggedIssues.map(issue => (
                <FlaggedItem key={issue.id} severity={issue.severity}>
                  {issue.text}
                </FlaggedItem>
              ))}
              <FlaggedItem color="#f06292"><span>❗</span> Work-Life Balance flagged in multiple sites</FlaggedItem>
              <FlaggedItem color="#ff9800"><span>⚠️</span> Manager Feedback score critically low at 2.5</FlaggedItem>
            </FlaggedList>
          </QuarterWidthCard>
          
          {/* Response Trends Section */}
          <HalfWidthCard style={{ gridColumn: '1 / span 6', marginTop: '100px' }}>
            <TrendContainer>
              <TrendHeader>
                <TrendTitle>
                  <FaChartLine size={16} /> Response Trends
                </TrendTitle>
                <TrendTabsContainer>
                  <TrendTab active>Week</TrendTab>
                  <TrendTab>Month</TrendTab>
                  <TrendTab>Quarter</TrendTab>
                </TrendTabsContainer>
              </TrendHeader>
              
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#666', 
                marginBottom: '15px',
                background: 'rgba(85, 42, 71, 0.03)',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaInfoCircle size={14} color="#552a47" />
                <span>Track response rates and completion trends over time across all surveys.</span>
              </div>
              
              <TrendChart>
                {[
                  { label: 'May', responses: 85, completed: 72 },
                  { label: 'Jun', responses: 95, completed: 80 },
                  { label: 'Jul', responses: 110, completed: 92 },
                  { label: 'Aug', responses: 105, completed: 90 },
                  { label: 'Sep', responses: 120, completed: 98 }
                ].map((month, index) => (
                  <ResponseTrendBar key={index}>
                    <ResponseTrendLabel>{month.label}</ResponseTrendLabel>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TrendBarFill width={(month.responses/120)*80} color="linear-gradient(90deg, #552a47 0%, #7a4e7a 100%)">
                          <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{month.responses}</span>
                        </TrendBarFill>
                        <ResponseTrendValue>Total</ResponseTrendValue>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TrendBarFill width={(month.completed/120)*80} color="linear-gradient(90deg, #2b6cb0 0%, #4299e1 100%)">
                          <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{month.completed}</span>
                        </TrendBarFill>
                        <ResponseTrendValue>Completed</ResponseTrendValue>
                      </div>
                    </div>
                  </ResponseTrendBar>
                ))}
              </TrendChart>
              
              <TrendLegend>
                <LegendItem>
                  <LegendColor color="#552a47" />
                  <span>Total Responses</span>
                </LegendItem>
                <LegendItem>
                  <LegendColor color="#2b6cb0" />
                  <span>Completed</span>
                </LegendItem>
              </TrendLegend>
            </TrendContainer>
          </HalfWidthCard>
          
          
          {/* Survey Types Section */}
          <HalfWidthCard style={{ gridColumn: '7 / span 6', marginTop: '100px' }}>
            <TrendContainer>
              <TrendHeader>
                <TrendTitle>
                  <FaClipboardList size={16} /> Survey Types
                </TrendTitle>
                <div style={{ 
                  background: '#552a47', 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: '16px', 
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  Last 90 Days
                </div>
              </TrendHeader>
              
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#666', 
                marginBottom: '15px',
                background: 'rgba(85, 42, 71, 0.03)',
                padding: '10px 15px',
                borderRadius: '8px'
              }}>
                Overview of survey performance by type and category across the organization.
              </div>
              
              <SurveyTypesContainer>
                {[
                  { 
                    title: 'Employee Engagement', 
                    icon: FaUsers, 
                    color: '#552a47',
                    stats: [
                      { label: 'Avg. Score', value: '4.2' },
                      { label: 'Completion', value: '92%' }
                    ]
                  },
                  { 
                    title: 'Leadership Assessment', 
                    icon: FaChartLine, 
                    color: '#2b6cb0',
                    stats: [
                      { label: 'Avg. Score', value: '3.8' },
                      { label: 'Completion', value: '85%' }
                    ]
                  },
                  { 
                    title: 'Onboarding Feedback', 
                    icon: FaClipboardList, 
                    color: '#2f855a',
                    stats: [
                      { label: 'Avg. Score', value: '4.5' },
                      { label: 'Completion', value: '96%' }
                    ]
                  },
                  { 
                    title: 'Work-Life Balance', 
                    icon: FaCalendarAlt, 
                    color: '#e53e3e',
                    stats: [
                      { label: 'Avg. Score', value: '3.2' },
                      { label: 'Completion', value: '88%' }
                    ]
                  }
                ].map((type, index) => (
                  <SurveyTypeCard key={index}>
                    <SurveyTypeHeader>
                      <SurveyTypeTitle>{type.title}</SurveyTypeTitle>
                      <SurveyTypeIcon color={type.color}>
                        <type.icon size={18} />
                      </SurveyTypeIcon>
                    </SurveyTypeHeader>
                    
                    <SurveyTypeStats>
                      {type.stats.map((stat, i) => (
                        <SurveyTypeStat key={i}>
                          <SurveyTypeValue>{stat.value}</SurveyTypeValue>
                          <SurveyTypeLabel>{stat.label}</SurveyTypeLabel>
                        </SurveyTypeStat>
                      ))}
                    </SurveyTypeStats>
                  </SurveyTypeCard>
                ))}
              </SurveyTypesContainer>
            </TrendContainer>
          </HalfWidthCard>
        </MainGrid>
      </div>
    </AdminLayout>
  );
}



const TrendContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TrendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TrendTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #552a47;
  }
`;

const TrendTabsContainer = styled.div`
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
`;

const TrendTab = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: ${props => props.active ? '#552a47' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#e0e0e0'};
  }
`;

const TrendChart = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-image: linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 20% 25%;
    z-index: 0;
    pointer-events: none;
  }
`;

const ResponseTrendBar = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const ResponseTrendLabel = styled.div`
  width: 60px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const TrendBarFill = styled.div<{ width: number; color?: string }>`
  height: 30px;
  width: ${props => props.width}%;
  background: ${props => props.color || 'linear-gradient(90deg, #552a47 0%, #7a4e7a 100%)'};
  border-radius: 6px;
  position: relative;
  transition: width 0.5s ease;
  min-width: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  box-shadow: 0 2px 8px rgba(85, 42, 71, 0.15);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%);
    border-radius: 6px;
  }
`;

const ResponseTrendValue = styled.div`
  margin-left: 10px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const TrendLegend = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 15px;
  font-size: 13px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${props => props.color};
`;

const SurveyTypesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 15px;
`;

const SurveyTypeCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`;

const SurveyTypeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SurveyTypeTitle = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 15px;
`;

const SurveyTypeIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SurveyTypeStats = styled.div`
  display: flex;
  gap: 15px;
`;

const SurveyTypeStat = styled.div`
  display: flex;
  flex-direction: column;
`;

const SurveyTypeValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const SurveyTypeLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
`;

// Marvin AI Coming Soon Section Styles
const MarvinAICard = styled.div`
  grid-column: 1 / -1;
  margin: 30px 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
`;

const MarvinAIContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
  
  @media (max-width: 992px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const MarvinAILeft = styled.div`
  flex: 0 0 300px;
  
  @media (max-width: 992px) {
    flex: 1;
    width: 100%;
  }
`;

const MarvinAIRight = styled.div`
  flex: 1;
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const MarvinAIHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 992px) {
    align-items: center;
  }
`;

const ComingSoonBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.primaryColor || '#552a47'} 0%, ${props => props.theme.secondaryColor || '#3B1D31'} 100%);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MarvinAITitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.6rem 0;
  background: linear-gradient(135deg, ${props => props.theme.primaryColor || '#552a47'} 0%, ${props => props.theme.secondaryColor || '#3B1D31'} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: left;
  
  @media (max-width: 992px) {
    text-align: center;
  }
`;

const MarvinAIDescription = styled.p`
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: left;
  margin: 0;
  
  @media (max-width: 992px) {
    text-align: center;
    max-width: 650px;
    margin: 0 auto;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1.2rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 2;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${props => props.theme.primaryColor || '#552a47'} 0%, ${props => props.theme.secondaryColor || '#3B1D31'} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
`;

const FeatureDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const NotifyButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.primaryColor || '#552a47'} 0%, ${props => props.theme.secondaryColor || '#3B1D31'} 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.7rem 1.8rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 3px 8px rgba(85, 42, 71, 0.15);
  
  @media (max-width: 992px) {
    margin: 1.5rem auto 0;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(85, 42, 71, 0.2);
  }
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(85, 42, 71, 0.1) 0%, rgba(85, 42, 71, 0) 70%);
  top: -200px;
  right: -100px;
  z-index: 1;
`;

const BackgroundDecoration2 = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 29, 49, 0.1) 0%, rgba(59, 29, 49, 0) 70%);
  bottom: -150px;
  left: -100px;
  z-index: 1;
`;

const KPICard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #552a47 0%, #7a4e7a 100%);
  }
`;

const KPIIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(85, 42, 71, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    color: #552a47;
    font-size: 20px;
  }
`;

const KPIContent = styled.div`
  flex: 1;
`;

const KPIValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const KPILabel = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const ViewDetails = styled.div`
  font-size: 12px;
  color: #4a5568;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 10px;
  border-radius: 4px;
  width: fit-content;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(85, 42, 71, 0.1);
    color: #552a47;
  }
`;

export default AdminDashboard;