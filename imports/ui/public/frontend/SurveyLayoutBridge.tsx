import React, { useState, useEffect, memo, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import ConsentScreen from './components/ConsentScreen';
import StepByStepLayout from './layouts/StepByStepLayout';
import AllOnOnePageLayout from './layouts/AllOnOnePageLayout';
import ThankYouWrapper from './components/ThankYouWrapper';
import ResponseLimitMessage from './components/ResponseLimitMessage';
import ModernSurveyError from '../components/ModernSurveyError';
import { TimerProvider, useTimer } from './contexts/TimerContext';

// Define interfaces for the wrapper components
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
  onSetCurrentStep: (step: CurrentStep) => void;
}

interface AllOnOnePageLayoutProps {
  survey: any;
  sections: Section[];
  questions: Question[];
  responses: Record<string, any>;
  onAnswer: (questionId: string, answer: any, saveOnly?: boolean) => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

// Create stable wrapper components to ensure consistent hook usage
const StableStepByStepLayout = memo((props: StepByStepLayoutProps) => {
  const { survey, sections, questions, currentStep, responses, onAnswer, onNext, onBack, onSubmit, isSubmitted, onSetCurrentStep } = props;
  
  return (
    <StepByStepLayout
      survey={survey}
      sections={sections}
      questions={questions}
      currentStep={currentStep}
      responses={responses}
      onAnswer={onAnswer}
      onNext={onNext}
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitted={isSubmitted}
      onSetCurrentStep={onSetCurrentStep}
    />
  );
});

const StableAllOnOnePageLayout = memo((props: AllOnOnePageLayoutProps) => {
  const { survey, sections, questions, responses, onAnswer, onSubmit, isSubmitted } = props;
  
  return (
    <AllOnOnePageLayout
      survey={survey}
      sections={sections}
      questions={questions}
      responses={responses}
      onAnswer={onAnswer}
      onSubmit={onSubmit}
      isSubmitted={isSubmitted}
    />
  );
});

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
  order?: number; // Add order property for question ordering
  isUnsectioned?: boolean; // Flag to identify questions without a real section
  showEmojis?: boolean; // Add showEmojis property for Likert questions
}

