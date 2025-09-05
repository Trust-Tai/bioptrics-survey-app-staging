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

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  primaryColor?: string;
}

interface ModernSurveySectionProps {
  section: Section;
  survey?: Survey;
  onContinue: () => void;
  onBack: () => void;
  color?: string;
  image?: string;
  surveyTitle?: string;
  surveyDescription?: string;
  surveyId?: string;
  sectionIndex?: number;
  totalQuestions?: number;
  requiredQuestionCount?: number;
  dynamicTimeData?: {
    totalEstimatedSeconds: number;
    minutes: number;
    questionCount: number;
    timestamp: number;
  };
}

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  animation: fadeIn 0.5s ease-out;
  font-family: 'Inter', sans-serif;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionCard = styled.div<{ color?: string }>`
  background: transparent;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 3rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const SectionTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: var(--primary-color, #552A47);
  line-height: 1.2;
  font-family: 'Inter', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
`;

const SectionImageContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
  }
  
  @media (max-width: 768px) {
    height: 200px;
    margin-bottom: 1.5rem;
    
    img {
      height: 200px;
    }
  }
`;

const SectionDescription = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--primary-color, #4b5563);
  margin: 0 0 3rem 0;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2rem;
  width: 100%;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const StartSectionButton = styled.button`
  background: var(--primary-color, #552A47);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 180px;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    background: var(--primary-color, #3d1e32);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(85, 42, 71, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    margin-left: 4px;
  }
