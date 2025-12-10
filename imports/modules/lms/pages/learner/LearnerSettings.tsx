import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Bell, Settings, Shield, Camera, Globe, ChevronDown, Save } from 'lucide-react';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

// Header Section
const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

// Section Card
const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const SectionIcon = styled.div<{ color?: string }>`
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.color || '#1e3a5f'};
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
`;

// Profile Section
const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ChangePhotoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PhotoHint = styled.span`
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-top: 4px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  
  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f97316;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ea580c;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OutlineButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Toggle Switch
const ToggleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ToggleInfo = styled.div``;

const ToggleTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const ToggleDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const Toggle = styled.button<{ isOn: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${props => props.isOn ? '#f97316' : '#e5e7eb'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${props => props.isOn ? '23px' : '3px'};
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

// Security Section
const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const SecurityInfo = styled.div``;

const SecurityTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const SecurityMeta = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

export const LearnerSettings: React.FC = () => {
  // Profile state
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email] = useState('john.doe@example.com');
  
  // Notification toggles
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [courseReminders, setCourseReminders] = useState(true);
  const [newCourseAnnouncements, setNewCourseAnnouncements] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  
  // Preferences
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('en');

  const handleSaveProfile = () => {
    console.log('Saving profile:', { firstName, lastName });
    // Save profile logic
  };

  const handleSavePreferences = () => {
    console.log('Saving preferences');
    // Save preferences logic
  };

  const handleChangePassword = () => {
    console.log('Change password');
    // Open password change modal
  };

  const handleEnable2FA = () => {
    console.log('Enable 2FA');
    // Open 2FA setup
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageSubtitle>Manage your account and preferences</PageSubtitle>
      </PageHeader>

      {/* Profile Section */}
      <SectionCard>
        <SectionHeader>
          <SectionIcon>
            <User />
          </SectionIcon>
          <SectionTitle>Profile</SectionTitle>
        </SectionHeader>
        <SectionSubtitle>Update your personal information</SectionSubtitle>

        <AvatarSection>
          <Avatar>
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Profile" />
          </Avatar>
          <div>
            <ChangePhotoButton>
              <Camera /> Change Photo
            </ChangePhotoButton>
            <PhotoHint>JPG, PNG. Max 2MB</PhotoHint>
          </div>
        </AvatarSection>

        <FormRow>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </FormGroup>
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Email Address</Label>
          <Input
            type="email"
            value={email}
            disabled
            placeholder="Email Address"
          />
        </FormGroup>

        <SaveButton onClick={handleSaveProfile}>
          <Save /> Save Changes
        </SaveButton>
      </SectionCard>

      {/* Notifications Section */}
      <SectionCard>
        <SectionHeader>
          <SectionIcon color="#f97316">
            <Bell />
          </SectionIcon>
          <SectionTitle>Notifications</SectionTitle>
        </SectionHeader>
        <SectionSubtitle>Manage how you receive updates</SectionSubtitle>

        <ToggleItem>
          <ToggleInfo>
            <ToggleTitle>Email Updates</ToggleTitle>
            <ToggleDescription>Receive course updates via email</ToggleDescription>
          </ToggleInfo>
          <Toggle isOn={emailUpdates} onClick={() => setEmailUpdates(!emailUpdates)} />
        </ToggleItem>

        <ToggleItem>
          <ToggleInfo>
            <ToggleTitle>Course Reminders</ToggleTitle>
            <ToggleDescription>Get reminded to continue learning</ToggleDescription>
          </ToggleInfo>
          <Toggle isOn={courseReminders} onClick={() => setCourseReminders(!courseReminders)} />
        </ToggleItem>

        <ToggleItem>
          <ToggleInfo>
            <ToggleTitle>New Course Announcements</ToggleTitle>
            <ToggleDescription>Be notified when new courses are available</ToggleDescription>
          </ToggleInfo>
          <Toggle isOn={newCourseAnnouncements} onClick={() => setNewCourseAnnouncements(!newCourseAnnouncements)} />
        </ToggleItem>

        <ToggleItem>
          <ToggleInfo>
            <ToggleTitle>Weekly Digest</ToggleTitle>
            <ToggleDescription>Get a summary of your learning progress</ToggleDescription>
          </ToggleInfo>
          <Toggle isOn={weeklyDigest} onClick={() => setWeeklyDigest(!weeklyDigest)} />
        </ToggleItem>

        <OutlineButton onClick={handleSavePreferences} style={{ marginTop: '16px' }}>
          <Save /> Save Preferences
        </OutlineButton>
      </SectionCard>

      {/* Preferences Section */}
      <SectionCard>
        <SectionHeader>
          <SectionIcon color="#8b5cf6">
            <Settings />
          </SectionIcon>
          <SectionTitle>Preferences</SectionTitle>
        </SectionHeader>
        <SectionSubtitle>Customize your learning experience</SectionSubtitle>

        <ToggleItem>
          <ToggleInfo>
            <ToggleTitle>Autoplay Videos</ToggleTitle>
            <ToggleDescription>Automatically play next video in a lesson</ToggleDescription>
          </ToggleInfo>
          <Toggle isOn={autoplayVideos} onClick={() => setAutoplayVideos(!autoplayVideos)} />
        </ToggleItem>

        <FormRow style={{ marginTop: '16px' }}>
          <FormGroup style={{ marginBottom: 0 }}>
            <Label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} /> Timezone
            </Label>
            <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </Select>
          </FormGroup>
          <FormGroup style={{ marginBottom: 0 }}>
            <Label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} /> Language
            </Label>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </Select>
          </FormGroup>
        </FormRow>
      </SectionCard>

      {/* Security Section */}
      <SectionCard>
        <SectionHeader>
          <SectionIcon color="#ef4444">
            <Shield />
          </SectionIcon>
          <SectionTitle>Security</SectionTitle>
        </SectionHeader>
        <SectionSubtitle>Manage your account security</SectionSubtitle>

        <SecurityItem>
          <SecurityInfo>
            <SecurityTitle>Password</SecurityTitle>
            <SecurityMeta>Last changed 3 months ago</SecurityMeta>
          </SecurityInfo>
          <OutlineButton onClick={handleChangePassword}>
            Change Password
          </OutlineButton>
        </SecurityItem>

        <SecurityItem>
          <SecurityInfo>
            <SecurityTitle>Two-Factor Authentication</SecurityTitle>
            <SecurityMeta>Add an extra layer of security</SecurityMeta>
          </SecurityInfo>
          <OutlineButton onClick={handleEnable2FA}>
            Enable
          </OutlineButton>
        </SecurityItem>
      </SectionCard>
    </PageContainer>
  );
};
