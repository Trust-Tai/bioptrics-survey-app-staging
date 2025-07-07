import React, { useState, useEffect, useRef } from 'react';
import { FiArrowRight, FiArrowLeft, FiCheck, FiInfo, FiEdit, FiList, FiBarChart2, FiCalendar, FiUpload, FiAlignLeft, FiChevronDown } from 'react-icons/fi';
import './ModernSurveyQuestion.css';
import '../components/ModernSurvey.css';

interface Question {
  _id: string;
  id?: string;
  text: string;
  responseType?: string;
  type?: string; // Added type field which is used in some questions
  sectionId?: string;
  sectionName?: string;
  options?: string[] | { label: string; value: string }[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  order?: number;
  currentVersion?: number;
  versions?: {
    responseType?: string;
    options?: string[] | { label: string; value: string }[];
    questionText?: string;
    [key: string]: any;
  }[];
}

interface ModernSurveyQuestionProps {
  question: Question;
  progress: string;
  onAnswer: (answer: any, saveOnly?: boolean) => void;
  onBack: () => void;
  value?: any;
  color?: string;
  isLastQuestion?: boolean;
  onSubmit?: () => void;
  backgroundImage?: string;
  sectionName?: string;
  sectionDescription?: string;
}





const ModernSurveyQuestion: React.FC<ModernSurveyQuestionProps> = ({
  question,
  progress,
  onAnswer,
  onBack,
  value,
  color = '#2c3e50',
  isLastQuestion = false,
  onSubmit
}) => {
  const [answer, setAnswer] = useState<any>(value || '');
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };
  
  // Update local state when value prop changes or when question changes
  useEffect(() => {
    console.log('Question:', question);
    console.log('Question responseType:', question.responseType);
    
    // Special handling for dropdown questions - ensure they're properly detected
    if (question.responseType === 'dropdown' || 
        (question.responseType && question.responseType.toLowerCase().includes('dropdown'))) {
      console.log('DROPDOWN QUESTION DETECTED - This should render as a dropdown select');
    }
    
    const actualType = getActualQuestionType();
    console.log('Actual question type:', actualType);
    console.log('Will render:', actualType === 'dropdown' ? 'dropdown select' : 'other component');
    setAnswer(value || '');
  }, [value, question._id]);
  
  // Parse progress string to get current and total questions
  let currentQuestion = 1;
  let totalQuestions = 1;
  let remainingQuestions = 0;
  
  // Handle different progress string formats
  if (progress) {
    // Format: "Question N of M"
    if (progress.includes('Question')) {
      const match = progress.match(/Question (\d+) of (\d+)/);
      if (match && match.length === 3) {
        currentQuestion = parseInt(match[1], 10);
        totalQuestions = parseInt(match[2], 10);
      }
    } 
    // Format: "N of M"
    else if (progress.includes(' of ')) {
      const progressParts = progress.split(' of ');
      if (progressParts.length === 2) {
        // Extract just the number from the first part (in case it has text like "Section 1:")
        const firstPartMatch = progressParts[0].match(/(\d+)$/);
        currentQuestion = firstPartMatch ? parseInt(firstPartMatch[1], 10) : 1;
        totalQuestions = parseInt(progressParts[1], 10) || 1;
      }
    }
  }
  
  // Calculate remaining questions
  remainingQuestions = totalQuestions - currentQuestion;
  
  // Calculate progress percentage
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  // Check if the current answer is valid based on question type
  const isAnswerValid = (): boolean => {
    if (answer === null || answer === undefined) return false;
    
    // Ensure we have a responseType to work with
    const responseType = question.responseType || '';
    
    switch (responseType) {
      case 'text':
      case 'textarea':
      case 'long_text':
      case 'short_text':
        return answer.trim() !== '';
      case 'dropdown':
        return answer !== '';
      case 'date':
        return answer !== '';
      case 'file':
        return answer !== '';
      case 'rating':
        return answer !== '';
      default:
        return true;
    }
  };
  
