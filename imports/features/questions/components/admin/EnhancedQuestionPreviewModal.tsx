import React, { useState } from 'react';
import { Question } from '/imports/features/questions/api/questions.methods.client';
import { FaTimes, FaMobileAlt, FaTabletAlt, FaDesktop } from 'react-icons/fa';
import './QuestionPreviewModal.css';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const EnhancedQuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  question 
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');

  if (!isOpen) return null;

  const handleAnswerSelection = (answer: string) => {
    if (question.answerType === 'checkbox') {
      // For checkbox, handle multiple selections
      const currentAnswers = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
      const answerIndex = currentAnswers.indexOf(answer);
      
      if (answerIndex >= 0) {
        currentAnswers.splice(answerIndex, 1);
      } else {
        currentAnswers.push(answer);
      }
      
      setSelectedAnswer(currentAnswers);
    } else {
      // For single selection answers
      setSelectedAnswer(answer);
    }
    setIsAnswered(true);
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSelectedAnswer(e.target.value);
    setIsAnswered(!!e.target.value);
  };

  const renderAnswerOptions = () => {
    switch (question.answerType) {
      case 'multiple_choice':
        return (
          <div className="preview-answer-options">
            {question.answers.map((answer, index) => (
              <div key={index} className="preview-radio-option">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="preview-answer"
                  value={answer}
                  checked={selectedAnswer === answer}
                  onChange={() => handleAnswerSelection(answer)}
                />
                <label htmlFor={`option-${index}`}>{answer}</label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="preview-answer-options">
            {question.answers.map((answer, index) => (
              <div key={index} className="preview-checkbox-option">
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  name="preview-answer"
                  value={answer}
                  checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(answer)}
                  onChange={() => handleAnswerSelection(answer)}
                />
                <label htmlFor={`option-${index}`}>{answer}</label>
              </div>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select 
            className="preview-dropdown"
            value={selectedAnswer as string}
            onChange={(e) => {
              setSelectedAnswer(e.target.value);
              setIsAnswered(!!e.target.value);
            }}
          >
            <option value="">-- Select an option --</option>
            {question.answers.map((answer, index) => (
              <option key={index} value={answer}>{answer}</option>
            ))}
          </select>
        );
      
      case 'rating_scale':
        return (
          <div className="preview-rating-scale">
            <div className="rating-scale-labels">
              <span>{question.leftLabel || 'Poor'}</span>
              <span>{question.rightLabel || 'Excellent'}</span>
            </div>
            <div className="rating-scale-options">
              {question.answers.map((answer, index) => (
                <div 
                  key={index} 
                  className={`rating-option ${selectedAnswer === answer ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelection(answer)}
                >
                  {answer}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'likert_scale':
        return (
          <div className="preview-likert-scale">
            <table className="likert-table">
              <thead>
                <tr>
                  <th></th>
                  {question.answers.map((answer, index) => (
                    <th key={index}>{answer}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your response:</td>
                  {question.answers.map((answer, index) => (
                    <td key={index}>
                      <input
                        type="radio"
                        name="likert-response"
                        checked={selectedAnswer === answer}
                        onChange={() => handleAnswerSelection(answer)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      
      case 'text':
        return (
          <input
            type="text"
            className="preview-text-input"
            placeholder="Type your answer here..."
            value={selectedAnswer as string}
            onChange={handleTextInput}
          />
        );
      
      case 'long_text':
        return (
          <textarea
            className="preview-textarea"
            placeholder="Type your answer here..."
            value={selectedAnswer as string}
            onChange={handleTextInput}
            rows={4}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            className="preview-date-input"
            value={selectedAnswer as string}
            onChange={handleTextInput}
          />
        );
      
      case 'file_upload':
        return (
          <div className="preview-file-upload">
            <input
              type="file"
              className="preview-file-input"
              onChange={() => setIsAnswered(true)}
            />
            <p className="file-upload-help">Select a file to upload</p>
          </div>
        );
      
      case 'yes_no':
        return (
          <div className="preview-answer-options yes-no-options">
            {['Yes', 'No'].map((answer, index) => (
              <div key={index} className="preview-radio-option">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="preview-answer"
                  value={answer}
                  checked={selectedAnswer === answer}
                  onChange={() => handleAnswerSelection(answer)}
                />
                <label htmlFor={`option-${index}`}>{answer}</label>
              </div>
            ))}
          </div>
        );
      
      case 'true_false':
        return (
          <div className="preview-answer-options true-false-options">
            {['True', 'False'].map((answer, index) => (
              <div key={index} className="preview-radio-option">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="preview-answer"
                  value={answer}
                  checked={selectedAnswer === answer}
                  onChange={() => handleAnswerSelection(answer)}
                />
                <label htmlFor={`option-${index}`}>{answer}</label>
              </div>
            ))}
          </div>
        );
      
      default:
        return <p>This question type is not supported in preview.</p>;
    }
  };

  const renderFeedbackSection = () => {
    if (!question.collectFeedback) return null;
    
    return (
      <div className="preview-feedback-section">
        <h4>Feedback</h4>
        <p>{question.feedbackPrompt || 'Please provide feedback for this question:'}</p>
        
        {question.feedbackType === 'text' && (
          <textarea
            className="preview-feedback-textarea"
            placeholder="Enter your feedback here..."
            rows={3}
          />
        )}
        
        {question.feedbackType === 'rating' && (
          <div className="preview-feedback-rating">
            {[1, 2, 3, 4, 5].map(rating => (
              <button key={rating} className="rating-button">
                {rating}
              </button>
            ))}
          </div>
        )}
        
        {question.feedbackType === 'file' && (
          <div className="preview-feedback-file">
            <input type="file" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="enhanced-preview-modal-overlay">
      <div className={`enhanced-preview-modal device-${deviceType}`}>
        <div className="preview-modal-header">
          <h2>Question Preview</h2>
          <div className="device-switcher">
            <button 
              className={`device-button ${deviceType === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceType('mobile')}
              title="Mobile view"
            >
              <FaMobileAlt />
            </button>
            <button 
              className={`device-button ${deviceType === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceType('tablet')}
              title="Tablet view"
            >
              <FaTabletAlt />
            </button>
            <button 
              className={`device-button ${deviceType === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceType('desktop')}
              title="Desktop view"
            >
              <FaDesktop />
            </button>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="preview-device-frame">
          <div className="preview-content">
            <div className="preview-question-content">
              <div 
                className="preview-question-text"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
              
              {question.description && (
                <div 
                  className="preview-question-description"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              )}
              
              {question.image && (
                <div className="preview-question-image">
                  <img src={question.image} alt="Question visual" />
                </div>
              )}
              
              <div className="preview-answer-section">
                {renderAnswerOptions()}
              </div>
              
              {renderFeedbackSection()}
              
              <div className="preview-navigation">
                <button className="preview-back-button">Back</button>
                <button 
                  className={`preview-next-button ${!isAnswered && question.required ? 'disabled' : ''}`}
                  disabled={!isAnswered && question.required}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="preview-modal-footer">
          <div className="preview-meta-info">
            <div className="preview-info-item">
              <span className="info-label">Question Type:</span>
              <span className="info-value">{question.answerType.replace('_', ' ')}</span>
            </div>
            <div className="preview-info-item">
              <span className="info-label">Required:</span>
              <span className="info-value">{question.required ? 'Yes' : 'No'}</span>
            </div>
            {question.collectFeedback && (
              <div className="preview-info-item">
                <span className="info-label">Feedback:</span>
                <span className="info-value">{question.feedbackType}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuestionPreviewModal;
