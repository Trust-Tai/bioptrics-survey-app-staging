import React, { useState, useEffect } from 'react';
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

interface CustomerSatisfactionTemplateProps {
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

const CustomerSatisfactionTemplate: React.FC<CustomerSatisfactionTemplateProps> = ({
  question,
  progress,
  onAnswer,
  onBack,
  value,
  color = '',
  isLastQuestion = false,
  onSubmit,
  backgroundImage = 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
  sectionName = 'Customer Satisfaction Template',
  sectionDescription = 'Your feedback helps us improve our service'
}) => {
  const [answer, setAnswer] = useState<any>(value || '');
  const [error, setError] = useState<string | null>(null);
  
  // Update local state when value prop changes
  useEffect(() => {
    setAnswer(value || '');
  }, [value]);
  
  // Parse progress string to get current and total questions
  let currentQuestion = 1;
  let totalQuestions = 1;
  
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
  
  // Ensure we have valid numbers
  currentQuestion = isNaN(currentQuestion) ? 1 : currentQuestion;
  totalQuestions = isNaN(totalQuestions) ? 1 : totalQuestions;
  
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  // Handle continue/submit button click
  const handleContinue = () => {
    // If the question is required and the answer is not valid, show error
    if (question.required && !isAnswerValid()) {
      setError('This question requires an answer');
      return;
    }
    
    // Clear any previous error
    setError(null);
    
    // Save the current answer
    onAnswer(answer);
    
    // If this is the last question and we have a submit handler
    if (isLastQuestion && onSubmit) {
      setTimeout(() => {
        onSubmit();
      }, 100); // Small delay to ensure the answer is saved first
    }
  };
  
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
  
  // Render numeric scale (0-10)
  const renderNumericScale = () => {
    const scaleOptions = Array.from({ length: 11 }, (_, i) => i);
    const minLabel = question.labels && question.labels.length > 0 ? question.labels[0] : 'NOT AT ALL LIKELY';
    const maxLabel = question.labels && question.labels.length > 1 ? question.labels[1] : 'EXTREMELY LIKELY';
    
    return (
      <>
        <div className="modern-survey-scale-labels">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
        <div className="modern-survey-scale">
          {scaleOptions.map((value) => (
            <button
              key={value}
              className={`scale-button ${answer === value.toString() ? 'selected' : ''}`}
              onClick={() => setAnswer(value.toString())}
              style={{ 
                '--primary-color': color,
                '--primary-dark': adjustColor(color, -20)
              } as React.CSSProperties}
            >
              {value}
            </button>
          ))}
        </div>
      </>
    );
  };
  
  // Render radio options
  const renderRadioOptions = () => {
    if (!question.options || question.options.length === 0) return null;
    
    return (
      <div className="modern-survey-options">
        {question.options.map((option) => (
          <button
            key={option}
            className={`option-button ${answer === option ? 'selected' : ''}`}
            onClick={() => setAnswer(option)}
            style={{ 
              '--primary-color': color,
              '--primary-dark': adjustColor(color, -20)
            } as React.CSSProperties}
          >
            <div className="radio-circle">
              {answer === option && <div className="radio-circle-inner"></div>}
            </div>
            {option}
          </button>
        ))}
      </div>
    );
  };
  
  // Render text input
  const renderTextInput = () => {
    return (
      <textarea
        className="modern-survey-textarea"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        style={{ 
          '--primary-color': color,
          '--primary-dark': adjustColor(color, -20)
        } as React.CSSProperties}
      />
    );
  };
  
  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    let usePound = false;
    
    if (color[0] === '#') {
      color = color.slice(1);
      usePound = true;
    }
    
    const num = parseInt(color, 16);
    
    let r = (num >> 16) + amount;
    r = Math.max(Math.min(255, r), 0);
    
    let g = ((num >> 8) & 0x00FF) + amount;
    g = Math.max(Math.min(255, g), 0);
    
    let b = (num & 0x0000FF) + amount;
    b = Math.max(Math.min(255, b), 0);
    
    return (usePound ? '#' : '') + (g | (r << 8) | (b << 16)).toString(16).padStart(6, '0');
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
  
  // Convert hex color to RGB values for CSS variables
  const hexToRgb = (hex: string): string => {
    if (!hex || hex === '') return '223, 104, 183'; // Default pink color
    
    // Remove the # if present
    hex = hex.replace('#', '');
    
    try {
      // Parse the hex values
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      return `${r}, ${g}, ${b}`;
    } catch (error) {
      console.error('Error parsing color:', error);
      return '223, 104, 183'; // Default pink color
    }
  };
  
  // Use a default color if none is provided
  // This ensures we always have a valid color value
  const effectiveColor = color || '#552a47';
  
  // Get RGB values for CSS variables
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '85, 42, 71';
  
  // Log the color for debugging
  console.log('Survey color:', { provided: color, effective: effectiveColor, rgb: primaryColorRgb });
  
  // Log the CSS variables being applied
  useEffect(() => {
    console.log('Applying CSS variables:', {
      primaryColor: effectiveColor,
      primaryColorRgb: primaryColorRgb,
      primaryDark: adjustColor(effectiveColor, -20)
    });
  }, [effectiveColor, primaryColorRgb]);
  
  // Log sidebar content for debugging
  console.log('Sidebar content:', {
    backgroundImage,
    sectionName,
    sectionDescription
  });
  
  return (
    <div 
      className="modern-survey-container"
      style={{
        '--primary-color': effectiveColor,
        '--primary-color-rgb': primaryColorRgb,
        '--primary-dark': adjustColor(effectiveColor, -20)
      } as React.CSSProperties}
    >
      <div className="modern-survey-wrapper">
        <div 
          className="modern-survey-sidebar"
          style={{ 
            backgroundImage: `url(${backgroundImage})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'block',
            width: '100%'
          }}
        >
          <div className="modern-survey-sidebar-overlay">
            <div className="sidebar-text-container">
              <h2 title={sectionName}>{sectionName}</h2>
              <p title={sectionDescription}>{sectionDescription}</p>
            </div>
          </div>
        </div>
        
        <div className="modern-survey-content">
        <div className="progress-indicator">
          <span className="progress-text">Question {currentQuestion} of {totalQuestions}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: color 
              }}
            ></div>
          </div>
        </div>
        
        <div className="modern-survey-header">
          <h1 className="modern-survey-question">{question.text}</h1>
        </div>
        
        {renderQuestionInput()}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="modern-survey-actions">
          <button 
            className="modern-survey-button button-secondary"
            onClick={onBack}
          >
            Back
          </button>
          
          <button 
            className="modern-survey-button button-secondary"
            onClick={handleContinue}
            disabled={question.required && !isAnswerValid()}
            style={{ 
              '--primary-color': color,
              '--primary-dark': adjustColor(color, -20)
            } as React.CSSProperties}
          >
            {isLastQuestion ? 'Submit' : 'Next'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSatisfactionTemplate;
