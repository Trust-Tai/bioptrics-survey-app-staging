import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
      <h1>Welcome to the Survey App</h1>
      <p>Click below to begin your survey.</p>
      <button style={{ padding: '1em 2em', fontSize: 18, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/survey')}>
        Next
      </button>
    </div>
  );
};

export default Welcome;
