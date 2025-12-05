import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaUserPlus, 
  FaUsers, 
  FaUsersCog, 
  FaUserShield, 
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaArrowLeft
} from 'react-icons/fa';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { useNotifications } from '/imports/shared/components/GlobalNotification';

// Styled components

const Container = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  color: ${({ theme }) => theme.textColor};
  margin: 0;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.primaryColor || 'var(--color-primary);'};
  color: ${({ theme }) => theme.backgroundColor === '#000000' ? theme.textColor : '#fff'};
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.secondaryColor};
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.accentColor};
  border-radius: 8px;
  padding: 16px;
  display: grid;
  grid-template-columns: 40px 1fr;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  align-items: center;
  text-align: center;
`;

const StatIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  color: #fff;
  font-size: 16px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.textColor};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.secondaryColor};
  font-size: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background: #f5f5f7;
  color: #333;
  font-weight: 600;
  font-size: 14px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eee;
  color: #444;
  font-size: 14px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #552a47;
  margin-right: 10px;
  font-size: 16px;
  
  &:hover {
    color: #7a3e68;
  }
`;

const AdminBadge = styled.span`
  background: #552a47;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 28px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
    max-width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: -28px;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (min-width: 768px) {
    &.row {
      flex-direction: row;
      gap: 16px;
      
      > div {
        flex: 1;
      }
    }
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 0.2rem rgba(85, 42, 71, 0.15);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  position: sticky;
  bottom: -28px;
  background: white;
  z-index: 1;
  
  @media (max-width: 576px) {
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
`;

const CancelButton = styled.button`
  background: #f5f5f7;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #e5e5e7;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.textColor};
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primaryColor || 'var(--color-primary)'};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ConfirmDialogContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalBody = styled.div`
  margin: 20px 0;
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;

// Types
interface User {
  _id: string;
  emails: Array<{ address: string; verified: boolean }>;
  profile: {
    name?: string;
    admin?: boolean;
    role?: string;
    organization?: string;
    active?: boolean;
  };
  createdAt: Date;
}

interface ConfirmDialog {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  role: string;
  organization: string;
  isAdmin: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <ModalOverlay>
      <ConfirmDialogContainer>
        <ModalHeader>
          <h3>{title}</h3>
        </ModalHeader>
        <ModalBody>
          <p>{message}</p>
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <Button onClick={onConfirm} style={{ background: '#dc3545' }}>Confirm</Button>
        </ModalFooter>
      </ConfirmDialogContainer>
    </ModalOverlay>
  );
};

