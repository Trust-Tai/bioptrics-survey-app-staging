import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiSave, FiClock, FiUsers, FiLock, FiMail, FiGlobe, FiRepeat, FiCalendar } from 'react-icons/fi';

// Styled components for the settings UI
const Container = styled.div`
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
  color: #552a47;
  margin: 0;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #552a47;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #441e38;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const SettingsCard = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CardIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #f9f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
`;

const CardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const SettingGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
`;

const SettingDescription = styled.p`
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  input {
    cursor: pointer;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
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
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-height: 40px;
  
  &:focus-within {
    border-color: #552a47;
  }
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f9f4f8;
  border-radius: 4px;
  font-size: 13px;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #e74c3c;
    }
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
`;

// Types for survey settings
export interface SurveySettings {
  // Response settings
  allowAnonymous: boolean;
  requireLogin: boolean;
  allowSave: boolean;
  allowSkip: boolean;
  
  // Display settings
  showProgressBar: boolean;
  showThankYou: boolean;
  thankYouMessage: string;
  redirectUrl: string;
  
  // Limits & restrictions
  responseLimit: number;
  expiryDate?: string;
  
  // Schedule settings
  startDate?: string;
  autoPublish: boolean;
  recurringSchedule: boolean;
  recurringFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  
  // Access control
  restrictAccess: boolean;
  allowedGroups: string[];
  passwordProtected: boolean;
  accessPassword: string;
  
  // Notifications
  notificationEmails: string[];
  notifyOnCompletion: boolean;
  notifyOnQuota: boolean;
  
  // Categorization
  themes: string[];
  categories: string[];
}

interface SurveySettingsProps {
  surveyId: string;
  initialSettings?: Partial<SurveySettings>;
  onSave?: (settings: SurveySettings) => void;
}

const defaultSettings: SurveySettings = {
  allowAnonymous: true,
  requireLogin: false,
  allowSave: true,
  allowSkip: true,
  
  showProgressBar: true,
  showThankYou: true,
  thankYouMessage: 'Thank you for completing the survey!',
  redirectUrl: '',
  
  responseLimit: 0,
  expiryDate: '',
  
  startDate: '',
  autoPublish: false,
  recurringSchedule: false,
  recurringFrequency: 'monthly',
  
  restrictAccess: false,
  allowedGroups: [],
  passwordProtected: false,
  accessPassword: '',
  
  notificationEmails: [],
  notifyOnCompletion: false,
  notifyOnQuota: false,
  
  themes: [],
  categories: []
};

const SurveySettings: React.FC<SurveySettingsProps> = ({
  surveyId,
  initialSettings,
  onSave
}) => {
  const [settings, setSettings] = useState<SurveySettings>(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  
  // Email input state
  const [emailInput, setEmailInput] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        ...defaultSettings,
        ...initialSettings
      });
    }
  }, [initialSettings]);
  
  const handleChange = <K extends keyof SurveySettings>(key: K, value: SurveySettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    handleChange(name as keyof SurveySettings, checked as any);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof SurveySettings, value as any);
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof SurveySettings, parseInt(value) as any);
  };
  
  // Tag input handlers
  const addEmail = () => {
    if (emailInput && !settings.notificationEmails.includes(emailInput)) {
      handleChange('notificationEmails', [...settings.notificationEmails, emailInput]);
      setEmailInput('');
    }
  };
  
  const removeEmail = (email: string) => {
    handleChange('notificationEmails', settings.notificationEmails.filter(e => e !== email));
  };
  
  const addGroup = () => {
    if (groupInput && !settings.allowedGroups.includes(groupInput)) {
      handleChange('allowedGroups', [...settings.allowedGroups, groupInput]);
      setGroupInput('');
    }
  };
  
  const removeGroup = (group: string) => {
    handleChange('allowedGroups', settings.allowedGroups.filter(g => g !== group));
  };
  
  const addTheme = () => {
    if (themeInput && !settings.themes.includes(themeInput)) {
      handleChange('themes', [...settings.themes, themeInput]);
      setThemeInput('');
    }
  };
  
  const removeTheme = (theme: string) => {
    handleChange('themes', settings.themes.filter(t => t !== theme));
  };
  
  const addCategory = () => {
    if (categoryInput && !settings.categories.includes(categoryInput)) {
      handleChange('categories', [...settings.categories, categoryInput]);
      setCategoryInput('');
    }
  };
  
  const removeCategory = (category: string) => {
    handleChange('categories', settings.categories.filter(c => c !== category));
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    setIsDirty(false);
  };
  
  return (
    <Container>
      <Header>
        <Title>Survey Settings</Title>
        <SaveButton onClick={handleSave} disabled={!isDirty}>
          <FiSave size={16} />
          Save Settings
        </SaveButton>
      </Header>
      
      <SettingsGrid>
        {/* Response Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiUsers size={18} />
            </CardIcon>
            <CardTitle>Response Settings</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="allowAnonymous" 
                checked={settings.allowAnonymous} 
                onChange={handleCheckboxChange} 
              />
              Allow Anonymous Responses
            </Checkbox>
            <SettingDescription>
              Allow users to submit responses without identifying information
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="requireLogin" 
                checked={settings.requireLogin} 
                onChange={handleCheckboxChange} 
              />
              Require Login
            </Checkbox>
            <SettingDescription>
              Users must be logged in to submit responses
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="allowSave" 
                checked={settings.allowSave} 
                onChange={handleCheckboxChange} 
              />
              Allow Save & Continue Later
            </Checkbox>
            <SettingDescription>
              Users can save their progress and continue later
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="allowSkip" 
                checked={settings.allowSkip} 
                onChange={handleCheckboxChange} 
              />
              Allow Skipping Questions
            </Checkbox>
            <SettingDescription>
              Users can skip non-required questions
            </SettingDescription>
          </SettingGroup>
        </SettingsCard>
        
        {/* Display Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiGlobe size={18} />
            </CardIcon>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="showProgressBar" 
                checked={settings.showProgressBar} 
                onChange={handleCheckboxChange} 
              />
              Show Progress Bar
            </Checkbox>
            <SettingDescription>
              Display a progress bar showing completion status
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="showThankYou" 
                checked={settings.showThankYou} 
                onChange={handleCheckboxChange} 
              />
              Show Thank You Message
            </Checkbox>
            <SettingDescription>
              Display a thank you message after survey completion
            </SettingDescription>
          </SettingGroup>
          
          {settings.showThankYou && (
            <SettingGroup>
              <SettingLabel>Thank You Message</SettingLabel>
              <TextArea
                name="thankYouMessage"
                value={settings.thankYouMessage}
                onChange={handleInputChange}
                placeholder="Enter a thank you message..."
              />
            </SettingGroup>
          )}
          
          <SettingGroup>
            <SettingLabel>Redirect URL (Optional)</SettingLabel>
            <Input
              type="url"
              name="redirectUrl"
              value={settings.redirectUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/thank-you"
            />
            <SettingDescription>
              Redirect users to this URL after survey completion
            </SettingDescription>
          </SettingGroup>
        </SettingsCard>
        
        {/* Limits & Restrictions */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiClock size={18} />
            </CardIcon>
            <CardTitle>Limits & Restrictions</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <SettingLabel>Response Limit (0 = unlimited)</SettingLabel>
            <Input
              type="number"
              name="responseLimit"
              value={settings.responseLimit}
              onChange={handleNumberInputChange}
              min="0"
            />
            <SettingDescription>
              Maximum number of responses to collect
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <SettingLabel>Expiry Date (Optional)</SettingLabel>
            <Input
              type="date"
              name="expiryDate"
              value={settings.expiryDate}
              onChange={handleInputChange}
            />
            <SettingDescription>
              Date when the survey will automatically close
            </SettingDescription>
          </SettingGroup>
        </SettingsCard>
        
        {/* Schedule Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiCalendar size={18} />
            </CardIcon>
            <CardTitle>Schedule Settings</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <SettingLabel>Start Date (Optional)</SettingLabel>
            <Input
              type="date"
              name="startDate"
              value={settings.startDate}
              onChange={handleInputChange}
            />
            <SettingDescription>
              Date when the survey will become available
            </SettingDescription>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="autoPublish" 
                checked={settings.autoPublish} 
                onChange={handleCheckboxChange} 
              />
              Auto-Publish on Start Date
            </Checkbox>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="recurringSchedule" 
                checked={settings.recurringSchedule} 
                onChange={handleCheckboxChange} 
              />
              Recurring Schedule
            </Checkbox>
            <SettingDescription>
              Automatically create new instances of this survey on a schedule
            </SettingDescription>
          </SettingGroup>
          
          {settings.recurringSchedule && (
            <SettingGroup>
              <SettingLabel>Frequency</SettingLabel>
              <Select
                name="recurringFrequency"
                value={settings.recurringFrequency}
                onChange={handleInputChange}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </Select>
            </SettingGroup>
          )}
        </SettingsCard>
        
        {/* Access Control */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiLock size={18} />
            </CardIcon>
            <CardTitle>Access Control</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="restrictAccess" 
                checked={settings.restrictAccess} 
                onChange={handleCheckboxChange} 
              />
              Restrict Access to Specific Groups
            </Checkbox>
          </SettingGroup>
          
          {settings.restrictAccess && (
            <SettingGroup>
              <SettingLabel>Allowed Groups</SettingLabel>
              <TagsInput>
                {settings.allowedGroups.map(group => (
                  <Tag key={group}>
                    {group}
                    <button type="button" onClick={() => removeGroup(group)}>×</button>
                  </Tag>
                ))}
                <TagInput
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGroup())}
                  placeholder="Add group..."
                />
              </TagsInput>
              <SettingDescription>
                Only users in these groups can access the survey
              </SettingDescription>
            </SettingGroup>
          )}
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="passwordProtected" 
                checked={settings.passwordProtected} 
                onChange={handleCheckboxChange} 
              />
              Password Protection
            </Checkbox>
          </SettingGroup>
          
          {settings.passwordProtected && (
            <SettingGroup>
              <SettingLabel>Access Password</SettingLabel>
              <Input
                type="password"
                name="accessPassword"
                value={settings.accessPassword}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </SettingGroup>
          )}
        </SettingsCard>
        
        {/* Notifications */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiMail size={18} />
            </CardIcon>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <SettingLabel>Notification Emails</SettingLabel>
            <TagsInput>
              {settings.notificationEmails.map(email => (
                <Tag key={email}>
                  {email}
                  <button type="button" onClick={() => removeEmail(email)}>×</button>
                </Tag>
              ))}
              <TagInput
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                placeholder="Add email..."
              />
            </TagsInput>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="notifyOnCompletion" 
                checked={settings.notifyOnCompletion} 
                onChange={handleCheckboxChange} 
              />
              Notify on Each Completion
            </Checkbox>
          </SettingGroup>
          
          <SettingGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="notifyOnQuota" 
                checked={settings.notifyOnQuota} 
                onChange={handleCheckboxChange} 
              />
              Notify When Response Limit Reached
            </Checkbox>
          </SettingGroup>
        </SettingsCard>
        
        {/* Categorization */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <FiSettings size={18} />
            </CardIcon>
            <CardTitle>Categorization</CardTitle>
          </CardHeader>
          
          <SettingGroup>
            <SettingLabel>Survey Themes</SettingLabel>
            <TagsInput>
              {settings.themes.map(theme => (
                <Tag key={theme}>
                  {theme}
                  <button type="button" onClick={() => removeTheme(theme)}>×</button>
                </Tag>
              ))}
              <TagInput
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                placeholder="Add theme..."
              />
            </TagsInput>
          </SettingGroup>
          
          <SettingGroup>
            <SettingLabel>Categories</SettingLabel>
            <TagsInput>
              {settings.categories.map(category => (
                <Tag key={category}>
                  {category}
                  <button type="button" onClick={() => removeCategory(category)}>×</button>
                </Tag>
              ))}
              <TagInput
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Add category..."
              />
            </TagsInput>
          </SettingGroup>
        </SettingsCard>
      </SettingsGrid>
    </Container>
  );
};

export default SurveySettings;
