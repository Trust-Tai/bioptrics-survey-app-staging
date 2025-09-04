import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import ModernSurveyWelcome from './ModernSurveyWelcome';
import ModernSurveySection from './ModernSurveySection';
import ModernSurveyQuestion from './ModernSurveyQuestion';
import ModernSurveyThankYou from './ModernSurveyThankYou';
import ModernSurveyProgress from './ModernSurveyProgress';
import DeviceTracker from './DeviceTracker';

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
  image?: string;
  versions?: any[];
  currentVersion?: number;
}

interface Section {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  color?: string;
  image?: string;
  document?: string;
  documentName?: string;
  documentType?: string;
  questionCount?: number;
  requiredQuestionCount?: number;
  estimatedTime?: string;
  index?: number;
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  layout?: 'stepByStep' | 'allOnOnePage';
  selectedQuestions?: Record<string, string[]>;
  sectionQuestions?: Array<{
    questionId?: string;
    id?: string;
    text?: string;
    questionText?: string;
    type?: string;
    sectionId?: string;
    options?: any[];
    scale?: any;
    labels?: string[];
    required?: boolean;
    order?: number;
  }>;
  siteTextQuestions?: Array<{
    value?: string;
    id?: string;
    text?: string;
    required?: boolean;
  }>;
  surveySections?: Section[];
  surveyOrder?: Array<{
    type: 'question' | 'section';
    id: string;
    order: number;
  }>;
  shareToken?: string;
  published?: boolean;
  isTemplate?: boolean;
  templateName?: string;
  templateCategory?: string;
  organizationId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalQuestions?: number;
  estimatedTime?: string;
  expectations?: Array<{
    title: string;
    description: string;
  }>;
  expectationsTitle?: string;
  startButtonLabel?: string;
}

interface ExtendedSurvey extends Survey {
  questionCount?: number;
  sectionCount?: number;
  demographics?: {
    [key: string]: any;
  }
  allowRetake?: boolean;
  retakeMode?: 'replace' | 'new';
  estimatedTime?: string;
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
  font-family: var(--body-font, 'Inter, sans-serif');
  color: var(--text-color, #333333);
  
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
// Update Survey interface to include defaultSettings
interface ExtendedSurvey extends Survey {
  defaultSettings?: {
    allowRetake?: boolean;
    retakeMode?: 'replace' | 'new';
    [key: string]: any;
  }
  allowRetake?: boolean;
  retakeMode?: 'replace' | 'new';
  estimatedTime?: string;
}

const ModernSurveyContent: React.FC<ModernSurveyContentProps & {
  survey: ExtendedSurvey;
  onQuestionChange?: (questionId: string) => void;
  onSectionChange?: (sectionId: string) => void;
}> = ({ survey, isPreviewMode, token, onQuestionChange, onSectionChange }) => {
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
  
  // Flag to track if survey has been submitted
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Store the current response ID for potential replacement on retake
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  
  // State for section-by-section navigation in all-on-one-page layout
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  
  // Generate a unique key for storing this survey's progress in localStorage
  const getProgressStorageKey = () => {
    return `survey-progress-${survey._id}-${token}`;
  };
  
  // The handleRestart function implementation is now at line ~1010
  // This declaration was removed to fix the duplicate function error
  
  // Save current progress to localStorage and server
  const saveProgress = async () => {
    // Don't save progress if the survey has been submitted
    if (isSubmitted) {
      console.log('Survey already submitted, skipping progress save');
      return;
    }
    
    try {
      // Collect all questions and responses
      let allResponses = {...responses};
      
      // If we're on a question step, make sure to capture the current answer
      // This ensures we save the answer immediately even if it hasn't been added to the responses state yet
      if (currentStep.type === 'question' && currentStep.questionId) {
        const currentQuestionId = currentStep.questionId;
        console.log('Checking for current question answer:', currentQuestionId);
        
        // If this question doesn't have an answer in state yet, try to get it from the DOM
        if (!allResponses[currentQuestionId]) {
          // Look for text inputs
          const textInput = document.querySelector('.text-input') as HTMLTextAreaElement;
          if (textInput && textInput.value) {
            console.log('Found text input value in DOM:', textInput.value);
            allResponses[currentQuestionId] = textInput.value;
          }
          
          // Look for selected radio options
          const selectedOption = document.querySelector('.option-item.selected .option-text');
          if (selectedOption) {
            const optionText = selectedOption.textContent || '';
            console.log('Found selected option in DOM:', optionText);
            allResponses[currentQuestionId] = optionText;
          }
          
          // Look for selected scale values
          const selectedScale = document.querySelector('.scale-option.selected');
          if (selectedScale) {
            const scaleValue = selectedScale.textContent?.trim() || '';
            console.log('Found selected scale value in DOM:', scaleValue);
            allResponses[currentQuestionId] = scaleValue;
          }
        }
      }
      
      // Save to localStorage for client-side persistence
      const progressData = {
        currentStep,
        responses: allResponses,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(getProgressStorageKey(), JSON.stringify(progressData));
      
      // Calculate progress percentage based on answered questions vs total questions
      const answeredCount = Object.keys(allResponses).length;
      console.log('question::---', questions);
      const totalQuestions = questions.length;
      const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
      
      console.log(`Saving progress: ${answeredCount}/${totalQuestions} questions answered (${progressPercentage}%)`);
      
      // Get existing responseId from localStorage if available
      let existingResponseId = null;
      try {
        const savedData = localStorage.getItem(getProgressStorageKey());
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          existingResponseId = parsedData.responseId;
          console.log('Found existing response ID in localStorage:', existingResponseId);
        }
      } catch (e) {
        console.error('Error retrieving existing response ID:', e);
      }
      
      // Save to server for tracking incomplete responses
      if (!isPreviewMode && token && !isSubmitted) {
        try {
          // If we already have a responseId, update it, otherwise create a new one
          if (existingResponseId) {
            console.log('Updating existing incomplete survey response:', existingResponseId);
            
            // Update the incomplete response with current answers - one at a time to avoid overwhelming the server
            const updatePromises = Object.entries(responses).map(([questionId, answer]) => {
              return new Promise((resolve) => {
                // Find the question to get its section ID
                const question = questions.find(q => q._id === questionId || q.id === questionId);
                const sectionId = question?.sectionId || '';
                
                Meteor.call(
                  'incompleteSurveyResponses.update',
                  existingResponseId,
                  questionId,
                  answer,
                  sectionId,
                  (updateError: any) => {
                    if (updateError) {
                      console.error(`Error updating response for question ${questionId}:`, updateError);
                    } else {
                      console.log(`Successfully updated response for question ${questionId}`);
                    }
                    resolve(null);
                  }
                );
              });
            });
            
            // Wait for all updates to complete
            Promise.all(updatePromises).then(() => {
              console.log('All response updates completed');
            }).catch(err => {
              console.error('Error in update promises:', err);
            });
          } else if (!isSubmitted) {
            // Create a new incomplete survey response only if not submitted
            // Make sure we have a valid token to use as respondentId
            const respondentId = token || `anonymous-${new Date().getTime()}`;
            console.log('Starting incomplete survey with respondentId:', respondentId);
            
            Meteor.call(
              'incompleteSurveyResponses.start',
              survey._id,
              respondentId,
              (error: any, responseId: string) => {
                if (error) {
                  console.error('Error starting survey tracking:', error);
                } else {
                  console.log('Created new incomplete survey response:', responseId);
                  
                  // Store the responseId in localStorage for later retrieval
                  try {
                    const savedData = localStorage.getItem(getProgressStorageKey());
                    if (savedData) {
                      const parsedData = JSON.parse(savedData);
                      parsedData.responseId = responseId;
                      localStorage.setItem(getProgressStorageKey(), JSON.stringify(parsedData));
                      console.log('Saved responseId to localStorage');
                    }
                  } catch (e) {
                    console.error('Error saving responseId to localStorage:', e);
                  }
                  
                  // Update the incomplete response with current answers - one at a time
                  const updatePromises = Object.entries(responses).map(([questionId, answer]) => {
                    return new Promise((resolve) => {
                      // Find the question to get its section ID
                      const question = questions.find(q => q._id === questionId || q.id === questionId);
                      const sectionId = question?.sectionId || '';
                      
                      Meteor.call(
                        'incompleteSurveyResponses.update',
                        responseId,
                        questionId,
                        answer,
                        sectionId,
                        (updateError: any) => {
                          if (updateError) {
                            console.error(`Error updating response for question ${questionId}:`, updateError);
                          } else {
                            console.log(`Successfully updated response for question ${questionId}`);
                          }
                          resolve(null);
                        }
                      );
                    });
                  });
                  
                  // Wait for all updates to complete
                  Promise.all(updatePromises).then(() => {
                    console.log('All initial response updates completed');
                  }).catch(err => {
                    console.error('Error in update promises:', err);
                  });
                }
              }
            );
          }
        } catch (error) {
          console.error('Error in server-side progress saving:', error);
        }
      }
      
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
        
        // Check if we have a valid saved state
        if (parsedData.currentStep && parsedData.responses) {
          // Restore the current step and responses
          setCurrentStep(parsedData.currentStep);
          setResponses(parsedData.responses);
          
          // IMPORTANT: Also restore the responseId if available
          if (parsedData.responseId) {
            console.log('Restoring saved responseId from localStorage:', parsedData.responseId);
            setCurrentResponseId(parsedData.responseId);
            
            // If we have a responseId and the survey is configured for replace mode,
            // make sure we set the metadata accordingly
            const retakeMode = survey.defaultSettings?.retakeMode || 'new';
            if (retakeMode === 'replace') {
              console.log('Setting metadata.retakeMode to "replace" for existing responseId');
              // Update the metadata in the saved data to include retake mode
              parsedData.metadata = parsedData.metadata || {};
              parsedData.metadata.retakeMode = 'replace';
              localStorage.setItem(getProgressStorageKey(), JSON.stringify(parsedData));
            }
          }
          
          console.log('Loaded saved progress from localStorage');
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error);
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
        title: 'Survey Questions',
        description: 'Please answer the following questions',
        isActive: true,
        document: undefined,
        documentName: undefined,
        documentType: undefined
      };
      
      surveySection.push(defaultSection);
    }
    
    // Ensure all sections have document fields
    const sectionsWithDocumentFields = surveySection.map(section => ({
      ...section,
      document: section.document || undefined,
      documentName: section.documentName || undefined,
      documentType: section.documentType || undefined
    }));
    
    console.log('Sections with document fields:', sectionsWithDocumentFields);
    
    // Keep sections in their original order - surveyOrder will handle sorting later
    const sortedSections = [...sectionsWithDocumentFields];
    
    console.log('Sorted sections:', sortedSections);
    setSections(sortedSections);
    
    // Process questions
    const allQuestions: Question[] = [];
    const processedQuestionIds = new Set<string>(); // Track processed question IDs to prevent duplicates
    
    console.log('Processing survey data:', {
      sections: surveySection,
      sectionQuestions: survey.sectionQuestions,
      selectedQuestions: survey.selectedQuestions
    });
    
    // Add section questions if available (primary source)
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      console.log('Processing sectionQuestions:', {
        totalCount: survey.sectionQuestions.length,
        questions: survey.sectionQuestions
      });
      
      survey.sectionQuestions.forEach((q, index) => {
        // Handle different field name variations for question IDs
        const questionId = q.questionId || q.id || (q as any)._id;
        
        console.log(`Processing sectionQuestion ${index + 1}:`, {
          questionId: questionId,
          hasQuestionId: !!questionId,
          sectionId: q.sectionId,
          order: q.order,
          text: q.text || q.questionText,
          rawData: q
        });
        
        if (q && questionId) {
          // Check if we've already processed this question ID to prevent duplicates
          if (processedQuestionIds.has(questionId)) {
            console.log(`Skipping duplicate question ID: ${questionId}`);
            return;
          }
          
          // Mark this question ID as processed
          processedQuestionIds.add(questionId);
          
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
            questionId: questionId,
            targetSectionId: targetSectionId
          });
          
          const targetSection = sortedSections.find(s => s.id === targetSectionId);
          
          const questionData = {
            _id: questionId,
            id: questionId,
            text: q.text || q.questionText || '',
            type: q.type || 'text',
            sectionId: targetSectionId,
            sectionName: targetSection?.name || 'Default Section',
            options: q.options || [],
            scale: q.scale,
            labels: q.labels || [],
            required: q.required !== false, // Default to true unless explicitly false
            order: q.order || 0,
            image: q.image || ''
          };
          
          allQuestions.push(questionData);
        } else {
          console.warn(`Skipping sectionQuestion ${index + 1} - no valid questionId found:`, {
            questionId: q.questionId,
            id: q.id,
            _id: (q as any)._id,
            fullObject: q
          });
        }
      });
    } else {
      console.log('No sectionQuestions found, checking selectedQuestions for fallback');
    }

    // Process selectedQuestions (questions without sections) - handle both array and object formats
    if (survey.selectedQuestions) {
      console.log('Processing selectedQuestions:', survey.selectedQuestions);
      
      // Handle array format (legacy format with just question IDs)
      if (Array.isArray(survey.selectedQuestions)) {
        console.log('selectedQuestions is an array, processing question IDs:', survey.selectedQuestions);
        
        // Find or create a default section for these questions
        let targetSectionId = 'default-section';
        const defaultSection = sortedSections.find(s => s.id === 'default-section');
        if (!defaultSection && sortedSections.length > 0) {
          targetSectionId = sortedSections[0].id;
        }
        
        survey.selectedQuestions.forEach((questionId: string, index: number) => {
          if (questionId && typeof questionId === 'string') {
            // Check if we've already processed this question ID to prevent duplicates
            if (processedQuestionIds.has(questionId)) {
              console.log(`Skipping duplicate question ID from selectedQuestions: ${questionId}`);
              return;
            }
            
            // Mark this question ID as processed
            processedQuestionIds.add(questionId);
            
            console.log('Adding question from selectedQuestions array:', {
              questionId,
              targetSectionId,
              index
            });
            
            const targetSection = sortedSections.find(s => s.id === targetSectionId);
            
            allQuestions.push({
              _id: questionId,
              id: questionId,
              text: 'Loading question...', // Will be loaded from database
              type: 'text', // Default type, will be updated from database
              sectionId: targetSectionId,
              sectionName: targetSection?.name || 'Survey Questions',
              options: [],
              scale: undefined,
              labels: [],
              required: true,
              order: index,
              image: ''
            });
          }
        });
      }
      // Handle object format (sections with question arrays)
      else if (typeof survey.selectedQuestions === 'object') {
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
              // Check if we've already processed this question ID to prevent duplicates
              if (processedQuestionIds.has(questionId)) {
                console.log(`Skipping duplicate question ID from selectedQuestions object: ${questionId}`);
                return;
              }
              
              // Mark this question ID as processed
              processedQuestionIds.add(questionId);
              
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
                required: questionData.required,
                image: questionData.image || ''
              });
            }
          });
        }
        });
      }
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
            required: q.required,
            image: q.image || ''
          });
        }
      });
    }
    
    // Sort questions and sections according to surveyOrder if available
    if (survey.surveyOrder && Array.isArray(survey.surveyOrder)) {
      console.log('Using surveyOrder for question/section arrangement:', survey.surveyOrder);
      
      // Create a map of order positions for quick lookup
      const orderMap = survey.surveyOrder.reduce((acc: Record<string, number>, item: { type: string; id: string }, index: number) => {
        acc[`${item.type}-${item.id}`] = index;
        return acc;
      }, {} as Record<string, number>);
      
      // Sort questions based on surveyOrder
      allQuestions.sort((a, b) => {
        const aOrderKey = `question-${a.id}`;
        const bOrderKey = `question-${b.id}`;
        
        const aOrder = orderMap[aOrderKey] ?? 999;
        const bOrder = orderMap[bOrderKey] ?? 999;
        
        return aOrder - bOrder;
      });
      
      // Also sort sections based on surveyOrder
      const sortedSectionsByOrder = [...sortedSections].sort((a, b) => {
        const aOrderKey = `section-${a.id}`;
        const bOrderKey = `section-${b.id}`;
        
        const aOrder = orderMap[aOrderKey] ?? 999;
        const bOrder = orderMap[bOrderKey] ?? 999;
        
        return aOrder - bOrder;
      });
      
      setSections(sortedSectionsByOrder);
      
      console.log('Questions and sections sorted by surveyOrder:', {
        questionsOrder: allQuestions.map(q => ({ id: q.id, text: q.text })),
        sectionsOrder: sortedSectionsByOrder.map(s => ({ id: s.id, name: s.name }))
      });
    } else {
      console.log('No surveyOrder found, using default section/question order');
      
      // Fallback to original sorting logic
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
        
        // Keep original order within section - surveyOrder will handle final sorting
        return 0;
      });
    }
    
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
        questionCount: allQuestions.filter(q => q.sectionId === section.id).length
      }))
    });
    // Calculate and store the total survey time for all questions
    console.log('Calculating total time for all questions in survey');
    Meteor.call('getQuestionDocuments', allQuestions.map(q => q._id), (questionError: any, questionDocs: any) => {
      if (questionError) {
        console.error('Error fetching question documents:', questionError);
      } else if (questionDocs && questionDocs.length > 0) {
        console.log('Received question documents from database:', questionDocs);
        
        // Update questions with actual data from database
        const updatedQuestions = allQuestions.map(question => {
          const questionDoc = questionDocs.find((doc: any) => doc._id === question._id);
          if (questionDoc && questionDoc.currentVersion) {
            const version = questionDoc.currentVersion;
            return {
              ...question,
              text: version.questionText || version.text || question.text,
              type: version.responseType || version.type || question.type,
              options: version.options || question.options,
              scale: version.scale || question.scale,
              labels: version.labels || question.labels,
              required: version.required !== undefined ? version.required : question.required,
              image: version.image || question.image || ''
            };
          }
          return question;
        });
        
        console.log('Updated questions with database data:', updatedQuestions);
        setQuestions(updatedQuestions);
        // Calculate total time directly from question documents
        const totalEstimatedSeconds = questionDocs.reduce((total: number, doc: any) => {
          const seconds = doc.currentVersion?.estimatedTimeSeconds || 30; // Default to 30 seconds
          console.log(`Question ${doc._id}: ${seconds} seconds`);
          return total + seconds;
        }, 0);
        
        // Add 30 seconds buffer for survey overhead (reading intro, etc.)
        const totalWithBuffer = totalEstimatedSeconds + 30;
        
        const minutes = Math.ceil(totalWithBuffer / 60);
        
   
        // Store in localStorage for use by ModernSurveyWelcome and ModernSurveySection
        // Add a small delay to ensure all calculations are complete
        setTimeout(() => {
          try {
            const surveyTimeKey = `survey_time_${survey._id}`;
            const timeData = {
              surveyId: survey._id,
              totalEstimatedSeconds: totalWithBuffer,
              minutes,
              questionCount: questionDocs.length,
              timestamp: new Date().getTime()
            };
            localStorage.setItem(surveyTimeKey, JSON.stringify(timeData));
            console.log(`Stored total survey time in localStorage with key ${surveyTimeKey}:`, timeData);
            
            // Dispatch a custom event to notify other components that time data is ready
            const timeDataReadyEvent = new CustomEvent('survey-time-data-ready', { 
              detail: { surveyId: survey._id, timeData } 
            });
            window.dispatchEvent(timeDataReadyEvent);
            console.log('Dispatched survey-time-data-ready event');
          } catch (storageError) {
            console.error('Error storing survey time data:', storageError);
          }
        }, 200);
      }
    });


  }, [survey]);

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

    // Filter questions for this section
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    
    // Sort questions by order
    const sortedQuestions = sectionQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Get section name
    const section = sections.find(s => s.id === sectionId);
    const sectionName = section?.name || 'Unknown Section';
    

    // Keep questions in their original order - surveyOrder handles the sorting
    const sortedQuestions = [...filteredQuestions];

    
    console.log(`Getting questions for section: ${sectionName} (${sectionId})`);
    console.log(`Found ${sortedQuestions.length} questions in section`);
    
    // Log each question ID for debugging
    questionIds.forEach((id, index) => {
      console.log(`Question ${index + 1}: ${id}`);
    });
    
    // Create a formatted table of questions for better visualization
    console.group(`Detailed questions for section ${sectionName}:`);
    console.table(sortedQuestions.map(q => ({
      id: q._id || q.id,
      text: q.text?.substring(0, 30) + (q.text && q.text.length > 30 ? '...' : ''),
      order: q.order,
      type: q.type,
      required: q.required ? 'Yes' : 'No'
    })));
    console.groupEnd();
    
    // Fetch full question documents from the database
    if (questionIds.length > 0) {
      console.log('Fetching full question documents from database...');
      Meteor.call('getQuestionDocuments', questionIds, (error: any, result: any) => {
        if (error) {
          console.error('Error fetching question documents:', error);
        } else if (result && result.length > 0) {
          console.log(`Retrieved ${result.length} full question documents:`);
          
          // Log each question document
          result.forEach((doc: any, index: number) => {
            console.group(`Full question document ${index + 1}: ${doc._id}`);
            console.log(doc);
            
            // Extract and log the estimatedTimeSeconds specifically
            const estimatedTimeSeconds = doc.currentVersion?.estimatedTimeSeconds || 'Not set';
            
            console.groupEnd();
          });
          
          // Create a summary table of the question documents with focus on estimated time
          console.group('Question estimated times summary:');
          console.table(result.map((doc: any) => ({
            id: doc._id,
            title: doc.currentVersion?.title || 'Untitled',
            estimatedTimeSeconds: doc.currentVersion?.estimatedTimeSeconds || 'Not set',
            category: doc.currentVersion?.category || 'Uncategorized',
            required: doc.currentVersion?.required ? 'Yes' : 'No'
          })));
          console.groupEnd();
          
          const requiredQuestionCount = result.filter((doc: any) => doc.currentVersion?.required).length;
          console.log('requiredQuestionCount----', requiredQuestionCount);
          // Calculate and log the total estimated time for this section
          const totalEstimatedSeconds = result.reduce((total: number, doc: any) => {
            const seconds = doc.currentVersion?.estimatedTimeSeconds || 30; // Default to 30 seconds
            return total + seconds;
          }, 0);
          
          const minutes = Math.ceil(totalEstimatedSeconds / 60);
          
          // Store the calculated time in localStorage for access by other components
          try {
            // Create a key for this specific section
            const sectionTimeKey = `section_time_${sectionId}`;
            
            // Store the time data
            const timeData = {
              sectionId,
              sectionName,
              totalEstimatedSeconds,
              minutes,
              timestamp: new Date().getTime()
            };
            
            localStorage.setItem(sectionTimeKey, JSON.stringify(timeData));
            console.log(`Stored calculated time for section ${sectionName} in localStorage`);
          } catch (error) {
            console.error('Error storing section time data:', error);
          }
          
        } else {
          console.warn('No question documents returned from database');
        }
      });
    }
    
    return sortedQuestions;
  };
  
  // Get the current section
  const getCurrentSection = () => {
    if (currentStep.type !== 'section') return null;
    return sections.find(s => s.id === currentStep.sectionId) || null;
  };