`;

const ContentContainer = styled.div`
  // width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 40px 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  border: 1px solid #e5e7eb;
  color: #333;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ primaryColor?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background-color: var(--primary-color-light, #f3e8ff);
  color: var(--primary-color, #552a47);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 40px;
  align-self: flex-end;

  svg {
    width: 40px;
    height: 40px;
  }
`;

const StatValue = styled.div<{ primaryColor?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color, #552a47);
  margin-bottom: 8px;
  line-height: 1;
  font-family: 'Inter', sans-serif;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--primary-color, #6b7280);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif;
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
  survey,
  onContinue,
  onBack,
  color,
  image,
  surveyTitle,
  surveyDescription,
  surveyId,
  sectionIndex,
  totalQuestions,
  requiredQuestionCount,
  dynamicTimeData
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<{
    questionCount: number;
    requiredQuestionCount: number;
    estimatedTime: string;
  }>({ questionCount: 0, requiredQuestionCount: 0, estimatedTime: '~2' });
  
  // State for dynamic time calculation from ModernSurveyContent
  const [localDynamicTimeData, setLocalDynamicTimeData] = useState<{
    totalEstimatedSeconds: number;
    minutes: number;
    timestamp: number;
  } | null>(null);

  // Effect to use the dynamicTimeData prop passed from ModernSurveyContent
  // Only run this effect once on mount to avoid continuous re-renders
  useEffect(() => {
    // Function to get time data
    const getTimeData = () => {
      // First try to use prop data
      if (dynamicTimeData) {
        console.log(`Using dynamic time data from props for section ${section.id}: ${dynamicTimeData.minutes} minutes`);
        setLocalDynamicTimeData({
          totalEstimatedSeconds: dynamicTimeData.totalEstimatedSeconds,
          minutes: dynamicTimeData.minutes,
          timestamp: dynamicTimeData.timestamp
        });
        return true;
      }
      
      // Fallback to localStorage if prop is not available
      if (section && section.id) {
        try {
          // Check if we have stored time data for this section
          const sectionTimeKey = `section_time_${section.id}`;
          const storedTimeData = localStorage.getItem(sectionTimeKey);
          
          if (storedTimeData) {
            const timeData = JSON.parse(storedTimeData);
            
            // Check if the data is recent (within the last hour)
            const isRecent = (new Date().getTime() - timeData.timestamp) < 3600000;
            
            if (isRecent && timeData.sectionId === section.id) {
              console.log(`Found stable time data in localStorage for section ${section.id}: ${timeData.minutes} minutes`);
              setLocalDynamicTimeData({
                totalEstimatedSeconds: timeData.totalEstimatedSeconds,
                minutes: timeData.minutes,
                timestamp: timeData.timestamp
              });
              return true;
            }
          }
        } catch (error) {
          console.error('Error reading section time data from localStorage:', error);
        }
      }
      return false;
    };
    
    // Get time data once on component mount
    getTimeData();
  }, [dynamicTimeData, section]);
  
  // Get actual question count from survey data
  useEffect(() => {
    if (!surveyId || !section.id) {
      setLoading(false);
      return;
    }

    // Use the Meteor method to get actual question count from surveyOrder
    Meteor.call('getSectionQuestionsFromSurveyOrder', surveyId, section.id, (error: any, result: any) => {
      if (error) {
        console.error('Error fetching section questions:', error);
        // Fallback to props if available
        const questionCount = section.questionCount || totalQuestions || 0;
        const requiredCount = section.requiredQuestionCount || requiredQuestionCount || questionCount;
        const estimatedMinutes = Math.max(1, Math.ceil(questionCount * 0.5));
        
        setMetadata({
          questionCount: questionCount,
          requiredQuestionCount: requiredCount,
          estimatedTime: estimatedMinutes.toString()
        });
      } else if (result) {
        console.log(`Section ${section.id} has ${result.totalQuestions} questions from surveyOrder`);
        setMetadata({
          questionCount: result.totalQuestions,
          requiredQuestionCount: result.requiredQuestions,
          estimatedTime: result.estimatedTime
        });
      }
      
      setLoading(false);
    });
  }, [surveyId, section.id, section.questionCount, totalQuestions, section.requiredQuestionCount, requiredQuestionCount]);
  
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
  const effectiveColor = survey?.primaryColor || color || '#552A47'; // Using dynamic color from props

  return (
    <SectionContainer>
      <SectionCard>
        <SectionTitle>{section.name}</SectionTitle>
        
        {sectionImage && (
          <SectionImageContainer>
            <img src={sectionImage} alt={section.name} />
          </SectionImageContainer>
        )}
        
        {renderDescription()}
        
        <StatsContainer>
          <StatCard>
            <StatIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="34" fill="none" viewBox="0 0 40 34">
                <path fill="currentColor" d="M28.274 21.376a.656.656 0 0 1-.426-.154l-4.954-4.013a.69.69 0 0 1-.25-.53V5.585a.68.68 0 0 1 1.36 0v10.774l4.7 3.809a.68.68 0 0 1-.453 1.209h.023ZM16.503 24.099H8.925a.68.68 0 0 1 0-1.359h7.578a.68.68 0 0 1 0 1.359ZM13.429 16.807H.679a.68.68 0 0 1 0-1.359h12.75a.68.68 0 0 1 0 1.359ZM8.576 9.434h-4.53a.68.68 0 1 1 0-1.359h4.53a.68.68 0 0 1 0 1.359ZM23.324 29.587a.68.68 0 0 1-.68-.679v-.136a.68.68 0 0 1 1.36 0v.136a.68.68 0 0 1-.68.68ZM35.98 17.36h-.137a.68.68 0 0 1 0-1.359h.136a.679.679 0 1 1 0 1.359Z"/>
                <path fill="currentColor" d="M7.484 19.56a.675.675 0 0 1-.67-.583 16.118 16.118 0 0 1-.15-2.297.68.68 0 1 1 1.36 0c0 .705.048 1.408.144 2.106a.68.68 0 0 1-.598.766l-.086.009ZM23.322 33.351a16.535 16.535 0 0 1-11.997-5.095.68.68 0 0 1 .978-.933 15.166 15.166 0 0 0 11.019 4.67 15.314 15.314 0 0 0 7.115-28.87A15.313 15.313 0 0 0 9.594 9.887a.68.68 0 0 1-1.218-.607A16.676 16.676 0 1 1 23.322 33.35ZM5.095 24.099H3.86a.68.68 0 0 1 0-1.359h1.236a.68.68 0 0 1 0 1.359Z"/>
                <path fill="currentColor" d="M8.102 12.233a.683.683 0 0 1-.612-.974l.942-1.97a.68.68 0 0 1 1.228.584l-.942 1.975a.684.684 0 0 1-.616.385Z"/>
              </svg>
            </StatIcon>
            <StatValue>
              {localDynamicTimeData ? 
                localDynamicTimeData.minutes : 
                metadata.estimatedTime}
            </StatValue>
            <StatLabel>
              Average Minutes
            </StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon primaryColor={effectiveColor}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">
                <mask id="a" width="40" height="40" x="0" y="0" maskUnits="userSpaceOnUse" style={{maskType: 'luminance'}}>
                  <path fill="#fff" d="M0 0h40v40H0V0Z"/>
                </mask>
                <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.172" mask="url(#a)">
                  <path d="M13.905 8.124c-3.66 2.41-6.01 6.147-6.01 10.343 0 7.27 7.056 13.163 15.76 13.163 2.6 0 5.053-.526 7.215-1.458M39.298 20.078a11.13 11.13 0 0 0 .117-1.611c0-7.27-7.056-13.163-15.76-13.163-2.797 0-5.425.609-7.702 1.676"/>
                  <path d="M27.059 31.32s2.833 2.318 7.835 3.096c.785.122 1.38-.755 1.047-1.53l-1.933-4.5.002.003c2.181-1.589 3.834-3.672 4.708-6.04M33.509 22.509l-1.972-7.075c-.167-.6-1.016-.6-1.183 0l-1.971 7.075M29.059 20.078h3.77M16.554 22.512a2.047 2.047 0 0 1-2.046-2.047v-3.438a2.047 2.047 0 0 1 4.093 0v3.438c0 1.13-.916 2.047-2.047 2.047ZM17.14 20.633l1.885 1.879M24.822 16.224c0 .686-1.243 1.955-1.243 1.955s-1.243-1.269-1.243-1.955a1.243 1.243 0 1 1 2.486 0ZM25.865 18.959s-.48.952-.794 1.629c-1.232 2.659-3.164 2.162-3.401.984-.284-1.405 1.911-3.393 1.911-3.393l2.678 4.33M14.406 32.458a12.68 12.68 0 0 0 4.213-1.515M8.894 13.851C4.098 15.002.59 18.692.59 23.068c0 2.884 1.524 5.47 3.937 7.228l.001-.002-1.408 3.278c-.243.565.19 1.204.763 1.115 3.636-.566 5.698-2.247 5.708-2.255.799.147 1.629.225 2.48.225"/>
                </g>
              </svg>
            </StatIcon>
            <StatValue primaryColor={effectiveColor}>
              {metadata.questionCount}
            </StatValue>
            <StatLabel>Total Questions</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon primaryColor={effectiveColor}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">
                <path fill="currentColor" d="M37.362 0H2.638A2.652 2.652 0 0 0 0 2.638v25.447h1.702V2.638c0-.51.426-.936.936-.936h10.128v35.234h1.702V14.468h11.064v11.064H15.83v1.702h9.702v11.064H2.638a.945.945 0 0 1-.936-.936v-7.575H0v7.575A2.652 2.652 0 0 0 2.638 40h34.724A2.652 2.652 0 0 0 40 37.362V8.51h-1.702v17.02H27.234V14.469h9.787v-1.702h-9.787V1.702h10.128c.51 0 .936.426.936.936v4.17H40v-4.17A2.652 2.652 0 0 0 37.362 0Zm.936 27.234v10.128c0 .51-.426.936-.936.936H27.234V27.234h11.064ZM25.532 12.766H14.468V1.702h11.064v11.064Z"/>
              </svg>
            </StatIcon>
            <StatValue primaryColor={effectiveColor}>
              {metadata.requiredQuestionCount}
            </StatValue>
            <StatLabel>Required Questions</StatLabel>
          </StatCard>
        </StatsContainer>
        
        <ButtonContainer>
          <StartSectionButton onClick={onContinue}>
            Start Section <FiArrowRight />
          </StartSectionButton>
        </ButtonContainer>
      </SectionCard>
    </SectionContainer>
  );
};

export default ModernSurveySection;
