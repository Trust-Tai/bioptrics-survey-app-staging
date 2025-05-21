import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiInfo, FiCalendar, FiClock, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { EmailSettings } from '../types/surveyTypes';

interface EmailSettingsStepProps {
  emailSettings?: EmailSettings;
  onEmailSettingsChange: (settings: EmailSettings) => void;
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoBox = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const InfoIcon = styled.div`
  color: #b7a36a;
  font-size: 20px;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #4a5568;
  margin: 0;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  margin-right: 8px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #b7a36a;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1c1c1c;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  max-width: 300px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  
  background: ${props => props.primary ? '#b7a36a' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  
  &:hover {
    background: ${props => props.primary ? '#a08e54' : '#f7fafc'};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const DaysContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const DayButton = styled.button<{ selected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  background: ${props => props.selected ? '#b7a36a' : 'white'};
  color: ${props => props.selected ? 'white' : '#4a5568'};
  border: 1px solid ${props => props.selected ? '#b7a36a' : '#e2e8f0'};
  
  &:hover {
    background: ${props => props.selected ? '#a08e54' : '#f7fafc'};
  }
`;

const TemplateEditor = styled.div`
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const TemplateEditorHeader = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TemplateEditorTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1c;
`;

const TemplateVariables = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TemplateVariable = styled.button`
  padding: 4px 8px;
  background: #f1f5f9;
  color: #4a5568;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const TemplateContent = styled.div`
  padding: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const TemplatePreviewButton = styled.button`
  background: none;
  border: none;
  color: #b7a36a;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmailTemplatePreview = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 16px;
  margin-top: 16px;
  background: white;
`;

const EmailSettingsStep: React.FC<EmailSettingsStepProps> = ({ 
  emailSettings,
  onEmailSettingsChange 
}) => {
  // Initialize default settings if none provided
  const [settings, setSettings] = useState<EmailSettings>(emailSettings || {
    sendReminders: false,
    reminderFrequency: 'weekly',
    customDays: [3, 7, 14], // 3 days, 7 days, 14 days after start
    reminderTemplate: `Subject: Reminder: Complete your BIOPTRICS survey
    
Dear {{participant_name}},

This is a friendly reminder that you have a survey waiting for your response.

Survey: {{survey_title}}
Deadline: {{end_date}}

Your feedback is important to us. Please take a few minutes to complete the survey using the link below:

{{survey_link}}

Thank you for your participation!

Best regards,
The BIOPTRICS Team`
  });
  
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Function to toggle send reminders
  const toggleSendReminders = () => {
    const updatedSettings = {
      ...settings,
      sendReminders: !settings.sendReminders
    };
    setSettings(updatedSettings);
    onEmailSettingsChange(updatedSettings);
  };
  
  // Function to change reminder frequency
  const changeReminderFrequency = (frequency: 'daily' | 'weekly' | 'custom') => {
    const updatedSettings = {
      ...settings,
      reminderFrequency: frequency
    };
    setSettings(updatedSettings);
    onEmailSettingsChange(updatedSettings);
  };
  
  // Function to toggle a custom day
  const toggleCustomDay = (day: number) => {
    const customDays = settings.customDays || [];
    let updatedDays: number[];
    
    if (customDays.includes(day)) {
      updatedDays = customDays.filter(d => d !== day);
    } else {
      updatedDays = [...customDays, day].sort((a, b) => a - b);
    }
    
    const updatedSettings = {
      ...settings,
      customDays: updatedDays
    };
    
    setSettings(updatedSettings);
    onEmailSettingsChange(updatedSettings);
  };
  
  // Function to update the reminder template
  const updateReminderTemplate = (template: string) => {
    const updatedSettings = {
      ...settings,
      reminderTemplate: template
    };
    setSettings(updatedSettings);
    onEmailSettingsChange(updatedSettings);
  };
  
  // Insert a variable into the template
  const insertVariable = (variable: string) => {
    const template = settings.reminderTemplate || '';
    const textarea = document.getElementById('reminder-template') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      const updatedTemplate = `${before}{{${variable}}}${after}`;
      updateReminderTemplate(updatedTemplate);
      
      // Focus the textarea and set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + variable.length + 4; // +4 for the {{ and }}
        textarea.selectionEnd = start + variable.length + 4;
      }, 0);
    } else {
      // If the textarea is not available, just append the variable
      updateReminderTemplate(`${template}{{${variable}}}`);
    }
  };
  
  // Generate a preview of the template with real data
  const generatePreview = () => {
    let preview = settings.reminderTemplate || '';
    
    // Replace variables with example values
    preview = preview
      .replace(/{{participant_name}}/g, 'John Doe')
      .replace(/{{survey_title}}/g, 'Employee Engagement Survey')
      .replace(/{{start_date}}/g, new Date().toLocaleDateString())
      .replace(/{{end_date}}/g, new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString())
      .replace(/{{survey_link}}/g, 'https://app.bioptrics.com/survey/example-survey')
      .replace(/{{company_name}}/g, 'BIOPTRICS Inc.');
    
    return preview;
  };
  
  return (
    <Container>
      <InfoBox>
        <InfoIcon>
          <FiInfo />
        </InfoIcon>
        <InfoContent>
          <InfoTitle>Email Reminders</InfoTitle>
          <InfoText>
            Configure automated email reminders to encourage participants to complete their surveys. 
            You can customize the frequency and content of reminder emails to maximize response rates.
          </InfoText>
        </InfoContent>
      </InfoBox>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <FiMail />
            Email Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                checked={settings.sendReminders}
                onChange={toggleSendReminders}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <ToggleLabel>
              {settings.sendReminders ? 'Reminders Enabled' : 'Reminders Disabled'}
            </ToggleLabel>
          </div>
          
          {settings.sendReminders && (
            <>
              <FormGroup>
                <Label>Reminder Frequency</Label>
                <RadioGroup>
                  <RadioOption>
                    <RadioInput 
                      type="radio" 
                      name="frequency" 
                      checked={settings.reminderFrequency === 'daily'}
                      onChange={() => changeReminderFrequency('daily')}
                    />
                    Daily
                  </RadioOption>
                  <RadioOption>
                    <RadioInput 
                      type="radio" 
                      name="frequency" 
                      checked={settings.reminderFrequency === 'weekly'}
                      onChange={() => changeReminderFrequency('weekly')}
                    />
                    Weekly
                  </RadioOption>
                  <RadioOption>
                    <RadioInput 
                      type="radio" 
                      name="frequency" 
                      checked={settings.reminderFrequency === 'custom'}
                      onChange={() => changeReminderFrequency('custom')}
                    />
                    Custom
                  </RadioOption>
                </RadioGroup>
              </FormGroup>
              
              {settings.reminderFrequency === 'custom' && (
                <FormGroup>
                  <Label>Reminder Days (days after survey start)</Label>
                  <DaysContainer>
                    {[1, 2, 3, 5, 7, 10, 14, 21, 28].map(day => (
                      <DayButton 
                        key={day}
                        selected={(settings.customDays || []).includes(day)}
                        onClick={() => toggleCustomDay(day)}
                      >
                        {day}
                      </DayButton>
                    ))}
                  </DaysContainer>
                </FormGroup>
              )}
              
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Label>Email Template</Label>
                  <Button onClick={() => setShowTemplateEditor(!showTemplateEditor)}>
                    <FiEdit size={14} />
                    {showTemplateEditor ? 'Hide Editor' : 'Edit Template'}
                  </Button>
                </div>
                
                {showTemplateEditor && (
                  <TemplateEditor>
                    <TemplateEditorHeader>
                      <TemplateEditorTitle>Reminder Email Template</TemplateEditorTitle>
                      <TemplatePreviewButton onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </TemplatePreviewButton>
                    </TemplateEditorHeader>
                    <TemplateContent>
                      <div style={{ marginBottom: '16px' }}>
                        <Label>Available Variables:</Label>
                        <TemplateVariables>
                          <TemplateVariable onClick={() => insertVariable('participant_name')}>
                            Participant Name
                          </TemplateVariable>
                          <TemplateVariable onClick={() => insertVariable('survey_title')}>
                            Survey Title
                          </TemplateVariable>
                          <TemplateVariable onClick={() => insertVariable('start_date')}>
                            Start Date
                          </TemplateVariable>
                          <TemplateVariable onClick={() => insertVariable('end_date')}>
                            End Date
                          </TemplateVariable>
                          <TemplateVariable onClick={() => insertVariable('survey_link')}>
                            Survey Link
                          </TemplateVariable>
                          <TemplateVariable onClick={() => insertVariable('company_name')}>
                            Company Name
                          </TemplateVariable>
                        </TemplateVariables>
                      </div>
                      
                      <Textarea 
                        id="reminder-template"
                        value={settings.reminderTemplate || ''}
                        onChange={(e) => updateReminderTemplate(e.target.value)}
                        placeholder="Enter your email template here..."
                      />
                      
                      {showPreview && (
                        <EmailTemplatePreview>
                          <h4>Email Preview:</h4>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {generatePreview()}
                          </div>
                        </EmailTemplatePreview>
                      )}
                    </TemplateContent>
                  </TemplateEditor>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmailSettingsStep;
