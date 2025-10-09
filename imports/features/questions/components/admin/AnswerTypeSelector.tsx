import React from 'react';
import { 
  FaListUl, FaCheckSquare, FaCaretDown, FaFont, FaAlignLeft, 
  FaStar, FaBalanceScale, FaSortAmountDown, FaCalendarAlt,
  FaCircle, FaThumbsUp, FaRegCircle
} from 'react-icons/fa';
import './AnswerTypeSelector.css';

interface AnswerTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const answerTypes = [
  { id: 'radio', label: 'Single Choice', icon: <FaRegCircle /> },
  { id: 'checkbox', label: 'Multiple Choice', icon: <FaCheckSquare /> },
  { id: 'dropdown', label: 'Dropdown', icon: <FaCaretDown /> },
  { id: 'text', label: 'Short Text', icon: <FaFont /> },
  { id: 'textarea', label: 'Long Text', icon: <FaAlignLeft /> },
  { id: 'rating', label: 'Rating Scale', icon: <FaStar /> },
  { id: 'likert', label: 'Likert Scale', icon: <FaThumbsUp /> },
  { id: 'ranking', label: 'Ranking', icon: <FaSortAmountDown /> },
  { id: 'date', label: 'Date', icon: <FaCalendarAlt /> }
];

const AnswerTypeSelector: React.FC<AnswerTypeSelectorProps> = ({ 
  selectedType, 
  onChange,
  disabled = false
}) => {
  return (
    <div className="answer-type-selector">
      <div className="answer-type-grid">
        {answerTypes.map((type) => (
          <div 
            key={type.id}
            className={`answer-type-card ${selectedType === type.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onChange(type.id)}
            title={type.label}
          >
            <div className="answer-type-icon">{type.icon}</div>
            <div className="answer-type-label">{type.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerTypeSelector;
