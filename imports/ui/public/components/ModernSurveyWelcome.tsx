import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { FiArrowRight, FiClock, FiShield, FiClock as FiTimer, FiCheckCircle, FiUsers, FiHeart } from 'react-icons/fi';
import { FaRegClock, FaRegCheckCircle, FaRegListAlt, FaRegHeart } from 'react-icons/fa';
import '../components/ModernSurvey.css';

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  selectedQuestions?: Record<string, any[]>;
  siteTextQuestions?: any[];
  shareToken?: string;
  sectionQuestions?: any[];
  surveySections?: SurveySection[];
  layout?: 'multiStep' | 'allOnOnePage';
  questionCount?: number;
  sectionCount?: number;
  sections?: SurveySection[];
  estimatedTime?: number;
  expectations?: Array<{
    title: string;
    description: string;
    image?: string;
  }>;
  expectationsTitle?: string;
  startButtonLabel?: string;
}

interface SurveySection {
  title: string;
  description: string;
}

interface ModernSurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
  totalQuestions?: number;
  totalSections?: number;
}

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
`;

const TopHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderLogo = styled.div`
  img {
    height: 60px;
    max-width: 200px;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    img {
      height: 50px;
      max-width: 150px;
    }
  }
`;

const MainContentWrapper = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const WelcomeHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem 1rem;
  }
`;

const WelcomeHeaderContent = styled.div`
  flex: 1;
  padding-right: 2rem;
  max-width: 600px !important;
  margin: auto;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--primary-color, #2c3e50);
    font-family: var(--heading-font, 'Inter, sans-serif');
    max-width: 600px;
  }
  
  p {
    font-size: 1.25rem;
    color: var(--text-color, #4b5563);
    line-height: 1.6;
    max-width: 600px;
    margin: auto;
    font-family: var(--body-font, 'Inter, sans-serif');
  }
  
  @media (max-width: 768px) {
    padding-right: 0;
    max-width: 100%;
    
    h1 {
      font-size: 2.5rem;
      max-width: 100%;
    }
    
    p {
      max-width: 100%;
    }
  }
`;

const WelcomeHeaderImage = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  max-width: 600px;
  
  img {
    width: 100%;
    height: 300px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin: 1.5rem 0;
    
    img {
      height: 200px;
      max-width: 100%;
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  max-width: 600px;
  
  img {
    max-height: 80px;
    max-width: 200px;
  }
`;

const MainContent = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 100px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: auto;
    padding-top: 70px;
  }
`;

const ContentContainer = styled.div`
  padding: 0;
  width: 100%;
  max-width: 600px;
  flex: 1;
  margin: auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    max-width: 100%;
  }
`;

const ExpectationSidebar = styled.div<{ primaryColor?: string }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 30%;
  height: 100vh;
  background-color: var(--primary-color, #552a47);
  display: flex;
  flex-direction: column;
  z-index: 5;
  
  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    height: auto;
    order: -1;
  }
`;

const ExpectationHeader = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 0 0 24px 24px;
  margin-bottom: 60px;
`;

const ExpectationContent = styled.div`
  padding: 0 2rem 2rem;
  flex: 1;
`;

const ExpectationTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: white;
  font-family: var(--heading-font, 'Inter, sans-serif');
  text-align: center;
`;

const ExpectationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const ExpectationItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  width: 100%;
`;

const ExpectationIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 0.5rem;
`;

const ExpectationItemContent = styled.div`
  h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: white;
    font-family: var(--heading-font, 'Inter, sans-serif');
  }
  
  p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    font-family: var(--body-font, 'Inter, sans-serif');
  }
`;

const SurveyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-color, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 24px;
`;

const SurveyContent = styled.div`
  flex: 1;
`;

const SurveyTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color, #333);
  margin: 0 0 8px 0;
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const SurveyDescription = styled.p`
  font-size: 16px;
  color: var(--text-color, #555);
  margin: 0;
  line-height: 1.5;
  font-family: var(--body-font, 'Inter, sans-serif');
`;



const StatsContainer = styled.div`

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 40px 0;
  
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
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--primary-color, #6b7280);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TrustedSection = styled.div`
  margin: 40px 0;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  display: none;