// Helper function to check if a question belongs to a section
const questionBelongsToSection = (question: Question, sectionId: string): boolean => {
  return question.sectionId === sectionId;
};

// Helper function to get the count of questions for a specific section
const getQuestionsCountForSection = (sectionId: string): number => {
  return getQuestionsForSection(sectionId).length;
};

// Get the current section index (1-based)
const getCurrentSectionIndex = (sectionId: string) => {
  const index = sections.findIndex(s => s.id === sectionId);
  return index >= 0 ? index + 1 : 1; // 1-based index, default to 1 if not found
};

// Custom function to update current step and save progress
const updateCurrentStep = (newStep: {
  type: 'welcome' | 'section' | 'question' | 'thank-you';
  sectionId?: string;
  questionId?: string;
}) => {
  setCurrentStep(newStep);
  
  // Call the callback functions for real-time tracking
  if (newStep.type === 'question' && newStep.questionId && onQuestionChange) {
    onQuestionChange(newStep.questionId);
  }
  
  if (newStep.type === 'section' && newStep.sectionId && onSectionChange) {
    onSectionChange(newStep.sectionId);
  }
  
  // Don't save welcome screen progress or if survey has been submitted
  if (newStep.type !== 'welcome' && !isSubmitted) {
    console.log('Saving progress after step update (isSubmitted:', isSubmitted, ')');
    setTimeout(() => saveProgress(), 0);
  }
};

  // Handle navigating to the next question without saving an answer
  const handleNextQuestion = () => {
    console.log('handleNextQuestion called');
    const currentQuestion = getCurrentQuestion();
    console.log('Current question:', currentQuestion);
    
    if (!currentQuestion) {
      console.log('No current question found, returning early');
      return;
    }

    // Use the existing navigation logic from handleQuestionAnswer
    // but without saving an answer
    const questionId = currentQuestion._id || currentQuestion.id || '';
    console.log('Current question ID:', questionId);
    
    // Get all questions for the current section
    const sectionQuestions = getQuestionsForSection(currentQuestion.sectionId || '');
    console.log('Section questions:', sectionQuestions.length, 'for section:', currentQuestion.sectionId);
    
    // Find the current question index
    const currentQuestionIndex = sectionQuestions.findIndex(
      q => q._id === questionId || q.id === questionId
    );
    console.log('Current question index:', currentQuestionIndex);
    
    // Check if this is the last question in the section
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    console.log('Is last question in section:', isLastQuestionInSection);
    
    // Find the current section index
    const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
    console.log('Current section index:', currentSectionIndex, 'total sections:', sections.length);
    
    // Check if this is the last section
    const isLastSection = currentSectionIndex === sections.length - 1;
    console.log('Is last section:', isLastSection);
    
    // Determine if this is the last question in the survey
    const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
    console.log('Is last question in survey:', isLastQuestionInSurvey);
    
    if (isLastQuestionInSurvey) {
      // If this is the last question in the survey, navigate to the thank you screen
      console.log('Navigating to thank you screen');
      updateCurrentStep({ type: 'thank-you' });
    } else if (isLastQuestionInSection) {
      // If this is the last question in the section but not the last section,
      // navigate to the next section
      const nextSection = sections[currentSectionIndex + 1];
      console.log('Navigating to next section:', nextSection?.id);
      updateCurrentStep({ type: 'section', sectionId: nextSection.id });
    } else {
      // Otherwise, navigate to the next question in the current section
      const nextQuestion = sectionQuestions[currentQuestionIndex + 1];
      console.log('Navigating to next question:', nextQuestion?._id || nextQuestion?.id);
      updateCurrentStep({ 
        type: 'question', 
        questionId: nextQuestion._id || nextQuestion.id || '' 
      });
    }
  };

