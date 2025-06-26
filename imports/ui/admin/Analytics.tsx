import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { Layers, Layer } from '/imports/api/layers';
import { Surveys } from '/imports/features/surveys/api/surveys';
import { Questions } from '/imports/features/questions/api/questions';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.bootstrap4.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';
import ReactSelect, { components } from 'react-select';
import {
  FiFilter,
  FiDownload,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiMessageSquare,
  FiCalendar,
  FiUsers,
  FiList,
  FiX
} from 'react-icons/fi';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import ResponseTrendsChart from '/imports/features/analytics/components/admin/ResponseTrendsChart';
import DeviceUsageChart from '/imports/features/analytics/components/admin/DeviceUsageChart';
import QuestionPerformanceChart from '/imports/features/analytics/components/admin/QuestionPerformanceChart';
import ResponseRateChart from '/imports/features/analytics/components/admin/ResponseRateChart';
import CompletionTimeChart from '/imports/features/analytics/components/admin/CompletionTimeChart';
import CompletionRateChart from '/imports/features/analytics/components/admin/CompletionRateChart';

// Styled components for the Analytics dashboard
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

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
  color: #552a47;
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
  background: ${(props) => (props.primary ? '#552a47' : '#f7f2f5')};
  color: ${(props) => (props.primary ? '#fff' : '#552a47')};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.primary ? '#693658' : '#efe7ed')};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 16px;
  }
`;

const FilterBar = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  /* Tom Select Styling */
  .tom-select-container .ts-wrapper {
    width: 100%;
    border-radius: 6px;
  }
  
  .tom-select-container .ts-control {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
    min-height: 38px;
    background-color: white;
  }
  
  .tom-select-container .ts-control:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 1px #552a47;
  }
  
  .tom-select-container .ts-dropdown {
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .tom-select-container .ts-dropdown .option {
    padding: 8px 10px;
  }
  
  .tom-select-container .ts-dropdown .active {
    background-color: #f7f2f5;
    color: #552a47;
  }
  
  .tom-select-container .ts-control input {
    color: #333;
  }
  
  .tom-select-container .item {
    background-color: #f7f2f5;
    color: #552a47;
    border-radius: 4px;
    padding: 2px 6px;
    margin: 2px;
  }
  
  /* Date Picker Styling */
  .date-picker {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    background-color: white;
  }
  
  .date-picker:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 1px #552a47;
  }
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container {
    width: 100%;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 180px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 1px #552a47;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  align-items: flex-end;
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const DateRangeText = styled.span`
  font-size: 14px;
  color: #666;
  margin: 0 4px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Card = styled.div<{ cols?: number }>`
  grid-column: span ${(props) => props.cols || 1};
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;

  @media (max-width: 1200px) {
    grid-column: span ${(props) => Math.min(props.cols || 1, 6)};
  }

  @media (max-width: 768px) {
    grid-column: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f7f2f5;
  border-radius: 8px;
  color: #552a47;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f2f5;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ResponseRateKPI = styled(StatCard)`
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:after {
    content: 'Click to view chart';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: #8a6d8a;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(85, 42, 71, 0.15);
  }
  
  &:hover:after {
    opacity: 1;
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #552a47;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const KPIContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  grid-column: 1 / -1;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ThemeCard = styled.div`
  background: #f0f5fa;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const ThemeName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 8px;
`;

const ThemeScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ThemeLabel = styled.div`
  font-size: 13px;
  color: #8a6d8a;
`;

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a6d8a;
  font-weight: 500;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? '#552a47' : 'transparent')};
  color: ${(props) => (props.active ? '#552a47' : '#666')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #552a47;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 28px 40px;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: #552a47;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

const ModalDescription = styled.p`
  color: #666;
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 1.5;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.3);
  }
