import React from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

interface Section {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  priority?: number;
  color?: string;
}

interface ModernSurveySectionProps {
  section: Section;
  onContinue: () => void;
  onBack: () => void;
  color?: string;
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

const SectionCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 700px;
  position: relative;
  overflow: hidden;
  
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
    padding: 30px;
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
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
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

const ModernSurveySection: React.FC<ModernSurveySectionProps> = ({ 
  section, 
  onContinue, 
  onBack,
  color
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

  return (
    <SectionContainer>
      <SectionCard color={section.color || color}>
        <SectionTitle>{section.name}</SectionTitle>
        
        {renderDescription()}
        
        <ButtonContainer>
          <Button onClick={onBack}>
            <FiArrowLeft /> Back
          </Button>
          
          <Button 
            primary 
            btnColor={section.color || color}
            onClick={onContinue}
          >
            Continue <FiArrowRight />
          </Button>
        </ButtonContainer>
      </SectionCard>
    </SectionContainer>
  );
};

export default ModernSurveySection;
