import React from 'react';
import styled from 'styled-components';
import { FiClock } from 'react-icons/fi';
import { useTimer } from '../contexts/TimerContext';

interface HeaderBarProps {
  surveyTitle?: string;
  averageTime?: string;
  logo?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ surveyTitle, averageTime, logo }) => {
  // Get timer state from context
  const { isRunning, elapsedTime } = useTimer();
  
  // For debugging
  console.log('HeaderBar render:', { isRunning, elapsedTime, averageTime });
  
  return (
    <HeaderContainer>
      <LeftSection>
        {logo ? (
          <LogoImage src={logo} alt="Logo" />
        ) : (
          <LogoText>TeamsynerG</LogoText>
        )}
      </LeftSection>
      <CenterSection>
        <SurveyTitleContainer>
          <SurveyTitleText as="h1">{surveyTitle || 'Survey'}</SurveyTitleText>
          {isRunning ? (
            <TimerRunningTag>
              <ClockIcon />
              <span>{elapsedTime}</span>
            </TimerRunningTag>
          ) : elapsedTime ? (
            <TimerRunningTag>
              <ClockIcon />
              <span>{elapsedTime}</span>
            </TimerRunningTag>
          ) : null}
          {averageTime ? (
            <AverageTimeTag>
              <ClockIcon />
              <span>{averageTime}</span>
            </AverageTimeTag>) : null}
        </SurveyTitleContainer>
      </CenterSection>
      <RightSection>
        {/* Right section can remain empty or be used for other elements in the future */}
      </RightSection>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 21px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  min-width: 180px;
`;

const CenterSection = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: space-around;
  padding: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 100px;
`;

const LogoImage = styled.img`
  max-height: 36px;
  max-width: 140px;
  object-fit: contain;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #552A47;
  font-family: 'Inter', sans-serif;
`;

const SurveyTitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const SurveyTitleText = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: rgba(85, 42, 71, 1);
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  text-align: left;
  line-height: 1.2;
  width: 100%;
`;

const AverageTimeTag = styled.div`
  background-color: #552a47;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 18px;
  color: #fff;
  margin-left: 55px;
  display: none;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`;
const TimerRunningTag = styled.div`
  background-color: #552a47;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 18px;
  color: #fff;
  margin-left: 55px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`;

const ClockIcon = styled(FiClock)`
  font-size: 18px;
  color: #fff;
  font-weight: 700;
`;

export default HeaderBar;
