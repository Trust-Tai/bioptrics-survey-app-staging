import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SidebarNavigation from '../components/SidebarNavigation';
import SectionHeader from '../components/SectionHeader';
import QuestionRenderer from '../components/QuestionRenderer';
import NavigationControls from '../components/NavigationControls';
import ThankYouScreen from '../components/ThankYouScreen';
import HeaderBar from '../components/HeaderBar';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type?: string;
  responseType?: string;
  required?: boolean;
  options?: Array<any>;
  sectionId?: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
}

interface CurrentStep {
  type: 'welcome' | 'section' | 'question' | 'thank-you';
  id: string;
}

interface StepByStepLayoutProps {
  survey: any;
  sections: Section[];
  questions: Question[];
  currentStep: CurrentStep;
  responses: Record<string, any>;
  onAnswer: (questionId: string, answer: any, saveOnly?: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

const StepByStepLayout: React.FC<StepByStepLayoutProps> = ({
  survey,
  sections,
  questions,
  currentStep,
  responses,
  onAnswer,
  onNext,
  onBack,
  onSubmit,
  isSubmitted
}) => {
  // State for current section and question
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [startTime] = useState<number>(Date.now());
  
  // Effect to update current section/question based on currentStep
  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Available sections:', sections);
    console.log('Available questions:', questions);
    
    if (currentStep.type === 'section') {
      const section = sections.find(s => s.id === currentStep.id);
      console.log('Found section:', section);
      setCurrentSection(section || null);
      setCurrentQuestion(null);
      
      // When showing a section, also find its questions for debugging
      if (section) {
        const sectionQuestions = questions.filter(q => q.sectionId === section.id);
        console.log(`Questions for section ${section.name}:`, sectionQuestions);
      }
    } else if (currentStep.type === 'question') {
      const question = questions.find(q => q._id === currentStep.id || q.id === currentStep.id);
      console.log('Found question:', question);
      setCurrentQuestion(question || null);
      
      if (question?.sectionId) {
        const section = sections.find(s => s.id === question.sectionId);
        console.log('Found section for question:', section);
        setCurrentSection(section || null);
      } else {
        console.log('Question has no sectionId');
        setCurrentSection(null);
      }
    } else {
      setCurrentSection(null);
      setCurrentQuestion(null);
    }
  }, [currentStep, sections, questions]);
  
