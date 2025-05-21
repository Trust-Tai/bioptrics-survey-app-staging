import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiSearch, 
  FiEye, 
  FiLink, 
  FiEdit, 
  FiStopCircle, 
  FiCopy, 
  FiTrash2, 
  FiMoreHorizontal,
  FiAlertTriangle
} from 'react-icons/fi';

import AdminLayout from './AdminLayout';
import { Surveys, SurveyDoc } from '../../api/surveys';
import { Responses } from '../../api/responses';
import SurveyTable from './components/SurveyTable';
import { Survey, SurveyStatus } from './types/surveyTypes';

// Survey types are imported from ./types/surveyTypes.ts

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #b7a36a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #a08e54;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(183, 163, 106, 0.5);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-top: 16px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
`;

const FilterTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: ${props => props.active ? '2px solid #b7a36a' : '2px solid transparent'};
  color: ${props => props.active ? '#b7a36a' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #b7a36a;
  }
`;

const StatusBadge = styled.span<{ status: 'Draft' | 'Active' | 'Closed' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'Draft':
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
      case 'Active':
        return `
          background-color: #c6f6d5;
          color: #2f855a;
        `;
      case 'Closed':
        return `
          background-color: #fed7d7;
          color: #c53030;
        `;
      default:
        return '';
    }
  }}
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #718096;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  text-align: center;
  color: #718096;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  margin-bottom: 24px;
  max-width: 400px;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #2f855a;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s forwards;
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }
`;

// Main Component
const AdminSurveysPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus>('Active');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Fetch surveys data
  const { surveys, isLoading } = useTracker(() => {
    const surveysSubscription = Meteor.subscribe('surveys.all');
    const responsesSubscription = Meteor.subscribe('responses.all');
    const loading = !surveysSubscription.ready() || !responsesSubscription.ready();
    
    // Fetch all surveys and enhance with response counts
    const allSurveys = Surveys.find({}).fetch();
    
    // Transform the data to match our interface
    const transformedSurveys: Survey[] = allSurveys.map(survey => {
      // Ensure we have a valid _id
      if (!survey._id) {
        throw new Error('Survey missing _id');
      }
      
      const responseCount = Responses.find({ surveyId: survey._id }).count();
      
      // Calculate dates for demo purposes - can be replaced with actual dates from your schema
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14); // Default to 14 days from now
      
      return {
        _id: survey._id,
        title: survey.title || 'Untitled Survey',
        description: survey.description || '',
        status: (survey as any).status || 'Draft', // Type assertion since status isn't in the base schema
        startDate: (survey as any).startDate || today, // Type assertion
        endDate: (survey as any).endDate || endDate, // Type assertion
        invitedCount: (survey as any).invitedCount || 20, // Default for demo
        responseCount,
        publicSlug: (survey as any).publicSlug || survey._id,
        createdAt: survey.createdAt,
        questions: survey.questions || []
      };
    });
    
    return {
      surveys: transformedSurveys,
      isLoading: loading
    };
  }, []);
  
  // Filter surveys based on search term and status filter
  const filteredSurveys = surveys.filter(survey => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'All' || survey.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate metrics
  const activeSurveys = surveys.filter(s => s.status === 'Active');
  const activeSurveysCount = activeSurveys.length;
  
  const avgCompletionRate = activeSurveys.length > 0
    ? activeSurveys.reduce((sum, survey) => {
        const rate = survey.invitedCount > 0 
          ? (survey.responseCount / survey.invitedCount) * 100 
          : 0;
        return sum + rate;
      }, 0) / activeSurveys.length
    : 0;
  
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  
  const closingSoonCount = activeSurveys.filter(
    survey => survey.endDate <= next7Days
  ).length;
  
  // Handle copy public link
  const handleCopyLink = (publicSlug: string) => {
    const surveyUrl = `https://app.bioptrics.com/survey/${publicSlug}`;
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };
  
  // Handle create new survey
  const handleCreateSurvey = () => {
    navigate('/admin/surveys/new');
  };

  return (
    <AdminLayout>
      <PageContainer>
        {/* 1. HEADER BAR */}
        <HeaderBar>
          <Title>Surveys</Title>
          <PrimaryButton onClick={handleCreateSurvey}>
            <FiPlus />
            Create New Survey
          </PrimaryButton>
        </HeaderBar>
        
        {/* Search Box */}
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput 
            type="text"
            placeholder="Search by name or site…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        {/* 2. FILTERS */}
        <FilterTabs>
          <FilterTab 
            active={statusFilter === 'All'} 
            onClick={() => setStatusFilter('All')}
          >
            All
          </FilterTab>
          <FilterTab 
            active={statusFilter === 'Draft'} 
            onClick={() => setStatusFilter('Draft')}
          >
            Draft
          </FilterTab>
          <FilterTab 
            active={statusFilter === 'Active'} 
            onClick={() => setStatusFilter('Active')}
          >
            Active
          </FilterTab>
          <FilterTab 
            active={statusFilter === 'Closed'} 
            onClick={() => setStatusFilter('Closed')}
          >
            Closed
          </FilterTab>
        </FilterTabs>
        
        {/* 3. SURVEY LIST TABLE */}
        <SurveyTable 
          surveys={filteredSurveys}
          isLoading={isLoading}
          onCopyLink={handleCopyLink}
        />
        
        {/* 4. QUICK METRICS PANEL */}
        <MetricsContainer>
          <MetricCard>
            <MetricValue>{activeSurveysCount}</MetricValue>
            <MetricLabel>Active Surveys</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{avgCompletionRate.toFixed(1)}%</MetricValue>
            <MetricLabel>Avg Completion Rate</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{closingSoonCount}</MetricValue>
            <MetricLabel>Surveys Closing Soon</MetricLabel>
          </MetricCard>
        </MetricsContainer>
        
        {/* Toast Notification */}
        {showToast && (
          <Toast>{toastMessage}</Toast>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminSurveysPage;
