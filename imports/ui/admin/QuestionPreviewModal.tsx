import React from 'react';
import DOMPurify from 'dompurify';

interface QuestionPreviewModalProps {
  question: any;
  open: boolean;
  onClose: () => void;
}

const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ question, open, onClose }) => {
  if (!open) return null;
  
  // Helper function to sanitize and strip HTML
  const stripHtml = (html: string) => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  // Format question title for the modal header
  const questionTitle = stripHtml(question.text || question.questionText || '');
  const formattedTitle = questionTitle.length > 50 ? `${questionTitle.substring(0, 50)}...` : questionTitle;
  
  // Get category and theme names
  const categoryName = question.categoryName || (question.category && `${question.category}`) || '';
  
  // Handle theme data from different possible sources
  let themeNames = [];
  if (Array.isArray(question.surveyThemeNames) && question.surveyThemeNames.length > 0) {
    themeNames = question.surveyThemeNames;
  } else if (Array.isArray(question.themeNames) && question.themeNames.length > 0) {
    themeNames = question.themeNames;
  } else if (Array.isArray(question.surveyThemes) && question.surveyThemes.length > 0) {
    themeNames = question.surveyThemes;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(40,33,30,0.22)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        minWidth: 350,
        maxWidth: 580,
        padding: '36px 36px 28px 36px',
        boxShadow: '0 6px 32px #552a4733',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#552a47', cursor: 'pointer' }} title="Close">×</button>
        <div style={{ fontWeight: 700, fontSize: 19, color: '#552a47', marginBottom: 14 }}>
          Question Preview: {formattedTitle}
        </div>
        
        {/* Status */}
        <div style={{ 
          display: 'inline-block',
          marginBottom: 16,
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 500,
          background: question.status === 'published' ? '#e6f7e6' : '#ffebee',
          color: question.status === 'published' ? '#2e7d32' : '#c62828'
        }}>
          Status: {question.status || 'draft'}
        </div>
        
        {/* Question Text */}
        <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 16, color: '#28211e' }}>
          {question.text || question.questionText}
        </div>
        
        {/* Description */}
        {(question.description || question.questionDescription) && (
          <div style={{ marginBottom: 16, color: '#6e5a67', fontSize: 15 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Description:</div>
            <div dangerouslySetInnerHTML={{ __html: question.description || question.questionDescription }} />
          </div>
        )}
        
        {/* Category and Theme */}
        <div style={{ marginBottom: 16, fontSize: 14 }}>
          {categoryName && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500, color: '#28211e' }}>Category:</span>
              <span style={{ color: '#6e5a67', marginLeft: 6 }}>{categoryName}</span>
            </div>
          )}
          {Array.isArray(themeNames) && themeNames.length > 0 && (
            <div>
              <span style={{ fontWeight: 500, color: '#28211e' }}>Themes:</span>
              <span style={{ color: '#6e5a67', marginLeft: 6 }}>{themeNames.join(', ')}</span>
            </div>
          )}
        </div>
        
        {/* Image */}
        {question.image && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Image:</div>
            <img src={question.image} alt="Featured" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #CACACA' }} />
          </div>
        )}
        
        {/* Question Type */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 500, color: '#1da463', fontSize: 15 }}>Type:</span> {question.answerType || question.responseType}
        </div>
        
        {/* Multiple Choice Options */}
        {['multiple_choice','checkbox','dropdown','quick_tabs'].includes(question.answerType || question.responseType) && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 500, color: '#28211e', fontSize: 15 }}>Options:</span>
            <ul style={{ margin: '6px 0 0 18px', color: '#444', fontSize: 15 }}>
              {(question.answers || question.options || []).map((a: any, idx: number) => (
                <li key={idx}>{typeof a === 'string' ? a : a.text || a.value || a}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Likert Scale */}
        {(question.answerType === 'likert' || question.responseType === 'likert') && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 500, color: '#28211e', fontSize: 15 }}>Likert Scale:</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ color: '#888' }}>{question.leftLabel}</span>
              {(question.answers || question.options || []).map((option: any, idx: number) => (
                <span key={idx} style={{ background: '#f5f5f5', border: '1px solid #CACACA', borderRadius: 5, padding: '3px 10px', fontWeight: 500 }}>
                  {typeof option === 'string' ? option : option.text || option.value || option}
                </span>
              ))}
              <span style={{ color: '#888' }}>{question.rightLabel}</span>
            </div>
          </div>
        )}
        
        {/* Text Answer Types */}
        {(question.answerType === 'long_text' || question.responseType === 'long_text') && (
          <div style={{ marginBottom: 16, color: '#888', fontSize: 15 }}><em>Long text answer preview</em></div>
        )}
        {(question.answerType === 'short_text' || question.responseType === 'short_text') && (
          <div style={{ marginBottom: 16, color: '#888', fontSize: 15 }}><em>Short text answer preview</em></div>
        )}
        
        {/* Required */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 500, color: '#28211e', fontSize: 15 }}>Required:</span> {question.required ? 'Yes' : 'No'}
        </div>
        
        {/* Feedback */}
        {(question.feedbackType && question.feedbackType !== 'none') && (
          <div style={{ marginTop: 18, padding: '10px 0 0 0', borderTop: '1px solid #e0e0e0' }}>
            <span style={{ fontWeight: 600, color: '#552a47', fontSize: 15 }}>Feedback Required:</span> <span style={{ color: '#28211e', fontSize: 15 }}>{question.feedbackType}</span>
            {question.feedbackType === 'text' && question.feedbackValue && (
              <div style={{ marginTop: 4, color: '#6e5a67', fontSize: 15 }}>Prompt: {question.feedbackValue}</div>
            )}
          </div>
        )}
        
        {/* Additional Metadata */}
        <div style={{ marginTop: 18, padding: '10px 0 0 0', borderTop: '1px solid #e0e0e0', fontSize: 14, color: '#666' }}>
          {question.isReusable !== undefined && <div>Reusable: {question.isReusable ? 'Yes' : 'No'}</div>}
          {question.isActive !== undefined && <div>Active: {question.isActive !== false ? 'Yes' : 'No'}</div>}
          {question.version !== undefined && <div>Version: {question.version}</div>}
        </div>
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
