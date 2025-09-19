import React, { useState, useEffect, memo, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import ConsentScreen from './components/ConsentScreen';
import StepByStepLayout from './layouts/StepByStepLayout';
import AllOnOnePageLayout from './layouts/AllOnOnePageLayout';
import ThankYouWrapper from './components/ThankYouWrapper';
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
}

interface CurrentStep {
  type: 'welcome' | 'section' | 'question' | 'thank-you';
  id: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
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

  // Load survey data
  useEffect(() => {
    if (!survey || !survey._id) return;
    
    // Initialize with the first section if available
    if (survey.surveySections && survey.surveySections.length > 0) {
      setCurrentStep({
        type: 'section',
        id: survey.surveySections[0]._id || survey.surveySections[0].id
      });
    }
    
    // Load sections
    if (survey.surveySections) {
      setSections(survey.surveySections.map((section: any) => ({
        id: section._id || section.id,
        name: section.name,
        description: section.description || ''
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
            
            
            // IMPORTANT: Get the image directly from the raw document
            // This ensures we get the image data exactly as it is in the database
            const imageData = doc.image || (doc.versions && doc.versions[0] && doc.versions[0].image);
            
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
            };
          });
          
          // Log the sections and their questions for debugging
          sections.forEach(section => {
            const sectionQuestions = processedQuestions.filter((q: Question) => q.sectionId === section.id);
            console.log(`Section ${section.name} (${section.id}) has ${sectionQuestions.length} questions:`, 
              sectionQuestions.map((q: Question) => q.text));
          });
          
          setQuestions(processedQuestions);
        });
      } else {
        console.log('No questions found in survey order');
      }
    } else {
      console.log('No survey order found');
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
    if (currentStep.type === 'section') {
      // When on a section view, we stay on the section view
      // but we need to move to the next section if all questions are answered
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.id);
      
      // Check if all required questions in this section are answered
      const sectionQuestions = questions.filter(q => q.sectionId === currentStep.id);
      const requiredQuestions = sectionQuestions.filter(q => q.required);
      const allRequiredAnswered = requiredQuestions.every(q => {
        const answer = responses[q._id];
        return answer !== undefined && answer !== null && answer !== '' && 
               !(Array.isArray(answer) && answer.length === 0);
      });
      
      if (allRequiredAnswered) {
        if (currentSectionIndex < sections.length - 1) {
          // Go to next section
          setCurrentStep({
            type: 'section',
            id: sections[currentSectionIndex + 1].id
          });
        } else {
          // If last section and all questions answered, submit
          handleSubmit();
        }
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep.type === 'section') {
      // Find current section
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.id);
      
      if (currentSectionIndex > 0) {
        // Go to previous section
        setCurrentStep({
          type: 'section',
          id: sections[currentSectionIndex - 1].id
        });
      }
    }
  };

  // Get timer stop function from context
  const { stopTimer } = useTimer();

  // Handle survey submission
  const handleSubmit = () => {
    // Stop the timer when user submits
    stopTimer();
    
    // Submit survey response
    if (!survey || !survey._id) return;
    
    // Create a final response
    Meteor.call(
      'surveys.submitResponse',
      {
        surveyId: survey._id,
        responseId: responseId,
        responses: responses
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
  const layout = survey.layout || 'stepByStep';
  
  // Show consent screen if needed
  const showConsentScreen = !hasConsented && !isPreviewMode;
  
  // Get elapsed time from timer context
  const { elapsedTime } = useTimer();

  // Stable callback for onSetCurrentStep
  const handleSetCurrentStep = useCallback((step: CurrentStep) => {
    setCurrentStep(step);
  }, []);

  // Render the appropriate content based on state
  if (showConsentScreen) {
    return (
      <ConsentScreen
        surveyTitle={survey.title}
        logo={survey.logo}
        averageTime={(surveyWithTime || survey).estimatedTime}
        consentText={survey.consentText}
        privacyNoticeUrl={survey.privacyNoticeUrl}
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
