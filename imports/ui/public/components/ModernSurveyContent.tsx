import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
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
    
    console.log('Processing survey data:', survey);
    
    // Process sections - ensure they're sorted by priority/order
    const surveySection = survey.surveySections || [];
    
    console.log('Raw survey sections:', {
      surveySections: surveySection,
      count: surveySection.length,
      isEmpty: surveySection.length === 0
    });
    
    // If no sections are defined but we have questions, create a default section
    if (surveySection.length === 0 && 
        ((survey.sectionQuestions && survey.sectionQuestions.length > 0) || 
         (survey.selectedQuestions && Object.keys(survey.selectedQuestions).length > 0))) {
      
      console.log('No sections found but questions exist - creating default section');
      
      // Create a default section
      const defaultSection = {
        id: 'default-section',
        name: 'Survey Questions',
        description: 'Please answer the following questions',
        isActive: true,
        priority: 0
      };
      
      surveySection.push(defaultSection);
    }
    
    // Sort sections by priority if available, otherwise keep original order
    const sortedSections = [...surveySection].sort((a, b) => {
      // If both have priority, sort by priority
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      // If only one has priority, prioritize that one
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      // Otherwise keep original order
      return 0;
    });
    
    console.log('Sorted sections:', sortedSections);
    setSections(sortedSections);
    
    // Process questions
    const allQuestions: Question[] = [];
    
    console.log('Processing survey data:', {
      sections: surveySection,
      sectionQuestions: survey.sectionQuestions,
      selectedQuestions: survey.selectedQuestions
    });
    
    // Add section questions if available
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      console.log('Processing sectionQuestions:', survey.sectionQuestions);
      
      survey.sectionQuestions.forEach(q => {
        if (q && q.id) {
          // If no sectionId is specified or the section doesn't exist, assign to default section
          let targetSectionId = q.sectionId;
          
          // Check if the section exists
          const sectionExists = sortedSections.some(s => s.id === targetSectionId);
          
          // If no section ID or section doesn't exist, use the default or first section
          if (!targetSectionId || !sectionExists) {
            // Try to find the default section first
            const defaultSection = sortedSections.find(s => s.id === 'default-section');
            // If no default section, use the first available section
            targetSectionId = defaultSection ? defaultSection.id : 
                             (sortedSections.length > 0 ? sortedSections[0].id : 'default-section');
          }
          
          console.log('Adding question to section:', {
            questionId: q.id,
            originalSectionId: q.sectionId,
            assignedSectionId: targetSectionId,
            text: q.text
          });
          
          allQuestions.push({
            _id: q.id,
            id: q.id,
            text: q.text,
            type: q.type,
            sectionId: targetSectionId,
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
      console.log('Processing selectedQuestions:', survey.selectedQuestions);
      
      Object.entries(survey.selectedQuestions).forEach(([sectionId, sectionQuestions]) => {
        console.log(`Processing questions for section ID: ${sectionId}`);
        
        // Determine the target section ID
        let targetSectionId = sectionId;
        
        // Check if this section exists in our sections array
        const sectionExists = sortedSections.some(s => s.id === sectionId);
        console.log(`Section ${sectionId} exists in sections array: ${sectionExists}`);
        
        // If section doesn't exist, use default or first section
        if (!sectionExists) {
          // Try to find the default section first
          const defaultSection = sortedSections.find(s => s.id === 'default-section');
          // If no default section, use the first available section
          targetSectionId = defaultSection ? defaultSection.id : 
                           (sortedSections.length > 0 ? sortedSections[0].id : 'default-section');
          
          console.log(`Section ${sectionId} not found, using ${targetSectionId} instead`);
        }
        
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
              const section = sortedSections.find(s => s.id === targetSectionId);
              
              console.log('Adding selected question to section:', {
                questionId,
                originalSectionId: sectionId,
                assignedSectionId: targetSectionId,
                sectionFound: !!section,
                questionText: questionData.questionText || questionData.text || 'Untitled Question'
              });
              
              allQuestions.push({
                _id: questionId,
                id: questionId,
                text: questionData.questionText || questionData.text || 'Untitled Question',
                type: questionData.type || 'text',
                sectionId: targetSectionId,
                sectionName: section?.name || 'Survey Questions',
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
      console.log('Processing siteTextQuestions:', survey.siteTextQuestions);
      
      // Find a target section for site text questions
      // Try to find the default section first
      const defaultSection = sortedSections.find(s => s.id === 'default-section');
      // If no default section, use the first available section
      const targetSectionId = defaultSection ? defaultSection.id : 
                           (sortedSections.length > 0 ? sortedSections[0].id : 'default-section');
      
      survey.siteTextQuestions.forEach((q: any, index: number) => {
        if (q && typeof q === 'object' && (q.value || q.id)) {
          console.log('Adding site text question:', {
            questionId: q.value || q.id,
            assignedSectionId: targetSectionId,
            text: q.text || 'Untitled Question'
          });
          
          allQuestions.push({
            _id: q.value || q.id,
            id: q.value || q.id,
            text: q.text || 'Untitled Question',
            type: 'text',
            sectionId: targetSectionId,
            sectionName: defaultSection?.name || 'Survey Questions',
            order: index,
            required: q.required
          });
        }
      });
    }
    
    // Sort questions by section and order
    // First, get the section order from our sorted sections
    const sectionOrder = sortedSections.reduce((acc, section, index) => {
      acc[section.id] = index;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort questions first by section order, then by question order within section
    allQuestions.sort((a, b) => {
      const aSectionOrder = sectionOrder[a.sectionId || ''] ?? 999;
      const bSectionOrder = sectionOrder[b.sectionId || ''] ?? 999;
      
      // First sort by section order
      if (aSectionOrder !== bSectionOrder) {
        return aSectionOrder - bSectionOrder;
      }
      
      // Then sort by question order within the section
      return (a.order || 0) - (b.order || 0);
    });
    
    setQuestions(allQuestions);
    
    // Debug logging for sections and questions
    console.log('Processed survey data:', {
      sections: surveySection,
      totalSections: surveySection.length,
      questions: allQuestions,
      totalQuestions: allQuestions.length,
      questionsBySection: surveySection.map(section => ({
        sectionId: section.id,
        sectionName: section.name,
        questionCount: allQuestions.filter(q => questionBelongsToSection(q, section.id)).length
      }))
    });
  }, [survey]);
  
  // Get the current question based on the current step
  const getCurrentQuestion = (): Question | null => {
    if (currentStep.type !== 'question' || !currentStep.questionId) return null;
    
    // Find the question by ID first
    const question = questions.find(q => q._id === currentStep.questionId || q.id === currentStep.questionId);
    return question || null;
  };
  
  // Helper function to get questions for a specific section
  const getQuestionsForSection = (sectionId: string) => {
    if (!sectionId) {
      console.warn('getQuestionsForSection called with empty sectionId');
      return [];
    }
    
    // Filter questions that belong to this section
    const filteredQuestions = questions.filter(question => questionBelongsToSection(question, sectionId));
    
    // Sort questions by their order property
    const sortedQuestions = [...filteredQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log(`getQuestionsForSection(${sectionId}):`, {
      sectionId,
      sectionName: sections.find(s => s.id === sectionId)?.name,
      totalQuestions: questions.length,
      filteredCount: filteredQuestions.length,
      questions: sortedQuestions.map(q => ({
        id: q._id || q.id,
        text: q.text?.substring(0, 30),
        order: q.order,
        sectionId: q.sectionId
      }))
    });
    
    return sortedQuestions;
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
    console.log('handleStart called with:', {
      sectionsAvailable: sections.length,
      questionsAvailable: questions.length,
      firstSection: sections.length > 0 ? sections[0] : null
    });
    
    // Debug information about sections and questions
    console.log('Available sections:', sections.map(s => ({ id: s.id, name: s.name })));
    console.log('Questions by section:', sections.map(section => ({
      sectionId: section.id,
      sectionName: section.name,
      questions: questions.filter(q => q.sectionId === section.id).map(q => ({ id: q._id, text: q.text }))
    })));
    
    // Always go to the first section if available
    if (sections.length > 0) {
      console.log('Navigating to first section:', sections[0]);
      updateCurrentStep({ type: 'section', sectionId: sections[0].id });
    } 
    // If no sections available, go to the first question (fallback)
    else if (questions.length > 0) {
      console.log('No sections available, going to first question');
      updateCurrentStep({ type: 'question', questionId: questions[0]._id || questions[0].id || '' });
    }
    // If no questions or sections, go to thank you
    else {
      console.log('No sections or questions available, going to thank you screen');
      updateCurrentStep({ type: 'thank-you' });
    }
  };
  
  // Helper function to check if a question belongs to a section
  const questionBelongsToSection = (question: Question, sectionId: string) => {
    // If either is missing, they can't match
    if (!question.sectionId || !sectionId) return false;
    
    // Normalize both IDs for comparison (trim whitespace, lowercase)
    const normalizedQuestionSectionId = question.sectionId.trim().toLowerCase();
    const normalizedSectionId = sectionId.trim().toLowerCase();
    
    // Check for direct match
    if (normalizedQuestionSectionId === normalizedSectionId) return true;
    
    // Check if one ID is a substring of the other
    // This handles cases where IDs might have different formats but refer to the same section
    if (normalizedQuestionSectionId.includes(normalizedSectionId) || 
        normalizedSectionId.includes(normalizedQuestionSectionId)) {
      return true;
    }
    
    // Check if the question has a sectionName that matches the section's name
    const section = sections.find(s => s.id === sectionId);
    if (section && question.sectionName && 
        section.name.trim().toLowerCase() === question.sectionName.trim().toLowerCase()) {
      return true;
    }
    
    return false;
  };
  
  const handleSectionContinue = (sectionId: string) => {
    console.log('handleSectionContinue called with sectionId:', sectionId);
    
    // Ensure we're working with the correct section ID format
    const currentSection = sections.find(s => s.id === sectionId);
    if (!currentSection) {
      console.error(`Section with ID ${sectionId} not found`);
      return;
    }
    
    // Get all questions for this specific section using our helper function
    const sectionQuestions = getQuestionsForSection(sectionId);
    console.log(`Found ${sectionQuestions.length} questions for section ${sectionId}`);
    
    // Log all questions for this section to help with debugging
    console.log('Questions for this section:', sectionQuestions.map(q => ({
      id: q._id || q.id,
      text: q.text?.substring(0, 30),
      sectionId: q.sectionId
    })));
    
    if (sectionQuestions.length > 0) {
      // Go to the first question in this section
      const firstQuestion = sectionQuestions[0];
      const questionId = firstQuestion._id || firstQuestion.id || '';
      
      console.log('Navigating to first question of section:', {
        sectionId,
        questionId,
        questionText: firstQuestion.text?.substring(0, 30)
      });
      
      updateCurrentStep({ 
        type: 'question', 
        questionId: questionId
      });
    } else {
      console.warn(`No questions found for section ${sectionId}`);
      
      // Find the next section
      const currentSectionIndex = sections.findIndex(s => s.id === sectionId);
      
      if (currentSectionIndex < sections.length - 1) {
        // Go to the next section
        const nextSectionId = sections[currentSectionIndex + 1].id;
        console.log('No questions in current section, navigating to next section:', nextSectionId);
        
        updateCurrentStep({ 
          type: 'section', 
          sectionId: nextSectionId
        });
      } else {
        // No more sections, go to thank you
        console.log('No more sections, going to thank-you screen');
        updateCurrentStep({ type: 'thank-you' });
      }
    }
  };
  
  const handleQuestionAnswer = (questionId: string, answer: any) => {
    console.log('handleQuestionAnswer called with:', { questionId, answer });
    
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
    if (!currentQuestion) {
      console.error(`Question with ID ${questionId} not found`);
      return;
    }
    
    // Find the current section
    const currentSectionId = currentQuestion.sectionId || '';
    const currentSection = sections.find(s => s.id === currentSectionId);
    if (!currentSection) {
      console.warn(`Section with ID ${currentSectionId} not found for question ${questionId}`);
    }
    
    // Find the current question index in its section
    const sectionQuestions = getQuestionsForSection(currentSectionId);
    const currentQuestionIndex = sectionQuestions.findIndex(q => q._id === questionId || q.id === questionId);
    
    console.log('Question navigation info:', {
      questionId,
      sectionId: currentSectionId,
      sectionName: currentSection?.name,
      questionIndex: currentQuestionIndex,
      totalQuestionsInSection: sectionQuestions.length,
      isLastInSection: currentQuestionIndex === sectionQuestions.length - 1
    });
    
    // Check if this is the last question in the survey
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
    const isLastSection = currentSectionIndex === sections.length - 1;
    const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
    
    // If this is the last question in the survey, automatically submit the survey
    // This ensures the survey always navigates to the thank you page after the last question
    if (isLastQuestionInSurvey) {
      console.log('Last question in survey detected - automatically submitting survey');
      handleSubmit();
      return;
    }
    
    // If there are more questions in this section
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      // Go to the next question in this section
      const nextQuestion = sectionQuestions[currentQuestionIndex + 1];
      const nextQuestionId = nextQuestion._id || nextQuestion.id || '';
      
      console.log('Moving to next question in section:', {
        currentQuestionIndex,
        nextQuestionIndex: currentQuestionIndex + 1,
        nextQuestionId,
        nextQuestionText: nextQuestion.text?.substring(0, 30)
      });
      
      updateCurrentStep({ 
        type: 'question', 
        questionId: nextQuestionId
      });
    } else {
      // We've completed all questions in this section, go to the next section
      if (currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        
        console.log('Moving to next section:', {
          currentSectionIndex,
          nextSectionIndex: currentSectionIndex + 1,
          nextSectionId: nextSection.id,
          nextSectionName: nextSection.name
        });
        
        // Go to the next section
        updateCurrentStep({ 
          type: 'section', 
          sectionId: nextSection.id 
        });
      } else {
        // No more sections, go to thank you
        console.log('All sections completed, moving to thank-you screen');
        updateCurrentStep({ type: 'thank-you' });
      }
    }
  };
  
  const handleBack = () => {
    console.log('handleBack called from step:', currentStep);
    
    // Handle back navigation based on current step
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) {
        console.error('Current question not found');
        return;
      }
      
      const currentSectionId = currentQuestion.sectionId || '';
      
      // Find the current question index in its section
      const sectionQuestions = getQuestionsForSection(currentSectionId);
      const currentQuestionIndex = sectionQuestions.findIndex(
        q => q._id === currentQuestion._id || q.id === currentQuestion.id
      );
      
      console.log('Back navigation from question:', {
        questionId: currentQuestion._id || currentQuestion.id,
        questionIndex: currentQuestionIndex,
        sectionId: currentSectionId,
        totalQuestionsInSection: sectionQuestions.length
      });
      
      // If this is the first question in the section
      if (currentQuestionIndex === 0) {
        console.log('Going back to section intro:', currentSectionId);
        // Go back to the section
        updateCurrentStep({ type: 'section', sectionId: currentSectionId });
      } else {
        // Go to the previous question
        const prevQuestion = sectionQuestions[currentQuestionIndex - 1];
        const prevQuestionId = prevQuestion._id || prevQuestion.id || '';
        
        console.log('Going back to previous question:', {
          prevQuestionId,
          prevQuestionIndex: currentQuestionIndex - 1,
          prevQuestionText: prevQuestion.text?.substring(0, 30)
        });
        
        updateCurrentStep({ 
          type: 'question', 
          questionId: prevQuestionId
        });
      }
    } else if (currentStep.type === 'section') {
      const currentSectionIndex = sections.findIndex(s => s.id === currentStep.sectionId);
      
      console.log('Back navigation from section:', {
        sectionId: currentStep.sectionId,
        sectionIndex: currentSectionIndex,
        totalSections: sections.length
      });
      
      // If this is the first section
      if (currentSectionIndex === 0) {
        console.log('Going back to welcome screen');
        // Go back to welcome
        updateCurrentStep({ type: 'welcome' });
      } else {
        // Go to the previous section
        const prevSection = sections[currentSectionIndex - 1];
        
        console.log('Going back to previous section:', {
          prevSectionId: prevSection.id,
          prevSectionName: prevSection.name,
          prevSectionIndex: currentSectionIndex - 1
        });
        
        updateCurrentStep({ 
          type: 'section', 
          sectionId: prevSection.id 
        });
      }
    } else if (currentStep.type === 'thank-you') {
      console.log('Back navigation from thank-you screen');
      
      // If we have sections, go back to the last section
      if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        console.log('Going back to last section:', lastSection.name);
        updateCurrentStep({ type: 'section', sectionId: lastSection.id });
      } else {
        // Otherwise go back to welcome
        console.log('No sections available, going back to welcome screen');
        updateCurrentStep({ type: 'welcome' });
      }
    }
  };
  
  // Handle restart button click
  const handleRestart = () => {
    console.log('handleRestart called - resetting survey to welcome screen');
    
    // Clear responses
    setResponses({});
    
    // Clear saved progress
    try {
      localStorage.removeItem(getProgressStorageKey());
      console.log('Cleared saved progress for restart');
    } catch (e) {
      console.error('Error clearing saved progress:', e);
    }
    
    // Reset to welcome screen
    updateCurrentStep({ type: 'welcome' });
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
    console.log('handleSubmit called - preparing to submit survey');
    
    if (isPreviewMode) {
      // In preview mode, just show thank you
      console.log('Preview mode detected - skipping server submission and showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      return;
    }
    
    // Set submitting state
    setIsSubmitting(true);
    setSubmitError(null);
    
    console.log('Submitting survey responses to server:', {
      surveyId: survey._id,
      responseCount: Object.keys(responses).length,
    });
    
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
        // Even if there's an error, we should still show the thank you screen
        // This ensures the user doesn't get stuck on the last question
        console.log('Showing thank you screen despite submission error');
        updateCurrentStep({ type: 'thank-you' });
      } else {
        console.log('Survey successfully submitted - showing thank you screen');
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
        const sectionQuestions = getQuestionsForSection(currentQuestion.sectionId || '');
        const currentQuestionIndex = sectionQuestions.findIndex(
          q => q._id === currentQuestion._id || q.id === currentQuestion.id
        );
        
        // Find the section this question belongs to
        const questionSection = sections.find(s => s.id === currentQuestion.sectionId);
        
        // Calculate question progress with section context
        const questionProgress = questionSection ? 
          `Section ${sections.findIndex(s => s.id === questionSection.id) + 1}: Question ${currentQuestionIndex + 1} of ${sectionQuestions.length}` :
          `Question ${currentQuestionIndex + 1} of ${sectionQuestions.length}`;
        
        // Map backend question type to frontend display type and ensure options are properly formatted
        const mappedQuestion = {
          ...currentQuestion,
          type: mapQuestionType(currentQuestion.type),
          options: processQuestionOptions(currentQuestion)
        };
        
        // Debug information for last question detection
        const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
        const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
        const isLastSection = currentSectionIndex === sections.length - 1;
        const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
        
        // Enhanced logging for question rendering
        console.log('Rendering question with context:', {
          questionId: currentQuestion._id || currentQuestion.id,
          questionText: currentQuestion.text?.substring(0, 30),
          sectionId: currentQuestion.sectionId,
          sectionName: questionSection?.name,
          sectionIndex: currentSectionIndex,
          questionIndex: currentQuestionIndex,
          totalQuestionsInSection: sectionQuestions.length,
          isLastQuestionInSection,
          isLastSection,
          isLastQuestionInSurvey
        });
        
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
            onRestart={handleRestart}
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
