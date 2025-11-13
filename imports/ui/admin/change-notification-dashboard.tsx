import React from 'react';
import styled from 'styled-components';
import { Bell, Plus, Mail, TrendingUp, Users, Eye, Edit, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { colors } from './home/theme/colors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.white};
`;

const Header = styled.div`
  background: linear-gradient(135deg, #325b9b 0%, #4a7bc8 100%);
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
  
  &:hover {
    border-color: #325b9b;
    box-shadow: 0 2px 8px rgba(50, 91, 155, 0.1);
  }
`;

const StatIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: #f0f6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #325b9b;
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textDark};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.textMedium};
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textDark};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textMedium};
  margin: 0;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #325b9b;
    box-shadow: 0 2px 8px rgba(50, 91, 155, 0.1);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NotificationLeft = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textDark};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationMeta = styled.div`
  font-size: 14px;
  color: ${colors.textMedium};
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status: 'sent' | 'draft' | 'scheduled' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'sent': return '#e8f5e9';
      case 'draft': return '#f5f7f8';
      case 'scheduled': return '#fff3e0';
      default: return '#f5f7f8';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'sent': return '#4caf50';
      case 'draft': return '#6c757d';
      case 'scheduled': return '#ff9800';
      default: return '#6c757d';
    }
  }};
`;

const NotificationMessage = styled.p`
  font-size: 14px;
  color: ${colors.textMedium};
  margin: 12px 0;
  line-height: 1.5;
`;

const ProgressBarContainer = styled.div`
  margin: 16px 0;
`;

const ProgressLabel = styled.div`
  font-size: 13px;
  color: ${colors.textMedium};
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #325b9b 0%, #4a7bc8 100%);
  border-radius: 4px;
  transition: width 0.3s;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  background: white;
  color: ${colors.textDark};
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.grayLight};
    border-color: #325b9b;
  }
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
  background: ${colors.grayLight};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${colors.textMedium};
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textDark};
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: ${colors.textMedium};
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  background: #325b9b;
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
  transition: all 0.2s;
  
  &:hover {
    background: #274a7d;
  }
`;

// ============ MAIN COMPONENT ============
const ChangeNotificationDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Static data for notifications
  const notifications = [
    {
      id: 1,
      title: "New Remote Work Policy Update",
      date: "2025-11-10",
      recipients: 257,
      read: 198,
      status: "sent" as const,
      message: "Important updates to our remote work guidelines effective December 1st. Please review the new flexible hours policy and home office equipment reimbursement procedures."
    },
    {
      id: 2,
      title: "Q4 Performance Review Process",
      date: "2025-11-05",
      recipients: 180,
      read: 165,
      status: "sent" as const,
      message: "Annual performance review cycle begins next week. All managers should schedule 1-on-1 meetings with their team members by November 20th."
    },
    {
      id: 3,
      title: "Holiday Schedule Announcement",
      date: "2025-11-01",
      recipients: 257,
      read: 245,
      status: "sent" as const,
      message: "Company holiday schedule for December has been finalized. Office will be closed December 24-26 and December 31-January 1."
    }
  ];

  const stats = {
    totalSent: 24,
    pendingReads: 8,
    readRate: 87,
    totalRecipients: 257
  };

  const handleCreateNotification = () => {
    navigate('/admin/change-notification/create');
  };

  return (
    <AdminLayout>
      <PageContainer>
        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Change Notifications</Title>
              <Subtitle>Track organizational change communications</Subtitle>
            </HeaderText>
            <CreateButton onClick={handleCreateNotification}>
              <Plus size={18} />
              Create Notification
            </CreateButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIconWrapper>
                <Mail size={24} />
              </StatIconWrapper>
              <StatValue>{stats.totalSent}</StatValue>
              <StatLabel>Total Sent</StatLabel>
            </StatCard>

            <StatCard>
              <StatIconWrapper>
                <Bell size={24} />
              </StatIconWrapper>
              <StatValue>{stats.pendingReads}</StatValue>
              <StatLabel>Pending Reads</StatLabel>
            </StatCard>

            <StatCard>
              <StatIconWrapper>
                <TrendingUp size={24} />
              </StatIconWrapper>
              <StatValue>{stats.readRate}%</StatValue>
              <StatLabel>Read Rate</StatLabel>
            </StatCard>

            <StatCard>
              <StatIconWrapper>
                <Users size={24} />
              </StatIconWrapper>
              <StatValue>{stats.totalRecipients}</StatValue>
              <StatLabel>Total Recipients</StatLabel>
            </StatCard>
          </StatsGrid>

          {/* Notifications List */}
          <SectionHeader>
            <SectionTitle>Recent Notifications</SectionTitle>
            <SectionSubtitle>View and manage your change notifications</SectionSubtitle>
          </SectionHeader>

          {notifications.length > 0 ? (
            <NotificationList>
              {notifications.map((notification) => {
                const readPercentage = Math.round((notification.read / notification.recipients) * 100);
                
                return (
                  <NotificationCard key={notification.id}>
                    <NotificationHeader>
                      <NotificationLeft>
                        <NotificationTitle>
                          <Bell size={20} />
                          {notification.title}
                        </NotificationTitle>
                        <NotificationMeta>
                          <span>Sent on {new Date(notification.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{notification.recipients} recipients</span>
                        </NotificationMeta>
                      </NotificationLeft>
                      <StatusBadge status={notification.status}>
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </StatusBadge>
                    </NotificationHeader>

                    <NotificationMessage>{notification.message}</NotificationMessage>

                    <ProgressBarContainer>
                      <ProgressLabel>
                        <span>Read Status</span>
                        <span>{notification.read}/{notification.recipients} ({readPercentage}%)</span>
                      </ProgressLabel>
                      <ProgressBar>
                        <ProgressFill percentage={readPercentage} />
                      </ProgressBar>
                    </ProgressBarContainer>

                    <ActionButtons>
                      <ActionButton>
                        <Eye size={16} />
                        View Details
                      </ActionButton>
                      <ActionButton>
                        <Edit size={16} />
                        Edit
                      </ActionButton>
                      <ActionButton>
                        <Archive size={16} />
                        Archive
                      </ActionButton>
                    </ActionButtons>
                  </NotificationCard>
                );
              })}
            </NotificationList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <Bell size={32} />
              </EmptyIcon>
              <EmptyMessage>No notifications yet</EmptyMessage>
              <EmptySubtext>Create your first change notification to get started</EmptySubtext>
              <EmptyButton onClick={handleCreateNotification}>
                <Plus size={18} />
                Create Notification
              </EmptyButton>
            </EmptyState>
          )}
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default ChangeNotificationDashboard;
