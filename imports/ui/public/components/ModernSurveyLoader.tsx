import React from 'react';
import styled from 'styled-components';
import '../components/ModernSurvey.css';

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

const LoaderContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  border-radius: 8px;
  background-color: transparent;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 4px solid rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ModernSurveyLoaderProps {
  color?: string;
}

const ModernSurveyLoader: React.FC<ModernSurveyLoaderProps> = ({ 
  color = '#552a47'
}) => {
  const effectiveColor = color || '#552a47';
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '85, 42, 71';

  return (
    <LoaderContainer>
      <div 
        style={{
          '--primary-color': effectiveColor,
          '--primary-color-rgb': primaryColorRgb,
          '--primary-dark': adjustColor(effectiveColor, -20)
        } as React.CSSProperties}
      >
        <LoaderContent>
          <Spinner />
        </LoaderContent>
      </div>
    </LoaderContainer>
  );
};

export default ModernSurveyLoader;
