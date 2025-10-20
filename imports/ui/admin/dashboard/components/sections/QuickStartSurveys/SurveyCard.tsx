import React from 'react';
import styled from 'styled-components';
import { QuickStartSurveyData } from '../../../types/dashboard.types';
import { Button } from '../../shared/Button';
import { FaPlay, FaEye } from 'react-icons/fa';

interface SurveyCardProps {
  data: QuickStartSurveyData;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const Tag = styled.span<{ category: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  background: ${props => {
    switch (props.category.toLowerCase()) {
      case 'wps': return '#e8f5e8';
      case 'built environment': return '#e3f2fd';
      case 'safety': return '#fff3e0';
      case 'policy': return '#f3e5f5';
      case 'compliance': return '#e0f2f1';
      case 'change notice': return '#fce4ec';
      case 'read & understood': return '#f1f8e9';
      default: return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.category.toLowerCase()) {
      case 'wps': return '#2e7d32';
      case 'built environment': return '#1565c0';
      case 'safety': return '#ef6c00';
      case 'policy': return '#7b1fa2';
      case 'compliance': return '#00695c';
      case 'change notice': return '#c2185b';
      case 'read & understood': return '#558b2f';
      default: return '#666';
    }
  }};
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
`;

export const SurveyCard: React.FC<SurveyCardProps> = ({ data }) => {
  const handleLaunch = () => {
    console.log(`Launch survey: ${data.title}`);
    // Add launch logic here
  };

  const handlePreview = () => {
    console.log(`Preview survey: ${data.title}`);
    // Add preview logic here
  };

  return (
    <CardContainer>
      <Header>
        <Title>{data.title}</Title>
        <Description>{data.description}</Description>
      </Header>

      <TagsContainer>
        {data.tags.map((tag, index) => (
          <Tag key={index} category={data.category}>
            {tag}
          </Tag>
        ))}
      </TagsContainer>

      <Footer>
        <Button 
          variant="primary" 
          size="small" 
          icon={<FaPlay />}
          onClick={handleLaunch}
        >
          Launch
        </Button>
        <Button 
          variant="outline" 
          size="small" 
          icon={<FaEye />}
          onClick={handlePreview}
        >
          Preview
        </Button>
      </Footer>
    </CardContainer>
  );
};