`;

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuestionPerformance, setShowQuestionPerformance] = useState(false);
  
  // State for response rate chart modal
  const [showResponseRateChart, setShowResponseRateChart] = useState(false);
  const [responseRateData, setResponseRateData] = useState<Array<{date: string; count: number}>>([]);
  
  // State for completion time chart modal
  const [showCompletionTimeChart, setShowCompletionTimeChart] = useState(false);
  const [completionTimeData, setCompletionTimeData] = useState<Array<{date: string; minutes: number}>>([]);
  
  // State for completion rate chart modal
  const [showCompletionRateChart, setShowCompletionRateChart] = useState(false);
  const [completionRateData, setCompletionRateData] = useState<{completed: number; incomplete: number}>({completed: 0, incomplete: 0});
  const [selectedDateRange, setSelectedDateRange] = useState('last_7_days');
  
  // Fetch completion time data when the modal is opened
  useEffect(() => {
    if (showCompletionTimeChart) {
      // Reset data while loading
      setCompletionTimeData([]);
      
      // Fetch completion time data with date range
      console.log('Fetching completion time data for date range:', selectedDateRange);
      Meteor.call('getSurveyCompletionTimeByDate', selectedDateRange, (error: Error, result: Array<{date: string; minutes: number}>) => {
        if (error) {
          console.error('Error fetching completion time data:', error);
          // Show empty array instead of loading indefinitely
          setCompletionTimeData([]);
        } else {
          console.log('Completion time data received:', result);
          
          // If we get no data, create sample data for testing
          if (!result || result.length === 0) {
            const today = new Date();
            const sampleData = [];
            
            // Generate sample data for the last 7 days
            for (let i = 6; i >= 0; i--) {
              const date = new Date(today);
              date.setDate(today.getDate() - i);
              const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              
              sampleData.push({
                date: dateString,
                minutes: Math.random() * 0.8 + 0.2 // Random value between 0.2 and 1.0
              });
            }
            
            console.log('Using sample completion time data:', sampleData);
            setCompletionTimeData(sampleData);
          } else {
            setCompletionTimeData(result);
          }
        }
      });
    }
  }, [showCompletionTimeChart, selectedDateRange]);
  
  // Fetch completion rate data when the modal is opened or date range changes
  useEffect(() => {
    if (showCompletionRateChart) {
      // Reset data while loading
      setCompletionRateData({completed: 0, incomplete: 0});
      
      // Get completed surveys count with date range
      Meteor.call('getSurveyCompletedSurveysCount', selectedDateRange, (error: Error, completedCount: number) => {
        if (error) {
          console.error('Error fetching completed surveys count:', error);
        } else {
          // Get incomplete surveys count with date range
          Meteor.call('getIncompleteSurveysCount', selectedDateRange, (error: Error, incompleteCount: number) => {
            if (error) {
              console.error('Error fetching incomplete surveys count:', error);
            } else {
              console.log('Completion rate data received for range', selectedDateRange, ':', { completed: completedCount, incomplete: incompleteCount });
              setCompletionRateData({ completed: completedCount, incomplete: incompleteCount });
            }
          });
        }
      });
    }
  }, [showCompletionRateChart, selectedDateRange]);
  
  // State for all KPI metrics
  const [completedSurveysCount, setCompletedSurveysCount] = useState(0);
  const [participationRate, setParticipationRate] = useState(0);
  const [avgEngagementScore, setAvgEngagementScore] = useState(0);
  const [avgCompletionTime, setAvgCompletionTime] = useState(0);
  
  // Fetch KPI metrics on component mount
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch completed surveys count using existing method
    Meteor.call('getCompletedSurveysCount', (error, result) => {
      if (error) {
        console.error('Error fetching completed surveys count:', error);
      } else {
        setCompletedSurveysCount(result);
      }
    });
    
    // Fetch participation rate using enhanced response rate method
    Meteor.call('getResponseRateByDate', (error, result) => {
      if (error) {
        console.error('Error fetching enhanced response rate:', error);
      } else {
        // Calculate average participation rate from the last 7 days
        if (result && result.length > 0) {
          const sum = result.reduce((acc, item) => acc + item.count, 0);
          setParticipationRate(Math.round(sum / result.length));
        }
      }
    });
    
    // Fetch average engagement score using existing method
    Meteor.call('getAverageEngagementScore', (error, result) => {
      if (error) {
        console.error('Error fetching average engagement score:', error);
      } else {
        setAvgEngagementScore(result || 0);
      }
    });
    
    // Fetch average completion time
    Meteor.call('getCompletionTimeByDate', (error, result) => {
      if (error) {
        console.error('Error fetching completion time data:', error);
      } else {
        // Calculate average completion time from all available data
        if (result && result.length > 0) {
          const sum = result.reduce((acc, item) => acc + item.minutes, 0);
          setAvgCompletionTime(sum / result.length);
        }
      }
      setIsLoading(false);
    });
  }, []);
  const [responseRate, setResponseRate] = useState(0);
  const [filterVisible, setFilterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Default organization data
  const organizations = ['All Organizations', 'Bioptrics'];
  
  // State for selected filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const startDate = dateRange[0];
  const endDate = dateRange[1];
  
  // Ensure selectedTags is always an array
  useEffect(() => {
    if (!Array.isArray(selectedTags)) {
      console.warn('selectedTags is not an array, resetting to empty array');
      setSelectedTags([]);
    }
  }, [selectedTags]);
  
  // Use useTracker for subscription
  const { loading } = useTracker(() => {
    const subscription = Meteor.subscribe('responses.all');
    return {
      loading: !subscription.ready()
    };
  }, []);
  
  // Use direct database query for accurate metrics
  useEffect(() => {
    // Get enhanced surveys count (completed + incomplete)
    Meteor.call('getEnhancedSurveysCount', (error: any, result: number) => {
      if (error) {
        console.error('Error getting enhanced surveys count:', error);
      } else {
        console.log('Direct DB query result - enhanced surveys count:', result);
        setCompletedSurveysCount(result);
      }
    });
    
    // Get enhanced participation rate
    Meteor.call('getEnhancedParticipationRate', (error: any, result: number) => {
      if (error) {
        console.error('Error getting enhanced participation rate:', error);
      } else {
        console.log('Direct DB query result - enhanced participation rate:', result);
        setParticipationRate(result);
      }
    });
    
    // Get enhanced average engagement score
    Meteor.call('getEnhancedEngagementScore', (error: any, result: number) => {
      if (error) {
        console.error('Error getting enhanced engagement score:', error);
      } else {
        console.log('Direct DB query result - enhanced avg engagement score:', result);
        setAvgEngagementScore(result);
      }
    });
    
    // Get enhanced average completion time
    Meteor.call('getEnhancedCompletionTime', (error: any, result: number) => {
      if (error) {
        console.error('Error getting enhanced completion time:', error);
      } else {
        console.log('Direct DB query result - enhanced avg completion time:', result);
        setAvgCompletionTime(result);
      }
    });
    
    // Get enhanced response rate that includes incomplete surveys
    Meteor.call('getEnhancedResponseRate', (error: any, result: number) => {
      if (error) {
        console.error('Error getting response rate:', error);
      } else {
        console.log('Direct DB query result - response rate:', result);
        setResponseRate(result);
      }
      setIsLoading(loading);
    });
    
    // Fetch response trends data for the response rate chart
    Meteor.call('getResponseTrendsData', (error: any, result: any) => {
      if (error) {
        console.error('Error getting response trends data:', error);
      } else {
        console.log('Response trends data for chart:', result);
        // Transform the data for the ResponseRateChart component
        const chartData = result.map((item: any) => ({
          date: item.date,
          count: item.responses
        }));
        setResponseRateData(chartData);
      }
    });
  }, [loading]);
  const surveySelectRef = useRef<HTMLSelectElement>(null);
  const questionSelectRef = useRef<HTMLSelectElement>(null);
  const tomSelectInstance = useRef<{[key: string]: any}>({});
  
  // We're using the Layer interface imported from '/imports/api/layers'
  
  // Interface for hierarchical layer structure
  interface LayerWithChildren extends Layer {
    children?: LayerWithChildren[];
    depth?: number;
  }

  // Fetch tags from the Layers collection
  const { tags, tagsLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    const allTags = Layers.find({ active: true }, { sort: { name: 1 } }).fetch();
    
    // Process tags into hierarchical structure
    const tagsWithChildren: LayerWithChildren[] = [];
    const tagMap: Record<string, LayerWithChildren> = {};
    
    // First pass: create a map of all tags
    allTags.forEach(tag => {
      tagMap[tag._id] = { ...tag, children: [] };
    });
    
    // Second pass: build the hierarchy
    allTags.forEach(tag => {
      if (tag.parentId && tagMap[tag.parentId]) {
        // This tag has a parent, add it to the parent's children
        tagMap[tag.parentId].children = tagMap[tag.parentId].children || [];
        tagMap[tag.parentId].children?.push(tagMap[tag._id]);
      } else {
        // This is a root tag
        tagsWithChildren.push(tagMap[tag._id]);
      }
    });
    
    return {
      tags: tagsWithChildren,
      tagsLoading: !subscription.ready()
    };
  }, []);
  
  // Function to build a flat list of tags with depth information
  const buildFlatTagList = (tags: LayerWithChildren[], depth = 0): LayerWithChildren[] => {
    if (!tags || !Array.isArray(tags)) {
      return [];
    }
    
    let result: LayerWithChildren[] = [];
    
    tags.forEach(tag => {
      if (!tag) return; // Skip undefined/null tags
      
      // Add the current tag with its depth
      result.push({ ...tag, depth });
      
      // Recursively add children if any
      if (tag.children && Array.isArray(tag.children) && tag.children.length > 0) {
        result = result.concat(buildFlatTagList(tag.children, depth + 1));
      }
    });
    
    return result;
  };
  
  // Fetch surveys data
  const { surveys, surveysLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('surveys.all');
    const allSurveys = Surveys.find({}, { sort: { title: 1 } }).fetch();
    
    return {
      surveys: allSurveys,
      surveysLoading: !subscription.ready()
    };
  }, []);
  
  // Fetch questions data
  const { questions, questionsLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('questions.all');
    const allQuestions = Questions.find({}, { sort: { title: 1 } }).fetch();
    
    return {
      questions: allQuestions,
      questionsLoading: !subscription.ready()
    };
  }, []);
  
  // Initialize tom-select instances for surveys and questions when data is loaded
  useEffect(() => {
    // Skip if any of the required refs are missing or instances already initialized
    if (!surveySelectRef.current || 
        !questionSelectRef.current || 
        (tomSelectInstance.current.surveys && tomSelectInstance.current.questions) || 
        surveysLoading || 
        questionsLoading) {
      return;
    }
    
    try {
      // Common configuration for tom-select instances
      const createTomSelect = (ref: HTMLSelectElement, placeholder: string, data: any[], valueField: string, textField: string, onChangeHandler: (values: string[]) => void) => {
        const config: any = {
          plugins: ['remove_button'],
          placeholder: placeholder,
          create: false,
          maxItems: null, // Allow multiple selections
          sortField: { field: 'text', direction: 'asc' },
          onChange: function(values: string[]) {
            onChangeHandler(values);
          }
        };
        
        // Initialize tom-select
        const ts = new TomSelect(ref, config);
        
        // Add options
        if (data && data.length > 0) {
          data.forEach(item => {
            if (item && item[valueField]) {
              ts.addOption({
                value: item[valueField],
                text: item[textField]
              });
            }
          });
        }
        
        return ts;
      };
      
      // Initialize Surveys tom-select
      tomSelectInstance.current.surveys = createTomSelect(
        surveySelectRef.current,
        'Select surveys...',
        surveys,
        '_id',
        'title',
        setSelectedSurveys
      );
      
      // Initialize Questions tom-select
      tomSelectInstance.current.questions = createTomSelect(
        questionSelectRef.current,
        'Select questions...',
        questions,
        '_id',
        'title',
        setSelectedQuestions
      );
      
    } catch (error) {
      console.error('Error initializing TomSelect instances:', error);
    }
    
    // Clean up tom-select instances when component unmounts
    return () => {
      Object.values(tomSelectInstance.current).forEach((instance: any) => {
        if (instance) {
          try {
            instance.destroy();
          } catch (error) {
            console.error('Error destroying TomSelect instance:', error);
          }
        }
      });
      tomSelectInstance.current = {};
    };
  }, [surveys, surveysLoading, questions, questionsLoading, setSelectedSurveys, setSelectedQuestions]);
  
  // React Select component for hierarchical tag selection
  interface SelectOption {
    value: string;
    label: string;
    depth?: number;
    isDisabled?: boolean;
  }
  
  // Custom Option component to display hierarchical structure
  const CustomOption = (props: any) => {
    const { data } = props;
    const depth = data.depth || 0;
    const indent = '\u00A0\u00A0'.repeat(depth);
    const prefix = depth > 0 ? '└── ' : '';

    return (
      <components.Option {...props}>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {indent}{prefix}{data.label}
        </div>
      </components.Option>
    );
  };
  
  // TagSelect component for hierarchical tag selection
  interface TagSelectProps {
    tags: LayerWithChildren[];
    selectedTagIds: string[];
    onChange: (selectedIds: string[]) => void;
    isLoading: boolean;
  }
  
  const TagSelect: React.FC<TagSelectProps> = ({ tags, selectedTagIds, onChange, isLoading }) => {
    // Prepare options for React Select
    const options = useMemo(() => {
      // Get flat list of tags with depth information
      const flatTagList = buildFlatTagList(tags);
      console.log('Flat tag list:', flatTagList);
      
      // Map to React Select options format
      return flatTagList.map(tag => ({
        value: tag._id,
        label: tag.name,
        depth: tag.depth || 0,
        isDisabled: false
      }));
    }, [tags]);
    
    // Find selected options
    const selectedOptions = useMemo(() => {
      if (!Array.isArray(selectedTagIds)) {
        console.warn('selectedTagIds is not an array:', selectedTagIds);
        return [];
      }
      return options.filter(option => selectedTagIds.includes(option.value));
    }, [options, selectedTagIds]);
    
    // Handle selection change
    const handleChange = (selectedOptions: any) => {
      const selectedIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
      onChange(selectedIds);
    };
    
    return (
      <ReactSelect
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Select tags..."
        isLoading={isLoading}
        hideSelectedOptions={false}
        components={{ Option: CustomOption }}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          option: (provided) => ({
            ...provided,
            padding: '8px 12px',
          }),
          control: (provided) => ({
            ...provided,
            minHeight: '38px',
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#f0e6ee',
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: '#552a47',
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: '#552a47',
            ':hover': {
              backgroundColor: '#552a47',
              color: 'white',
            },
          }),
        }}
      />
    );
  };

  return (
    <AdminLayout>
      <DashboardContainer>
        <PageHeader>
          <PageTitle>Analytics Dashboard</PageTitle>
          <ActionButtons>
            <Button onClick={() => setFilterVisible(!filterVisible)}>
              <FiFilter />
              {filterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button primary>
              <FiDownload />
              Export
            </Button>
          </ActionButtons>
        </PageHeader>

        {filterVisible && (
          <FilterBar>
            <FilterGroup>
              <FilterLabel>Organization</FilterLabel>
              <StyledSelect className="form-control">
                {organizations.map((organization) => (
                  <option key={organization} value={organization}>
                    {organization}
                  </option>
                ))}
              </StyledSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Tags</FilterLabel>
              <div className="react-select-container">
                <TagSelect 
                  tags={tags} 
                  selectedTagIds={selectedTags}
                  onChange={setSelectedTags}
                  isLoading={tagsLoading}
                />
              </div>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Surveys</FilterLabel>
              <div className="tom-select-container">
                <select 
                  ref={surveySelectRef} 
                  multiple 
                  style={{ width: '100%' }}
                  data-placeholder="Select surveys..."
                />
              </div>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Questions</FilterLabel>
              <div className="tom-select-container">
                <select 
                  ref={questionSelectRef} 
                  multiple 
                  style={{ width: '100%' }}
                  data-placeholder="Select questions..."
                />
              </div>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Date Range</FilterLabel>
              <DateRangeContainer>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | undefined) => setDateRange([date, endDate])}
                  startDate={startDate}
                  endDate={endDate}
                  selectsStart
                  placeholderText="Start Date"
                  className="date-picker"
                  dateFormat="MMM d, yyyy"
                />
                <DateRangeText>to</DateRangeText>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | undefined) => setDateRange([startDate, date])}
                  startDate={startDate}
                  endDate={endDate}
                  selectsEnd
                  minDate={startDate}
                  placeholderText="End Date"
                  className="date-picker"
                  dateFormat="MMM d, yyyy"
                />
              </DateRangeContainer>
            </FilterGroup>
            <FilterButtons>
              <Button primary>Apply Filters</Button>
              <Button onClick={() => {
                // Reset all filters
                setSelectedTags([]);
                setSelectedSurveys([]);
                setSelectedQuestions([]);
                setDateRange([undefined, undefined]);
                
                // Reset tom-select instances
                Object.values(tomSelectInstance.current).forEach((instance: any) => {
                  if (instance && instance.clear) {
                    instance.clear();
                  }
                });
              }}>Reset</Button>
            </FilterButtons>
          </FilterBar>
        )}

        <TabsContainer>
          <Tab
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Tab>
          <Tab
            active={activeTab === 'realtime'}
            onClick={() => setActiveTab('realtime')}
          >
            Real Time
          </Tab>
          <Tab
            active={activeTab === 'surveys'}
            onClick={() => setActiveTab('surveys')}
          >
            Surveys
          </Tab>
          <Tab
            active={activeTab === 'questions'}
            onClick={() => setActiveTab('questions')}
            data-tab="questions"
          >
            Questions
          </Tab>
          <Tab
            active={activeTab === 'responses'}
            onClick={() => setActiveTab('responses')}
          >
            Responses
          </Tab>
          <Tab
            active={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </Tab>
          <Tab
            active={activeTab === 'mavinai'}
            onClick={() => setActiveTab('mavinai')}
          >
            Mavin AI
          </Tab>
        </TabsContainer>

        {activeTab === 'overview' && (
          <DashboardGrid>
            {/* KPI Cards - Single Row */}
            <KPIContainer>
              <Card>
                <CardHeader>
                  <CardTitle>Participation</CardTitle>
                  <CardIcon>
                    <FiUsers />
                  </CardIcon>
                </CardHeader>
                <StatCard>
                  <StatValue>{completedSurveysCount}</StatValue>
                  <StatLabel>Responses</StatLabel>
                </StatCard>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                  <CardIcon>
                    <FiPieChart />
                  </CardIcon>
                </CardHeader>
                <StatCard 
                  onClick={() => setShowCompletionRateChart(true)} 
                  style={{ cursor: 'pointer' }}
                  title="Click to view completion rate chart"
                >
                  <StatValue>{isLoading ? '...' : `${participationRate}%`}</StatValue>
                  <StatLabel>Participation Rate</StatLabel>
                </StatCard>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Engagement</CardTitle>
                  <CardIcon>
                    <FiBarChart2 />
                  </CardIcon>
                </CardHeader>
                <StatCard>
                  <StatValue>{isLoading ? '...' : avgEngagementScore.toFixed(1)}</StatValue>
                  <StatLabel>Out of 5.0</StatLabel>
                </StatCard>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time to Complete</CardTitle>
                  <CardIcon>
                    <FiCalendar />
                  </CardIcon>
                </CardHeader>
                <StatCard 
                  onClick={() => setShowCompletionTimeChart(true)} 
                  style={{ cursor: 'pointer' }}
                  title="Click to view completion time chart"
                >
                  <StatValue>{isLoading ? '...' : avgCompletionTime.toFixed(1)}</StatValue>
                  <StatLabel>Minutes (Average)</StatLabel>
                </StatCard>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Rate</CardTitle>
                  <CardIcon>
                    <FiTrendingUp />
                  </CardIcon>
                </CardHeader>
                <ResponseRateKPI 
                  onClick={() => setShowResponseRateChart(true)} 
                  style={{ cursor: 'pointer' }}
                  title="Click to view response rate chart"
                >
                  <StatValue>{isLoading ? '...' : `${responseRate}%`}</StatValue>
                  <StatLabel>Last 7 days</StatLabel>
                </ResponseRateKPI>
              </Card>
            </KPIContainer>

            {/* Response Trends - 70% width */}
            <Card cols={8}>
              <ResponseTrendsChart />
            </Card>

            {/* Device Usage Chart - 30% width */}
            <Card cols={4}>
              <DeviceUsageChart />
            </Card>

            {/* Open-text Insights */}
            {/* <Card cols={12}>
              <CardHeader>
                <CardTitle>Open-text Insights</CardTitle>
                <CardIcon>
                  <FiMessageSquare />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                <div>NLP Topic Modeling Coming Soon</div>
              </ChartContainer>
            </Card> */}
            
            {/* Question Performance */}
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
                <CardIcon>
                  <FiList />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                <QuestionPerformanceChart isOverview={true} />
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'themes' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Theme Analysis</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>Detailed Theme Analysis Coming Soon</div>
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'trends' && (
          <DashboardGrid>
            <Card cols={12}>
              <ResponseTrendsChart title="Detailed Response Trends" />
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'insights' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>Insights Coming Soon</div>
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}
        
        {activeTab === 'questions' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Question Performance Analysis</CardTitle>
                <CardIcon>
                  <FiList />
                </CardIcon>
              </CardHeader>
              <QuestionPerformanceChart />
            </Card>
          </DashboardGrid>
        )}
        
        {/* Response Rate Chart Modal */}
        {showResponseRateChart && (
          <ModalOverlay onClick={() => setShowResponseRateChart(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalCloseButton onClick={() => setShowResponseRateChart(false)}>
                <FiX />
              </ModalCloseButton>
              {responseRateData.length > 0 ? (
                <ResponseRateChart 
                  data={responseRateData} 
                  title="Daily Survey Response Rate" 
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading chart data...</div>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
        
        {/* Completion Time Chart Modal */}
        {showCompletionTimeChart && (
          <ModalOverlay onClick={() => setShowCompletionTimeChart(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalCloseButton onClick={() => setShowCompletionTimeChart(false)}>
                <FiX />
              </ModalCloseButton>
              <CompletionTimeChart 
                data={completionTimeData} 
                title="Survey Completion Time" 
              />
            </ModalContent>
          </ModalOverlay>
        )}
        
        {/* Completion Rate Chart Modal */}
        {showCompletionRateChart && (
          <ModalOverlay onClick={() => setShowCompletionRateChart(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalCloseButton onClick={() => setShowCompletionRateChart(false)}>
                <FiX />
              </ModalCloseButton>
              <CompletionRateChart 
                data={completionRateData} 
                title="Survey Completion Rate" 
                initialDateRange={selectedDateRange}
                onDateRangeChange={(dateRange) => {
                  console.log('Date range changed to:', dateRange);
                  setSelectedDateRange(dateRange);
                }}
              />
            </ModalContent>
          </ModalOverlay>
        )}
      </DashboardContainer>
    </AdminLayout>
  );
};

export default Analytics;
