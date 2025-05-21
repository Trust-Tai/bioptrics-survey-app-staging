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
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        minWidth: 350,
        maxWidth: 480,
        padding: '36px 36px 28px 36px',
        boxShadow: '0 6px 32px #552a4733',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#552a47', cursor: 'pointer' }} title="Close">×</button>
        <div style={{ fontWeight: 700, fontSize: 19, color: '#552a47', marginBottom: 14 }}>Question Preview</div>
        <div style={{ marginBottom: 10, fontWeight: 600, fontSize: 16, color: '#28211e' }}>{question.text}</div>
        {question.description && (
          <div style={{ marginBottom: 12, color: '#6e5a67', fontSize: 15 }} dangerouslySetInnerHTML={{ __html: question.description }} />
        )}
        {question.image && (
          <div style={{ marginBottom: 12 }}>
            <img src={question.image} alt="Featured" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #CACACA' }} />
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 500, color: '#1da463', fontSize: 15 }}>Type:</span> {question.answerType}
        </div>
        {['multiple_choice','checkbox','dropdown','quick_tabs'].includes(question.answerType) && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#28211e', fontSize: 15 }}>Options:</span>
            <ul style={{ margin: '6px 0 0 18px', color: '#444', fontSize: 15 }}>
              {question.answers.map((a: string, idx: number) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>
        )}
        {question.answerType === 'likert' && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#28211e', fontSize: 15 }}>Likert Scale:</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ color: '#888' }}>{question.leftLabel}</span>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ background: '#f5f5f5', border: '1px solid #CACACA', borderRadius: 5, padding: '3px 10px', fontWeight: 500 }}>{n}</span>
              ))}
              <span style={{ color: '#888' }}>{question.rightLabel}</span>
            </div>
          </div>
        )}
        {question.answerType === 'long_text' && (
          <div style={{ marginBottom: 10, color: '#888', fontSize: 15 }}><em>Long text answer preview</em></div>
        )}
        {question.answerType === 'short_text' && (
          <div style={{ marginBottom: 10, color: '#888', fontSize: 15 }}><em>Short text answer preview</em></div>
        )}
        {question.feedbackType && question.feedbackType !== 'none' && (
          <div style={{ marginTop: 18, padding: '10px 0 0 0', borderTop: '1px solid #e0e0e0' }}>
            <span style={{ fontWeight: 600, color: '#552a47', fontSize: 15 }}>Feedback Required:</span> <span style={{ color: '#28211e', fontSize: 15 }}>{question.feedbackType}</span>
            {question.feedbackType === 'text' && question.feedbackValue && (
              <div style={{ marginTop: 4, color: '#6e5a67', fontSize: 15 }}>Prompt: {question.feedbackValue}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
