import React, { useState, useCallback } from 'react';
import DraggableAnswerOption from './DraggableAnswerOption';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import update from 'immutability-helper';
import './QuestionBuilderAnswerOptions.css';

// Emoji Selector Component for Likert questions
const EmojiSelector: React.FC<{
  selectedEmoji: string;
  onChange: (optionIndex: number, emoji: string) => void;
  optionIndex: number;
}> = ({ selectedEmoji, onChange, optionIndex }) => {
  const emojiOptions = [
    { value: '', label: 'No Emoji' },
    { value: '😡', label: '😡 Angry' },
    { value: '😠', label: '😠 Mad' },
    { value: '😟', label: '😟 Worried' },
    { value: '😕', label: '😕 Confused' },
    { value: '😔', label: '😔 Sad' },
    { value: '😶', label: '😶 Neutral' },
    { value: '🙂', label: '🙂 Slight Smile' },
    { value: '😊', label: '😊 Happy' },
    { value: '😄', label: '😄 Grinning' },
    { value: '🥰', label: '🥰 Love' },
    { value: '👍', label: '👍 Thumbs Up' },
    { value: '👎', label: '👎 Thumbs Down' },
    { value: '⭐', label: '⭐ Star' },
    { value: '❤️', label: '❤️ Heart' },
    { value: '💯', label: '💯 Perfect' }
  ];

  return (
    <select 
      className="emoji-selector"
      value={selectedEmoji || ''}
      onChange={(e) => onChange(optionIndex, e.target.value)}
    >
      {emojiOptions.map(emoji => (
        <option key={emoji.value} value={emoji.value}>
          {emoji.label}
        </option>
      ))}
    </select>
  );
};

// Specialized Likert Answer Option Row
const LikertAnswerOptionRow: React.FC<{
  option: Answer;
  index: number;
  onChange: (index: number, updatedAnswer: Answer) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}> = ({ option, index, onChange, onRemove, disabled = false }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...option, text: e.target.value });
  };

  const handleEmojiChange = (optionIndex: number, emoji: string) => {
    onChange(index, { ...option, emoji: emoji });
  };

  return (
    <div className="likert-answer-option-row">
      {/* Text Input */}
      <div className="text-input-wrapper">
        <input 
          type="text"
          value={option.text}
          onChange={handleTextChange}
          placeholder={`Enter option ${index + 1} text...`}
          className="option-text-input"
          disabled={disabled}
        />
      </div>

      {/* Emoji Selector */}
      <div className="emoji-selector-wrapper">
        <EmojiSelector 
          selectedEmoji={option.emoji || ''}
          onChange={handleEmojiChange}
          optionIndex={index}
        />
      </div>

      {/* Remove Button */}
      <button 
        className="remove-option-btn"
        onClick={() => onRemove(index)}
        type="button"
        title="Remove this option"
        disabled={disabled}
      >
        ✕
      </button>
    </div>
  );
};

// Helper function to get default emoji for text (backward compatibility)
const getDefaultEmojiForText = (text: string, index: number, totalOptions: number): string => {
  const lowerText = (text || '').toLowerCase();
  
  // Text-based matching
  if (lowerText.includes('strongly disagree')) return '😡';
  if (lowerText.includes('disagree') && !lowerText.includes('strongly')) return '😕';
  if (lowerText.includes('neither') || lowerText.includes('neutral')) return '😶';
  if (lowerText.includes('agree') && !lowerText.includes('strongly')) return '😊';
  if (lowerText.includes('strongly agree')) return '🥰';
  
  // Position-based fallback
  const emojiScale = ['😡', '😕', '😶', '😊', '🥰'];
  if (totalOptions <= emojiScale.length) {
    return emojiScale[index] || '😶';
  }
  
  return '😶'; // Default
};

interface Answer {
  text: string;
  value?: string;
  image?: string;
  isOther?: boolean;
  isCorrect?: boolean;
  emoji?: string; // Add emoji property for Likert questions
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
    answers && Array.isArray(answers) ? answers.some(answer => answer.isOther) : false
  );

  // Handle moving an answer option
  const moveAnswer = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!answers || !Array.isArray(answers)) return;
    
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
    
    onAnswersChange([...(answers || []), newAnswer]);
    setNewAnswerText('');
  };

  // Handle updating an answer option
  const handleUpdateAnswer = (index: number, updatedAnswer: Answer) => {
    if (!answers || !Array.isArray(answers)) return;
    
    const updatedAnswers = [...answers];
    updatedAnswers[index] = updatedAnswer;
    onAnswersChange(updatedAnswers);
  };

  // Handle removing an answer option
  const handleRemoveAnswer = (index: number) => {
    if (!answers || !Array.isArray(answers)) return;
    
    const updatedAnswers = answers.filter((_, i) => i !== index);
    onAnswersChange(updatedAnswers);
  };

  // Handle toggling the "Other" option
  const handleToggleOtherOption = () => {
    const newShowOtherOption = !showOtherOption;
    setShowOtherOption(newShowOtherOption);
    
    if (!answers || !Array.isArray(answers)) {
      if (newShowOtherOption) {
        // If answers is undefined, initialize with just the Other option
        onAnswersChange([{ text: 'Other (please specify)', isOther: true }]);
      }
      return;
    }
    
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
      if (answers && Array.isArray(answers)) {
        const updatedAnswers = answers.filter(answer => !answer.isOther);
        onAnswersChange(updatedAnswers);
      }
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
    const noOptionsTypes = ['text', 'textarea', 'date', 'number', 'email', 'phone', 'file', 'paragraph'];
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
        return 'Add Likert scale options with emojis. Choose an emoji and enter text for each option.';
      case 'ranking':
        return 'Add items for the respondent to rank in order';
      case 'text':
        return isAssessment 
          ? 'Enter the correct answer text for this question.'
          : 'Short text response field';
      case 'textarea':
        return 'Long text response field';
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
    // const assessmentTypes = ['radio', 'checkbox', 'dropdown', 'text', 'date'];
    const assessmentTypes = ['null'];
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
        <label>Answer Options</label>
        <div className="helper-text">
          <FaInfoCircle /> {getHelperText()}
        </div>
      </div>
      
      {/* Answer Options List */}
      <div className="answer-options-list">
        {answerType === 'likert' ? (
          // Special handling for Likert questions with emoji selectors
          <>
            {answers.map((answer, index) => {
              // Ensure backward compatibility - add emoji if missing
              const answerWithEmoji = {
                ...answer,
                emoji: answer.emoji || getDefaultEmojiForText(answer.text, index, answers.length)
              };
              
              return (
                <LikertAnswerOptionRow
                  key={index}
                  option={answerWithEmoji}
                  index={index}
                  onChange={handleUpdateAnswer}
                  onRemove={handleRemoveAnswer}
                  disabled={disabled || answer.isOther}
                />
              );
            })}
            
            {answers.length === 0 && (
              <div className="no-answers-message">
                No Likert scale options added yet. Add your first option below.
              </div>
            )}
          </>
        ) : (
          // Regular handling for other question types
          <>
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
                  isAssessment={isAssessment}
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
          </>
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