`;

const TrustedTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

const TrustedLogos = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin: 0 auto;
  max-width: 1000px;
  
  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const TrustedLogo = styled.div`
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  img {
    height: 40px;
    width: auto;
    filter: grayscale(100%);
    transition: filter 0.3s ease;
  }
  
  &:hover {
    opacity: 1;
    
    img {
      filter: grayscale(0%);
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 2rem;
`;

const StartButton = styled.button`
  background-color: var(--primary-color, #2c3e50);
  color: white;
  border: none;
  border-radius: var(--button-radius, 50px);
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb, 44, 62, 80), 0.3);
  font-family: var(--body-font, 'Inter, sans-serif');
  
  &:hover {
    background-color: var(--button-hover, #1a252f);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 44, 62, 80), 0.4);
  }
  
  svg {
    margin-left: 8px;
  }
`;

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

const ModernSurveyWelcome: React.FC<ModernSurveyWelcomeProps> = ({ survey, onStart, totalQuestions, totalSections }) => {
  // Add CSS to hide header for this page
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
    `;
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const effectiveColor = survey.color || '#552a47'; // Default to purple if no color provided
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '124, 58, 237';
  const surveyImage = survey.featuredImage || survey.image || null;

  // State for survey metadata
  const [loading, setLoading] = useState<boolean>(true);
  // Add specific loading state for time calculation
  const [timeCalculationComplete, setTimeCalculationComplete] = useState<boolean>(false);
  
  const [metadata, setMetadata] = useState<{
    estimatedTime: string;
    estimatedTimeSeconds: number;
    questionCount: number;
    sectionCount: number;
  }>({ 
    estimatedTime: '',
    estimatedTimeSeconds: 0,
    questionCount: 0,
    sectionCount: 0
  });
  
  // State for dynamic time calculation from ModernSurveyContent
  const [dynamicTimeData, setDynamicTimeData] = useState<{
    totalEstimatedSeconds: number;
    minutes: number;
    questionCount: number;
    timestamp: number;
  } | null>(null);

  // Get the featured image and logo separately
  const featuredImage = survey.featuredImage || null;
  const logo = survey.logo || null;
  
  // Effect to listen for the custom event from ModernSurveyContent
  useEffect(() => {
    if (survey._id) {
      const handleTimeDataReady = (event: any) => {
        const { surveyId, timeData } = event.detail;
        
        // Only process if this is for our survey
        if (surveyId === survey._id) {
          
          // Check if we already have this data to prevent unnecessary re-renders
          if (!dynamicTimeData || 
              dynamicTimeData.timestamp !== timeData.timestamp ||
              dynamicTimeData.totalEstimatedSeconds !== timeData.totalEstimatedSeconds) {
            
            setDynamicTimeData(timeData);
            setTimeCalculationComplete(true);
          }
        }
      };
      
      // Add event listener
      window.addEventListener('survey-time-data-ready', handleTimeDataReady);
      
      // Clean up
      return () => {
        window.removeEventListener('survey-time-data-ready', handleTimeDataReady);
      };
    }
  }, [survey._id, dynamicTimeData]);
  
  // Effect to check for dynamic time data from ModernSurveyContent
  useEffect(() => {
    if (survey._id) {
      try {
        // Check if we have time data in localStorage
        const surveyTimeKey = `survey_time_${survey._id}`;
        const storedTimeData = localStorage.getItem(surveyTimeKey);
        
        if (storedTimeData) {
          const timeData = JSON.parse(storedTimeData);
          
          // Check if the data is recent (within the last hour)
          const now = new Date().getTime();
          const dataAge = now - timeData.timestamp;
          const isRecent = dataAge < 3600000; // 1 hour in milliseconds
          
          if (isRecent) {
            // Add a small delay to ensure UI is ready
            setTimeout(() => {
              setDynamicTimeData(timeData);
              // Mark time calculation as complete since we have valid data
              setTimeCalculationComplete(true);
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error reading survey time data from localStorage:', error);
      }
    }
  }, [survey._id]);

  // Fetch survey metadata
  useEffect(() => {
    if (survey._id) {
      setLoading(true);
      
      // First get the survey metadata for basic info
      Meteor.call('getSurveyMetadata', survey._id, (error: any, result: any) => {
        if (error) {
          setLoading(false);
        } else if (result) {
          
          // Get all question IDs from the survey
          if (result.questionIds && result.questionIds.length > 0) {
            // Now fetch all question documents to calculate time directly
            Meteor.call('getQuestionDocuments', result.questionIds, (questionError: any, questionDocs: any) => {
              if (questionError) {
                // Mark time calculation as complete even with fallback data
                setTimeCalculationComplete(true);
              } else if (questionDocs && questionDocs.length > 0) {
                // Calculate total time directly from question documents
                const totalEstimatedSeconds = questionDocs.reduce((total: number, doc: any) => {
                  const seconds = doc.currentVersion?.estimatedTimeSeconds || 30; // Default to 30 seconds
                  return total + seconds;
                }, 0);
                
                // Add 30 seconds buffer for survey overhead (reading intro, etc.)
                const totalWithBuffer = totalEstimatedSeconds + 30;
                
                const minutes = Math.ceil(totalWithBuffer / 60);
                
                // Log with the requested format
                
                // Store the calculated values in state
                setMetadata({
                  estimatedTime: `${minutes}`,
                  estimatedTimeSeconds: totalWithBuffer,
                  questionCount: questionDocs.length,
                  sectionCount: result.sectionCount
                });
                
                // Store in localStorage for potential use by other components
                try {
                  const surveyTimeKey = `survey_time_${survey._id}`;
                  const timeData = {
                    surveyId: survey._id,
                    totalEstimatedSeconds: totalWithBuffer,
                    minutes,
                    questionCount: questionDocs.length,
                    timestamp: new Date().getTime()
                  };
                  localStorage.setItem(surveyTimeKey, JSON.stringify(timeData));
                  
                  // Also update dynamicTimeData state to ensure UI consistency
                  setDynamicTimeData(timeData);
                  
                  // Mark time calculation as complete
                  setTimeCalculationComplete(true);
                } catch (storageError) {
                  console.error('Error storing survey time data:', storageError);
                }
              }
              setLoading(false);
            });
          } else {
            // No question IDs found, use the metadata from server and mark calculation complete
            setTimeCalculationComplete(true);
            setLoading(false);
          }
        } else {
          console.warn('No result received from getSurveyMetadata');
          setLoading(false);
        }
      });
    }
  }, [survey._id]);
  
  // Use the metadata, but prioritize the survey prop values if available
  // This ensures our dynamic calculation from ModernSurveyContent takes precedence
  const estimatedTime = survey.estimatedTime || metadata.estimatedTime;
  const questionCount = totalQuestions || survey.questionCount || metadata.questionCount;
  const sectionCount = totalSections || survey.sectionCount || metadata.sectionCount;
  
  return (
    <WelcomeContainer>
      {/* Top Header with Logo */}
      {logo && (
        <TopHeader>
          <HeaderLogo>
            <img src={logo} alt="Survey logo" />
          </HeaderLogo>
        </TopHeader>
      )}
      
      <MainContentWrapper>
        <MainContent>
          <WelcomeHeader>
            <WelcomeHeaderContent>
              <h1>{survey.title || 'Customer Experience Survey'}</h1>
              {featuredImage && (
                <WelcomeHeaderImage>
                  <img src={featuredImage} alt="Survey featured image" />
                </WelcomeHeaderImage>
              )}
              <p dangerouslySetInnerHTML={{ __html: survey.description || 'Help us understand your experience and improve our services. Your feedback matters and takes just a few minutes to complete.' }} />
            </WelcomeHeaderContent>
          </WelcomeHeader>
        <ContentContainer>


        {/* Stats Cards - Only show if survey has questions */}
        {(() => {
          // Check if survey has any questions
          // Always show stats, even if values are 0
          
          if (loading) {
            return null;
          }
          
          return (
            <StatsContainer>
              <StatCard>
                <StatIcon primaryColor={effectiveColor}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="34" fill="none" viewBox="0 0 40 34">
                    <path fill="currentColor" d="M28.274 21.376a.656.656 0 0 1-.426-.154l-4.954-4.013a.69.69 0 0 1-.25-.53V5.585a.68.68 0 0 1 1.36 0v10.774l4.7 3.809a.68.68 0 0 1-.453 1.209h.023ZM16.503 24.099H8.925a.68.68 0 0 1 0-1.359h7.578a.68.68 0 0 1 0 1.359ZM13.429 16.807H.679a.68.68 0 0 1 0-1.359h12.75a.68.68 0 0 1 0 1.359ZM8.576 9.434h-4.53a.68.68 0 1 1 0-1.359h4.53a.68.68 0 0 1 0 1.359ZM23.324 29.587a.68.68 0 0 1-.68-.679v-.136a.68.68 0 0 1 1.36 0v.136a.68.68 0 0 1-.68.68ZM35.98 17.36h-.137a.68.68 0 0 1 0-1.359h.136a.679.679 0 1 1 0 1.359Z"/>
                    <path fill="currentColor" d="M7.484 19.56a.675.675 0 0 1-.67-.583 16.118 16.118 0 0 1-.15-2.297.68.68 0 1 1 1.36 0c0 .705.048 1.408.144 2.106a.68.68 0 0 1-.598.766l-.086.009ZM23.322 33.351a16.535 16.535 0 0 1-11.997-5.095.68.68 0 0 1 .978-.933 15.166 15.166 0 0 0 11.019 4.67 15.314 15.314 0 0 0 7.115-28.87A15.313 15.313 0 0 0 9.594 9.887a.68.68 0 0 1-1.218-.607A16.676 16.676 0 1 1 23.322 33.35ZM5.095 24.099H3.86a.68.68 0 0 1 0-1.359h1.236a.68.68 0 0 1 0 1.359Z"/>
                    <path fill="currentColor" d="M8.102 12.233a.683.683 0 0 1-.612-.974l.942-1.97a.68.68 0 0 1 1.228.584l-.942 1.975a.684.684 0 0 1-.616.385Z"/>
                  </svg>
                </StatIcon>
                <StatValue primaryColor={effectiveColor}>
                  {(() => {
                    if (loading) {
                      return '...';
                    }
                    
                    // Show actual minutes, including 0
                    const finalMinutes = Math.ceil(metadata.estimatedTimeSeconds / 60);
                    return finalMinutes;
                  })()}
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
                  {(() => {
                    if (loading) {
                      return '...';
                    }
                    
                    const finalQuestionCount = metadata.questionCount || totalQuestions || survey.questionCount || 0;
                    return finalQuestionCount;
                  })()}
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
                  {(() => {
                    if (loading) {
                      return '...';
                    }
                    
                    // Show actual section count, including 0
                    const finalSectionCount = metadata.sectionCount || totalSections || survey.sectionCount || 0;
                    return finalSectionCount;
                  })()}
                </StatValue>
                <StatLabel>Question Sections</StatLabel>
              </StatCard>

              
              <StatCard>
                <StatIcon primaryColor={effectiveColor}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="45" fill="none" viewBox="0 0 40 45">
                    <path fill="currentColor" d="M33.788 30.295c-2.022-.513-4.082-.439-6.118-.705-1.015-.148-1.703-.492-1.887-.944a.606.606 0 0 0-.857-.302L20 31.067l-4.968-2.745a.608.608 0 0 0-.823.232 1.99 1.99 0 0 1-1.858 1.036c-.71.06-1.47.128-2.254.173-1.31.048-2.61.226-3.885.532A8.458 8.458 0 0 0 0 38.434v5.387a.607.607 0 0 0 .608.61h38.785a.608.608 0 0 0 .607-.608v-5.389a8.459 8.459 0 0 0-6.212-8.139Zm-8.771-.613c.495.565 1.34.945 2.488 1.11.297.039.59.07.882.095a825.778 825.778 0 0 1-3.708 4.105l-3.621-3.12 3.959-2.19Zm-12.655 1.121a3.229 3.229 0 0 0 2.562-1.153l4.018 2.222-3.622 3.12c-.745-.82-2.395-2.638-3.722-4.119.26-.022.515-.045.764-.07Zm26.423 12.413h-5.202v-3.733a.607.607 0 1 0-1.215 0v3.733H7.632v-3.733a.608.608 0 1 0-1.215 0v3.733H1.215v-4.782a7.24 7.24 0 0 1 5.318-6.967c1.16-.28 2.344-.442 3.536-.484 1.772 1.993 4.721 5.23 4.752 5.264a.616.616 0 0 0 .846.052l3.725-3.212v4.002a.607.607 0 1 0 1.216 0v-4.002l3.725 3.212a.616.616 0 0 0 .846-.052c.516-.563 3.745-4.126 4.73-5.238 1.193.11 2.441.151 3.558.458a7.24 7.24 0 0 1 5.318 6.967v4.782ZM12.107 10.545h.125a1.954 1.954 0 0 0 1.91-1.638 5.944 5.944 0 0 1 11.793 1.26c-.12 3.151-2.856 5.714-6.1 5.714h-1.227a.609.609 0 0 0-.607.608v3.65a1.996 1.996 0 0 0 3.992 0v-.467A9.937 9.937 0 1 0 10.198 8.287a1.938 1.938 0 0 0 1.91 2.257v.001Zm-.71-2.056a8.722 8.722 0 1 1 9.899 10.073.608.608 0 0 0-.518.6v.977a.781.781 0 0 1-1.562 0v-3.043h.62c3.888 0 7.17-3.088 7.315-6.882a7.159 7.159 0 0 0-14.205-1.516.74.74 0 0 1-.714.632h-.125a.722.722 0 0 1-.71-.841ZM20 23.555a1.998 1.998 0 0 0-1.996 1.996v.468a1.996 1.996 0 1 0 3.992 0v-.468A1.998 1.998 0 0 0 20 23.555Zm.781 2.465a.78.78 0 1 1-1.562 0v-.47a.781.781 0 1 1 1.562 0v.47Z"/>
                    <path fill="currentColor" d="M19.998 38.566a.607.607 0 0 0-.607.608v1.785a.607.607 0 1 0 1.215 0v-1.785a.608.608 0 0 0-.608-.608Z"/>
                  </svg>
                </StatIcon>
                <StatValue primaryColor={effectiveColor}>100%</StatValue>
                <StatLabel>Anonymous</StatLabel>
              </StatCard>
            </StatsContainer>
          );
        })()}

        {/* Trusted by thousands of customers section */}
        <TrustedSection>
          <TrustedTitle>Trusted by thousands of customers</TrustedTitle>
          <TrustedLogos>
            <TrustedLogo>
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#f8f8f8"/>
                <text x="60" y="25" fontFamily="Arial" fontSize="12" fill="#333" textAnchor="middle">Company 1</text>
              </svg>
            </TrustedLogo>
            <TrustedLogo>
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#f8f8f8"/>
                <text x="60" y="25" fontFamily="Arial" fontSize="12" fill="#333" textAnchor="middle">Company 2</text>
              </svg>
            </TrustedLogo>
            <TrustedLogo>
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#f8f8f8"/>
                <text x="60" y="25" fontFamily="Arial" fontSize="12" fill="#333" textAnchor="middle">Company 3</text>
              </svg>
            </TrustedLogo>
            <TrustedLogo>
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#f8f8f8"/>
                <text x="60" y="25" fontFamily="Arial" fontSize="12" fill="#333" textAnchor="middle">Company 4</text>
              </svg>
            </TrustedLogo>
            <TrustedLogo>
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#f8f8f8"/>
                <text x="60" y="25" fontFamily="Arial" fontSize="12" fill="#333" textAnchor="middle">Company 5</text>
              </svg>
            </TrustedLogo>
          </TrustedLogos>
        </TrustedSection>


        {/* Start Button */}
        <ButtonContainer>
          <StartButton onClick={() => {
            // Reset timer data in localStorage to ensure a fresh start time
            const userId = Meteor.userId();
            const localStorageKey = `survey_progress_${survey._id}${userId ? `_${userId}` : ''}`;
            
            try {
              // Get existing progress data (if any)
              const existingProgress = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
              
              // Reset timer data with a fresh start time and no end time
              const updatedProgress = {
                ...existingProgress,
                startTime: new Date(), // Fresh start time
                endTime: null          // Clear any existing end time
              };
              
              // Save updated progress back to localStorage
              localStorage.setItem(localStorageKey, JSON.stringify(updatedProgress));
            } catch (error) {
              console.error('Error resetting survey timer:', error);
            }
            
            // Continue with original onStart function
            onStart();
          }}>
{survey.startButtonLabel || 'Start Survey'} <FiArrowRight size={18} />
          </StartButton>
        </ButtonContainer>
        </ContentContainer>
        </MainContent>
      
      {/* What to expect section - Right sidebar */}
      {survey.expectations && survey.expectations.length > 0 && (
        <ExpectationSidebar primaryColor={effectiveColor}>
          <ExpectationHeader>
            <ExpectationTitle>{survey.expectationsTitle || 'What to Expect'}</ExpectationTitle>
          </ExpectationHeader>
          <ExpectationContent>
            <ExpectationList>
              {survey.expectations.map((expectation: any, index: number) => (
                <ExpectationItem key={index}>
                  {expectation.image && (
                    <ExpectationIcon>
                      <img 
                        src={expectation.image} 
                        alt={expectation.title}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'cover'
                        }}
                      />
                    </ExpectationIcon>
                  )}
                  <ExpectationItemContent>
                    <h3>{expectation.title}</h3>
                    <p>{expectation.description}</p>
                  </ExpectationItemContent>
                </ExpectationItem>
              ))}
            </ExpectationList>
          </ExpectationContent>
        </ExpectationSidebar>
      )}
      </MainContentWrapper>
    </WelcomeContainer>
  );
};

export default ModernSurveyWelcome;
