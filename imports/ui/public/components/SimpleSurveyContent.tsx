import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import ModernSurveyWelcome from './ModernSurveyWelcome';
import ModernSurveySection from './ModernSurveySection';
import ModernSurveyQuestion from './ModernSurveyQuestion';
import ModernSurveyThankYou from './ModernSurveyThankYou';

// Import new layout components
import ConsentScreen from '../frontend/components/ConsentScreen';
import StepByStepLayout from '../frontend/layouts/StepByStepLayout';
import AllOnOnePageLayout from '../frontend/layouts/AllOnOnePageLayout';

// Clean, simplified interfaces
interface Question {
  _id: string;
  id?: string;
  text: string;
  type: string;
  sectionId?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  image?: string;
}

interface Section {
  id: string;
  name: string;
  description?: string;
  title?: string;
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  color?: string;
  layout?: 'stepByStep' | 'allOnOnePage';
  surveyOrder?: Array<{
    type: 'question' | 'section';
    id: string;
    order: number;
  }>;
  surveySections?: Section[];
  shareToken?: string;
  published?: boolean;
  questionCount?: number;
  sectionCount?: number;
  estimatedTime?: string;
}

interface SimpleSurveyContentProps {
  survey: Survey;
  isPreviewMode: boolean;
  token: string;
  onQuestionChange?: (questionId: string) => void;
  onSectionChange?: (sectionId: string) => void;
}

