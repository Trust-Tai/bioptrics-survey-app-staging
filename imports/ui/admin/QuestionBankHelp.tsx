import React from 'react';

const QuestionBankHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    width: 420,
    height: '100vh',
    background: '#fff',
    boxShadow: '-2px 0 16px rgba(85,42,71,0.08)',
    zIndex: 9999,
    padding: '2.5rem 2rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInRight 0.3s',
  }}>
    <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 26, color: '#552a47', cursor: 'pointer', marginBottom: 12 }} title="Close">×</button>
    <h2 style={{ color: '#552a47', fontWeight: 700, fontSize: 26, marginBottom: 18 }}>How to Use the Question Bank</h2>
    <div style={{ color: '#333', fontSize: 17, lineHeight: 1.7 }}>
      <ol style={{ paddingLeft: 20 }}>
        <li><b>Add Questions:</b> Enter a title and (optionally) a description, then click <b>Add Question</b>. Your questions will appear in the list below.</li>
        <li><b>View All Questions:</b> Use the "View All Questions" link to see a dedicated list of all questions added so far.</li>
        <li><b>Persistence:</b> Questions are saved in your browser's local storage. They will remain even if you refresh or leave the page (unless you clear your browser data).</li>
        <li><b>Editing/Deleting:</b> (Not yet available) Future versions can allow you to edit or delete questions.</li>
      </ol>
      <div style={{ marginTop: 16, color: '#552a47', fontWeight: 600 }}>
        Tip: Use the Question Bank to manage survey or quiz questions for your users!
      </div>
    </div>
  </div>
);

export default QuestionBankHelp;