  // Calculate overall progress
  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };
  
  // Calculate section progress
  const calculateSectionProgress = (sectionId: string) => {
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    const answeredSectionQuestions = sectionQuestions.filter(q => responses[q._id]);
    return Math.round((answeredSectionQuestions.length / sectionQuestions.length) * 100) || 0;
  };
  
  // Get question type
  const getQuestionType = (question: Question) => {
    const type = question.responseType || question.type || '';
    
    if (type.includes('likert')) return 'likert';
    if (type.includes('radio') || type === 'single_choice') return 'radio';
    if (type.includes('checkbox') || type === 'multiple_choice') return 'checkbox';
    if (type.includes('rating') || type === 'scale') return 'rating';
    if (type.includes('rank')) return 'rank';
    if (type.includes('date')) return 'date';
    if (type.includes('long_text') || type === 'textarea') return 'textarea';
    if (type.includes('text')) return 'text';
    
    return 'text';
  };
  
  // Handle continue button click
  const handleContinue = () => {
    if (currentStep.type === 'question' && currentQuestion) {
      const isLastQuestion = questions.findIndex(q => q._id === currentQuestion._id) === questions.length - 1;
      
      if (isLastQuestion) {
        onSubmit();
      } else {
        onNext();
      }
    } else {
      onNext();
    }
  };
  
  // Check if answer is valid
  const isAnswerValid = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    
    const answer = responses[currentQuestion._id];
    if (answer === undefined || answer === null || answer === '') return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    
    return true;
  };
  
  // If submitted, show thank you screen
  if (isSubmitted) {
    const completionTime = Math.round((Date.now() - startTime) / 1000); // in seconds
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}sec`;
    
    return (
      <ThankYouScreen 
        logo={survey.logo}
        totalResponses={Object.keys(responses).length}
        unansweredQuestions={questions.filter(q => !responses[q._id]).length}
        completionPercentage={calculateProgress()}
        timeTaken={formattedTime}
        onTakeAgain={() => window.location.reload()}
        color={survey.color}
      />
    );
  }
  
  // Prepare sections data for sidebar
  const sidebarSections = sections.map(section => {
    const progress = calculateSectionProgress(section.id);
    
    return {
      id: section.id,
      name: section.name,
      isActive: currentSection?.id === section.id,
      isCompleted: progress === 100
    };
  });
  
  // Get previous and next section names for navigation
  const getPreviousSectionName = () => {
    if (!currentSection) return '';
    
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex <= 0) return '';
    
    return sections[currentIndex - 1].name;
  };
  
  const getNextSectionName = () => {
    if (!currentSection) return '';
    
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex === -1 || currentIndex >= sections.length - 1) return '';
    
    return sections[currentIndex + 1].name;
  };
  
  // Get current question index and total questions in section
  const getQuestionPosition = () => {
    if (!currentQuestion || !currentSection) return { current: 1, total: 1 };
    
    const sectionQuestions = questions.filter(q => q.sectionId === currentSection.id);
    const currentIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
    
    return {
      current: currentIndex + 1,
      total: sectionQuestions.length
    };
  };
  
  // Determine if current question is the last one
  const isLastQuestion = () => {
    if (!currentQuestion) return false;
    
    if (currentSection) {
      const sectionQuestions = questions.filter(q => q.sectionId === currentSection.id);
      const currentIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
      return currentIndex === sectionQuestions.length - 1;
    } else {
      const currentIndex = questions.findIndex(q => q._id === currentQuestion._id);
      return currentIndex === questions.length - 1;
    }
  };
  
  return (
    <LayoutContainer>
      <HeaderBar 
        surveyTitle={survey.title}
        averageTime={survey.estimatedTime}
        logo={survey.logo}
      />
      <SidebarNavigation 
        sections={sidebarSections}
        currentSectionId={currentSection?.id || ''}
        progress={calculateProgress()}
        onSectionClick={(sectionId) => {
          // Logic to navigate to section would be implemented here
          // This would typically involve finding the first question in the section
          // and navigating to it
        }}
        color={survey.color}
        logo={survey.logo}
      />
      
      <ContentContainer>
        {currentStep.type === 'section' && currentSection && (
          <>
            <SectionHeader 
              title={currentSection.name}
              description={currentSection.description}
              progress={calculateSectionProgress(currentSection.id)}
              color={survey.color}
            />
            
            <NavigationControls 
              onBack={onBack}
              onNext={handleContinue}
              nextLabel="Start Section"
              previousSectionName={getPreviousSectionName()}
              color={survey.color}
            />
          </>
        )}
        
        {currentStep.type === 'question' && currentQuestion && (
          <>
            <QuestionContainer>
              <StepIndicator>
                STEP {getQuestionPosition().current}/{getQuestionPosition().total}
              </StepIndicator>
              
              <QuestionRenderer
                questionType={getQuestionType(currentQuestion)}
                questionText={currentQuestion.text}
                options={currentQuestion.options || []}
                value={responses[currentQuestion._id]}
                onChange={(value) => onAnswer(currentQuestion._id, value)}
                required={!!currentQuestion.required}
              />
            </QuestionContainer>
            
            <NavigationControls 
              onBack={onBack}
              onNext={handleContinue}
              isNextDisabled={currentQuestion.required && !isAnswerValid()}
              isLastQuestion={isLastQuestion()}
              previousSectionName={getPreviousSectionName()}
              nextSectionName={isLastQuestion() ? getNextSectionName() : ''}
              color={survey.color}
            />
          </>
        )}
      </ContentContainer>
    </LayoutContainer>
  );
};

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  margin-left: 280px;
  max-width: 800px;
  margin-top: 60px; /* Add space for the header */
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const StepIndicator = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  background-color: #f3f4f6;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

export default StepByStepLayout;
