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

// Category configuration with titles and descriptions
const categories = [
  {
    id: 'culture' as const,
    title: 'Culture Assessments',
    description: 'Evaluate and enhance organizational culture with comprehensive tools like WPS, prebuilt surveys, and custom assessment builders designed to uncover insights and drive positive change.'
  },
  {
    id: 'operations' as const,
    title: 'Operations and Governance',
    description: 'Streamline compliance and improve operational efficiency using robust solutions such as the Change Notification Builder and Policy Review tools, tailored to support effective governance and procedural excellence.'
  },
  {
    id: 'benchmarking' as const,
    title: 'Benchmarking Tools',
    description: 'Leverage in-depth benchmarking tools, including Knowledge Check and Root Cause Analysis, to identify performance gaps, facilitate continuous improvement, and maintain a competitive edge in your industry.'
  }
];

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
    <>
      {categories.map((category) => {
        // Filter tools for this category
        const categoryTools = toolsData.filter(tool => tool.category === category.id);
        
        return (
          <GridContainer key={category.id}>
            <SectionHeader>
              <SectionTitle>{category.title}</SectionTitle>
              <SectionSubtitle>{category.description}</SectionSubtitle>
            </SectionHeader>
            
            <Grid>
              {categoryTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => handleToolClick(tool.link)}
                />
              ))}
            </Grid>
          </GridContainer>
        );
      })}
    </>
  );
};

export default ToolkitGrid;
