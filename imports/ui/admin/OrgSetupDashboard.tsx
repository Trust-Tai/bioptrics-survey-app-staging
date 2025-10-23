import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { 
  FaUserCheck, 
  FaUsers, 
  FaCog, 
  FaBuilding,
  FaKey,
  FaStore,
  FaChartLine,
  FaRegClock,
  FaArrowRight
} from 'react-icons/fa';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  padding: 2rem;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
`;  

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  margin: 0;
  color: var(--color-text);
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--color-accent);
  margin: 8px 0 0;
  max-width: 600px;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 40px;
  color: var(--color-primary, #552a47);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
`;

const WelcomeContent = styled.div`
  max-width: 60%;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 28px;
  margin: 0 0 16px;
  font-weight: 700;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  margin: 0 0 24px;
  opacity: 0.9;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: var(--color-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--color-accent);
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  margin: 0 0 24px;
  color: var(--color-text);
  font-weight: 600;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  transition: all 0.3s ease;
  
  /* Fallback for browsers that don't support color-mix */
  @supports not (background: color-mix(in srgb, var(--color-primary) 15%, transparent)) {
    background-color: rgba(85, 42, 71, 0.15);
  }
  
  svg {
    color: var(--color-primary);
    font-size: 24px;
  }
`;

const Card = styled(Link)`
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 28px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
    
    ${IconWrapper} {
      background: var(--color-primary);
      
      svg {
        color: white;
      }
    }
    
    &::after {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--color-primary);
    opacity: 0;
    transition: all 0.3s ease;
    transform: translateX(-6px);
  }
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
`;

const CardDescription = styled.p`
  margin: 12px 0 0;
  color: var(--color-accent);
  font-size: 15px;
  line-height: 1.6;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  
  svg {
    margin-left: 8px;
    transition: transform 0.2s ease;
  }
  
  ${Card}:hover & svg {
    transform: translateX(4px);
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${(props) => (props.primary ? 'var(--color-primary)' : 'var(--color-background)')};
  color: ${(props) => (props.primary ? '#fff' : 'var(--color-primary)')};
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }

  svg {
    font-size: 16px;
  }
`;

const OrgSetupDashboard: React.FC = () => {
  const { getTerminology, organization } = useOrganization();
  
  const menuItems = [
    {
      title: `${getTerminology('participantLabel')}s`,
      description: `Manage ${getTerminology('participantLabel')}s and their information. Add new ${getTerminology('participantLabel')}s, import data, and organize them into groups.`,
      icon: FaUserCheck,
      path: '/admin/org-setup/participants'
    },
    {
      title: 'Users',
      description: 'Manage users, add new users, and configure access permissions. Control who has access to what features in your organization.',
      icon: FaUsers,
      path: '/admin/org-setup/users'
    },
    {
      title: 'Settings',
      description: 'Configure system settings, passwords, timezone preferences, and UI customizations to match your workflow.',
      icon: FaCog,
      path: '/admin/org-setup/settings'
    },
    {
      title: 'Permissions / Roles',
      description: 'Manage user roles and permissions across the system. Create custom roles and define granular access controls.',
      icon: FaKey,
      path: '/admin/org-setup/roles'
    },
    {
      title: 'Branding / Custom Fields',
      description: 'Customize your organization branding, colors, and terminology. Add custom fields to track organization-specific data.',
      icon: FaBuilding,
      path: '/admin/org-setup/branding'
    }
  ];

  return (
    <AdminLayout>
      <Container>        
        <WelcomeSection>
          <WelcomeContent>
            <WelcomeTitle>Welcome to {organization?.name || 'Your Organization'}</WelcomeTitle>
            <WelcomeText>
              This is your organization management dashboard where you can configure all aspects of your organization.
              Use the cards below to navigate to different settings and management areas.
            </WelcomeText>
            <Button primary>View Quick Start Guide</Button>
          </WelcomeContent>
        </WelcomeSection>
        <CardGrid>
          {menuItems.map((item, index) => (
            <Card to={item.path} key={index}>
              <CardHeader>
                <IconWrapper>
                  <item.icon />
                </IconWrapper>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardDescription>{item.description}</CardDescription>
              <CardFooter>
                Configure <FaArrowRight size={12} />
              </CardFooter>
            </Card>
          ))}
        </CardGrid>
      </Container>
    </AdminLayout>
  );
};

export default OrgSetupDashboard;
