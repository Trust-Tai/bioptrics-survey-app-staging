import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import ModernSurveyQuestion from './ModernSurveyQuestion';

// Define types for Question, Section, and Survey
interface Question {
  _id: string;
  id?: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  sectionId?: string;
  position?: number;
  subtext?: string;
}

interface Section {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  description?: string;
  position: number;
  document?: string;
  documentName?: string;
  documentType?: string;
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  sectionQuestions?: Question[];
  selectedQuestions?: Record<string, Question[]> | string[];
  surveyOrder?: Array<{type: string, id: string}>;
  color?: string;
  featuredImage?: string;
}

// Define props interface for the component
interface ModernSurveyLayoutAllProps {
  sections: Section[];
  questions: Question[];
  allQuestions: Question[];
  survey: Survey;
  token: string;
  responses: Record<string, any>;
  sessionStartTime: Date | number;
  isPreviewMode?: boolean;
  currentStep: {
    type: string;
    sectionId?: string;
    questionId?: string;
  };
  updateCurrentStep: (newStep: {
    type: 'welcome' | 'section' | 'question' | 'thank-you';
    sectionId?: string;
    questionId?: string;
  }) => void;
  handleQuestionAnswer: (questionId: string, answer: any, saveOnly?: boolean) => void;
  getProgressStorageKey: () => string;
  mapQuestionType: (type: string) => string;
  processQuestionOptions: (question: Question) => any[];
  calculateEstimatedTime: (sectionId?: string) => string;
  getQuestionsBySection: () => Record<string, Question[]>;
  getFilteredSectionIds: () => string[];
  getQuestionsForSection: (sectionId: string) => Question[];
}

