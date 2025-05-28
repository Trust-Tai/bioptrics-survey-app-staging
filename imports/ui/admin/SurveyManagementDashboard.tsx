import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useParams, useNavigate } from 'react-router-dom';
import { Surveys } from '/imports/api/surveys';
import { Questions } from '/imports/api/questions';
import { 
  FiEdit, 
  FiBarChart2, 
  FiSettings, 
  FiEye, 
  FiDownload, 
  FiUsers, 
  FiList, 
  FiGrid, 
  FiHome, 
  FiActivity, 
  FiTarget, 
  FiShare2, 
  FiMessageCircle, 
  FiCopy, 
  FiAlertCircle, 
  FiCheckCircle 
} from 'react-icons/fi';

import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';
import { SurveySections } from './SurveySections';
import SurveyAnalytics from './SurveyAnalytics';
import SurveyResponseAnalytics from './SurveyResponseAnalytics';
import SurveyExport from './SurveyExport';
import SurveySettings from './SurveySettings';
import SurveyPreview from './SurveyPreview';
import SectionQuestions from './SectionQuestions';
import SurveyDashboardSummary from './SurveyDashboardSummary';
import QuestionAssignment from './QuestionAssignment';
import QuickActionsMenu from './QuickActionsMenu';
import SectionCompletionIndicator from './SectionCompletionIndicator';
import SectionProgressOverview from './SectionProgressOverview';

// Styled components for the dashboard UI
const Container = styled.div`
  padding: 32px 0;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5d6c7;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #552a47;
  margin: 0;
`;

const Description = styled.p`
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  align-items: center;
`;

const QuickActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const QuickActionCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  svg {
    color: #552a47;
  }
`;

const QuickActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f9f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const QuickActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
  text-align: center;
`;

const QuickActionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: center;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#552a47' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#552a47'};
  border: ${props => props.primary ? 'none' : '1px solid #552a47'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#693658' : 'rgba(85, 42, 71, 0.1)'};
  }
  
  svg {
    font-size: 16px;
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  margin-left: 16px;
  
  ${({ status }) => {
    switch (status) {
      case 'draft':
        return `
          background-color: #f0f0f0;
          color: #666;
        `;
      case 'published':
        return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
      case 'active':
        return `
          background-color: #e8f5e9;
          color: #2e7d32;
        `;
      case 'completed':
        return `
          background-color: #f3e5f5;
          color: #7b1fa2;
        `;
      case 'archived':
        return `
          background-color: #fafafa;
          color: #757575;
        `;
      default:
        return '';
    }
  }}
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    background: #f9f4f8;
  }
  
  svg {
    color: #552a47;
  }
