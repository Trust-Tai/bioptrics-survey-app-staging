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
  estimatedTime?: string;
  questionCount?: number;
  sectionCount?: number;
  sections?: SurveySection[];
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
  margin: 0 auto;
  padding: 0;
  font-family: var(--body-font, 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif');
  color: var(--text-color, #333333);
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const WelcomeHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem 1rem;
  }
`;

const WelcomeHeaderContent = styled.div`
  flex: 1;
  padding-right: 2rem;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--primary-color, #2c3e50);
    font-family: var(--heading-font, 'Inter, sans-serif');
  }
  
  p {
    font-size: 1.25rem;
    color: var(--text-color, #4b5563);
    line-height: 1.6;
    max-width: 600px;
    font-family: var(--body-font, 'Inter, sans-serif');
  }
  
  @media (max-width: 768px) {
    padding-right: 0;
    
    h1 {
      font-size: 2.5rem;
    }
  }
`;

const WelcomeHeaderImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  
  img {
    width: 100%;
    height: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    justify-content: center;
    
    img {
      height: 300px;
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  
  img {
    max-height: 80px;
    max-width: 200px;
  }
`;

const ContentContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ExpectationSection = styled.div`
  background-color: var(--secondary-color, #f8f9ff);
  border-radius: var(--card-radius, 16px);
  padding: 2rem;
  margin: 2rem 0;
`;

const ExpectationTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--button-text, #1f2937);
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const ExpectationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ExpectationItem = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 250px;
`;

const ExpectationNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color, #2c3e50);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const ExpectationContent = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--button-text, #1f2937);
    font-family: var(--heading-font, 'Inter, sans-serif');
  }
  
  p {
    font-size: 0.875rem;
    color: var(--button-text, #6b7280);
    line-height: 1.5;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 32px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--card-background, transparent);
  border-radius: var(--card-radius, 12px);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #f0f0f0;
  color: var(--text-color, #333);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color, #2c3e50);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
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
  justify-content: center;
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
  const effectiveColor = survey.color || '#7c3aed'; // Default to purple if no color provided
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
    estimatedTime: '3-5',
    estimatedTimeSeconds: 180, // Default 3 minutes in seconds
    questionCount: 8,
    sectionCount: 3
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
          console.log('Received time data from event:', timeData);
          
          // Check if we already have this data to prevent unnecessary re-renders
          if (!dynamicTimeData || 
              dynamicTimeData.timestamp !== timeData.timestamp ||
              dynamicTimeData.totalEstimatedSeconds !== timeData.totalEstimatedSeconds) {
            
            console.log('Time data changed, updating state');
            setDynamicTimeData(timeData);
            setTimeCalculationComplete(true);
          } else {
            console.log('Time data unchanged, skipping update');
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
          console.log(`Found stored time data for survey ${survey._id}:`, timeData);
          
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
              console.log(`Using dynamic time data: ${timeData.totalEstimatedSeconds} seconds (${timeData.minutes} minutes)`);
            }, 100);
          } else {
            console.log('Stored time data is too old, will recalculate');
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
      console.log('Fetching survey metadata for survey ID:', survey._id);
      
      // First get the survey metadata for basic info
      Meteor.call('getSurveyMetadata', survey._id, (error: any, result: any) => {
        if (error) {
          console.error('Error fetching survey metadata:', error);
          setLoading(false);
        } else if (result) {
          console.log('Received survey metadata:', result);
          
          // Get all question IDs from the survey
          if (result.questionIds && result.questionIds.length > 0) {
            // Now fetch all question documents to calculate time directly
            Meteor.call('getQuestionDocuments', result.questionIds, (questionError: any, questionDocs: any) => {
              if (questionError) {
                console.error('Error fetching question documents:', questionError);
                // Fall back to the metadata from server
                setMetadata({
                  estimatedTime: result.estimatedTime || '3-5',
                  estimatedTimeSeconds: result.estimatedTimeSeconds || 180,
                  questionCount: result.questionCount || 8,
                  sectionCount: result.sectionCount || 3
                });
                // Mark time calculation as complete even with fallback data
                setTimeCalculationComplete(true);
              } else if (questionDocs && questionDocs.length > 0) {
                // Calculate total time directly from question documents
                const totalEstimatedSeconds = questionDocs.reduce((total: number, doc: any) => {
                  const seconds = doc.currentVersion?.estimatedTimeSeconds || 30; // Default to 30 seconds
                  console.log(`Question ${doc._id}: ${seconds} seconds`);
                  return total + seconds;
                }, 0);
                
                // Add 30 seconds buffer for survey overhead (reading intro, etc.)
                const totalWithBuffer = totalEstimatedSeconds + 30;
                console.log('Total seconds with buffer:', totalWithBuffer);
                
                const minutes = Math.ceil(totalWithBuffer / 60);
                
                // Log with the requested format
                
                // Store the calculated values in state
                setMetadata({
                  estimatedTime: `${minutes}`,
                  estimatedTimeSeconds: totalWithBuffer,
                  questionCount: questionDocs.length,
                  sectionCount: result.sectionCount || 3
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
                  console.log('Time calculation complete, updating UI...');
                } catch (storageError) {
                  console.error('Error storing survey time data:', storageError);
                }
              }
              setLoading(false);
            });
          } else {
            // No question IDs found, use the metadata from server and mark calculation complete
            setMetadata({
              estimatedTime: result.estimatedTime || '3-5',
              estimatedTimeSeconds: result.estimatedTimeSeconds || 180,
              questionCount: result.questionCount || 8,
              sectionCount: result.sectionCount || 3
            });
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
  console.log("questionCount----", questionCount);
  // Log values for debugging
  console.log('ModernSurveyWelcome - Time calculation values:', {
    'survey.estimatedTime': survey.estimatedTime,
    'metadata.estimatedTime': metadata.estimatedTime,
    'final estimatedTime': estimatedTime,
    'totalQuestions prop': totalQuestions,
    'survey.questionCount': survey.questionCount,
    'metadata.questionCount': metadata.questionCount,
    'final questionCount': questionCount,
    'totalSections prop': totalSections,
    'survey.sectionCount': survey.sectionCount,
    'metadata.sectionCount': metadata.sectionCount,
    'final sectionCount': sectionCount
  });
  
  return (
    <WelcomeContainer>
      <WelcomeHeader>
        <WelcomeHeaderContent style={{ flex: featuredImage ? 1 : 'auto', maxWidth: featuredImage ? '60%' : '100%' }}>
          {logo && (
            <LogoContainer>
              <img src={logo} alt="Survey logo" />
            </LogoContainer>
          )}
          <h1>{survey.title || 'Customer Experience Survey'}</h1>
          <p dangerouslySetInnerHTML={{ __html: survey.description || 'Help us understand your experience and improve our services. Your feedback matters and takes just a few minutes to complete.' }} />
        </WelcomeHeaderContent>
        {featuredImage && (
          <WelcomeHeaderImage>
            <img src={featuredImage} alt="Survey featured image" />
          </WelcomeHeaderImage>
        )}
      </WelcomeHeader>
      <ContentContainer>


        {/* Stats Cards */}
        <StatsContainer>
          <StatCard>
            <StatIcon>
              <FaRegClock size={20} />
            </StatIcon>
            <StatValue>
              {(() => {
                console.log('Avg Minutes display logic - State values:', {
                  loading,
                  timeCalculationComplete,
                  dynamicTimeData,
                  'dynamicTimeData?.minutes': dynamicTimeData?.minutes,
                  'metadata.estimatedTimeSeconds': metadata.estimatedTimeSeconds,
                  'Math.ceil(metadata.estimatedTimeSeconds / 60)': Math.ceil(metadata.estimatedTimeSeconds / 60)
                });
                
                if (loading) {
                  console.log('Showing ... because loading is true');
                  return '...';
                }
                
                // Always prioritize metadata.estimatedTimeSeconds from getSurveyMetadata (combined sources)
                const finalMinutes = Math.ceil(metadata.estimatedTimeSeconds / 60) || 0;
                console.log('Final minutes from metadata:', finalMinutes);
                return finalMinutes;
              })()}
            </StatValue>
            <StatLabel>
              Avg Minutes
            </StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon>
              <FaRegCheckCircle size={20} />
            </StatIcon>
            <StatValue>
              {(() => {
                console.log('Total Questions display logic - State values:', {
                  loading,
                  timeCalculationComplete,
                  dynamicTimeData,
                  'dynamicTimeData?.questionCount': dynamicTimeData?.questionCount,
                  totalQuestions,
                  'metadata.questionCount': metadata.questionCount,
                  'survey.questionCount': survey.questionCount
                });
                
                if (loading) {
                  console.log('Showing ... because loading is true');
                  return '...';
                }
                
                // Always prioritize metadata.questionCount from getSurveyMetadata (combined sources)
                const finalQuestionCount = metadata.questionCount || totalQuestions || survey.questionCount || 0;
                console.log('Final question count:', finalQuestionCount);
                return finalQuestionCount;
              })()}
            </StatValue>
            <StatLabel>Total questions</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#2c3e50">
              <FaRegListAlt size={20} />
            </StatIcon>
            <StatValue>
              {(() => {
                console.log('Question Sections display logic - State values:', {
                  loading,
                  totalSections,
                  sectionCount,
                  'metadata.sectionCount': metadata.sectionCount,
                  'survey.sectionCount': survey.sectionCount
                });
                
                if (loading) {
                  console.log('Showing ... because loading is true');
                  return '...';
                }
                
                // Always prioritize metadata.sectionCount from getSurveyMetadata (combined sources)
                const finalSectionCount = metadata.sectionCount || totalSections || survey.sectionCount || 0;
                console.log('Final section count:', finalSectionCount);
                return finalSectionCount;
              })()}
            </StatValue>
            <StatLabel>Question sections</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#2c3e50">
              <FaRegHeart size={20} />
            </StatIcon>
            <StatValue>100%</StatValue>
            <StatLabel>Anonymous</StatLabel>
          </StatCard>
        </StatsContainer>

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

        {/* What to expect section */}
        <ExpectationSection>
          <ExpectationTitle>What to expect</ExpectationTitle>
          <ExpectationList>
            <ExpectationItem>
              <ExpectationNumber>1</ExpectationNumber>
              <ExpectationContent>
                <h3>Overall Experience</h3>
                <p>Share your general satisfaction and likelihood to recommend us</p>
              </ExpectationContent>
            </ExpectationItem>
            
            <ExpectationItem>
              <ExpectationNumber>2</ExpectationNumber>
              <ExpectationContent>
                <h3>Service Quality</h3>
                <p>Rate specific aspects like speed, staff helpfulness, and areas for improvement</p>
              </ExpectationContent>
            </ExpectationItem>
            
            <ExpectationItem>
              <ExpectationNumber>3</ExpectationNumber>
              <ExpectationContent>
                <h3>Additional Feedback</h3>
                <p>Optional comments and follow-up preferences</p>
              </ExpectationContent>
            </ExpectationItem>
          </ExpectationList>
        </ExpectationSection>

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
              console.log('Reset survey timer for new attempt');
            } catch (error) {
              console.error('Error resetting survey timer:', error);
            }
            
            // Continue with original onStart function
            onStart();
          }}>
            Start Survey <FiArrowRight size={18} />
          </StartButton>
        </ButtonContainer>
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default ModernSurveyWelcome;
