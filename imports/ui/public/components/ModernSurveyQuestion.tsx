import React, { useState, useEffect, useRef } from 'react';
import { FiArrowRight, FiArrowLeft, FiCheck, FiInfo, FiEdit, FiList, FiBarChart2 } from 'react-icons/fi';
import './ModernSurveyQuestion.css';
import '../components/ModernSurvey.css';

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
    console.log('Actual question type:', getActualQuestionType());
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
  
  // Check if the current answer is valid
  const isAnswerValid = (): boolean => {
    if (answer === null || answer === undefined) return false;
    
    switch (question.type) {
      case 'text':
      case 'textarea':
        return answer.trim() !== '';
      case 'multiple-choice':
      case 'single-choice':
        return answer !== '';
      case 'scale':
      case 'likert':
      case 'likert_scale':
        return answer !== null && answer !== undefined;
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
    
    return (
      <div className="options-list">
        {question.options.map((option) => (
          <div
            key={option}
            className={`option-item ${answer === option ? 'selected' : ''}`}
            onClick={() => {
              // Set answer in state
              setAnswer(option);
              // Save answer immediately but don't navigate
              console.log('Option selected, saving immediately:', option);
              // Use a flag to indicate this is just a save, not a navigation trigger
              const saveOnly = true;
              onAnswer(option, saveOnly);
            }}
          >
            <div 
              className={`option-checkmark ${answer === option ? 'selected' : ''}`} 
              style={answer === option ? {borderColor: color, backgroundColor: color} : {}}
            >
              {answer === option && <FiCheck size={14} color="white" />}
            </div>
            <div className="option-text" dangerouslySetInnerHTML={createMarkup(option)}></div>
          </div>
        ))}
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
  
  // Render the appropriate input based on question type
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'likert':
      case 'likert_scale':
      case 'scale':
        return renderNumericScale();
        
      case 'text':
      case 'textarea':
      case 'open_text':
      case 'free_text':
        return renderTextInput();
        
      case 'choice':
      case 'multiple_choice':
      case 'single_choice':
      default:
        return renderRadioOptions();
    }
  };

  // Determine actual question type based on question properties and type
  const getActualQuestionType = () => {
    // If it has options, it's either multiple choice or single choice
    if (question.options && question.options.length > 0) {
      // Check if the type contains 'multiple' or is explicitly multiple_choice
      if (question.type === 'multiple_choice' || question.type.includes('multiple')) {
        return 'multiple_choice';
      } else {
        return 'single_choice';
      }
    }
    
    // If it has scale or labels, it's a scale question
    if (question.scale || (question.labels && question.labels.length > 0)) {
      return 'scale';
    }
    
    // If type contains text or textarea, it's a text question
    if (question.type.includes('text') || question.type.includes('textarea')) {
      return 'text';
    }
    
    // Default to the original type
    return question.type;
  };
  
  // Determine question type for display and icon
  const getQuestionTypeInfo = () => {
    const actualType = getActualQuestionType();
    
    switch (actualType) {
      case 'multiple_choice':
        return { label: 'Multiple Choice', icon: <FiList size={16} /> };
      case 'single_choice':
      case 'choice':
        return { label: 'Single Choice', icon: <FiList size={16} /> };
      case 'scale':
      case 'likert':
      case 'likert_scale':
        return { label: 'Scale', icon: <FiBarChart2 size={16} /> };
      case 'text':
      case 'textarea':
      case 'open_text':
      case 'free_text':
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
