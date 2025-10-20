import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import SidebarNavigation from '../components/SidebarNavigation';
import SectionHeader from '../components/SectionHeader';
import QuestionRenderer from '../components/QuestionRenderer';
import NavigationControls from '../components/NavigationControls';
import ThankYouScreen from '../components/ThankYouScreen';
import HeaderBar from '../components/HeaderBar';
import NotificationModal from '../components/NotificationModal';
import DocumentViewer from '../components/DocumentViewer';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type?: string;
  responseType?: string;
  required?: boolean;
  options?: Array<any>;
  sectionId?: string;
  image?: string;
  order?: number;
  isUnsectioned?: boolean;
  currentVersion?: {
    image?: string;
    // Add other currentVersion properties as needed
  };
  showEmojis?: boolean; // Add showEmojis property for Likert questions
}

interface Section {
  id: string;
  name: string;
  description: string;
  image?: string; // Add image property for section images
  document?: string; // Add document property for section documents (PDF/Word)
  documentName?: string; // Document filename
  documentType?: string; // Document MIME type (e.g., 'application/pdf')
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  
  // State for notification modal
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  
  // Reference to the setActiveSection function from SidebarNavigation
  const setActiveSectionRef = useRef<((sectionId: string) => void) | null>(null);
  
  // Track if initial navigation has been done
  const initialNavigationDone = useRef<boolean>(false);
  
  // Separate effect to force navigation to first question ONLY on initial load
  useEffect(() => {
    if (questions.length > 0 && !isLoading && !initialNavigationDone.current) {
      console.log('Questions loaded, checking for auto-navigation');
      
      // FORCE navigation to first question when questions are loaded (only on initial load)
      if (currentStep.type === 'section' && sections.length > 0) {
        // Find the first section with questions
        for (const section of sections) {
          const sectionQuestions = questions
            .filter(q => q.sectionId === section.id)
            .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
          if (sectionQuestions.length > 0) {
            console.log('Auto-navigating to first question in section:', section.name);
            
            // Use a timeout to ensure state updates properly
            setTimeout(() => {
              if (onSetCurrentStep) {
                onSetCurrentStep({
                  type: 'question',
                  id: sectionQuestions[0]._id
                });
                // Mark initial navigation as done
                initialNavigationDone.current = true;
                console.log('Initial navigation completed');
              }
            }, 300);
            break;
          }
        }
      }
    }
  }, [questions, sections, currentStep, isLoading, onSetCurrentStep]);
  
  // Effect to update current section/question based on currentStep
  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Available sections:', sections);
    console.log('Available questions:', questions);
    
    // If we have questions, we're no longer loading
    if (questions.length > 0) {
      setIsLoading(false);
    }
    
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
      
