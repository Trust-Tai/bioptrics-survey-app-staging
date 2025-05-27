import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { FiUsers, FiUserPlus, FiLink, FiCheck, FiX, FiMail, FiCopy } from 'react-icons/fi';

// Styled components
const SharingContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SharingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SharingTitle = styled.h3`
  font-weight: 700;
  font-size: 18px;
  color: #552a47;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#552a47' : 'transparent'};
  color: ${props => props.active ? '#552a47' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: #552a47;
  }
`;

const UserList = styled.div`
  margin-top: 16px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0e6f5;
  color: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 500;
  font-size: 14px;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: #666;
`;

const UserRole = styled.div`
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0e6f5;
  color: #552a47;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f5f5f5;
    color: #552a47;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Button = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #6a3359;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const CopyButton = styled.button`
  background: #f0e6f5;
  color: #552a47;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e6d6eb;
  }
`;

const NotificationContainer = styled.div<{ type: 'success' | 'error' }>`
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
  box-shadow: 0 2px 12px #552a4733;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

interface SurveyCollaborator {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  dateAdded: Date;
}

interface SurveySharingProps {
  surveyId: string;
  surveyTitle: string;
  isOwner: boolean;
}

const SurveySharing: React.FC<SurveySharingProps> = ({ surveyId, surveyTitle, isOwner }) => {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'sharing'>('collaborators');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'editor' | 'viewer'>('viewer');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  
  // Fetch collaborators data
  const { collaborators, loading, currentUser } = useTracker(() => {
    const userSub = Meteor.subscribe('users.basic');
    const collaboratorsSub = Meteor.subscribe('survey.collaborators', surveyId);
    const isLoading = !userSub.ready() || !collaboratorsSub.ready();
    
    // This would be replaced with actual data from your collections
    // For now, using mock data
    const mockCollaborators: SurveyCollaborator[] = [
      {
        userId: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'owner',
        dateAdded: new Date('2023-01-01')
      },
      {
        userId: '2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'editor',
        dateAdded: new Date('2023-01-15')
      },
      {
        userId: '3',
        email: 'bob.johnson@example.com',
        name: 'Bob Johnson',
        role: 'viewer',
        dateAdded: new Date('2023-02-01')
      }
    ];
    
    return {
      collaborators: mockCollaborators,
      loading: isLoading,
      currentUser: Meteor.user()
    };
  }, [surveyId]);
  
  // Generate shareable link
  React.useEffect(() => {
    // In a real implementation, this would be a token-based URL from your server
    const baseUrl = window.location.origin;
    setShareableLink(`${baseUrl}/survey/${surveyId}/share`);
  }, [surveyId]);
  
  const handleAddCollaborator = () => {
    if (!newEmail.trim()) return;
    
    // In a real implementation, this would call a Meteor method
    Meteor.call('surveys.addCollaborator', surveyId, newEmail, newRole, (error: Error | null) => {
      if (error) {
        setNotification({
          type: 'error',
          message: `Failed to add collaborator: ${error.message}`
        });
      } else {
        setNotification({
          type: 'success',
          message: `Successfully added ${newEmail} as a ${newRole}`
        });
        setNewEmail('');
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    });
  };
  
  const handleRemoveCollaborator = (userId: string, name: string) => {
    // In a real implementation, this would call a Meteor method
    Meteor.call('surveys.removeCollaborator', surveyId, userId, (error: Error | null) => {
      if (error) {
        setNotification({
          type: 'error',
          message: `Failed to remove collaborator: ${error.message}`
        });
      } else {
        setNotification({
          type: 'success',
          message: `Successfully removed ${name}`
        });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    });
  };
  
  const handleChangeRole = (userId: string, newRole: 'editor' | 'viewer', name: string) => {
    // In a real implementation, this would call a Meteor method
    Meteor.call('surveys.changeCollaboratorRole', surveyId, userId, newRole, (error: Error | null) => {
      if (error) {
        setNotification({
          type: 'error',
          message: `Failed to change role: ${error.message}`
        });
      } else {
        setNotification({
          type: 'success',
          message: `Changed ${name}'s role to ${newRole}`
        });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    });
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSendInvites = () => {
    // In a real implementation, this would call a Meteor method to send email invites
    Meteor.call('surveys.sendInvites', surveyId, (error: Error | null) => {
      if (error) {
        setNotification({
          type: 'error',
          message: `Failed to send invites: ${error.message}`
        });
      } else {
        setNotification({
          type: 'success',
          message: 'Invitations sent successfully'
        });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    });
  };
  
  if (loading) {
    return <SharingContainer>Loading collaborators...</SharingContainer>;
  }
  
  return (
    <>
      {notification && (
        <NotificationContainer type={notification.type}>
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
          >
            ×
          </button>
        </NotificationContainer>
      )}
      
      <SharingContainer>
        <SharingHeader>
          <SharingTitle>
            <FiUsers size={20} />
            Survey Sharing & Collaboration
          </SharingTitle>
        </SharingHeader>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'collaborators'} 
            onClick={() => setActiveTab('collaborators')}
          >
            <FiUsers size={16} />
            Collaborators
          </Tab>
          <Tab 
            active={activeTab === 'sharing'} 
            onClick={() => setActiveTab('sharing')}
          >
            <FiLink size={16} />
            Sharing Options
          </Tab>
        </TabContainer>
        
        {activeTab === 'collaborators' && (
          <>
            {isOwner && (
              <div>
                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Add Collaborators</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 3 }}>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <select 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'editor' | 'viewer')}
                      style={{ 
                        width: '100%', 
                        padding: '10px 16px', 
                        borderRadius: 6, 
                        border: '1px solid #ddd',
                        fontSize: 14
                      }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                  <div>
                    <Button onClick={handleAddCollaborator}>
                      <FiUserPlus size={16} />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <UserList>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Current Collaborators</h4>
              {collaborators.map(collaborator => (
                <UserItem key={collaborator.userId}>
                  <UserInfo>
                    <UserAvatar>
                      {collaborator.name.substring(0, 2).toUpperCase()}
                    </UserAvatar>
                    <UserDetails>
                      <UserName>{collaborator.name}</UserName>
                      <UserEmail>{collaborator.email}</UserEmail>
                    </UserDetails>
                  </UserInfo>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <UserRole>
                      {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                    </UserRole>
                    
                    {isOwner && collaborator.role !== 'owner' && (
                      <UserActions>
                        <select 
                          value={collaborator.role}
                          onChange={(e) => handleChangeRole(
                            collaborator.userId, 
                            e.target.value as 'editor' | 'viewer',
                            collaborator.name
                          )}
                          style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            border: '1px solid #ddd',
                            fontSize: 13
                          }}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                        
                        <ActionButton 
                          onClick={() => handleRemoveCollaborator(collaborator.userId, collaborator.name)}
                          title="Remove collaborator"
                        >
                          <FiX size={16} color="#e74c3c" />
                        </ActionButton>
                      </UserActions>
                    )}
                  </div>
                </UserItem>
              ))}
            </UserList>
          </>
        )}
        
        {activeTab === 'sharing' && (
          <div>
            <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Shareable Link</h4>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Anyone with this link can view the survey. No account required.
            </p>
            
            <LinkContainer>
              <LinkInput 
                type="text" 
                value={shareableLink} 
                readOnly 
              />
              <CopyButton onClick={handleCopyLink}>
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </CopyButton>
            </LinkContainer>
            
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Email Invitations</h4>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                Send email invitations to all collaborators who haven't accepted yet.
              </p>
              
              <Button onClick={handleSendInvites}>
                <FiMail size={16} />
                Send Invitations
              </Button>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Access Settings</h4>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={true} 
                    onChange={() => {}}
                  />
                  Allow viewers to download responses
                </label>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => {}}
                  />
                  Require authentication to view responses
                </label>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => {}}
                  />
                  Allow editors to delete responses
                </label>
              </div>
            </div>
          </div>
        )}
      </SharingContainer>
    </>
  );
};

export default SurveySharing;
