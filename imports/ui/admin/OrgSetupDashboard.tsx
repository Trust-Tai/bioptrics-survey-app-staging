import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { 
  FaUserCheck, 
  FaUsers, 
  FaCog, 
  FaBuilding,
  FaKey
} from 'react-icons/fa';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';

const Container = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;  

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

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
  font-size: 28px;
  margin-bottom: 30px;
  color: var(--color-text);
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
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
    font-size: 22px;
  }
`;

const Card = styled(Link)`
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-accent);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--color-primary);
    
    ${IconWrapper} {
      background: var(--color-primary);
      
      svg {
        color: white;
      }
    }
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
`;

const CardDescription = styled.p`
  margin: 0;
  color: var(--color-accent);
  font-size: 14px;
  line-height: 1.5;
  flex-grow: 1;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.primary ? 'var(--color-primary)' : 'var(--color-background)')};
  color: ${(props) => (props.primary ? '#fff' : 'var(--color-primary)')};
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }

  svg {
    font-size: 16px;
  }
`;

const OrgSetupDashboard: React.FC = () => {
  const { getTerminology } = useOrganization();
  
  const menuItems = [
    {
      title: `${getTerminology('participantLabel')}s`,
      description: `Manage ${getTerminology('participantLabel')}s and their information`,
      icon: FaUserCheck,
      path: '/admin/org-setup/participants'
    },
    {
      title: 'Users',
      description: 'Manage users, add new users, and configure access',
      icon: FaUsers,
      path: '/admin/org-setup/users'
    },
    {
      title: 'Settings',
      description: 'Configure system settings, passwords, and preferences',
      icon: FaCog,
      path: '/admin/org-setup/settings'
    },
    {
      title: 'Permissions / Roles',
      description: 'Manage user roles and permissions across the system',
      icon: FaKey,
      path: '/admin/org-setup/roles'
    },
    {
      title: 'Branding / Custom Fields',
      description: 'Customize your organization branding, colors, and terminology',
      icon: FaBuilding,
      path: '/admin/org-setup/branding'
    }
  ];

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <Title>Organization Setup</Title>
          <ActionButtons>
            <Button as={Link} to="/admin/org-setup/participants">
              Participants
            </Button>
            <Button as={Link} to="/admin/org-setup/users">
              Users
            </Button>
            <Button as={Link} to="/admin/org-setup/settings">
              Settings
            </Button>
            <Button as={Link} to="/admin/org-setup/roles">
              Roles
            </Button>
            <Button as={Link} to="/admin/org-setup/branding">
              Branding
            </Button>
          </ActionButtons>
        </PageHeader>
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
            </Card>
          ))}
        </CardGrid>
      </Container>
    </AdminLayout>
  );
};

export default OrgSetupDashboard;