const ModernSurveyLayoutAll: React.FC<ModernSurveyLayoutAllProps> = ({
  survey,
  token,
  questions,
  sections,
  allQuestions,
  responses,
  sessionStartTime,
  isPreviewMode,
  currentStep,
  updateCurrentStep,
  handleQuestionAnswer,
  getProgressStorageKey,
  mapQuestionType,
  processQuestionOptions,
  calculateEstimatedTime,
  getQuestionsBySection,
  getFilteredSectionIds,
  getQuestionsForSection
}) => {
  // Add state for section index, submission status, visible sections, and scroll progress
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [visibleSections, setVisibleSections] = React.useState<number[]>([0]); // Initially only first section is visible
  const [scrollProgress, setScrollProgress] = React.useState(0); // 0-100 for progress indicator
  
  // Group questions by section
  const questionsBySection = getQuestionsBySection();
  
  // Get filtered section IDs (only sections with questions)
  const filteredSectionIds = getFilteredSectionIds();
  
  // Create refs for each section
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize sectionRefs array when filteredSectionIds changes
  React.useEffect(() => {
    // Reset the refs array with the correct length
    sectionRefs.current = Array(filteredSectionIds.length).fill(null);
  }, [filteredSectionIds.length]);
  
  // Set up scroll detection with debouncing
  React.useEffect(() => {
    // Debounce function to limit how often the scroll handler runs
    const debounce = (func: Function, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
    
    // Update progress bar immediately without debounce for smooth UI
    const updateProgressBar = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPercentage = Math.min(
        100,
        Math.round((window.scrollY / (documentHeight - windowHeight)) * 100) || 0
      );
      setScrollProgress(scrollPercentage);
    };
    
    // Function to determine which section is most visible in the viewport
    const determineActiveSection = () => {
      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;
      const viewportCenter = viewportTop + (window.innerHeight / 2);
      
      let maxVisibleSection = 0;
      let maxVisibility = 0;
      
      // Check each section's visibility
      filteredSectionIds.forEach((_, index) => {
        const sectionElement = sectionRefs.current[index];
        if (!sectionElement) return;
        
        const rect = sectionElement.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = rect.bottom + window.scrollY;
        
        // Calculate how much of the section is visible in the viewport
        const visibleTop = Math.max(sectionTop, viewportTop);
        const visibleBottom = Math.min(sectionBottom, viewportBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        
        // If this section contains the center of the viewport, prioritize it
        if (sectionTop <= viewportCenter && sectionBottom >= viewportCenter) {
          if (visibleHeight > maxVisibility) {
            maxVisibility = visibleHeight;
            maxVisibleSection = index;
          }
        } 
        // Otherwise use the section with the most visible area
        else if (visibleHeight > maxVisibility) {
          maxVisibility = visibleHeight;
          maxVisibleSection = index;
        }
      });
      
      // Update the current section index if it's different
      if (maxVisibleSection !== currentSectionIndex) {
        setCurrentSectionIndex(maxVisibleSection);
      }
    };
    
    // Debounced function for section visibility checks (more expensive operation)
    const checkSectionVisibility = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      // Check each section's position
      filteredSectionIds.forEach((_, index) => {
        if (index === 0) return; // Skip first section as it's always visible
        
        const sectionElement = sectionRefs.current[index];
        if (!sectionElement) return;
        
        const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
        
        // If we've scrolled past the trigger point for this section
        if (scrollPosition > sectionTop - 500) { // 500px before the section - show earlier
          setVisibleSections(prev => {
            if (!prev.includes(index)) {
              return [...prev, index];
            }
            return prev;
          });
        }
      });
      
      // Determine which section is most visible
      determineActiveSection();
    };
    
    // Combined scroll handler
    const handleScroll = () => {
      // Update progress immediately for smooth UI
      updateProgressBar();
      // Use debounced function for expensive operations
      debouncedCheckVisibility();
    };
    
    // Create debounced version of section visibility check (runs at most every 100ms)
    const debouncedCheckVisibility = debounce(checkSectionVisibility, 100);
    
    // Call once on mount to initialize
    updateProgressBar();
    checkSectionVisibility();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredSectionIds, currentSectionIndex]);
  
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

  // Function to handle section tab click
  const handleSectionTabClick = (sectionId: string, index: number) => {
    setCurrentSectionIndex(index);
    
    // Make sure the section is visible
    setVisibleSections(prev => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
    
    // IMPORTANT: Don't call updateCurrentStep with type:'section' as it triggers multi-step layout
    // Instead, just scroll to the section within the all-on-one-page layout
    
    // Try to scroll to the section
    try {
      // Get the section element
      const sectionElement = sectionRefs.current[index];
      if (sectionElement) {
        // Get the section's position
        const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
        // Scroll to the section with offset for header
        window.scrollTo({ 
          top: sectionTop - 100, // Offset to account for header
          behavior: 'smooth' 
        });
      } else {
        console.error('Section element not found');
      }
    } catch (error) {
      console.error('Error scrolling to section:', error);
    }
  };

  // Prepare the content to render based on the current state
  const surveyHeader = (
    <div className="survey-header" style={{ 
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'white',
      width: '100%',
      borderBottom: '1px solid #eaeaea',
      padding: '20px 0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: `${scrollProgress}%`,
        backgroundColor: survey?.color || '#552a47',
        transition: 'width 0.3s ease-out'
      }} />  
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <h1 style={{ 
          color: survey && survey.color ? survey.color : '#333', 
          marginBottom: '8px',
          fontSize: '1.8rem',
          fontWeight: '700'
        }}>
          {survey && survey.title ? survey.title : 'Survey'}
        </h1>
        {survey && survey.description && <div style={{
          color: '#555',
          lineHeight: '1.5',
          fontSize: '1rem',
          margin: '0',
          paddingBottom: '0'
        }} dangerouslySetInnerHTML={{ __html: survey.description }} />}
      </div>
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
  
  // Prepare section header based on current section
  let sectionHeader;
  if (currentSection) {
    sectionHeader = (
      <div className="section-header" style={{ 
        marginBottom: '28px',
        borderBottom: '1px solid #eee',
        paddingBottom: '16px'
      }}>
        <h2 style={{ 
          color: survey && survey.color ? survey.color : '#552a47',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          {currentSection.name || 'Section'}
        </h2>
        {currentSection.description && <p style={{
          color: '#555',
          lineHeight: '1.5',
          fontSize: '1rem'
        }}>{currentSection.description}</p>}
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
          <div key={questionId} className="question-container" style={{ 
            margin: '0px 0px 20px 0px',
            padding: '0px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #eee'
          }}>
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
  
  // Define FormattedResponse interface for type safety
  interface FormattedResponse {
    questionId: string;
    answer: string | string[] | Record<string, any>;
    sectionId: string;
  }

  // Handle submission for the all-on-one-page layout
  const handleAllOnOnePageSubmit = async () => {
    console.log('handleAllOnOnePageSubmit called - preparing to submit all-on-one-page survey');
    
    // Record the end time for the survey session
    const endTime = new Date();
    // Handle both Date and number types for sessionStartTime
    const startTimeValue = typeof sessionStartTime === 'number' ? sessionStartTime : sessionStartTime.getTime();
    const elapsedTime = Math.round((endTime.getTime() - startTimeValue) / 1000);
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
    
    // Process each question in the survey
    const allQuestions: Question[] = [];
    const formattedResponses: FormattedResponse[] = [];
    
    // Ensure we have all questions from the survey object directly
    if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
      survey.sectionQuestions.forEach((q: Question) => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    // Also check selectedQuestions if available
    if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
      Object.values(survey.selectedQuestions as Record<string, Question[]>).flat().forEach((q: Question) => {
        const questionId = q._id || q.id;
        if (!allQuestions.some(existingQ => (existingQ._id === questionId || existingQ.id === questionId))) {
          allQuestions.push(q);
        }
      });
    }
    
    console.log(`Total questions found: ${allQuestions.length}`);
    
    // Process each question to collect responses
    allQuestions.forEach(question => {
      const questionId = (question._id || question.id || '') as string;
      if (!questionId) return; // Skip questions without ID
      
      // Get the answer for this question from our responses state
      let answer = responses[questionId];
      
      // If no answer in state, check localStorage as a backup
      if (answer === undefined) {
        try {
          const progressKey = getProgressStorageKey();
          const savedData = localStorage.getItem(progressKey);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.responses && parsedData.responses[questionId]) {
              answer = parsedData.responses[questionId];
              console.log(`Found answer for ${questionId} in localStorage:`, answer);
            }
          }
        } catch (error) {
          console.error(`Error retrieving answer for ${questionId} from localStorage:`, error);
        }
      }
      
      // Get section ID for this question
      const sectionId = question.sectionId || '';
      
      // Add to formatted responses if we have an answer
      if (answer !== undefined && answer !== null) {
        formattedResponses.push({
          questionId,
          answer,
          sectionId
        });
      } else {
        console.log(`No answer found for question ${questionId}`);
      }
    });
    
    console.log(`Total responses collected: ${formattedResponses.length} out of ${allQuestions.length} questions`);
    
    // Submit the survey responses to the server
    try {
      console.log('Submitting survey responses to server...');
      const surveyId = survey._id;
      const responseId = token;
      
      // Call the Meteor method to submit the survey
      await new Promise<void>((resolve, reject) => {
        Meteor.call('submitSurveyResponses', {
          surveyId,
          responseId,
          responses: formattedResponses,
          completedAt: new Date()
        }, (error: Error | null, result: any) => {
          if (error) {
            console.error('Error submitting survey responses:', error);
            reject(error);
          } else {
            console.log('Survey responses submitted successfully:', result);
            resolve();
          }
        });
      });
      
      // Mark any incomplete responses as completed
      await new Promise<void>((resolve, reject) => {
        Meteor.call('markIncompleteResponseAsCompleted', {
          surveyId,
          responseId
        }, (error: Error | null) => {
          if (error) {
            console.error('Error marking incomplete response as completed:', error);
            reject(error);
          } else {
            console.log('Incomplete response marked as completed successfully');
            resolve();
          }
        });
      });
      
      // Clean up localStorage
      try {
        localStorage.removeItem(getProgressStorageKey());
        console.log('Cleared survey progress from localStorage');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Show the thank you page
      console.log('Survey submission complete, showing thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      
    } catch (error) {
      console.error('Error in survey submission process:', error);
      
      // Log detailed error information for debugging
      console.log('Survey submission error details:', {
        surveyId: survey._id,
        responseId: token,
        responseCount: formattedResponses.length,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      
      // Even if there's a server error, we should still show the thank you screen
      // This ensures a better user experience rather than getting stuck
      console.log('Showing thank you screen despite submission error');
      
      // Clean up localStorage even if there was an error
      try {
        localStorage.removeItem(getProgressStorageKey());
        console.log('Cleared survey progress from localStorage after error');
      } catch (storageError) {
        console.error('Error clearing localStorage after submission error:', storageError);
      }
      
      // Show the thank you page despite the error
      updateCurrentStep({ type: 'thank-you' });
    }
  };
    
  // Prepare submit button for the last section only
  const submitButton = isLastSection ? (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      marginTop: '40px',
      marginBottom: '20px'
    }}>
      <button 
        onClick={handleAllOnOnePageSubmit}
        style={{
          backgroundColor: survey && survey.color ? survey.color : '#552a47',
          color: '#ffffff',
          padding: '14px 36px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Submit Survey
      </button>
    </div>
  ) : null;
  
  // Prepare sidebar tabs for each section
  const sidebarTabs = filteredSectionIds.map((sectionId, index) => {
    // Find the section object
    const section = sections.find(s => s.id === sectionId);
    const sectionName = section ? section.name || `Section ${index + 1}` : 
                      (sectionId === 'unsectioned' ? 'General Questions' : `Section ${index + 1}`);
    
    // Calculate estimated time for this section
    const estimatedTime = calculateEstimatedTime(sectionId);
    
    // Check if this section is visible
    const isVisible = visibleSections.includes(index);
    // Check if this is the current active section
    const isActive = currentSectionIndex === index;
    
    return (
      <div 
        key={`tab-${sectionId}`}
        onClick={() => handleSectionTabClick(sectionId, index)}
        style={{
          padding: '12px 16px',
          marginBottom: '8px',
          borderRadius: '6px',
          cursor: 'pointer',
          backgroundColor: isActive ? '#f5f5f5' : 'transparent',
          borderLeft: isActive ? `4px solid ${survey?.color || '#552a47'}` : '4px solid transparent',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: isVisible ? 1 : 0.7
        }}
      >
        <span style={{
          fontWeight: isActive ? '600' : '400',
          color: isActive ? (survey?.color || '#552a47') : '#333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '180px'
        }}>{sectionName}</span>
        {estimatedTime && <small style={{ 
          color: '#777', 
          fontSize: '0.8rem',
          backgroundColor: '#f8f8f8',
          padding: '2px 6px',
          borderRadius: '12px',
          marginLeft: '8px'
        }}>{estimatedTime} min</small>}
      </div>
    );
  });
  
  // No need to redefine updateCurrentStep as it's already available as a prop

  // Return the complete UI with header at top followed by content columns
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Survey Header at the absolute top */}
      {surveyHeader}
      
      <div className="all-on-one-page-container" style={{ 
        position: 'relative',
        maxWidth: '1200px', 
        minHeight: '100vh',
        padding: '0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '30px',
          width: '100%'
        }}>
          {/* Sidebar - left column */}
          <div className="survey-sidebar" style={{
            width: '280px',
            padding: '36px 24px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            position: 'sticky',
            top: '130px',
            height: 'fit-content',
            overflowY: 'auto',
            zIndex: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              marginBottom: '20px', 
              color: survey?.color || '#552a47',
              fontSize: '1.2rem',
              fontWeight: '600',
              paddingBottom: '12px',
              borderBottom: '1px solid #eaeaea'
            }}>
              Sections
            </h3>
            <div className="sidebar-tabs-container" style={{ marginTop: '16px' }}>
              {sidebarTabs}
            </div>
          </div>
          
          {/* Main content */}
          <div className="survey-main-content" style={{ 
            width: 'calc(100% - 280px - 30px)',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '36px 32px 32px',
            marginTop: '0'
          }}>
            {/* Render all sections but only show visible ones */}
            {filteredSectionIds.map((sectionId, index) => {
              // Get questions for this section
              const sectionQuestions = getQuestionsForSection(sectionId);
              const section = sections.find(s => s.id === sectionId);
              const sectionName = section ? section.name || `Section ${index + 1}` : 
                              (sectionId === 'unsectioned' ? 'General Questions' : `Section ${index + 1}`);
              const sectionDesc = section ? section.description || '' : 
                              (sectionId === 'unsectioned' ? 'Please answer these general questions.' : '');
              
              // Function to render document viewer
              const renderDocumentViewer = () => {
                if (!section?.document) return null;
                
                const documentUrl = section.document;
                const documentName = section.documentName || 'Document';
                const fileType = section.documentType || 
                  (documentName ? documentName.split('.').pop()?.toLowerCase() : '');
                
                const isPdf = fileType === 'pdf' || section.documentType === 'application/pdf';
                const isWord = fileType === 'doc' || fileType === 'docx' || 
                  section.documentType === 'application/msword' || 
                  section.documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                
                return (
                  <div className="document-viewer" style={{
                    marginTop: '20px',
                    marginBottom: '28px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div className="document-header" style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <h3 className="document-title" style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>Section Document</h3>
                    </div>
                    <div className="document-content" style={{
                      height: '700px',
                      overflow: 'auto'
                    }}>
                      {isPdf ? (
                        <iframe 
                          src={`${documentUrl}#toolbar=0&navpanes=0`} 
                          style={{
                            width: '100%',
                            height: '700px',
                            border: 'none'
                          }}
                          title="PDF Document"
                        />
                      ) : isWord ? (
                        <iframe 
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
                          style={{
                            width: '100%',
                            height: '700px',
                            border: 'none'
                          }}
                          title="Word Document"
                        />
                      ) : (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <p>Document preview not available</p>
                          <a href={documentUrl} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: survey?.color || '#552a47',
                            color: '#fff',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            marginTop: '10px'
                          }}>
                            Download {documentName}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              };
              
              // Prepare section header
              const thisSectionHeader = (
                <div className="section-header" style={{ 
                  marginBottom: '28px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '16px'
                }}>
                  <h2 style={{ 
                    color: survey && survey.color ? survey.color : '#552a47',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {sectionName}
                  </h2>
                  {sectionDesc && <p style={{
                    color: '#555',
                    lineHeight: '1.5',
                    fontSize: '1rem'
                  }}>{sectionDesc}</p>}
                  {section?.document && renderDocumentViewer()}
                </div>
              );
              
              // Prepare section questions
              const thisSectionQuestionsContent = Array.isArray(sectionQuestions) ? (
                sectionQuestions.map((question, qIndex) => {
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
                    
                    const questionId = question._id || question.id || `question_${qIndex}`;
                    
                    return (
                      <div key={questionId} className="question-container" style={{ 
                        margin: '0px 0px 20px 0px',
                        padding: '0px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #eee'
                      }}>
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
              
              // Only show sections that are in the visibleSections array
              const isVisible = visibleSections.includes(index);
              
              return (
                <div 
                  key={`section-${sectionId}`} 
                  ref={el => sectionRefs.current[index] = el}
                  className="survey-section" 
                  style={{ 
                    marginBottom: '28px', 
                    border: 'none',
                    marginTop: index > 0 ? '60px' : '0'
                  }}
                >
                  {/* If section is not visible and it's not the first section, show a placeholder */}
                  {!isVisible && index > 0 ? (
                    <div className="section-placeholder" style={{
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      color: '#888',
                      fontSize: '14px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div>Scroll down to see more questions</div>
                        <div style={{ fontSize: '24px', marginTop: '8px' }}>↓</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      opacity: isVisible ? 1 : 0,
                      maxHeight: isVisible ? '5000px' : '0',
                      overflow: 'hidden',
                      transition: 'opacity 0.8s ease, max-height 1s ease'
                    }}>
                      {thisSectionHeader}
                      
                      <div className="section-questions" style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px'
                      }}>
                        {thisSectionQuestionsContent}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {submitButton}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSurveyLayoutAll;
