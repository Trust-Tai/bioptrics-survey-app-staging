import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import { FaUserShield, FaUserTie, FaUserCog, FaUserEdit, FaUserCheck } from 'react-icons/fa';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #28211e;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5d6c7;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #28211e;
`;

const CardDescription = styled.p`
  color: #6e5a67;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const RoleCard = styled.div<{ active: boolean }>`
  background: ${props => props.active ? '#f9f5f0' : '#fff'};
  border: 1px solid ${props => props.active ? '#b0802b' : '#e5d6c7'};
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #b0802b;
    background: ${props => props.active ? '#f9f5f0' : '#fff9f0'};
  }
`;

const RoleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #b0802b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 20px;
`;

const RoleName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #28211e;
`;

const RoleDescription = styled.p`
  color: #6e5a67;
  font-size: 14px;
  line-height: 1.5;
`;

const PermissionsList = styled.div`
  margin-top: 32px;
`;

const PermissionGroup = styled.div`
  margin-bottom: 24px;
`;

const PermissionGroupTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #28211e;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5d6c7;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 12px;
  margin-top: 2px;
  accent-color: #b0802b;
`;

const PermissionLabel = styled.label`
  font-size: 15px;
  color: #28211e;
  cursor: pointer;
`;

const PermissionDescription = styled.p`
  margin: 0 0 0 32px;
  color: #6e5a67;
  font-size: 13px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#b0802b' : 'transparent'};
  color: ${props => props.primary ? '#fff' : '#6e5a67'};
  border: ${props => props.primary ? 'none' : '1.5px solid #e5d6c7'};
  border-radius: 8px;
  font-weight: 600;
  padding: 0 24px;
  font-size: 15px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#9a6f25' : '#f9f5f0'};
  }
`;

const Alert = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'success' ? '#2ecc40' : '#e74c3c'};
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  z-index: 2000;
  box-shadow: 0 2px 12px #b0802b33;
