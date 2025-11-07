import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiUsers, FiActivity, FiTrendingUp, FiUser, FiDownload } from 'react-icons/fi';
import AdminLayout from '../../../../../../layouts/AdminLayout/AdminLayout';


// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

// Header Section
const HeaderContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--color-primary, #552a47);
  }
  
  svg {
    transition: transform 0.2s;
  }
  
  &:hover svg {
    transform: translateX(-2px);
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const PageCategory = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

// KPI Cards Section
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const KPICard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const KPILabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
  
  svg {
    color: var(--color-primary, #552a47);
  }
`;

const KPIValue = styled.div<{ color?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.color || '#1a1a1a'};
  line-height: 1;
`;

// Department Breakdown Section
const SectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9f9f9;
    border-color: var(--color-primary, #552a47);
    color: var(--color-primary, #552a47);
  }
  
  svg {
    font-size: 16px;
  }
`;

const DepartmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DepartmentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DepartmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const DepartmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DepartmentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`;

const DepartmentResponses = styled.div`
  font-size: 14px;
  color: #666;
`;

const PercentageBadge = styled.span`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
`;

// Progress Bar
const ProgressContainer = styled.div`
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  height: 12px;
  position: relative;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: #27ae60;
  border-radius: 8px;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%);
    border-radius: 8px;
  }
`;

// Recent Activity Section
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
    border-color: #e0e0e0;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ActivityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RespondentName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
`;

const RespondentDepartment = styled.div`
  font-size: 13px;
  color: #666;
`;

const StatusBadge = styled.span`
  background: #d4edda;
  color: #155724;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ============================================================================
// STATIC DATA
// ============================================================================

const staticPolicyData = {
  title: "Policy 44: Workplace Safety Standards",
  category: "Policy Compliance",
  responses: { completed: 42, total: 50 },
  progress: 85,
  trend: { value: "+8%", isPositive: true },
  owner: { team: "Safety Team" },
  departments: [
    { 
      id: '1',
      name: "Operations", 
      completed: 15, 
      total: 18, 
      percentage: 83 
    },
    { 
      id: '2',
      name: "Manufacturing", 
      completed: 18, 
      total: 20, 
      percentage: 90 
    },
    { 
      id: '3',
      name: "Administration", 
      completed: 9, 
      total: 12, 
      percentage: 75 
    }
  ],
  recentActivity: [
    { 
      id: '1',
      name: "Respondent #1", 
      department: "Operations Department", 
      status: "Acknowledged" 
    },
    { 
      id: '2',
      name: "Respondent #2", 
      department: "Manufacturing", 
      status: "Acknowledged" 
    },
    { 
      id: '3',
      name: "Respondent #3", 
      department: "Administration", 
      status: "Acknowledged" 
    }
  ]
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PolicyDetailStatic: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate('/admin/analytics/dashboard');
  };

  const handleExportPDF = () => {
    console.log('Export PDF clicked (static demo)');
    alert('PDF Export functionality will be implemented in the full version.');
  };

  return (
    <AdminLayout>
      <PageContainer>
        <ContentWrapper>
          {/* Header Section */}
          <HeaderContainer>
            <BackButton onClick={handleBackClick}>
              <FiArrowLeft size={16} />
              Back to Dashboard
            </BackButton>
            <PageTitle>{staticPolicyData.title}</PageTitle>
            <PageCategory>{staticPolicyData.category}</PageCategory>
          </HeaderContainer>

          {/* KPI Cards */}
          <KPIGrid>
            {/* Responses Card */}
            <KPICard>
              <KPILabel>
                <FiUsers size={16} />
                Responses
              </KPILabel>
              <KPIValue>
                {staticPolicyData.responses.completed}/{staticPolicyData.responses.total}
              </KPIValue>
            </KPICard>

            {/* Progress Card */}
            <KPICard>
              <KPILabel>
                <FiActivity size={16} />
                Progress
              </KPILabel>
              <KPIValue>{staticPolicyData.progress}%</KPIValue>
            </KPICard>

            {/* Trend Card */}
            <KPICard>
              <KPILabel>
                <FiTrendingUp size={16} />
                Trend
              </KPILabel>
              <KPIValue 
                color={staticPolicyData.trend.isPositive ? '#00b894' : '#e74c3c'}
                style={{ fontSize: '28px' }}
              >
                {staticPolicyData.trend.value}
              </KPIValue>
            </KPICard>

            {/* Owner Card */}
            <KPICard>
              <KPILabel>
                <FiUser size={16} />
                Owner
              </KPILabel>
              <KPIValue style={{ fontSize: '20px', lineHeight: '1.3' }}>
                {staticPolicyData.owner.team}
              </KPIValue>
            </KPICard>
          </KPIGrid>

          {/* Department Breakdown Section */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Department Breakdown</SectionTitle>
              <ExportButton onClick={handleExportPDF}>
                <FiDownload />
                Export PDF
              </ExportButton>
            </SectionHeader>

            <DepartmentList>
              {staticPolicyData.departments.map((dept) => (
                <DepartmentItem key={dept.id}>
                  <DepartmentHeader>
                    <DepartmentInfo>
                      <DepartmentName>{dept.name}</DepartmentName>
                      <DepartmentResponses>
                        {dept.completed}/{dept.total} responses
                      </DepartmentResponses>
                    </DepartmentInfo>
                    <PercentageBadge>{dept.percentage}%</PercentageBadge>
                  </DepartmentHeader>
                  <ProgressContainer>
                    <ProgressFill progress={dept.percentage} />
                  </ProgressContainer>
                </DepartmentItem>
              ))}
            </DepartmentList>
          </SectionContainer>

          {/* Recent Activity Section */}
          <SectionContainer>
            <SectionTitle>Recent Activity</SectionTitle>
            <ActivityList>
              {staticPolicyData.recentActivity.map((activity) => (
                <ActivityItemContainer key={activity.id}>
                  <ActivityInfo>
                    <RespondentName>{activity.name}</RespondentName>
                    <RespondentDepartment>{activity.department}</RespondentDepartment>
                  </ActivityInfo>
                  <StatusBadge>{activity.status}</StatusBadge>
                </ActivityItemContainer>
              ))}
            </ActivityList>
          </SectionContainer>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default PolicyDetailStatic;
