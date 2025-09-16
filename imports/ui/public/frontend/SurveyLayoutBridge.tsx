import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import ConsentScreen from './components/ConsentScreen';
import StepByStepLayout from './layouts/StepByStepLayout';
import AllOnOnePageLayout from './layouts/AllOnOnePageLayout';

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

interface SurveyLayoutBridgeProps {
  survey: any;
  token?: string;
  isPreviewMode?: boolean;
}

const SurveyLayoutBridge: React.FC<SurveyLayoutBridgeProps> = ({
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
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      // Extract question IDs from survey order
      const questionIds = survey.surveyOrder
        .filter((item: any) => item.type === 'question')
        .map((item: any) => item.id);

      if (questionIds.length > 0) {
        console.log('Loading questions with IDs:', questionIds);
        
        Meteor.call('getQuestionDocuments', questionIds, (error: any, result: any) => {
          if (error) {
            console.error('Error loading questions:', error);
            return;
          }
          
          console.log('Loaded questions:', result);
          
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
            
            console.log(`Question ${doc._id} mapped to section ${sectionId || 'none'}`);
            
            return {
              _id: doc._id,
              id: doc._id,
              text: version.questionText || version.text || 'Untitled Question',
              type: version.responseType || version.type || 'text',
              responseType: version.responseType || version.type || 'text',
              sectionId: sectionId,
              options: version.options || [],
              required: version.required !== false,
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
  
  // Handle question answers
  const handleQuestionAnswer = (questionId: string, answer: any) => {
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
  const layout = survey.layout || 'stepByStep';
  
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
          currentStep={{ type: 'welcome', id: 'welcome' }}
          responses={responses}
          onAnswer={handleQuestionAnswer}
          onNext={() => {}}
          onBack={() => {}}
          onSubmit={handleSubmit}
          isSubmitted={isSubmitted}
        />
      )}
    </div>
  );
};

export default SurveyLayoutBridge;
