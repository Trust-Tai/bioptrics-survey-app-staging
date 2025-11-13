import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart, Target, BarChart3, TrendingUp, Gift, MessageCircle, Search as SearchIcon } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useDynamicColors } from './home/theme/useDynamicColors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div<{ bgColor: string }>`
  min-height: 100vh;
  background: ${props => props.bgColor};
`;

const Header = styled.div<{ primaryColor: string }>`
  background: linear-gradient(135deg, ${props => props.primaryColor} 0%, ${props => props.primaryColor}dd 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const SearchSection = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const SearchWrapper = styled.div`
  position: relative;
  max-width: 500px;
`;

const SearchIconWrapper = styled.div<{ color: string }>`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.color};
  display: flex;
  align-items: center;
`;

const SearchBar = styled.input<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
  }
`;

const Grid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div<{ bgColor: string }>`
  background: ${props => props.bgColor};
  padding: 32px;
  color: white;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
`;

const CardDescription = styled.p`
  margin: 0;
  opacity: 0.95;
  font-size: 14px;
  line-height: 1.5;
`;

const CardContent = styled.div`
  padding: 24px;
  background: white;
`;

const MetaInfo = styled.div<{ bgColor: string; textColor: string }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${props => props.bgColor};
  border-radius: 6px;
  
  span {
    color: ${props => props.textColor};
    font-size: 14px;
    font-weight: 500;
  }
`;

const ToggleButton = styled.button<{ borderColor: string; hoverBgColor: string; textColor: string; defaultBorderColor: string }>`
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid ${props => props.defaultBorderColor};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.textColor};
  margin-bottom: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.hoverBgColor};
    border-color: ${props => props.borderColor};
  }
`;

const QuestionList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const QuestionItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const QuestionHeader = styled.div<{ color: string }>`
  font-weight: 600;
  color: ${props => props.color};
  font-size: 13px;
  margin-bottom: 6px;
`;

const QuestionText = styled.div<{ color: string }>`
  color: ${props => props.color};
  font-size: 14px;
  line-height: 1.5;
`;

const UseButton = styled.button<{ bgColor: string }>`
  width: 100%;
  padding: 14px;
  background: ${props => props.bgColor};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

// ============ MAIN COMPONENT ============
const SurveyCatalog: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const colors = useDynamicColors();

  const toggleQuestions = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Helper function to get card color based on category
  const getCardColor = (category: 'culture' | 'operations' | 'benchmarking') => {
    return colors.category[category];
  };

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        <Header primaryColor={colors.orange}>
          <HeaderContent>
            <Title>Pre-built Survey Solutions</Title>
            <Subtitle>Expert-designed surveys ready to deploy in minutes</Subtitle>
          </HeaderContent>
        </Header>

        <SearchSection>
          <SearchWrapper>
            <SearchIconWrapper color={colors.textMedium}>
              <SearchIcon size={18} />
            </SearchIconWrapper>
            <SearchBar 
              borderColor={colors.borderGray}
              focusBorderColor={colors.orange}
              placeholder="Search survey templates..." 
            />
          </SearchWrapper>
        </SearchSection>

        <Grid>
          {/* Card 1: Employee Engagement */}
          <Card>
            <CardHeader bgColor={getCardColor('culture')}>
              <IconWrapper>
                <Heart size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Employee Engagement</CardTitle>
              <CardDescription>Measure team satisfaction and motivation</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 25</span>
                <span>5-7 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('culture')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('engagement')}
              >
                {expandedCard === 'engagement' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'engagement' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I am satisfied with my current role and responsibilities</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I feel valued and appreciated at work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>My work provides me with a sense of accomplishment</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I would recommend this organization as a great place to work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Multiple Choice</QuestionHeader>
                    <QuestionText color={colors.textMedium}>How likely are you to stay with the company in the next year?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('culture')}>Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 2: Leadership Assessment */}
          <Card>
            <CardHeader bgColor={getCardColor('operations')}>
              <IconWrapper>
                <Target size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Leadership Assessment</CardTitle>
              <CardDescription>Evaluate leadership effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 30</span>
                <span>8-10 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('operations')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('leadership')}
              >
                {expandedCard === 'leadership' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'leadership' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Leadership communicates clear vision and direction</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Leaders are accessible and approachable</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Management supports professional development</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Leaders demonstrate integrity and ethical behavior</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Text</QuestionHeader>
                    <QuestionText color={colors.textMedium}>What leadership qualities do you value most?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('operations')}>Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 3: Organizational Culture */}
          <Card>
            <CardHeader bgColor={getCardColor('benchmarking')}>
              <IconWrapper>
                <BarChart3 size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Organizational Culture</CardTitle>
              <CardDescription>Assess workplace culture health</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 35</span>
                <span>10-12 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('benchmarking')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('culture')}
              >
                {expandedCard === 'culture' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'culture' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Our workplace culture promotes collaboration</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I feel a sense of belonging at work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>The organization values diversity and inclusion</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Innovation and creativity are encouraged</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Text</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Describe the culture in three words</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('benchmarking')}>Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 4: Wellness Check */}
          <Card>
            <CardHeader bgColor={getCardColor('culture')}>
              <IconWrapper>
                <TrendingUp size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Wellness Check</CardTitle>
              <CardDescription>Monitor employee wellbeing</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 20</span>
                <span>5 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('culture')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('wellness')}
              >
                {expandedCard === 'wellness' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'wellness' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I feel physically healthy and energized</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I maintain a good work-life balance</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I have access to wellness resources and support</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>My workload is manageable</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Multiple Choice</QuestionHeader>
                    <QuestionText color={colors.textMedium}>How often do you feel stressed at work?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('culture')}>Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 5: Onboarding Experience */}
          <Card>
            <CardHeader bgColor={getCardColor('operations')}>
              <IconWrapper>
                <Gift size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Onboarding Experience</CardTitle>
              <CardDescription>Gather new hire feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 15</span>
                <span>4-5 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('operations')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('onboarding')}
              >
                {expandedCard === 'onboarding' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'onboarding' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>The onboarding process was well-organized</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I received adequate training for my role</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>My team welcomed me warmly</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>I have the tools and resources I need to succeed</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Text</QuestionHeader>
                    <QuestionText color={colors.textMedium}>What could improve the onboarding experience?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('operations')}>Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 6: 360° Feedback */}
          <Card>
            <CardHeader bgColor={getCardColor('benchmarking')}>
              <IconWrapper>
                <MessageCircle size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>360° Feedback</CardTitle>
              <CardDescription>Comprehensive performance review</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo bgColor={colors.grayLight} textColor={colors.textMedium}>
                <span>Questions: 40</span>
                <span>12-15 min</span>
              </MetaInfo>
              <ToggleButton 
                borderColor={getCardColor('benchmarking')} 
                hoverBgColor={colors.grayLight}
                textColor={colors.textDark}
                defaultBorderColor={colors.borderGray}
                onClick={() => toggleQuestions('feedback')}
              >
                {expandedCard === 'feedback' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'feedback' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Demonstrates strong communication skills</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Shows leadership and initiative</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Collaborates effectively with team members</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText color={colors.textMedium}>Delivers high-quality work consistently</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q5 • Text</QuestionHeader>
                    <QuestionText color={colors.textMedium}>What are this person's greatest strengths?</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader color={colors.textDark}>Q6 • Text</QuestionHeader>
                    <QuestionText color={colors.textMedium}>What areas could benefit from development?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor={getCardColor('benchmarking')}>Use This Template →</UseButton>
            </CardContent>
          </Card>
        </Grid>
      </PageContainer>
    </AdminLayout>
  );
};

export default SurveyCatalog;