`;

const PrimaryButton = styled(Button)`
  background: #552a47;
  color: #fff;
  border: none;
  
  &:hover {
    background: #441e38;
  }
  
  svg {
    color: #fff;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5d6c7;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.active ? '#f9f4f8' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#552a47' : 'transparent'};
  color: ${props => props.active ? '#552a47' : '#666'};
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #552a47;
    background: ${props => props.active ? '#f9f4f8' : '#f9f4f810'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #666;
  
  h3 {
    margin: 16px 0 0 0;
    font-weight: 500;
  }
  
  p {
    margin: 8px 0 0 0;
  }
`;

const SpinnerContainer = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
`;

const Spinner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(85, 42, 71, 0.1);
  border-top-color: #552a47;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Types
type TabType = 'overview' | 'sections' | 'questions' | 'responses' | 'analytics' | 'settings' | 'participants' | 'preview';

interface SurveySectionItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  icon?: string;
  color?: string;
  instructions?: string;
  isRequired?: boolean;
  progressIndicator?: boolean;
  completionPercentage?: number;
  questionIds?: string[];
}

interface SurveyManagementDashboardProps {
  surveyId?: string;
}

const SurveyManagementDashboard: React.FC<SurveyManagementDashboardProps> = ({ surveyId: propSurveyId }) => {
  const { surveyId: paramSurveyId } = useParams<{ surveyId: string }>();
  const surveyId = propSurveyId || paramSurveyId;
  const navigate = useNavigate();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch survey data
  const { survey, isLoading, sections, questions } = useTracker(() => {
    console.log('SurveyManagementDashboard - Loading survey with ID:', surveyId);
    
    const surveySub = Meteor.subscribe('surveys.single', surveyId);
    const questionsSub = Meteor.subscribe('questions.all');
    
    const isLoading = !surveySub.ready() || !questionsSub.ready();
    const survey = Surveys.findOne(surveyId);
    
    console.log('SurveyManagementDashboard - Survey data loaded:', survey);
    console.log('SurveyManagementDashboard - Subscription ready:', surveySub.ready());
    
    const allQuestions = Questions.find({}).fetch();
    
    // Extract sections from survey
    const sections = survey?.surveySections || [];
    
    // Extract questions assigned to sections
    const sectionQuestions = survey?.sectionQuestions || [];
    
    return {
      survey,
      isLoading,
      sections,
      questions: sectionQuestions,
      allQuestions
    };
  }, [surveyId]);
  
  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // Helper function to ensure string type for surveyId
  const getSurveyIdString = (): string => {
    return surveyId || '';
  };
  
  // Handle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle preview
  const handlePreview = () => {
    setActiveTab('preview');
  };
  
  // Handle publish
  const handlePublish = () => {
    if (survey) {
      Meteor.call('surveys.publish', surveyId, (error: any) => {
        if (error) {
          console.error('Error publishing survey:', error);
          alert('Failed to publish survey. Please try again.');
        } else {
          alert('Survey published successfully!');
        }
      });
    }
  };
  
  // Handle section questions change
  const handleSectionQuestionsChange = (updatedQuestions: any[]) => {
    Meteor.call('surveys.updateSectionQuestions', surveyId, updatedQuestions, (error: any) => {
      if (error) {
        console.error('Error updating section questions:', error);
        alert('Failed to update section questions. Please try again.');
      }
    });
  };
  
  // Handle sections change
  const handleSectionsChange = (updatedSections: any[]) => {
    Meteor.call('surveys.updateSections', surveyId, updatedSections, (error: any) => {
      if (error) {
        console.error('Error updating sections:', error);
        alert('Failed to update sections. Please try again.');
      }
    });
  };
  
  // Determine survey status based on its properties
  const getSurveyStatus = (survey: any): string => {
    if (!survey.published) return 'draft';
    
    // Check if the survey has start and end dates
    const now = new Date();
    const startDate = survey.startDate ? new Date(survey.startDate) : null;
    const endDate = survey.endDate ? new Date(survey.endDate) : null;
    
    if (endDate && now > endDate) return 'completed';
    if (startDate && now >= startDate && (!endDate || now <= endDate)) return 'active';
    if (survey.isArchived) return 'archived';
    
    return 'published';
  };
  
  if (isLoading || !survey) {
    return (
      <AdminLayout>
        <DashboardBg>
          <Container>
            <Content>
              <LoadingContainer>
                <SpinnerContainer>
                  <Spinner />
                </SpinnerContainer>
                <h3>Loading Survey</h3>
                <p>Please wait while we load the survey data...</p>
              </LoadingContainer>
            </Content>
          </Container>
        </DashboardBg>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          <Content>
            <Header>
              <div>
                <Title>{survey.title}</Title>
                <Description>{survey.description}</Description>
                
                <StatusBadge status={getSurveyStatus(survey)}>
                  {getSurveyStatus(survey) === 'active' && <FiCheckCircle size={14} />}
                  {getSurveyStatus(survey) === 'published' && <FiShare2 size={14} />}
                  {getSurveyStatus(survey) === 'draft' && <FiEdit size={14} />}
                  {getSurveyStatus(survey) === 'completed' && <FiTarget size={14} />}
                  {getSurveyStatus(survey) === 'archived' && <FiAlertCircle size={14} />}
                  {getSurveyStatus(survey).charAt(0).toUpperCase() + getSurveyStatus(survey).slice(1)}
                </StatusBadge>
              </div>
              
              <HeaderActions>
                <QuickActionCard onClick={toggleEditMode}>
                  <QuickActionIcon>
                    <FiEdit size={24} />
                  </QuickActionIcon>
                  <QuickActionTitle>Edit Survey</QuickActionTitle>
                  <QuickActionDescription>Modify survey settings</QuickActionDescription>
                </QuickActionCard>
                
                <QuickActionCard onClick={handlePreview}>
                  <QuickActionIcon>
                    <FiEye size={24} />
                  </QuickActionIcon>
                  <QuickActionTitle>Preview Survey</QuickActionTitle>
                  <QuickActionDescription>Preview the survey as respondents will see it</QuickActionDescription>
                </QuickActionCard>
                
                {getSurveyStatus(survey) === 'draft' && (
                  <ActionButton primary onClick={handlePublish}>
                    <FiShare2 size={16} />
                    Publish
                  </ActionButton>
                )}
              </HeaderActions>
            </Header>
            
            {/* Quick Actions Menu */}
            <QuickActionsMenu 
              onEdit={toggleEditMode}
              onPreview={handlePreview}
              onAssignQuestions={() => setActiveTab('questions')}
              onManageParticipants={() => setActiveTab('participants')}
              onSettings={() => setActiveTab('settings')}
              showAll={true}
            />
            
            <TabsContainer>
              <Tab active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>
                <FiHome size={16} />
                Overview
              </Tab>
              <Tab active={activeTab === 'sections'} onClick={() => handleTabChange('sections')}>
                <FiList size={16} />
                Sections
              </Tab>
              <Tab active={activeTab === 'questions'} onClick={() => handleTabChange('questions')}>
                <FiGrid size={16} />
                Questions
              </Tab>
              <Tab active={activeTab === 'analytics'} onClick={() => handleTabChange('analytics')}>
                <FiBarChart2 size={16} />
                Analytics
              </Tab>
              <Tab active={activeTab === 'responses'} onClick={() => handleTabChange('responses')}>
                <FiMessageCircle size={16} />
                Responses
              </Tab>
              <Tab active={activeTab === 'settings'} onClick={() => handleTabChange('settings')}>
                <FiSettings size={16} />
                Settings
              </Tab>
              <Tab active={activeTab === 'preview'} onClick={() => handleTabChange('preview')}>
                <FiEye size={16} />
                Preview
              </Tab>
            </TabsContainer>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <SurveyDashboardSummary
                surveyId={surveyId || ''}
              />
            )}
            
            {activeTab === 'sections' && (
              <SurveySections 
                sections={sections} 
                onSectionsChange={handleSectionsChange}
                isEditable={isEditing}
              />
            )}
            
            {activeTab === 'questions' && (
              <SectionQuestions 
                sections={sections}
                questions={questions}
                onQuestionsChange={handleSectionQuestionsChange}
              />
            )}
            
            {activeTab === 'analytics' && (
              <SurveyAnalytics 
                surveyId={surveyId || ''}
                sections={sections}
              />
            )}
            
            {activeTab === 'responses' && (
              <SurveyResponseAnalytics 
                surveyId={surveyId || ''}
                sections={sections}
              />
            )}
            
            {activeTab === 'settings' && (
              <SurveySettings 
                surveyId={surveyId || ''}
                initialSettings={survey.defaultSettings ? {
                  ...survey.defaultSettings,
                  expiryDate: survey.defaultSettings.expiryDate ? 
                    (typeof survey.defaultSettings.expiryDate === 'string' ? 
                      survey.defaultSettings.expiryDate : 
                      survey.defaultSettings.expiryDate.toISOString().split('T')[0]) : 
                    undefined,
                  startDate: survey.defaultSettings.startDate ? 
                    (typeof survey.defaultSettings.startDate === 'string' ? 
                      survey.defaultSettings.startDate : 
                      survey.defaultSettings.startDate.toISOString().split('T')[0]) : 
                    undefined
                } : undefined}
              />
            )}
            
            {activeTab === 'preview' && (
              <SurveyPreview 
                surveyId={surveyId || ''}
                previewData={{
                  title: survey.title || '',
                  description: survey.description || '',
                  logo: survey.logo,
                  image: survey.image,
                  color: survey.color,
                  sections: sections,
                  questions: questions.map(q => ({
                    ...q,
                    type: (q.type as "multiple_choice" | "single_choice" | "text" | "textarea" | "rating" | "scale") || 'text'
                  })),
                  showProgressBar: survey.defaultSettings?.showProgressBar
                }}
              />
            )}
          </Content>
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyManagementDashboard;
