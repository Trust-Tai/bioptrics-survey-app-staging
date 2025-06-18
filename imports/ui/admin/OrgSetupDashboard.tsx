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

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const Card = styled(Link)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
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
  background-color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  
  svg {
    color: white;
    font-size: 22px;
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  flex-grow: 1;
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
        <Title>Organization Setup</Title>
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
