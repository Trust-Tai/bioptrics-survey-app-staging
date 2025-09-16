import React, { useEffect, useRef } from 'react';

interface ThemePreviewProps {
  theme: any;
  open: boolean;
  onClose: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, open, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (open && contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open || !theme) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div ref={contentRef} style={{
        backgroundColor: theme.backgroundColor || '#ffffff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 800,
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: theme.primaryColor || theme.color || '#552a47',
          padding: '20px',
          borderRadius: '8px 8px 0 0',
          marginBottom: '20px'
        }}>
          <h2 onClick={onClose} style={{
            color: '#fff',
            margin: 0,
            fontFamily: theme.headingFont || 'Inter, sans-serif'
          }}>
            {theme.name} Theme Preview
          </h2>
        </div>
        <div style={{
          fontFamily: theme.bodyFont || 'Inter, sans-serif',
          color: theme.textColor || '#333'
        }}>
          <h3 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Heading</h3>
          <p>This is how text will appear in your survey. The body font is {theme.bodyFont || 'Inter, sans-serif'} and the heading font is {theme.headingFont || 'Inter, sans-serif'}.</p>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Question</h4>
            <div style={{
              backgroundColor: theme.questionStyle === 'card' ? '#f9f9f9' : 'transparent',
              border: theme.questionStyle === 'bordered' ? `1px solid ${theme.accentColor || '#ddd'}` : 'none',
              padding: 15,
              borderRadius: 8,
              marginBottom: 15
            }}>
              <p>How would you rate your experience?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} style={{
                    backgroundColor: num === 3 ? theme.accentColor || theme.secondaryColor || '#f0e6ff' : 'transparent',
                    color: num === 3 ? '#fff' : theme.textColor || '#333',
                    border: `1px solid ${theme.accentColor || theme.secondaryColor || '#ddd'}`,
                    borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}>
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 30, borderTop: `1px solid ${theme.accentColor || theme.secondaryColor || '#ddd'}`, paddingTop: 20 }}>
            <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Theme Properties</h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}>
              <li>
                <strong>Primary Color:</strong> 
                <div style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme.primaryColor || theme.color || '#552a47', 
                  borderRadius: '4px', 
                  marginLeft: '8px',
                  verticalAlign: 'middle',
                  border: '1px solid #ddd'
                }}></div>
              </li>
              <li>
                <strong>Secondary Color:</strong> 
                <div style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme.secondaryColor || '#8e44ad', 
                  borderRadius: '4px', 
                  marginLeft: '8px',
                  verticalAlign: 'middle',
                  border: '1px solid #ddd'
                }}></div>
              </li>
              <li>
                <strong>Accent Color:</strong> 
                <div style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme.accentColor || '#9b59b6', 
                  borderRadius: '4px', 
                  marginLeft: '8px',
                  verticalAlign: 'middle',
                  border: '1px solid #ddd'
                }}></div>
              </li>
              <li>
                <strong>Background Color:</strong> 
                <div style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme.backgroundColor || '#ffffff', 
                  borderRadius: '4px', 
                  marginLeft: '8px',
                  verticalAlign: 'middle',
                  border: '1px solid #ddd'
                }}></div>
              </li>
              <li>
                <strong>Text Color:</strong> 
                <div style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme.textColor || '#2c3e50', 
                  borderRadius: '4px', 
                  marginLeft: '8px',
                  verticalAlign: 'middle',
                  border: '1px solid #ddd'
                }}></div>
              </li>
              <li><strong>Heading Font:</strong> {theme.headingFont || 'Inter'}</li>
              <li><strong>Body Font:</strong> {theme.bodyFont || 'Inter'}</li>
              <li><strong>Layout:</strong> {theme.layout || 'default'}</li>
              <li><strong>Button Style:</strong> {theme.buttonStyle || 'Rounded'}</li>
              <li><strong>Question Style:</strong> {theme.questionStyle || 'Card'}</li>
              <li><strong>Header Style:</strong> {theme.headerStyle || 'Solid'}</li>
              <li><strong>Template Type:</strong> {theme.templateType || 'Custom'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;


