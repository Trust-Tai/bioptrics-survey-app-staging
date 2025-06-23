import React, { useState, useEffect } from 'react';
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
  onAnswer: (answer: any) => void;
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
    // If the question is required and the answer is not valid, show error
    if (question.required && !isAnswerValid()) {
      setError('Please provide an answer before continuing');
      return;
    }
    
    // Clear any previous error
    setError(null);
    
    // Log whether this is the last question for debugging
    console.log('CRITICAL - Question button click info:', {
      isLastQuestion,
      hasSubmitHandler: !!onSubmit,
      questionText: question.text?.substring(0, 30),
      buttonText: isLastQuestion ? 'Submit' : 'Continue'
    });
    
    // If this is the last question and we have a submit handler
    if (isLastQuestion && onSubmit) {
      console.log('This is the last question - submitting survey');
      // Call onSubmit directly without saving the answer again
      // This will navigate to the thank you page
      onSubmit();
      return; // Important: return early to prevent onAnswer from being called
    }
    
    // Only save the answer if we're not submitting
    // This prevents double-saving which might cause navigation issues
    onAnswer(answer);
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
              onClick={() => setAnswer(value.toString())}
              style={answer === value.toString() ? {backgroundColor: color} : {}}
            >
              {value}
              {answer === value.toString() && (
                <div className="scale-selected-indicator" style={{backgroundColor: color}}>
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
            onClick={() => setAnswer(option)}
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
  
  // Render text input
  const renderTextInput = () => {
    return (
      <textarea
        className="text-input"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
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
    <div className="question-container modern-survey-container">
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
      
      <div className="question-card">
        <div className="question-type-indicator">
          {questionTypeInfo.icon}
          <span>{questionTypeInfo.label}</span>
          {question.required && <span className="required-tag">Required</span>}
        </div>
        
        <h2 className="question-text" dangerouslySetInnerHTML={createMarkup(question.text)}></h2>
        
        <div className="answer-options">
          {renderQuestionInput()}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="button-container">
          <button className="button button-back" onClick={onBack}>
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
  );
};

export default ModernSurveyQuestion;
