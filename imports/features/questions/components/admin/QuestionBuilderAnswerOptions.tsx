import React, { useState, useCallback } from 'react';
import DraggableAnswerOption from './DraggableAnswerOption';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import update from 'immutability-helper';
import './QuestionBuilderAnswerOptions.css';

interface Answer {
  text: string;
  value?: string;
  image?: string;
  isOther?: boolean;
  isCorrect?: boolean;
}

interface QuestionBuilderAnswerOptionsProps {
  answerType: string;
  answers: Answer[];
  onAnswersChange: (answers: Answer[]) => void;
  disabled?: boolean;
  isAssessment?: boolean;
  onIsAssessmentChange?: (isAssessment: boolean) => void;
  correctAnswers?: any[];
  onCorrectAnswersChange?: (correctAnswers: any[]) => void;
  points?: number;
  onPointsChange?: (points: number) => void;
}

/**
 * Component for managing answer options with drag-and-drop reordering
 */
const QuestionBuilderAnswerOptions: React.FC<QuestionBuilderAnswerOptionsProps> = ({
  answerType,
  answers,
  onAnswersChange,
  disabled = false,
  isAssessment = false,
  onIsAssessmentChange = () => {},
  correctAnswers = [],
  onCorrectAnswersChange = () => {},
  points = 1,
  onPointsChange = () => {}
}) => {
  const [newAnswerText, setNewAnswerText] = useState('');
  const [showOtherOption, setShowOtherOption] = useState(
    answers.some(answer => answer.isOther)
  );

  // Handle moving an answer option
  const moveAnswer = useCallback((dragIndex: number, hoverIndex: number) => {
    onAnswersChange(
      update(answers, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, answers[dragIndex]],
        ],
      })
    );
  }, [answers, onAnswersChange]);

  // Handle adding a new answer option
  const handleAddAnswer = () => {
    if (!newAnswerText.trim()) return;
    
    const newAnswer = {
      text: newAnswerText.trim(),
      value: newAnswerText.trim()
    };
    
    onAnswersChange([...answers, newAnswer]);
    setNewAnswerText('');
  };

  // Handle updating an answer option
  const handleUpdateAnswer = (index: number, updatedAnswer: Answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = updatedAnswer;
    onAnswersChange(updatedAnswers);
  };

  // Handle removing an answer option
  const handleRemoveAnswer = (index: number) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    onAnswersChange(updatedAnswers);
  };

  // Handle toggling the "Other" option
  const handleToggleOtherOption = () => {
    const newShowOtherOption = !showOtherOption;
    setShowOtherOption(newShowOtherOption);
    
    if (newShowOtherOption) {
      // Add "Other" option if it doesn't exist
      if (!answers.some(answer => answer.isOther)) {
        onAnswersChange([
          ...answers,
          { text: 'Other (please specify)', isOther: true }
        ]);
      }
    } else {
      // Remove "Other" option if it exists
      const updatedAnswers = answers.filter(answer => !answer.isOther);
      onAnswersChange(updatedAnswers);
    }
  };

  // Determine if answer options are applicable for this question type
  const shouldShowAnswerOptions = () => {
    const typesWithOptions = [
      'radio', 'checkbox', 'dropdown', 'rating', 'likert', 'ranking'
    ];
    return typesWithOptions.includes(answerType);
  };

  // Check if this is a question type that doesn't need predefined options
  const isNoOptionsType = () => {
    const noOptionsTypes = ['text', 'date', 'number', 'email', 'phone', 'file', 'paragraph'];
    return noOptionsTypes.includes(answerType);
  };

  // Get helper text based on answer type
  const getHelperText = () => {
    switch (answerType) {
      case 'radio':
        return isAssessment 
          ? 'Add options for the respondent to select one answer. Mark the correct answer.'
          : 'Add options for the respondent to select one answer';
      case 'checkbox':
        return isAssessment 
          ? 'Add options for the respondent to select multiple answers. Mark all correct answers.'
          : 'Add options for the respondent to select multiple answers';
      case 'dropdown':
        return isAssessment 
          ? 'Add options for the dropdown menu. Mark the correct answer.'
          : 'Add options for the dropdown menu';
      case 'rating':
        return 'Add rating scale options (e.g., 1-5, Poor-Excellent)';
      case 'likert':
        return 'Add Likert scale statements and options';
      case 'ranking':
        return 'Add items for the respondent to rank in order';
      case 'text':
        return isAssessment 
          ? 'Enter the correct answer text for this question.'
          : 'Short text response field';
      case 'date':
        return isAssessment 
          ? 'Set the correct date for this question.'
          : 'Date selection field';
      default:
        return '';
    }
  };
  
  // Handle marking an answer as correct
  const handleMarkAsCorrect = (index: number, isCorrect: boolean) => {
    // For radio buttons and dropdown, only one answer can be correct
    if ((answerType === 'radio' || answerType === 'dropdown') && isCorrect) {
      const updatedAnswers = answers.map((answer, i) => ({
        ...answer,
        isCorrect: i === index
      }));
      onAnswersChange(updatedAnswers);
    } else {
      // For checkboxes, multiple answers can be correct
      const updatedAnswers = [...answers];
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        isCorrect
      };
      onAnswersChange(updatedAnswers);
    }
  };
  
  // Handle setting correct text answer
  const handleCorrectTextAnswer = (value: string) => {
    onCorrectAnswersChange([{ text: value }]);
  };
  
  // Handle setting correct date answer
  const handleCorrectDateAnswer = (value: string) => {
    onCorrectAnswersChange([{ date: value }]);
  };

  // Check if this question type supports assessment
  const supportsAssessment = () => {
    const assessmentTypes = ['radio', 'checkbox', 'dropdown', 'text', 'date'];
    return assessmentTypes.includes(answerType);
  };

  // Render assessment toggle
  const renderAssessmentToggle = () => {
    if (!supportsAssessment()) return null;
    
    return (
      <div className="assessment-toggle-container">
        <div className="assessment-toggle-row">
          <label className="assessment-toggle-label">
            <input
              type="checkbox"
              checked={isAssessment}
              onChange={(e) => onIsAssessmentChange(e.target.checked)}
              disabled={disabled}
            />
            <span>Enable Assessment Mode</span>
          </label>
          
          {isAssessment && (
            <div className="points-input">
              <label htmlFor="points">Points:</label>
              <input
                type="number"
                id="points"
                min="1"
                max="100"
                value={points}
                onChange={(e) => onPointsChange(parseInt(e.target.value) || 1)}
                disabled={disabled}
              />
            </div>
          )}
        </div>
        
        {isAssessment && (
          <div className="assessment-info">
            <FaInfoCircle />
            <span>Assessment mode allows you to mark correct answers for scoring.</span>
          </div>
        )}
      </div>
    );
  };

  // Render correct answer input for text questions
  const renderCorrectTextAnswer = () => {
    if (answerType !== 'text' || !isAssessment) return null;
    
    const correctAnswer = correctAnswers && correctAnswers.length > 0 ? correctAnswers[0].text : '';
    
    return (
      <div className="correct-text-answer">
        <label>Correct Answer:</label>
        <input
          type="text"
          value={correctAnswer || ''}
          onChange={(e) => handleCorrectTextAnswer(e.target.value)}
          placeholder="Enter the correct answer text"
          className="correct-answer-input"
          disabled={disabled}
        />
      </div>
    );
  };

  // Render correct answer input for date questions
  const renderCorrectDateAnswer = () => {
    if (answerType !== 'date' || !isAssessment) return null;
    
    const correctAnswer = correctAnswers && correctAnswers.length > 0 ? correctAnswers[0].date : '';
    
    return (
      <div className="correct-date-answer">
        <label>Correct Answer:</label>
        <input
          type="date"
          value={correctAnswer || ''}
          onChange={(e) => handleCorrectDateAnswer(e.target.value)}
          className="correct-answer-input"
          disabled={disabled}
        />
      </div>
    );
  };

  if (!shouldShowAnswerOptions()) {
    return (
      <div className="question-builder-answer-options">
        {renderAssessmentToggle()}
        {renderCorrectTextAnswer()}
        {renderCorrectDateAnswer()}
        <div className="no-answer-options-message">
          <FaInfoCircle />
          <p>This question type does not require predefined answer options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-builder-answer-options">
      {/* Assessment Toggle */}
      {renderAssessmentToggle()}
      
      {/* Correct Text Answer Input */}
      {renderCorrectTextAnswer()}
      
      {/* Correct Date Answer Input */}
      {renderCorrectDateAnswer()}
      
      {/* Answer Options Header */}
      <div className="answer-options-header">
        <h3>Answer Options</h3>
        <div className="helper-text">
          <FaInfoCircle /> {getHelperText()}
        </div>
      </div>
      
      {/* Answer Options List */}
      <div className="answer-options-list">
        {answers.map((answer, index) => (
          <div key={index} className="answer-option-row">
            <DraggableAnswerOption
              key={index}
              index={index}
              answer={answer}
              moveAnswer={moveAnswer}
              onUpdate={(updatedAnswer) => handleUpdateAnswer(index, updatedAnswer)}
              onRemove={() => handleRemoveAnswer(index)}
              disabled={disabled || answer.isOther}
            />
            
            {/* Correct Answer Checkbox */}
            {isAssessment && (answerType === 'radio' || answerType === 'checkbox' || answerType === 'dropdown') && (
              <div className="correct-answer-checkbox">
                <label>
                  <input
                    type={answerType === 'checkbox' ? 'checkbox' : 'radio'}
                    name="correctAnswer"
                    checked={!!answer.isCorrect}
                    onChange={(e) => handleMarkAsCorrect(index, e.target.checked)}
                    disabled={disabled || answer.isOther}
                  />
                  <span>Correct</span>
                </label>
              </div>
            )}
          </div>
        ))}
        
        {answers.length === 0 && (
          <div className="no-answers-message">
            No answer options added yet. Add your first option below.
          </div>
        )}
      </div>
      
      {/* Add Answer Section */}
      <div className="add-answer-section">
        <div className="add-answer-input-group">
          <input
            type="text"
            value={newAnswerText}
            onChange={(e) => setNewAnswerText(e.target.value)}
            placeholder="Enter new answer option..."
            className="add-answer-input"
            disabled={disabled}
          />
          <button
            className="add-answer-button"
            onClick={handleAddAnswer}
            disabled={!newAnswerText.trim() || disabled}
          >
            <FaPlus /> Add
          </button>
        </div>
        
        {(answerType === 'radio' || answerType === 'checkbox') && (
          <div className="other-option-toggle">
            <label>
              <input
                type="checkbox"
                checked={showOtherOption}
                onChange={handleToggleOtherOption}
                disabled={disabled}
              />
              <span>Include "Other" option</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilderAnswerOptions;
