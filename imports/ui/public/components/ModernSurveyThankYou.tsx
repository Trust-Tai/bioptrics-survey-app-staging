import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import '../components/ModernSurvey.css';

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
}

interface ModernSurveyThankYouProps {
  survey: Survey;
  color?: string;
  onRestart?: () => void;
}

const ThankYouContainer = styled.div`
  width: 100%;
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

const IconWrapper = styled.div<{ iconColor?: string }>`
  font-size: 60px;
  color: ${props => props.iconColor || '#552a47'};
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
  
  @keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  if (!color) return '#552a47';
  
  let usePound = false;
  
  if (color[0] === '#') {
    color = color.slice(1);
    usePound = true;
  }
  
  const num = parseInt(color, 16);
  
  let r = (num >> 16) + amount;
  r = Math.max(Math.min(255, r), 0);
  
  let g = ((num >> 8) & 0x00FF) + amount;
  g = Math.max(Math.min(255, g), 0);
  
  let b = (num & 0x0000FF) + amount;
  b = Math.max(Math.min(255, b), 0);
  
  return (usePound ? '#' : '') + (g | (r << 8) | (b << 16)).toString(16).padStart(6, '0');
};

// Convert hex color to RGB values for CSS variables
const hexToRgb = (hex: string): string => {
  if (!hex || hex === '') return '85, 42, 71'; // Default color
  
  // Remove the # if present
  hex = hex.replace('#', '');
  
  try {
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('Error parsing color:', error);
    return '85, 42, 71'; // Default color
  }
};

const ModernSurveyThankYou: React.FC<ModernSurveyThankYouProps> = ({ survey, color, onRestart }) => {
  const handleRestart = () => {
    // Call the onRestart callback if provided
    if (onRestart) {
      onRestart();
    }
  };

  const effectiveColor = color || survey.color || '#552a47';
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '85, 42, 71';
  const surveyImage = survey.featuredImage || survey.image || 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80';

  return (
    <ThankYouContainer>
      <div 
        className="modern-survey-container"
        style={{
          '--primary-color': effectiveColor,
          '--primary-color-rgb': primaryColorRgb,
          '--primary-dark': adjustColor(effectiveColor, -20)
        } as React.CSSProperties}
      >
        <div className="modern-survey-wrapper">
          {/* Left side image - same as question screen */}
          <div 
            className="modern-survey-sidebar"
            style={{ 
              backgroundImage: `url(${surveyImage})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="modern-survey-sidebar-overlay">
              <div className="sidebar-text-container">
                <h2>{survey.title}</h2>
                {survey.description && (
                  <p>{survey.description.replace(/<[^>]*>/g, '')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side content */}
          <div className="modern-survey-content">
            {survey.logo && (
              <div style={{ marginBottom: '20px', maxHeight: '60px' }}>
                <img 
                  src={survey.logo} 
                  alt={survey.title} 
                  style={{ maxHeight: '60px', objectFit: 'contain' }} 
                />
              </div>
            )}
            
            <div className="modern-survey-header">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <IconWrapper iconColor={effectiveColor}>
                  <FiCheckCircle />
                </IconWrapper>
              </div>
              <h1 className="modern-survey-question">Thank You!</h1>
            </div>
            
            <div style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', marginBottom: '40px' }}>
              Your responses have been successfully submitted. We appreciate your time and feedback.
            </div>
            
            <div className="modern-survey-actions">
              <button 
                className="modern-survey-button button-primary"
                onClick={handleRestart}
                style={{ 
                  '--primary-color': effectiveColor,
                  '--primary-dark': adjustColor(effectiveColor, -20)
                } as React.CSSProperties}
              >
                Restart Survey <FiRefreshCw style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThankYouContainer>
  );
};

export default ModernSurveyThankYou;
