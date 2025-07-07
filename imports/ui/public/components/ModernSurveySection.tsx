import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft, FiClock, FiCheckCircle, FiStar } from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';
import '../components/ModernSurvey.css';

interface Section {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  priority?: number;
  color?: string;
  image?: string;
  questionCount?: number;
  requiredQuestionCount?: number;
  estimatedTime?: string;
  index?: number;
}

interface ModernSurveySectionProps {
  section: Section;
  onContinue: () => void;
  onBack: () => void;
  color?: string;
  image?: string;
  surveyTitle?: string;
  surveyDescription?: string;
  surveyId?: string;
  sectionIndex?: number;
  totalQuestions?: number; // Total questions in this section
}

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background-color, #f9f9ff);
  padding: 0;
  margin: 0;
  animation: fadeIn 0.5s ease-out;
  font-family: var(--body-font, 'Inter, sans-serif');
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionCard = styled.div<{ color?: string }>`
  background: var(--card-background, transparent);
  border-radius: 0;
  width: 100%;
  max-width: 100%;
  margin: 0;
  position: relative;
  overflow: hidden;
  // display: flex;
  // flex-direction: row;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: transparent;
  padding: 0;
  margin: 0;
`;

const SectionNumberBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color, #2c3e50);
  color: var(--button-text, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  margin-right: 1rem;
  flex-shrink: 0;
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 10;
`;

const HeaderContent = styled.div`
  flex: 1;
  padding: 3rem 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0rem;
  color: var(--primary-color, #1f2937);
  line-height: 1.2;
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const SectionDescription = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-color, #4b5563);
  margin: 0 0 1.5rem;
  max-width: 600px;
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: transparent;
  color: var(--text-color, #4b5563);
  border: 2px solid var(--primary-color, #e5e7eb);
  border-radius: var(--button-radius, 50px);
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 160px;
  justify-content: center;
  font-family: var(--body-font, 'Inter, sans-serif');
  
  &:hover {
    background: var(--primary-color, #f9fafb);
    color: var(--button-text, #ffffff);
    border-color: var(--primary-color, #9ca3af);
  }
`;

const ContinueButton = styled.button`
  background-color: var(--button-background, var(--primary-color, #2c3e50));
  color: var(--button-text, white);
  border: none;
  border-radius: var(--button-radius, 30px);
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  margin-right: 12px;
  font-family: var(--body-font, 'Inter, sans-serif');
  
  &:hover {
    background-color: var(--button-hover, #1a2533);
    transform: translateY(-2px);
  }
  
  svg {
    margin-left: 8px;
  }
`;

const StartSectionButton = styled.button`
  background: var(--button-background, var(--primary-color, #2c3e50));
  color: var(--button-text, white);
  border: none;
  border-radius: var(--button-radius, 50px);
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 160px;
  justify-content: center;
  font-family: var(--body-font, 'Inter, sans-serif');
  
  &:hover {
    background: var(--button-hover, #1e2a36);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ContentContainer = styled.div`
  // width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  background-color: #f9f9ff;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  display: block;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color, rgba(124, 58, 237, 0.1));
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem auto;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--heading-color, #111827);
  margin: 0.5rem 0;
  width: 100%;
  text-align: center;
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-color, #6b7280);
  width: 100%;
  text-align: center;
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const ImageContainer = styled.div`
  flex: 1;
  max-width: 45%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1rem;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    height: 240px;
  }
`;

const ImageNumberBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color, #7c3aed);
  color: var(--button-text, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  font-family: var(--heading-font, 'Inter, sans-serif');
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 10;
`;

const DefaultImage = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#f5f5f5" />
    <path d="M300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150Z" fill="#2c3e50" fillOpacity="0.1" />
    <path d="M200 170C217.673 170 232 155.673 232 138C232 120.327 217.673 106 200 106C182.327 106 168 120.327 168 138C168 155.673 182.327 170 200 170Z" fill="#2c3e50" />
    <path d="M120 290C120 257.909 153.49 232 195 232C236.51 232 270 257.909 270 290C270 291.657 268.657 293 267 293H123C121.343 293 120 291.657 120 290Z" fill="#2c3e50" />
  </svg>
);

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  if (!color) return '#2c3e50';
  
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
  if (!hex || hex === '') return '44, 62, 80'; // Default color (2c3e50)
  
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
    return '44, 62, 80'; // Default color (2c3e50)
  }
};

const ModernSurveySection: React.FC<ModernSurveySectionProps> = ({ 
  section, 
  onContinue, 
  onBack,
  color,
  image,
  surveyTitle,
  surveyDescription,
  surveyId,
  sectionIndex = 1,
  totalQuestions
}) => {
  // Add CSS to hide header and remove padding
  useEffect(() => {
    // Add a style tag to hide the header
    const style = document.createElement('style');
    style.textContent = `
      header {
        display: none !important;
      }
      main {
        padding: 0 !important;
      }
      .content-container {
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [loading, setLoading] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<{
    questionCount: number;
    requiredQuestionCount: number;
    estimatedTime: string;
  }>({ questionCount: 0, requiredQuestionCount: 0, estimatedTime: '~2' });

  // Initialize with section data immediately to avoid showing '...'
  useEffect(() => {
    // Set initial values from section props to avoid showing '...'
    setMetadata({
      questionCount: section.questionCount || 0,
      requiredQuestionCount: section.requiredQuestionCount || 0,
      estimatedTime: section.estimatedTime || '~2'
    });
    
    // Then fetch the actual data
    if (surveyId && section.id) {

      
      // First try to get sectionQuestions directly from client-side cache if available
      try {
        // Access the client-side cache for sectionQuestions
        const trackerData = localStorage.getItem('DeviceTracker');
        if (trackerData) {
          const parsedData = JSON.parse(trackerData);
          if (parsedData && parsedData.sectionQuestions && 
              parsedData.sectionQuestions.length > 0 && 
              parsedData.sectionQuestions[0].sectionId === section.id) {
            

            const questionCount = parsedData.sectionQuestions[0].questions.length;
            const requiredQuestions = parsedData.sectionQuestions[0].questions.filter(
              (q: any) => q.status === 'published'
            ).length;
            
            setMetadata(prev => ({
              ...prev,
              questionCount: questionCount,
              requiredQuestionCount: requiredQuestions
            }));
            
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error accessing client-side cache:', e);
      }
      
      // If client-side cache doesn't have the data, fall back to Meteor method
      Meteor.call('getSectionMetadata', surveyId, section.id, (error: any, result: any) => {
        if (error) {
          console.error('Error fetching section metadata:', error);
          // Even on error, we should set loading to false
          setLoading(false);
          return;
        }
        

        if (result) {
          setMetadata({
            questionCount: result.questionCount || section.questionCount || 0,
            requiredQuestionCount: result.requiredQuestionCount || section.requiredQuestionCount || 0,
            estimatedTime: result.estimatedTime || '~2'
          });
        }
        
        // Always set loading to false
        setLoading(false);
      });
    } else {
      // If no surveyId or section.id, set loading to false immediately
      setLoading(false);
    }
  }, [surveyId, section.id, section.questionCount, section.requiredQuestionCount, section.estimatedTime]);
  
  // Add a direct script to access the Processing sectionQuestions array from the console
  useEffect(() => {
    // Function to directly inject a script to access console variables
    const injectScript = (code: string) => {
      const script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
      document.body.removeChild(script);
    };

    // Inject a script that will directly update our metadata from console data
    const updateFromConsole = () => {
      injectScript(`
        (function() {
          try {
            // Look for the section questions in the console scope
            if (typeof sectionQuestions !== 'undefined' && Array.isArray(sectionQuestions)) {

              window.__sectionQuestionsCount = sectionQuestions.length;
              window.__requiredQuestionsCount = sectionQuestions.filter(q => q.status === 'published').length;
            }
            // Also check for Processing sectionQuestions which is visible in your screenshot
            else if (typeof array !== 'undefined' && Array.isArray(array) && array.length > 0) {

              if (array[0] && array[0].questions && Array.isArray(array[0].questions)) {
                window.__sectionQuestionsCount = array[0].questions.length;
                window.__requiredQuestionsCount = array[0].questions.filter(q => q.status === 'published').length;
              }
            }
          } catch (e) {
            console.error('Error in console data access script:', e);
          }
        })();
      `);

      // Now check if our injected script set the global variables
      const questionCount = (window as any).__sectionQuestionsCount;
      const requiredCount = (window as any).__requiredQuestionsCount;
      
      if (typeof questionCount === 'number') {

        
        // Update the metadata with the values from console
        setMetadata(prev => ({
          ...prev,
          questionCount: questionCount,
          requiredQuestionCount: requiredCount || 0
        }));
        
        return true; // Successfully found questions
      }
      
      return false; // No questions found
    };
    
    // Try to directly access the DeviceTracker data from localStorage
    const tryLocalStorage = () => {
      try {
        const trackerData = localStorage.getItem('DeviceTracker');
        if (trackerData) {
          const data = JSON.parse(trackerData);
          if (data && data.sectionQuestions && data.sectionQuestions.length > 0) {
            const questions = data.sectionQuestions[0].questions;
            if (Array.isArray(questions)) {
              const questionCount = questions.length;
              const requiredCount = questions.filter((q: any) => q.status === 'published').length;
              

              
              setMetadata(prev => ({
                ...prev,
                questionCount: questionCount,
                requiredQuestionCount: requiredCount
              }));
              
              return true;
            }
          }
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
      return false;
    };
    
    // Try all methods to get the question count
    let found = tryLocalStorage() || updateFromConsole();
    
    // If not found, set up an interval to keep trying
    let intervalId: number | null = null;
    if (!found) {
      intervalId = window.setInterval(() => {
        found = tryLocalStorage() || updateFromConsole();
        if (found && intervalId) {
          clearInterval(intervalId);
        }
      }, 500) as unknown as number;
    }
    
    // Clean up
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Clean up global variables
      delete (window as any).__sectionQuestionsCount;
      delete (window as any).__requiredQuestionsCount;
    };
  }, []);
  
  // Add a simpler direct approach to access the array data from the console
  useEffect(() => {
    // Create a global function that can be called from the console
    (window as any).updateSectionQuestionCount = (count: number) => {

      setMetadata(prev => ({
        ...prev,
        questionCount: count
      }));
    };
    
    // Add a script to the page that will run in the global context
    const script = document.createElement('script');
    script.textContent = `
      // This script runs in the global context and can access console variables
      (function() {
        // Function to check for the array variable and update the count
        function checkAndUpdateCount() {
          try {
            // Check for the array variable we see in the screenshot
            if (typeof array !== 'undefined' && Array.isArray(array) && 
                array.length > 0 && array[0] && array[0].questions) {
              const count = array[0].questions.length;

              if (typeof window.updateSectionQuestionCount === 'function') {
                window.updateSectionQuestionCount(count);
              }
              return true;
            }
            // Also check for sectionQuestions
            if (typeof sectionQuestions !== 'undefined' && Array.isArray(sectionQuestions)) {
              const count = sectionQuestions.length;

              if (typeof window.updateSectionQuestionCount === 'function') {
                window.updateSectionQuestionCount(count);
              }
              return true;
            }
          } catch (e) {
            console.error('Error checking for question count:', e);
          }
          return false;
        }
        
        // Try immediately
        const found = checkAndUpdateCount();
        
        // If not found, set up an interval to keep checking
        if (!found) {
          const intervalId = setInterval(() => {
            if (checkAndUpdateCount()) {
              clearInterval(intervalId);
            }
          }, 500);
        }
      })();
    `;
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      delete (window as any).updateSectionQuestionCount;
      // We can't remove the script since it's already executed
    };
  }, []);

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

  const sectionImage = section.image || image || null;
  const effectiveColor = '#7c3aed'; // Using purple from the reference image

  return (
    <SectionContainer>
      <SectionCard>
        <SectionHeader>
          <HeaderContent style={{ flex: sectionImage ? 1 : 'auto', maxWidth: sectionImage ? '60%' : '100%' }}>
            {/* <SectionNumberBadge>{section.index || sectionIndex}</SectionNumberBadge> */}
            <SectionTitle>{section.name}</SectionTitle>
            {renderDescription()}
          </HeaderContent>
          
          {sectionImage && (
            <ImageContainer>
              <img src={sectionImage} alt={section.name} />
              <ImageNumberBadge>{section.index || sectionIndex}</ImageNumberBadge>
            </ImageContainer>
          )}
        </SectionHeader>
        
        <ContentContainer>
          <StatsContainer>
            <StatCard>
              <StatIcon>
                <FiClock size={24} />
              </StatIcon>
              <StatValue>{metadata.estimatedTime}</StatValue>
              <StatLabel>Minutes</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiCheckCircle size={24} />
              </StatIcon>
              <StatValue>{totalQuestions || metadata.questionCount}</StatValue>
              <StatLabel>Total questions</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiStar size={24} />
              </StatIcon>
              <StatValue>{metadata.requiredQuestionCount}</StatValue>
              <StatLabel>Required questions</StatLabel>
            </StatCard>
          </StatsContainer>
          
          <ButtonContainer>
            <BackButton onClick={onBack}>
              <FiArrowLeft /> Back
            </BackButton>
            
            <StartSectionButton onClick={onContinue}>
              Start Section <FiArrowRight />
            </StartSectionButton>
          </ButtonContainer>
        </ContentContainer>
      </SectionCard>
    </SectionContainer>
  );
};

export default ModernSurveySection;
