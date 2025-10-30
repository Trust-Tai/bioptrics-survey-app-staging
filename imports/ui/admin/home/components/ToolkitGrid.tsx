import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ToolCard from './ToolCard';
import { toolsData } from '../data/toolsData';

const GridContainer = styled.section`
  margin-bottom: 60px;
`;

const SectionHeader = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ToolkitGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleToolClick = (link: string) => {
    if (link && link !== '#') {
      navigate(link);
    } else {
      console.log('Tool link not yet configured');
    }
  };

  return (
    <GridContainer>
      <SectionHeader>
        <SectionTitle>Your Culture Toolkit</SectionTitle>
        <SectionSubtitle>
          Select any tool to get started. Each includes built-in guidance and best practices to ensure success.
        </SectionSubtitle>
      </SectionHeader>
      
      <Grid>
        {toolsData.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => handleToolClick(tool.link)}
          />
        ))}
      </Grid>
    </GridContainer>
  );
};

export default ToolkitGrid;
