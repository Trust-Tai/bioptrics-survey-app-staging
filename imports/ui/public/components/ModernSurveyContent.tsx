import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import ModernSurveyWelcome from './ModernSurveyWelcome';
import ModernSurveySection from './ModernSurveySection';
import ModernSurveyQuestion from './ModernSurveyQuestion';
import ModernSurveyThankYou from './ModernSurveyThankYou';
import ModernSurveyProgress from './ModernSurveyProgress';

// Types
interface Question {
  _id: string;
  id?: string;
  text: string;
  type: string;
  sectionId?: string;
  sectionName?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  order?: number;
}

interface Section {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  priority?: number;
  color?: string;
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  selectedQuestions?: Record<string, any[]>;
  siteTextQuestions?: any[];
  shareToken?: string;
  sectionQuestions?: any[];
  surveySections?: Section[];
}

interface ModernSurveyContentProps {
  survey: Survey;
  isPreviewMode: boolean;
  token: string;
}

// Styled components
const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (min-width: 768px) {
    padding: 40px;
  }
`;

// Survey step types
type SurveyStep = 
  | { type: 'welcome' }
  | { type: 'section'; sectionId: string }
  | { type: 'question'; questionId: string }
  | { type: 'thank-you' };

/**
 * ModernSurveyContent - Manages the survey flow and content
 */
const ModernSurveyContent: React.FC<ModernSurveyContentProps> = ({ survey, isPreviewMode, token }) => {
  // State for questions, sections, and navigation
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentStep, setCurrentStep] = useState<{
    type: 'welcome' | 'section' | 'question' | 'thank-you';
    sectionId?: string;
    questionId?: string;
  }>({ type: 'welcome' });
  
  // Store user responses
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Generate a unique key for storing this survey's progress in localStorage
  const getProgressStorageKey = () => {
    return `survey-progress-${survey._id}-${token}`;
  };
  
  // Save current progress to localStorage
  const saveProgress = () => {
    try {
      const progressData = {
        currentStep,
        responses,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(getProgressStorageKey(), JSON.stringify(progressData));
      console.log('Survey progress saved successfully');
    } catch (error) {
      console.error('Error saving survey progress:', error);
    }
  };
  
  // Load saved progress from localStorage
  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem(getProgressStorageKey());
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Verify the data structure
        if (parsedData.currentStep && parsedData.responses) {
          setCurrentStep(parsedData.currentStep);
          setResponses(parsedData.responses);
          console.log('Survey progress loaded successfully');
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading survey progress:', error);
    }
    return false;
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Process survey data to extract questions and sections
  useEffect(() => {
    if (!survey) return;
    
    // Process sections
    const surveySection = survey.surveySections || [];
    setSections(surveySection);
    
    // Process questions
    const allQuestions: Question[] = [];
    
    // Add section questions if available
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      survey.sectionQuestions.forEach(q => {
        if (q && q.id) {
          allQuestions.push({
            _id: q.id,
            id: q.id,
            text: q.text,
            type: q.type,
            sectionId: q.sectionId,
            order: q.order || 0,
            options: q.options,
            scale: q.scale,
            labels: q.labels,
            required: q.required
          });
        }
      });
    }
    
    // Add selected questions if available
    if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
      Object.entries(survey.selectedQuestions).forEach(([sectionId, sectionQuestions]) => {
        if (Array.isArray(sectionQuestions)) {
          sectionQuestions.forEach((q: any, index: number) => {
            // Get the question ID/value
            let questionId = '';
            let questionData: any = {};
            
            if (typeof q === 'string') {
              questionId = q;
            } else if (q && typeof q === 'object') {
              questionId = q.value || q.id || '';
              questionData = q;
            }
            
            if (questionId) {
              // Find the section name
              const section = sections.find(s => s.id === sectionId);
              
              allQuestions.push({
                _id: questionId,
                id: questionId,
                text: questionData.questionText || questionData.text || 'Untitled Question',
                type: questionData.type || 'text',
                sectionId: sectionId,
                sectionName: section?.name || '',
                order: index,
                options: questionData.options,
                scale: questionData.scale,
                labels: questionData.labels,
                required: questionData.required
              });
            }
          });
        }
      });
    }
    
    // Add site text questions if available
    if (survey.siteTextQuestions && Array.isArray(survey.siteTextQuestions)) {
      survey.siteTextQuestions.forEach((q: any, index: number) => {
        if (q && typeof q === 'object' && (q.value || q.id)) {
          allQuestions.push({
            _id: q.value || q.id,
            id: q.value || q.id,
            text: q.text || 'Untitled Question',
            type: 'text',
            sectionId: 'site-specific',
            sectionName: 'Site-specific Questions',
            order: index,
            required: q.required
          });
        }
      });
    }
    
    // Sort questions by section and order
    allQuestions.sort((a, b) => {
      if (a.sectionId !== b.sectionId) {
        return (a.sectionId || '').localeCompare(b.sectionId || '');
      }
      return (a.order || 0) - (b.order || 0);
    });
    
    setQuestions(allQuestions);
  }, [survey]);
  
  // Get current question or section based on step
  const getCurrentQuestion = (): Question | null => {
    if (currentStep.type !== 'question') return null;
    return questions.find(q => q._id === currentStep.questionId || q.id === currentStep.questionId) || null;
  };
  
  const getCurrentSection = (): Section | null => {
    if (currentStep.type !== 'section') return null;
    return sections.find(s => s.id === currentStep.sectionId) || null;
  };
  
  // Custom function to update current step and save progress
  const updateCurrentStep = (newStep: {
    type: 'welcome' | 'section' | 'question' | 'thank-you';
    sectionId?: string;
    questionId?: string;
  }) => {
    setCurrentStep(newStep);
    
    // Don't save welcome screen progress
    if (newStep.type !== 'welcome') {
      setTimeout(() => saveProgress(), 0);
    }
  };
  
  // Navigation functions
  const handleStart = () => {
    // If we have sections, go to the first section
    if (sections.length > 0) {
      updateCurrentStep({ type: 'section', sectionId: sections[0].id });
    } 
    // Otherwise go to the first question
    else if (questions.length > 0) {
      updateCurrentStep({ type: 'question', questionId: questions[0]._id || questions[0].id || '' });
    }
    // If no questions or sections, go to thank you
    else {
      updateCurrentStep({ type: 'thank-you' });
    }
  };
  
  const handleSectionContinue = (sectionId: string) => {
    // Find questions for this section
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    
    if (sectionQuestions.length > 0) {
      // Go to the first question in this section
      updateCurrentStep({ 
        type: 'question', 
        questionId: sectionQuestions[0]._id || sectionQuestions[0].id || '' 
      });
    } else {
      // Find the next section
      const currentSectionIndex = sections.findIndex(s => s.id === sectionId);
      if (currentSectionIndex < sections.length - 1) {
        // Go to the next section
        updateCurrentStep({ 
          type: 'section', 
          sectionId: sections[currentSectionIndex + 1].id 
        });
      } else {
        // No more sections, go to thank you
        updateCurrentStep({ type: 'thank-you' });
      }
    }
  };
  
  const handleQuestionAnswer = (questionId: string, answer: any) => {
    // Save the answer to responses
    setResponses(prevResponses => {
      const updatedResponses = {
        ...prevResponses,
        [questionId]: answer
      };
      
      // Save progress to localStorage
      saveProgress();
      
      return updatedResponses;
    });
    
    // Find the current question
    const currentQuestion = questions.find(q => q._id === questionId || q.id === questionId);
    if (!currentQuestion) return;
    
    // Find the current question index in its section
    const sectionQuestions = questions.filter(q => q.sectionId === currentQuestion.sectionId);
    const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === questionId || q.id === questionId);
    
    // Check if this is the last question in the survey
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    const isLastSection = sections.findIndex(s => s.id === currentQuestion.sectionId) === sections.length - 1;
    const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
    
    // If this is the last question in the survey, let the submit button handle navigation
    // This prevents the automatic navigation from conflicting with the submit process
    if (isLastQuestionInSurvey) {
      console.log('Last question detected - waiting for submit button click');
      return;
    }
    
    // If there are more questions in this section
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      // Go to the next question in this section
      updateCurrentStep({ 
        type: 'question', 
        questionId: sectionQuestions[currentQuestionIndex + 1]._id || sectionQuestions[currentQuestionIndex + 1].id || '' 
      });
    } else {
      // Find the next section
      const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
      if (currentSectionIndex < sections.length - 1) {
        // Go to the next section
        updateCurrentStep({ 
          type: 'section', 
          sectionId: sections[currentSectionIndex + 1].id 
        });
      } else {
        // No more sections, go to thank you
        updateCurrentStep({ type: 'thank-you' });
      }
    }
  };
  
  const handleBack = () => {
    // Handle back navigation based on current step
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) return;
      
      // Find the current question index in its section
      const sectionQuestions = questions.filter(q => q.sectionId === currentQuestion.sectionId);
      const currentQuestionIndex = sectionQuestions.findIndex(
        q => q._id === currentQuestion._id || q.id === currentQuestion.id
      );
      
      // If this is the first question in the section
      if (currentQuestionIndex === 0) {
        // Go back to the section
        updateCurrentStep({ type: 'section', sectionId: currentQuestion.sectionId || '' });
      } else {
        // Go to the previous question
        updateCurrentStep({ 
          type: 'question', 
          questionId: sectionQuestions[currentQuestionIndex - 1]._id || sectionQuestions[currentQuestionIndex - 1].id || '' 
        });
      }
    } else if (currentStep.type === 'section') {
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.sectionId);
      
      // If this is the first section
      if (currentSectionIndex === 0) {
        // Go back to welcome
        updateCurrentStep({ type: 'welcome' });
      } else {
        // Find the previous section's last question
        const prevSectionId = sections[currentSectionIndex - 1].id;
        const prevSectionQuestions = questions.filter(q => q.sectionId === prevSectionId);
        
        if (prevSectionQuestions.length > 0) {
          // Go to the last question of the previous section
          const lastQuestion = prevSectionQuestions[prevSectionQuestions.length - 1];
          updateCurrentStep({ 
            type: 'question', 
            questionId: lastQuestion._id || lastQuestion.id || '' 
          });
        } else {
          // Go to the previous section
          updateCurrentStep({ type: 'section', sectionId: prevSectionId });
        }
      }
    } else if (currentStep.type === 'thank-you') {
      // Go back to the last question or section
      if (questions.length > 0) {
        const lastQuestion = questions[questions.length - 1];
        updateCurrentStep({ 
          type: 'question', 
          questionId: lastQuestion._id || lastQuestion.id || '' 
        });
      } else if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        updateCurrentStep({ type: 'section', sectionId: lastSection.id });
      } else {
        updateCurrentStep({ type: 'welcome' });
      }
    }
  };
  
  // Load saved progress when the component initializes
  useEffect(() => {
    // Wait until questions and sections are loaded
    if (questions.length > 0 || sections.length > 0) {
      // Only try to load progress if we're at the welcome screen
      if (currentStep.type === 'welcome') {
        const progressLoaded = loadProgress();
        if (progressLoaded) {
          console.log('Resumed survey from saved progress');
        }
      }
    }
  }, [questions.length, sections.length]);
  
  // Map backend question types to frontend display types
  const mapQuestionType = (backendType: string): string => {
    // Normalize the type string (lowercase, trim spaces)
    const normalizedType = backendType.toLowerCase().trim();
    
    // Map to the types expected by ModernSurveyQuestion
    switch (normalizedType) {
      case 'text':
      case 'short_text':
      case 'short-text':
      case 'shorttext':
        return 'text';
        
      case 'long_text':
      case 'long-text':
      case 'longtext':
      case 'textarea':
      case 'paragraph':
        return 'textarea';
        
      case 'single_choice':
      case 'single-choice':
      case 'singlechoice':
      case 'radio':
      case 'mcq':
        return 'single-choice';
        
      case 'multiple_choice':
      case 'multiple-choice':
      case 'multiplechoice':
      case 'checkbox':
      case 'checkboxes':
        return 'multiple-choice';
        
      case 'scale':
      case 'rating':
      case 'likert':
      case 'likert_scale':
      case 'likert-scale':
        return 'scale';
        
      default:
        console.warn(`Unknown question type: ${backendType}, defaulting to text`);
        return 'text';
    }
  };
  
  // Process question options to ensure they're in the correct format
  const processQuestionOptions = (question: Question): string[] => {
    // If the question already has options in the right format, return them
    if (question.options && Array.isArray(question.options) && question.options.length > 0) {
      return question.options;
    }
    
    // Handle different formats of options that might be in the data
    const questionType = mapQuestionType(question.type);
    
    // For choice-based questions, provide default options if none are available
    if (questionType === 'single-choice' || questionType === 'multiple-choice') {
      // Check if options might be in a different property
      const anyQuestion = question as any;
      
      // Try to find options in various possible properties
      if (anyQuestion.choices && Array.isArray(anyQuestion.choices)) {
        return anyQuestion.choices;
      }
      
      if (anyQuestion.answers && Array.isArray(anyQuestion.answers)) {
        return anyQuestion.answers;
      }
      
      // If we have a string of comma-separated options, split them
      if (typeof anyQuestion.options === 'string') {
        return anyQuestion.options.split(',').map((opt: string) => opt.trim());
      }
      
      // If all else fails, provide default options
      console.warn(`No options found for choice question: ${question._id}, using defaults`);
      return ['Option 1', 'Option 2', 'Option 3'];
    }
    
    // For scale questions, return empty array (scale is handled separately)
    if (questionType === 'scale') {
      return [];
    }
    
    // For text/textarea questions, no options needed
    return [];
  };
  
  const handleSubmit = () => {
    if (isPreviewMode) {
      // In preview mode, just show thank you
      updateCurrentStep({ type: 'thank-you' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Submit responses to the server
    Meteor.call('surveys.submitResponse', {
      surveyId: survey._id,
      responses,
      token
    }, (error: Error | null) => {
      setIsSubmitting(false);
      
      if (error) {
        console.error('Error submitting survey:', error);
        setSubmitError(error.message);
      } else {
        // Show thank you screen and clear saved progress
        updateCurrentStep({ type: 'thank-you' });
        // Clear saved progress since survey is complete
        try {
          localStorage.removeItem(getProgressStorageKey());
          console.log('Cleared saved progress after successful submission');
        } catch (e) {
          console.error('Error clearing saved progress:', e);
        }
      }
    });
  };
  
  // Calculate detailed progress information
  const calculateProgressInfo = () => {
    let completedSteps = 0;
    let currentStepNumber = 0;
    
    // Get the actual number of questions (no duplicates)
    const totalSteps = getTotalSteps();
    const actualQuestionCount = totalSteps - 2; // Subtract welcome and thank-you screens
    
    // If on welcome screen, progress is 0
    if (currentStep.type === 'welcome') return { progress: 0, currentStepNumber: 0, totalSteps: totalSteps };
    if (currentStep.type === 'thank-you') return { progress: 100, currentStepNumber: totalSteps, totalSteps: totalSteps };
    
    if (currentStep.type === 'section') {
      // For sections, count all previous sections and their questions
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.sectionId);
      
      // Count questions in previous sections
      let previousQuestions = 0;
      for (let i = 0; i < currentSectionIndex; i++) {
        const sectionId = sections[i].id;
        // Count unique questions in this section
        const uniqueQuestionIds = new Set();
        questions.filter(q => q.sectionId === sectionId).forEach(q => {
          const qId = q._id || q.id || '';
          if (qId) uniqueQuestionIds.add(qId);
        });
        previousQuestions += uniqueQuestionIds.size;
      }
      
      // For section screens, we've completed all previous questions plus the section intro
      completedSteps = previousQuestions + 1;
      currentStepNumber = completedSteps;
      
      // Calculate progress percentage - adjust for actual questions only
      const progress = Math.round((previousQuestions / actualQuestionCount) * 100);
      
      return { progress, currentStepNumber, totalSteps };
    }
    
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) return { progress: 0, currentStepNumber: 0, totalSteps };
      
      // Count unique questions in previous sections
      const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
      let previousQuestions = 0;
      for (let i = 0; i <currentSectionIndex; i++) {
        const sectionId = sections[i].id;
        // Count unique questions in this section
        const uniqueQuestionIds = new Set();
        questions.filter(q => q.sectionId === sectionId).forEach(q => {
          const qId = q._id || q.id || '';
          if (qId) uniqueQuestionIds.add(qId);
        });
        previousQuestions += uniqueQuestionIds.size;
      }
      
      // Count completed questions in current section
      const sectionQuestions = questions.filter(q => q.sectionId === currentQuestion.sectionId);
      const currentQuestionIndex = sectionQuestions.findIndex(
        q => q._id === currentQuestion._id || q.id === currentQuestion.id
      );
      
      // Log for debugging
      console.log('Progress calculation:', {
        currentSectionIndex,
        previousQuestions,
        currentQuestionIndex,
        totalQuestions: actualQuestionCount
      });
      
      completedSteps = previousQuestions + currentQuestionIndex;
      currentStepNumber = previousQuestions + currentQuestionIndex + 2; // +2 to account for welcome screen
      
      // Calculate progress percentage based on actual questions only
      const questionsCompleted = previousQuestions + currentQuestionIndex;
      const progress = actualQuestionCount > 0 ? 
        Math.round((questionsCompleted / actualQuestionCount) * 100) : 0;
      
      return { progress, currentStepNumber, totalSteps };
    }
    
    return { progress: 0, currentStepNumber: 0, totalSteps };
  };
  
  // Get total number of steps (sections + questions)
  const getTotalSteps = () => {
    // Count only the actual questions in the survey plus welcome and thank-you screens
    // First, verify we have the correct questions by filtering out any duplicates
    const uniqueQuestionIds = new Set();
    const actualQuestions = questions.filter(question => {
      const questionId = question._id || question.id || '';
      if (!questionId || uniqueQuestionIds.has(questionId)) {
        return false; // Skip duplicates or questions without IDs
      }
      uniqueQuestionIds.add(questionId);
      return true;
    });
    
    // Log the actual question count for debugging
    console.log(`Survey has ${actualQuestions.length} unique questions across ${sections.length} sections`);
    
    // Return actual questions + welcome + thank you
    return actualQuestions.length + 2;
  };
  
  // Calculate just the progress percentage for backward compatibility
  const calculateProgress = (): number => {
    return calculateProgressInfo().progress;
  };
  
  // Render the appropriate content based on the current step
  const renderContent = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <ModernSurveyWelcome
            survey={survey}
            onStart={handleStart}
          />
        );
        
      case 'section':
        const currentSection = getCurrentSection();
        if (!currentSection) return null;
        
        return (
          <ModernSurveySection
            section={currentSection}
            onContinue={() => handleSectionContinue(currentSection.id)}
            onBack={handleBack}
            color={survey.color}
          />
        );
        
      case 'question':
        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) return null;
        
        // Find the current question index and total questions in this section
        const sectionQuestions = questions.filter(q => q.sectionId === currentQuestion.sectionId);
        const currentQuestionIndex = sectionQuestions.findIndex(
          q => q._id === currentQuestion._id || q.id === currentQuestion.id
        );
        
        // Calculate simple question progress
        const questionProgress = `${currentQuestionIndex + 1} of ${sectionQuestions.length}`;
        
        // Map backend question type to frontend display type and ensure options are properly formatted
        const mappedQuestion = {
          ...currentQuestion,
          type: mapQuestionType(currentQuestion.type),
          options: processQuestionOptions(currentQuestion)
        };
        
        // Debug information for last question detection
        const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
        const isLastSection = sections.findIndex(s => s.id === currentQuestion.sectionId) === sections.length - 1;
        const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
        
        console.log('Question debug:', {
          questionId: currentQuestion._id || currentQuestion.id,
          questionIndex: currentQuestionIndex,
          sectionQuestionsLength: sectionQuestions.length,
          sectionId: currentQuestion.sectionId,
          sectionIndex: sections.findIndex(s => s.id === currentQuestion.sectionId),
          totalSections: sections.length,
          isLastQuestionInSection,
          isLastSection,
          isLastQuestionInSurvey
        });
        
        return (
          <ModernSurveyQuestion
            question={mappedQuestion}
            progress={questionProgress}
            onAnswer={(answer) => handleQuestionAnswer(currentQuestion._id || currentQuestion.id || '', answer)}
            onBack={handleBack}
            value={responses[currentQuestion._id || currentQuestion.id || '']}
            color={survey.color}
            isLastQuestion={isLastQuestionInSurvey}
            onSubmit={handleSubmit}
          />
        );
        
      case 'thank-you':
        return (
          <ModernSurveyThankYou
            survey={survey}
            color={survey.color}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <ContentContainer>
      <ModernSurveyProgress 
        progress={calculateProgress()} 
        color={survey.color}
        currentStep={calculateProgressInfo().currentStepNumber}
        totalSteps={calculateProgressInfo().totalSteps}
      />
      {renderContent()}
    </ContentContainer>
  );
};

export default ModernSurveyContent;