interface CurrentStep {
  type: 'welcome' | 'section' | 'question' | 'thank-you';
  id: string;
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

interface SurveyLayoutBridgeProps {
  survey: any;
  token?: string;
  isPreviewMode?: boolean;
}

const SurveyLayoutBridgeContent: React.FC<SurveyLayoutBridgeProps> = ({
  survey,
  token,
  isPreviewMode = false
}) => {
  // State for consent
  const [hasConsented, setHasConsented] = useState(false);
  
  // State for survey data
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [surveyWithTime, setSurveyWithTime] = useState<any>(survey);
  // We no longer need these states as they're managed by the TimerContext
  // const [startTime, setStartTime] = useState<number | null>(null);
  // const [endTime, setEndTime] = useState<number | null>(null);
  
  // State for response limit
  const [responseLimitStatus, setResponseLimitStatus] = useState<{
    limitReached: boolean;
    hasLimit: boolean;
    currentCount: number;
    limit: number;
  } | null>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  
  // State for step navigation
  const [currentStep, setCurrentStep] = useState<CurrentStep>({ type: 'section', id: '' });
  
  /**
   * Calculates the estimated completion time for a survey based on question times
   * @param questions Array of question documents with estimatedTimeSeconds field
   * @returns Formatted time string in format "MM:SS" (e.g., "2:30")
   */
  function calculateEstimatedTime(questions: any[]): string {
    // Default time per question (in seconds) if not specified
    const DEFAULT_QUESTION_TIME = 30;
    
    let totalSeconds = 0;
    
    // Calculate total seconds from all questions
    questions.forEach(question => {
      // Use estimatedTimeSeconds if available and greater than 0, otherwise use default
      const seconds = question.currentVersion.estimatedTimeSeconds > 0 
        ? question.currentVersion.estimatedTimeSeconds 
        : DEFAULT_QUESTION_TIME;
      
      totalSeconds += seconds;
    });
    
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format as MM:SS with padding for seconds
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // State to track if questions are loaded
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [initialNavigationDone, setInitialNavigationDone] = useState(false);
  
  // Check for response limit
  useEffect(() => {
    if (!survey || !survey._id || isPreviewMode) return;
    
    setIsCheckingLimit(true);
    
    // Check if the survey has reached its response limit
    Meteor.call('surveys.checkResponseLimit', survey._id, (error: any, result: any) => {
      setIsCheckingLimit(false);
      
      if (error) {
        console.error('Error checking response limit:', error);
        return;
      }
      
      console.log('Response limit check result:', result);
      setResponseLimitStatus(result);
    });
  }, [survey, isPreviewMode]);
  
  // Load survey data
  useEffect(() => {
    if (!survey || !survey._id) return;
    
    // Initialize with the first section if available
    if (survey.surveySections && survey.surveySections.length > 0) {
      // Get the first section ID
      const firstSectionId = survey.surveySections[0]._id || survey.surveySections[0].id;
      
      // We'll load the section first, then navigate to its first question after questions are loaded
      setCurrentStep({
        type: 'section',
        id: firstSectionId
      });
    }
    
    // Load sections
    if (survey.surveySections) {
      setSections(survey.surveySections.map((section: any) => ({
        id: section._id || section.id,
        name: section.name,
        description: section.description || '',
        image: section.image || '', // Include section image
        document: section.document || '', // Include section document
        documentName: section.documentName || '', // Include document name
        documentType: section.documentType || '' // Include document type
      })));
    }
    
    // Load questions
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      // Extract question IDs from survey order
      const questionIds = survey.surveyOrder
        .filter((item: any) => item.type === 'question')
        .map((item: any) => item.id);

      if (questionIds.length > 0) {
        
        Meteor.call('getQuestionDocuments', questionIds, (error: any, result: any) => {
          if (error) {
            console.error('Error loading questions:', error);
            return;
          }
          
          
          // Calculate estimated time in MM:SS format
          const formattedTime = calculateEstimatedTime(result);
          
          // Store the formatted time in a new survey object to avoid mutating props
          const updatedSurvey = { ...survey, estimatedTime: formattedTime };
          setSurveyWithTime(updatedSurvey);
            
          
          // Process question data
          const processedQuestions = result.map((doc: any) => {
            const version = doc.currentVersion || {};
            
            // Find the corresponding item in surveyOrder to get the section association
            const orderItem = survey.surveyOrder.find((item: any) => item.id === doc._id);
            
            // Get the section ID from either the question version or from the survey structure
            let sectionId = version.sectionId;
            
            // If we don't have a sectionId in the question itself, try to determine it from the survey structure
            if (!sectionId && orderItem) {
              // Look at the previous items in the survey order to find the most recent section
              const orderIndex = survey.surveyOrder.findIndex((item: any) => item.id === doc._id);
              if (orderIndex > 0) {
                for (let i = orderIndex - 1; i >= 0; i--) {
                  const prevItem = survey.surveyOrder[i];
                  if (prevItem.type === 'section') {
                    sectionId = prevItem.id;
                    break;
                  }
                }
              }
            }
            
            // Create a virtual section ID for tracking unsectioned questions
            const VIRTUAL_SECTION_ID = `__unsectioned_${survey._id}`;
            const isUnsectioned = !sectionId;
            
            // If no sectionId found, use the virtual section ID for internal logic
            if (isUnsectioned) {
              sectionId = VIRTUAL_SECTION_ID;
            }
            
            // IMPORTANT: Get the image directly from the raw document
            // This ensures we get the image data exactly as it is in the database
            const imageData = doc.image || (doc.versions && doc.versions[0] && doc.versions[0].image);
            
            // Find the corresponding item in surveyOrder to get the order property
            const orderItemForOrder = survey.surveyOrder.find((item: any) => item.id === doc._id);
            const orderValue = orderItemForOrder ? orderItemForOrder.order : undefined;
            
            return {
              _id: doc._id,
              id: doc._id,
              text: version.questionText || version.text || 'Untitled Question',
              type: version.responseType || version.type || 'text',
              responseType: version.responseType || version.type || 'text',
              sectionId: sectionId,
              options: version.options || [],
              required: version.required !== false,
              image: imageData, // Add image property directly from the raw document
              order: orderValue || version.order || 0, // Use order from surveyOrder, version, or default to 0
              isUnsectioned: isUnsectioned, // Flag to identify questions without a real section
              // Add showEmojis property with explicit default for Likert questions
              showEmojis: version.responseType === 'likert' ? (version.showEmojis === false ? false : true) : undefined,
            };
          });
          
          // Log the sections and their questions for debugging
          sections.forEach(section => {
            const sectionQuestions = processedQuestions.filter((q: Question) => q.sectionId === section.id);
            console.log(`Section ${section.name} (${section.id}) has ${sectionQuestions.length} questions:`, 
              sectionQuestions.map((q: Question) => q.text));
          });
          
          // Set questions and mark as loaded
          setQuestions(processedQuestions);
          setQuestionsLoaded(true);
          
          console.log('Questions loaded, processedQuestions.length:', processedQuestions.length);
          
          // FORCE navigation to the first question regardless of current step
          if (processedQuestions.length > 0) {
            // Find the first section with questions
            let firstSectionWithQuestions = null;
            let firstQuestionId = null;
            
            for (const section of sections) {
              const sectionQuestions = processedQuestions.filter((q: Question) => 
                q.sectionId === section.id && !q.isUnsectioned
              );
              if (sectionQuestions.length > 0) {
                firstSectionWithQuestions = section;
                firstQuestionId = sectionQuestions[0]._id;
                break;
              }
            }
            
            // If no questions in real sections, check for unsectioned questions
            if (!firstQuestionId) {
              const unsectionedQuestions = processedQuestions
                .filter((q: Question) => q.isUnsectioned)
                .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
              
              if (unsectionedQuestions.length > 0) {
                firstQuestionId = unsectionedQuestions[0]._id;
                console.log('Starting with unsectioned question:', unsectionedQuestions[0].text);
              }
            }
            
            if (firstSectionWithQuestions && firstQuestionId) {
              console.log('FORCE navigating to first question in section:', firstSectionWithQuestions.name);
              
              // Use a longer delay to ensure everything is ready
              setTimeout(() => {
                setCurrentStep({
                  type: 'question',
                  id: firstQuestionId
                });
                setInitialNavigationDone(true);
              }, 300); // Longer delay to ensure state updates properly
            } else if (firstQuestionId) {
              // We have an unsectioned question to start with
              console.log('FORCE navigating to first unsectioned question');
              
              setTimeout(() => {
                setCurrentStep({
                  type: 'question',
                  id: firstQuestionId
                });
                setInitialNavigationDone(true);
              }, 300);
            } else {
              // If no questions at all, just mark as done
              setInitialNavigationDone(true);
            }
          } else {
            // If no questions at all, mark as done
            setInitialNavigationDone(true);
          }
        
        });
      } else {
        console.log('No questions found in survey order');
        // Even if no questions, mark as loaded to avoid infinite loading state
        setQuestionsLoaded(true);
      }
    } else {
      console.log('No survey order found');
      // Even if no survey order, mark as loaded to avoid infinite loading state
      setQuestionsLoaded(true);
    }
    
    // Check for existing incomplete response
    const storedResponseId = localStorage.getItem(`survey_response_${survey._id}`);
    if (storedResponseId) {
      setResponseId(storedResponseId);
      
      // Load saved responses
      Meteor.call('getIncompleteResponse', storedResponseId, (error: any, result: any) => {
        if (error) {
          console.error('Error loading incomplete response:', error);
          return;
        }
        
        if (result && result.responses) {
          setResponses(result.responses);
        }
      });
    }
  }, [survey]);
  
  // Get timer functions from context
  const { startTimer } = useTimer();

  // Handle consent
  const handleConsent = useCallback(() => {
    setHasConsented(true);
    // Start the timer when user gives consent
    startTimer();
    
    // Save consent in localStorage
    try {
      localStorage.setItem(`survey_consent_${survey._id}`, 'true');
    } catch (e) {
      console.error('Error saving consent to localStorage:', e);
    }
  }, [survey, startTimer]);
  
  // Check if user has already consented
  useEffect(() => {
    if (!survey || !survey._id) return;
    
    try {
      const storedConsent = localStorage.getItem(`survey_consent_${survey._id}`);
      
      if (storedConsent === 'true') {
        setHasConsented(true);
        
        // If user has already consented, start the timer
        startTimer();
      }
    } catch (e) {
      console.error('Error reading consent from localStorage:', e);
    }
  }, [survey, startTimer]);
  
  // Handle question answers
  const handleQuestionAnswer = (questionId: string, answer: any, saveOnly: boolean = false) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Save progress to server
    saveProgress();
  };
  
