import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { 
  FiSave, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiTrash2,
  FiCalendar,
  FiInfo,
  FiCheck
} from 'react-icons/fi';

import AdminLayout from './AdminLayout';
import { Surveys, SurveyDoc } from '../../api/surveys';
import { Questions } from '../../api/questions';
import { Survey } from './types/surveyTypes';
import WelcomeScreenStep from './builder/WelcomeScreenStep';
import QuestionSelectionStep from './builder/QuestionSelectionStep';
import ScheduleStep from './builder/ScheduleStep';
import ReviewStep from './builder/ReviewStep';

// Types
interface SurveyBuilderProps {
  editMode?: boolean;
}

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
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

const StepContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const StepHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const StepTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const StepContent = styled.div`
  padding: 24px;
`;

const StepsProgress = styled.div`
  display: flex;
  margin-bottom: 32px;
`;

const StepIndicator = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    height: 2px;
    background-color: ${props => props.completed ? '#b7a36a' : '#e2e8f0'};
    width: 100%;
    top: 12px;
    left: 24px;
    z-index: 1;
  }
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.completed ? '#b7a36a' : props.active ? 'white' : '#e2e8f0'};
  border: 2px solid ${props => props.completed ? '#b7a36a' : props.active ? '#b7a36a' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.completed ? 'white' : '#4a5568'};
  font-weight: 600;
  z-index: 2;
`;

const StepLabel = styled.span<{ active: boolean }>`
  margin-left: 8px;
  font-size: 14px;
  color: ${props => props.active ? '#1c1c1c' : '#718096'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.primary ? '#b7a36a' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  
  &:hover {
    background: ${props => props.primary ? '#a08e54' : '#f7fafc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

// Main component
const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Steps
  const steps = [
    { id: 'welcome', label: 'Welcome Screen' },
    { id: 'questions', label: 'Question Selection' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'review', label: 'Review' }
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Survey state
  const [surveyData, setSurveyData] = useState<Partial<Survey>>({
    title: '',
    description: '',
    status: 'Draft',
    questions: [],
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    invitedCount: 0
  });
  
  // Welcome screen state
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  
  // Fetch data if in edit mode
  const { isLoading, surveyExists } = useTracker(() => {
    if (!editMode || !id) return { isLoading: false, surveyExists: false };
    
    const subscription = Meteor.subscribe('surveys.all');
    const loading = !subscription.ready();
    
    if (!loading && id) {
      const survey = Surveys.findOne({ _id: id });
      
      if (survey) {
        // Set survey data from existing survey
        setSurveyData({
          _id: survey._id,
          title: survey.title,
          description: survey.description,
          status: (survey as any).status || 'Draft',
          questions: survey.questions || [],
          startDate: (survey as any).startDate || new Date(),
          endDate: (survey as any).endDate || new Date(new Date().setDate(new Date().getDate() + 14)),
          invitedCount: (survey as any).invitedCount || 0,
          publicSlug: (survey as any).publicSlug,
          createdAt: survey.createdAt
        });
        
        // Mark all steps as completed in edit mode
        setCompletedSteps([0, 1, 2, 3]);
        
        return { isLoading: false, surveyExists: true };
      }
    }
    
    return { isLoading: loading, surveyExists: false };
  }, [editMode, id]);
  
  // Fetch all questions
  const questions = useTracker(() => {
    Meteor.subscribe('questions.all');
    return Questions.find().fetch();
  }, []);
  
  // Handle next step
  const handleNextStep = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    // Move to next step
    setCurrentStep(currentStep + 1);
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Check if current step is completed
  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.includes(stepIndex);
  };
  
  // Handle form field changes
  const handleChange = (field: keyof Survey, value: any) => {
    setSurveyData({
      ...surveyData,
      [field]: value
    });
  };
  
  // Save survey
  const handleSaveSurvey = () => {
    if (editMode && id) {
      // Update existing survey
      Meteor.call('surveys.update', id, surveyData, (error: Error | null) => {
        if (error) {
          console.error('Error updating survey:', error);
          showToastMessage('Error updating survey');
        } else {
          showToastMessage('Survey updated successfully');
          navigate('/admin/surveys');
        }
      });
    } else {
      // Create new survey
      Meteor.call('surveys.insert', surveyData, (error: Error | null, result: string) => {
        if (error) {
          console.error('Error creating survey:', error);
          showToastMessage('Error creating survey');
        } else {
          showToastMessage('Survey created successfully');
          navigate('/admin/surveys');
        }
      });
    }
  };
  
  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Check if next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 0: // Welcome Screen
        return !surveyData.title || !surveyData.description;
      case 1: // Question Selection
        return !surveyData.questions || surveyData.questions.length === 0;
      case 2: // Schedule
        return !surveyData.startDate || !surveyData.endDate;
      default:
        return false;
    }
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeScreenStep
            title={surveyData.title || ''}
            description={surveyData.description || ''}
            logoImage={logoImage}
            welcomeImage={welcomeImage}
            onTitleChange={(value) => handleChange('title', value)}
            onDescriptionChange={(value) => handleChange('description', value)}
            onLogoChange={setLogoImage}
            onWelcomeImageChange={setWelcomeImage}
          />
        );
      case 1:
        return (
          <QuestionSelectionStep
            selectedQuestions={surveyData.questions || []}
            availableQuestions={questions}
            onQuestionsChange={(value) => handleChange('questions', value)}
          />
        );
      case 2:
        return (
          <ScheduleStep
            startDate={surveyData.startDate || new Date()}
            endDate={surveyData.endDate || new Date(new Date().setDate(new Date().getDate() + 14))}
            onStartDateChange={(value) => handleChange('startDate', value)}
            onEndDateChange={(value) => handleChange('endDate', value)}
          />
        );
      case 3:
        return (
          <ReviewStep
            survey={surveyData as Survey}
            questions={questions}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>{editMode ? 'Edit Survey' : 'Create New Survey'}</Title>
          <Button primary onClick={handleSaveSurvey}>
            <FiSave />
            {editMode ? 'Update Survey' : 'Save Survey'}
          </Button>
        </Header>
        
        {/* Steps Progress */}
        <StepsProgress>
          {steps.map((step, index) => (
            <StepIndicator 
              key={step.id} 
              active={currentStep === index}
              completed={isStepCompleted(index)}
            >
              <StepCircle
                active={currentStep === index}
                completed={isStepCompleted(index)}
              >
                {isStepCompleted(index) ? <FiCheck size={14} /> : index + 1}
              </StepCircle>
              <StepLabel active={currentStep === index}>{step.label}</StepLabel>
            </StepIndicator>
          ))}
        </StepsProgress>
        
        {/* Current Step */}
        <StepContainer>
          <StepHeader>
            <StepTitle>{steps[currentStep].label}</StepTitle>
          </StepHeader>
          <StepContent>
            {renderStepContent()}
          </StepContent>
        </StepContainer>
        
        {/* Navigation Buttons */}
        <ButtonContainer>
          <Button 
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <FiChevronLeft />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              primary
              onClick={handleNextStep}
              disabled={isNextDisabled()}
            >
              Next
              <FiChevronRight />
            </Button>
          ) : (
            <Button 
              primary
              onClick={handleSaveSurvey}
            >
              <FiSave />
              {editMode ? 'Update Survey' : 'Create Survey'}
            </Button>
          )}
        </ButtonContainer>
        
        {/* Toast Notification */}
        {showToast && <Toast>{toastMessage}</Toast>}
      </Container>
    </AdminLayout>
  );
};

export default SurveyBuilder;
