import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiCircle, FiUsers, FiStar, FiBriefcase, FiHeart, FiClock } from 'react-icons/fi';
import { MdOutlineWorkOutline } from 'react-icons/md';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { BiLoaderCircle } from 'react-icons/bi';

interface SectionItem {
  id: string;
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  icon?: React.ReactNode;
  progress?: number; // Section completion percentage
}

interface SidebarNavigationProps {
  sections: SectionItem[];
  currentSectionId: string;
  progress: number; // percentage
  onSectionClick: (sectionId: string) => void;
  color?: string; // Kept for backward compatibility
  logo?: string; // URL to the logo image
  surveyTitle?: string; // Survey title
  averageTime?: string; // Average completion time
  deferHighlighting?: boolean; // If true, don't update active section until parent confirms
  onSetActiveSection?: (callback: (sectionId: string) => void) => void; // Method to provide a callback for setting active section
  currentQuestionNumber?: number; // Current question number across all sections
  totalQuestions?: number; // Total number of questions in the survey
}

// Helper function to get the appropriate icon for each section
const getDefaultIcon = (sectionName: string) => {
  const name = sectionName.toLowerCase();
  if (name.includes('work') || name.includes('environment')) return <MdOutlineWorkOutline size={18} />;
  if (name.includes('leadership')) return <FiUsers size={18} />;
  if (name.includes('career') || name.includes('development')) return <FiBriefcase size={18} />;
  if (name.includes('team') || name.includes('teamwork')) return <FiStar size={18} />;
  if (name.includes('well') || name.includes('being') || name.includes('employee')) return <FiHeart size={18} />;
  if (name.includes('design') || name.includes('accessibility')) return <FiCircle size={18} />;
  if (name.includes('inclusive')) return <FiCircle size={18} />;
  return <FiCircle size={18} />;
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sections,
  currentSectionId,
  progress,
  onSectionClick,
  color = '#552A47', // Kept for backward compatibility
  logo,
  surveyTitle,
  averageTime,
  deferHighlighting = false,
  onSetActiveSection,
  currentQuestionNumber,
  totalQuestions
}) => {
  // Use state to track the active section
  const [activeSection, setActiveSection] = useState<string>(currentSectionId || (sections.length > 0 ? sections[0].id : ''));
  
  // Update active section when currentSectionId changes, but only on initial render
  useEffect(() => {
    if (currentSectionId) {
      setActiveSection(currentSectionId);
    } else if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, []); // Empty dependency array - only run on mount
  
  // Expose setActiveSection to parent component if onSetActiveSection is provided
  // Using a stable reference pattern to avoid infinite loops
  const stableSetActiveSection = useRef((sectionId: string) => {
    setActiveSection(sectionId);
  });
  
  // Only register the callback once when the component mounts
  useEffect(() => {
    if (onSetActiveSection) {
      onSetActiveSection(stableSetActiveSection.current);
    }
  }, [onSetActiveSection]);
  
  // Handle section click
  const handleSectionClick = (sectionId: string) => {
    // Only update the local state immediately if not deferring highlighting
    if (!deferHighlighting) {
      setActiveSection(sectionId);
    }
    // Call the parent's click handler
    onSectionClick(sectionId);
  };
  return (
    <SidebarContainer>
      {/* <LogoContainer>
        {logo ? (
          <LogoImage src={logo} alt="TeamsynerG Logo" />
        ) : (
          <>
            <LogoText>TeamsynerG</LogoText>
            <LogoSubtext>GLOBAL CONSULTING</LogoSubtext>
          </>
        )}
      </LogoContainer> */}
      
      {/* Title section removed as requested */}
      
      <SectionsList>
        {sections.map((section, index) => {
          const icon = section.icon || getDefaultIcon(section.name);
          return (
            <SectionItem 
              key={section.id}
              isActive={section.id === activeSection}
              isCompleted={section.isCompleted}
              onClick={() => handleSectionClick(section.id)}
              color={color}
              style={index === 0 ? { } : {}}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Status Icon based on completion */}
                {section.isCompleted ? (
                  <CompletionIcon isActive={section.id === activeSection} color={color}>
                    <AiOutlineCheckCircle size={20} />
                  </CompletionIcon>
                ) : section.progress && section.progress > 0 ? (
                  <InProgressIcon isActive={section.id === activeSection} color={color}>
                    <BiLoaderCircle size={20} />
                  </InProgressIcon>
                ) : section.id === activeSection ? (
                  <SectionIcon isActive={true} isCompleted={section.isCompleted} color={color}>
                    {icon}
                  </SectionIcon>
                ) : (
                  <RadioCircle isActive={false} />
                )}
                <SectionName isActive={section.id === activeSection}>{section.name}</SectionName>
                
                {/* Always show completion percentage */}
                <CompletionPercentage 
                  isActive={section.id === activeSection}
                  progress={section.progress || 0}
                >
                  {section.progress || 0}%
                </CompletionPercentage>
              </div>
              
              {/* Section progress bar */}
              <SectionProgressContainer>
                <SectionProgressBar>
                  <SectionProgressIndicator 
                    width={section.progress || 0} 
                    color={color} 
                    isActive={section.id === activeSection}
                  />
                </SectionProgressBar>
              </SectionProgressContainer>
              
              {section.id === activeSection && currentQuestionNumber && totalQuestions && (
                <StepIndicator>Question {currentQuestionNumber} of {totalQuestions}</StepIndicator>
              )}
            </SectionItem>
          );
        })}
      </SectionsList>
      
      {/* Progress bar moved to header */}
    </SidebarContainer>
  );
};

