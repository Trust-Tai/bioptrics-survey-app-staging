import React from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import '../components/ModernSurvey.css';

interface Section {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  priority?: number;
  color?: string;
  image?: string;
}

interface ModernSurveySectionProps {
  section: Section;
  onContinue: () => void;
  onBack: () => void;
  color?: string;
  image?: string;
  surveyTitle?: string;
  surveyDescription?: string;
}

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 900px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.color || '#552a47'};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 700px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }
`;

const SectionDescription = styled.div`
  font-size: 18px;
  color: #555;
  margin-bottom: 40px;
  line-height: 1.6;
  
  p {
    margin: 0 0 16px 0;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 30px;
    text-align: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
`;

const Button = styled.button<{ primary?: boolean; btnColor?: string }>`
  background: ${props => props.primary ? (props.btnColor || '#552a47') : 'transparent'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: ${props => props.primary ? 'none' : '2px solid #ddd'};
  border-radius: 50px;
  padding: ${props => props.primary ? '14px 28px' : '12px 24px'};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? (props.btnColor ? `${props.btnColor}dd` : '#6d3a5e') : '#f5f5f5'};
    transform: ${props => props.primary ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.primary ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

const ContentContainer = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 30px;
  }
`;

const DefaultImage = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#f5f5f5" />
    <path d="M300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150Z" fill="#552a47" fillOpacity="0.1" />
    <path d="M200 170C217.673 170 232 155.673 232 138C232 120.327 217.673 106 200 106C182.327 106 168 120.327 168 138C168 155.673 182.327 170 200 170Z" fill="#552a47" />
    <path d="M120 290C120 257.909 153.49 232 195 232C236.51 232 270 257.909 270 290C270 291.657 268.657 293 267 293H123C121.343 293 120 291.657 120 290Z" fill="#552a47" />
  </svg>
);

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

const ModernSurveySection: React.FC<ModernSurveySectionProps> = ({ 
  section, 
  onContinue, 
  onBack,
  color,
  image,
  surveyTitle,
  surveyDescription
}) => {
  // Safely parse HTML description if available
  const renderDescription = () => {
    if (!section.description) return null;
    
    // If description contains HTML
    if (section.description.includes('<')) {
      return <SectionDescription dangerouslySetInnerHTML={{ __html: section.description }} />;
    }
    
    // Plain text description
    return <SectionDescription>{section.description}</SectionDescription>;
  };

  const sectionImage = section.image || image || 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80';
  const effectiveColor = section.color || color || '#552a47';
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '85, 42, 71';

  return (
    <SectionContainer>
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
              backgroundImage: `url(${sectionImage})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="modern-survey-sidebar-overlay">
              <div className="sidebar-text-container">
              <h2>{surveyTitle}</h2>
                {surveyDescription && (
                  <p>{surveyDescription.replace(/<[^>]*>/g, '')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side content */}
          <div className="modern-survey-content">
            {/* Survey Title removed as requested */}
            
            <div className="modern-survey-header">
              <h1 className="modern-survey-question">{section.name}</h1>
            </div>
            
            {renderDescription()}
            
            {/* Survey Description removed as requested */}
            
            <div className="modern-survey-actions">
              <button 
                className="modern-survey-button button-secondary"
                onClick={onBack}
              >
                <FiArrowLeft /> Back
              </button>
              
              <button 
                className="modern-survey-button button-primary"
                onClick={onContinue}
                style={{ 
                  '--primary-color': effectiveColor,
                  '--primary-dark': adjustColor(effectiveColor, -20)
                } as React.CSSProperties}
              >
                Continue <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ModernSurveySection;
