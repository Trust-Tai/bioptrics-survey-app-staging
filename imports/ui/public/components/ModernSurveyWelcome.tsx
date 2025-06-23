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
}

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  background-color: #f9f7ff;
  
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
    color: #7c3aed;
  }
  
  p {
    font-size: 1.25rem;
    color: #4b5563;
    line-height: 1.6;
    max-width: 600px;
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
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    justify-content: center;
  }
`;

const ContentContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ExpectationSection = styled.div`
  background-color: #f8f9ff;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
`;

const ExpectationTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
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
  background-color: #8b5cf6;
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
    color: #1f2937;
  }
  
  p {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
  }
`;

const SurveyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8a4baf 0%, #7c3aed 100%);
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
  color: #333;
  margin: 0 0 8px 0;
`;

const SurveyDescription = styled.p`
  font-size: 16px;
  color: #555;
  margin: 0;
  line-height: 1.5;
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
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #f0f0f0;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.color};
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



const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const StartButton = styled.button`
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  
  &:hover {
    background-color: #6d28d9;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
  }
  
  svg {
    margin-left: 8px;
  }
`;

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

const ModernSurveyWelcome: React.FC<ModernSurveyWelcomeProps> = ({ survey, onStart }) => {
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
  const surveyImage = survey.featuredImage || survey.image || 'https://images.unsplash.com/photo-1581092921461-eab10380ed66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80';

  // State for survey metadata
  const [loading, setLoading] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<{
    estimatedTime: string;
    questionCount: number;
    sectionCount: number;
  }>({ 
    estimatedTime: '3-5',
    questionCount: 8,
    sectionCount: 3
  });

  // Featured image for the header (would be dynamic in a real implementation)
  const featuredImage = survey.featuredImage || 'https://images.unsplash.com/photo-1581092921461-eab10380ed66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80';

  // Fetch survey metadata
  useEffect(() => {
    if (survey._id) {
      setLoading(true);
      console.log('Fetching survey metadata for survey ID:', survey._id);
      
      Meteor.call('getSurveyMetadata', survey._id, (error: any, result: any) => {
        if (error) {
          console.error('Error fetching survey metadata:', error);
        } else if (result) {
          console.log('Received survey metadata:', result);
          setMetadata({
            estimatedTime: result.estimatedTime || '3-5',
            questionCount: result.questionCount || 8,
            sectionCount: result.sectionCount || 3
          });
        } else {
          console.warn('No result received from getSurveyMetadata');
        }
        setLoading(false);
      });
    }
  }, [survey._id]);
  
  // Use the metadata
  const { estimatedTime, questionCount, sectionCount } = metadata;
  
  return (
    <WelcomeContainer>
      <WelcomeHeader>
        <WelcomeHeaderContent>
          <h1>{survey.title || 'Customer Experience Survey'}</h1>
          <p dangerouslySetInnerHTML={{ __html: survey.description || 'Help us understand your experience and improve our services. Your feedback matters and takes just a few minutes to complete.' }} />
        </WelcomeHeaderContent>
        <WelcomeHeaderImage>
          <img src={featuredImage} alt="Survey featured image" />
        </WelcomeHeaderImage>
      </WelcomeHeader>
      <ContentContainer>


        {/* Stats Cards */}
        <StatsContainer>
          <StatCard>
            <StatIcon color="#4f46e5">
              <FaRegClock size={20} />
            </StatIcon>
            <StatValue>{loading ? '...' : estimatedTime}</StatValue>
            <StatLabel>Minutes to complete</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#10b981">
              <FaRegCheckCircle size={20} />
            </StatIcon>
            <StatValue>{loading ? '...' : (questionCount || survey.questionCount || 0)}</StatValue>
            <StatLabel>Total questions</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#8b5cf6">
              <FaRegListAlt size={20} />
            </StatIcon>
            <StatValue>{loading ? '...' : sectionCount}</StatValue>
            <StatLabel>Question sections</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#f43f5e">
              <FaRegHeart size={20} />
            </StatIcon>
            <StatValue>100%</StatValue>
            <StatLabel>Anonymous</StatLabel>
          </StatCard>
        </StatsContainer>

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
          <StartButton onClick={onStart}>
            Start Survey <FiArrowRight size={18} />
          </StartButton>
        </ButtonContainer>
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default ModernSurveyWelcome;
