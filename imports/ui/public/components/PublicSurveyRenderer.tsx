import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import './ModernSurveyQuestion.css';
import ModernSurveyWelcome from './ModernSurveyWelcome';
import ModernSurveyThankYou from './ModernSurveyThankYou';

// Types
interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
}

interface Question {
  id: string;
  questionText: string;
  description?: string;
  type?: string;
  responseType?: string;
  options?: any[];
  sectionId?: string;
  versions?: any[];
  currentVersion?: number;
  required?: boolean;
}

interface Section {
  id: string;
  name: string;
  description: string;
  order: number;
  questions: Question[];
}

type SurveyStep = 
  | { type: 'welcome' }
  | { type: 'section'; sectionId: string }
  | { type: 'question'; questionIndex: number }
  | { type: 'thank-you' };

interface PublicSurveyRendererProps {
  survey: Survey;
  token: string;
  isPreviewMode?: boolean;
}

// Using CSS classes from ModernSurveyQuestion.css instead of styled-components

/**
 * PublicSurveyRenderer - New component that properly handles question ordering
 * from the survey builder's Questions tab using surveyOrder as the primary source
 */
const PublicSurveyRenderer: React.FC<PublicSurveyRendererProps> = ({
  survey,
  token,
  isPreviewMode = false
}) => {
  // State for survey flow
  const [currentStep, setCurrentStep] = useState<SurveyStep>({ type: 'welcome' });
  const [sessionStartTime, setSessionStartTime] = useState(new Date());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced setResponses that also saves progress
  const updateResponses = (newResponses: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    setResponses(prev => {
      const updatedResponses = typeof newResponses === 'function' ? newResponses(prev) : newResponses;
      // Save progress after updating responses
      saveProgress(currentStep, updatedResponses);
      return updatedResponses;
    });
  };

  // Generate unique storage key for this survey
  const storageKey = `survey_progress_${survey._id}`;

  // Save progress to localStorage
  const saveProgress = (step: SurveyStep, currentResponses: Record<string, any>) => {
    try {
      const progressData = {
        currentStep: step,
        responses: currentResponses,
        timestamp: new Date().toISOString(),
        surveyId: survey._id
      };
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save survey progress:', error);
    }
  };

  // Load progress from localStorage
  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        // Verify this is for the same survey
        if (progressData.surveyId === survey._id) {
          return progressData;
        }
      }
    } catch (error) {
      console.warn('Failed to load survey progress:', error);
    }
    return null;
  };

  // Clear progress from localStorage (on completion)
  const clearProgress = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear survey progress:', error);
    }
  };

  // Restore progress on component mount
  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      setCurrentStep(savedProgress.currentStep);
      setResponses(savedProgress.responses);
      console.log('Restored survey progress:', savedProgress);
    }
  }, [survey._id]);

  // Load survey questions when component mounts
  useEffect(() => {
    if (!survey) return;

    // Fetch ordered questions from the survey
    loadSurveyQuestions();

  }, [survey]);

  // Function to load survey questions in the correct order
  const loadSurveyQuestions = async () => {
    setLoading(true);
    try {
      console.log('Fetching ordered questions for survey:', survey._id);
      
      Meteor.call('surveys.getOrderedQuestions', survey._id, (error: any, result: any) => {
        if (error) {
          console.error('Error fetching survey questions:', error);
        } else {
          console.log('Received ordered questions:', result);
          // Map isRequired to required for frontend compatibility
          const mappedQuestions = (result.questions || []).map((q: any) => ({
            ...q,
            required: q.isRequired || false
          }));
          setQuestions(mappedQuestions);
          setSections(result.sections || []);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading survey questions:', error);
      setLoading(false);
    }
  };


  // Update current step and save progress
  const updateCurrentStep = (newStep: SurveyStep) => {
    console.log('Updating current step:', newStep);
    setCurrentStep(newStep);
    saveProgress(newStep, responses);
  };

  // Handle starting the survey
  const handleStart = () => {
    console.log('Starting survey - navigating to first question');
    
    // Reset session start time when starting the survey
    setSessionStartTime(new Date());
    console.log('Session start time reset:', new Date());
    
    if (questions.length === 0) {
      console.warn('No questions available, going to thank you screen');
      updateCurrentStep({ type: 'thank-you' });
      return;
    }

    // Check if the first question belongs to a section
    const firstQuestion = questions[0];
    if (firstQuestion.sectionId && sections.length > 0) {
      // Navigate to section first
      const section = sections.find(s => s.id === firstQuestion.sectionId);
      if (section) {
        console.log('Navigating to first section:', section.name);
        updateCurrentStep({ 
          type: 'section', 
          sectionId: section.id 
        });
        return;
      }
    }

    // Navigate directly to first question
    console.log('Navigating to first question:', firstQuestion.questionText);
    updateCurrentStep({ 
      type: 'question', 
      questionIndex: 0
    });
  };

  // Handle restarting the survey
  const handleRestart = () => {
    console.log('Restarting survey - clearing all data and returning to welcome screen');
    
    // Clear all responses
    setResponses({});
    
    // Clear any error messages
    setError('');
    
    // Clear saved progress from localStorage
    clearProgress();
    
    // Reset to welcome screen
    setCurrentStep({ type: 'welcome' });
    
    // Reset session start time for accurate timing
    setSessionStartTime(new Date());
  };

  // Function to get response type (matching ModernSurveyQuestion logic)
  const getResponseType = (question: Question) => {
    try {
      if (Array.isArray(question.versions) && question.versions.length > 0) {
        const versionIndex = question.currentVersion !== undefined ? 
          Math.min(question.currentVersion, question.versions.length - 1) : 0;
        
        const versionData = question.versions[versionIndex];
        
        if (versionData) {
          if (versionData.responseType) {
            return versionData.responseType;
          }
          
          if (versionData.type) {
            return versionData.type;
          }
        }
      }
      
      if (question && typeof question === 'object') {
        if (question.type) {
          return question.type;
        }
        
        if (question.responseType) {
          return question.responseType;
        }
      }
    } catch (error) {
      console.error('Error getting responseType:', error);
    }
    
    return 'text';
  };

  // Function to determine actual question type (matching ModernSurveyQuestion logic)
  const getActualQuestionType = (question: Question): string => {
    if (Array.isArray(question.versions) && question.versions.length > 0) {
      const versionIndex = question.currentVersion !== undefined ? 
        Math.min(question.currentVersion, question.versions.length - 1) : 0;
      const versionData = question.versions[versionIndex];
      
      if (versionData) {
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'dropdown') {
          return 'dropdown';
        }
        
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'select') {
          return 'dropdown';
        }
      }
    }
    
    const responseType = getResponseType(question).toLowerCase();
    
    if (responseType.includes('dropdown') || responseType === 'select') {
      return 'dropdown';
    }
    
    if (responseType === 'date') {
      return 'date';
    }
    if (responseType === 'file') {
      return 'file';
    }
    if (responseType === 'rating' || responseType === 'likert' || responseType === 'likert_scale' || responseType === 'scale') {
      return 'rating';
    }
    if (responseType === 'radio' || responseType === 'choice') {
      return 'single_choice';
    }
    if (responseType === 'checkbox' || responseType.includes('multiple') || responseType === 'multiple-choice') {
      return 'multiple_choice';
    }
    if (responseType === 'textarea' || responseType === 'long_text') {
      return 'long_text';
    }
    
    if (question.options && question.options.length > 0) {
      return 'dropdown';
    }
    
    return 'text';
  };

  // Get question options from versions or direct options
  const getQuestionOptions = (question: Question): any[] => {
    if (Array.isArray(question.versions) && question.versions.length > 0) {
      const versionIndex = question.currentVersion !== undefined ? 
        Math.min(question.currentVersion, question.versions.length - 1) : 0;
      const versionData = question.versions[versionIndex];
      
      if (versionData && versionData.options) {
        return versionData.options;
      }
    }
    
    // Fall back to direct options
    return question.options || [];
  };

  // Check if answer is valid for required questions
  const isAnswerValid = (question: Question): boolean => {
    const answer = responses[question.id];
    const questionType = getActualQuestionType(question);
    
    console.log('Validating answer:', {
      questionId: question.id,
      questionText: question.questionText,
      isRequired: question.required,
      answer,
      questionType,
      answerType: typeof answer
    });
    
    if (answer === null || answer === undefined || answer === '') {
      console.log('Answer is empty/null/undefined');
      return false;
    }
    
    switch (questionType) {
      case 'text':
      case 'long_text':
        const isValid = typeof answer === 'string' && answer.trim() !== '';
        console.log('Text validation result:', isValid);
        return isValid;
      case 'dropdown':
      case 'select':
        const dropdownValid = answer !== '' && answer !== null && answer !== undefined;
        console.log('Dropdown validation result:', dropdownValid);
        return dropdownValid;
      case 'single_choice':
      case 'multiple_choice':
        const choiceValid = answer !== '' && answer !== null && answer !== undefined;
        console.log('Choice validation result:', choiceValid);
        return choiceValid;
      case 'rating':
      case 'scale':
        const ratingValid = answer !== '' && answer !== null && answer !== undefined;
        console.log('Rating validation result:', ratingValid);
        return ratingValid;
      default:
        console.log('Default validation - returning true');
        return true;
    }
  };

  // Get selected answer display text
  const getSelectedAnswerText = (question: Question): string => {
    const answer = responses[question.id];
    if (!answer || answer === '' || answer === null || answer === undefined) return '';

    const questionType = getActualQuestionType(question);
    const options = getQuestionOptions(question);

    switch (questionType) {
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
      case 'select':
        // Find the label for the selected value
        if (options && options.length > 0) {
          const selectedOption = options.find((option: any) => {
            const optionValue = typeof option === 'object' ? (option.value || option.label) : option;
            return optionValue === answer;
          });
          if (selectedOption) {
            return typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
          }
        }
        return answer;
      case 'rating':
      case 'scale':
        const scaleOptions = getQuestionOptions(question);
        if (scaleOptions && scaleOptions.length > 0) {
          // Find the selected option by value or index
          const selectedOption = scaleOptions.find(opt => {
            const optValue = typeof opt === 'object' ? 
              (opt.value !== undefined ? opt.value : opt.text || opt.label) : 
              opt;
            return optValue.toString() === answer.toString();
          });
          
          if (selectedOption) {
            return typeof selectedOption === 'object' ? 
              (selectedOption.text || selectedOption.label || selectedOption.value) : 
              selectedOption;
          }
          
          // If not found by value, try by index (1-based)
          const optionIndex = parseInt(answer) - 1;
          if (optionIndex >= 0 && optionIndex < scaleOptions.length) {
            const option = scaleOptions[optionIndex];
            return typeof option === 'object' ? 
              (option.text || option.label || option.value) : 
              option;
          }
        }
        return `${answer} out of ${scaleOptions?.length || 5}`;
      default:
        return answer;
    }
  };

  // Render question input based on type
  const renderQuestionInput = (question: Question) => {
    const questionType = getActualQuestionType(question);
    const options = getQuestionOptions(question);
    
    console.log('Rendering question input:', {
      questionId: question.id,
      questionType,
      options,
      currentResponse: responses[question.id]
    });

    switch (questionType) {
      case 'text':
      case 'long_text':
        return (
          <textarea
            className="modern-survey-container textarea"
            placeholder="Enter your response..."
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              updateResponses(prev => ({
                ...prev,
                [question.id]: e.target.value
              }));
              setError(''); // Clear error when answer is provided
            }}
            value={responses[question.id] || ''}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: 'var(--text-color, #4b5563)',
              fontFamily: 'var(--body-font, "Inter, sans-serif")',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              marginTop: '8px',
              lineHeight: '1.5',
              resize: 'vertical'
            }}
          />
        );

      case 'single_choice':
      case 'multiple_choice':
        if (!options || options.length === 0) {
          return <div>No options available for this question</div>;
        }
        
        return (
          <div className="options-list">
            {options.map((option: any, index: number) => {
              const optionValue = typeof option === 'object' ? (option.value || option.label) : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isSelected = responses[question.id] === optionValue;
              
              return (
                <div key={index} className={`option-item ${isSelected ? 'selected' : ''}`}>
                  <div className={`option-checkmark ${isSelected ? 'selected' : ''}`}>
                    {isSelected && '✓'}
                  </div>
                  <input
                    type="radio"
                    name={question.id}
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      updateResponses(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }));
                      setError(''); // Clear error when answer is provided
                    }}
                    style={{ display: 'none' }}
                  />
                  <span className="option-text" onClick={() => {
                    updateResponses(prev => ({
                      ...prev,
                      [question.id]: optionValue
                    }));
                    setError(''); // Clear error when answer is provided
                  }}>
                    {optionLabel}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'dropdown':
      case 'select':
        if (!options || options.length === 0) {
          return <div>No options available for this question</div>;
        }
        
        return (
          <div className="dropdown-container">
            <select
              className="modern-survey-container select"
              value={responses[question.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                updateResponses(prev => ({
                  ...prev,
                  [question.id]: e.target.value
                }));
                setError(''); // Clear error when answer is provided
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: 'var(--text-color, #4b5563)',
                fontFamily: 'var(--body-font, "Inter, sans-serif")',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                marginTop: '8px',
                lineHeight: '1.5'
              }}
            >
              <option value="">Select an option...</option>
              {options.map((option: any, index: number) => {
                const optionValue = typeof option === 'object' ? (option.value || option.label) : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                
                return (
                  <option key={index} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
          </div>
        );

      case 'rating':
      case 'scale':
        const ratingOptions = getQuestionOptions(question);
        
        if (!ratingOptions || ratingOptions.length === 0) {
          // Fallback to numbered scale if no options configured
          const scaleOptions = Array.from({ length: 5 }, (_, i) => i + 1);
          return (
            <div className="rating-options">
              {scaleOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rating-option ${responses[question.id] === value.toString() ? 'selected' : ''}`}
                  onClick={() => {
                    updateResponses(prev => ({
                      ...prev,
                      [question.id]: value.toString()
                    }));
                    setError(''); // Clear error when answer is provided
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          );
        }

        // Use configured answer options for Likert scale
        return (
          <div className="likert-scale-container" style={{ width: '100%' }}>
            <div className="likert-scale-labels" style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              <span className="likert-label-left" style={{ textAlign: 'left', maxWidth: '40%' }}>
                {typeof ratingOptions[0] === 'object' ? (ratingOptions[0]?.text || ratingOptions[0]?.label || ratingOptions[0]?.value) : ratingOptions[0]}
              </span>
              <span className="likert-label-right" style={{ textAlign: 'right', maxWidth: '40%' }}>
                {typeof ratingOptions[ratingOptions.length - 1] === 'object' ? (ratingOptions[ratingOptions.length - 1]?.text || ratingOptions[ratingOptions.length - 1]?.label || ratingOptions[ratingOptions.length - 1]?.value) : ratingOptions[ratingOptions.length - 1]}
              </span>
            </div>
            <div className="rating-options" style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '8px',
              alignItems: 'center'
            }}>
              {ratingOptions.map((option, index) => {
                const optionValue = typeof option === 'object' ? 
                  (option.value !== undefined ? option.value : option.text || option.label) : 
                  option;
                const optionLabel = typeof option === 'object' ? 
                  (option.text || option.label || option.value) : 
                  option;
                const isSelected = responses[question.id] === optionValue.toString();
                
                return (
                  <button
                    key={index}
                    type="button"
                    className={`rating-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateResponses(prev => ({
                        ...prev,
                        [question.id]: optionValue.toString()
                      }));
                      setError(''); // Clear error when answer is provided
                    }}
                    title={optionLabel}
                    style={{
                      width: '40px',
                      maxWidth: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #d1d5db',
                      backgroundColor: isSelected ? 'var(--primary-color, #3b82f6)' : '#fff',
                      color: isSelected ? '#fff' : '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        // Fallback to text input
        return (
          <textarea
            className="modern-survey-container textarea"
            placeholder="Enter your response..."
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              updateResponses(prev => ({
                ...prev,
                [question.id]: e.target.value
              }));
              setError(''); // Clear error when answer is provided
            }}
            value={responses[question.id] || ''}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: 'var(--text-color, #4b5563)',
              fontFamily: 'var(--body-font, "Inter, sans-serif")',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              marginTop: '8px',
              lineHeight: '1.5',
              resize: 'vertical'
            }}
          />
        );
    }
  };

  // Render selected answer display
  const renderSelectedAnswer = (question: Question) => {
    const selectedText = getSelectedAnswerText(question);
    if (!selectedText || selectedText.trim() === '') return null;

    return (
      <div className="selected-answer-display" style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '8px 12px',
        marginTop: '8px',
        fontSize: '14px',
        color: '#0369a1'
      }}>
        <span>Your answer: <strong>{selectedText}</strong></span>
      </div>
    );
  };

  // Handle navigation between questions
  const handleNext = () => {
    setError(null);
    
    if (currentStep.type === 'question' && typeof currentStep.questionIndex === 'number') {
      const currentQuestion = questions[currentStep.questionIndex];
      
      // Check if current question is required and not answered
      if (currentQuestion?.required && !isAnswerValid(currentQuestion)) {
        setError('This question requires an answer');
        return;
      }
      
      const nextIndex = currentStep.questionIndex + 1;
      
      if (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        
        // Check if next question belongs to a different section
        const currentQuestion = questions[currentStep.questionIndex];
        if (nextQuestion.sectionId !== currentQuestion.sectionId && nextQuestion.sectionId) {
          // Navigate to section first
          const section = sections.find(s => s.id === nextQuestion.sectionId);
          if (section) {
            updateCurrentStep({ 
              type: 'section', 
              sectionId: section.id 
            });
            return;
          }
        }
        
        // Navigate to next question
        updateCurrentStep({ 
          type: 'question', 
          questionIndex: nextIndex
        });
      } else {
        // Survey completed - save responses to the server and go to thank you
        // Transform responses from object format to array format expected by the server
        const responsesArray = Object.entries(responses).map(([questionId, answer]) => {
          // Extract section ID if it exists in the question ID (format: sectionId:questionId)
          let sectionId;
          let actualQuestionId = questionId;
          
          if (questionId.includes(':')) {
            const parts = questionId.split(':');
            sectionId = parts[0];
            actualQuestionId = parts[1];
          }
          
          return {
            questionId: actualQuestionId,
            sectionId: sectionId,
            answer: answer
          };
        });
        
        const submissionData = {
          surveyId: survey._id,
          responses: responsesArray,
          metadata: {
            token: token,
            completedAt: new Date(),
            startedAt: sessionStartTime,
            timeSpent: new Date().getTime() - sessionStartTime.getTime(),
            isPreview: isPreviewMode
          }
        };
        
        // Call the server method to save responses
        Meteor.call('surveyResponses.submit', submissionData, (error: Meteor.Error | null, responseId: string) => {
          if (error) {
            console.error('Error submitting survey:', error);
            setError('Failed to submit survey. Please try again.');
          } else {
            console.log('Survey submitted successfully with responseId:', responseId);
            // Store the responseId for the thank you screen
            setCurrentResponseId(responseId);
            // Clear progress and go to thank you
            clearProgress();
            updateCurrentStep({ type: 'thank-you' });
          }
        });
      }
    } else if (currentStep.type === 'welcome') {
      // Move from welcome to first question
      updateCurrentStep({
        type: 'question',
        questionIndex: 0
      });
    }
  };

  // Handle going back to previous question
  const handlePrevious = () => {
    if (currentStep.type === 'question' && typeof currentStep.questionIndex === 'number') {
      const prevIndex = currentStep.questionIndex - 1;
      
      if (prevIndex >= 0) {
        const prevQuestion = questions[prevIndex];
        updateCurrentStep({ 
          type: 'question', 
          questionIndex: prevIndex
        });
      } else {
        // Go back to welcome
        updateCurrentStep({ type: 'welcome' });
      }
    }
  };

  const handleSectionContinue = (sectionId: string) => {
    // Find first question in this section
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    if (sectionQuestions.length > 0) {
      const firstQuestion = sectionQuestions[0];
      const questionIndex = questions.findIndex(q => q.id === firstQuestion.id);
      updateCurrentStep({ 
        type: 'question', 
        questionIndex: questionIndex
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid var(--primary-color, #3b82f6)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px',
          margin: 0 
        }}>
          Loading survey...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render based on current step
  if (currentStep.type === 'welcome') {
    return (
      <ModernSurveyWelcome
        survey={survey}
        onStart={handleStart}
      />
    );
  }

  if (currentStep.type === 'section') {
    const section = sections.find(s => s.id === currentStep.sectionId);
    if (!section) {
      console.error('Section not found:', currentStep.sectionId);
      return <div>Section not found</div>;
    }

    return (
      <div className="modern-survey-container">
        <div className="full-width-content">
          <h1 className="question-title">{section.name}</h1>
          {section.description && (
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666', 
              marginBottom: '2rem', 
              lineHeight: '1.6',
              textAlign: 'center'
            }}>
              {section.description}
            </p>
          )}
          <button 
            className="button button-continue"
            onClick={() => handleSectionContinue(section.id)}
          >
            Continue to Questions
          </button>
        </div>
      </div>
    );
  }

  if (currentStep.type === 'question') {
    const question = questions[currentStep.questionIndex];
    if (!question) {
      console.error('Question not found at index:', currentStep.questionIndex);
      return <div>Question not found</div>;
    }

    const questionIndex = currentStep.questionIndex ?? 0;
    const isLastQuestion = questionIndex === questions.length - 1;

    return (
      <div className="modern-survey-container">
        {/* Survey Header with Progress */}
        <div className="survey-header">
          <div className="progress-container">
            <div className="progress-info">
              <div className="question-count">
                Question {questionIndex + 1} of {questions.length}
              </div>
              <div className="remaining-count">
                {questions.length - questionIndex - 1} remaining
              </div>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="completion-percentage">
              {Math.round(((questionIndex + 1) / questions.length) * 100)}% complete
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="full-width-content">
          <h1 className="question-title">
            <span dangerouslySetInnerHTML={{ __html: question.questionText }} />
            {question.required && <span className="question-required-indicator" aria-label="required question">*</span>}
          </h1>
          
          {question.description && (
            <p 
              style={{ 
                marginBottom: '2rem', 
                color: '#666', 
                textAlign: 'center', 
                fontSize: '1rem', 
                lineHeight: '1.5' 
              }}
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          )}

          <div className="question-card">
            {question.required && (
              <div className="question-required-badge" style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '12px',
                display: 'inline-block'
              }}>
                ⚠️ Required Question
              </div>
            )}
            
            {renderQuestionInput(question)}
            
            {/* Show selected answer display */}
            {renderSelectedAnswer(question)}
            
            {/* Show error message if validation fails */}
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '12px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span>❌ {error}</span>
              </div>
            )}
            
            {/* Show validation status for required questions */}
            {question.required && (
              <div className="validation-status" style={{
                marginTop: '8px',
                fontSize: '12px',
                color: isAnswerValid(question) ? '#059669' : '#dc2626'
              }}>
                {isAnswerValid(question) ? '✅ Answer provided' : '⚠️ Answer required to continue'}
              </div>
            )}
          </div>

          <div className="button-container">
            <button 
              className="button button-back"
              onClick={handlePrevious}
              disabled={questionIndex === 0}
              style={{ 
                opacity: questionIndex === 0 ? 0.5 : 1,
                cursor: questionIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <button 
              className="button button-continue"
              onClick={handleNext}
              disabled={question.required && !isAnswerValid(question)}
              style={{
                opacity: question.required && !isAnswerValid(question) ? 0.6 : 1,
                cursor: question.required && !isAnswerValid(question) ? 'not-allowed' : 'pointer',
                backgroundColor: question.required && !isAnswerValid(question) ? '#d1d5db' : undefined,
                position: 'relative'
              }}
              title={question.required && !isAnswerValid(question) ? 'Please answer this required question to continue' : undefined}
            >
              {question.required && !isAnswerValid(question) && '🔒 '}
              {isLastQuestion ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep.type === 'thank-you') {
    // Calculate the time spent on the survey in seconds
    const timeSpentSeconds = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
    console.log('Time spent on survey (seconds):', timeSpentSeconds);
    
    return (
      <ModernSurveyThankYou
        survey={survey}
        onRestart={handleRestart}
        responseId={currentResponseId}
        completionTime={timeSpentSeconds}
      />
    );
  }

  // Default fallback (should not reach here in current implementation)
  return (
    <div>
      <h2>Survey Step Not Implemented</h2>
      <p>Current step: {JSON.stringify(currentStep)}</p>
    </div>
  );
};

export default PublicSurveyRenderer;
