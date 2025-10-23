import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tracker } from 'meteor/tracker';
import ProgressModal from '../components/ProgressModal';
import { progressTracker, ProgressStage } from '../services/ProgressTracker';
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
import { useResponseRateData } from './hooks/useResponseRateData';
import { useParticipantData } from './hooks/useParticipantData';
import { useCompletionTimeData } from './hooks/useCompletionTimeData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import tab components
import AllTabsContainer, { TabItem } from './AllTabsContainer';
import AllOverviewTab from './tabs/AllOverviewTab';
import AllQuestionsTab, { QuestionsTabRef } from './tabs/AllQuestionsTab';
import { exportQuestionsToPDF } from './hooks/AllAnalyticsSurveyQuestionPdf';
import ExportOptionsModal from './components/ExportOptionsModal';
// import GroupsTab from './tabs/GroupsTab';
import AllCommentsTab from './tabs/AllCommentsTab';
import AllActivityTab from './tabs/AllActivityTab';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

// Define interfaces for props and state
interface AnalyticsProps {
  surveyId?: string; // Make surveyId optional
}

export interface FilterParams {
  surveyIds?: string[];
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
  width: 100%;
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
  
  &[multiple] {
    background-image: none;
    overflow-y: auto;
    padding: 0;
    
    option {
      padding: 8px 12px;
      
      &:checked {
        background-color: var(--color-primary, #552a47);
        color: white;
      
      &:hover:not(:checked) {
        background-color: #f3f4f6;
      }
    }
`;

// Custom dropdown components
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background-color: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    border-color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #552a47);
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.2);
  }
`;

const DropdownIcon = styled.div<{ isOpen: boolean }>`
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #1f2937;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #552a47);
  }
`;

const OptionsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const OptionItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  font-size: 14px;
  color: #1f2937;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#f3f4f6' : 'transparent'};
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const Checkbox = styled.div<{ isSelected: boolean }>`
  width: 16px;
  height: 16px;
  border: 1px solid ${props => props.isSelected ? 'var(--color-primary, #552a47)' : '#d1d5db'};
  border-radius: 3px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? 'var(--color-primary, #552a47)' : 'transparent'};
  
  &:after {
    content: '';
    display: ${props => props.isSelected ? 'block' : 'none'};
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-bottom: 2px;
  }
`;

const SelectedCount = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  text-align: center;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const Chip = styled.div`
  background-color: #f3f4f6;
  border-radius: 16px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChipRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  padding: 0;
  font-size: 14px;
  
  &:hover {
    color: #ef4444;
  }
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
  color: var(--color-primary, #552a47);
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
  background-color: var(--color-primary, #552a47);
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
  color: var(--color-primary, #552a47);
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
  background-color: var(--color-primary, #552a47);
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
  surveyId?: string; // Original surveyId (if any)
  filterParams?: FilterParams; // Filter parameters including selected survey IDs
}

const ResponseRateContent: React.FC<ResponseRateContentProps> = ({ surveyId, filterParams }) => {
  // If filterParams has surveyIds, use those; otherwise fall back to the original surveyId
  const effectiveSurveyId = filterParams?.surveyIds?.length ? undefined : surveyId;
  const { rate, trend, isLoading, error } = useResponseRateData(effectiveSurveyId, filterParams);
  
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
  surveyId?: string; // Original surveyId (if any)
  filterParams?: FilterParams; // Filter parameters including selected survey IDs
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({ surveyId, filterParams }) => {
  // If filterParams has surveyIds, use those; otherwise fall back to the original surveyId
  const effectiveSurveyId = filterParams?.surveyIds?.length ? undefined : surveyId;
  const { count, trend, isLoading, error } = useParticipantData(effectiveSurveyId, filterParams);
  
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
  surveyId?: string; // Original surveyId (if any)
  filterParams?: FilterParams; // Filter parameters including selected survey IDs
}

const CompletionTimeContent: React.FC<CompletionTimeContentProps> = ({ surveyId, filterParams }) => {
  // If filterParams has surveyIds, use those; otherwise fall back to the original surveyId
  const effectiveSurveyId = filterParams?.surveyIds?.length ? undefined : surveyId;
  const { time, trend, isLoading, error } = useCompletionTimeData(effectiveSurveyId, filterParams);
  
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

// MultiSelectDropdown component
interface MultiSelectDropdownProps {
  options: Array<{ _id: string; title: string; isOwned?: boolean; isSharedWithMe?: boolean }>;
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter options based on search term
  const filteredOptions = options.filter((option: { _id: string; title: string }) => 
    !searchTerm || option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle option selection
  const toggleOption = (optionId: string) => {
    if (optionId === '') {
      // If 'All Surveys' is selected, clear the selection
      onChange([]);
    } else {
      const newSelectedValues = selectedValues.includes(optionId)
        ? selectedValues.filter(id => id !== optionId)
        : [...selectedValues, optionId];
      onChange(newSelectedValues);
    }
  };
  
  // Get display text for the button
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return 'All Surveys';
    } else if (selectedValues.length === 1) {
      const selectedOption = options.find(option => option._id === selectedValues[0]);
      return selectedOption ? selectedOption.title : placeholder;
    } else {
      return `${selectedValues.length} surveys selected`;
    }
  };
  
  // Remove a selected option
  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(id => id !== optionId));
  };
  
  return (
    <DropdownContainer ref={dropdownRef}>
      {label && <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>{label}</label>}
      
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <span>{getDisplayText()}</span>
        <DropdownIcon isOpen={isOpen}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </DropdownIcon>
      </DropdownButton>
      
      {selectedValues.length > 0 && (
        <ChipContainer>
          {selectedValues.map(id => {
            const option = options.find(opt => opt._id === id);
            return option ? (
              <Chip key={id}>
                {option.title}
                <ChipRemove onClick={(e) => removeOption(id, e)}>
                  ×
                </ChipRemove>
              </Chip>
            ) : null;
          })}
        </ChipContainer>
      )}
      
      <DropdownMenu isOpen={isOpen}>
        <SearchInput 
          placeholder="Search surveys..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        
        <OptionsList>
          <div style={{ 
            padding: '8px 12px', 
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '8px',
            fontSize: '12px', 
            fontWeight: 600, 
            color: '#6b7280'
          }}>
            Select surveys:
          </div>
          
          <OptionItem 
            isSelected={selectedValues.length === 0} 
            onClick={() => toggleOption('')}
          >
            <Checkbox isSelected={selectedValues.length === 0} />
            All Surveys
          </OptionItem>
          
          {filteredOptions.map(option => (
            <OptionItem 
              key={option._id} 
              isSelected={selectedValues.includes(option._id)}
              onClick={() => toggleOption(option._id)}
            >
              <Checkbox isSelected={selectedValues.includes(option._id)} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{option.title}</span>
                {option.isOwned && (
                  <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 500 }}>My Survey</span>
                )}
                {option.isSharedWithMe && (
                  <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 500 }}>Shared with me</span>
                )}
              </div>
            </OptionItem>
          ))}
          
          {filteredOptions.length === 0 && (
            <div style={{ padding: '8px 12px', color: '#6b7280', fontSize: '14px' }}>
              No surveys found
            </div>
          )}
        </OptionsList>
        
        {selectedValues.length > 0 && (
          <SelectedCount>
            {selectedValues.length} {selectedValues.length === 1 ? 'survey' : 'surveys'} selected
          </SelectedCount>
        )}
      </DropdownMenu>
    </DropdownContainer>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({ surveyId }) => {
  // Ref for QuestionsTab component
  const questionsTabRef = useRef<QuestionsTabRef>(null);
  
  // State for PDF export
  const [exportingPDF, setExportingPDF] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  
  // State for surveys
  const [availableSurveys, setAvailableSurveys] = useState<Array<{_id: string, title: string, isOwned?: boolean, isSharedWithMe?: boolean}>>([]);
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<string[]>(surveyId ? [surveyId] : []);
  
  // No longer using ownership filter state
  
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
    surveyIds: selectedSurveyIds // Use selectedSurveyIds
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // First, get the survey IDs that the user has access to
      let accessibleSurveyIds: string[] = [];
      try {
        accessibleSurveyIds = await new Promise<string[]>((resolve, reject) => {
          Meteor.call('surveys.getAccessibleSurveyIds', { surveyIds: filterParams.surveyIds }, (error: Error, result: string[]) => {
            if (error) {
              console.error('Error fetching accessible survey IDs:', error);
              reject(error);
            } else {
              console.log('Accessible survey IDs:', result);
              resolve(result);
            }
          });
        });
      } catch (error) {
        console.error('Failed to get accessible survey IDs:', error);
        // Continue with empty array if there's an error
      }
      
      // Create effective filter params with the accessible survey IDs
      const effectiveFilterParams = {
        ...filterParams,
        surveyIds: accessibleSurveyIds
      };
      
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
          Meteor.call('getFilteredSurveysCount', effectiveFilterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredParticipationRate', effectiveFilterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredResponseRate', effectiveFilterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredEngagementScore', effectiveFilterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result || 0);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredCompletionTime', effectiveFilterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<any[]>((resolve, reject) => {
          Meteor.call('getResponseTrendsData', effectiveFilterParams, (error: Error, result: any[]) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  // Fetch analytics data when filterParams changes
  useEffect(() => {
    // Only fetch if we're not in the initial render
    if (Object.keys(filterParams).length > 0) {
      fetchAnalyticsData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);
  
  // No handlers for date range, tags, or status since we removed those filters

  // Reset filters
  const resetFilters = () => {
    // Reset to initial survey selection based on surveyId prop
    const initialSurveyIds = surveyId ? [surveyId] : [];
    setSelectedSurveyIds(initialSurveyIds);
    setFilterParams({
      surveyIds: initialSurveyIds
    });
  };

  // Format time for display (e.g., 4:32)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to show export options modal
  const handleExportButtonClick = () => {
    setShowExportModal(true);
  };
  
  // Function to handle PDF export
  const handleExportPDF = (exportType: 'standard' | 'ranked' = 'standard') => {
    setShowExportModal(false);
    setExportingPDF(true);
    
    // Start progress tracking
    progressTracker.start();
    
    // Function to check if questions data is loaded
    const isQuestionsDataLoaded = async () => {
      if (questionsTabRef.current) {
        try {
          const questions = await questionsTabRef.current.getAnalyticsQuestions();
          return questions && questions.length > 0;
        } catch (error) {
          console.error('Error checking if questions data is loaded:', error);
          return false;
        }
      }
      return false;
    };
    
    // Function to wait for data to load with multiple attempts
    const waitForQuestionsData = async (attempts = 0, maxAttempts = 5) => {
      try {
        const dataLoaded = await isQuestionsDataLoaded();
        if (dataLoaded) {
          // Data is loaded, continue with export
          continueExport();
        } else if (attempts < maxAttempts) {
          // Wait longer and try again
          console.log(`Waiting for questions data to load... Attempt ${attempts + 1}/${maxAttempts}`);
          setTimeout(() => {
            waitForQuestionsData(attempts + 1, maxAttempts);
          }, 1000); // Wait 1 second between attempts
        } else {
          // Give up after max attempts
          console.error('Failed to load questions data after multiple attempts');
          alert('Unable to load questions data. Please try again.');
          setExportingPDF(false);
        }
      } catch (error) {
        console.error('Error in waitForQuestionsData:', error);
        alert('Error checking questions data. Please try again.');
        setExportingPDF(false);
      }
    };
    
    // Always switch to the Questions tab first to ensure data is loaded
    const questionsTabIndex = tabs.findIndex(tab => tab.id === 'questions');
    if (questionsTabIndex !== -1) {
      const tabsContainer = document.querySelector('[role="tablist"]');
      const tabButtons = tabsContainer?.querySelectorAll('button[role="tab"]');
      if (tabButtons && tabButtons[questionsTabIndex]) {
        // Check if we're already on the Questions tab
        const isActive = tabButtons[questionsTabIndex].getAttribute('aria-selected') === 'true';
        if (!isActive) {
          // Click the Questions tab and wait for data to load
          console.log('Switching to Questions tab...');
          (tabButtons[questionsTabIndex] as HTMLButtonElement).click();
          
          // Wait for questions data to load with multiple attempts
          setTimeout(() => {
            console.log('Starting to check for questions data after tab switch...');
            waitForQuestionsData();
          }, 2000); // Increased wait time after tab switch to ensure data starts loading
          return;
        }
      }
    }
    
    // If we're already on the Questions tab, check if data is loaded
    isQuestionsDataLoaded().then(dataLoaded => {
      if (dataLoaded) {
        continueExport();
      } else {
        // Data not loaded yet, wait for it
        waitForQuestionsData();
      }
    }).catch(error => {
      console.error('Error checking if questions data is loaded:', error);
      waitForQuestionsData();
    });
    
    // Function to continue with export after ensuring we're on the Questions tab
    async function continueExport() {
      try {
        // Update progress - Initializing
        progressTracker.setStage('INITIALIZING');
        
        // Get all available surveys if "All Surveys" is selected
        const getAllSurveys = async () => {
          return new Promise<string[]>((resolve) => {
            Meteor.call('surveys.getAllSurveys', (error: any, result: any) => {
              if (error) {
                console.error('Error fetching all surveys:', error);
                resolve([]);
              } else {
                // Extract survey IDs from the result
                const allSurveyIds = result.map((survey: any) => survey.id || survey._id);
                resolve(allSurveyIds);
              }
            });
          });
        };
        
        // Determine which surveys to export
        const getSurveysToExport = async () => {
          if (surveyId) {
            // If we have a specific surveyId from the URL, use that
            return [surveyId];
          } else if (filterParams.surveyIds && filterParams.surveyIds.length > 0) {
            // Use the selected surveys from the filter
            return filterParams.surveyIds;
          } else {
            // If no surveys are explicitly selected, get all available surveys
            return await getAllSurveys();
          }
        };
        
        // Update progress - Fetching surveys
        progressTracker.setStage('FETCHING_SURVEYS');
        progressTracker.updateStageProgress('FETCHING_SURVEYS', 30);
        
        // Get surveys to export
        const surveysToExport = await getSurveysToExport();
        
        // Check if we have any surveys to export
        if (!surveysToExport || surveysToExport.length === 0) {
          alert('No surveys available to export');
          setExportingPDF(false);
          progressTracker.complete();
          return;
        }
        
        // Update progress - Fetching surveys complete
        progressTracker.updateStageProgress('FETCHING_SURVEYS', 100);
        
        // Show loading message for fetching all questions
        setExportingPDF(true);
        
        // Update progress - Fetching questions
        progressTracker.setStage('FETCHING_QUESTIONS', `Fetching data for ${surveysToExport.length} survey(s)`);
        
        // Get all questions data - this will fetch all questions, not just the current page
        const refQuestions = await questionsTabRef.current?.getAnalyticsQuestions();
        
        // Double-check that we have questions data
        if (!refQuestions || refQuestions.length === 0) {
          console.error('Questions data still not available after waiting');
          alert('Unable to load questions data. Please try again.');
          setExportingPDF(false);
          progressTracker.complete();
          return;
        }
        
        // Update progress - Questions fetched
        progressTracker.updateStageProgress('FETCHING_QUESTIONS', 100);
        progressTracker.setStage('PROCESSING_QUESTIONS', `Processing ${refQuestions.length} questions`);
        
        console.log(`Preparing to export PDF with ${refQuestions.length} questions`);
        
        // Update progress - Processing questions
        let processedCount = 0;
        const totalQuestions = refQuestions.length;
        const updateInterval = setInterval(() => {
          processedCount += Math.floor(totalQuestions / 10); // Simulate processing 10% of questions at a time
          if (processedCount >= totalQuestions) {
            clearInterval(updateInterval);
            processedCount = totalQuestions;
          }
          const progressPercent = Math.min(100, Math.round((processedCount / totalQuestions) * 100));
          progressTracker.updateStageProgress('PROCESSING_QUESTIONS', progressPercent);
          progressTracker.setAdditionalInfo(`Processing ${processedCount} of ${totalQuestions} questions`);
        }, 300);
        
        // Update progress - Generating charts
        setTimeout(() => {
          clearInterval(updateInterval);
          progressTracker.updateStageProgress('PROCESSING_QUESTIONS', 100);
          progressTracker.setStage('GENERATING_CHARTS', 'Generating charts and visualizations');
          
          // Simulate chart generation progress
          let chartProgress = 0;
          const chartInterval = setInterval(() => {
            chartProgress += 10;
            if (chartProgress >= 100) {
              clearInterval(chartInterval);
              chartProgress = 100;
              
              // Final stage - Compiling PDF
              progressTracker.updateStageProgress('GENERATING_CHARTS', 100);
              progressTracker.setStage('COMPILING_PDF', 'Finalizing PDF document');
              
              // Proceed with actual export
              setTimeout(() => {
                // Proceed with export based on number of surveys
                if (surveysToExport.length > 1) {
                  // For multiple surveys
                  exportQuestionsToPDF(refQuestions, {
                    surveyTitle: 'Multiple Surveys',
                    surveyDescription: `Export of ${surveysToExport.length} selected surveys`,
                    surveyIds: surveysToExport, // Pass all survey IDs for better organization
                    exportType: exportType // Add export type
                  });
                } else {
                  // For a single survey
                  const singleSurveyId = surveysToExport[0];
                  exportQuestionsToPDF(refQuestions, {
                    surveyTitle: surveyTitle,
                    surveyDescription: surveyDescription,
                    surveyId: singleSurveyId,
                    exportType: exportType // Add export type
                  });
                }
                
                // Complete the progress tracking
                setTimeout(() => {
                  progressTracker.complete();
                  // Reset the exporting state to return the button to normal
                  setExportingPDF(false);
                }, 1000);
              }, 1000);
            }
            progressTracker.updateStageProgress('GENERATING_CHARTS', chartProgress);
          }, 200);
        }, 1000);
      } catch (error) {
        console.error('Error in PDF export process:', error);
        alert('Error preparing PDF export. Please try again.');
        setExportingPDF(false);
        progressTracker.complete();
      }
    }
  };

  // Fetch available surveys
  const fetchAvailableSurveys = useCallback(() => {
    Meteor.call('surveys.getAllSurveys', { includeCollaborators: true }, (error: any, result: any) => {
      if (error) {
        console.error('Error fetching available surveys:', error);
      } else {
        console.log('Fetched available surveys:', result);
        
        // Process surveys to add ownership information
        const userId = Meteor.userId();
        const processedSurveys = result.map((survey: any) => ({
          ...survey,
          isOwned: survey.createdBy === userId,
          isSharedWithMe: survey.createdBy !== userId && 
                        (survey.collaborators || []).some((c: any) => c.userId === userId)
        }));
        
        setAvailableSurveys(processedSurveys);
      }
    });
  }, []);

  // Handle survey selection - now handled directly by the MultiSelectDropdown component
  // The useEffect below will update filterParams when selectedSurveyIds changes

  // Update filterParams when selectedSurveyIds changes
  useEffect(() => {
    setFilterParams(prev => ({
      ...prev,
      surveyIds: selectedSurveyIds
    }));
  }, [selectedSurveyIds]);

  // Fetch survey details
  useEffect(() => {
    // Fetch all available surveys
    fetchAvailableSurveys();
    
    // Fetch survey details for PDF export only if a specific survey is selected
    if (surveyId) {
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
    } else {
      // Set default title for all surveys view
      setSurveyTitle('All Surveys');
      setSurveyDescription('Analytics for all surveys');
    }
    
  }, [surveyId, fetchAvailableSurveys]);
  // Initial data fetch on component mount
  useEffect(() => {
    fetchAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <ParticipantsContent surveyId={surveyId} filterParams={filterParams} />
                </KpiContent>
              </KpiCard>
              
              <KpiCard>
                <KpiIcon>
                  <FaPercentage size={24} />
                </KpiIcon>
                <KpiContent>
                  <h4>Response Rate</h4>
                  <ResponseRateContent surveyId={surveyId} filterParams={filterParams} />
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
                  <CompletionTimeContent surveyId={surveyId} filterParams={filterParams} />
                </KpiContent>
              </KpiCard>
            </KpiSection>
          ) : null}
          
          <AllOverviewTab analyticsData={analyticsData} isLoading={isLoading} surveyId={surveyId} filterParams={filterParams} />
          
          {/* No additional components needed */}
        </>
      )
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: <FiFileText size={16} />,
      content: <AllQuestionsTab ref={questionsTabRef} isLoading={isLoading} surveyId={surveyId} filterParams={filterParams} />
    }
    // {
    //   id: 'groups',
    //   label: 'Groups',
    //   icon: <FiUsers size={16} />,
    //   content: <GroupsTab isLoading={isLoading} />
    // },
    // {
    //   id: 'comments',
    //   label: 'Comments',
    //   icon: <FiMessageSquare size={16} />,
    //   content: <AllCommentsTab isLoading={isLoading} />
    // },
    // {
    //   id: 'activity',
    //   label: 'Activity',
    //   icon: <FiActivity size={16} />,
    //   content: <AllActivityTab isLoading={isLoading} />
    // }
  ];

  // Track progress for the modal
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Set up reactive tracking of progress
  useEffect(() => {
    // Create a tracker to update our state when progress changes
    const progressComputation = Tracker.autorun(() => {
      setProgress(progressTracker.getProgress());
      setCurrentStep(progressTracker.getStageMessage());
      setAdditionalInfo(progressTracker.getAdditionalInfo());
      setShowProgressModal(progressTracker.isInProgress());
      
      // Reset exportingPDF state when progress is complete
      if (progressTracker.getProgress() === 100 && !progressTracker.isInProgress()) {
        setExportingPDF(false);
      }
    });
    
    return () => {
      // Clean up the tracker when component unmounts
      progressComputation.stop();
    };
  }, []);

  return (
    <AdminLayout>
      {/* Progress Modal */}
      <ProgressModal 
        isOpen={showProgressModal}
        progress={progress}
        currentStep={currentStep}
        additionalInfo={additionalInfo}
      />
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
                <MultiSelectDropdown
                  label="Surveys"
                  options={availableSurveys}
                  selectedValues={selectedSurveyIds}
                  onChange={setSelectedSurveyIds}
                  placeholder="Select surveys"
                />
              </FilterGroup>
            </FilterRow>
          </FilterControls>
        </FilterSection>
        
        {isLoading ? (
          <LoadingIndicator>Loading analytics data...</LoadingIndicator>
        ) : (
          <AllTabsContainer 
            tabs={tabs} 
            defaultActiveTab="overview" 
            headerActions={(activeTabId) => {
              // Only show Export button when Questions tab is active
              return activeTabId === 'questions' ? (
                <>
                  <ExportButton 
                    onClick={handleExportButtonClick} 
                    disabled={exportingPDF}
                  >
                    <FiDownload size={16} />
                    {exportingPDF ? 'Exporting...' : 'Export PDF'}
                  </ExportButton>
                  
                  <ExportOptionsModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExportPDF}
                  />
                </>
              ) : null;
            }}
          />
        )}
      </AnalyticsDashboard>
    </AdminLayout>
  );
};

export default Analytics;
