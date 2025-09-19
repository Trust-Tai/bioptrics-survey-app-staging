import React from 'react';
import styled from 'styled-components';

interface HeaderBarProps {
  surveyTitle?: string;
  averageTime?: string;
  logo?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ surveyTitle, averageTime, logo }) => {
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
          {averageTime && <AverageTimeTag>{averageTime}</AverageTimeTag>}
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
  background-color: #f5f0f7;
  color: #552A47;
  font-size: 14px;
  padding: 4px 12px 0px 12px;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  margin-left: 50px;
  margin-top: 5px;
  white-space: nowrap;
`;

export default HeaderBar;
