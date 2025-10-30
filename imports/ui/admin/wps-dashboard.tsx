import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

const Header = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderText = styled.div`
  color: white;
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

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const StatIconWrapper = styled.div<{ bgColor?: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor || '#f5f7f8'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#2c3e50'};
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatSubtext = styled.div<{ color?: string }>`
  font-size: 12px;
  color: ${props => props.color || '#6c757d'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f5f7f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #6c757d;
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  background: #6b8e9d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

// ============ MAIN COMPONENT ============
const WPSDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateWPSCheck = () => {
    navigate('/admin/marketplace/wps-builder');
  };

  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Whole Person Safety (WPS) Check</Title>
              <Subtitle>Monitor and improve holistic safety across your organization</Subtitle>
            </HeaderText>
            <CreateButton onClick={handleCreateWPSCheck}>
              <Plus size={18} />
              Create WPS Check
            </CreateButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIconWrapper bgColor="#f5f7f8">
                <Users size={24} color="#542a46" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>2,847</StatNumber>
                <StatLabel>Total Participants</StatLabel>
                <StatSubtext>Across all checks</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#e8f5e9">
                <TrendingUp size={24} color="#4caf50" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber color="#4caf50">78%</StatNumber>
                <StatLabel>Average Safety Score</StatLabel>
                <StatSubtext color="#4caf50">+5% from last quarter</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#fff3e0">
                <AlertCircle size={24} color="#ff9800" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber color="#ff9800">3</StatNumber>
                <StatLabel>Areas Needing Attention</StatLabel>
                <StatSubtext>Departments flagged</StatSubtext>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* Recent WPS Checks Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent WPS Checks</SectionTitle>
              <SectionSubtitle>View and manage your safety assessments</SectionSubtitle>
            </SectionHeader>

            <EmptyState>
              <EmptyIcon>
                <Users size={32} />
              </EmptyIcon>
              <EmptyMessage>No WPS checks yet</EmptyMessage>
              <EmptyButton onClick={handleCreateWPSCheck}>
                <Plus size={18} />
                Create Your First WPS Check
              </EmptyButton>
            </EmptyState>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default WPSDashboard;
