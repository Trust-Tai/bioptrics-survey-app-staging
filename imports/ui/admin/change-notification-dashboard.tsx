import React from 'react';
import styled from 'styled-components';
import { Bell, Plus, Mail, TrendingUp, Users, Eye, Edit, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const StatCard = styled.div<{ hoverBorderColor: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.hoverBorderColor};
    box-shadow: 0 2px 8px rgba(50, 91, 155, 0.1);
  }
`;

const StatIconWrapper = styled.div<{ bgColor: string; iconColor: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor};
  margin-bottom: 12px;
`;

const StatValue = styled.div<{ color: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2<{ color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 0;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationCard = styled.div<{ hoverBorderColor: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.hoverBorderColor};
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

const NotificationTitle = styled.h3<{ color: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationMeta = styled.div<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
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

const NotificationMessage = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 12px 0;
  line-height: 1.5;
`;

const ProgressBarContainer = styled.div`
  margin: 16px 0;
`;

const ProgressLabel = styled.div<{ color: string }>`
  font-size: 13px;
  color: ${props => props.color};
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

const ProgressFill = styled.div<{ percentage: number; primaryColor: string }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, ${props => props.primaryColor} 0%, ${props => props.primaryColor}dd 100%);
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

const ActionButton = styled.button<{ textColor: string; borderColor: string; hoverBgColor: string; hoverBorderColor: string }>`
  background: white;
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
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
    background: ${props => props.hoverBgColor};
    border-color: ${props => props.hoverBorderColor};
  }
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
`;

const EmptyIcon = styled.div<{ bgColor: string; iconColor: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.bgColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${props => props.iconColor};
`;

const EmptyMessage = styled.div<{ color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color};
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin-bottom: 24px;
`;

const EmptyButton = styled.button<{ bgColor: string; hoverBgColor: string }>`
  background: ${props => props.bgColor};
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
    background: ${props => props.hoverBgColor};
  }
`;

// ============ MAIN COMPONENT ============
const ChangeNotificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();

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
      <PageContainer bgColor={colors.white}>
        {/* Header */}
        <Header primaryColor={colors.blue}>
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
            <StatCard hoverBorderColor={colors.blue}>
              <StatIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                <Mail size={24} />
              </StatIconWrapper>
              <StatValue color={colors.textDark}>{stats.totalSent}</StatValue>
              <StatLabel color={colors.textMedium}>Total Sent</StatLabel>
            </StatCard>

            <StatCard hoverBorderColor={colors.blue}>
              <StatIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                <Bell size={24} />
              </StatIconWrapper>
              <StatValue color={colors.textDark}>{stats.pendingReads}</StatValue>
              <StatLabel color={colors.textMedium}>Pending Reads</StatLabel>
            </StatCard>

            <StatCard hoverBorderColor={colors.blue}>
              <StatIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                <TrendingUp size={24} />
              </StatIconWrapper>
              <StatValue color={colors.textDark}>{stats.readRate}%</StatValue>
              <StatLabel color={colors.textMedium}>Read Rate</StatLabel>
            </StatCard>

            <StatCard hoverBorderColor={colors.blue}>
              <StatIconWrapper bgColor={`${colors.blue}26`} iconColor={colors.blue}>
                <Users size={24} />
              </StatIconWrapper>
              <StatValue color={colors.textDark}>{stats.totalRecipients}</StatValue>
              <StatLabel color={colors.textMedium}>Total Recipients</StatLabel>
            </StatCard>
          </StatsGrid>

          {/* Notifications List */}
          <SectionHeader>
            <SectionTitle color={colors.textDark}>Recent Notifications</SectionTitle>
            <SectionSubtitle color={colors.textMedium}>View and manage your change notifications</SectionSubtitle>
          </SectionHeader>

          {notifications.length > 0 ? (
            <NotificationList>
              {notifications.map((notification) => {
                const readPercentage = Math.round((notification.read / notification.recipients) * 100);
                
                return (
                  <NotificationCard key={notification.id} hoverBorderColor={colors.blue}>
                    <NotificationHeader>
                      <NotificationLeft>
                        <NotificationTitle color={colors.textDark}>
                          <Bell size={20} />
                          {notification.title}
                        </NotificationTitle>
                        <NotificationMeta color={colors.textMedium}>
                          <span>Sent on {new Date(notification.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{notification.recipients} recipients</span>
                        </NotificationMeta>
                      </NotificationLeft>
                      <StatusBadge status={notification.status}>
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </StatusBadge>
                    </NotificationHeader>

                    <NotificationMessage color={colors.textMedium}>{notification.message}</NotificationMessage>

                    <ProgressBarContainer>
                      <ProgressLabel color={colors.textMedium}>
                        <span>Read Status</span>
                        <span>{notification.read}/{notification.recipients} ({readPercentage}%)</span>
                      </ProgressLabel>
                      <ProgressBar>
                        <ProgressFill percentage={readPercentage} primaryColor={colors.blue} />
                      </ProgressBar>
                    </ProgressBarContainer>

                    <ActionButtons>
                      <ActionButton 
                        textColor={colors.textDark}
                        borderColor={colors.borderGray}
                        hoverBgColor={colors.grayLight}
                        hoverBorderColor={colors.blue}
                      >
                        <Eye size={16} />
                        View Details
                      </ActionButton>
                      <ActionButton 
                        textColor={colors.textDark}
                        borderColor={colors.borderGray}
                        hoverBgColor={colors.grayLight}
                        hoverBorderColor={colors.blue}
                      >
                        <Edit size={16} />
                        Edit
                      </ActionButton>
                      <ActionButton 
                        textColor={colors.textDark}
                        borderColor={colors.borderGray}
                        hoverBgColor={colors.grayLight}
                        hoverBorderColor={colors.blue}
                      >
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
              <EmptyIcon bgColor={colors.grayLight} iconColor={colors.textMedium}>
                <Bell size={32} />
              </EmptyIcon>
              <EmptyMessage color={colors.textDark}>No notifications yet</EmptyMessage>
              <EmptySubtext color={colors.textMedium}>Create your first change notification to get started</EmptySubtext>
              <EmptyButton 
                bgColor={colors.blue}
                hoverBgColor={colors.hover.blue}
                onClick={handleCreateNotification}
              >
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