  // Handle continue/submit button click
  const handleContinue = () => {
    // Validate the answer if needed
    if (question.required && !answer) {
      setError('This question requires an answer');
      return;
    }
    
    // Clear any error
    setError('');
    
    // If we're currently typing, make sure to clear the timeout and save immediately
    if (isTyping && debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
      setIsTyping(false);
    }
    
    // Call the onAnswer callback with the current answer
    onAnswer(answer);
    
    // Log whether this is the last question for debugging
    console.log('CRITICAL - Question button click info:', {
      isLastQuestion,
      hasSubmitHandler: !!onSubmit,
      questionText: question.text?.substring(0, 30),
      buttonText: isLastQuestion ? 'Submit' : 'Continue',
      currentAnswer: answer
    });
    
    // CRITICAL FIX: Always save the answer first, regardless of whether this is the last question
    console.log('Saving answer before continuing:', answer);
    onAnswer(answer);
    
    // Add a small delay to ensure the answer is saved before submitting
    setTimeout(() => {
      // If this is the last question and we have a submit handler
      if (isLastQuestion && onSubmit) {
        console.log('This is the last question - submitting survey');
        // Now call onSubmit after saving the answer
        onSubmit();
      }
    }, 100); // 100ms delay to ensure state updates complete
  };
  
  // Render numeric scale (1-5)
  const renderNumericScale = () => {
    const scaleOptions = Array.from({ length: 5 }, (_, i) => i + 1);
    const minLabel = question.labels && question.labels.length > 0 ? question.labels[0] : 'NOT AT ALL LIKELY';
    const maxLabel = question.labels && question.labels.length > 1 ? question.labels[1] : 'EXTREMELY LIKELY';
    
    return (
      <div className="scale-container">
        <div className="scale-labels">
          <div className="scale-label">{minLabel}</div>
          <div className="scale-label">{maxLabel}</div>
        </div>
        <div className="scale-options">
          {scaleOptions.map((value) => (
            <div
              key={value}
              className={`scale-option ${answer === value.toString() ? 'selected' : ''}`}
              onClick={() => {
                // Set answer in state
                setAnswer(value.toString());
                // Save answer immediately but don't navigate
                console.log('Scale value selected, saving immediately:', value.toString());
                // Use a flag to indicate this is just a save, not a navigation trigger
                const saveOnly = true;
                onAnswer(value.toString(), saveOnly);
              }}
              style={answer === value.toString() ? {backgroundColor: color} : {}}
            >
              {value}
              {answer === value.toString() && (
                <div className="scale-selected-indicator" style={{backgroundColor: 'var(--secondary-color)'}}>
                  <FiCheck size={12} color="white" />
                </div>
              )}
            </div>
          ))}
        </div>
        {answer && (
          <div className="selected-answer-display">
            <span>Your answer: <strong>{answer}</strong></span>
          </div>
        )}
      </div>
    );
  };
  
