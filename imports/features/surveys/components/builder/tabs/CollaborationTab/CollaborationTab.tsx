import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { FiUserPlus, FiUsers, FiTrash2 } from 'react-icons/fi';

interface Collaborator {
  userId: string;
  email: string;
  name?: string;
  role: 'editor' | 'viewer';
  addedAt?: string;
}

interface CollaborationTabProps {
  surveyId: string;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  triggerAutoSave: () => void;
  showErrorAlert: (message: string) => void;
  showSuccessAlert: (message: string) => void;
}

const CollaborationTab: React.FC<CollaborationTabProps> = ({
  surveyId,
  setHasUnsavedChanges,
  triggerAutoSave,
  showErrorAlert,
  showSuccessAlert
}) => {
  // State for collaboration functionality
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState<boolean>(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState<string>('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<string>('editor');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState<boolean>(false);

  // Load collaborators when component mounts
  useEffect(() => {
    if (surveyId) {
      loadCollaborators();
    }
  }, [surveyId]);

  // Function to load collaborators
  const loadCollaborators = () => {
    if (!surveyId) return;
    
    setIsLoadingCollaborators(true);
    Meteor.call('surveys.getCollaborators', surveyId, (error: any, result: any) => {
      setIsLoadingCollaborators(false);
      if (error) {
        console.error('Error loading collaborators:', error);
        showErrorAlert('Failed to load collaborators. Please try again.');
      } else {
        setCollaborators(result || []);
      }
    });
  };
  
  // Function to add a new collaborator
  const handleAddCollaborator = () => {
    if (!surveyId || !newCollaboratorEmail || !newCollaboratorRole) {
      showErrorAlert('Please enter an email address and select a role.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail)) {
      showErrorAlert('Please enter a valid email address.');
      return;
    }
    
    setIsAddingCollaborator(true);
    
    Meteor.call(
      'surveys.addCollaborator', 
      surveyId, 
      newCollaboratorEmail, 
      newCollaboratorRole,
      true, // Send email notification
      (error: any) => {
        setIsAddingCollaborator(false);
        
        if (error) {
          console.error('Error adding collaborator:', error);
          showErrorAlert(error.reason || 'Failed to add collaborator. Please try again.');
        } else {
          // Show success message
          showSuccessAlert(`Successfully added ${newCollaboratorEmail} as a collaborator.`);
          
          // Reset form fields
          setNewCollaboratorEmail('');
          setNewCollaboratorRole('editor');
          
          // Reload collaborators list
          loadCollaborators();
        }
      }
    );
  };
  
  // Function to remove a collaborator
  const handleRemoveCollaborator = (collaboratorId: string, email: string) => {
    if (!surveyId || !collaboratorId) return;
    
    if (window.confirm(`Are you sure you want to remove ${email} as a collaborator?`)) {
      Meteor.call('surveys.removeCollaborator', surveyId, collaboratorId, (error: any) => {
        if (error) {
          console.error('Error removing collaborator:', error);
          showErrorAlert(error.reason || 'Failed to remove collaborator. Please try again.');
        } else {
          showSuccessAlert(`Successfully removed ${email} as a collaborator.`);
          loadCollaborators();
        }
      });
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Collaboration</h2>
        <p className="text-muted">Manage collaborators for this survey</p>
      </div>
      <div className="panel-body">
        <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
          Add collaborators to allow other users to work on this survey. Collaborators can edit, preview, and manage the survey based on their assigned role.
        </p>
        
        {/* Collaborator Search and Add Section */}
        <div style={{ 
          marginBottom: 24,
          padding: 20,
          backgroundColor: '#f5edf3',
          borderRadius: 12,
          border: '1px solid #e5d6e2'
        }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            color: '#552a47',
            marginTop: 0,
            marginBottom: 16
          }}>
            Add New Collaborator
          </h3>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 3 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Email Address
              </label>
              <input 
                type="email" 
                value={newCollaboratorEmail}
                onChange={(e) => {
                  setNewCollaboratorEmail(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                placeholder="Enter email address"
                style={{
                  width: '93%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Role
              </label>
              <select
                value={newCollaboratorRole}
                onChange={(e) => {
                  setNewCollaboratorRole(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  fontSize: 14,
                  backgroundColor: '#fff'
                }}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleAddCollaborator}
                disabled={isAddingCollaborator || !newCollaboratorEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  backgroundColor: '#552a47',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isAddingCollaborator || !newCollaboratorEmail ? 'not-allowed' : 'pointer',
                  opacity: isAddingCollaborator || !newCollaboratorEmail ? 0.7 : 1
                }}
              >
                {isAddingCollaborator ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FiUserPlus size={16} />
                    <span>Add Collaborator</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Current Collaborators List */}
        <div>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            color: '#552a47',
            marginTop: 0,
            marginBottom: 16
          }}>
            Current Collaborators
          </h3>
          
          {/* Table Header */}
          <div style={{
            display: 'flex',
            padding: '12px 16px',
            backgroundColor: '#f9f9f9',
            borderBottom: '2px solid #e0e0e0',
            fontSize: 14,
            fontWeight: 600,
            color: '#333'
          }}>
            <div style={{ flex: 2 }}>Email</div>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ flex: 1 }}>Role</div>
            <div style={{ flex: 1 }}>Added On</div>
            <div style={{ width: 100, textAlign: 'center' }}>Actions</div>
          </div>
          
          {/* Loading State */}
          {isLoadingCollaborators && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#666' }}>
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div style={{ marginTop: 12 }}>Loading collaborators...</div>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoadingCollaborators && collaborators.length === 0 && (
            <div style={{ 
              padding: '32px 0', 
              textAlign: 'center', 
              color: '#666',
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              margin: '16px 0'
            }}>
              <FiUsers size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>No collaborators yet</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>Add collaborators using the form above</div>
            </div>
          )}
          
          {/* Collaborator Rows */}
          {!isLoadingCollaborators && collaborators.map((collaborator) => (
            <div 
              key={collaborator.userId} 
              style={{
                display: 'flex',
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                fontSize: 14,
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 2 }}>{collaborator.email}</div>
              <div style={{ flex: 1 }}>{collaborator.name || '-'}</div>
              <div style={{ flex: 1 }}>
                <span style={{ 
                  padding: '4px 8px',
                  backgroundColor: collaborator.role === 'editor' ? '#f5edf3' : '#e3f2fd',
                  color: collaborator.role === 'editor' ? '#552a47' : '#1565c0',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {collaborator.role === 'editor' ? 'Editor' : 'Viewer'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                {collaborator.addedAt ? new Date(collaborator.addedAt).toLocaleDateString() : '-'}
              </div>
              <div style={{ width: 100, textAlign: 'center' }}>
                <button
                  onClick={() => handleRemoveCollaborator(collaborator.userId, collaborator.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    backgroundColor: '#fff',
                    color: '#d32f2f',
                    border: '1px solid #d32f2f',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  <FiTrash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationTab;
