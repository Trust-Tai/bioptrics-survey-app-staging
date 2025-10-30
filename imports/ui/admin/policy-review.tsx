import React from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users,
  Upload,
  Plus
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

const Header = styled.div`
  background: #f5f7f8;
  padding: 40px 24px;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderText = styled.div``;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6c757d;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const SecondaryButton = styled.button`
  background: white;
  color: #2c3e50;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7f8;
    border-color: #542a46;
  }
`;

const PrimaryButton = styled.button`
  background: #542a46;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  padding: 20px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
  
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
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
`;

const PoliciesSection = styled.div`
  background: transparent;
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

const PolicyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PolicyCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    border-color: #542a46;
    box-shadow: 0 2px 8px rgba(84, 42, 70, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const PolicyLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PolicyIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: #e8f5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  flex-shrink: 0;
`;

const PolicyInfo = styled.div`
  flex: 1;
`;

const PolicyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const PolicyName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;

const StatusBadge = styled.span<{ status: 'active' | 'draft' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'active' ? '#e8f5e9' : '#f5f7f8'};
  color: ${props => props.status === 'active' ? '#4caf50' : '#6c757d'};
`;

const PolicyDate = styled.div`
  font-size: 13px;
  color: #6c757d;
`;

const PolicyRight = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PolicyStats = styled.div`
  display: flex;
  gap: 24px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatCount = styled.div<{ color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color || '#2c3e50'};
  margin-bottom: 2px;
`;

const StatText = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const ViewButton = styled.button`
  background: white;
  color: #2c3e50;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: #f5f7f8;
    border-color: #542a46;
  }
`;

// ============ MAIN COMPONENT ============
const PolicyReview: React.FC = () => {
  const policies = [
    {
      id: 1,
      name: 'Code of Conduct',
      status: 'active' as const,
      lastUpdated: '2025-09-15',
      acknowledged: 245,
      pending: 12
    },
    {
      id: 2,
      name: 'Data Privacy Policy',
      status: 'active' as const,
      lastUpdated: '2025-10-01',
      acknowledged: 198,
      pending: 59
    },
    {
      id: 3,
      name: 'Remote Work Policy',
      status: 'draft' as const,
      lastUpdated: '2025-10-18',
      acknowledged: 0,
      pending: 0
    },
    {
      id: 4,
      name: 'Safety & Security Guidelines',
      status: 'active' as const,
      lastUpdated: '2025-08-22',
      acknowledged: 232,
      pending: 25
    }
  ];

  return (
    <AdminLayout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Policy Review & Acknowledgment</Title>
              <Subtitle>Manage policy distribution and track compliance</Subtitle>
            </HeaderText>
            <ButtonGroup>
              <SecondaryButton>
                <Upload size={18} />
                Upload Policy
              </SecondaryButton>
              <PrimaryButton>
                <Plus size={18} />
                Create Policy
              </PrimaryButton>
            </ButtonGroup>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIconWrapper bgColor="#f5f7f8">
                <FileText size={24} color="#542a46" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>4</StatNumber>
                <StatLabel>Total Policies</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#e8f5e9">
                <CheckCircle size={24} color="#4caf50" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>675</StatNumber>
                <StatLabel>Acknowledged</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#fff3e0">
                <Clock size={24} color="#ff9800" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>96</StatNumber>
                <StatLabel>Pending</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#f5f7f8">
                <Users size={24} color="#542a46" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>257</StatNumber>
                <StatLabel>Total Users</StatLabel>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* Active Policies Section */}
          <PoliciesSection>
            <SectionHeader>
              <SectionTitle>Active Policies</SectionTitle>
              <SectionSubtitle>Manage and track policy acknowledgments</SectionSubtitle>
            </SectionHeader>

            <PolicyList>
              {policies.map(policy => (
                <PolicyCard key={policy.id}>
                  <PolicyLeft>
                    <PolicyIconWrapper>
                      <FileText size={20} />
                    </PolicyIconWrapper>
                    <PolicyInfo>
                      <PolicyHeader>
                        <PolicyName>{policy.name}</PolicyName>
                        <StatusBadge status={policy.status}>
                          {policy.status === 'active' ? 'Active' : 'Draft'}
                        </StatusBadge>
                      </PolicyHeader>
                      <PolicyDate>Last updated: {policy.lastUpdated}</PolicyDate>
                    </PolicyInfo>
                  </PolicyLeft>
                  <PolicyRight>
                    <PolicyStats>
                      <StatItem>
                        <StatCount color="#4caf50">{policy.acknowledged}</StatCount>
                        <StatText>Acknowledged</StatText>
                      </StatItem>
                      <StatItem>
                        <StatCount color="#ff9800">{policy.pending}</StatCount>
                        <StatText>Pending</StatText>
                      </StatItem>
                    </PolicyStats>
                    <ViewButton>View Details</ViewButton>
                  </PolicyRight>
                </PolicyCard>
              ))}
            </PolicyList>
          </PoliciesSection>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default PolicyReview;
