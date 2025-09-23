import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUsers, FiUserPlus, FiMail, FiX, FiBold, FiItalic, FiList, FiAlignLeft, FiRefreshCw } from 'react-icons/fi';
import { FaUnderline, FaListOl, FaListUl, FaHeading } from 'react-icons/fa';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Random } from 'meteor/random';
import { EmailTemplates } from '../api/emailTemplates';
import { SurveyInvitations } from '../api/surveyInvitations';

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #552a47;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f5f5;
    color: #552a47;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
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

const TabContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const RichTextEditorContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const EditorToolbar = styled.div`
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
  flex-wrap: wrap;
  gap: 4px;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  background-color: ${props => props.active ? '#e0e0e0' : 'transparent'};
  border: 1px solid ${props => props.active ? '#ccc' : 'transparent'};
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ToolbarSelect = styled.select`
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const EditorContent = styled.div`
  padding: 12px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  
  &:focus {
    outline: none;
  }
  
  & h1, & h2, & h3, & h4, & h5, & h6 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  & p {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  & ul, & ol {
    margin-left: 1.5em;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Button = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6d3a5d;
  }
  
  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin-top: 10px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: #552a47;
  transition: width 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #eee;
  font-weight: 600;
  color: #333;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const TemplatePreview = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 20px;
  margin-top: 16px;
  background-color: #f9f9f9;
`;