// Styled components
const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--body-font, 'Inter, sans-serif');
  color: var(--text-color, #333333);
  background-color: var(--background-color, #ffffff);
`;

// Survey step types
type SurveyStep = 
  | { type: 'welcome' }
  | { type: 'section'; sectionId: string }
  | { type: 'question'; questionId: string }
  | { type: 'thank-you' };

const SimpleSurveyContent: React.FC<SimpleSurveyContentProps> = ({ 
  survey, 
  isPreviewMode, 
  token, 
  onQuestionChange, 
  onSectionChange 
}) => {
  // Core state
  const [currentStep, setCurrentStep] = useState<SurveyStep>({ type: 'welcome' });
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation order based on surveyOrder
  const [navigationOrder, setNavigationOrder] = useState<Array<{ type: 'section' | 'question'; id: string }>>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Process survey data and create navigation order
  useEffect(() => {
    if (!survey) return;

    console.log('Processing survey for SimpleSurveyContent:', survey);

    // Extract sections
    const surveySections = survey.surveySections || [];
    setSections(surveySections);

    // Create navigation order from surveyOrder
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      console.log('Using surveyOrder for navigation:', survey.surveyOrder);
      
      // Sort by order and create navigation sequence
      const sortedOrder = [...survey.surveyOrder].sort((a, b) => a.order - b.order);
      const navOrder = sortedOrder.map(item => ({
        type: item.type,
        id: item.id
      }));
      
      setNavigationOrder(navOrder);
      console.log('Navigation order created:', navOrder);
    } else {
      console.log('No surveyOrder found, creating fallback navigation');
      // Fallback: sections first, then questions
      const navOrder: Array<{ type: 'section' | 'question'; id: string }> = [];
      
      surveySections.forEach(section => {
        navOrder.push({ type: 'section', id: section.id });
      });
      
      setNavigationOrder(navOrder);
    }

    // Load questions from database
    loadQuestions();
  }, [survey]);

  // Load questions from database
  const loadQuestions = async () => {
    if (!survey.surveyOrder) return;

    const questionIds = survey.surveyOrder
      .filter(item => item.type === 'question')
      .map(item => item.id);

    if (questionIds.length === 0) return;

    console.log('Loading questions:', questionIds);

    Meteor.call('getQuestionDocuments', questionIds, (error: any, questionDocs: any) => {
      if (error) {
        console.error('Error loading questions:', error);
        return;
      }

      if (questionDocs && questionDocs.length > 0) {
        const processedQuestions: Question[] = questionDocs.map((doc: any) => {
          const version = doc.currentVersion || {};
          return {
            _id: doc._id,
            id: doc._id,
            text: version.questionText || version.text || 'Untitled Question',
            type: version.responseType || version.type || 'text',
            sectionId: version.sectionId,
            options: version.options || [],
            scale: version.scale,
            labels: version.labels || [],
            required: version.required !== false,
            image: version.image || ''
          };
        });

        console.log('Processed questions:', processedQuestions);
        setQuestions(processedQuestions);
      }
    });
  };

  // Navigation functions
  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= navigationOrder.length) return;

    const navItem = navigationOrder[stepIndex];
    setCurrentStepIndex(stepIndex);

    if (navItem.type === 'section') {
      setCurrentStep({ type: 'section', sectionId: navItem.id });
      onSectionChange?.(navItem.id);
    } else if (navItem.type === 'question') {
      setCurrentStep({ type: 'question', questionId: navItem.id });
      onQuestionChange?.(navItem.id);
    }
  };

  const handleStart = () => {
    console.log('Starting survey');
    if (navigationOrder.length > 0) {
      goToStep(0);
    } else {
      // No navigation order, go to thank you
      setCurrentStep({ type: 'thank-you' });
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < navigationOrder.length) {
      goToStep(nextIndex);
    } else {
      // End of survey
      setCurrentStep({ type: 'thank-you' });
    }
  };

  const handleBack = () => {
    if (currentStep.type === 'welcome') return;
    
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    } else {
      setCurrentStep({ type: 'welcome' });
    }
  };

  const handleQuestionAnswer = (questionId: string, answer: any) => {
    console.log(`Question ${questionId} answered:`, answer);
    
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-advance to next step
    handleNext();
  };

  const handleSectionContinue = () => {
    handleNext();
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      if (!isPreviewMode) {
        // Submit survey responses
        const responseData = {
          surveyId: survey._id,
          responses: Object.entries(responses).map(([questionId, answer]) => ({
            questionId,
            answer,
            sectionId: questions.find(q => q._id === questionId)?.sectionId || ''
          })),
          completedAt: new Date(),
          token
        };

        await new Promise((resolve, reject) => {
          Meteor.call('surveys.submitResponse', responseData, (error: any, result: any) => {
            if (error) {
              console.error('Error submitting survey:', error);
              reject(error);
            } else {
              console.log('Survey submitted successfully:', result);
              resolve(result);
            }
          });
        });
      }

      setIsSubmitted(true);
      setCurrentStep({ type: 'thank-you' });
    } catch (error) {
      console.error('Survey submission failed:', error);
      // Still show thank you page
      setCurrentStep({ type: 'thank-you' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current section or question
  const getCurrentSection = () => {
    if (currentStep.type !== 'section') return null;
    return sections.find(s => s.id === currentStep.sectionId);
  };

  const getCurrentQuestion = () => {
    if (currentStep.type !== 'question') return null;
    return questions.find(q => q._id === currentStep.questionId || q.id === currentStep.questionId);
  };

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <ModernSurveyWelcome
            survey={{
              ...survey,
              questionCount: questions.length,
              sectionCount: sections.length,
              estimatedTime: `${Math.max(1, Math.ceil(questions.length * 0.5))} min`
            }}
            onStart={handleStart}
            totalQuestions={questions.length}
            totalSections={sections.length}
          />
        );

      case 'section':
        const currentSection = getCurrentSection();
        if (!currentSection) {
          console.error('Section not found, advancing to next step');
          handleNext();
          return null;
        }

        return (
          <ModernSurveySection
            section={{
              ...currentSection,
              description: currentSection.description || ''
            }}
            survey={survey}
            onContinue={handleSectionContinue}
            onBack={handleBack}
            surveyId={survey._id}
          />
        );

      case 'question':
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
          console.error('Question not found, advancing to next step');
          handleNext();
          return null;
        }

        return (
          <ModernSurveyQuestion
            question={currentQuestion}
            survey={survey}
            onAnswer={(answer) => handleQuestionAnswer(currentQuestion._id, answer)}
            onBack={handleBack}
          />
        );

      case 'thank-you':
        return (
          <ModernSurveyThankYou
            survey={survey}
          />
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  // Use the new layout components based on survey.layout property
  if (survey.layout === 'allOnOnePage') {
    return (
      <AllOnOnePageLayout
        survey={survey}
        sections={sections}
        questions={questions}
        responses={responses}
        onAnswer={(questionId: string, answer: any) => {
          setResponses(prev => ({
            ...prev,
            [questionId]: answer
          }));
        }}
        onSubmit={handleSubmit}
        isSubmitted={isSubmitted}
      />
    );
  } else {
    // Default to step-by-step layout
    return (
      <ContentContainer>
        {currentStep.type === 'welcome' ? (
          <ModernSurveyWelcome
            survey={{
              ...survey,
              questionCount: questions.length,
              sectionCount: sections.length,
              estimatedTime: `${Math.max(1, Math.ceil(questions.length * 0.5))} min`
            }}
            onStart={handleStart}
            totalQuestions={questions.length}
            totalSections={sections.length}
          />
        ) : isSubmitted || currentStep.type === 'thank-you' ? (
          <ModernSurveyThankYou survey={survey} />
        ) : (
          <StepByStepLayout
            survey={survey}
            sections={sections}
            questions={questions}
            currentStep={currentStep.type === 'section' 
              ? { type: 'section', id: currentStep.sectionId } 
              : { type: 'question', id: currentStep.questionId }
            }
            responses={responses}
            onAnswer={handleQuestionAnswer}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitted={isSubmitted}
          />
        )}
      </ContentContainer>
    );
  }
};

export default SimpleSurveyContent;
