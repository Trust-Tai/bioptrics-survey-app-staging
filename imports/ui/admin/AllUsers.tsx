import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminLayout from './AdminLayout';

// Types
interface User {
  _id: string;
  emails: Array<{ address: string; verified: boolean }>;
  profile: {
    name?: string;
    admin?: boolean;
    role?: string;
    organization?: string;
  };
  createdAt: Date;
}

// Styled components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  height: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 28px;
  width: 500px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  box-sizing: border-box;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #552a47;
  }
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

const Button = styled.button`
  background: #552a47;
  color: white;
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
    background: #7a3e68;
  }
`;

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
    organization: '',
    isAdmin: false
  });

  useEffect(() => {
    loadUsers();
  }, []);
  
  // Auto-dismiss alerts after a timeout
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(
        () => setAlert(null), 
        alert.type === 'success' ? 3000 : 4000
      );
      return () => clearTimeout(timer);
    }
  }, [alert]);
  
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
  }
  
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
  }

  const loadUsers = () => {
    setLoading(true);
    Meteor.call('users.getAll', (error: Error, result: User[]) => {
      setLoading(false);
      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(result);
      }
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.emails[0]?.address || '',
      name: user.profile?.name || '',
      password: '',
      role: user.profile?.role || 'user',
      organization: user.profile?.organization || '',
      isAdmin: !!user.profile?.admin
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update existing user
    Meteor.call(
      'users.update',
      editingUser?._id,
      {
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        isAdmin: formData.isAdmin
      },
      formData.password || undefined,
      (error: Error) => {
        if (error) {
          console.error('Error updating user:', error);
          showError('Failed to update user. Please try again.');
        } else {
          showSuccess('User updated successfully!');
          loadUsers();
          closeModal();
        }
      }
    );
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: () => {
        Meteor.call('users.remove', userId, (error: Error) => {
          if (error) {
            console.error('Error deleting user:', error);
            showError('Failed to delete user. Please try again.');
          } else {
            showSuccess('User deleted successfully!');
            loadUsers();
          }
        });
        setConfirmDialog({ ...confirmDialog, show: false });
      }
    });
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  return (
    <AdminLayout>
      <Container>
        {/* Alert message */}
        {alert && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            zIndex: 2000,
            boxShadow: '0 2px 12px #552a4733',
          }}>
            {alert.message}
          </div>
        )}
        <PageHeader>
          <PageTitle>All Users</PageTitle>
        </PageHeader>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <EmptyState>
            <p>No users found. Add a new user to get started.</p>
          </EmptyState>
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
                  <Td>{user.emails[0]?.address}</Td>
                  <Td>{user.profile?.role || 'User'}</Td>
                  <Td>{user.profile?.organization || 'N/A'}</Td>
                  <Td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Td>
                  <Td>
                    <ActionButton onClick={() => openEditModal(user)} title="Edit User">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteUser(user._id)} title="Delete User">
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {showModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Edit User</ModalTitle>
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
                    disabled
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}

                    />
                    <PasswordToggleButton 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggleButton>
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
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
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
                    Update User
                  </Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}
        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              maxWidth: '90%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#552a47' }}>{confirmDialog.title}</h3>
              <p style={{ margin: '0 0 24px 0', lineHeight: 1.5 }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={closeConfirmDialog}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#e74c3c',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AllUsers;
