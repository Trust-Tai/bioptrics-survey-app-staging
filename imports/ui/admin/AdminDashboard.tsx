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
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
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
    background: linear-gradient(90deg, var(--color-primary, #552a47), #7a4e7a);
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
  color: var(--color-text);
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
    background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
    border-radius: 2px;
  }
  
  svg {
    color: var(--color-primary);
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
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: var(--color-primary, #552a47);
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
  color: var(--color-primary, #552a47);
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  color: var(--color-primary, #552a47);
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
  color: var(--color-text);
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
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
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
    color: var(--color-primary);
    font-size: 1.1rem;
  }
  
  span {
    font-weight: 600;
    color: var(--color-text);
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
    border-color: var(--color-primary, #552a47);
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
  
  background: ${props => props.primary ? 'var(--color-primary)' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border: ${props => props.primary ? 'none' : '1px solid #e0e0e0'};
  
  &:hover {
    background: ${props => props.primary ? 'var(--color-secondary)' : '#f5f5f5'};
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
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    
    &:hover {
      background: var(--color-secondary);
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
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  }
`;

const KPIIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(84, 42, 70, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    color: var(--color-primary);
    font-size: 20px;
  }
`;

const KPIValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
`;

const KPILabel = styled.div`
  font-size: 14px;
  color: var(--color-accent);
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
    background: rgba(84, 42, 70, 0.1);
    color: var(--color-primary);
  }
`;

const TrendLabel = styled.div`
  width: 70px;
  font-size: 1.08rem;
  color: var(--color-primary);
  font-weight: 600;
`;

const TrendFill = styled.div<{ width: number; color?: string }>`
  height: 14px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
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

// Additional styled components for enhanced features
const TrendBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 1rem 0;
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const HeatMapHeader = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const HeatMapRow = styled.div`
  display: contents;
`;

const HeatMapLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const HeatMapCell = styled.div<{ score: number }>`
  background: ${props => {
    const intensity = props.score / 5;
    return intensity > 0.7 ? '#27ae60' : 
           intensity > 0.5 ? '#f39c12' : '#e74c3c';
  }};
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border: 1px solid #ffcdd2;
`;

// Marvin AI Coming Soon Section Additional Styles
const BackgroundDecoration = styled.div`
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at center, rgba(85, 42, 71, 0.05) 0%, rgba(85, 42, 71, 0) 70%);
  border-radius: 50%;
`;

const BackgroundDecoration2 = styled.div`
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle at center, rgba(85, 42, 71, 0.03) 0%, rgba(85, 42, 71, 0) 60%);
  border-radius: 50%;
`;

const MarvinAIContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const MarvinAILeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const MarvinAIRight = styled.div`
  display: flex;
  flex-direction: column;
`;

const MarvinAIHeader = styled.div`
  margin-bottom: 1rem;
`;

const MarvinAIDescription = styled.div`
  color: #4b5563;
  fontSize: 0.9rem;
  lineHeight: 1.5;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
`;

const FeatureDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

// Type for filter state
interface DashboardFilters {
  site: string;
  department: string;
  role: string;
  survey: string;
}

const AdminDashboard: React.FC = () => {
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
  const [activeSurveysCount, setActiveSurveysCount] = useState<number>(0);
  
  // State for response trends data
  const [responseTrendsData, setResponseTrendsData] = useState<{labels: string[], data: number[]}>({ 
    labels: [], 
    data: [] 
  });
  const [isLoadingTrends, setIsLoadingTrends] = useState<boolean>(true);
  
  // Fetch enhanced metrics and trends data
  useEffect(() => {
    // Get filtered response rate using the same method as in Analytics
    Meteor.call('getFilteredResponseRate', [], [], [], null, null, (error: any, result: number) => {
      if (error) {
        console.error('Error fetching filtered response rate:', error);
      } else {
        console.log('Filtered response rate received:', result);
        setResponseRate(result);
      }
    });
    
    // Get active surveys count
    Meteor.call('getActiveSurveysCount', (error: any, result: number) => {
      if (error) {
        console.error('Error fetching active surveys count:', error);
      } else {
        console.log('Active surveys count received:', result);
        setActiveSurveysCount(result);
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
  
  // State for filters
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
    { label: 'Active Surveys', value: activeSurveysCount, icon: FaCalendarAlt, link: '/admin/surveys/all' },
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
              <FaClipboardList /> {activeSurveysCount} active surveys
            </MetricItem>
            <MetricItem>
              <FaChartLine /> {responseRate}% response rate
            </MetricItem>
            <MetricItem>
              <FaUsers /> {participationRate}% participation rate
            </MetricItem>
          </MetricsRow>
        </WelcomeBackSection>
        
    
        
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
          
          {/* Placeholder for future chart or widget */}
        </ChartContainer>
        
        {/* Anonymity Alert */}
        {showAnonymityWarning && (
          <AnonymityAlert>
            <FaExclamationTriangle />
            <div>Anonymity Warning: This filter selection contains fewer than 5 responses. Data has been hidden to protect employee privacy.</div>
          </AnonymityAlert>
        )}
        
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

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
    color: var(--color-primary, #552a47);
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
  background: ${props => props.active ? 'var(--color-primary, #552a47)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-primary, #552a47)' : '#e0e0e0'};
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
  background: ${props => props.color || 'linear-gradient(90deg, var(--color-primary, #552a47) 0%, #7a4e7a 100%)'};
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

const ComingSoonBadge = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: left;
  
  @media (max-width: 992px) {
    text-align: center;
  }
`;

const FeatureIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
`;

const NotifyButton = styled.button`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(85, 42, 71, 0.3);
  }
`;

const KPIContent = styled.div`
  flex: 1;
`;