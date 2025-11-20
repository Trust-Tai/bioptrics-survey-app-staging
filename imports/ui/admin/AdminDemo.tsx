import React from 'react';
import styled from 'styled-components';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
const body = document.body;
body.style.padding = '0';
body.style.margin = '0';
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #ffffff;
`;

const HeaderBar = styled.header`
  padding: 32px 24px 8px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: center;
`;

const BrandLogo = styled.img`
  max-width: 260px;
  width: 100%;
  height: auto;
  display: block;
`;

const ContentWrapper = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-items: center;
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Card = styled.button<{ disabled?: boolean }>`
  border: none;
  padding: 0;
  text-align: left;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  background: transparent;
`;

const CardInner = styled.div<{ variant: 'pulse' | 'lms' | 'team'; disabled?: boolean }>`
  height: 400px;
  width: 300px;
  max-width: 300px;
  border-radius: 10px;
  padding: 40px 25px 25px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  opacity: ${({ disabled }) => (disabled ? 0.75 : 1)};
  background: ${({ variant }) => {
    if (variant === 'pulse') {
      return 'linear-gradient(180deg, rgba(255, 155, 33, 1) 0%, rgba(190, 107, 6, 1) 100%)';
    }
    if (variant === 'lms') {
      return 'linear-gradient(180deg, rgba(50, 91, 155, 1) 0%, rgba(40, 70, 122, 1) 100%)';
    }
    return 'linear-gradient(180deg, rgba(255, 207, 81, 1) 0%, rgba(170, 123, 0, 1) 100%)';
  }};

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-6px)')};
    box-shadow: ${({ disabled }) =>
      disabled ? '0 14px 30px rgba(15, 23, 42, 0.14)' : '0 24px 60px rgba(15, 23, 42, 0.35)'};
  }
`;

const CardLogoWrapper = styled.div`
  width: 231px;
  height: 80px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.26);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const CardLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 10px;
`;

const CardBody = styled.div`
  color: #ffffff;
`;

const CardSpacer = styled.div`
  flex: 1;
`;

const CardBottomPanel = styled.div`
  width: 100%;
  max-width: 250px;
  border-radius: 16px;
  padding: 16px 18px 14px;
  background: rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(2px);
`;

const CardActionRow = styled.div`
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CardActionText = styled.span`
  opacity: 0.96;
`;

const CardActionIcon = styled.span`
  font-size: 13px;
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const CardMeta = styled.div`
  font-size: 13px;
  line-height: 1.55;
  max-width: 260px;
`;

const FooterTagline = styled.div`
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TaglineIcon = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 10px;
  display: block;
`;

const TaglineText = styled.div`
  max-width: 498px;
  font-size: 14px;
  line-height: 14px;
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
  text-align: center;
`;

const AdminDemo: React.FC = () => {
  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer>
      <HeaderBar>
        <BrandLogo src="/BIOPTRICS_LOGO_FIXED_BLACK.png" alt="Bioptrics" />
      </HeaderBar>

      <ContentWrapper>
        <CardsGrid>
          <Card onClick={() => handleOpen('https://pulse.bioptrics.com')}>
            <CardInner variant="pulse">
              <CardLogoWrapper>
                <CardLogo src="/bioptrics_fixed_black.png" alt="Bioptrics Pulse" />
              </CardLogoWrapper>
              <CardSpacer />
              <CardBottomPanel>
                <CardBody>
                  <CardActionRow>
                    <CardActionText>Measure</CardActionText>
                    <CardActionIcon>↗</CardActionIcon>
                  </CardActionRow>
                  <CardTitle>Bioptrics Pulse</CardTitle>
                  <CardMeta>
                    Launch survey insights and organizational pulse analytics.
                  </CardMeta>
                </CardBody>
              </CardBottomPanel>
            </CardInner>
          </Card>

          <Card onClick={() => handleOpen('https://lms.bioptrics.com')}>
            <CardInner variant="lms">
              <CardLogoWrapper>
                <CardLogo src="/lms-logo.png" alt="Bioptrics LMS" />
              </CardLogoWrapper>
              <CardSpacer />
              <CardBottomPanel>
                <CardBody>
                  <CardActionRow>
                    <CardActionText>Learn</CardActionText>
                    <CardActionIcon>↗</CardActionIcon>
                  </CardActionRow>
                  <CardTitle>Bioptrics LMS</CardTitle>
                  <CardMeta>
                    Open the learning experience to support capability-building.
                  </CardMeta>
                </CardBody>
              </CardBottomPanel>
            </CardInner>
          </Card>

          <Card disabled>
            <CardInner variant="team" disabled>
              <CardLogoWrapper>
                <CardLogo src="/team-logo.png" alt="Bioptrics Team" />
              </CardLogoWrapper>
              <CardSpacer />
              <CardBottomPanel>
                <CardBody>
                  <CardActionRow>
                    <CardActionText>Engage</CardActionText>
                    <CardActionIcon>↗</CardActionIcon>
                  </CardActionRow>
                  <CardTitle>Bioptrics Team</CardTitle>
                  <CardMeta>
                    Measure team dynamics and drive performance growth.
                  </CardMeta>
                </CardBody>
              </CardBottomPanel>
            </CardInner>
          </Card>
        </CardsGrid>

        <FooterTagline>
          <TaglineIcon src="/information_icon.png" alt="Information" />
          <TaglineText>
            Empowering workplace wellbeing through data-driven insights and learning
          </TaglineText>
        </FooterTagline>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AdminDemo;
