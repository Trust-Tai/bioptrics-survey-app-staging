import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, FiPlus, FiMove } from 'react-icons/fi';
import { SurveySectionItem, QuestionItem } from '../../types';
import RichTextRenderer from './RichTextRenderer';

interface EnhancedSurveySectionProps {
  section: SurveySectionItem;
  questions: QuestionItem[];
  onEditSection: (section: SurveySectionItem) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddQuestion: (sectionId: string) => void;
  onRemoveQuestion: (questionId: string, sectionId: string) => void;
  onReorderQuestion: (sectionId: string, oldIndex: number, newIndex: number) => void;
}

const EnhancedSurveySection: React.FC<EnhancedSurveySectionProps> = ({
  section,
  questions,
  onEditSection,
  onDeleteSection,
  onAddQuestion,
  onRemoveQuestion,
  onReorderQuestion,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter questions that belong to this section
  const sectionQuestions = questions.filter(q => q.sectionId === section.id);
  
  // Handle drag and drop for question reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex !== targetIndex) {
      onReorderQuestion(section.id, sourceIndex, targetIndex);
    }
    setIsDragging(false);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div className="survey-section">
      <div 
        className="survey-section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="survey-section-title">
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          {section.name}
          {section.isRequired && (
            <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>
          )}
        </div>
        <div className="survey-section-actions">
          <button 
            className="btn btn-icon btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEditSection(section);
            }}
          >
            <FiEdit2 />
          </button>
          <button 
            className="btn btn-icon btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection(section.id);
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="survey-section-content">
          {section.description && (
            <div className="survey-section-description">
              {section.description}
            </div>
          )}
          
          <div className="survey-section-questions">
            {sectionQuestions.length > 0 ? (
              sectionQuestions.map((question, index) => (
                <div 
                  key={question.id}
                  className={`survey-section-question ${isDragging ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="survey-section-question-drag-handle">
                    <FiMove />
                  </div>
                  <div className="survey-section-question-title">
                    <RichTextRenderer content={question.text} />
                  </div>
                  <div className="survey-section-question-actions">
                    <button 
                      className="btn btn-icon btn-secondary"
                      onClick={() => onRemoveQuestion(question.id, section.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="survey-section-empty">
                No questions added to this section yet.
              </div>
            )}
            
            <div 
              className="survey-section-add-question"
              onClick={() => onAddQuestion(section.id)}
            >
              <FiPlus /> Add Question
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSurveySection;