      if (question) {
        if (question.isUnsectioned) {
          // Create a virtual section for unsectioned questions
          const virtualSection: Section = {
            id: 'virtual_section',
            name: 'Additional Questions',
            description: 'These questions are not associated with any specific section.'
          };
          console.log('Created virtual section for unsectioned question');
          setCurrentSection(virtualSection);
        } else if (question.sectionId) {
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

  // Calculate progress data for enhanced HeaderBar
  const progressData = useMemo(() => {
    const totalQuestions = questions.length;
    const completedQuestions = Object.keys(responses).length;
    const progress = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
    
    // Calculate completed sections (sections where all questions are answered)
    const completedSections = sections.filter(section => {
      const sectionQuestions = questions.filter(q => q.sectionId === section.id);
      return sectionQuestions.length > 0 && sectionQuestions.every(q => responses[q._id]);
    }).length;
    
    return {
      progress,
      totalQuestions,
      completedQuestions,
      totalSections: sections.length,
      completedSections
    };
  }, [questions, responses, sections]);

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
    if (type.includes('dropdown')) return 'dropdown';
    if (type.includes('rating') || type === 'scale') return 'rating';
    if (type.includes('rank')) return 'rank';
    if (type.includes('date')) return 'date';
    if (type.includes('long_text') || type === 'textarea') return 'textarea';
    if (type.includes('text')) return 'text';
    
    return 'text';
  };
  
  // Custom back button handler
  const handleBack = () => {
    console.log('handleBack called in StepByStepLayout');
    
    // If we're on a question, check if we need special handling
    if (currentStep.type === 'question' && currentQuestion) {
      const sectionQuestions = questions
        .filter(q => q.sectionId === currentQuestion.sectionId)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
      const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
      
      // If this is the first question in a section and not the first section
      if (currentQuestionIndex === 0) {
        const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
        if (currentSectionIndex > 0) {
          // Get the previous section
          const prevSectionId = sections[currentSectionIndex - 1].id;
          const prevSectionQuestions = questions
            .filter(q => q.sectionId === prevSectionId)
            .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
          
          if (prevSectionQuestions.length > 0 && onSetCurrentStep) {
            // If previous section has questions, go directly to the last question
            console.log('Moving to last question of previous section:', sections[currentSectionIndex - 1].name);
            onSetCurrentStep({
              type: 'question',
              id: prevSectionQuestions[prevSectionQuestions.length - 1]._id
            });
            return;
          }
        }
      }
    }
    
    // Default back behavior
    onBack();
  };
  
  // Handle continue button click
  const handleContinue = () => {
    console.log('handleContinue called, currentStep:', currentStep);
    
    // For one-question-at-a-time navigation
    if (currentStep.type === 'question' && !isAnswerValid()) {
      // If the current question is required and not answered, show notification
      setNotificationMessage('Please answer this question before continuing.');
      setNotificationOpen(true);
      return;
    }
    
    // If we're on a section view, try to navigate directly to the first question
    if (currentStep.type === 'section' && currentSection) {
      const sectionQuestions = questions
        .filter(q => q.sectionId === currentSection.id)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
      
      if (sectionQuestions.length > 0) {
        // If we have questions in this section, navigate to the first one
        if (onSetCurrentStep) {
          onSetCurrentStep({
            type: 'question',
            id: sectionQuestions[0]._id
          });
          return;
        }
      } else {
        // If this section has no questions, try to move to the next section
        const currentSectionIndex = sections.findIndex(s => s.id === currentSection.id);
        if (currentSectionIndex < sections.length - 1) {
          // Get the next section
          const nextSectionId = sections[currentSectionIndex + 1].id;
          const nextSectionQuestions = questions
            .filter(q => q.sectionId === nextSectionId)
            .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
          
          if (nextSectionQuestions.length > 0 && onSetCurrentStep) {
            // If next section has questions, go directly to first question
            onSetCurrentStep({
              type: 'question',
              id: nextSectionQuestions[0]._id
            });
            return;
          }
        }
      }
    }
    
    // If we're at the last question of a section, check if we need to go to the next section
    if (currentStep.type === 'question' && currentQuestion && isLastQuestion()) {
      const currentSectionId = currentQuestion.sectionId;
      const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
      
      if (currentSectionIndex < sections.length - 1) {
        // Get the next section
        const nextSectionId = sections[currentSectionIndex + 1].id;
        const nextSectionQuestions = questions
          .filter(q => q.sectionId === nextSectionId)
          .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
        
        if (nextSectionQuestions.length > 0 && onSetCurrentStep) {
          console.log('Moving directly to first question of next section:', sections[currentSectionIndex + 1].name);
          // If next section has questions, go directly to first question
          onSetCurrentStep({
            type: 'question',
            id: nextSectionQuestions[0]._id
          });
          
          // Scroll to top when navigating to a new section
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          
          return;
        }
      }
    }
    
    // Otherwise, proceed to next question or section
    onNext();
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
    return sections
      .map(section => {
        // Get questions for this section
        const sectionQuestions = questions.filter(q => q.sectionId === section.id);
        
        // Skip sections without questions (should not happen with our filtering, but just in case)
        if (sectionQuestions.length === 0) return null;
        
        const progress = calculateSectionProgress(section.id);
        const currentSectionId = currentSection?.id || '';
        
        return {
          id: section.id,
          name: section.name,
          isActive: currentSectionId === section.id,
          isCompleted: progress === 100,
          progress: progress // Pass the progress percentage
        };
      })
      .filter(Boolean); // Remove null entries (sections without questions)
  }, [sections, calculateSectionProgress, currentSection?.id, questions]);
  
  // We no longer handle the ThankYou screen here - it's moved to SurveyLayoutBridge
  // This prevents hook order issues when transitioning to the submitted state
  
  // Get previous and next section names for navigation
  const getPreviousSectionName = () => {
    if (!currentSection) return '';
    
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex <= 0) return '';
    
