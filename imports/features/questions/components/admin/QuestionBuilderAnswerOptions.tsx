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
}

interface QuestionBuilderAnswerOptionsProps {
  answerType: string;
  answers: Answer[];
  onAnswersChange: (answers: Answer[]) => void;
  disabled?: boolean;
}

/**
 * Component for managing answer options with drag-and-drop reordering
 */
const QuestionBuilderAnswerOptions: React.FC<QuestionBuilderAnswerOptionsProps> = ({
  answerType,
  answers,
  onAnswersChange,
  disabled = false
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

  // Get helper text based on answer type
  const getHelperText = () => {
    switch (answerType) {
      case 'radio':
        return 'Add options for the respondent to select one answer';
      case 'checkbox':
        return 'Add options for the respondent to select multiple answers';
      case 'dropdown':
        return 'Add options for the dropdown menu';
      case 'rating':
        return 'Add rating scale options (e.g., 1-5, Poor-Excellent)';
      case 'likert':
        return 'Add Likert scale statements and options';
      case 'ranking':
        return 'Add items for the respondent to rank in order';
      default:
        return '';
    }
  };

  if (!shouldShowAnswerOptions()) {
    return (
      <div className="no-answer-options-message">
        <FaInfoCircle />
        <p>This question type does not require predefined answer options.</p>
      </div>
    );
  }

  return (
    <div className="question-builder-answer-options">
      <div className="answer-options-header">
        <h3>Answer Options</h3>
        <div className="helper-text">
          <FaInfoCircle /> {getHelperText()}
        </div>
      </div>
      
      <div className="answer-options-list">
        {answers.map((answer, index) => (
          <DraggableAnswerOption
            key={index}
            index={index}
            answer={answer}
            moveAnswer={moveAnswer}
            onUpdate={(updatedAnswer) => handleUpdateAnswer(index, updatedAnswer)}
            onRemove={() => handleRemoveAnswer(index)}
            disabled={disabled || answer.isOther}
          />
        ))}
        
        {answers.length === 0 && (
          <div className="no-answers-message">
            No answer options added yet. Add your first option below.
          </div>
        )}
      </div>
      
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
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showOtherOption}
                onChange={handleToggleOtherOption}
                disabled={disabled}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Include "Other" option</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilderAnswerOptions;