  // Render radio options
  const renderRadioOptions = () => {
    if (!question.options || question.options.length === 0) return null;
    
    // Determine if options are strings or objects
    const isObjectOptions = question.options.length > 0 && 
      typeof question.options[0] === 'object' && 
      question.options[0] !== null;
    
    return (
      <div className="options-list">
        {question.options.map((option, index) => {
          // Handle both string options and object options
          const value = isObjectOptions ? (option as any).value || (option as any).label : option as string;
          const label = isObjectOptions ? (option as any).label : option as string;
          
          return (
            <div
              key={index}
              className={`option-item ${answer === value ? 'selected' : ''}`}
              onClick={() => {
                // Set answer in state
                setAnswer(value);
                // Save answer immediately but don't navigate
                console.log('Option selected, saving immediately:', value);
                // Use a flag to indicate this is just a save, not a navigation trigger
                const saveOnly = true;
                onAnswer(value, saveOnly);
              }}
            >
              <div 
                className={`option-checkmark ${answer === value ? 'selected' : ''}`} 
                style={answer === value ? {borderColor: color, backgroundColor: color} : {}}
              >
                {answer === value && <FiCheck size={14} color="white" />}
              </div>
              <div className="option-text" dangerouslySetInnerHTML={createMarkup(label)}></div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render date input
  const renderDateInput = () => {
    return (
      <div className="date-input-container">
        <input
          type="date"
          className="date-input"
          value={answer || ''}
          onChange={(e) => {
            // Set answer in state
            setAnswer(e.target.value);
            // Save answer immediately but don't navigate
            console.log('Date selected, saving immediately:', e.target.value);
            // Use a flag to indicate this is just a save, not a navigation trigger
            const saveOnly = true;
            onAnswer(e.target.value, saveOnly);
          }}
          style={{borderColor: answer ? color : '#d1d5db'}}
        />
      </div>
    );
  };

  // Render dropdown select
  const renderDropdown = () => {
    console.log('Rendering dropdown with options:', question.options);
    
    // If no options are available, fallback to text input
    if (!question.options || question.options.length === 0) {
      console.log('No options available for dropdown, falling back to text input');
      return renderTextInput();
    }
    
    // Determine if options are strings or objects
    const isObjectOptions = question.options.length > 0 && 
      typeof question.options[0] === 'object' && 
      question.options[0] !== null;
    
    return (
      <div className="dropdown-container">
        <div className="select-wrapper">
          <select
            className="dropdown-select"
            value={answer || ''}
            onChange={(e) => {
              // Set answer in state
              setAnswer(e.target.value);
              // Save answer immediately but don't navigate
              console.log('Dropdown option selected, saving immediately:', e.target.value);
              // Use a flag to indicate this is just a save, not a navigation trigger
              const saveOnly = true;
              onAnswer(e.target.value, saveOnly);
            }}
            style={{borderColor: answer ? color : '#d1d5db'}}
          >
            <option value="" disabled>Select an option</option>
            {question.options.map((option, index) => {
              // Handle both string options and object options
              const value = isObjectOptions ? (option as any).value || (option as any).label : option;
              const label = isObjectOptions ? (option as any).label : option;
              
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <div className="dropdown-arrow">
            <FiChevronDown size={16} />
          </div>
        </div>
        {answer && (
          <div className="selected-answer-display">
            <span>Your answer: <strong>{answer}</strong></span>
          </div>
        )}
      </div>
    );
  };
  
  // Render file upload input
  const renderFileUpload = () => {
    return (
      <div className="file-upload-container">
        <label className="file-upload-label">
          <input
            type="file"
            className="file-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                // Set file name as answer in state
                setAnswer(file.name);
                // In a real implementation, you would upload the file here
                console.log('File selected:', file.name);
                // Use a flag to indicate this is just a save, not a navigation trigger
                const saveOnly = true;
                onAnswer(file.name, saveOnly);
              }
            }}
          />
          <div className="file-upload-button" style={{borderColor: color}}>
            <span>Choose File</span>
          </div>
          <span className="file-name">{answer || 'No file chosen'}</span>
        </label>
      </div>
    );
  };

  // Render rating scale
  const renderRatingScale = () => {
    const ratingOptions = Array.from({ length: 5 }, (_, i) => i + 1);
    
    return (
      <div className="rating-container">
        <div className="rating-options">
          {ratingOptions.map((value) => (
            <div
              key={value}
              className={`rating-option ${answer === value.toString() ? 'selected' : ''}`}
              onClick={() => {
                // Set answer in state
                setAnswer(value.toString());
                // Save answer immediately but don't navigate
                console.log('Rating selected, saving immediately:', value.toString());
                // Use a flag to indicate this is just a save, not a navigation trigger
                const saveOnly = true;
                onAnswer(value.toString(), saveOnly);
              }}
              style={answer === value.toString() ? {backgroundColor: color} : {}}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // State to track if we're currently typing in a text input
  const [isTyping, setIsTyping] = useState(false);
  // Reference for debounce timeout
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Render text input with debouncing to prevent auto-submission
  const renderTextInput = () => {
    return (
      <textarea
        className="text-input"
        value={answer}
        onChange={(e) => {
          // Set answer in state immediately
          setAnswer(e.target.value);
          
          // Mark that we're typing
          setIsTyping(true);
          
          // Clear any existing timeout
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
          }
          
          // Set a new timeout to save the answer after typing stops
          debounceTimeout.current = setTimeout(() => {
            console.log('Text input changed (debounced), saving:', e.target.value);
            // Save answer after typing pause with saveOnly flag
            const saveOnly = true;
            onAnswer(e.target.value, saveOnly);
            setIsTyping(false);
          }, 1000); // 1 second debounce
        }}
        placeholder="Type your answer here..."
        style={{borderColor: answer ? color : '#d1d5db'}}
      />
    );
  };
  
  // Get responseType from the correct location in the question object
  const getResponseType = () => {
    try {
      // Log the full question object to see its structure
      console.log('Full question object:', question);
      
      // Based on the database structure, we need to check if this is a question from
      // the questions collection (which has versions array)
      if (question && typeof question === 'object') {
        // Check for direct type property which is used in some questions
        if (question.type) {
          console.log('Found question.type:', question.type);
          return question.type;
        }
        
        // Also check for direct responseType property
        if (question.responseType) {
          console.log('Found question.responseType:', question.responseType);
          return question.responseType;
        }
        
        // First check if we're dealing with a question from the MongoDB collection
        // These questions have a versions array with responseType inside
        if (Array.isArray(question.versions) && question.versions.length > 0) {
          // Get the current version index (usually 0)
          const versionIndex = question.currentVersion !== undefined ? 
            Math.min(question.currentVersion, question.versions.length - 1) : 0;
          
          // Get the responseType from the appropriate version
          const versionData = question.versions[versionIndex];
          if (versionData && versionData.responseType) {
            console.log('Found responseType in versions array:', versionData.responseType);
            return versionData.responseType;
          }
        }
        
        // If we couldn't find it in versions, check direct responseType
        if (question.responseType) {
          console.log('Using direct responseType:', question.responseType);
          return question.responseType;
        }
      }
    } catch (error) {
      console.error('Error getting responseType:', error);
    }
    
    // Default fallback
    return 'text';
  };

  // Render the appropriate input based on question type
  const renderQuestionInput = () => {
    // Use the actual question type determined by getActualQuestionType
    const actualType = getActualQuestionType();
    
    console.log('Rendering input for type:', actualType);
    
    // Check responseType directly for dropdown to ensure we catch all dropdown variants
    const responseType = getResponseType().toLowerCase();
    if (responseType.includes('dropdown') || responseType === 'select') {
      console.log('Forcing dropdown rendering based on responseType:', responseType);
      return renderDropdown();
    }
    
    // Standard rendering based on actualType
    switch (actualType) {
      case 'rating':
        return renderRatingScale();
        
      case 'text':
        return renderTextInput();
      
      case 'long_text':
        return renderTextInput();
      
      case 'dropdown':
        console.log('Rendering dropdown from switch case');
        return renderDropdown();
      
      case 'date':
        return renderDateInput();
      
      case 'file':
        return renderFileUpload();
      
      case 'single_choice':
      case 'multiple_choice':
      case 'single_choice':
        return renderRadioOptions();
      
      default:
        // If question has options but no specific type, check if it should be a dropdown
        if (question.options && question.options.length > 0) {
          console.log('Question has options, checking if it should be dropdown');
          // If it has more than 5 options, render as dropdown for better UX
          if (question.options.length > 5) {
            console.log('Many options detected, rendering as dropdown');
            return renderDropdown();
          }
        }
        return renderRadioOptions();
    }
  };

  // Define the possible question types as a type for better type safety
  type QuestionType = 'dropdown' | 'date' | 'file' | 'rating' | 'single_choice' | 'multiple_choice' | 'long_text' | 'text';
  
  // Determine actual question type based on question properties and type
  const getActualQuestionType = (): QuestionType => {
    // Get responseType using our helper function that handles the complex structure
    const responseType = getResponseType().toLowerCase();
    
    // Log the exact responseType for debugging
    console.log('Normalized responseType:', responseType);
    
    // Check for dropdown types
    if (responseType.includes('dropdown') || responseType === 'select') {
      return 'dropdown';
    }
    
    // Check for date type
    if (responseType === 'date') {
      return 'date';
    }
    
    // Check for file type
    if (responseType === 'file') {
      return 'file';
    }
    
    // Check for rating types
    if (responseType === 'rating' || responseType === 'likert' || 
        responseType === 'likert_scale' || responseType === 'scale') {
      return 'rating';
    }
    
    // Check for single choice types
    if (responseType === 'radio' || responseType === 'choice') {
      return 'single_choice';
    }
    
    // Check for multiple choice types
    if (responseType === 'checkbox' || responseType.includes('multiple') || responseType === 'multiple-choice') {
      return 'multiple_choice';
    }
    
    // Check for long text types
    if (responseType === 'textarea' || responseType === 'long_text') {
      return 'long_text';
    }
    
    // Check for text types
    if (responseType === 'short_text' || responseType === 'open_text' || 
        responseType === 'free_text' || responseType.includes('text')) {
      return 'text';
    }
    
    // Additional checks based on question properties
    
    // If it has options, it's either multiple choice or single choice
    if (question.options && question.options.length > 0) {
      // Check if the type contains 'multiple'
      if (responseType.includes('multiple')) {
        return 'multiple_choice';
      }
      // Otherwise, it's single choice (radio)
      return 'single_choice';
    }
    
    // If it has a scale, it's a rating question
    if (question.scale) {
      return 'rating';
    }
    
    // Default to text input
    return 'text';
  };
  
  // Determine if the question should use a textarea instead of a text input
  const shouldUseTextarea = () => {
    const responseType = getResponseType().toLowerCase();
    return responseType === 'textarea' || responseType === 'long_text';
  };

  // Get question type info for display
  const getQuestionTypeInfo = () => {
    const actualType = getActualQuestionType();
    const responseType = getResponseType().toLowerCase();
    
    // Log the question type info for debugging
    console.log('Getting question type info for:', actualType, 'from responseType:', responseType);
    
    switch (actualType) {
      case 'dropdown':
        return { label: 'Dropdown', icon: <FiChevronDown size={16} /> };
      case 'multiple_choice':
        return { label: 'Multiple Choice', icon: <FiList size={16} /> };
      case 'single_choice':
        return { label: 'Single Choice', icon: <FiList size={16} /> };
      case 'rating':
        return { label: 'Rating', icon: <FiBarChart2 size={16} /> };
      case 'date':
        return { label: 'Date', icon: <FiCalendar size={16} /> };
      case 'file':
        return { label: 'File Upload', icon: <FiUpload size={16} /> };
      case 'long_text':
        return { label: 'Long Text', icon: <FiAlignLeft size={16} /> };
      case 'text':
        return { label: 'Text', icon: <FiEdit size={16} /> };
      default:
        return { label: actualType, icon: <FiInfo size={16} /> };
    }
  };
  
  const questionTypeInfo = getQuestionTypeInfo();

  // Hide header and remove padding from main div
  useEffect(() => {
    // Hide the header
    const header = document.querySelector('header') as HTMLElement;
    if (header) {
      header.style.display = 'none';
    }
    
    // Remove padding from main div
    const mainDiv = document.querySelector('div#react-target') as HTMLElement;
    if (mainDiv) {
      mainDiv.style.padding = '0';
    }
    
    // Cleanup function to restore original styles when component unmounts
    return () => {
      if (header) {
        header.style.display = '';
      }
      if (mainDiv) {
        mainDiv.style.padding = '';
      }
    };
  }, []);

  return (
    <>
      <div className="survey-header">
        <div className="progress-container">
          <div className="progress-info">
            <div className="question-count">Question {currentQuestion} of {totalQuestions}</div>
            <div className="remaining-count">{remainingQuestions} remaining</div>
          </div>
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercentage}%`, backgroundColor: color }}
            ></div>
          </div>
          <div className="completion-percentage">{progressPercentage}% Complete</div>
        </div>
      </div>
      
      <div className="question-container modern-survey-container">
        <h2 className="question-title">
          <span dangerouslySetInnerHTML={createMarkup(question.text)}></span>
          {question.required && <span className="question-required-indicator"> (Required)</span>}
        </h2>
        
        <div className="question-card">
          <div className="question-type-indicator">
            {questionTypeInfo.icon}
            <span>{questionTypeInfo.label}</span>
            {question.required && <span className="required-tag">Required</span>}
          </div>
          
          {/* Display question type label */}
          <div className="question-type-label">
            Question type: <strong>{getResponseType() || 'text'}</strong>
          </div>
          
          <div className="answer-options">
            {renderQuestionInput()}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="button-container">
            <button 
              className="button button-back" 
              onClick={() => {
                // Save the answer before going back but don't trigger navigation or submission
                console.log('Saving answer before going back:', answer);
                // Use saveOnly=true to prevent navigation or submission logic
                const saveOnly = true;
                // Only call onAnswer if there's an answer to save
                if (answer) {
                  onAnswer(answer, saveOnly);
                }
                // Then go back
                onBack();
              }}
            >
              <FiArrowLeft size={18} />
              Back
            </button>
            
            <button 
              className="button button-continue"
              onClick={handleContinue}
              disabled={question.required && !isAnswerValid()}
              style={{backgroundColor: color}}
              data-testid={isLastQuestion ? 'submit-button' : 'continue-button'}
            >
              {isLastQuestion ? 'Submit' : 'Continue'}
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernSurveyQuestion;
