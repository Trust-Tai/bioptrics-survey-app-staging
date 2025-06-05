import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import styled from 'styled-components';

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

const Card = styled.div`
  background: #f8f5f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const CardTitle = styled.h3`
  color: #552a47;
  margin-bottom: 12px;
`;

const CardContent = styled.div`
  color: #6e5a67;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #552a47;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  max-width: 400px;
  
  &:focus {
    border-color: #552a47;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #6a3559;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 14px;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  color: #43a047;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(67, 160, 71, 0.1);
  border-radius: 4px;
  border-left: 3px solid #43a047;
`;

const PasswordRequirements = styled.ul`
  margin-top: 8px;
  padding-left: 20px;
  font-size: 12px;
  color: #777;
`;

const RequirementItem = styled.li`
  margin-bottom: 4px;
`;

// Define prop types for the Setting component
interface SettingProps {
  view?: string;
}

const Setting: React.FC<SettingProps> = ({ view }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = view || (location.pathname === '/admin/settings' ? 'default' : location.pathname.split('/').pop());
  
  // State for password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle password change form submission
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate inputs
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    // Use Accounts.changePassword which is the correct client-side method
    // for changing a user's password
    Accounts.changePassword(currentPassword, newPassword, (err) => {
      setIsSubmitting(false);
      
      if (err) {
        console.error('Error changing password:', err);
        // Handle different error types
        if ('reason' in err && typeof err.reason === 'string') {
          setError(err.reason);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('An error occurred while changing your password');
        }
        return;
      }
      
      // Clear form and show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    });
  };
  
  // State for timezone selection with system default detection
  const [timezone, setTimezone] = useState<string>('');
  const [prevTimezone, setPrevTimezone] = useState<string>('');
  const [isDefaultTimezone, setIsDefaultTimezone] = useState(true);
  const [timezoneLoaded, setTimezoneLoaded] = useState(false);
  
  // List of common timezones
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
    { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)' },
  ];
  
  // Effect to detect the user's system timezone on component mount and check for saved preference
  React.useEffect(() => {
    try {
      // Get the user's system timezone using Intl API
      const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Detected system timezone:', systemTimezone);
      
      // Store the original system timezone for reference
      setPrevTimezone(systemTimezone);
      
      // Check if there's a saved timezone preference in localStorage
      const savedTimezone = localStorage.getItem('userTimezone');
      
      if (savedTimezone) {
        // Check if the saved timezone is in our list
        const isValidTimezone = timezones.some(tz => tz.value === savedTimezone);
        
        if (isValidTimezone) {
          // Use the saved timezone
          setTimezone(savedTimezone);
          setIsDefaultTimezone(savedTimezone === systemTimezone);
          console.log('Using saved timezone preference:', savedTimezone);
        } else {
          // Saved timezone not in our list, use system timezone
          setTimezone(systemTimezone);
          setIsDefaultTimezone(true);
          console.log('Saved timezone not valid, using system timezone');
          // Remove invalid saved timezone
          localStorage.removeItem('userTimezone');
        }
      } else {
        // No saved preference, check if the detected timezone is in our list
        const isInList = timezones.some(tz => tz.value === systemTimezone);
        
        if (isInList) {
          // Use the system timezone
          setTimezone(systemTimezone);
          setIsDefaultTimezone(true);
        } else {
          // Default to UTC if the detected timezone is not in our list
          setTimezone('UTC');
          setIsDefaultTimezone(false);
          console.log('System timezone not in list, defaulting to UTC');
        }
      }
      
      setTimezoneLoaded(true);
    } catch (error) {
      console.error('Error detecting system timezone:', error);
      setTimezone('UTC'); // Fallback to UTC
      setPrevTimezone('UTC');
      setIsDefaultTimezone(true);
      setTimezoneLoaded(true);
    }
  }, []);
  
  // Handler for timezone change
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setTimezone(newTimezone);
    setIsDefaultTimezone(newTimezone === prevTimezone);
    
    // Here you would add the actual logic to save the timezone preference
    // For a simple implementation, we'll store it in localStorage
    localStorage.setItem('userTimezone', newTimezone);
    
    // Show success message
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
  
  // Main settings view with cards listing available options
  const renderMainSettings = () => (
    <>
      <Card onClick={() => navigate('/admin/settings/password')} style={{ cursor: 'pointer' }}>
        <CardTitle>Password Settings</CardTitle>
        <CardContent>
          <p>Change your account password and manage security settings</p>
        </CardContent>
      </Card>
      
      <Card onClick={() => navigate('/admin/settings/timezone')} style={{ cursor: 'pointer' }}>
        <CardTitle>Time Zone Settings</CardTitle>
        <CardContent>
          <p>Set your preferred time zone for accurate time display</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardTitle>Other Settings</CardTitle>
        <CardContent>
          <p>
            More settings will be available soon. Future options will include:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>User interface preferences</li>
            <li>Notification settings</li>
            <li>Data retention policies</li>
            <li>Integration configurations</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
  
  // Password change form
  const renderPasswordSettings = () => (
    <Card>
      <CardTitle>Change Password</CardTitle>
      <CardContent>
        <form onSubmit={handlePasswordChange}>
          <FormGroup>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            <PasswordRequirements>
              <RequirementItem>At least 8 characters long</RequirementItem>
              <RequirementItem>Include a mix of letters, numbers, and symbols for best security</RequirementItem>
            </PasswordRequirements>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Password changed successfully!</SuccessMessage>}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
            <Button 
              type="button" 
              onClick={() => navigate('/admin/settings')} 
              style={{ backgroundColor: '#6e5a67' }}
            >
              Back to Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
  
  // Timezone settings form
  const renderTimezoneSettings = () => (
    <Card>
      <CardTitle>Choose Time Zone</CardTitle>
      <CardContent>
        {!timezoneLoaded ? (
          <div style={{ padding: '20px 0', color: '#666' }}>
            <p>Detecting your system time zone...</p>
          </div>
        ) : (
          <>
            <FormGroup>
              <Label htmlFor="timezone">Select your preferred time zone</Label>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                {isDefaultTimezone 
                  ? "Currently using your system's default time zone" 
                  : "Currently using a custom time zone setting"}
              </div>
              <select
                id="timezone"
                value={timezone}
                onChange={handleTimezoneChange}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} {tz.value === prevTimezone ? '(System Default)' : ''}
                  </option>
                ))}
              </select>
            </FormGroup>
            
            <div style={{ 
              marginTop: '16px', 
              padding: '12px',
              backgroundColor: '#f0e8f2', 
              borderRadius: '6px',
              borderLeft: '4px solid #552a47'
            }}>
              <p style={{ margin: '0', fontSize: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#552a47' }}>
                  {timezone === prevTimezone 
                    ? `System Default (${timezones.find(tz => tz.value === timezone)?.label || timezone})` 
                    : timezones.find(tz => tz.value === timezone)?.label || timezone}
                </span>
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {new Date().toLocaleString(undefined, {
                  timeZone: timezone,
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
            
            {success && <SuccessMessage>Time zone updated successfully!</SuccessMessage>}
            
            {!isDefaultTimezone && (
              <div style={{ marginTop: '12px' }}>
                <button 
                  onClick={() => {
                    setTimezone(prevTimezone);
                    setIsDefaultTimezone(true);
                    localStorage.removeItem('userTimezone'); // Clear custom setting
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#552a47',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '8px 0',
                    fontSize: '14px'
                  }}
                >
                  Reset to system default
                </button>
              </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
              <Button 
                type="button" 
                onClick={() => navigate('/admin/settings')}
                style={{ backgroundColor: '#6e5a67' }}
              >
                Back to Settings
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
  
  // Render the appropriate content based on the current view
  const renderContent = () => {
    switch (currentView) {
      case 'password':
        return renderPasswordSettings();
      case 'timezone':
        return renderTimezoneSettings();
      default:
        return renderMainSettings();
    }
  };
  
  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>
            {currentView === 'password' ? 'Password Settings' :
             currentView === 'timezone' ? 'Time Zone Settings' : 'Settings'}
          </PageTitle>
        </PageHeader>
        
        {renderContent()}
      </Container>
    </AdminLayout>
  );
};

export default Setting;