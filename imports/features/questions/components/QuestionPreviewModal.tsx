import React from 'react';

interface QuestionPreviewModalProps {
  question: any;
  open: boolean;
  onClose: () => void;
}

const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ question, open, onClose }) => {
  if (!open) return null;
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
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 800,
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Question Preview</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            &times;
          </button>
        </div>
        
        {question && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Question Text:</strong>
              <div style={{ fontSize: '1.1rem', marginTop: 8, padding: 12, background: '#f9f9f9', borderRadius: 8 }}>
                {question.text}
              </div>
            </div>
            
            {question.type && (
              <div style={{ marginBottom: 16 }}>
                <strong>Type:</strong> {question.type}
              </div>
            )}
            
            {question.options && question.options.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Options:</strong>
                <ul style={{ marginTop: 8 }}>
                  {question.options.map((option: string, idx: number) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {question.description && (
              <div style={{ marginBottom: 16 }}>
                <strong>Description:</strong>
                <div style={{ marginTop: 8 }}>{question.description}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
