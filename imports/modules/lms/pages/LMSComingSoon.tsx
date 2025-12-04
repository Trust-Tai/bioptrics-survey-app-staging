import React from 'react';
import styled from 'styled-components';
import { FiBook, FiUsers, FiTrendingUp, FiAward, FiPlay, FiCalendar } from 'react-icons/fi';

const ComingSoonContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  max-width: 800px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 40px;
  font-weight: 400;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.8;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 50px 0;
`;

const FeatureCard = styled.div`
  padding: 30px 20px;
  border-radius: 15px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 24px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.6;
`;

const LaunchInfo = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-top: 40px;
`;

const LaunchTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LaunchText = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 20px;
`;

const NotifyButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const IntegrationNote = styled.div`
  background: #e6fffa;
  border: 1px solid #81e6d9;
  border-radius: 10px;
  padding: 20px;
  margin-top: 30px;
  text-align: left;
`;

const IntegrationTitle = styled.h4`
  color: #234e52;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IntegrationText = styled.p`
  color: #2c7a7b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

const LMSComingSoon: React.FC = () => {
  const handleNotifyMe = () => {
    // You can implement email notification signup here
    alert('Thanks for your interest! We\'ll notify you when the LMS module is ready.');
  };

  return (
    <ComingSoonContainer>
      <ContentCard>
        <Title>LMS Module</Title>
        <Subtitle>Learning Management System</Subtitle>
        <Description>
          A comprehensive learning management system that seamlessly integrates with your survey platform. 
          Create courses, track progress, and deliver engaging learning experiences to your team.
        </Description>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <FiBook />
            </FeatureIcon>
            <FeatureTitle>Course Builder</FeatureTitle>
            <FeatureDescription>
              Create interactive courses with multimedia content, quizzes, and assessments.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiUsers />
            </FeatureIcon>
            <FeatureTitle>Student Portal</FeatureTitle>
            <FeatureDescription>
              Intuitive interface for learners to access courses, track progress, and engage with content.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiTrendingUp />
            </FeatureIcon>
            <FeatureTitle>Progress Tracking</FeatureTitle>
            <FeatureDescription>
              Real-time analytics and reporting on learning progress and course completion rates.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiAward />
            </FeatureIcon>
            <FeatureTitle>Certifications</FeatureTitle>
            <FeatureDescription>
              Issue certificates and badges upon course completion to recognize achievements.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiPlay />
            </FeatureIcon>
            <FeatureTitle>Interactive Content</FeatureTitle>
            <FeatureDescription>
              Support for videos, documents, presentations, and interactive learning materials.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <FiCalendar />
            </FeatureIcon>
            <FeatureTitle>Scheduling</FeatureTitle>
            <FeatureDescription>
              Schedule live sessions, set deadlines, and manage learning timelines effectively.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <IntegrationNote>
          <IntegrationTitle>
            <FiTrendingUp />
            Survey Integration
          </IntegrationTitle>
          <IntegrationText>
            The LMS module will seamlessly integrate with your existing survey system. Survey results can automatically 
            recommend relevant courses, and course completions can trigger follow-up assessments. This creates a 
            complete learning and assessment ecosystem.
          </IntegrationText>
        </IntegrationNote>
      </ContentCard>
    </ComingSoonContainer>
  );
};

export default LMSComingSoon;
