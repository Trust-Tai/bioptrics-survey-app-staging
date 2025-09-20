import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { ConsentScreen, StepByStepLayout, AllOnOnePageLayout } from './index';

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

interface SimpleSurveyContentProps {
  survey: any;
  token?: string;
  isPreviewMode?: boolean;
}

const SimpleSurveyContent: React.FC<SimpleSurveyContentProps> = ({
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
  const [currentStep, setCurrentStep] = useState<CurrentStep>({ type: 'welcome', id: 'welcome' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  
  // Load survey data
  useEffect(() => {
    if (!survey || !survey._id) return;
    
    // Load sections
    if (survey.surveySections) {
      setSections(survey.surveySections.map((section: any) => ({
        id: section._id || section.id,
        name: section.name,
        description: section.description || ''
      })));
    }
    
    // Load questions
    Meteor.call('getQuestionDocuments', survey._id, (error: any, result: any) => {
      if (error) {
        console.error('Error loading questions:', error);
        return;
      }
      
      setQuestions(result);
    });
    
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
  
  // Handle consent action
  const handleConsent = () => {
    setHasConsented(true);
    
    // Save consent in localStorage
    try {
      localStorage.setItem(`survey_consent_${survey._id}`, 'true');
    } catch (e) {
      console.error('Error saving consent to localStorage:', e);
    }
  };
  
  // Check if user has already consented
  useEffect(() => {
    if (!survey || !survey._id) return;
    
    try {
      const storedConsent = localStorage.getItem(`survey_consent_${survey._id}`);
      if (storedConsent === 'true') {
        setHasConsented(true);
      }
    } catch (e) {
      console.error('Error reading consent from localStorage:', e);
    }
  }, [survey]);
  
  // Create navigation order
  const createNavigationOrder = () => {
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      return survey.surveyOrder;
    }
    
    // Create default order if not provided
    const order = [];
    
    // Add sections first
    sections.forEach(section => {
      order.push({ type: 'section', id: section.id });
      
      // Add questions for this section
      const sectionQuestions = questions.filter(q => q.sectionId === section.id);
      sectionQuestions.forEach(question => {
        order.push({ type: 'question', id: question._id });
      });
    });
    
    // Add questions without sections
    const unsectionedQuestions = questions.filter(q => !q.sectionId);
    unsectionedQuestions.forEach(question => {
      order.push({ type: 'question', id: question._id });
    });
    
    return order;
  };
  
  // Handle navigation
  const goToStep = (step: CurrentStep) => {
    setCurrentStep(step);
    
    // Save progress to server
    saveProgress();
  };
  
  const handleNext = () => {
    const navigationOrder = createNavigationOrder();
    const currentIndex = navigationOrder.findIndex(
      item => item.type === currentStep.type && item.id === currentStep.id
    );
    
    if (currentIndex < navigationOrder.length - 1) {
      goToStep({
        type: navigationOrder[currentIndex + 1].type as any,
        id: navigationOrder[currentIndex + 1].id
      });
    } else {
      // If we're at the end, show thank you screen
      setCurrentStep({ type: 'thank-you', id: 'thank-you' });
    }
  };
  
  const handleBack = () => {
    const navigationOrder = createNavigationOrder();
    const currentIndex = navigationOrder.findIndex(
      item => item.type === currentStep.type && item.id === currentStep.id
    );
    
    if (currentIndex > 0) {
      goToStep({
        type: navigationOrder[currentIndex - 1].type as any,
        id: navigationOrder[currentIndex - 1].id
      });
    } else {
      // If we're at the beginning, show welcome screen
      setCurrentStep({ type: 'welcome', id: 'welcome' });
    }
  };
  
  // Handle question answers
  const handleQuestionAnswer = (questionId: string, answer: any, saveOnly: boolean = false) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // If saveOnly is true, don't navigate
    if (saveOnly) {
      saveProgress();
      return;
    }
    
    // Check if this is the last question
    const navigationOrder = createNavigationOrder();
    const currentIndex = navigationOrder.findIndex(
      item => item.type === 'question' && item.id === questionId
    );
    
    if (currentIndex === navigationOrder.length - 1) {
      // If this is the last question, show thank you screen
      handleSubmit();
    } else {
      // Otherwise, go to next step
      handleNext();
    }
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
  
  // Handle survey submission
  const handleSubmit = () => {
    if (!survey || !survey._id) return;
    
    // Submit survey response
    Meteor.call(
      'surveys.submitResponse',
      {
        surveyId: survey._id,
        responses: responses,
        token: token,
        incompleteResponseId: responseId
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Error submitting survey:', error);
          return;
        }
        
        // Clear response ID from localStorage
        localStorage.removeItem(`survey_response_${survey._id}`);
        
        // Show thank you screen
        setIsSubmitted(true);
      }
    );
  };
  
  // If user hasn't consented yet, show the consent screen
  if (!hasConsented && !isPreviewMode) {
    return (
      <ConsentScreen
        surveyTitle={survey.title}
        logo={survey.logo}
        consentText={survey.consentText}
        privacyNoticeUrl={survey.privacyNoticeUrl}
        onConsent={handleConsent}
      />
    );
  }
  
  // Determine which layout to use
  const layout = survey.layout || 'multiStep';
  
  // Render the appropriate layout
  return (
    <div className="survey-content">
      {layout === 'allOnOnePage' ? (
        <AllOnOnePageLayout 
          survey={survey}
          sections={sections}
          questions={questions}
          responses={responses}
          onAnswer={handleQuestionAnswer}
          onSubmit={handleSubmit}
          isSubmitted={isSubmitted}
        />
      ) : (
        <StepByStepLayout 
          survey={survey}
          sections={sections}
          questions={questions}
          currentStep={currentStep}
          responses={responses}
          onAnswer={handleQuestionAnswer}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitted={isSubmitted}
        />
      )}
    </div>
  );
};

export default SimpleSurveyContent;