`;

// Role definitions
const roles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings of the platform.',
    icon: <FaUserShield />,
  },
  {
    id: 'consultant',
    name: 'Consultant',
    description: 'Can create and manage surveys, questions, and view all analytics.',
    icon: <FaUserTie />,
  },
  {
    id: 'ceo',
    name: 'CEO/Management',
    description: 'Can view all surveys and analytics across the organization.',
    icon: <FaUserCog />,
  },
  {
    id: 'department_head',
    name: 'Department Head',
    description: 'Can view surveys and analytics for their department.',
    icon: <FaUserEdit />,
  },
  {
    id: 'respondent',
    name: 'Respondent',
    description: 'Can only respond to assigned surveys.',
    icon: <FaUserCheck />,
  },
];

// Permission groups
const permissionGroups = [
  {
    id: 'surveys',
    name: 'Surveys',
    permissions: [
      { id: 'surveys.create', name: 'Create Surveys', description: 'Create new surveys' },
      { id: 'surveys.edit', name: 'Edit Surveys', description: 'Edit existing surveys' },
      { id: 'surveys.delete', name: 'Delete Surveys', description: 'Delete surveys' },
      { id: 'surveys.publish', name: 'Publish Surveys', description: 'Publish surveys to make them available to respondents' },
      { id: 'surveys.view_all', name: 'View All Surveys', description: 'View all surveys across the organization' },
      { id: 'surveys.view_department', name: 'View Department Surveys', description: 'View surveys for assigned departments' },
    ],
  },
  {
    id: 'questions',
    name: 'Questions',
    permissions: [
      { id: 'questions.create', name: 'Create Questions', description: 'Create new questions' },
      { id: 'questions.edit', name: 'Edit Questions', description: 'Edit existing questions' },
      { id: 'questions.delete', name: 'Delete Questions', description: 'Delete questions' },
      { id: 'questions.view_all', name: 'View All Questions', description: 'View all questions in the question bank' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    permissions: [
      { id: 'analytics.view_all', name: 'View All Analytics', description: 'View analytics for all surveys' },
      { id: 'analytics.view_department', name: 'View Department Analytics', description: 'View analytics for department surveys' },
      { id: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data' },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    permissions: [
      { id: 'users.create', name: 'Create Users', description: 'Create new users' },
      { id: 'users.edit', name: 'Edit Users', description: 'Edit existing users' },
      { id: 'users.delete', name: 'Delete Users', description: 'Delete users' },
      { id: 'users.assign_roles', name: 'Assign Roles', description: 'Assign roles to users' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    permissions: [
      { id: 'settings.organization', name: 'Organization Settings', description: 'Manage organization settings' },
      { id: 'settings.categories', name: 'Categories & Tags', description: 'Manage categories and tags' },
      { id: 'settings.themes', name: 'Survey Themes', description: 'Manage survey themes' },
      { id: 'settings.wps_framework', name: 'WPS Framework', description: 'Manage WPS framework categories' },
    ],
  },
];

// Default permissions for each role
const defaultRolePermissions = {
  admin: permissionGroups.flatMap(group => group.permissions.map(p => p.id)),
  consultant: [
    'surveys.create', 'surveys.edit', 'surveys.publish', 'surveys.view_all',
    'questions.create', 'questions.edit', 'questions.view_all',
    'analytics.view_all', 'analytics.export',
  ],
  ceo: [
    'surveys.view_all',
    'analytics.view_all', 'analytics.export',
  ],
  department_head: [
    'surveys.view_department',
    'analytics.view_department',
  ],
  respondent: [],
};

const RoleManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(defaultRolePermissions);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get organization settings from database
  const { settings, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('organizationSettings');
    return {
      settings: Meteor.users.find({ 'profile.admin': true }).fetch(),
      isLoading: !sub.ready()
    };
  }, []);

  // Handle permission change
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setRolePermissions(prev => {
      const updatedPermissions = { ...prev };
      
      if (checked) {
        // Add permission if it doesn't exist
        if (!updatedPermissions[selectedRole].includes(permissionId)) {
          updatedPermissions[selectedRole] = [...updatedPermissions[selectedRole], permissionId];
        }
      } else {
        // Remove permission if it exists
        updatedPermissions[selectedRole] = updatedPermissions[selectedRole].filter(id => id !== permissionId);
      }
      
      return updatedPermissions;
    });
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // In a real implementation, this would save to the database
      // await Meteor.callAsync('roles.update', { roleId: selectedRole, permissions: rolePermissions[selectedRole] });
      
      // For now, just simulate a successful save
      setTimeout(() => {
        setAlert({ type: 'success', message: 'Role permissions updated successfully!' });
        setTimeout(() => setAlert(null), 3000);
        setSaving(false);
      }, 1000);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.reason || 'Failed to update role permissions' });
      setTimeout(() => setAlert(null), 4000);
      setSaving(false);
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    setRolePermissions(defaultRolePermissions);
    setAlert({ type: 'success', message: 'Role permissions reset to defaults!' });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          <Header>Role Management</Header>
          
          {alert && (
            <Alert type={alert.type}>
              {alert.message}
            </Alert>
          )}
          
          <Card>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Configure permissions for each user role in the system. Select a role to view and edit its permissions.
            </CardDescription>
            
            <RoleGrid>
              {roles.map(role => (
                <RoleCard 
                  key={role.id} 
                  active={selectedRole === role.id}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <RoleIcon>{role.icon}</RoleIcon>
                  <RoleName>{role.name}</RoleName>
                  <RoleDescription>{role.description}</RoleDescription>
                </RoleCard>
              ))}
            </RoleGrid>
          </Card>
          
          <Card>
            <CardTitle>Permissions for {roles.find(r => r.id === selectedRole)?.name}</CardTitle>
            <CardDescription>
              Configure which actions this role can perform in the system.
            </CardDescription>
            
            <PermissionsList>
              {permissionGroups.map(group => (
                <PermissionGroup key={group.id}>
                  <PermissionGroupTitle>{group.name}</PermissionGroupTitle>
                  
                  {group.permissions.map(permission => (
                    <PermissionItem key={permission.id}>
                      <Checkbox 
                        type="checkbox" 
                        id={permission.id}
                        checked={rolePermissions[selectedRole].includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                      />
                      <div>
                        <PermissionLabel htmlFor={permission.id}>{permission.name}</PermissionLabel>
                        <PermissionDescription>{permission.description}</PermissionDescription>
                      </div>
                    </PermissionItem>
                  ))}
                </PermissionGroup>
              ))}
            </PermissionsList>
            
            <ButtonRow>
              <Button onClick={handleReset}>Reset to Defaults</Button>
              <Button primary onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </ButtonRow>
          </Card>
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default RoleManagement;
