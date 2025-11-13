import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart, Target, BarChart3, TrendingUp, Gift, MessageCircle, Search as SearchIcon } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { colors } from './home/theme/colors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.white};
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.orange} 0%, #ff8534 100%);
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

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.textMedium};
  display: flex;
  align-items: center;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${colors.orange};
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

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${colors.grayLight};
  border-radius: 6px;
  
  span {
    color: ${colors.textMedium};
    font-size: 14px;
    font-weight: 500;
  }
`;

const ToggleButton = styled.button<{ borderColor?: string }>`
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid ${colors.borderGray};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textDark};
  margin-bottom: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${colors.grayLight};
    border-color: ${props => props.borderColor || colors.orange};
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

const QuestionHeader = styled.div`
  font-weight: 600;
  color: ${colors.textDark};
  font-size: 13px;
  margin-bottom: 6px;
`;

const QuestionText = styled.div`
  color: ${colors.textMedium};
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

  const toggleQuestions = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <Title>Pre-built Survey Solutions</Title>
            <Subtitle>Expert-designed surveys ready to deploy in minutes</Subtitle>
          </HeaderContent>
        </Header>

        <SearchSection>
          <SearchWrapper>
            <SearchIconWrapper>
              <SearchIcon size={18} />
            </SearchIconWrapper>
            <SearchBar placeholder="Search survey templates..." />
          </SearchWrapper>
        </SearchSection>

        <Grid>
          {/* Card 1: Employee Engagement */}
          <Card>
            <CardHeader bgColor="#ed6801">
              <IconWrapper>
                <Heart size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Employee Engagement</CardTitle>
              <CardDescription>Measure team satisfaction and motivation</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 25</span>
                <span>5-7 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#ed6801" onClick={() => toggleQuestions('engagement')}>
                {expandedCard === 'engagement' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'engagement' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>I am satisfied with my current role and responsibilities</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>I feel valued and appreciated at work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>My work provides me with a sense of accomplishment</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>I would recommend this organization as a great place to work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Multiple Choice</QuestionHeader>
                    <QuestionText>How likely are you to stay with the company in the next year?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#ed6801">Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 2: Leadership Assessment */}
          <Card>
            <CardHeader bgColor="#325b9b">
              <IconWrapper>
                <Target size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Leadership Assessment</CardTitle>
              <CardDescription>Evaluate leadership effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 30</span>
                <span>8-10 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#325b9b" onClick={() => toggleQuestions('leadership')}>
                {expandedCard === 'leadership' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'leadership' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>Leadership communicates clear vision and direction</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>Leaders are accessible and approachable</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>Management supports professional development</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>Leaders demonstrate integrity and ethical behavior</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Text</QuestionHeader>
                    <QuestionText>What leadership qualities do you value most?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#325b9b">Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 3: Organizational Culture */}
          <Card>
            <CardHeader bgColor="#d29b0a">
              <IconWrapper>
                <BarChart3 size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Organizational Culture</CardTitle>
              <CardDescription>Assess workplace culture health</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 35</span>
                <span>10-12 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#d29b0a" onClick={() => toggleQuestions('culture')}>
                {expandedCard === 'culture' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'culture' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>Our workplace culture promotes collaboration</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>I feel a sense of belonging at work</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>The organization values diversity and inclusion</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>Innovation and creativity are encouraged</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Text</QuestionHeader>
                    <QuestionText>Describe the culture in three words</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#d29b0a">Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 4: Wellness Check */}
          <Card>
            <CardHeader bgColor="#ed6801">
              <IconWrapper>
                <TrendingUp size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Wellness Check</CardTitle>
              <CardDescription>Monitor employee wellbeing</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 20</span>
                <span>5 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#ed6801" onClick={() => toggleQuestions('wellness')}>
                {expandedCard === 'wellness' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'wellness' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>I feel physically healthy and energized</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>I maintain a good work-life balance</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>I have access to wellness resources and support</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>My workload is manageable</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Multiple Choice</QuestionHeader>
                    <QuestionText>How often do you feel stressed at work?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#ed6801">Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 5: Onboarding Experience */}
          <Card>
            <CardHeader bgColor="#325b9b">
              <IconWrapper>
                <Gift size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>Onboarding Experience</CardTitle>
              <CardDescription>Gather new hire feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 15</span>
                <span>4-5 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#325b9b" onClick={() => toggleQuestions('onboarding')}>
                {expandedCard === 'onboarding' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'onboarding' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>The onboarding process was well-organized</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>I received adequate training for my role</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>My team welcomed me warmly</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>I have the tools and resources I need to succeed</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Text</QuestionHeader>
                    <QuestionText>What could improve the onboarding experience?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#325b9b">Use This Template →</UseButton>
            </CardContent>
          </Card>

          {/* Card 6: 360° Feedback */}
          <Card>
            <CardHeader bgColor="#d29b0a">
              <IconWrapper>
                <MessageCircle size={24} strokeWidth={2} />
              </IconWrapper>
              <CardTitle>360° Feedback</CardTitle>
              <CardDescription>Comprehensive performance review</CardDescription>
            </CardHeader>
            <CardContent>
              <MetaInfo>
                <span>Questions: 40</span>
                <span>12-15 min</span>
              </MetaInfo>
              <ToggleButton borderColor="#d29b0a" onClick={() => toggleQuestions('feedback')}>
                {expandedCard === 'feedback' ? '▲ Hide Questions' : '▼ View Questions'}
              </ToggleButton>
              {expandedCard === 'feedback' && (
                <QuestionList>
                  <QuestionItem>
                    <QuestionHeader>Q1 • Rating Scale</QuestionHeader>
                    <QuestionText>Demonstrates strong communication skills</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q2 • Rating Scale</QuestionHeader>
                    <QuestionText>Shows leadership and initiative</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q3 • Rating Scale</QuestionHeader>
                    <QuestionText>Collaborates effectively with team members</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q4 • Rating Scale</QuestionHeader>
                    <QuestionText>Delivers high-quality work consistently</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q5 • Text</QuestionHeader>
                    <QuestionText>What are this person's greatest strengths?</QuestionText>
                  </QuestionItem>
                  <QuestionItem>
                    <QuestionHeader>Q6 • Text</QuestionHeader>
                    <QuestionText>What areas could benefit from development?</QuestionText>
                  </QuestionItem>
                </QuestionList>
              )}
              <UseButton bgColor="#d29b0a">Use This Template →</UseButton>
            </CardContent>
          </Card>
        </Grid>
      </PageContainer>
    </AdminLayout>
  );
};

export default SurveyCatalog;