// Handle restarting the survey from the thank you screen
const handleRestart = () => {
  console.log('Restarting survey - resetting session start time');
  
  // Reset the session start time to now
  setSessionStartTime(new Date());
  console.log('Session start time reset to:', new Date().toISOString());
  
  // Get the retake mode from survey settings
  const retakeMode = survey.defaultSettings?.retakeMode || 'new';
  console.log(`Survey retake mode: ${retakeMode}`);
  
  if (retakeMode === 'replace' && currentResponseId) {
    console.log(`Replace mode: Will update existing response ID: ${currentResponseId}`);
    // In replace mode, we'll keep the same responseId but clear responses
    
    // Clear responses in state
    setResponses({});
    
    // Reset progress in localStorage but keep the responseId
    try {
      const progressKey = getProgressStorageKey();
      const savedData = localStorage.getItem(progressKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const responseId = parsedData.responseId;
        
        // Save empty responses but keep the same responseId
        localStorage.setItem(progressKey, JSON.stringify({
          currentStep: { type: 'welcome' },
          responses: {},
          timestamp: new Date().toISOString(),
          responseId,
          // Also reset timer data
          startTime: new Date(),
          endTime: null
        }));
        console.log(`Cleared responses but kept responseId: ${responseId}`);
      }
    } catch (error) {
      console.error('Error resetting progress while keeping responseId:', error);
    }
    
    // Reset the server-side incomplete response data
    if (currentResponseId) {
      Meteor.call('incompleteSurveyResponses.reset', currentResponseId, (error: any) => {
        if (error) {
          console.error('Error resetting incomplete survey response:', error);
        } else {
          console.log(`Successfully reset incomplete survey response: ${currentResponseId}`);
        }
      });
    }
  } else {
    console.log('New response mode: Will create a new response');
    // In 'new' mode (or if no currentResponseId), create a completely new response
    
    // Clear responses in state
    setResponses({});
    
    // Clear progress in localStorage completely
    try {
      // Remove the old progress data
      localStorage.removeItem(getProgressStorageKey());
      
      // Create new progress data with fresh timer
      localStorage.setItem(getProgressStorageKey(), JSON.stringify({
        currentStep: { type: 'welcome' },
        responses: {},
        timestamp: new Date().toISOString(),
        // Reset timer data
        startTime: new Date(),
        endTime: null
      }));
      
      console.log('Cleared saved progress and reset timer for restart');
    } catch (error) {
      console.error('Error clearing progress from localStorage:', error);
    }
    
    // Reset the currentResponseId
    setCurrentResponseId(null);
  }
  
  // Reset submission state
  setIsSubmitted(false);
  
  // Navigate back to welcome screen
  updateCurrentStep({ type: 'welcome' });
  };
  
  // Map backend question types to frontend display types
  const mapQuestionType = (backendType: string): string => {
    // Normalize the type string (lowercase, trim spaces)
    const normalizedType = backendType.toLowerCase().trim();
    
    console.log(`Mapping question type: ${backendType} (normalized: ${normalizedType})`);
    
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
        
      case 'dropdown':
      case 'select':
      case 'combobox':
      case 'combo':
      case 'dropdown_menu':
      case 'dropdown-menu':
      case 'dropdownmenu':
        console.log('Detected dropdown question type');
        return 'dropdown';
        
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
      case 'file':
      case 'attachment':
      case 'upload':
      case 'document':
      case 'fileupload':
      case 'file_upload':
      case 'file-upload':
        console.log('Detected file question type');
        return 'file';
        
      case 'date':
      case 'datetime':
      case 'calendar':
      case 'datepicker':
      case 'date_picker':
      case 'date-picker':
        console.log('Detected date question type');
        return 'date';
        
      default:
        console.warn(`Unknown question type: ${backendType}, defaulting to text`);
        return 'text';
    }
  };
  
  // Process question options to ensure they're in the correct format
  const processQuestionOptions = (question: Question): string[] => {
    console.log('Processing options for question:', question._id || question.id, 'type:', question.type);
    
    // Check for versions array first (important for dropdown questions)
    if (Array.isArray((question as any).versions) && (question as any).versions.length > 0) {
      const versionIndex = (question as any).currentVersion !== undefined ? 
        Math.min((question as any).currentVersion, (question as any).versions.length - 1) : 0;
      const versionData = (question as any).versions[versionIndex];
      
      console.log('Found versions array, checking version data:', versionData);
      
      if (versionData && Array.isArray(versionData.options) && versionData.options.length > 0) {
        console.log('Using options from versions array:', versionData.options);
        return versionData.options;
      }
    }
    
    // If the question already has options in the right format, return them
    if (question.options && Array.isArray(question.options) && question.options.length > 0) {
      console.log('Using direct options from question:', question.options);
      return question.options;
    }
    
    // Handle different formats of options that might be in the data
    const questionType = mapQuestionType(question.type);
    console.log('Mapped question type:', questionType);
    
    // For choice-based questions and dropdowns, provide default options if none are available
    if (questionType === 'single-choice' || questionType === 'multiple-choice' || questionType === 'dropdown') {
      // Check if options might be in a different property
      const anyQuestion = question as any;
      
      // Try to find options in various possible properties
      if (anyQuestion.choices && Array.isArray(anyQuestion.choices)) {
        console.log('Using choices property:', anyQuestion.choices);
        return anyQuestion.choices;
      }
      
      if (anyQuestion.answers && Array.isArray(anyQuestion.answers)) {
        console.log('Using answers property:', anyQuestion.answers);
        return anyQuestion.answers;
      }
      
      // If we have a string of comma-separated options, split them
      if (typeof anyQuestion.options === 'string') {
        const options = anyQuestion.options.split(',').map((opt: string) => opt.trim());
        console.log('Split string options into array:', options);
        return options;
      }
      
      // If all else fails, provide default options
      console.warn(`No options found for ${questionType} question: ${question._id || question.id}, using defaults`);
      return questionType === 'dropdown' ? 
        ['Select an option...', 'Option 1', 'Option 2', 'Option 3'] : 
        ['Option 1', 'Option 2', 'Option 3'];
    }
    
    // For scale questions, return empty array (scale is handled separately)
    if (questionType === 'scale') {
      return [];
    }
    
    // For text/textarea questions, no options needed
    return [];
  };
  
  // Session start time is used for completion time calculation
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  
  // Handle starting the survey from the welcome screen
  const handleStart = () => {
    console.log('Survey started - resetting session start time');
    // Reset the session start time to now
    setSessionStartTime(new Date());
    
    // Reset timer data in localStorage
    try {
      const progressKey = getProgressStorageKey();
      const savedData = localStorage.getItem(progressKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Update with fresh timer data
        localStorage.setItem(progressKey, JSON.stringify({
          ...parsedData,
          startTime: new Date(),
          endTime: null
        }));
      } else {
        // Create new progress data with fresh timer
        localStorage.setItem(progressKey, JSON.stringify({
          currentStep: { type: 'section', sectionId: sections.length > 0 ? sections[0].id : '' },
          responses: {},
          timestamp: new Date().toISOString(),
          startTime: new Date(),
          endTime: null
        }));
      }
      console.log('Timer reset for survey start');
    } catch (error) {
      console.error('Error resetting timer data:', error);
    }
    
    // Navigate based on the survey's question arrangement from Questions tab
    console.log('Starting survey - checking question arrangement:', {
      sectionsLength: sections.length,
      questionsLength: questions.length,
      surveyOrder: survey.surveyOrder,
      sectionQuestions: survey.sectionQuestions,
      selectedQuestions: survey.selectedQuestions,
      availableSections: sections.map(s => ({ id: s.id, name: s.name })),
      availableQuestions: questions.map(q => ({ id: q._id || q.id, text: q.text?.substring(0, 30) }))
    });

    // Check if we have a defined survey order from the Questions tab
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      console.log('Using surveyOrder from Questions tab:', survey.surveyOrder);
      const firstItem = survey.surveyOrder[0];
      
      if (firstItem.type === 'section') {
        // Verify the section exists before navigating
        const sectionExists = sections.some(s => s.id === firstItem.id);
        if (sectionExists) {
          console.log('Navigating to first section:', firstItem.id);
          updateCurrentStep({ type: 'section', sectionId: firstItem.id });
        } else {
          console.warn('Section not found in sections array:', firstItem.id);
          // Fall through to next logic
        }
      } else if (firstItem.type === 'question') {
        // Verify the question exists before navigating
        const questionExists = questions.some(q => q._id === firstItem.id || q.id === firstItem.id);
        if (questionExists) {
          console.log('Navigating to first question:', firstItem.id);
          updateCurrentStep({ type: 'question', questionId: firstItem.id });
        } else {
          console.warn('Question not found in questions array:', firstItem.id);
          // Fall through to next logic
        }
      }
      return; // Exit early if surveyOrder was processed
    }
    // Check if we have sectionQuestions (Questions tab arrangement)
    if (survey.sectionQuestions && survey.sectionQuestions.length > 0) {
      console.log('Using sectionQuestions arrangement:', survey.sectionQuestions);
      const firstQuestion = survey.sectionQuestions[0];
      
      // If the first question has a section, go to that section
      if (firstQuestion.sectionId && sections.some(s => s.id === firstQuestion.sectionId)) {
        updateCurrentStep({ type: 'section', sectionId: firstQuestion.sectionId });
      } else {
        // Go directly to the first question
        updateCurrentStep({ type: 'question', questionId: firstQuestion.questionId || firstQuestion.id });
      }
    }
    // Check if we have selectedQuestions (legacy format, questions without sections)
    if (survey.selectedQuestions && Array.isArray(survey.selectedQuestions) && survey.selectedQuestions.length > 0) {
      console.log('Using selectedQuestions array:', survey.selectedQuestions);
      // Go directly to the first question ID
      updateCurrentStep({ type: 'question', questionId: survey.selectedQuestions[0] });
    }
    if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object' && Object.keys(survey.selectedQuestions).length > 0) {
      console.log('Using selectedQuestions object:', survey.selectedQuestions);
      // Get the first question from the selectedQuestions object
      const firstSectionQuestions = Object.values(survey.selectedQuestions)[0];
      if (Array.isArray(firstSectionQuestions) && firstSectionQuestions.length > 0) {
        updateCurrentStep({ type: 'question', questionId: firstSectionQuestions[0] });
      }
    }
    // Fallback to original logic
    if (sections.length > 0) {
      console.log('Fallback: Using first section');
      updateCurrentStep({ type: 'section', sectionId: sections[0].id });
    } 
    if (questions.length > 0) {
      console.log('Fallback: Using first question');
      updateCurrentStep({ type: 'question', questionId: questions[0]._id || questions[0].id || '' });
    }
  };
  
  // Handle going back to the previous step
  const handleBack = () => {
    console.log('Going back to previous step, current step:', currentStep);
    
    // Determine the previous step based on the current step
    if (currentStep.type === 'question' && currentStep.questionId) {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) {
        console.log('No current question found, going to welcome');
        updateCurrentStep({ type: 'welcome' });
        return;
      }
      
      // Get all questions for the current section
      const sectionQuestions = getQuestionsForSection(currentQuestion.sectionId || '');
      console.log('Section questions for back navigation:', sectionQuestions.length);
      
      // Find the current question index
      const currentQuestionIndex = sectionQuestions.findIndex(
        q => q._id === currentQuestion._id || q.id === currentQuestion.id
      );
      console.log('Current question index:', currentQuestionIndex);
      
      // If this is the first question in the section
      if (currentQuestionIndex === 0) {
        // Check if this is the first question in the entire survey
        const allQuestionsInOrder = questions.sort((a, b) => (a.order || 0) - (b.order || 0));
        const globalQuestionIndex = allQuestionsInOrder.findIndex(
          q => q._id === currentQuestion._id || q.id === currentQuestion.id
        );
        
        console.log('Global question index:', globalQuestionIndex, 'of', allQuestionsInOrder.length);
        
        if (globalQuestionIndex === 0) {
          // This is the very first question in the survey, go back to welcome
          console.log('First question in survey, going to welcome');
          updateCurrentStep({ type: 'welcome' });
        } else {
          // Find the previous question in the entire survey
          const previousQuestion = allQuestionsInOrder[globalQuestionIndex - 1];
          console.log('Going to previous question:', previousQuestion._id || previousQuestion.id);
          updateCurrentStep({ 
            type: 'question', 
            questionId: previousQuestion._id || previousQuestion.id || '' 
          });
        }
      } else if (currentQuestionIndex > 0) {
        // Go to the previous question in the same section
        const previousQuestion = sectionQuestions[currentQuestionIndex - 1];
        console.log('Going to previous question in section:', previousQuestion._id || previousQuestion.id);
        updateCurrentStep({ 
          type: 'question', 
          questionId: previousQuestion._id || previousQuestion.id || '' 
        });
      }
    } else if (currentStep.type === 'section' && currentStep.sectionId) {
      // If we're on a section screen, go back to the welcome screen
      console.log('On section screen, going to welcome');
      updateCurrentStep({ type: 'welcome' });
    } else if (currentStep.type === 'thank-you') {
      // If we're on thank you screen, go back to the last question
      const allQuestionsInOrder = questions.sort((a, b) => (a.order || 0) - (b.order || 0));
      if (allQuestionsInOrder.length > 0) {
        const lastQuestion = allQuestionsInOrder[allQuestionsInOrder.length - 1];
        console.log('On thank you screen, going to last question:', lastQuestion._id || lastQuestion.id);
        updateCurrentStep({ 
          type: 'question', 
          questionId: lastQuestion._id || lastQuestion.id || '' 
        });
      } else {
        console.log('No questions found, going to welcome');
        updateCurrentStep({ type: 'welcome' });
      }
    }
  };
  
  // Handle continuing from a section to its first question
  const handleSectionContinue = (sectionId: string) => {
    console.log(`Continuing from section ${sectionId} to its first question`);
    
    // Get all questions for this section
    const sectionQuestions = getQuestionsForSection(sectionId);
    
    // If there are questions in this section, navigate to the first one
    if (sectionQuestions.length > 0) {
      const firstQuestion = sectionQuestions[0];
      updateCurrentStep({ 
        type: 'question', 
        questionId: firstQuestion._id || firstQuestion.id || '' 
      });
    } else {
      // If no questions in this section, find the next section
      const currentSectionIndex = sections.findIndex(s => s.id === sectionId);
      if (currentSectionIndex < sections.length - 1) {
        // Go to the next section
        const nextSection = sections[currentSectionIndex + 1];
        updateCurrentStep({ type: 'section', sectionId: nextSection.id });
      } else {
        // If this was the last section and it has no questions, go to thank you screen
        updateCurrentStep({ type: 'thank-you' });
      }
    }
  };
  
  // Handle answering a question and potentially navigating to the next question
  const handleQuestionAnswer = (questionId: string, answer: any, saveOnly: boolean = false) => {
    console.log(`Question ${questionId} answered:`, answer, 'saveOnly:', saveOnly);
    
    // Save the answer
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // If saveOnly is true, don't navigate to the next question
    if (saveOnly) {
      console.log('Save only mode - not navigating to next question');
      return;
    }
    
    // Find the current question
    const currentQuestion = questions.find(q => q._id === questionId || q.id === questionId);
    if (!currentQuestion) return;
    
    // Check if we should use surveyOrder for navigation
    if (survey.surveyOrder && survey.surveyOrder.length > 0) {
      console.log('Using surveyOrder for navigation');
      
      // Find the current item in surveyOrder
      const currentItemIndex = survey.surveyOrder.findIndex(
        item => item.type === 'question' && item.id === (currentQuestion._id || currentQuestion.id)
      );
      
      console.log('Current item index in surveyOrder:', currentItemIndex);
      
      if (currentItemIndex !== -1 && currentItemIndex < survey.surveyOrder.length - 1) {
        // There is a next item in the surveyOrder
        const nextItem = survey.surveyOrder[currentItemIndex + 1];
        console.log('Next item in surveyOrder:', nextItem);
        
        if (nextItem.type === 'section') {
          // Navigate to the next section
          updateCurrentStep({ type: 'section', sectionId: nextItem.id });
        } else if (nextItem.type === 'question') {
          // Navigate to the next question
          updateCurrentStep({ type: 'question', questionId: nextItem.id });
        }
        return;
      } else if (currentItemIndex === survey.surveyOrder.length - 1) {
        // This is the last item in surveyOrder, go to thank you screen
        console.log('Last item in surveyOrder, going to thank you screen');
        updateCurrentStep({ type: 'thank-you' });
        return;
      }
    }
    
    // Fallback to section-based navigation if surveyOrder is not available or item not found
    console.log('Falling back to section-based navigation');
    
    // Get all questions for the current section
    const sectionQuestions = getQuestionsForSection(currentQuestion.sectionId || '');
    
    // Find the current question index
    const currentQuestionIndex = sectionQuestions.findIndex(
      q => q._id === questionId || q.id === questionId
    );
    
    // Check if this is the last question in the section
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    
    // Find the current section index
    const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
    
    // Check if this is the last section
    const isLastSection = currentSectionIndex === sections.length - 1;
    
    // Determine if this is the last question in the survey
    const isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
    
    console.log('Question navigation logic:', {
      questionId,
      currentQuestionIndex,
      totalQuestionsInSection: sectionQuestions.length,
      isLastQuestionInSection,
      currentSectionIndex,
      totalSections: sections.length,
      isLastSection,
      isLastQuestionInSurvey
    });
    
    if (isLastQuestionInSurvey) {
      // If this is the last question in the survey, navigate to the thank you screen
      updateCurrentStep({ type: 'thank-you' });
    } else if (isLastQuestionInSection) {
      // If this is the last question in the section but not the last section,
      // navigate to the next section
      const nextSection = sections[currentSectionIndex + 1];
      updateCurrentStep({ type: 'section', sectionId: nextSection.id });
    } else {
      // Otherwise, navigate to the next question in the current section
      const nextQuestion = sectionQuestions[currentQuestionIndex + 1];
      updateCurrentStep({ 
        type: 'question', 
        questionId: nextQuestion._id || nextQuestion.id || '' 
      });
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called - preparing to submit survey');
    
    // Record the end time for the survey session
    const endTime = new Date();
    const elapsedTime = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000);
    console.log(`Survey completed in ${elapsedTime} seconds (${Math.floor(elapsedTime / 60)} minutes and ${elapsedTime % 60} seconds)`);
    
    // Save the end time to localStorage for the thank you page to access
    try {
      const progressKey = getProgressStorageKey();
      const savedData = localStorage.getItem(progressKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        localStorage.setItem(progressKey, JSON.stringify({
          ...parsedData,
          endTime: endTime
        }));
        console.log('Saved survey end time to localStorage');
      }
    } catch (error) {
      console.error('Error saving end time to localStorage:', error);
    }
    
    // Set the submitted flag early to prevent any new incomplete responses
    // This will prevent any auto-saves from creating new incomplete responses
    setIsSubmitted(true);
    console.log('Setting isSubmitted flag to true to prevent new incomplete responses');
    
    if (isPreviewMode) {
      // In preview mode, just show thank you
      console.log('Preview mode detected - skipping server submission and showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      return;
    }
    
    // IMPORTANT: Save the current question's response before submission
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        const questionId = currentQuestion._id || currentQuestion.id || '';
        if (questionId) {
          // Make sure the response is in the responses state object
          if (responses[questionId] === undefined) {
            // Try to get the response from the DOM if it's not in the state
            const questionType = currentQuestion.type?.toLowerCase() || '';
            let answer: string | undefined;
            
            // Check for Likert/scale questions specifically
            if (questionType.includes('scale') || questionType.includes('likert')) {
              const selectedButton = document.querySelector('.scale-button.selected');
              if (selectedButton) {
                answer = (selectedButton as HTMLElement)?.textContent?.trim();
                console.log('Found Likert/scale answer from selected button:', answer);
                
                // Update responses state with the answer
                if (answer) {
                  setResponses(prev => ({
                    ...prev,
                    [questionId]: answer
                  }));
                  console.log(`Added response for last question ${questionId} before submission:`, answer);
                }
              }
            }
          }
          
          // Now save all progress including the last question
          // We don't need to call saveProgress() here since we've already set isSubmitted to true
          // and saveProgress() will be skipped
          console.log('Skipping final progress save before submission since isSubmitted is true');
          
          // Wait a moment to ensure state updates are processed
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Successfully waited for state updates before submission');
        }
      }
    }
    
    // Prepare the response data according to the SurveyResponseInput interface
    const now = new Date();
    const startTime = sessionStartTime;
    
    // DIRECT APPROACH: Force collection of all responses for all questions in the survey
    console.log('DIRECT APPROACH: Collecting all questions and responses');
    
    // Debug log all questions in the survey
    console.log('All questions in the survey:', questions.map(q => ({
      id: q._id || q.id,
      text: q.text?.substring(0, 30),
      sectionId: q.sectionId
    })));
    
    // Debug log all current responses
    console.log('Current responses state:', responses);
    
    // Get all questions from the survey, including those that might not be in sections
    const allQuestions = [...questions];
    
    // Ensure we have all questions from the survey object directly
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      survey.sectionQuestions.forEach(q => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    // Also check selectedQuestions if available
    if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
      Object.values(survey.selectedQuestions).flat().forEach(q => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    console.log(`Total questions found: ${allQuestions.length}`);
    
    // CRITICAL FIX: Create a complete list of responses for ALL questions in the survey
    // This ensures we don't miss any responses, especially the last question
    interface FormattedResponse {
      questionId: string;
      answer: string | string[] | Record<string, any>;
      sectionId: string;
    }
    
    const formattedResponses: FormattedResponse[] = [];
    
    // Process each question in the survey
    allQuestions.forEach(question => {
      const questionId = (question._id || question.id || '') as string;
      if (!questionId) return; // Skip questions without ID
      
      // Get the answer for this question from our responses state
      let answer = responses[questionId];
      
      // If no answer in state, check localStorage as a backup
      if (answer === undefined) {
        try {
          const savedResponsesStr = localStorage.getItem('survey_progress_' + survey._id);
          if (savedResponsesStr) {
            const savedData = JSON.parse(savedResponsesStr);
            if (savedData && savedData.responses && savedData.responses[questionId]) {
              answer = savedData.responses[questionId];
              console.log(`Found answer in localStorage for question: ${questionId}`);
            }
          }
        } catch (e) {
          console.error('Error checking localStorage for response:', e);
        }
      }
      
      // If we have an answer for this question, add it to our formatted responses
      if (answer !== undefined) {
        formattedResponses.push({
          questionId,
          answer,
          sectionId: question.sectionId || '' // Provide empty string as fallback if sectionId is undefined
        });
        console.log(`Added response for question: ${questionId}, text: ${question.text?.substring(0, 30)}`);
      } else {
        console.log(`No response found for question: ${questionId}, text: ${question.text?.substring(0, 30)}`);
      }
    });
    
    // SPECIAL HANDLING: If we're currently on a question page, make sure that question's response is included
    // This is critical for the last question which might not be in state yet
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        const questionId = currentQuestion._id || currentQuestion.id || '';
        let answer;
        
        // Special handling for different question types
        const questionType = currentQuestion.type?.toLowerCase() || '';
        
        console.log(`Checking DOM for current question answer: ${questionId}, type: ${questionType}`);
        
        // Check for Likert/scale questions specifically
        if (questionType.includes('scale') || questionType.includes('likert')) {
          // For scale questions, look for buttons with 'selected' class
          const selectedButton = document.querySelector('.scale-button.selected');
          if (selectedButton) {
            answer = selectedButton.textContent?.trim();
            console.log('Found Likert/scale answer from selected button:', answer);
          }
          
          // If no selected button found, try to find any button that might have been clicked
          if (!answer) {
            const allButtons = document.querySelectorAll('.scale-button');
            allButtons.forEach((btn: Element) => {
              const btnElement = btn as HTMLElement;
              if (btnElement.style.backgroundColor || btnElement.classList.contains('clicked')) {
                answer = btnElement.textContent?.trim();
                console.log('Found Likert/scale answer from button with style/class:', answer);
              }
            });
          }
        } else {
          // For other question types
          const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`) as HTMLInputElement;
          const regularInput = document.querySelector(`input[name="${questionId}"]`) as HTMLInputElement;
          const textArea = document.querySelector(`textarea[name="${questionId}"]`) as HTMLTextAreaElement;
          const optionButton = document.querySelector(`.option-button.selected`);
          
          // Try to find any option button that might have been clicked
          let selectedOptionButton: HTMLElement | null = null;
          if (!optionButton) {
            const allOptionButtons = document.querySelectorAll('.option-button');
            allOptionButtons.forEach((btn: Element) => {
              const btnElement = btn as HTMLElement;
              if (btnElement.style.backgroundColor || btnElement.classList.contains('clicked')) {
                selectedOptionButton = btnElement;
              }
            });
          }
          
          answer = checkedInput?.value || 
                  regularInput?.value || 
                  textArea?.value ||
                  (optionButton as HTMLElement)?.textContent?.trim() ||
                  selectedOptionButton?.textContent?.trim();
        }
        
        // If we found an answer in the DOM but it's not in our responses state
        if (answer && !formattedResponses.some(r => r.questionId === questionId)) {
          console.log('CRITICAL: Found answer in DOM for current question that was not in state:', {
            questionId,
            answer,
            questionType,
            questionText: currentQuestion.text?.substring(0, 30)
          });
          
          formattedResponses.push({
            questionId,
            answer: answer || '',
            sectionId: currentQuestion.sectionId || ''
          });
        }
      }
    }
    
    // ADDITIONAL CHECK: Make sure we have responses for all questions that have been answered
    // This is especially important for the last question
    allQuestions.forEach((question: any) => {
      const questionId = question._id || question.id || '';
      if (!questionId) return;
      
      // Skip if we already have a response for this question
      if (formattedResponses.some((r: {questionId: string}) => r.questionId === questionId)) {
        return;
      }
      
      // Try to find any answer in the DOM for this question
      const questionType = question.type?.toLowerCase() || '';
      let answer;
      
      // Check for different input types based on question type
      const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`) as HTMLInputElement;
      const regularInput = document.querySelector(`input[name="${questionId}"]`) as HTMLInputElement;
      const textArea = document.querySelector(`textarea[name="${questionId}"]`) as HTMLTextAreaElement;
      
      if (checkedInput || regularInput || textArea) {
        answer = checkedInput?.value || regularInput?.value || textArea?.value;
        console.log(`Found answer in DOM for question ${questionId}:`, answer);
        
        formattedResponses.push({
          questionId,
          answer: answer || '',
          sectionId: question.sectionId || ''
        });
      }
    });
    
    // FINAL CHECK: Make sure we have all 4 questions
    // This is a direct fix for the specific issue where only 3 out of 4 questions are being saved
    if (allQuestions.length === 4 && formattedResponses.length < 4) {
      console.log('CRITICAL: Only found ' + formattedResponses.length + ' responses for 4 questions!');
      
      // Find the missing question
      const savedQuestionIds = formattedResponses.map(r => r.questionId);
      const missingQuestions = allQuestions.filter(q => {
        const qId = q._id || q.id || '';
        return qId && !savedQuestionIds.includes(qId);
      });
      
      console.log('Missing questions:', missingQuestions.map(q => ({
        id: q._id || q.id,
        text: q.text?.substring(0, 30),
        type: q.type
      })));
      
      // Try to find any response for the missing question in localStorage
      missingQuestions.forEach(q => {
        const questionId = q._id || q.id || '';
        if (!questionId) return;
        
        // Check localStorage for any saved response
        try {
          const savedResponsesStr = localStorage.getItem('survey_progress_' + survey._id);
          if (savedResponsesStr) {
            const savedData = JSON.parse(savedResponsesStr);
            if (savedData && savedData.responses && savedData.responses[questionId]) {
              console.log('Found missing response in localStorage:', {
                questionId,
                answer: savedData.responses[questionId]
              });
              
              formattedResponses.push({
                questionId,
                answer: savedData.responses[questionId],
                sectionId: q.sectionId || ''
              });
            }
          }
        } catch (e) {
          console.error('Error checking localStorage for missing response:', e);
        }
      });
    }
    
    // Log the final count of responses being submitted
    console.log(`FINAL: Submitting ${formattedResponses.length} responses out of ${allQuestions.length} total questions`);
    
    // Log all responses being submitted for debugging
    console.log('Final responses being submitted:', formattedResponses.map(r => ({
      questionId: r.questionId,
      answer: typeof r.answer === 'object' ? '[Object]' : r.answer
    })));
    
    // Clear any stored last question ID
    window.localStorage.removeItem('lastAnsweredQuestionId');
    
    // First, find the incomplete survey response ID from localStorage
    const progressKey = getProgressStorageKey();
    let incompleteResponseId: string | null = null;
    
    try {
      // Get the stored survey progress data
      const savedData = localStorage.getItem(progressKey);
      
      if (savedData) {
        // Parse the saved data to extract the response ID
        const parsedData = JSON.parse(savedData);
        
        if (parsedData.responseId) {
          incompleteResponseId = parsedData.responseId;
        } else {
          console.warn('No responseId found in saved progress data');
        }
      } else {
        console.warn('No saved progress data found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving incomplete response ID:', error);
    }
    
    // CRITICAL FIX: Capture the current question's answer if we're on a question page
    // This is especially important for the last question
    if (currentStep.type === 'question') {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        const questionId = currentQuestion._id || currentQuestion.id || '';
        
        // Check if this question's answer is already in our formatted responses
        const hasResponse = formattedResponses.some(r => r.questionId === questionId);
        
        if (!hasResponse && questionId) {
          // Try to get the answer from the DOM
          const answer = getCurrentQuestionAnswer();
          
          if (answer) {
            console.log(`CRITICAL: Adding last-minute answer for current question ${questionId}:`, answer);
            formattedResponses.push({
              questionId,
              answer,
              sectionId: currentQuestion.sectionId || ''
            });
          }
        }
      }
    }
    
    // Create a record of all answers for the last question in case we need it on the server
    const lastQuestionAnswers: Record<string, any> = {};
    
    // Collect all answers from both state and DOM
    allQuestions.forEach((q: any) => {
      const qId = q._id || q.id || '';
      if (!qId) return;
      
      // Check state first
      if (responses[qId] !== undefined) {
        lastQuestionAnswers[qId] = responses[qId];
      } else {
        // Try to find in DOM
        const domAnswer = getAnswerFromDOM(qId, q.type);
        if (domAnswer) {
          lastQuestionAnswers[qId] = domAnswer;
        }
      }
    });
    
    // Helper function to get answer from DOM for a specific question
    function getAnswerFromDOM(questionId: string, questionType?: string): any {
      // Check for different input types based on question type
      const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`) as HTMLInputElement;
      const regularInput = document.querySelector(`input[name="${questionId}"]`) as HTMLInputElement;
      const textArea = document.querySelector(`textarea[name="${questionId}"]`) as HTMLTextAreaElement;
      const selectedButton = document.querySelector(`.scale-button.selected, .option-button.selected`) as HTMLElement;
      
      return checkedInput?.value || regularInput?.value || textArea?.value || selectedButton?.textContent?.trim();
    }
    
    // Helper function to get the current question's answer
    function getCurrentQuestionAnswer(): any {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) return null;
      
      const questionId = currentQuestion._id || currentQuestion.id || '';
      const questionType = currentQuestion.type?.toLowerCase() || '';
      
      // Check for different question types
      if (questionType.includes('scale') || questionType.includes('likert')) {
        const selectedButton = document.querySelector('.scale-button.selected');
        return selectedButton?.textContent?.trim();
      } else if (questionType.includes('option') || questionType.includes('choice')) {
        const selectedButton = document.querySelector('.option-button.selected');
        return selectedButton?.textContent?.trim();
      } else {
        return getAnswerFromDOM(questionId, questionType);
      }
    }
    
    // Log the final responses before submission
    console.log('FINAL SUBMISSION: Responses:', formattedResponses.map(r => ({
      questionId: r.questionId,
      answer: typeof r.answer === 'object' ? '[Object]' : r.answer
    })));
    
    // Prepare submission data
    const submissionData = {
      surveyId: survey._id,
      responses: formattedResponses,
      completed: true,
      startTime: startTime,
      endTime: now,
      progress: 100,
      metadata: {
        userAgent: navigator.userAgent,
        token: token || undefined,
        isPublic: true,
        lastQuestionAnswers // Add the last question answers to metadata for backup
      },
      // Add optional fields that might be required by the server validation
      demographics: {}, // Empty demographics object
      sectionTimes: {} // Empty section times object
    };
    
    // Check if we're in replace mode and have a responseId to use
    const retakeMode = survey.defaultSettings?.retakeMode || 'new';
    
    // Always include the retakeMode in metadata
    (submissionData.metadata as any).retakeMode = retakeMode;
    console.log(`Setting metadata.retakeMode to "${retakeMode}" in submission data`);
    
    if (retakeMode === 'replace' && currentResponseId) {
      // Add the responseId to the submission data for replacement
      (submissionData as any).responseId = currentResponseId;
      console.log(`Using replace mode with existing responseId: ${currentResponseId}`);
    }
    
    // Call the surveyResponses.submit method with the updated data
    Meteor.call('surveyResponses.submit', submissionData, (error: Meteor.Error | null, responseId: string) => {
      if (error) {
        console.error('Error submitting survey:', error);
        setSubmitError(error.message);
      } else {
        // The submitted flag was already set at the beginning of handleSubmit
        console.log('Survey submitted successfully with responseId:', responseId);
        
        // Store the returned responseId for future retakes
        if (responseId) {
          setCurrentResponseId(responseId);
          console.log(`Updated currentResponseId with server-returned value: ${responseId}`);
          
          // Also update the responseId in localStorage
          try {
            const savedData = localStorage.getItem(getProgressStorageKey());
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              parsedData.responseId = responseId;
              localStorage.setItem(getProgressStorageKey(), JSON.stringify(parsedData));
              console.log('Updated responseId in localStorage with server-returned value');
            }
          } catch (e) {
            console.error('Error updating responseId in localStorage:', e);
          }
        }
        
        // First mark the incomplete survey response as completed, then remove it after a delay
        if (!isPreviewMode && token) {
          const surveyId = survey._id;
          const respondentId = token || `anonymous-${new Date().getTime()}`;
          
          console.log(`Handling incomplete response for surveyId: ${surveyId} and respondentId: ${respondentId}`);
          
          // IMPORTANT: Get the CURRENT incomplete response ID from localStorage
          // This ensures we're using the most up-to-date ID
          let responseIdToProcess = null;
          try {
            const savedData = localStorage.getItem(getProgressStorageKey());
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              responseIdToProcess = parsedData.responseId;
              console.log('Found current incomplete response ID in localStorage:', responseIdToProcess);
              
              // Store the response ID for potential replacement on retake
              if (responseIdToProcess) {
                setCurrentResponseId(responseIdToProcess);
                console.log(`Stored response ID for potential replacement on retake: ${responseIdToProcess}`);
              }
            }
          } catch (e) {
            console.error('Error retrieving current response ID:', e);
          }
          
          // FIXED: Only mark incomplete response as completed if it's different from the one we just submitted
          // This prevents duplicate processing of the same response
          if (responseIdToProcess && responseIdToProcess !== responseId) {
            console.log(`First marking as completed: ${responseIdToProcess}`);
            Meteor.call('incompleteSurveyResponses.markAsCompleted', responseIdToProcess, (markError: any, markResult: boolean) => {
              if (markError) {
                console.error('Error marking as completed:', markError);
                // Fall back to removal by surveyId and respondentId
                markByAttributes();
              } else {
                console.log(`Mark as completed result: ${markResult ? 'Success' : 'Failed'} for ID: ${responseIdToProcess}`);
                if (!markResult) {
                  // If marking by ID failed, try by attributes
                  markByAttributes();
                } else {
                  // Schedule deletion after a delay
                  scheduleRemoval(responseIdToProcess);
                }
              }
            });
          } else {
            // No ID available or it's the same as the submitted response ID, just clear localStorage
            console.log('No separate incomplete response ID to process, clearing localStorage only');
            clearLocalStorage();
          }
          
          // Helper function to mark by surveyId and respondentId
          function markByAttributes() {
            console.log(`No direct ID available, will use removal by attributes after delay`);
            // Clear localStorage now since we don't have a specific ID to track
            clearLocalStorage();
            // Schedule removal by attributes
            setTimeout(() => {
              removeByAttributes();
            }, 3000);
          }
          
          // Helper function to schedule removal after delay
          function scheduleRemoval(id: string) {
            console.log(`Scheduling removal of ${id} after delay`);
            // Clear localStorage now that we've marked as completed
            clearLocalStorage();
            // Schedule actual removal
            setTimeout(() => {
              console.log(`Now removing completed response: ${id}`);
              Meteor.call('incompleteSurveyResponses.removeCompleted', id, (removeError: any, removeResult: boolean) => {
                if (removeError) {
                  console.error('Error removing after delay:', removeError);
                } else {
                  console.log(`Delayed removal result: ${removeResult ? 'Success' : 'Failed'}`);
                }
              });
            }, 3000); // 3 seconds delay
          }
          
          // Helper function to remove by surveyId and respondentId
          function removeByAttributes() {
            console.log(`Removing by surveyId: ${surveyId} and respondentId: ${respondentId}`);
            Meteor.call('incompleteSurveyResponses.removeBySurveyAndRespondent', surveyId, respondentId, (attrError: any, attrResult: boolean) => {
              if (attrError) {
                console.error('Error removing by attributes:', attrError);
              } else {
                console.log(`Removal by attributes result: ${attrResult ? 'Success' : 'Failed'}`);
              }
            });
          }
          
          // Helper function to clear localStorage
          function clearLocalStorage() {
            try {
              localStorage.removeItem(`survey_progress_${surveyId}`);
              localStorage.removeItem(`last_answered_question_${surveyId}`);
              localStorage.removeItem(getProgressStorageKey());
              console.log(`Cleared localStorage items for survey: ${surveyId}`);
            } catch (error) {
              console.error('Error clearing localStorage:', error);
            }
          }
        }
        
        // Clear the progress from localStorage
        localStorage.removeItem(progressKey);
      }
      
      // Show thank you screen regardless of submission success/failure
      // This ensures the user doesn't get stuck on the last question
      console.log(error ? 'Showing thank you screen despite submission error' : 'Survey successfully submitted - showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      
      // Clear saved progress since survey is complete
      try {
        localStorage.removeItem(getProgressStorageKey());
        console.log('Cleared saved progress after completion');
      } catch (e) {
        console.error('Error clearing saved progress:', e);
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
  
  // Note: currentSectionIndex and setCurrentSectionIndex are now declared at the component level
  
  // Helper function to group questions by section
  const getQuestionsBySection = (): Record<string, Question[]> => {
    // Defensive check for questions
    if (!questions || !Array.isArray(questions)) return {};
    
    const questionsBySection: Record<string, Question[]> = {};
    
    // Initialize sections
    if (sections && Array.isArray(sections)) {
      sections.forEach(section => {
        if (section && section.id) {
          questionsBySection[section.id] = [];
        }
      });
    }
    
    // Always initialize unsectioned group
    questionsBySection['unsectioned'] = [];
    
    // Group questions by section
    questions.forEach(question => {
      if (!question) return; // Skip null questions
      
      const sectionId = question.sectionId || '';
      if (sectionId && questionsBySection[sectionId]) {
        questionsBySection[sectionId].push(question);
      } else if (sectionId) {
        questionsBySection[sectionId] = [question];
      } else {
        questionsBySection['unsectioned'].push(question);
      }
    });
    

    // Questions are already sorted by surveyOrder in the main processing logic
    // No additional sorting needed here
    

    return questionsBySection;
  };
  
  // Helper function to get filtered section IDs
  const getFilteredSectionIds = (): string[] => {
    const questionsBySection = getQuestionsBySection();
    
    // Sort sections
    const sectionIds = sections && Array.isArray(sections) ? sections.map(s => s?.id || '') : [];
    const sortedSectionIds = Object.keys(questionsBySection).sort((a, b) => {
      if (a === 'unsectioned') return -1;
      if (b === 'unsectioned') return 1;
      return sectionIds.indexOf(a) - sectionIds.indexOf(b);
    });
    
    // Filter out empty sections
    return sortedSectionIds.filter(sectionId => 
      sectionId && questionsBySection[sectionId] && 
      Array.isArray(questionsBySection[sectionId]) && 
      questionsBySection[sectionId].length > 0
    );
  };
  
  // This effect initializes the current section index when needed for all-on-one-page layout
  useEffect(() => {
    // Only run this effect for all-on-one-page layout
    if (survey?.layout !== 'allOnOnePage') return;
    
    const filteredIds = getFilteredSectionIds();
    if (filteredIds && filteredIds.length > 0) {
      // Reset to first section when layout changes or questions/sections change
      setCurrentSectionIndex(0);
    }
  }, [survey?.layout, questions, sections]);
  
  // Render all questions on one page for the allOnOnePage layout, but show only one section at a time
  const renderAllQuestionsOnOnePage = () => {
    console.log('Rendering section-by-section for allOnOnePage layout');
    
    // Group questions by section
    const questionsBySection = getQuestionsBySection();
    
    // Get filtered section IDs (only sections with questions)
    const filteredSectionIds = getFilteredSectionIds();
    
    // Defensive check for questions and sections
    if (!questions || !Array.isArray(questions) || !filteredSectionIds || filteredSectionIds.length === 0) {
      console.log('No questions available or questions is not an array');
      return (
        <div className="all-on-one-page-container">
          <div className="survey-header" style={{ marginBottom: '30px' }}>
            <h1 style={{ color: survey && survey.color ? survey.color : '#552a47', marginBottom: '10px' }}>
              {survey && survey.title ? survey.title : 'Survey'}
            </h1>
            {survey && survey.description && <p>{survey.description}</p>}
          </div>
          <p>No questions available in this survey.</p>
        </div>
      );
    }
    
    // Get the current section ID (with defensive checks)
    const currentSectionIndex_safe = currentSectionIndex >= 0 && currentSectionIndex < filteredSectionIds.length ? currentSectionIndex : 0;
    const currentSectionId = filteredSectionIds[currentSectionIndex_safe];
    // Get section questions with defensive checks
    const sectionQuestions = currentSectionId && questionsBySection[currentSectionId] ? questionsBySection[currentSectionId] : [];
    
    // Find the section object with defensive checks
    const currentSection = sections && Array.isArray(sections) && currentSectionId ? 
      sections.find(s => s && s.id === currentSectionId) : undefined;
    
    // Calculate progress (with defensive checks)
    const sectionProgress = `${(currentSectionIndex_safe + 1)} of ${filteredSectionIds ? filteredSectionIds.length : 1}`;
    const isFirstSection = currentSectionIndex_safe === 0;
    const isLastSection = filteredSectionIds && currentSectionIndex_safe === filteredSectionIds.length - 1;
    
    // Navigation functions (with defensive checks)
    const goToPreviousSection = () => {
      if (currentSectionIndex > 0 && filteredSectionIds && filteredSectionIds.length > 0) {
        setCurrentSectionIndex(currentSectionIndex - 1);
        // Scroll to top of the section
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
          console.error('Error scrolling to top:', error);
        }
      }
    };
    
    const goToNextSection = () => {
      if (filteredSectionIds && currentSectionIndex < filteredSectionIds.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        // Scroll to top of the section
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
          console.error('Error scrolling to top:', error);
        }
      }
    };
    
    // Prepare the content to render based on the current state
    const surveyHeader = (
      <div className="survey-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: survey && survey.color ? survey.color : '#552a47', marginBottom: '10px' }}>
          {survey && survey.title ? survey.title : 'Survey'}
        </h1>
        {survey && survey.description && <p>{survey.description}</p>}
      </div>
    );
    
    // If no questions or sections, return early with just the header
    if (!filteredSectionIds || filteredSectionIds.length === 0) {
      return (
        <div className="all-on-one-page-container">
          {surveyHeader}
          <p>No questions available in this survey.</p>
        </div>
      );
    }
    
    // Variables are already declared above, no need to redeclare them
    
    // Prepare section header based on current section
    let sectionHeader;
    if (currentSection) {
      sectionHeader = (
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ color: survey && survey.color ? survey.color : '#552a47' }}>
            {currentSection.name || 'Section'}
          </h2>
          {currentSection.description && <p>{currentSection.description}</p>}
        </div>
      );
    } else if (currentSectionId === 'unsectioned') {
      sectionHeader = (
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ color: survey && survey.color ? survey.color : '#552a47' }}>General Questions</h2>
          <p>Please answer these general questions.</p>
        </div>
      );
    } else {
      sectionHeader = null;
    }
    
    // Prepare section questions
    const sectionQuestionsContent = Array.isArray(sectionQuestions) ? (
      sectionQuestions.map((question, index) => {
        // Skip null/undefined questions
        if (!question) return null;
        
        try {
          // Map backend question type to frontend display type with defensive checks
          const questionType = question.type || 'text';
          const mappedQuestion = {
            ...question,
            type: mapQuestionType(questionType),
            options: processQuestionOptions(question),
            _forceDropdown: (questionType && typeof questionType === 'string' && 
                          (questionType.toLowerCase() === 'dropdown' || 
                            questionType.toLowerCase() === 'select')) || 
                          ((question as any).responseType && 
                            typeof (question as any).responseType === 'string' && 
                            ((question as any).responseType?.toLowerCase() === 'dropdown' ||
                            (question as any).responseType?.toLowerCase() === 'select'))
          };
          
          const questionId = question._id || question.id || `question_${index}`;
          const sectionName = currentSection ? currentSection.name || 'Section' : 
                            (currentSectionId === 'unsectioned' ? 'General Questions' : 'Survey');
          const sectionDesc = currentSection ? currentSection.description || '' : 
                            (currentSectionId === 'unsectioned' ? 'Please answer these general questions.' : '');
          
          return (
            <div key={questionId} className="question-container" style={{ marginBottom: '10px' }}>
              <ModernSurveyQuestion
                question={mappedQuestion}
                progress="" // No progress indicator in all-on-one-page mode
                onAnswer={(answer, saveOnly = true) => handleQuestionAnswer(questionId, answer, saveOnly)}
                onBack={() => {}} // No back navigation in all-on-one-page mode
                value={responses && responses[questionId] ? responses[questionId] : undefined}
                color={survey && survey.color ? survey.color : '#552a47'}
                isLastQuestion={false} // No questions are "last" in all-on-one-page mode
                onSubmit={() => {}} // Individual questions don't submit in all-on-one-page mode
                backgroundImage={survey && survey.featuredImage ? survey.featuredImage : undefined}
                sectionName={sectionName}
                sectionDescription={sectionDesc}
                hideNavigation={true} // Hide navigation in all questions for all-on-one-page mode
              />
            </div>
          );
        } catch (error) {
          console.error('Error rendering question:', error, question);
          return null; // Skip rendering this question if there's an error
        }
      })
    ) : (
      <p>No questions available in this section.</p>
    );
    
    // Prepare navigation buttons
    const navigationButtons = (
      <div className="section-navigation" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '30px',
        marginBottom: '20px'
      }}>
        {/* Previous Section button (hidden on first section) */}
        <div>
          {!isFirstSection && (
            <button 
              onClick={goToPreviousSection}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333333',
                padding: '10px 20px',
                fontSize: '14px',
                border: '1px solid #dddddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Previous Section
            </button>
          )}
        </div>
        
        {/* Back button - always visible */}
        <div>
          <button 
            onClick={() => updateCurrentStep({ type: 'welcome' })}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333333',
              padding: '10px 20px',
              fontSize: '14px',
              border: '1px solid #dddddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
        
        {/* Next Section or Submit button */}
        <div>
          {isLastSection ? (
            <button 
              onClick={handleAllOnOnePageSubmit}
              style={{
                backgroundColor: survey && survey.color ? survey.color : '#552a47',
                color: '#ffffff',
                padding: '12px 30px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Submit Survey
            </button>
          ) : (
            <button 
              onClick={goToNextSection}
              style={{
                backgroundColor: survey && survey.color ? survey.color : '#552a47',
                color: '#ffffff',
                padding: '10px 20px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Next Section →
            </button>
          )}
        </div>
      </div>
    );
    
    // Return the complete UI
    return (
      <div className="all-on-one-page-container">
        {surveyHeader}
        
        {/* Section progress indicator */}
        <div className="section-progress" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Section {sectionProgress}</span>
        </div>
        
        {/* Current section */}
        <div className="survey-section" style={{ marginBottom: '20px' }}>
          {sectionHeader}
          
          <div className="section-questions">
            {sectionQuestionsContent}
          </div>
        </div>
        
        {navigationButtons}
      </div>
    );
  };
  
  // Handle submission for the all-on-one-page layout
  const handleAllOnOnePageSubmit = async () => {
    console.log('handleAllOnOnePageSubmit called - preparing to submit all-on-one-page survey');
    
    // Record the end time for the survey session
    const endTime = new Date();
    const elapsedTime = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000);
    console.log(`Survey completed in ${elapsedTime} seconds (${Math.floor(elapsedTime / 60)} minutes and ${elapsedTime % 60} seconds)`);
    
    // Save the end time to localStorage for the thank you page to access
    try {
      const progressKey = getProgressStorageKey();
      const savedData = localStorage.getItem(progressKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        localStorage.setItem(progressKey, JSON.stringify({
          ...parsedData,
          endTime: endTime
        }));
        console.log('Saved survey end time to localStorage');
      }
    } catch (error) {
      console.error('Error saving end time to localStorage:', error);
    }
    
    // Set the submitted flag early to prevent any new incomplete responses
    setIsSubmitted(true);
    console.log('Setting isSubmitted flag to true to prevent new incomplete responses');
    
    if (isPreviewMode) {
      // In preview mode, just show thank you
      console.log('Preview mode detected - skipping server submission and showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      return;
    }
    
    // Collect all responses from the form
    // This is different from the step-by-step flow because we need to collect
    // responses from the DOM for all questions at once
    const allQuestions = [...questions];
    
    // Ensure we have all questions from the survey object directly
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      survey.sectionQuestions.forEach(q => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    // Also check selectedQuestions if available
    if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
      Object.values(survey.selectedQuestions).flat().forEach(q => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    console.log(`Total questions found: ${allQuestions.length}`);
    
    // Create a complete list of responses for ALL questions in the survey
    interface FormattedResponse {
      questionId: string;
      answer: string | string[] | Record<string, any>;
      sectionId: string;
    }
    
    const formattedResponses: FormattedResponse[] = [];
    
    // Process each question in the survey
    allQuestions.forEach(question => {
      const questionId = (question._id || question.id || '') as string;
      if (!questionId) return; // Skip questions without ID
      
      // Get the answer for this question from our responses state
      let answer = responses[questionId];
      
      // If no answer in state, check localStorage as a backup
      if (answer === undefined) {
        try {
          const savedResponsesStr = localStorage.getItem('survey_progress_' + survey._id);
          if (savedResponsesStr) {
            const savedData = JSON.parse(savedResponsesStr);
            if (savedData && savedData.responses && savedData.responses[questionId]) {
              answer = savedData.responses[questionId];
              console.log(`Found answer in localStorage for question: ${questionId}`);
            }
          }
        } catch (e) {
          console.error('Error checking localStorage for response:', e);
        }
      }
      
      // For all-on-one-page layout, we need to check the DOM for answers that might not be in state
      if (answer === undefined) {
        // Try to find the answer in the DOM based on question type
        const questionType = question.type?.toLowerCase() || '';
        
        if (questionType.includes('scale') || questionType.includes('likert')) {
          // For scale questions, find the selected button within this question's container
          const questionContainer = document.querySelector(`[data-question-id="${questionId}"]`);
          if (questionContainer) {
            const selectedButton = questionContainer.querySelector('.scale-button.selected');
            if (selectedButton) {
              answer = (selectedButton as HTMLElement)?.textContent?.trim();
              console.log(`Found scale answer in DOM for question ${questionId}:`, answer);
            }
          }
        } else if (questionType.includes('choice') || questionType === 'radio') {
          // For choice questions, find the selected option
          const checkedInput = document.querySelector(`input[name="${questionId}"]:checked`) as HTMLInputElement;
          if (checkedInput) {
            answer = checkedInput.value;
            console.log(`Found choice answer in DOM for question ${questionId}:`, answer);
          } else {
            // Try to find selected option button
            const questionContainer = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionContainer) {
              const selectedOption = questionContainer.querySelector('.option-button.selected');
              if (selectedOption) {
                answer = (selectedOption as HTMLElement)?.textContent?.trim();
                console.log(`Found option button answer in DOM for question ${questionId}:`, answer);
              }
            }
          }
        } else if (questionType.includes('text') || questionType.includes('textarea')) {
          // For text questions, find the input or textarea
          const input = document.querySelector(`input[name="${questionId}"]`) as HTMLInputElement;
          const textarea = document.querySelector(`textarea[name="${questionId}"]`) as HTMLTextAreaElement;
          
          if (input) {
            answer = input.value;
            console.log(`Found text input answer in DOM for question ${questionId}:`, answer);
          } else if (textarea) {
            answer = textarea.value;
            console.log(`Found textarea answer in DOM for question ${questionId}:`, answer);
          }
        } else if (questionType.includes('dropdown') || questionType.includes('select')) {
          // For dropdown questions, find the select element
          const select = document.querySelector(`select[name="${questionId}"]`) as HTMLSelectElement;
          if (select) {
            answer = select.value;
            console.log(`Found dropdown answer in DOM for question ${questionId}:`, answer);
          }
        } else if (questionType.includes('checkbox')) {
          // For checkbox questions, find all checked inputs
          const checkedInputs = document.querySelectorAll(`input[name="${questionId}"]:checked`) as NodeListOf<HTMLInputElement>;
          if (checkedInputs.length > 0) {
            answer = Array.from(checkedInputs).map(input => input.value);
            console.log(`Found checkbox answers in DOM for question ${questionId}:`, answer);
          }
        }
      }
      
      // If we have an answer for this question, add it to our formatted responses
      if (answer !== undefined) {
        formattedResponses.push({
          questionId,
          answer,
          sectionId: question.sectionId || '' // Provide empty string as fallback if sectionId is undefined
        });
        console.log(`Added response for question: ${questionId}, text: ${question.text?.substring(0, 30)}`);
      } else {
        console.log(`No response found for question: ${questionId}, text: ${question.text?.substring(0, 30)}`);
      }
    });
    
    // Prepare the survey response data
    const now = new Date();
    const startTime = sessionStartTime;
    
    const surveyResponse = {
      surveyId: survey._id,
      respondentId: token,
      responses: formattedResponses,
      startTime: startTime,
      endTime: now,
      completionTimeSeconds: Math.round((now.getTime() - startTime.getTime()) / 1000),
      userAgent: navigator.userAgent,
      timestamp: now
    };
    
    console.log('Submitting survey response:', {
      surveyId: survey._id,
      respondentId: token,
      responseCount: formattedResponses.length,
      completionTimeSeconds: surveyResponse.completionTimeSeconds
    });
    
    // Submit the survey response to the server
    Meteor.call('surveyResponses.insert', surveyResponse, (error: any, result: any) => {
      if (error) {
        console.error('Error submitting survey response:', error);
      } else {
        console.log('Survey response submitted successfully:', result);
        
        // Mark any incomplete responses as completed
        const progressKey = getProgressStorageKey();
        const savedData = localStorage.getItem(progressKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            const responseId = parsedData.responseId;
            
            if (responseId) {
              console.log(`Marking incomplete response as completed: ${responseId}`);
              
              // Mark as completed in the database
              Meteor.call('incompleteSurveyResponses.markAsCompleted', responseId, (markError: any, markResult: any) => {
                if (markError) {
                  console.error('Error marking incomplete response as completed:', markError);
                } else {
                  console.log('Incomplete response marked as completed:', markResult);
                  
                  // Schedule removal after a delay
                  scheduleRemoval(responseId);
                }
              });
              
              // Try removal by surveyId and respondentId as a backup
              const surveyId = survey._id;
              const respondentId = token;
              
              // Schedule removal by attributes
              setTimeout(() => {
                removeByAttributes();
              }, 3000);
            }
            
            // Helper function to schedule removal after delay
            function scheduleRemoval(id: string) {
              console.log(`Scheduling removal of ${id} after delay`);
              // Clear localStorage now that we've marked as completed
              clearLocalStorage();
              // Schedule actual removal
              setTimeout(() => {
                console.log(`Now removing completed response: ${id}`);
                Meteor.call('incompleteSurveyResponses.removeCompleted', id, (removeError: any, removeResult: boolean) => {
                  if (removeError) {
                    console.error('Error removing after delay:', removeError);
                  } else {
                    console.log(`Delayed removal result: ${removeResult ? 'Success' : 'Failed'}`);
                  }
                });
              }, 3000); // 3 seconds delay
            }
            
            // Helper function to remove by surveyId and respondentId
            function removeByAttributes() {
              console.log(`Removing by surveyId: ${surveyId} and respondentId: ${respondentId}`);
              Meteor.call('incompleteSurveyResponses.removeBySurveyAndRespondent', surveyId, respondentId, (attrError: any, attrResult: boolean) => {
                if (attrError) {
                  console.error('Error removing by attributes:', attrError);
                } else {
                  console.log(`Removal by attributes result: ${attrResult ? 'Success' : 'Failed'}`);
                }
              });
            }
            
            // Helper function to clear localStorage
            function clearLocalStorage() {
              try {
                localStorage.removeItem(`survey_progress_${surveyId}`);
                localStorage.removeItem(`last_answered_question_${surveyId}`);
                localStorage.removeItem(getProgressStorageKey());
                console.log(`Cleared localStorage items for survey: ${surveyId}`);
              } catch (error) {
                console.error('Error clearing localStorage:', error);
              }
            }
          } catch (error) {
            console.error('Error parsing saved data:', error);
          }
        }
        
        // Clear the progress from localStorage
        localStorage.removeItem(progressKey);
      }
      
      // Show thank you screen regardless of submission success/failure
      console.log(error ? 'Showing thank you screen despite submission error' : 'Survey successfully submitted - showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      
      // Clear saved progress since survey is complete
      try {
        localStorage.removeItem(getProgressStorageKey());
        console.log('Cleared saved progress after completion');
      } catch (e) {
        console.error('Error clearing saved progress:', e);
      }
    });
  };

  // Calculate the estimated time to complete the survey based on total question count
  // If sectionId is provided, calculate time only for that section
  const calculateEstimatedTime = (sectionId?: string): string => {
    // Get the total number of questions for the entire survey
    const totalQuestions = questions.length;
    
    // If sectionId is provided, calculate time proportionally for that section
    if (sectionId) {
      // Get questions for this specific section
      const sectionQuestions = getQuestionsForSection(sectionId);
      const sectionQuestionCount = sectionQuestions.length;
      
      // If no questions in this section, return minimal time
      if (sectionQuestionCount === 0) return "1";
      
      // If all questions are in this section, calculate normally
      if (sectionQuestionCount === totalQuestions) {
        // Use the standard calculation below
      } else {
        // Calculate proportional time based on question count ratio
        // First, get the time range for the entire survey
        const surveyTimeRange = calculateSurveyTimeRange(totalQuestions);
        
        // Extract min and max from the range
        const rangeParts = surveyTimeRange.split('-');
        const minTime = parseInt(rangeParts[0], 10);
        const maxTime = parseInt(rangeParts[1] || rangeParts[0], 10);
        
        // Calculate proportional times based on question ratio
        const ratio = sectionQuestionCount / totalQuestions;
        let sectionMinTime = Math.max(1, Math.round(minTime * ratio));
        let sectionMaxTime = Math.max(sectionMinTime + 1, Math.round(maxTime * ratio));
        
        // Ensure we have at least a 1-minute range for sections with multiple questions
        if (sectionQuestionCount > 1 && sectionMinTime === sectionMaxTime) {
          sectionMaxTime = sectionMinTime + 1;
        }
        
        // For very small sections (1-2 questions), just use "1-2" minutes
        if (sectionQuestionCount <= 2) {
          return "1-2";
        }
        
        // Log the calculation
        console.log(`Section time calculation for ${sectionId}:`, {
          sectionQuestionCount,
          totalQuestions,
          ratio,
          surveyTimeRange,
          sectionTimeRange: `${sectionMinTime}-${sectionMaxTime}`
        });
        
        return `${sectionMinTime}-${sectionMaxTime}`;
      }
    }
    
    // Standard calculation for entire survey
    return calculateSurveyTimeRange(totalQuestions);
  };
  
  // Helper function to calculate time range based on question count
  const calculateSurveyTimeRange = (questionCount: number): string => {
    // Determine estimated time range based on question count
    let timeRange: string;
    
    if (questionCount <= 3) {
      // 1-3 questions: 1-2 minutes
      timeRange = "1-2";
    } else if (questionCount <= 5) {
      // 4-5 questions: 2-3 minutes
      timeRange = "2-3";
    } else if (questionCount <= 9) {
      // 6-9 questions: 3-4 minutes
      timeRange = "3-4";
    } else if (questionCount <= 13) {
      // 10-13 questions: 4-5 minutes
      timeRange = "4-5";
    } else if (questionCount <= 17) {
      // 14-17 questions: 5-6 minutes
      timeRange = "5-6";
    } else if (questionCount <= 22) {
      // 18-22 questions: 6-7 minutes
      timeRange = "6-7";
    } else if (questionCount <= 27) {
      // 23-27 questions: 7-8 minutes
      timeRange = "7-8";
    } else if (questionCount <= 32) {
      // 28-32 questions: 8-9 minutes
      timeRange = "8-9";
    } else if (questionCount <= 37) {
      // 33-37 questions: 9-10 minutes
      timeRange = "9-10";
    } else {
      // 38+ questions: 10+ minutes with a range
      const baseTime = 10 + Math.floor((questionCount - 38) / 5);
      timeRange = `${baseTime}-${baseTime + 2}`;
    }
    
    // Add a small buffer for sections if needed
    if (sections.length > 2) {
      // Only adjust the range for 3+ sections
      // Extract the upper bound of the current range
      const rangeParts = timeRange.split('-');
      const upperBound = parseInt(rangeParts[1] || rangeParts[0], 10);
      
      // Add 1-2 minutes to the upper bound based on section count
      const sectionBuffer = Math.min(2, Math.ceil((sections.length - 2) / 2));
      timeRange = `${rangeParts[0]}-${upperBound + sectionBuffer}`;
    }
    
    // Log the calculation for debugging
    console.log('Survey completion time calculation:', {
      questionCount,
      sectionCount: sections.length,
      timeRange
    });
    
    // Return the time range
    return timeRange;
  };
  
  // Render the appropriate content based on the current step
  const renderContent = () => {
    // Check if we should render all questions on one page
    if (survey.layout === 'allOnOnePage' && currentStep.type === 'welcome') {
      console.log('Rendering all questions on one page layout');
      return renderAllQuestionsOnOnePage();
    }
    
    // Otherwise, proceed with the standard step-by-step flow
    switch (currentStep.type) {
      case 'welcome':
        // Get the total questions and sections count from the survey data
        const totalQuestions = questions.length;
        const totalSections = sections.length;
        
        // Calculate the dynamic estimated time to complete the survey
        // For welcome screen, we want the total survey time
        const dynamicEstimatedTime = calculateEstimatedTime();
        
        // Create a modified survey object with the dynamic estimated time
        // We ensure the estimatedTime property is set to our dynamic calculation
        // This will override any static value that might be in the database
        const surveyWithDynamicTime = {
          ...survey,
          estimatedTime: dynamicEstimatedTime,
          // Also update questionCount to ensure consistency
          questionCount: totalQuestions,
          // And sectionCount for completeness
          sectionCount: totalSections
        };
        
        console.log('Welcome screen data with dynamic time calculation:', {
          totalQuestions,
          totalSections,
          staticEstimatedTime: survey.estimatedTime || 'not set',
          dynamicEstimatedTime,
          surveyId: survey._id
        });
        
        return (
          <ModernSurveyWelcome
            survey={surveyWithDynamicTime}
            onStart={handleStart}
            totalQuestions={totalQuestions}
            totalSections={totalSections}
          />
        );
        
      case 'section':
        const currentSection = getCurrentSection();
        console.log('Section rendering debug:', {
          currentStepType: currentStep.type,
          currentStepSectionId: currentStep.sectionId,
          availableSections: sections.map(s => ({ id: s.id, name: s.name })),
          foundSection: currentSection
        });
        
        if (!currentSection) {
          console.error('Section not found! Available sections:', sections.map(s => ({ id: s.id, name: s.name })));
          console.error('Requested section ID:', currentStep.sectionId);
          
          // Try to find questions for this section ID anyway
          const sectionQuestions = getQuestionsForSection(currentStep.sectionId || '');
          if (sectionQuestions.length > 0) {
            console.log('Found questions for missing section, going to first question');
            const firstQuestion = sectionQuestions[0];
            updateCurrentStep({ type: 'question', questionId: firstQuestion._id || firstQuestion.id || '' });
            return null;
          }
          
          // Fallback: try to go to the first available question
          if (questions.length > 0) {
            console.log('Falling back to first available question');
            const firstQuestion = questions[0];
            updateCurrentStep({ type: 'question', questionId: firstQuestion._id || firstQuestion.id || '' });
            return null;
          } else {
            // No questions available, go back to welcome
            console.log('No questions found, returning to welcome');
            updateCurrentStep({ type: 'welcome' });
            return null;
          }
        }
        
        // Calculate total questions for this section
        const sectionQuestionsCount = getQuestionsCountForSection(currentSection.id);
        
        // Get the current section index (1-based)
        const dynamicSectionIndex = getCurrentSectionIndex(currentSection.id);
        
        // Calculate the section-specific estimated time
        const currentSectionQuestions = questions.filter(q => q.sectionId === currentSection.id);
        const sectionQuestionIds = currentSectionQuestions.map(q => q._id || q.id);
        
        // Default section time while we calculate the actual time
        let dynamicSectionTime = '~2';
        
        // Check if we already have cached section time data that's recent
        let hasCachedData = false;
        try {
          const sectionTimeKey = `section_time_${currentSection.id}`;
          const storedSectionTimeData = localStorage.getItem(sectionTimeKey);
          if (storedSectionTimeData) {
            const sectionTimeData = JSON.parse(storedSectionTimeData);
            // Check if the data is recent (within the last hour)
            const isRecent = (new Date().getTime() - sectionTimeData.timestamp) < 3600000;
            if (isRecent) {
              hasCachedData = true;
              console.log(`Using cached section time data, skipping recalculation`);
            }
          }
        } catch (error) {
          console.error('Error checking cached section time data:', error);
        }
        
        // Only fetch and calculate if we don't have recent cached data
        if (!hasCachedData) {
          console.log('No recent cached data found, calculating section time...');
          // Get question documents for this section only
          Meteor.call('getQuestionDocuments', sectionQuestionIds, (error: any, sectionQuestionDocs: any) => {
            if (error) {
              console.error('Error fetching section question documents:', error);
            } else if (sectionQuestionDocs && sectionQuestionDocs.length > 0) {
              // Calculate total time for this section's questions
              const sectionTotalSeconds = sectionQuestionDocs.reduce((total: number, doc: any) => {
                const seconds = doc.currentVersion?.estimatedTimeSeconds || 30; // Default to 30 seconds
                console.log(`Section question ${doc._id}: ${seconds} seconds`);
                return total + seconds;
              }, 0);
              
              // Add a small buffer (10 seconds) for section overhead
              const sectionTotalWithBuffer = sectionTotalSeconds + 10;
              const sectionMinutes = Math.ceil(sectionTotalWithBuffer / 60);
              
              console.log(`Section ${currentSection.id} time: ${sectionTotalWithBuffer} seconds (${sectionMinutes} minutes)`);
              
              // Store section-specific time data
              try {
                const sectionTimeKey = `section_time_${currentSection.id}`;
                const sectionTimeData = {
                  sectionId: currentSection.id,
                  totalEstimatedSeconds: sectionTotalWithBuffer,
                  minutes: sectionMinutes,
                  questionCount: sectionQuestionDocs.length,
                  timestamp: new Date().getTime()
                };
                localStorage.setItem(sectionTimeKey, JSON.stringify(sectionTimeData));
                console.log(`Stored section time in localStorage with key ${sectionTimeKey}:`, sectionTimeData);
                
                // Update the section object with the calculated time
                const updatedSection = {
                  ...currentSection,
                  estimatedTime: `${sectionMinutes}`,
                  questionCount: sectionQuestionDocs.length,
                  document: currentSection.document,
                  documentName: currentSection.documentName,
                  documentType: currentSection.documentType
                };
                
                // Re-render with updated section data - only once when calculation is complete
                setSections(prevSections => {
                  return prevSections.map(s => 
                    s.id === currentSection.id ? updatedSection : s
                  );
                });
              } catch (storageError) {
                console.error('Error storing section time data:', storageError);
              }
            }
          });
        }
        
        // Try to get cached section time data
        try {
          const sectionTimeKey = `section_time_${currentSection.id}`;
          const storedSectionTimeData = localStorage.getItem(sectionTimeKey);
          if (storedSectionTimeData) {
            const sectionTimeData = JSON.parse(storedSectionTimeData);
            // Check if the data is recent (within the last hour)
            const isRecent = (new Date().getTime() - sectionTimeData.timestamp) < 3600000;
            if (isRecent) {
              dynamicSectionTime = `${sectionTimeData.minutes}`;
              console.log(`Using cached section time: ${dynamicSectionTime} minutes`);
            }
          }
        } catch (error) {
          console.error('Error reading cached section time:', error);
        }
        
        // Create a modified section object with the dynamic estimated time
        const sectionWithDynamicTime = {
          ...currentSection,
          estimatedTime: dynamicSectionTime,
          questionCount: sectionQuestionsCount
        };
        
        console.log('Section screen data with dynamic time:', {
          sectionId: currentSection.id,
          sectionName: currentSection.name,
          sectionIndex: dynamicSectionIndex,
          questionsCount: sectionQuestionsCount,
          dynamicEstimatedTime: dynamicSectionTime
        });
        
        // Get section-specific time data from localStorage if available
        let dynamicTimeData = null;
        
        // Try to get required question count from localStorage first
        const requiredCountKey = `section_required_count_${currentSection.id}`;
        let requiredQuestionCount = 0;
        
        try {
          const storedRequiredCount = localStorage.getItem(requiredCountKey);
          if (storedRequiredCount) {
            requiredQuestionCount = parseInt(storedRequiredCount, 10);
            console.log(`Found stored required count for section ${currentSection.id}:`, requiredQuestionCount);
          }
        } catch (error) {
          console.error('Error reading required count from localStorage:', error);
        }
        
        // If we have section question IDs, calculate the required count
        if (sectionQuestionIds.length > 0) {
          // We'll use this function to update the required count without causing re-renders
          const updateRequiredCount = (count: number) => {
            requiredQuestionCount = count;
            console.log('Updated required count:', requiredQuestionCount);
            
            // Store in localStorage for future use
            try {
              localStorage.setItem(requiredCountKey, count.toString());
              
              // Update the section object directly
              if (sectionWithDynamicTime) {
                sectionWithDynamicTime.requiredQuestionCount = count;
              }
            } catch (error) {
              console.error('Error storing required count in localStorage:', error);
            }
          };
          
          // Make the Meteor call to get question documents
          Meteor.call('getQuestionDocuments', sectionQuestionIds, (error: any, result: any) => {
            if (error) {
              console.error('Error fetching question documents:', error);
            } else if (result && result.length > 0) {
              let count = 0;
              
              // Count required questions
              result.forEach((doc: any, index: number) => {
                const required = doc.currentVersion?.required || false;
                // Only log the required ones to reduce console spam
                if (required === true) {
                  count++;
                }
              });
              
              console.log('Final required count:', count);
              updateRequiredCount(count);
            } else {
              console.warn('No question documents returned from database');
            }
          });
        }
        
        console.log('Current required count (may be from cache):', requiredQuestionCount);
        try {
          // First try to get section-specific time data
          const sectionTimeKey = `section_time_${currentSection.id}`;
          const storedSectionTimeData = localStorage.getItem(sectionTimeKey);
          
          if (storedSectionTimeData) {
            dynamicTimeData = JSON.parse(storedSectionTimeData);
            console.log(`Found stored section-specific time data:`, dynamicTimeData);
          } else {
            // Fallback to survey-level time data
            const surveyTimeKey = `survey_time_${survey._id}`;
            const storedSurveyTimeData = localStorage.getItem(surveyTimeKey);
            if (storedSurveyTimeData) {
              // Get the survey-level data
              const surveyTimeData = JSON.parse(storedSurveyTimeData);
              console.log(`No section-specific time data found, using survey data:`, surveyTimeData);
              
              // Calculate an approximate section time based on question count proportion
              const sectionQuestionsCount = getQuestionsCountForSection(currentSection.id);
              const totalQuestionsCount = surveyTimeData.questionCount;
              const sectionProportion = sectionQuestionsCount / totalQuestionsCount;
              
              // Calculate section time based on proportion of questions
              const sectionSeconds = Math.round(surveyTimeData.totalEstimatedSeconds * sectionProportion);
              const sectionMinutes = Math.ceil(sectionSeconds / 60);
              
              // Create section-specific time data
              dynamicTimeData = {
                sectionId: currentSection.id,
                totalEstimatedSeconds: sectionSeconds,
                minutes: sectionMinutes,
                questionCount: sectionQuestionsCount,
                timestamp: new Date().getTime()
              };
              
              console.log(`Calculated proportional section time: ${sectionSeconds} seconds (${sectionMinutes} minutes)`);
              
              // Store this for future use
              localStorage.setItem(sectionTimeKey, JSON.stringify(dynamicTimeData));
            }
          }
        } catch (error) {
          console.error('Error reading time data from localStorage:', error);
        }
        
        // Log all props being passed to ModernSurveySection for debugging
        console.log('Rendering ModernSurveySection with props:', {
          sectionId: currentSection.id,
          sectionName: currentSection.name,
          totalQuestions: sectionQuestionsCount,
          requiredQuestionCount: requiredQuestionCount,
          dynamicTimeData: dynamicTimeData ? {
            minutes: dynamicTimeData.minutes,
            questionCount: dynamicTimeData.questionCount,
            timestamp: new Date(dynamicTimeData.timestamp).toLocaleTimeString()
          } : null
        });
        
        return (
          <ModernSurveySection
            section={sectionWithDynamicTime}
            onContinue={() => handleSectionContinue(currentSection.id)}
            onBack={handleBack}
            color={survey.color}
            surveyTitle={survey.title}
            surveyDescription={survey.description}
            image={currentSection.image || survey.image}
            totalQuestions={sectionQuestionsCount}
            sectionIndex={dynamicSectionIndex}
            requiredQuestionCount={requiredQuestionCount}
            dynamicTimeData={dynamicTimeData}
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
        
        // Calculate question progress - show overall survey progress, not section-specific
        const totalSurveyQuestions = questions.length;
        const currentQuestionNumber = calculateProgressInfo().currentStepNumber - 1; // -1 to exclude welcome screen
        const questionProgress = `Question ${currentQuestionNumber} of ${totalSurveyQuestions}`;
        
        // Check if this question has a versions array with dropdown type
        let questionType = currentQuestion.type;
        
        // Check for dropdown type in versions array
        if (Array.isArray((currentQuestion as any).versions) && (currentQuestion as any).versions.length > 0) {
          const versionIndex = (currentQuestion as any).currentVersion !== undefined ? 
            Math.min((currentQuestion as any).currentVersion, (currentQuestion as any).versions.length - 1) : 0;
          const versionData = (currentQuestion as any).versions[versionIndex];
          
          console.log('Checking versions array for dropdown type:', versionData);
          
          if (versionData && versionData.responseType) {
            if (versionData.responseType.toLowerCase() === 'dropdown' || 
                versionData.responseType.toLowerCase() === 'select') {
              console.log('Found dropdown type in versions array!');
              questionType = 'dropdown';
            }
          }
        }
        
        // Map backend question type to frontend display type and ensure options are properly formatted
        const mappedQuestion = {
          ...currentQuestion,
          type: mapQuestionType(questionType),
          options: processQuestionOptions(currentQuestion),
          // Add a special flag to force dropdown rendering in ModernSurveyQuestion
          _forceDropdown: questionType.toLowerCase() === 'dropdown' || 
                         questionType.toLowerCase() === 'select' ||
                         (currentQuestion as any).responseType?.toLowerCase() === 'dropdown' ||
                         (currentQuestion as any).responseType?.toLowerCase() === 'select'
        };
        
        console.log('Mapped question for rendering:', {
          originalType: currentQuestion.type,
          mappedType: mappedQuestion.type,
          forceDropdown: mappedQuestion._forceDropdown,
          options: mappedQuestion.options?.length || 0
        });
        
        // Determine if this is the last question in its section
        const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
        
        // Determine if this is the last section in the survey
        const currentSectionIndex = sections.findIndex(s => s.id === currentQuestion.sectionId);
        const isLastSection = currentSectionIndex === sections.length - 1;
        
        // Determine if this is the last question in the entire survey
        // This is critical for showing the Submit button
        let isLastQuestionInSurvey = false;
        
        // First check if we should use surveyOrder to determine if this is the last question
        if (survey.surveyOrder && survey.surveyOrder.length > 0) {
          // Find the current item in surveyOrder
          const currentItemIndex = survey.surveyOrder.findIndex(
            item => item.type === 'question' && item.id === (currentQuestion._id || currentQuestion.id)
          );
          
          // Check if this is the last item in surveyOrder or if the next items are only sections
          // (which would make this the last question)
          if (currentItemIndex !== -1) {
            // Check if this is the last item
            if (currentItemIndex === survey.surveyOrder.length - 1) {
              isLastQuestionInSurvey = true;
            } else {
              // Check if there are any more questions after this one
              const hasMoreQuestions = survey.surveyOrder.slice(currentItemIndex + 1).some(item => item.type === 'question');
              isLastQuestionInSurvey = !hasMoreQuestions;
            }
          }
          
          console.log('Last question determination using surveyOrder:', {
            currentItemIndex,
            isLastQuestionInSurvey,
            surveyOrderLength: survey.surveyOrder.length
          });
        } else {
          // Fallback to section-based logic if surveyOrder is not available
          isLastQuestionInSurvey = isLastQuestionInSection && isLastSection;
        }
        
        // Log detailed information about the last question detection
        console.log('Last question detection in renderContent:', {
          questionId: currentQuestion._id || currentQuestion.id,
          currentQuestionIndex,
          totalQuestionsInSection: sectionQuestions.length,
          isLastQuestionInSection,
          currentSectionIndex,
          totalSections: sections.length,
          isLastSection,
          isLastQuestionInSurvey
        });
        
        // Force the isLastQuestionInSurvey flag to true for the last question in the last section
        // This ensures the Submit button is displayed
        console.log('IMPORTANT - Last question detection:', {
          questionId: currentQuestion._id || currentQuestion.id,
          questionText: currentQuestion.text?.substring(0, 30),
          currentQuestionIndex,
          totalQuestionsInSection: sectionQuestions.length,
          isLastQuestionInSection,
          currentSectionIndex,
          totalSections: sections.length,
          isLastSection,
          isLastQuestionInSurvey
        });
        
        // Log detailed information about section and question detection
        console.log('Last question detection details:', {
          currentQuestionIndex,
          sectionQuestionsLength: sectionQuestions.length,
          isLastQuestionInSection,
          currentSectionIndex,
          totalSections: sections.length,
          isLastSection,
          isLastQuestionInSurvey
        });
        
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
        
        // Debug document props
        console.log('Question Section:', questionSection);
        console.log('Document Props:', {
          sectionDocument: questionSection?.document,
          documentName: questionSection?.documentName,
          documentType: questionSection?.documentType
        });
        
        return (
          <ModernSurveyQuestion
            question={mappedQuestion}
            progress={questionProgress}
            onAnswer={(answer, saveOnly) => handleQuestionAnswer(currentQuestion._id || currentQuestion.id || '', answer, saveOnly)}
            onBack={handleBack}
            onNext={handleNextQuestion}
            value={responses[currentQuestion._id || currentQuestion.id || '']}
            color={survey.color}
            isLastQuestion={isLastQuestionInSurvey}
            onSubmit={handleSubmit}
            backgroundImage={survey.featuredImage}
            sectionName={questionSection?.name || 'Survey'}
            sectionDescription={questionSection?.description || 'Please provide your feedback'}
            sectionDocument={questionSection?.document}
            documentName={questionSection?.documentName}
            documentType={questionSection?.documentType}
            hideNavigation={false}
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
      {/* Progress indicator hidden as requested */}
      {renderContent()}
      
      {/* Silent device tracking component */}
      {!isPreviewMode && survey._id && token && (
        <DeviceTracker 
          surveyId={survey._id} 
          respondentId={token} 
        />
      )}
    </ContentContainer>
  );
};

export default ModernSurveyContent;