// Add a spinning animation for loading states
const GlobalStyle = styled.div`
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface SurveyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  surveyTitle: string;
}

const SurveyShareModal: React.FC<SurveyShareModalProps> = ({ isOpen, onClose, surveyId, surveyTitle }) => {
  // Debug log to verify the component is being rendered
  // console.log('Rendering SurveyShareModal:', { isOpen, surveyId, surveyTitle });
  const [activeTab, setActiveTab] = useState<'invite' | 'invited' | 'email'>('invite');
  const [emailList, setEmailList] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [emailSubject, setEmailSubject] = useState(`You've been invited to participate in: ${surveyTitle}`);
  const [emailTemplate, setEmailTemplate] = useState(`
    <p>Hello,</p>
    <p>You have been invited to participate in the survey: <strong>${surveyTitle}</strong>.</p>
    <p>Click the link below to access the survey:</p>
    <p>[Survey Link will be inserted here]</p>
    <p>Thank you,<br>The Survey Team</p>
  `);
  
  // New state
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitationsPerPage] = useState(10);
  const [testMode, setTestMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);
  
  // Fetch invitations from the database
  const { invitations, invitationsLoading, invitationsCount } = useTracker(() => {
    console.log('Getting invitations for survey:', surveyId);
    console.log('SurveyInvitations collection exists in component:', !!SurveyInvitations);
    
    // Subscribe to invitations for this survey
    const subscription = Meteor.subscribe('survey.invitations', surveyId, {
      onReady: () => {
        console.log('Subscription is ready');
        // Count invitations directly after subscription is ready
        const count = SurveyInvitations.find({ surveyId }).count();
        console.log(`Found ${count} invitations after subscription ready`);
      },
      onStop: (error) => {
        if (error) {
          console.error('Subscription error:', error);
        }
      }
    });
    
    // Get invitations data
    const invitationsData = SurveyInvitations.find(
      { surveyId }, 
      { sort: { sentAt: -1 } }
    ).fetch();
    
    console.log('Found DB invitations:', invitationsData.length);
    if (invitationsData.length > 0) {
      console.log('Sample invitation:', invitationsData[0]);
    }
    
    return {
      invitations: invitationsData,
      invitationsLoading: !subscription.ready(),
      invitationsCount: invitationsData.length
    };
  }, [surveyId, activeTab]); // Re-run when tab changes
  
  // Get total count for pagination
  const { totalInvitations } = useTracker(() => {
    const countSub = Meteor.subscribe('counts.surveyInvitations', surveyId);
    return {
      totalInvitations: Counts.get(`count.surveyInvitations.${surveyId}`) || 0
    };
  }, [surveyId]);
  
  // Fetch email template
  useTracker(() => {
    const templateSub = Meteor.subscribe('survey.emailTemplates', surveyId);
    
    if (templateSub.ready()) {
      const template = EmailTemplates.findOne({ surveyId, type: 'invitation' });
      if (template) {
        setEmailSubject(template.subject);
        setEmailTemplate(template.body);
      }
    }
  }, [surveyId]);
  
  // Clear messages when changing tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  // If modal is not open, don't render anything
  if (!isOpen) {
    console.log('SurveyShareModal is not open, returning null');
    return null;
  }

  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Function to simulate progress updates while waiting for server response
  const simulateProgress = (emailCount: number) => {
    // Start at 5% to show immediate feedback
    let currentProgress = 5;
    
    // Calculate how many steps we need based on email count
    const totalSteps = Math.min(emailCount * 2, 20); // Max 20 steps
    const progressStep = 90 / totalSteps; // Go up to 95% (server will set 100%)
    
    const progressInterval = setInterval(() => {
      if (currentProgress >= 95) {
        clearInterval(progressInterval);
        return;
      }
      
      currentProgress += progressStep;
      setProgress(Math.min(Math.round(currentProgress), 95));
    }, 500); // Update every 500ms
    
    return progressInterval;
  };
  
  const handleSendInvites = () => {
    // show notification if email list is empty
    let emailsToSend = emailList.trim();
    if (!emailsToSend) {
      setError('Please enter at least one email address');
      return;
    }
    
    // Parse email list
    const emailLines = emailsToSend
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    // Validate email formats
    const invalidEmails: string[] = [];
    const validEmails: string[] = [];
    
    emailLines.forEach(email => {
      if (isValidEmail(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });
    
    // If there are invalid emails, show error and don't proceed
    if (invalidEmails.length > 0) {
      setError(
        `The following email(s) are invalid: ${invalidEmails.join(', ')}. ` +
        'Please correct them and try again.'
      );
      return;
    }
    
    // If no valid emails, show error
    if (validEmails.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setActiveInvitationId(null);
    
    console.log('Sending invitations for survey:', surveyId);
    console.log('Emails to invite:', validEmails);
    console.log('Current user ID:', Meteor.userId());
    
    // Set initial progress state
    setProgress(5); // Start at 5% to show immediate feedback
    setTotalEmails(validEmails.length);
    
    // Start simulating progress
    const progressInterval = simulateProgress(validEmails.length);
    
    // Call the method to save invitations to the database
    Meteor.call('surveys.sendInvitations', surveyId, validEmails, testMode, (error: Meteor.Error, result: any) => {
      // Clear the progress simulation interval
      clearInterval(progressInterval);
      setLoading(false);
      
      if (error) {
        console.error('Error sending invitations:', error);
        setError(`Failed to send invitations: ${error.message}`);
        setProgress(0);
      } else {
        console.log('Invitation result:', result);
        
        // Set the final progress
        setProgress(result.progress || 100);
        
        // Clear the input and show success message
        setEmailList('');
        
        // Create a more detailed success message
        let successMessage = `Successfully processed ${result.count} invitation(s)`;
        
        // Add email sending status if not in test mode
        if (!result.testMode && result.emailsSent > 0) {
          successMessage += ` and sent ${result.emailsSent} email(s)`;
        } else if (result.testMode) {
          successMessage += ` (Test mode: no emails were sent)`;
        }
        
        setSuccess(successMessage);
        
        // Switch to Invited tab
        setActiveTab('invited');
      }
    });
  };
  
  const handleSaveTemplate = () => {
    setSavingTemplate(true);
    setError(null);
    setSuccess(null);
    
    Meteor.call('surveys.saveEmailTemplate', surveyId, 'invitation', emailSubject, emailTemplate, (error: Meteor.Error) => {
      setSavingTemplate(false);
      
      if (error) {
        setError(`Failed to save template: ${error.message}`);
      } else {
        setSuccess('Email template saved successfully');
      }
    });
  };
  
  const handleResendInvitation = (invitationId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setActiveInvitationId(invitationId);
    
    // Set initial progress
    setProgress(5);
    
    // Start simulating progress for a single email
    const progressInterval = simulateProgress(1);
    
    Meteor.call('surveys.resendInvitation', invitationId, testMode, (error: Meteor.Error, result: any) => {
      // Clear the progress simulation interval
      clearInterval(progressInterval);
      setLoading(false);
      setActiveInvitationId(null);
      
      if (error) {
        console.error('Error resending invitation:', error);
        setError(`Failed to resend invitation: ${error.message}`);
        setProgress(0);
      } else {
        console.log('Resend result:', result);
        
        // Set final progress
        setProgress(100);
        
        // Create a more detailed success message
        let successMessage = 'Invitation processed successfully';
        
        // Add email sending status if not in test mode
        if (!result.testMode && result.emailSent) {
          successMessage = 'Invitation resent successfully';
        } else if (result.testMode) {
          successMessage += ' (Test mode: no email was sent)';
        }
        
        setSuccess(successMessage);
      }
    });
  };
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalInvitations / invitationsPerPage) || 1;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Share Survey: {surveyTitle}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'invite'} 
            onClick={() => setActiveTab('invite')}
          >
            <FiUserPlus size={16} />
            Invite
          </Tab>
          <Tab 
            active={activeTab === 'invited'} 
            onClick={() => setActiveTab('invited')}
          >
            <FiUsers size={16} />
            Invited
          </Tab>
          <Tab 
            active={activeTab === 'email'} 
            onClick={() => setActiveTab('email')}
          >
            <FiMail size={16} />
            Email
          </Tab>
        </TabContainer>
        
        <TabContent>
          {activeTab === 'invite' && (
            <>
              <FormGroup>
                <Label>Invite by Email</Label>
                <TextArea 
                  placeholder="Enter multiple email addresses (one per line)" 
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  rows={8}
                />
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                  You can enter multiple email addresses, one per line.
                </div>
              </FormGroup>
              
              <FormGroup>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="testMode" style={{ margin: 0, cursor: 'pointer' }}>
                    Test Mode {testMode ? '(Emails will not be sent)' : '(Emails will be sent)'}
                  </label>
                </div>
              </FormGroup>
              
              <Button 
                onClick={handleSendInvites}
                disabled={loading}
                title={loading ? `Sending... ${progress}% complete` : "Send invitations to the entered email addresses"}
              >
                {loading ? (
                  <>
                    <FiRefreshCw size={16} className="spin" /> Sending... {progress}%
                  </>
                ) : (
                  <>
                    <FiUserPlus size={16} /> Send Invites
                  </>
                )}
              </Button>
              
              {loading && (
                <ProgressBarContainer>
                  <ProgressBarFill progress={progress} />
                </ProgressBarContainer>
              )}
              
              {error && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#ffebee', 
                  color: '#d32f2f',
                  borderRadius: '4px'
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#e8f5e9', 
                  color: '#388e3c',
                  borderRadius: '4px'
                }}>
                  {success}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'invited' && (
            <>
              {/* Show success message at the top of the Invited tab if present */}
              {success && (
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  backgroundColor: '#e8f5e9', 
                  color: '#388e3c',
                  borderRadius: '4px'
                }}>
                  {success}
                </div>
              )}
              
              {invitationsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading invitations...</div>
              ) : invitations.length > 0 ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Email</Th>
                        <Th>Status</Th>
                        <Th>Date Invited</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(invitation => (
                        <tr key={invitation._id}>
                          <Td>{invitation.recipientEmail}</Td>
                          <Td>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              backgroundColor: invitation.status === 'sent' ? '#e3f2fd' : 
                                              invitation.status === 'accepted' ? '#e8f5e9' :
                                              invitation.status === 'completed' ? '#e8f5e9' :
                                              invitation.status === 'failed' ? '#ffebee' : '#f5f5f5',
                              color: invitation.status === 'sent' ? '#1976d2' : 
                                     invitation.status === 'accepted' ? '#388e3c' :
                                     invitation.status === 'completed' ? '#388e3c' :
                                     invitation.status === 'failed' ? '#d32f2f' : '#757575',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </span>
                          </Td>
                          <Td>{new Date(invitation.sentAt).toLocaleDateString()}</Td>
                          <Td>
                            <Button 
                              onClick={() => handleResendInvitation(invitation._id)}
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              disabled={loading}
                              title={loading ? `Resending... ${progress}% complete` : "Resend this invitation"}
                            >
                              {loading && invitation._id === activeInvitationId ? (
                                <>
                                  <FiRefreshCw size={12} className="spin" /> {progress}%
                                </>
                              ) : (
                                "Resend"
                              )}
                            </Button>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  <Pagination>
                    <PaginationButton 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </PaginationButton>
                    
                    <PaginationInfo>
                      Page {currentPage} of {totalPages}
                    </PaginationInfo>
                    
                    <PaginationButton 
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </PaginationButton>
                  </Pagination>
                  
                  {loading && (
                    <ProgressBarContainer style={{ marginTop: '20px' }}>
                      <ProgressBarFill progress={progress} />
                    </ProgressBarContainer>
                  )}
                </>
              ) : (
                <EmptyState>
                  <p>No invitations have been sent yet.</p>
                </EmptyState>
              )}
            </>
          )}
          
          {activeTab === 'email' && (
            <>
              <FormGroup>
                <Label>Email Subject</Label>
                <Input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Email Template</Label>
                <RichTextEditorContainer>
                  <EditorToolbar>
                    <ToolbarSelect 
                      onChange={(e) => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          const selectedText = range.toString();
                          
                          if (selectedText) {
                            document.execCommand('formatBlock', false, e.target.value);
                          }
                        }
                      }}
                    >
                      <option value="p">Normal</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="h4">Heading 4</option>
                    </ToolbarSelect>
                    
                    <ToolbarButton 
                      type="button" 
                      onClick={() => document.execCommand('bold', false, '')}
                      title="Bold"
                    >
                      <FiBold />
                    </ToolbarButton>
                    
                    <ToolbarButton 
                      type="button" 
                      onClick={() => document.execCommand('italic', false, '')}
                      title="Italic"
                    >
                      <FiItalic />
                    </ToolbarButton>
                    
                    <ToolbarButton 
                      type="button" 
                      onClick={() => document.execCommand('underline', false, '')}
                      title="Underline"
                    >
                      <FaUnderline />
                    </ToolbarButton>
                    
                    <ToolbarButton 
                      type="button" 
                      onClick={() => document.execCommand('insertUnorderedList', false, '')}
                      title="Bullet List"
                    >
                      <FaListUl />
                    </ToolbarButton>
                    
                    <ToolbarButton 
                      type="button" 
                      onClick={() => document.execCommand('insertOrderedList', false, '')}
                      title="Numbered List"
                    >
                      <FaListOl />
                    </ToolbarButton>
                  </EditorToolbar>
                  
                  <EditorContent
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: emailTemplate }}
                    onBlur={(e) => setEmailTemplate(e.currentTarget.innerHTML)}
                    suppressContentEditableWarning={true}
                  />
                </RichTextEditorContainer>
              </FormGroup>
              
              <FormGroup>
                <Label>Available Variables</Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'recipientName', display: '{{recipientName}}' },
                    { name: 'surveyTitle', display: '{{surveyTitle}}' },
                    { name: 'surveyLink', display: '{{surveyLink}}' },
                    { name: 'senderName', display: '{{senderName}}' }
                  ].map((variable) => (
                    <code 
                      key={variable.name}
                      style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        // Get the editor element
                        const editor = document.querySelector('.EditorContent') as HTMLElement;
                        if (editor) {
                          // Focus the editor first
                          editor.focus();
                          
                          // Insert the variable text at cursor position
                          document.execCommand('insertText', false, variable.display);
                          
                          // Update the template state with the new content
                          setEmailTemplate(editor.innerHTML);
                        }
                      }}
                    >
                      {variable.display}
                    </code>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                  Click on a variable to insert it at the cursor position in the editor.
                </div>
              </FormGroup>
              
              <FormGroup>
                <Label>Preview</Label>
                <TemplatePreview dangerouslySetInnerHTML={{ __html: emailTemplate }} />
              </FormGroup>
              
              {error && (
                <div style={{ 
                  marginTop: '16px', 
                  marginBottom: '16px',
                  padding: '12px', 
                  backgroundColor: '#ffebee', 
                  color: '#d32f2f',
                  borderRadius: '4px'
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ 
                  marginTop: '16px', 
                  marginBottom: '16px',
                  padding: '12px', 
                  backgroundColor: '#e8f5e9', 
                  color: '#388e3c',
                  borderRadius: '4px'
                }}>
                  {success}
                </div>
              )}
              
              <Button 
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
              >
                {savingTemplate ? 'Saving...' : 'Save Template'}
              </Button>
            </>
          )}
        </TabContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default SurveyShareModal;
