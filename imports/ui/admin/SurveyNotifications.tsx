import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiMail, FiSend, FiUsers, FiPlus, FiX, FiCheck, FiInfo } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
`;

const RecipientList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Recipient = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 14px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  
  &:hover {
    color: #e53935;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #6b3659;
  }
  
  &:disabled {
    background: #d1c4cc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      case 'info': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      case 'info': return '#1565c0';
      default: return '#333';
    }
  }};
  border-radius: 6px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddRecipientForm = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eee;
  }
`;

const TemplateSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const HistoryContainer = styled.div`
  margin-top: 32px;
`;

const HistoryItem = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const HistoryDate = styled.div`
  font-size: 14px;
  color: #666;
`;

const HistoryRecipients = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
`;

const HistoryMessage = styled.div`
  font-size: 14px;
  color: #333;
  white-space: pre-wrap;
`;

// Types
interface NotificationHistory {
  sentAt: Date;
  recipients: string[];
  message: string;
  sentBy: string;
}

interface SurveyNotificationsProps {
  surveyId: string;
  surveyTitle: string;
  notificationHistory?: NotificationHistory[];
}

const messageTemplates = [
  {
    id: 'invitation',
    name: 'Survey Invitation',
    subject: 'You\'re invited to take our survey',
    body: 'Hello,\n\nYou\'re invited to participate in our survey: {{surveyTitle}}.\n\nYour feedback is important to us and will help us improve our services.\n\nClick the link below to start the survey:\n{{surveyLink}}\n\nThank you for your time!\n\nBest regards,\nThe Team'
  },
  {
    id: 'reminder',
    name: 'Survey Reminder',
    subject: 'Reminder: Please complete our survey',
    body: 'Hello,\n\nThis is a friendly reminder to complete our survey: {{surveyTitle}}.\n\nWe value your input and would appreciate if you could take a few minutes to share your thoughts.\n\nClick the link below to start the survey:\n{{surveyLink}}\n\nThank you for your time!\n\nBest regards,\nThe Team'
  },
  {
    id: 'thankYou',
    name: 'Thank You Message',
    subject: 'Thank you for completing our survey',
    body: 'Hello,\n\nThank you for completing our survey: {{surveyTitle}}.\n\nYour feedback is invaluable and will help us improve our services.\n\nWe appreciate your time and input!\n\nBest regards,\nThe Team'
  }
];

const SurveyNotifications: React.FC<SurveyNotificationsProps> = ({ 
  surveyId, 
  surveyTitle,
  notificationHistory = []
}) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [history, setHistory] = useState<NotificationHistory[]>(notificationHistory);

  // Update message when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = messageTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        // Replace placeholders with actual values
        let messageText = template.body
          .replace('{{surveyTitle}}', surveyTitle)
          .replace('{{surveyLink}}', `${window.location.origin}/public/${surveyId}`);
        
        setMessage(messageText);
      }
    }
  }, [selectedTemplate, surveyTitle, surveyId]);

  const addRecipient = () => {
    if (!newRecipient) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      setStatus({
        message: 'Please enter a valid email address',
        type: 'error'
      });
      return;
    }
    
    if (!recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
    }
    
    setNewRecipient('');
    setStatus(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  const sendNotification = () => {
    if (recipients.length === 0) {
      setStatus({
        message: 'Please add at least one recipient',
        type: 'error'
      });
      return;
    }
    
    if (!message.trim()) {
      setStatus({
        message: 'Please enter a message',
        type: 'error'
      });
      return;
    }
    
    setSending(true);
    setStatus({
      message: 'Sending notification...',
      type: 'info'
    });
    
    Meteor.call('surveys.sendNotifications', surveyId, recipients, message, (error: any, result: any) => {
      setSending(false);
      
      if (error) {
        console.error('Error sending notification:', error);
        setStatus({
          message: `Failed to send: ${error.message}`,
          type: 'error'
        });
      } else {
        setStatus({
          message: `Notification sent successfully to ${result.recipientCount} recipients!`,
          type: 'success'
        });
        
        // Add to history
        const newNotification: NotificationHistory = {
          sentAt: new Date(),
          recipients: [...recipients],
          message,
          sentBy: Meteor.userId() || 'unknown'
        };
        
        setHistory([newNotification, ...history]);
        
        // Reset form
        setRecipients([]);
        setMessage('');
        setSelectedTemplate('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus(null);
        }, 5000);
      }
    });
  };

  return (
    <Container>
      <Header>
        <Title>Survey Notifications</Title>
      </Header>
      
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Send email notifications to invite participants, remind them to complete the survey, or thank them for their responses.
      </div>
      
      <FormGroup>
        <Label>Message Template</Label>
        <TemplateSelect 
          value={selectedTemplate} 
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="">Select a template...</option>
          {messageTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </TemplateSelect>
      </FormGroup>
      
      <FormGroup>
        <Label>Recipients</Label>
        <AddRecipientForm>
          <Input 
            type="email" 
            placeholder="Enter email address" 
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <AddButton onClick={addRecipient}>
            <FiPlus size={18} />
          </AddButton>
        </AddRecipientForm>
        
        {recipients.length > 0 && (
          <RecipientList>
            {recipients.map(email => (
              <Recipient key={email}>
                {email}
                <RemoveButton onClick={() => removeRecipient(email)}>
                  <FiX size={16} />
                </RemoveButton>
              </Recipient>
            ))}
          </RecipientList>
        )}
      </FormGroup>
      
      <FormGroup>
        <Label>Message</Label>
        <TextArea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
        />
      </FormGroup>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SendButton onClick={sendNotification} disabled={sending}>
          <FiSend size={18} />
          {sending ? 'Sending...' : 'Send Notification'}
        </SendButton>
      </div>
      
      {status && (
        <StatusMessage type={status.type}>
          {status.type === 'success' ? <FiCheck size={18} /> : 
           status.type === 'error' ? <FiX size={18} /> : 
           <FiInfo size={18} />}
          {status.message}
        </StatusMessage>
      )}
      
      {history.length > 0 && (
        <HistoryContainer>
          <Title style={{ marginBottom: '16px' }}>Notification History</Title>
          
          {history.map((item, index) => (
            <HistoryItem key={index}>
              <HistoryHeader>
                <strong>Sent {new Date(item.sentAt).toLocaleString()}</strong>
                <HistoryDate>by {item.sentBy}</HistoryDate>
              </HistoryHeader>
              <HistoryRecipients>
                <strong>To:</strong> {item.recipients.join(', ')}
              </HistoryRecipients>
              <HistoryMessage>{item.message}</HistoryMessage>
            </HistoryItem>
          ))}
        </HistoryContainer>
      )}
    </Container>
  );
};

export default SurveyNotifications;