const Users = () => {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    role: 'user',
    organization: '',
    isAdmin: false
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    Meteor.call('users.getAll', (error: Error, result: User[]) => {
      setLoading(false);
      if (error) {
        console.error('Error loading users:', error);
        notifications.error('Failed to load users');
      } else {
        setUsers(result);
        
        // Calculate stats from the user data
        const totalUsers = result.length;
        const admins = result.filter(user => user.profile?.admin).length;
        const activeUsers = result.filter(user => user.profile?.active !== false).length;
        const inactiveUsers = result.filter(user => user.profile?.active === false).length;
        
        setStats({
          totalUsers,
          admins,
          activeUsers,
          inactiveUsers
        });
      }
    });
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user._id);
    setFormData({
      email: user.emails?.[0]?.address || '',
      name: user.profile?.name || '',
      password: '',
      role: user.profile?.role || 'user',
      organization: user.profile?.organization || '',
      isAdmin: !!user.profile?.admin
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingUserId(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'user',
      organization: '',
      isAdmin: false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUserId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUserId) {
      // Update existing user
      const userData = {
        email: formData.email,
        profile: {
          name: formData.name,
          role: formData.role,
          organization: formData.organization,
          admin: formData.isAdmin
        },
        password: formData.password || undefined
      };
      
      Meteor.call('users.update', editingUserId, userData, (error: Error) => {
        if (error) {
          console.error('Error updating user:', error);
          notifications.error('Failed to update user');
        } else {
          notifications.success('User updated successfully');
          loadUsers();
          closeModal();
        }
      });
    } else {
      // Create new user
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        isAdmin: formData.isAdmin
      };
      
      Meteor.call('users.create', userData, (error: Error) => {
        if (error) {
          console.error('Error creating user:', error);
          notifications.error('Failed to create user');
        } else {
          notifications.success('User created successfully');
          loadUsers();
          closeModal();
        }
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: () => {
        Meteor.call('users.remove', userId, (error: Error) => {
          if (error) {
            console.error('Error deleting user:', error);
            notifications.error('Failed to delete user');
          } else {
            notifications.success('User deleted successfully');
            loadUsers();
          }
          closeConfirmDialog();
        });
      }
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, show: false }));
  };

  return (
    <AdminLayout>
      <Container>
        <BackButton onClick={() => navigate('/admin/org-setup')}>
          <FaArrowLeft /> Back to Organization Setup
        </BackButton>
        <PageHeader>
          <PageTitle>User Management</PageTitle>
          <Button onClick={openAddModal}>
            <FaUserPlus /> Add New User
          </Button>
        </PageHeader>
        
        <StatsContainer>
          <StatCard>
            <StatIconContainer>
              <FaUsers />
            </StatIconContainer>
            <StatContent>
              <StatValue>{loading ? '...' : stats.totalUsers}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIconContainer>
              <FaUserShield />
            </StatIconContainer>
            <StatContent>
              <StatValue>{loading ? '...' : stats.admins}</StatValue>
              <StatLabel>Admins</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIconContainer>
              <FaUserCheck />
            </StatIconContainer>
            <StatContent>
              <StatValue>{loading ? '...' : stats.activeUsers}</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIconContainer>
              <FaUsersCog />
            </StatIconContainer>
            <StatContent>
              <StatValue>{loading ? '...' : stats.inactiveUsers}</StatValue>
              <StatLabel>Inactive Users</StatLabel>
            </StatContent>
          </StatCard>
        </StatsContainer>

        {loading ? (
          <EmptyState>Loading users...</EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>No users found</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Organization</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <Td>
                    {user.profile?.name || 'N/A'}
                    {user.profile?.admin && (
                      <AdminBadge style={{ marginLeft: '8px' }}>Admin</AdminBadge>
                    )}
                  </Td>
                  <Td>{user.emails?.[0]?.address || 'N/A'}</Td>
                  <Td>{user.profile?.role || 'User'}</Td>
                  <Td>{user.profile?.organization || 'N/A'}</Td>
                  <Td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Td>
                  <Td>
                    <ActionButton onClick={() => openEditModal(user)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteUser(user._id)}>
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Edit/Add User Modal */}
        {showModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{editingUserId ? 'Edit User' : 'Add New User'}</ModalTitle>
                <CloseButton onClick={closeModal}>&times;</CloseButton>
              </ModalHeader>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">{editingUserId ? 'Password (leave blank to keep unchanged)' : 'Password'}</Label>
                  <PasswordInputWrapper>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{ width: '100%' }}
                      required={!editingUserId}
                    />
                  </PasswordInputWrapper>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Consultant">Consultant</option>
                    <option value="CEO/Manager">CEO/Manager</option>
                    <option value="DepartmentHead">Department Head</option>
                    <option value="Respondent">Respondent</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Checkbox>
                    <input
                      type="checkbox"
                      id="isAdmin"
                      name="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="isAdmin" style={{ margin: 0 }}>
                      Admin Access <FaUserShield style={{ verticalAlign: 'middle' }} />
                    </Label>
                  </Checkbox>
                </FormGroup>
                <ModalFooter>
                  <CancelButton type="button" onClick={closeModal}>
                    Cancel
                  </CancelButton>
                  <Button type="submit">
                    {editingUserId ? 'Update User' : 'Create User'}
                  </Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          show={confirmDialog.show}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      </Container>
    </AdminLayout>
  );
};

export default Users;