    // Find the previous section that has questions
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevSection = sections[i];
      const prevSectionQuestions = questions.filter(q => q.sectionId === prevSection.id && !q.isUnsectioned);
      if (prevSectionQuestions.length > 0) {
        // Hide "Default Section" name in navigation
        return prevSection.name === "Default Section" ? '' : prevSection.name;
      }
    }
    
    return ''; // No previous section with questions found
  };
  
  const getNextSectionName = () => {
    if (!currentSection) return '';
    
    const currentIndex = sections.findIndex(s => s.id === currentSection.id);
    if (currentIndex === -1) return '';
    
    // Find the next section that has questions
    for (let i = currentIndex + 1; i < sections.length; i++) {
      const nextSection = sections[i];
      const nextSectionQuestions = questions.filter(q => q.sectionId === nextSection.id && !q.isUnsectioned);
      if (nextSectionQuestions.length > 0) {
        // Hide "Default Section" name in navigation
        return nextSection.name === "Default Section" ? '' : nextSection.name;
      }
    }
    
    return ''; // No next section with questions found
  };
  
  // Get current question index and total questions in section
  const getQuestionPosition = () => {
    if (!currentQuestion) return { current: 1, total: 1 };
    
    // Handle unsectioned questions
    if (currentQuestion.isUnsectioned) {
      const unsectionedQuestions = questions
        .filter(q => q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
      const currentIndex = unsectionedQuestions.findIndex(q => q._id === currentQuestion._id);
      
      return {
        current: currentIndex + 1,
        total: unsectionedQuestions.length
      };
    }
    
    // Handle regular sectioned questions
    if (!currentSection) return { current: 1, total: 1 };
    
    const sectionQuestions = questions
      .filter(q => q.sectionId === currentSection.id && !q.isUnsectioned)
      .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
    const currentIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
    
    return {
      current: currentIndex + 1,
      total: sectionQuestions.length
    };
  };

  // Get current question number across all sections (for sidebar)
  const getCurrentQuestionNumber = () => {
    if (!currentQuestion) return 1;
    
    // Get all questions sorted by section order and question order
    const allQuestions: Question[] = [];
    
    // Add sectioned questions in section order
    sections.forEach(section => {
      const sectionQuestions = questions
        .filter(q => q.sectionId === section.id && !q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
      allQuestions.push(...sectionQuestions);
    });
    
    // Add unsectioned questions at the end
    const unsectionedQuestions = questions
      .filter(q => q.isUnsectioned)
      .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
    allQuestions.push(...unsectionedQuestions);
    
    // Find current question index
    const currentIndex = allQuestions.findIndex(q => q._id === currentQuestion._id);
    return currentIndex + 1;
  };
  
  // Determine if current question is the last one
  const isLastQuestion = () => {
    if (!currentQuestion) return false;
    
    // Handle unsectioned questions
    if (currentQuestion.isUnsectioned) {
      const unsectionedQuestions = questions
        .filter(q => q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
      const currentIndex = unsectionedQuestions.findIndex(q => q._id === currentQuestion._id);
      return currentIndex === unsectionedQuestions.length - 1;
    }
    
    // Handle regular sectioned questions
    if (currentSection) {
      const sectionQuestions = questions
        .filter(q => q.sectionId === currentSection.id && !q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
      const currentIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
      return currentIndex === sectionQuestions.length - 1;
    } else {
      const currentIndex = questions.findIndex(q => q._id === currentQuestion._id);
      return currentIndex === questions.length - 1;
    }
  };
  
  // Determine if current question is the first question of the first section
  const isFirstQuestionOfFirstSection = () => {
    if (!currentQuestion) return false;
    
    // Handle unsectioned questions
    if (currentQuestion.isUnsectioned) {
      // For unsectioned questions, check if it's the first unsectioned question
      // and there are no regular sections with questions before it
      const unsectionedQuestions = questions
        .filter(q => q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
      
      // If it's not the first unsectioned question, it's not the first question overall
      if (unsectionedQuestions.findIndex(q => q._id === currentQuestion._id) !== 0) {
        return false;
      }
      
      // Check if there are any sections with questions before this
      for (const section of sections) {
        const sectionQuestions = questions
          .filter(q => q.sectionId === section.id && !q.isUnsectioned)
          .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
        
        if (sectionQuestions.length > 0) {
          // There's a section with questions before this unsectioned question
          return false;
        }
      }
      
      // This is the first question overall
      return true;
    }
    
    // Handle regular sectioned questions
    if (!currentSection) return false;
    
    // Check if this is the first section
    const isFirstSection = sections.findIndex(s => s.id === currentSection.id) === 0;
    if (!isFirstSection) return false;
    
    // Check if this is the first question in the section
    const sectionQuestions = questions
      .filter(q => q.sectionId === currentSection.id && !q.isUnsectioned)
      .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
    const isFirstQuestion = sectionQuestions.findIndex(q => q._id === currentQuestion._id) === 0;
    
    return isFirstSection && isFirstQuestion;
  };
  
  // Get the appropriate next button label based on current position
  const getNextButtonLabel = () => {
    if (!currentQuestion) return 'Next';
    
    // Handle unsectioned questions
    if (currentQuestion.isUnsectioned) {
      const unsectionedQuestions = questions
        .filter(q => q.isUnsectioned)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
      const currentIndex = unsectionedQuestions.findIndex(q => q._id === currentQuestion._id);
      const isLastUnsectionedQuestion = currentIndex === unsectionedQuestions.length - 1;
      
      if (isLastUnsectionedQuestion) {
        return 'Submit';
      } else {
        return 'Next';
      }
    }
    
    // Handle regular sectioned questions
    const sectionQuestions = questions
      .filter(q => q.sectionId === currentQuestion.sectionId && !q.isUnsectioned)
      .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
    const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === currentQuestion._id);
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    
    if (isLastQuestionInSection) {
      // If this is the last question in the section
      const nextSectionName = getNextSectionName();
      
      // Check if there are unsectioned questions after this section
      const hasUnsectionedQuestions = questions.some(q => q.isUnsectioned);
      
      if (nextSectionName) {
        return `Next Section: ${nextSectionName}`;
      } else if (hasUnsectionedQuestions) {
        return 'Next Section: Additional Questions';
      } else {
        return 'Submit';
      }
    } else {
      return 'Next Question';
    }
  };
  
  return (
    <PageContainer>
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message={notificationMessage}
        title="Action Required"
        color={survey.color || '#552A47'}
      />
      {/* Header Bar - Now outside the main layout */}
      <HeaderBar 
        surveyTitle={survey.title}
        averageTime={survey.estimatedTime}
        logo={survey.logo}
        progress={progressData.progress}
        color={'var(--primary-color, #552A47)'}
        totalQuestions={progressData.totalQuestions}
        completedQuestions={progressData.completedQuestions}
        totalSections={progressData.totalSections}
        completedSections={progressData.completedSections}
        progressStyle="encouraging"
      />
      
      {/* Main Layout with Sidebar and Content */}
      <MainLayout>
        {/* Sidebar Navigation */}
        <SidebarNavigation 
          sections={sidebarSections}
          currentSectionId={currentSection?.id || ''}
          progress={calculateProgress()}
          deferHighlighting={true} // Prevent automatic highlighting
          currentQuestionNumber={getQuestionPosition().current}
          totalQuestions={getQuestionPosition().total}
          onSetActiveSection={(callback: (sectionId: string) => void) => {
            setActiveSectionRef.current = callback;
          }}
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
                const prevSectionQuestions = questions
                  .filter(q => q.sectionId === prevSectionId && q.required)
                  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
                
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
                // For one-question-at-a-time navigation, we want to go directly to the first question
                // Get the first question in this section
                const sectionQuestions = questions
                  .filter(q => q.sectionId === sectionId)
                  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
                
                if (sectionQuestions.length > 0 && typeof onSetCurrentStep === 'function') {
                  // Navigate directly to the first question in this section
                  onSetCurrentStep({
                    type: 'question',
                    id: sectionQuestions[0]._id
                  });
                } else if (typeof onSetCurrentStep === 'function') {
                  // If no questions, just go to the section view
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
                const prevSectionQuestions = questions
                  .filter(q => q.sectionId === prevSectionId && q.required)
                  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
                
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
        {/* Show loading indicator when questions are being loaded */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: '4px solid #f3f3f3',
                borderTop: `4px solid ${survey.color || '#552A47'}`,
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }} />
              <p>Loading survey questions...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        )}
        
        {/* Show a fallback view if we're in a section but there are no questions */}
        {!isLoading && currentStep.type === 'section' && currentSection && questions.filter(q => q.sectionId === currentSection.id).length === 0 && (
          <>
            {/* Only show section header if it's not the virtual section for unsectioned questions */}
            {currentSection.id !== 'virtual_section' && (
              <SectionHeader 
                title={currentSection.name}
                description={currentSection.description}
                progress={100}
                color={survey.color}
                image={currentSection.image}
                hideTitle={currentSection.name === "Default Section"}
              />
            )}
            
            {/* Display document if available */}
            {currentSection.id !== 'virtual_section' && currentSection.document && (currentSection.documentType === 'application/pdf' || currentSection.documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || currentSection.documentType === 'application/msword') && (
              <DocumentViewerContainer>
                <DocumentViewer 
                  document={currentSection.document} 
                  documentName={currentSection.documentName || 'document.pdf'} 
                  documentType={currentSection.documentType} 
                />
              </DocumentViewerContainer>
            )}
            
            {/* Add a visual separator */}
            <Separator />
            
            <QuestionsContainer>
              <QuestionItem>
                <QuestionContent>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h3>No Questions Available</h3>
                    <p>This section doesn't have any questions.</p>
                    {sections.findIndex(s => s.id === currentSection.id) < sections.length - 1 && (
                      <button 
                        onClick={handleContinue}
                        style={{
                          backgroundColor: survey.color || '#552A47',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        Next Section
                      </button>
                    )}
                  </div>
                </QuestionContent>
              </QuestionItem>
            </QuestionsContainer>
          </>
        )}
        
        {!isLoading && currentStep.type === 'question' && currentQuestion && currentSection && (
          <>
            {/* Hide section header for unsectioned questions */}
            {!currentQuestion.isUnsectioned && (
              <SectionHeader 
                title={currentSection.name}
                description={currentSection.description}
                progress={calculateSectionProgress(currentSection.id)}
                color={survey.color}
                image={currentSection.image}
                hideTitle={currentSection.name === "Default Section"}
              />
            )}
            
            {/* Display document if available */}
            {!currentQuestion.isUnsectioned && currentSection.document && (currentSection.documentType === 'application/pdf' || currentSection.documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || currentSection.documentType === 'application/msword') && (
              <DocumentViewerContainer>
                <DocumentViewer 
                  document={currentSection.document} 
                  documentName={currentSection.documentName || 'document.pdf'} 
                  documentType={currentSection.documentType} 
                />
              </DocumentViewerContainer>
            )}
            
            {/* Add a visual separator */}
            <Separator />
            
            {/* Display current question */}
            <QuestionsContainer>
              <QuestionItem>
                <QuestionHeader>
                  <QuestionBadge>Question {getQuestionPosition().current} of {getQuestionPosition().total}</QuestionBadge>
                  <QuestionTitle>
                    <QuestionTextContent 
                      dangerouslySetInnerHTML={{ __html: currentQuestion.text }} 
                    />
                    {currentQuestion.required && <RequiredIndicator>*</RequiredIndicator>}
                  </QuestionTitle>
                </QuestionHeader>
                <QuestionContent>
                  <QuestionRenderer
                    questionType={getQuestionType(currentQuestion)}
                    showEmojis={currentQuestion.showEmojis === false ? false : true}
                    questionText="" // Empty since we're showing it in the header
                    options={currentQuestion.options || []}
                    value={responses[currentQuestion._id]}
                    onChange={(value) => onAnswer(currentQuestion._id, value)}
                    required={false} // Handle required indicator in header
                    currentStep={getQuestionPosition().current}
                    totalSteps={getQuestionPosition().total}
                    image={currentQuestion.image || (currentQuestion.currentVersion && currentQuestion.currentVersion.image)}
                  />
                </QuestionContent>
              </QuestionItem>
            </QuestionsContainer>
            
            <NavigationControls 
              onBack={handleBack}
              onNext={handleContinue}
              nextLabel={getNextButtonLabel()}
              previousSectionName={getPreviousSectionName()}
              color={survey.color}
              isNextDisabled={!isAnswerValid()}
              isBackDisabled={isFirstQuestionOfFirstSection()}
            />
          </>
        )}
        
        {/* We're not using individual question view in this layout */}
      </ContentContainer>
      </MainLayout>
    </PageContainer>
  );
};


// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  position: relative;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 100px 2rem 40px;
  margin: 0 auto;
  margin-left: 280px; /* Add margin to account for fixed sidebar */
  width: calc(100% - 280px); /* Adjust width to account for sidebar */
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 100px 1rem 1rem;
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 3rem auto 2rem; /* Increased top margin to 3rem */
  width: 100%;
  max-width: 800px;
`;

const QuestionItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.8rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  width: 100%;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const QuestionBadge = styled.div`
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
`;

const QuestionTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.5;
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-top: 5px;
`;

const QuestionTextContent = styled.div`
  flex-grow: 1;
  
  /* Reset default paragraph margins for clean display */
  p {
    margin: 0;
    padding: 0;
  }
  
  /* Handle other HTML elements that might be in question text */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
    font-size: inherit;
    font-weight: inherit;
  }
  
  /* Ensure proper line height and spacing */
  * {
    line-height: inherit;
  }
`;

const RequiredIndicator = styled.span`
  color: #ef4444;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
`;

const QuestionContent = styled.div`
  width: 100%;
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

const SectionIntro = styled.div`
  text-align: center;
  padding: 2rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }
`;

const Separator = styled.div`
  height: 1px;
  background-color: #e5e7eb;
  width: 100%;
  max-width: 800px;
  margin: 1rem auto;
  opacity: 0.6;
`;

const DocumentViewerContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

export default StepByStepLayout;