  // Save progress to server
  const saveProgress = () => {
    if (!survey || !survey._id) return;
    
    // Create or update incomplete response
    Meteor.call(
      'saveIncompleteResponse',
      {
        surveyId: survey._id,
        responseId: responseId,
        responses: responses
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Error saving progress:', error);
          return;
        }
        
        // If we got a new response ID, save it
        if (result && result.responseId && !responseId) {
          setResponseId(result.responseId);
          localStorage.setItem(`survey_response_${survey._id}`, result.responseId);
        }
      }
    );
  };
  
  // Navigation handlers
  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('Current sections:', sections.map(s => `${s.name} (${s.id})`));
    console.log('Current questions count:', questions.length);
    
    // Special case for unsectioned questions
    if (currentStep.type === 'question') {
      const currentQuestionId = currentStep.id;
      const currentQuestion = questions.find(q => q._id === currentQuestionId);
      
      if (currentQuestion?.isUnsectioned) {
        // Get all unsectioned questions in order
        const unsectionedQuestions = questions
          .filter(q => q.isUnsectioned)
          .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
        
        const currentIndex = unsectionedQuestions.findIndex(q => q._id === currentQuestionId);
        
        // Check if current question is answered if it's required
        const isCurrentQuestionAnswered = !currentQuestion.required || (
          responses[currentQuestionId] !== undefined && 
          responses[currentQuestionId] !== null && 
          responses[currentQuestionId] !== '' && 
          !(Array.isArray(responses[currentQuestionId]) && responses[currentQuestionId].length === 0)
        );
        
        if (isCurrentQuestionAnswered) {
          if (currentIndex < unsectionedQuestions.length - 1) {
            // Move to next unsectioned question
            setCurrentStep({
              type: 'question',
              id: unsectionedQuestions[currentIndex + 1]._id
            });
          } else {
            // This was the last unsectioned question, submit
            handleSubmit();
          }
          return;
        }
      }
    }
    
    // For question-by-question navigation
    if (currentStep.type === 'section') {
      // When on a section view, we need to move to the first question in this section
      const currentSectionId = currentStep.id;
      const sectionQuestions = questions
        .filter(q => q.sectionId === currentSectionId)
        .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order, handling undefined values
      
      console.log('Section questions:', sectionQuestions.length);
      
      if (sectionQuestions.length > 0) {
        // Move directly to the first question in this section
        console.log('Moving to first question in section:', sectionQuestions[0].text);
        setTimeout(() => {
          setCurrentStep({
            type: 'question',
            id: sectionQuestions[0]._id
          });
        }, 100);
      } else {
        // If no questions in this section, move to the next section
        const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
        if (currentSectionIndex < sections.length - 1) {
          // Get the next section
          const nextSectionId = sections[currentSectionIndex + 1].id;
          const nextSectionQuestions = questions
            .filter(q => q.sectionId === nextSectionId)
            .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order, handling undefined values
          
          if (nextSectionQuestions.length > 0) {
            // If next section has questions, go directly to first question
            setCurrentStep({
              type: 'question',
              id: nextSectionQuestions[0]._id
            });
            
          } else {
            // If next section has no questions, just go to the section
            setCurrentStep({
              type: 'section',
              id: nextSectionId
            });
            
          }
        } else {
          // If last section and no questions, submit
          handleSubmit();
        }
      }
    } else if (currentStep.type === 'question') {
      // When on a question view, we need to move to the next question or next section
      const currentQuestionId = currentStep.id;
      const currentQuestion = questions.find(q => q._id === currentQuestionId);
      
      if (currentQuestion) {
        const currentSectionId = currentQuestion.sectionId;
        const sectionQuestions = questions
          .filter(q => q.sectionId === currentSectionId)
          .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
        const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === currentQuestionId);
        
        // Check if current question is answered if it's required
        const isCurrentQuestionAnswered = !currentQuestion.required || (
          responses[currentQuestionId] !== undefined && 
          responses[currentQuestionId] !== null && 
          responses[currentQuestionId] !== '' && 
          !(Array.isArray(responses[currentQuestionId]) && responses[currentQuestionId].length === 0)
        );
        
        if (isCurrentQuestionAnswered) {
          if (currentQuestionIndex < sectionQuestions.length - 1) {
            // Move to next question in this section
            setCurrentStep({
              type: 'question',
              id: sectionQuestions[currentQuestionIndex + 1]._id
            });
          } else {
            // This was the last question in the section
            // Move to the next section or submit if this was the last section
            const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
            
            if (currentSectionIndex < sections.length - 1) {
              // Get the next section
              const nextSectionId = sections[currentSectionIndex + 1].id;
              const nextSectionQuestions = questions
                .filter(q => q.sectionId === nextSectionId)
                .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
              
              if (nextSectionQuestions.length > 0) {
                // If next section has questions, go directly to first question
                console.log('Moving directly to first question of next section:', sections[currentSectionIndex + 1].name);
                setCurrentStep({
                  type: 'question',
                  id: nextSectionQuestions[0]._id
                });
                
              } else {
                // If next section has no questions, just go to the section view
                setCurrentStep({
                  type: 'section',
                  id: nextSectionId
                });
                
              }
            } else {
              // This was the last question in the last section, submit
              handleSubmit();
            }
          }
        }
      }
    }
  };
  
  const handleBack = () => {
    console.log('handleBack called in SurveyLayoutBridge, currentStep:', currentStep);
    console.log('Current sections:', sections.map(s => `${s.name} (${s.id})`));
    console.log('Current questions count:', questions.length);
    
    // Special case for unsectioned questions
    if (currentStep.type === 'question') {
      const currentQuestionId = currentStep.id;
      const currentQuestion = questions.find(q => q._id === currentQuestionId);
      
      if (currentQuestion?.isUnsectioned) {
        // Get all unsectioned questions in order
        const unsectionedQuestions = questions
          .filter(q => q.isUnsectioned)
          .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
        
        const currentIndex = unsectionedQuestions.findIndex(q => q._id === currentQuestionId);
        
        if (currentIndex > 0) {
          // Move to previous unsectioned question
          setCurrentStep({
            type: 'question',
            id: unsectionedQuestions[currentIndex - 1]._id
          });
          return;
        } else {
          // This is the first unsectioned question
          // Try to find the last question of the last section
          if (sections.length > 0) {
            const lastSection = sections[sections.length - 1];
            const lastSectionQuestions = questions
              .filter(q => q.sectionId === lastSection.id && !q.isUnsectioned)
              .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity));
            
            if (lastSectionQuestions.length > 0) {
              // Navigate to the last question of the last section
              setCurrentStep({
                type: 'question',
                id: lastSectionQuestions[lastSectionQuestions.length - 1]._id
              });
              return;
            } else {
              // Navigate to the last section
              setCurrentStep({
                type: 'section',
                id: lastSection.id
              });
              return;
            }
          }
          // If no sections, do nothing
          return;
        }
      }
    }
    
    if (currentStep.type === 'section') {
      // Find current section
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.id);
      
      if (currentSectionIndex > 0) {
        // Get the previous section
        const prevSectionId = sections[currentSectionIndex - 1].id;
        const prevSectionQuestions = questions
          .filter(q => q.sectionId === prevSectionId)
          .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
        
        if (prevSectionQuestions.length > 0) {
          // If previous section has questions, go directly to the last question
          console.log('Moving to last question of previous section:', sections[currentSectionIndex - 1].name);
          setCurrentStep({
            type: 'question',
            id: prevSectionQuestions[prevSectionQuestions.length - 1]._id
          });
        } else {
          // If previous section has no questions, just go to the section view
          setCurrentStep({
            type: 'section',
            id: prevSectionId
          });
        }
      }
    } else if (currentStep.type === 'question') {
      // When on a question view, we need to move to the previous question or previous section
      const currentQuestionId = currentStep.id;
      const currentQuestion = questions.find(q => q._id === currentQuestionId);
      
      if (currentQuestion) {
        const currentSectionId = currentQuestion.sectionId;
        const sectionQuestions = questions
          .filter(q => q.sectionId === currentSectionId)
          .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
        const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === currentQuestionId);
        
        if (currentQuestionIndex > 0) {
          // Move to previous question in this section
          setCurrentStep({
            type: 'question',
            id: sectionQuestions[currentQuestionIndex - 1]._id
          });
        } else {
          // This was the first question in the section
          // Find the previous section
          const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
          
          if (currentSectionIndex > 0) {
            // Get the previous section
            const prevSectionId = sections[currentSectionIndex - 1].id;
            const prevSectionQuestions = questions
              .filter(q => q.sectionId === prevSectionId)
              .sort((a: Question, b: Question) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order
            
            if (prevSectionQuestions.length > 0) {
              // If previous section has questions, go directly to the last question
              console.log('Moving to last question of previous section:', sections[currentSectionIndex - 1].name);
              setCurrentStep({
                type: 'question',
                id: prevSectionQuestions[prevSectionQuestions.length - 1]._id
              });
            } else {
              // If previous section has no questions, just go to the section view
              setCurrentStep({
                type: 'section',
                id: prevSectionId
              });
            }
          } else {
            // This is the first section, just go to the section view
            setCurrentStep({
              type: 'section',
              id: currentSectionId || ''
            });
          }
        }
      }
    }
  };

  // Get timer functions and data from context
  const { stopTimer, elapsedTime } = useTimer();

  // Handle survey submission
  const handleSubmit = () => {
    // Stop the timer when user submits
    stopTimer();
    
    // Extract the elapsed time string (e.g., "00:34")
    // We need to get this BEFORE we call submitFinalResponse because hooks must be called at component level
    let totalSeconds = 0;
    if (elapsedTime) {
      const [minutesStr, secondsStr] = elapsedTime.split(':');
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);
      totalSeconds = (minutes * 60) + seconds;
    }
    
    console.log('Survey completion time:', elapsedTime, '(', totalSeconds, 'seconds)');
    
    // Submit survey response
    if (!survey || !survey._id) return;
    
    // Check if the survey has reached its response limit before submitting
    Meteor.call('surveys.checkResponseLimit', survey._id, (error: any, result: any) => {
      if (error) {
        console.error('Error checking response limit before submission:', error);
        // Continue with submission despite the error
        submitFinalResponse(totalSeconds);
        return;
      }
      
      // If limit is reached, show the limit message
      if (result.limitReached) {
        console.log('Cannot submit: Survey response limit reached');
        setResponseLimitStatus(result);
        return;
      }
      
      // If limit is not reached, proceed with submission
      submitFinalResponse(totalSeconds);
    });
  };
  
  // Function to submit the final response
  const submitFinalResponse = (completionTimeSeconds: number) => {
    console.log('Submitting survey with completion time:', completionTimeSeconds, 'seconds');
    
    // Create a final response
    Meteor.call(
      'surveys.submitResponse',
      {
        surveyId: survey._id,
        responseId: responseId,
        responses: responses,
        completionTime: completionTimeSeconds  // Pass the actual completion time in seconds
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Error submitting survey:', error);
          return;
        }
        
        console.log('Survey submitted successfully');
        setIsSubmitted(true);
        
        // Remove incomplete response from localStorage
        localStorage.removeItem(`survey_response_${survey._id}`);
      }
    );
  };
  
  // Determine which layout to use
  const layout = survey.layout || 'multiStep';
  
  // Show consent screen if needed
  const showConsentScreen = !hasConsented && !isPreviewMode;
  
  // We already have elapsedTime from the timer context above

  // Stable callback for onSetCurrentStep
  const handleSetCurrentStep = useCallback((step: CurrentStep) => {
    setCurrentStep(step);
  }, []);

  // Render the appropriate content based on state
  
  // Show loading indicator while checking limit
  if (isCheckingLimit) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#555'
      }}>
        {/* Checking survey availability... */}
        
      </div>
    );
  }
  
  // Check if survey is inactive
  if (survey && survey.status === 'inactive') {
    return (
      <ModernSurveyError
        title="Survey Unavailable"
        message="This survey is no longer accepting responses."
        icon="closed"
      />
    );
  }
  
  // Show response limit message if limit is reached
  if (responseLimitStatus?.limitReached) {
    return (
      <ResponseLimitMessage 
        survey={survey}
        currentCount={responseLimitStatus.currentCount}
        limit={responseLimitStatus.limit}
      />
    );
  }
  
  // Show consent screen if needed
  if (showConsentScreen) {
    return (
      <ConsentScreen
        surveyTitle={survey.title}
        logo={survey.logo}
        averageTime={(surveyWithTime || survey).estimatedTime}
        consentText={survey.consentScreen?.consentText}
        consentConfig={{
          title: survey.consentScreen?.title || 'Informed Consent',
          showAnonymityNotice: survey.consentScreen?.showAnonymityNotice !== undefined ? 
            survey.consentScreen.showAnonymityNotice : true,
          anonymityNoticeText: survey.consentScreen?.anonymityNoticeText || 
            'This survey is anonymous. Your responses cannot be linked back to you personally.',
          privacyNoticeUrl: survey.consentScreen?.privacyNoticeUrl || '#',
          privacyLinkText: survey.consentScreen?.privacyLinkText || 'Privacy Notice',
          privacyInfoText: survey.consentScreen?.privacyInfoText || 'For more information, please see our',
          continueButtonText: survey.consentScreen?.continueButtonText || 'Continue to Survey',
          checkboxText: survey.consentScreen?.checkboxText || 
            'I have read and understand the above information and consent to participate in this survey'
        }}
        onConsent={handleConsent}
      />
    );
  }

  // If submitted, show thank you screen using our wrapper
  if (isSubmitted) {
    return (
      <ThankYouWrapper
        logo={survey.logo}
        totalResponses={Object.keys(responses).length}
        unansweredQuestions={questions.filter(q => !responses[q._id]).length}
        completionPercentage={100}
        timeTaken={elapsedTime}
        onTakeAgain={() => window.location.reload()}
        color={survey.color}
      />
    );
  }
  
  // Use the appropriate layout based on survey configuration
  return layout === 'allOnOnePage' ? (
    <StableAllOnOnePageLayout
      survey={surveyWithTime || survey}
      sections={sections}
      questions={questions}
      responses={responses}
      onAnswer={handleQuestionAnswer}
      onSubmit={handleSubmit}
      isSubmitted={false} // Always false here since we handle isSubmitted above
    />
  ) : (
    <StableStepByStepLayout
      survey={surveyWithTime || survey}
      sections={sections}
      questions={questions}
      currentStep={currentStep}
      responses={responses}
      onAnswer={handleQuestionAnswer}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      isSubmitted={false} // Always false here since we handle isSubmitted above
      onSetCurrentStep={handleSetCurrentStep}
    />
  );
};

const SurveyLayoutBridge: React.FC<SurveyLayoutBridgeProps> = (props) => {
  return (
    <TimerProvider>
      <SurveyLayoutBridgeContent {...props} />
    </TimerProvider>
  );
};

export default SurveyLayoutBridge;
