import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import SidebarNavigation from '../components/SidebarNavigation';
import SectionHeader from '../components/SectionHeader';
import QuestionRenderer from '../components/QuestionRenderer';
import NavigationControls from '../components/NavigationControls';
import ThankYouScreen from '../components/ThankYouScreen';
import HeaderBar from '../components/HeaderBar';
import NotificationModal from '../components/NotificationModal';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type?: string;
  responseType?: string;
  required?: boolean;
  options?: Array<any>;
  sectionId?: string;
  image?: string; // Add image property
  currentVersion?: {
    image?: string;
    // Add other currentVersion properties as needed
  };
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
  // Optional prop to directly set the current step
  onSetCurrentStep?: (step: CurrentStep) => void;
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
  isSubmitted,
  onSetCurrentStep
}) => {
  // State for current section and question
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [startTime] = useState<number>(Date.now());
  
  // State for notification modal
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  
  // Reference to the setActiveSection function from SidebarNavigation
  const setActiveSectionRef = useRef<((sectionId: string) => void) | null>(null);
  
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
      
      // Update sidebar highlighting when section changes
      if (section && setActiveSectionRef.current) {
        setActiveSectionRef.current(section.id);
        
        // When showing a section, also find its questions for debugging
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
        
        // Update sidebar highlighting when section changes via question navigation
        if (section && setActiveSectionRef.current) {
          setActiveSectionRef.current(section.id);
        }
      } else {
        console.log('Question has no sectionId');
        setCurrentSection(null);
      }
    } else {
      setCurrentSection(null);
      setCurrentQuestion(null);
    }
  }, [currentStep, sections, questions]);
  
  // Calculate overall progress - memoized with safer calculation
  const calculateProgress = useCallback(() => {
    const totalQuestions = questions.length || 1; // Prevent division by zero
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [questions.length, responses]);

  // Calculate section progress - memoized with safer calculation
  const calculateSectionProgress = useCallback((sectionId: string) => {
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    if (sectionQuestions.length === 0) return 0;
    const answeredSectionQuestions = sectionQuestions.filter(q => responses[q._id]);
    return Math.round((answeredSectionQuestions.length / sectionQuestions.length) * 100) || 0;
  }, [questions, responses]);
  
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
      // Find all questions in the current section
      const sectionQuestions = questions.filter(q => q.sectionId === currentQuestion.sectionId);
      const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
      
      // Check if this is the last question in the section
      const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
      
      // Check if this is the last section
      const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
      const isLastSection = currentSectionIndex === sections.length - 1;
      
      if (isLastQuestionInSection && isLastSection) {
        // If last question in last section, submit the survey
        onSubmit();
      } else {
        // Otherwise, go to next question or section
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
  
  // Check if all questions in a section are answered
  const areSectionQuestionsAnswered = (sectionId: string) => {
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    const requiredQuestions = sectionQuestions.filter(q => q.required);
    
    return requiredQuestions.every(q => {
      const answer = responses[q._id];
      if (answer === undefined || answer === null || answer === '') return false;
      if (Array.isArray(answer) && answer.length === 0) return false;
      return true;
    });
  };
  
  // Get the next section ID
  const getNextSectionId = (currentSectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);
    if (currentIndex < sections.length - 1) {
      return sections[currentIndex + 1].id;
    }
    return null;
  };
  
  // Prepare sections data for sidebar - with more stable dependencies
  const sidebarSections = useMemo(() => {
    return sections.map(section => {
      const progress = calculateSectionProgress(section.id);
      const currentSectionId = currentSection?.id || '';
      
      return {
        id: section.id,
        name: section.name,
        isActive: currentSectionId === section.id,
        isCompleted: progress === 100,
        progress: progress // Pass the progress percentage
      };
    });
  }, [sections, calculateSectionProgress, currentSection?.id]);
  
  // We no longer handle the ThankYou screen here - it's moved to SurveyLayoutBridge
  // This prevents hook order issues when transitioning to the submitted state
  
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
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message={notificationMessage}
        title="Action Required"
        color={survey.color || '#552A47'}
      />
      <HeaderBar 
        surveyTitle={survey.title}
        averageTime={survey.estimatedTime}
        logo={survey.logo}
      />
      <SidebarNavigation 
        sections={sidebarSections}
        currentSectionId={currentSection?.id || ''}
        progress={calculateProgress()}
        deferHighlighting={true} // Prevent automatic highlighting
        onSetActiveSection={useCallback((callback: (sectionId: string) => void) => {
          setActiveSectionRef.current = callback;
        }, [])}
        onSectionClick={(sectionId) => {
          // Navigate to the selected section
          if (sectionId) {
            // Check if all required questions in previous sections are answered
            const sectionIndex = sections.findIndex(s => s.id === sectionId);
            let canNavigate = true;
            
            // Check if the clicked section is already completed
            const clickedSectionProgress = calculateSectionProgress(sectionId);
            const isClickedSectionCompleted = clickedSectionProgress === 100;
            
            // If the clicked section is completed, we can navigate directly to it
            if (isClickedSectionCompleted) {
              canNavigate = true;
            } else {
              // Otherwise, check if all required questions in previous sections are answered
              for (let i = 0; i < sectionIndex; i++) {
                const prevSectionId = sections[i].id;
                const prevSectionQuestions = questions.filter(q => q.sectionId === prevSectionId && q.required);
                
                // Check if all required questions in this section are answered
                const allAnswered = prevSectionQuestions.every(q => {
                  const answer = responses[q._id];
                  return answer !== undefined && answer !== null && answer !== '' && 
                        !(Array.isArray(answer) && answer.length === 0);
                });
                
                if (!allAnswered) {
                  canNavigate = false;
                  break;
                }
              }
            }
            
            if (canNavigate) {
              // Highlight the section in the sidebar
              if (setActiveSectionRef.current) {
                setActiveSectionRef.current(sectionId);
              }
              
              // Navigate directly to the selected section
              const selectedSection = sections.find(s => s.id === sectionId);
              if (selectedSection) {
                // If we have a direct setter for currentStep, use it
                if (typeof onSetCurrentStep === 'function') {
                  // Update the current step
                  onSetCurrentStep({
                    type: 'section',
                    id: sectionId
                  });
                } else {
                  // Otherwise, we need to navigate to this section through the parent component
                  // Find the current section index
                  const currentSectionIndex = sections.findIndex(s => s.id === currentSection?.id);
                  const targetSectionIndex = sections.findIndex(s => s.id === sectionId);
                  
                  // If we're going forward
                  if (targetSectionIndex > currentSectionIndex) {
                    // Call onNext repeatedly until we reach the target section
                    const navigateToSection = () => {
                      if (currentStep.type === 'section' && currentStep.id === sectionId) {
                        return; // We've reached the target section
                      }
                      onNext();
                      // Schedule the next navigation after a short delay to allow state to update
                      setTimeout(navigateToSection, 100);
                    };
                    navigateToSection();
                  } 
                  // If we're going backward
                  else if (targetSectionIndex < currentSectionIndex) {
                    // Call onBack repeatedly until we reach the target section
                    const navigateToSection = () => {
                      if (currentStep.type === 'section' && currentStep.id === sectionId) {
                        return; // We've reached the target section
                      }
                      onBack();
                      // Schedule the next navigation after a short delay to allow state to update
                      setTimeout(navigateToSection, 100);
                    };
                    navigateToSection();
                  }
                }
              }
            } else {
              // Create a more specific message about which sections need to be completed
              const incompleteSections = [];
              
              for (let i = 0; i < sectionIndex; i++) {
                const prevSectionId = sections[i].id;
                const prevSectionQuestions = questions.filter(q => q.sectionId === prevSectionId && q.required);
                
                // Check if all required questions in this section are answered
                const allAnswered = prevSectionQuestions.every(q => {
                  const answer = responses[q._id];
                  return answer !== undefined && answer !== null && answer !== '' && 
                        !(Array.isArray(answer) && answer.length === 0);
                });
                
                if (!allAnswered) {
                  incompleteSections.push(sections[i].name);
                }
              }
              
              // Create a more helpful message
              let message = '<p>Please complete all required questions in the following section(s) before proceeding:</p>';
              message += '<ul style="margin-top: 10px; padding-left: 20px;">';
              incompleteSections.forEach(sectionName => {
                message += `<li style="margin-bottom: 5px;">${sectionName}</li>`;
              });
              message += '</ul>';
              message += '<p style="margin-top: 10px;">Required questions are marked with an asterisk (*)</p>';
              
              setNotificationMessage(message);
              setNotificationOpen(true);
            }
          }
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
            
            {/* Display all questions for this section */}
            <QuestionsContainer>
              {questions
                .filter(q => q.sectionId === currentSection.id)
                .map((question, index) => (
                  <QuestionItem key={question._id}>
                    <QuestionNumber>Q{index + 1}.</QuestionNumber>
                    <QuestionContent>
                      <QuestionRenderer
                        questionType={getQuestionType(question)}
                        questionText={question.text}
                        options={question.options || []}
                        value={responses[question._id]}
                        onChange={(value) => onAnswer(question._id, value)}
                        required={!!question.required}
                        currentStep={index + 1}
                        totalSteps={questions.filter(q => q.sectionId === currentSection.id).length}
                        image={question.image || (question.currentVersion && question.currentVersion.image)} // Get image from question or currentVersion
                      />
                    </QuestionContent>
                  </QuestionItem>
                ))
              }
            </QuestionsContainer>
            
            <NavigationControls 
              onBack={onBack}
              onNext={handleContinue}
              nextLabel={getNextSectionName() ? `Next: ${getNextSectionName()}` : "Submit"}
              previousSectionName={getPreviousSectionName()}
              color={survey.color}
              isNextDisabled={!areSectionQuestionsAnswered(currentSection.id)}
            />
          </>
        )}
        
        {/* We're not using individual question view in this layout */}
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
  padding: 40px 10rem;
  margin-left: 280px;
  max-width: 100%;
  margin-top: 0px; /* Add space for the header */
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 2rem 0;
`;

const QuestionItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const QuestionNumber = styled.div`
  font-weight: 600;
  color: #6b7280;
  min-width: 2.5rem;
`;

const QuestionContent = styled.div`
  flex-grow: 1;
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