// Styled components
const SidebarContainer = styled.div`
  width: 280px;
  min-width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  height: calc(100vh - 80px); /* Subtract header height */
  position: fixed;
  top: 80px; /* Start below the header */
  left: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  z-index: 50;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    left: auto;
  }
`;

const LogoContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const LogoText = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color, #552A47);
  margin: 0;
  padding: 0;
`;

const LogoSubtext = styled.div`
  font-size: 10px;
  color: #666;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

const LogoImage = styled.img`
  max-width: 160px;
  max-height: 60px;
  object-fit: contain;
`;

const ProgressContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
`;

const ProgressBar = styled.div`
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
`;

const ProgressIndicator = styled.div<{ width: number; color?: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: var(--primary-color, #552A47);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-top: 5px;
  text-align: right;
`;

const SectionsList = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0;
  margin-top: 20px;
`;

const SectionItem = styled.div<{ isActive: boolean; isCompleted: boolean; color?: string }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  background-color: ${props => props.isActive ? 'var(--primary-color, #552A47)' : 'transparent'};
  transition: all 0.2s ease;
  border-radius: 0;
  margin: 0 10px;
  width: calc(100% - 20px);
  flex-wrap: wrap;
  position: relative;
  border-radius: 6px;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--primary-color, #552A47)' : '#f8f8f8'};
  }
`;

const SectionIcon = styled.div<{ isActive: boolean; isCompleted: boolean; color?: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${props => props.isActive ? '#ffffff' : '#666666'};
  font-size: 18px;
  background-color: ${props => props.isActive ? 'var(--primary-color, #552A47)' : 'transparent'};
`;

const SectionName = styled.span<{ isActive?: boolean }>`
  font-size: 14px;
  color: ${props => props.isActive ? '#ffffff' : '#333333'};
  font-weight: ${props => props.isActive ? '500' : 'normal'};
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.2px;
`;

const StepIndicator = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 36px;
  margin-top: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  font-family: 'Inter', sans-serif;
`;

const RadioCircle = styled.div<{ isActive: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #666666;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SurveyTitleContainer = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SurveyTitleText = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
`;

const AverageTimeTag = styled.div`
  background-color: rgba(var(--primary-color-rgb, 85, 42, 71), 0.1);
  color: var(--primary-color, #552A47);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompletedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
`;

const CompletionIcon = styled.div<{ isActive: boolean; color?: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${props => props.isActive ? '#ffffff' : 'var(--primary-color, #552A47)'};
  font-size: 18px;
`;

const InProgressIcon = styled.div<{ isActive: boolean; color?: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${props => props.isActive ? '#ffffff' : 'var(--primary-color, #552A47)'};
  font-size: 18px;
`;

const CompletionPercentage = styled.span<{ isActive: boolean; progress: number }>`
  font-size: 12px;
  color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.9)' : 
    props.progress === 100 ? '#fff' : 
    props.progress === 0 ? '#666' : 'var(--primary-color, #552A47)'};
  margin-left: auto;
  font-weight: 600;
  background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 
    props.progress === 100 ? 'var(--primary-color, #552A47)' :
    props.progress === 0 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(var(--primary-color-rgb, 85, 42, 71), 0.1)'};
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 42px;
  text-align: center;
`;

const SectionProgressContainer = styled.div`
  width: 100%;
  padding: 0 36px;
  margin-top: 8px;
`;

const SectionProgressBar = styled.div`
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 1.5px;
  position: relative;
  overflow: hidden;
`;

const SectionProgressIndicator = styled.div<{ width: number; color?: string; isActive: boolean }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.5)' : 'var(--primary-color, #552A47)'};
  border-radius: 1.5px;
  transition: width 0.3s ease;
`;

export default SidebarNavigation;
