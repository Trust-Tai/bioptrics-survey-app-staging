import React from 'react';
import styled from 'styled-components';
import { FaQuestionCircle, FaStar, FaTag } from 'react-icons/fa';

interface QuestionStatsProps {
  totalQuestions: number;
  avgQualityScore: number;
  totalTags: number;
  isLoading?: boolean;
}

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #552a47;
  font-size: 24px;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 4px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
`;

const LoadingPlaceholder = styled.div`
  height: 24px;
  width: 80px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 4px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const QuestionStats: React.FC<QuestionStatsProps> = ({ 
  totalQuestions, 
  avgQualityScore, 
  totalTags, 
  isLoading = false 
}) => {
  return (
    <StatsContainer>
      <StatCard>
        <IconWrapper>
          <FaQuestionCircle />
        </IconWrapper>
        <ContentWrapper>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <Value>{totalQuestions}</Value>
          )}
          <Label>Total Questions</Label>
        </ContentWrapper>
      </StatCard>
      
      <StatCard>
        <IconWrapper>
          <FaStar />
        </IconWrapper>
        <ContentWrapper>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <Value>{avgQualityScore.toFixed(1)}</Value>
          )}
          <Label>Avg Quality Score</Label>
        </ContentWrapper>
      </StatCard>
      
      <StatCard>
        <IconWrapper>
          <FaTag />
        </IconWrapper>
        <ContentWrapper>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <Value>{totalTags}</Value>
          )}
          <Label>Tags</Label>
        </ContentWrapper>
      </StatCard>
    </StatsContainer>
  );
};

export default QuestionStats;
