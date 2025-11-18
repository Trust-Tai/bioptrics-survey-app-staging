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
  justify-content: center;
  background: #f7f5f0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
`;

const SuiteHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const SuiteTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1f2933;
  margin: 0 0 12px;
`;

const SuiteSubtitle = styled.p`
  margin: 0;
  font-size: 25px;
  line-height: 1.5;
  color: #4b5563;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

const CardInner = styled.div<{ disabled?: boolean }>`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  border: 1px solid ${({ disabled }) => (disabled ? '#e5e7eb' : 'rgba(107, 114, 128, 0.18)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.75 : 1)};

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-4px)')};
    box-shadow: ${({ disabled }) =>
      disabled ? '0 10px 20px rgba(15, 23, 42, 0.04)' : '0 16px 35px rgba(15, 23, 42, 0.10)'};
    border-color: ${({ disabled }) => (disabled ? '#e5e7eb' : '#FD9F2C')};
  }
`;

const IconWrapper = styled.div<{ bg: string }>`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: ${({ bg }) => bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
`;

const IconGlyph = styled.div`
  font-size: 36px;
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
`;

const CardAction = styled.div`
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: #FD9F2C;
  margin-bottom: 6px;
`;

const CardMeta = styled.div<{ emphasis?: boolean }>`
  font-size: 13px;
  text-align: center;
  color: ${({ emphasis }) => (emphasis ? '#9b1c1c' : '#6b7280')};
  font-weight: ${({ emphasis }) => (emphasis ? 600 : 400)};
`;

const HelperText = styled.p`
  margin-top: 16px;
  font-size: 13px;
  color: #6b7280;
  display:none;
`;

const AdminDemo: React.FC = () => {
  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
      <PageContainer>
        <ContentWrapper>
          <SuiteHeader>
            <SuiteTitle>Bioptrics Suite</SuiteTitle>
            <SuiteSubtitle>
              Empowering workplace wellbeing through data-driven insights and learning
            </SuiteSubtitle>
            <HelperText>
              Use this page in demos to quickly jump into each experience while keeping the admin view open in this tab.
            </HelperText>
          </SuiteHeader>

          <CardsGrid>
            <Card onClick={() => handleOpen('https://pulse.bioptrics.com')}>
              <CardInner>
                <IconWrapper bg="#FD9F2C">
                  <IconGlyph>📈</IconGlyph>
                </IconWrapper>
                <CardTitle>Bioptrics Pulse</CardTitle>
                <CardAction>MEASURE</CardAction>
                <CardMeta>Launch survey insights and organizational pulse analytics.</CardMeta>
              </CardInner>
            </Card>

            <Card onClick={() => handleOpen('https://lms.bioptrics.com')}>
              <CardInner>
                <IconWrapper bg="#325b9b">
                  <IconGlyph>📚</IconGlyph>
                </IconWrapper>
                <CardTitle>Bioptrics LMS</CardTitle>
                <CardAction>LEARN</CardAction>
                <CardMeta>Open the learning experience to support capability-building.</CardMeta>
              </CardInner>
            </Card>

            <Card disabled>
              <CardInner disabled>
                <IconWrapper bg="#d29b0a">
                  <IconGlyph>👥</IconGlyph>
                </IconWrapper>
                <CardTitle>Bioptrics Team</CardTitle>
                <CardAction>ENGAGE</CardAction>
                <CardMeta emphasis>Coming soon – designed for collaboration and team engagement.</CardMeta>
              </CardInner>
            </Card>
          </CardsGrid>
        </ContentWrapper>
      </PageContainer>
  );
};

export default AdminDemo;
