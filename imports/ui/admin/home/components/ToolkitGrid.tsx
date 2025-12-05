import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ToolCard from './ToolCard';
import { toolsData } from '../data/toolsData';
import { useDynamicColors } from '../theme/useDynamicColors';

const GridContainer = styled.section`
  margin-bottom: 60px;
`;

const SectionHeader = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2<{ textColor: string; borderColor: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.textColor};
  margin: 0 0 12px 0;
  padding-left: 16px;
  border-left: 4px solid ${props => props.borderColor};
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 16px;
  color: ${props => props.color};
  margin: 0;
  line-height: 1.5;
  padding-left: 20px;
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
const getCategoriesConfig = (colors: any) => [
  {
    id: 'culture' as const,
    title: 'Culture Assessments',
    description: 'Evaluate and enhance organizational culture with comprehensive tools like WPS, prebuilt surveys, and custom assessment builders designed to uncover insights and drive positive change.',
    bgColor: colors.category.culture
  },
  {
    id: 'operations' as const,
    title: 'Operations and Governance',
    description: 'Streamline compliance and improve operational efficiency using robust solutions such as the Change Notification Builder and Policy Review tools, tailored to support effective governance and procedural excellence.',
    bgColor: colors.category.operations
  },
  {
    id: 'benchmarking' as const,
    title: 'Benchmarking Tools',
    description: 'Leverage in-depth benchmarking tools, including Knowledge Check and Root Cause Analysis, to identify performance gaps, facilitate continuous improvement, and maintain a competitive edge in your industry.',
    bgColor: colors.category.benchmarking
  }
];

const ToolkitGrid: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();
  const categories = getCategoriesConfig(colors);

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
          <GridContainer key={category.id} id={category.id}>
            <SectionHeader>
              <SectionTitle 
                textColor={colors.textDark} 
                borderColor={category.bgColor}
              >
                {category.title}
              </SectionTitle>
              <SectionSubtitle color={colors.textMedium}>
                {category.description}
              </SectionSubtitle>
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
