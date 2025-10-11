import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FiX, FiLock, FiLayout, FiPenTool, FiFileText, FiCheckCircle, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Meteor } from 'meteor/meteor';

// Styled components

let Survey : any;
let Theme : any;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 12px 20px;
  background: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  border: none;
  border-bottom: 3px solid ${({ isActive }) => (isActive ? '#552a47' : 'transparent')};
  color: ${({ isActive }) => (isActive ? '#552a47' : '#4a5568')};
  font-weight: ${({ isActive }) => (isActive ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  &:hover {
    color: #552a47;
    background: ${({ isActive }) => (isActive ? '#fff' : '#f8f9fa')};
  }
`;

const Panel = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
`;

const AddThemeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #552a47;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 0 22px;
  font-size: 14px;
  height: 38px;
  cursor: pointer;
  &:hover {
    background: #441d38;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const FileUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.label`
  background-color: #552a47;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  margin: 0;
  &:hover {
    background-color: #441d38;
  }
`;

const ImagePreview = styled.div`
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #ffffff;
  display: inline-block;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
`;

const LayoutOption = styled.label<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid ${({ isSelected }) => (isSelected ? '#552a47' : '#dee2e6')};
  border-radius: 8px;
  background-color: ${({ isSelected }) => (isSelected ? 'rgba(85, 42, 71, 0.05)' : '#ffffff')};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  box-shadow: ${({ isSelected }) => (isSelected ? '0 2px 8px rgba(85, 42, 71, 0.1)' : 'none')};
`;

const ThemeCard = styled.div<{ isSelected: boolean; themeColor: string }>`
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid ${({ isSelected, themeColor }) => (isSelected ? themeColor : '#e2e8f0')};
  background: #fff;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: ${({ isSelected }) => (isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.05)')};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ThemeHeader = styled.div<{ bgColor: string }>`
  height: 120px;
  background: ${({ bgColor }) => bgColor};
  position: relative;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(85, 42, 71, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  min-height: 80px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
`;

const PreviewContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const TooltipContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #552a47;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 4px rgba(85, 42, 71, 0.2);
  transition: all 0.2s ease;
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  background-color: #552a47;
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  width: 280px;
  font-size: 13px;
  line-height: 1.4;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 400;
  letter-spacing: 0.2px;
  text-align: left;

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #552a47;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  }

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleSwitch = styled.div<{ isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  
  svg {
    color: ${({ isActive }) => (isActive ? '#552a47' : '#a0aec0')};
    font-size: 32px;
  }
`;

const ToggleLabel = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

// Props interface
interface AppearanceSectionProps {
  survey: Survey | any;
  setSurvey: (survey: Survey) => void;
  surveyThemes: Theme[];
  themeSearchQuery: string;
  setThemeSearchQuery: (query: string) => void;
  currentThemePage: number;
  setCurrentThemePage: (page: number) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  showLikertEmojis: boolean;
  setShowLikertEmojis: (show: boolean) => void;
  thankYouTitle: string;
  setThankYouTitle: (title: string) => void;
  thankYouDetails: string;
  setThankYouDetails: (details: string) => void;
  thankYouIcon: string | null;
  setThankYouIcon: (icon: string | null) => void;
  thankYouBoxes: { title: string; subtitle: string; selected: boolean }[];
  setThankYouBoxes: (boxes: { title: string; subtitle: string; selected: boolean }[]) => void;
  showThankYouPreview: boolean;
  setShowThankYouPreview: (show: boolean) => void;
  showThemeModal: boolean;
  setShowThemeModal: (show: boolean) => void;
  surveyId: string | undefined;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (has: boolean) => void;
  triggerAutoSave: () => void;
  handlePreview: (theme: Theme) => void;
  // Consent Screen props
  consentTitle: string;
  setConsentTitle: (title: string) => void;
  consentText: string;
  setConsentText: (text: string) => void;
  privacyNoticeUrl: string;
  setPrivacyNoticeUrl: (url: string) => void;
  privacyLinkText: string;
  setPrivacyLinkText: (text: string) => void;
  privacyInfoText: string;
  setPrivacyInfoText: (text: string) => void;
  continueButtonText: string;
  setContinueButtonText: (text: string) => void;
  checkboxText: string;
  setCheckboxText: (text: string) => void;
  showAnonymityNotice: boolean;
  setShowAnonymityNotice: (show: boolean) => void;
  anonymityNoticeText: string;
  setAnonymityNoticeText: (text: string) => void;
  showConsentScreen: boolean;
  setShowConsentScreen: (show: boolean) => void;
}

// Component
const AppearanceTab: React.FC<AppearanceSectionProps> = ({
  survey,
  setSurvey,
  surveyThemes,
  themeSearchQuery,
  setThemeSearchQuery,
  currentThemePage,
  setCurrentThemePage,
  selectedTheme,
  setSelectedTheme,
  showLikertEmojis,
  setShowLikertEmojis,  
  thankYouTitle,
  setThankYouTitle,
  thankYouDetails,
  setThankYouDetails,
  thankYouIcon,
  setThankYouIcon,
  thankYouBoxes,
  setThankYouBoxes,
  showThankYouPreview,
  setShowThankYouPreview,
  showThemeModal,
  setShowThemeModal,
  surveyId,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  triggerAutoSave,
  handlePreview,
  // Consent Screen props
  consentTitle,
  setConsentTitle,
  consentText,
  setConsentText,
  privacyNoticeUrl,
  setPrivacyNoticeUrl,
  privacyLinkText,
  setPrivacyLinkText,
  privacyInfoText,
  setPrivacyInfoText,
  continueButtonText,
  setContinueButtonText,
  checkboxText,
  setCheckboxText,
  showAnonymityNotice,
  setShowAnonymityNotice,
  anonymityNoticeText,
  setAnonymityNoticeText,
  showConsentScreen,
  setShowConsentScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'consent' | 'thankYou'>('branding');
  const [showRemoveLogoConfirm, setShowRemoveLogoConfirm] = useState(false);
  const [showRemoveFeaturedImageConfirm, setShowRemoveFeaturedImageConfirm] = useState(false);

  // Memoized filtered and paginated themes
  const getFilteredAndPaginatedThemes = useMemo(() => {
    const filteredThemes = surveyThemes.filter(theme =>
      !themeSearchQuery || theme.name.toLowerCase().includes(themeSearchQuery.toLowerCase())
    );
    const perPage = 6;
    const totalPages = Math.ceil(filteredThemes.length / perPage);
    const start = (currentThemePage - 1) * perPage;
    const paginatedThemes = filteredThemes.slice(start, start + perPage);
    return { filteredThemes, paginatedThemes, totalPages };
  }, [surveyThemes, themeSearchQuery, currentThemePage]);

  // Handle theme page change
  const handleThemePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= getFilteredAndPaginatedThemes.totalPages) {
        setCurrentThemePage(page);
      }
    },
    [getFilteredAndPaginatedThemes.totalPages, setCurrentThemePage]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'featuredImage' | 'thankYouIcon') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (field === 'thankYouIcon') {
            setThankYouIcon(result);
            setSurvey(prev => ({
              ...prev,
              thankYou: { ...prev?.thankYou, icon: result },
            } as Survey));
          } else {
            setSurvey(prev => ({
              ...prev,
              [field]: result,
            } as Survey));
          }
          setHasUnsavedChanges(true);
          triggerAutoSave();
        };
        reader.readAsDataURL(file);
      }
    },
    [setSurvey, setThankYouIcon, setHasUnsavedChanges, triggerAutoSave]
  );

  // Handle remove image
  const handleRemoveImage = useCallback(
    (field: 'logo' | 'featuredImage' | 'thankYouIcon') => {
      if (field === 'thankYouIcon') {
        setThankYouIcon(null);
        setSurvey(prev => ({
          ...prev,
          thankYou: { ...prev?.thankYou, icon: null },
        } as Survey));
      } else {
        setSurvey(prev => ({
          ...prev,
          [field]: undefined,
        } as Survey));
      }
      setHasUnsavedChanges(true);
      triggerAutoSave();
      if (field === 'logo') setShowRemoveLogoConfirm(false);
      else if (field === 'featuredImage') setShowRemoveFeaturedImageConfirm(false);
    },
    [setSurvey, setThankYouIcon, setHasUnsavedChanges, triggerAutoSave]
  );

  // Handle layout change
  const handleLayoutChange = useCallback(
    (layout: 'multiStep' | 'allOnOnePage') => {
      setSurvey(prev => ({ ...prev, layout } as Survey));
      if (surveyId) {
        Meteor.call('surveys.update', surveyId, { layout }, (error: Meteor.Error) => {
          if (error) {
            console.error('Error saving survey layout:', error);
          } else {
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }
        });
      }
    },
    [surveyId, setSurvey, setHasUnsavedChanges, triggerAutoSave]
  );

  // Handle theme selection
  const handleThemeSelect = useCallback(
    (themeId: string) => {
      setSelectedTheme(themeId);
      setSurvey(prev => ({ ...prev, selectedTheme: themeId } as Survey));
      setHasUnsavedChanges(true);
      triggerAutoSave();
    },
    [setSelectedTheme, setSurvey, setHasUnsavedChanges, triggerAutoSave]
  );
  
  // Handle consent screen toggle
  const handleToggleConsentScreen = useCallback(() => {
    const newValue = !showConsentScreen;
    setShowConsentScreen(newValue);
    setSurvey(prev => ({
      ...prev,
      consentScreen: { 
        ...prev?.consentScreen, 
        showConsentScreen: newValue 
      },
    }) as Survey);
    setHasUnsavedChanges(true);
    triggerAutoSave();
  }, [showConsentScreen, setSurvey, setHasUnsavedChanges, triggerAutoSave]);

  return (
    <Panel>
      <Header>
        <Title>Appearance</Title>
        {activeTab === 'theme' && (
          <AddThemeButton onClick={() => setShowThemeModal(true)}>
            <span style={{ fontSize: 18, marginRight: 2 }}>+</span> Add Theme
          </AddThemeButton>
        )}
      </Header>
      
      <TabNavigation>
        <TabButton 
          isActive={activeTab === 'branding'} 
          onClick={() => setActiveTab('branding')}
        >
          <FiLayout size={16} />
          Branding & Layout
        </TabButton>
        <TabButton 
          isActive={activeTab === 'theme'} 
          onClick={() => setActiveTab('theme')}
        >
          <FiPenTool size={16} />
          Theme Selection
        </TabButton>
        <TabButton 
          isActive={activeTab === 'consent'} 
          onClick={() => setActiveTab('consent')}
        >
          <FiFileText size={16} />
          Consent Screen
        </TabButton>
        <TabButton 
          isActive={activeTab === 'thankYou'} 
          onClick={() => setActiveTab('thankYou')}
        >
          <FiCheckCircle size={16} />
          Thank You Screen
        </TabButton>
      </TabNavigation>

      {/* Branding & Layout Tab */}
      {activeTab === 'branding' && (
        <>
          {/* Survey Branding */}
          <Section>
            <SectionTitle>Survey Branding</SectionTitle>
            <Grid>
              {/* Logo Upload */}
              <div>
                <label htmlFor="surveyLogo" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
                  Logo
                </label>
                <FileUploadContainer>
                  <FileInput
                    type="file"
                    id="surveyLogo"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    accept="image/*"
                  />
                  <FileUploadButton htmlFor="surveyLogo">Choose Logo</FileUploadButton>
                  <span style={{ fontSize: 13, color: '#6c757d' }}>{survey?.logo ? 'Logo selected' : 'No file selected'}</span>
                </FileUploadContainer>
                {survey?.logo && (
                  <ImagePreview>
                    <img src={survey.logo} alt="Logo Preview" style={{ maxWidth: 180, maxHeight: 80 }} />
                    <RemoveButton onClick={() => setShowRemoveLogoConfirm(true)} title="Remove logo">
                      <FiX />
                    </RemoveButton>
                  </ImagePreview>
                )}
              </div>

              {/* Featured Image Upload */}
              <div>
                <label htmlFor="surveyFeaturedImage" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
                  Featured Image
                </label>
                <FileUploadContainer>
                  <FileInput
                    type="file"
                    id="surveyFeaturedImage"
                    onChange={(e) => handleFileUpload(e, 'featuredImage')}
                    accept="image/*"
                  />
                  <FileUploadButton htmlFor="surveyFeaturedImage">Choose Image</FileUploadButton>
                  <span style={{ fontSize: 13, color: '#6c757d' }}>{survey?.featuredImage ? 'Image selected' : 'No file selected'}</span>
                </FileUploadContainer>
                {survey?.featuredImage && (
                  <ImagePreview>
                    <img src={survey.featuredImage} alt="Featured Image Preview" style={{ maxWidth: 180, maxHeight: 120 }} />
                    <RemoveButton onClick={() => setShowRemoveFeaturedImageConfirm(true)} title="Remove featured image">
                      <FiX />
                    </RemoveButton>
                  </ImagePreview>
                )}
              </div>
            </Grid>
          </Section>

          {/* Survey Layout */}
          <Section>
            <SectionTitle>Survey Layout</SectionTitle>
            <p style={{ fontSize: 14, color: '#495057', marginBottom: 12 }}>
              Select how questions will be displayed to respondents.
            </p>
            <Grid style={{ gridTemplateColumns: '1fr 1fr' }}>
              <LayoutOption isSelected={survey?.layout === 'multiStep' || !survey?.layout}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Multi Step</div>
                  <input
                    type="radio"
                    name="surveyLayout"
                    value="multiStep"
                    checked={survey?.layout === 'multiStep' || !survey?.layout}
                    onChange={() => handleLayoutChange('multiStep')}
                    style={{ accentColor: '#552a47', cursor: 'pointer', width: 18, height: 18 }}
                  />
                </div>
                <div style={{ width: '100%', height: 80, backgroundColor: '#f8f9fa', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12, border: '1px solid #e9ecef' }}>
                  <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="100" height="10" rx="2" fill="#552a47" fillOpacity="0.7" />
                    <rect x="10" y="25" width="100" height="5" rx="1" fill="#dee2e6" />
                    <rect x="10" y="35" width="60" height="5" rx="1" fill="#dee2e6" />
                    <rect x="10" y="45" width="30" height="5" rx="1" fill="#dee2e6" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, color: '#6c757d', textAlign: 'center' }}>
                  Questions are shown step-by-step, one section at a time.
                </div>
              </LayoutOption>
              <LayoutOption isSelected={survey?.layout === 'allOnOnePage'}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>All on One Page</div>
                  <input
                    type="radio"
                    name="surveyLayout"
                    value="allOnOnePage"
                    checked={survey?.layout === 'allOnOnePage'}
                    onChange={() => handleLayoutChange('allOnOnePage')}
                    style={{ accentColor: '#552a47', cursor: 'pointer', width: 18, height: 18 }}
                  />
                </div>
                <div style={{ width: '100%', height: 80, backgroundColor: '#f8f9fa', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12, border: '1px solid #e9ecef' }}>
                  <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="5" width="100" height="8" rx="2" fill="#552a47" fillOpacity="0.7" />
                    <rect x="10" y="18" width="100" height="4" rx="1" fill="#dee2e6" />
                    <rect x="10" y="27" width="100" height="4" rx="1" fill="#dee2e6" />
                    <rect x="10" y="36" width="60" height="4" rx="1" fill="#dee2e6" />
                    <rect x="10" y="45" width="80" height="4" rx="1" fill="#dee2e6" />
                    <rect x="10" y="54" width="40" height="4" rx="1" fill="#dee2e6" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, color: '#6c757d', textAlign: 'center' }}>
                  Displays all questions on a single page, like a traditional form.
                </div>
              </LayoutOption>
            </Grid>
          </Section>
        </>
      )}
      {/* Theme Selection Tab */}
      {activeTab === 'theme' && (
        <Section>
          <SectionTitle>Survey Theme</SectionTitle>
          <p style={{ fontSize: 15, margin: 0, marginBottom: 16 }}>
            Select a theme for your survey. The theme will affect the appearance and feel of your survey.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '8px 12px', backgroundColor: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>Currently Selected:</span>
            <span
              style={{
                backgroundColor: selectedTheme ? '#edf2f7' : '#f0fff4',
                color: selectedTheme ? '#4a5568' : '#276749',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 14,
                border: selectedTheme ? 'none' : '1px dashed #68d391',
              }}
            >
              {selectedTheme ? surveyThemes.find(theme => theme._id === selectedTheme)?.name || 'Unknown Theme' : 'Default Theme (System)'}
            </span>
          </div>
          {selectedTheme ? (
            <button
              onClick={() => handleThemeSelect('')}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e53e3e',
                color: '#e53e3e',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Unselect Theme
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#718096', fontStyle: 'italic' }}>
              Using system default colors and fonts
            </span>
          )}
        </div>

        {/* Theme Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#f9f9f9' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Input
              type="text"
              placeholder="Search themes..."
              value={themeSearchQuery}
              onChange={(e) => {
                setThemeSearchQuery(e.target.value);
                setCurrentThemePage(1);
              }}
            />
            {themeSearchQuery && (
              <button
                onClick={() => {
                  setThemeSearchQuery('');
                  setCurrentThemePage(1);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Themes Count */}
        <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
          {getFilteredAndPaginatedThemes.filteredThemes.length > 0
            ? `Showing ${getFilteredAndPaginatedThemes.paginatedThemes.length} of ${getFilteredAndPaginatedThemes.filteredThemes.length} themes`
            : 'No themes match your search'}
        </div>

        {/* Theme Grid */}
        <Grid>
          {getFilteredAndPaginatedThemes.paginatedThemes.map(theme => {
            const isSelected = selectedTheme === theme._id;
            const bgColor = theme.headerStyle === 'gradient' && theme.secondaryColor
              ? `linear-gradient(135deg, ${theme.primaryColor || theme.color}, ${theme.secondaryColor})`
              : theme.primaryColor || theme.color || '#552a47';

            return (
              <ThemeCard
                key={theme._id}
                isSelected={isSelected}
                themeColor={theme.primaryColor || theme.color || '#552a47'}
                onClick={() => handleThemeSelect(theme._id)}
              >
                <ThemeHeader bgColor={bgColor}>
                  {isSelected && <SelectedBadge>Selected</SelectedBadge>}
                </ThemeHeader>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: 18, color: '#1a202c', marginBottom: 4 }}>
                      {theme.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#718096', lineHeight: 1.5 }}>
                      {theme.description || 'No description'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {(theme.primaryColor || theme.color) && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: theme.primaryColor || theme.color,
                          border: '1px solid #e5e7eb',
                        }}
                        title="Primary Color"
                      />
                    )}
                    {theme.secondaryColor && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: theme.secondaryColor,
                          border: '1px solid #e5e7eb',
                        }}
                        title="Secondary Color"
                      />
                    )}
                    {theme.accentColor && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: theme.accentColor,
                          border: '1px solid #e5e7eb',
                        }}
                        title="Accent Color"
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {theme.templateType && (
                      <span style={{ padding: '2px 8px', borderRadius: 12, background: '#f7fafc', border: '1px solid #e2e8f0', fontSize: 12, color: '#4a5568' }}>
                        {theme.templateType}
                      </span>
                    )}
                    {theme.buttonStyle && (
                      <span style={{ padding: '2px 8px', borderRadius: 12, background: '#f7fafc', border: '1px solid #e2e8f0', fontSize: 12, color: '#4a5568' }}>
                        {theme.buttonStyle}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(theme);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 14,
                      color: '#4a5568',
                      background: 'transparent',
                      border: '1px solid #cbd5e0',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.03711 12.3224C2.03711 12.3224 5.03711 5.32239 12.0371 5.32239C19.0371 5.32239 22.0371 12.3224 22.0371 12.3224C22.0371 12.3224 19.0371 19.3224 12.0371 19.3224C5.03711 19.3224 2.03711 12.3224 2.03711 12.3224Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.0371 15.3224C13.6939 15.3224 15.0371 13.9793 15.0371 12.3224C15.0371 10.6656 13.6939 9.32239 12.0371 9.32239C10.3802 9.32239 9.03711 10.6656 9.03711 12.3224C9.03711 13.9793 10.3802 15.3224 12.0371 15.3224Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(isSelected ? '' : theme._id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 14,
                      color: '#fff',
                      background: (theme.color === 'rgb(248, 249, 250)' || theme.color === '#f8f9fa') ? '#552a47' : (theme.color || '#552a47'),
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? 'Unselect' : 'Use Theme'}
                  </button>
                </div>
              </ThemeCard>
            );
          })}
        </Grid>

        {/* Pagination */}
        {getFilteredAndPaginatedThemes.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 8 }}>
            <button
              onClick={() => handleThemePageChange(currentThemePage - 1)}
              disabled={currentThemePage === 1}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #e5d6c7',
                backgroundColor: currentThemePage === 1 ? '#f5f5f4' : '#fff',
                color: currentThemePage === 1 ? '#a8a29e' : '#28211e',
                cursor: currentThemePage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 14,
              }}
            >
              Previous
            </button>
            {Array.from({ length: getFilteredAndPaginatedThemes.totalPages }, (_, i) => i + 1)
              .filter(pageNum => {
                return (
                  pageNum === 1 ||
                  pageNum === getFilteredAndPaginatedThemes.totalPages ||
                  (pageNum >= currentThemePage - 1 && pageNum <= currentThemePage + 1)
                );
              })
              .map((pageNum, index, array) => {
                const showEllipsisBefore = index > 0 && pageNum > array[index - 1] + 1;
                const showEllipsisAfter = index < array.length - 1 && pageNum < array[index + 1] - 1;

                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsisBefore && <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>}
                    <button
                      onClick={() => handleThemePageChange(pageNum)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #e5d6c7',
                        backgroundColor: currentThemePage === pageNum ? '#552a47' : '#fff',
                        color: currentThemePage === pageNum ? '#fff' : '#28211e',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: currentThemePage === pageNum ? 600 : 400,
                      }}
                    >
                      {pageNum}
                    </button>
                    {showEllipsisAfter && <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>}
                  </React.Fragment>
                );
              })}
            <button
              onClick={() => handleThemePageChange(currentThemePage + 1)}
              disabled={currentThemePage === getFilteredAndPaginatedThemes.totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #e5d6c7',
                backgroundColor: currentThemePage === getFilteredAndPaginatedThemes.totalPages ? '#f5f5f4' : '#fff',
                color: currentThemePage === getFilteredAndPaginatedThemes.totalPages ? '#a8a29e' : '#28211e',
                cursor: currentThemePage === getFilteredAndPaginatedThemes.totalPages ? 'not-allowed' : 'pointer',
                fontSize: 14,
              }}
            >
              Next
            </button>
          </div>
        )}
      </Section>
      )}

      {/* Consent Screen Tab */}
      {activeTab === 'consent' && (
        <Section>
          <SectionTitle>Consent Screen</SectionTitle>
          
          {/* Consent Screen Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Enable Consent Screen</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#666' }}>
                When enabled, participants must agree to consent terms before taking the survey
              </p>
            </div>
            <ToggleContainer>
              <ToggleSwitch isActive={showConsentScreen} onClick={handleToggleConsentScreen}>
                {showConsentScreen ? <FiToggleRight size={36} /> : <FiToggleLeft size={36} />}
              </ToggleSwitch>
              <ToggleLabel>{showConsentScreen ? 'Enabled' : 'Disabled'}</ToggleLabel>
            </ToggleContainer>
          </div>
          
          <div style={{ opacity: showConsentScreen ? 1 : 0.5, pointerEvents: showConsentScreen ? 'auto' : 'none' }}>
            <p style={{ marginBottom: 16, color: '#4a5568', fontSize: 14 }}>
              Customize the consent information that appears before users start your survey.
            </p>

        {/* Consent Title */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="consentTitle" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Consent Screen Title
          </label>
          <Input
            type="text"
            id="consentTitle"
            value={consentTitle}
            onChange={(e) => {
              setConsentTitle(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, title: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="Informed Consent"
          />
        </div>

        {/* Anonymity Notice Toggle & Text */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 16, color: '#2d3748' }}>
              Anonymity Notice
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showAnonymityNotice}
                onChange={(e) => {
                  setShowAnonymityNotice(e.target.checked);
                  setSurvey(prev => ({
                    ...prev,
                    consentScreen: { 
                      ...prev?.consentScreen, 
                      showAnonymityNotice: e.target.checked 
                    },
                  }) as Survey);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                style={{ marginRight: 8, accentColor: '#552a47', width: 16, height: 16 }}
              />
              <span>Show anonymity notice</span>
            </label>
          </div>
          
          {showAnonymityNotice && (
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="anonymityNoticeText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
                Anonymity Notice Text
              </label>
              <Input
                type="text"
                id="anonymityNoticeText"
                value={anonymityNoticeText}
                onChange={(e) => {
                  setAnonymityNoticeText(e.target.value);
                  setSurvey(prev => ({
                    ...prev,
                    consentScreen: { 
                      ...prev?.consentScreen, 
                      anonymityNoticeText: e.target.value 
                    },
                  }) as Survey);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                placeholder="This survey is anonymous. Your responses cannot be linked back to you personally."
              />
              <div style={{ marginTop: 12, padding: 12, backgroundColor: 'rgb(168, 221, 71)', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                <FiLock style={{ marginRight: 8 }} />
                <span style={{ fontSize: 14 }}>{anonymityNoticeText || "This survey is anonymous. Your responses cannot be linked back to you personally."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Consent Text Editor */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="consentText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Consent Text
          </label>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <ReactQuill
              value={consentText}
              onChange={(value) => {
                setConsentText(value);
                setSurvey(prev => ({
                  ...prev,
                  consentScreen: { ...prev?.consentScreen, consentText: value },
                }) as Survey);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
              style={{ height: 300, backgroundColor: '#fff' }}
            />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#718096' }}>
            Format your consent text with headings, bold, italic, and lists. Include sections for purpose, data collection, data use, confidentiality, and contact information.
          </div>
        </div>

        {/* Privacy Notice URL */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="privacyNoticeUrl" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Privacy Notice URL
          </label>
          <Input
            type="text"
            id="privacyNoticeUrl"
            value={privacyNoticeUrl}
            onChange={(e) => {
              setPrivacyNoticeUrl(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, privacyNoticeUrl: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="https://example.com/privacy-policy"
          />
        </div>

        {/* Privacy Link Text */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="privacyLinkText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Privacy Link Text
          </label>
          <Input
            type="text"
            id="privacyLinkText"
            value={privacyLinkText}
            onChange={(e) => {
              setPrivacyLinkText(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, privacyLinkText: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="Privacy Notice"
          />
        </div>

        {/* Privacy Info Text */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="privacyInfoText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Privacy Info Text
          </label>
          <Input
            type="text"
            id="privacyInfoText"
            value={privacyInfoText}
            onChange={(e) => {
              setPrivacyInfoText(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, privacyInfoText: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="For more information, please see our"
          />
        </div>

        {/* Continue Button Text */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="continueButtonText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Continue Button Text
          </label>
          <Input
            type="text"
            id="continueButtonText"
            value={continueButtonText}
            onChange={(e) => {
              setContinueButtonText(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, continueButtonText: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="Continue to Survey"
          />
        </div>

        {/* Checkbox Text */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="checkboxText" style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: '#495057' }}>
            Consent Checkbox Text
          </label>
          <Input
            type="text"
            id="checkboxText"
            value={checkboxText}
            onChange={(e) => {
              setCheckboxText(e.target.value);
              setSurvey(prev => ({
                ...prev,
                consentScreen: { ...prev?.consentScreen, checkboxText: e.target.value },
              }) as Survey);
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="I have read and understand the above information and consent to participate in this survey"
          />
        </div>
          </div>
      </Section>
      )}

      {/* Thank You Screen Tab */}
      {activeTab === 'thankYou' && (
        <Section>
          <SectionTitle>Thank You Screen</SectionTitle>
          <p style={{ marginBottom: 16, color: '#4a5568', fontSize: 14 }}>
            Customize the message that appears when users complete your survey.
          </p>

        {/* Thank You Icon */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="thankYouIcon" style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#4a5568' }}>
            Thank You Icon
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div
              style={{
                width: 80,
                height: 80,
                border: '1px dashed #cbd5e0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f7fafc',
                overflow: 'hidden',
              }}
            >
              {thankYouIcon ? (
                <img src={thankYouIcon} alt="Thank You Icon" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <FileInput
                type="file"
                id="thankYouIconUpload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'thankYouIcon')}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileUploadButton htmlFor="thankYouIconUpload">Upload Icon</FileUploadButton>
                {thankYouIcon && (
                  <div
                    onClick={() => handleRemoveImage('thankYouIcon')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#fee2e2',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      marginBottom: 8,
                    }}
                    title="Remove Icon"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Recommended size: 128x128px</p>
            </div>
          </div>
        </div>

        {/* Thank You Title */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="thankYouTitle" style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#4a5568' }}>
            Thank You Title
          </label>
          <Input
            type="text"
            id="thankYouTitle"
            value={thankYouTitle}
            onChange={(e) => {
              setThankYouTitle(e.target.value);
              setSurvey(prev => ({
                ...prev,
                thankYou: { ...prev?.thankYou, title: e.target.value },
              } as Survey));
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        {/* Thank You Details */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="thankYouDetails" style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#4a5568' }}>
            Thank You Details
          </label>
          <TextArea
            id="thankYouDetails"
            value={thankYouDetails}
            onChange={(e) => {
              setThankYouDetails(e.target.value);
              setSurvey(prev => ({
                ...prev,
                thankYou: { ...prev?.thankYou, details: e.target.value },
              } as Survey));
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        {/* Thank You Boxes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#2d3748' }}>Survey Summary Stats (Optional)</label>
            <TooltipContainer>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>?</span>
              <TooltipContent>
                These are optional summary stats that participants will see on the final thank you screen after submitting a survey.
              </TooltipContent>
            </TooltipContainer>
          </div>
          <p style={{ marginBottom: 16, color: '#4a5568', fontSize: 14 }}>
            Configure the statistics boxes that appear on the thank you screen.
          </p>
          <Grid style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {thankYouBoxes.map((box, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                }}
              >
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Box {index + 1}</h4>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14, color: '#4a5568' }}>
                    <input
                      type="checkbox"
                      checked={box.selected}
                      onChange={(e) => {
                        const newBoxes = [...thankYouBoxes];
                        newBoxes[index].selected = e.target.checked;
                        setThankYouBoxes(newBoxes);
                        setSurvey(prev => ({
                          ...prev,
                          thankYou: { ...prev?.thankYou, boxes: newBoxes },
                        } as Survey));
                        setHasUnsavedChanges(true);
                      }}
                      style={{ marginRight: 6, accentColor: '#552a47', width: 16, height: 16 }}
                    />
                    <span style={{ color: '#552a47', fontWeight: 500 }}>Display to participant?</span>
                  </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: '#4a5568' }}>Title</label>
                  <Input
                    type="text"
                    value={box.title}
                    onChange={(e) => {
                      const newBoxes = [...thankYouBoxes];
                      newBoxes[index].title = e.target.value;
                      setThankYouBoxes(newBoxes);
                      setSurvey(prev => ({
                        ...prev,
                        thankYou: { ...prev?.thankYou, boxes: newBoxes },
                      } as Survey));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: '#4a5568' }}>Subtitle</label>
                  <Input
                    type="text"
                    value={box.subtitle}
                    onChange={(e) => {
                      const newBoxes = [...thankYouBoxes];
                      newBoxes[index].subtitle = e.target.value;
                      setThankYouBoxes(newBoxes);
                      setSurvey(prev => ({
                        ...prev,
                        thankYou: { ...prev?.thankYou, boxes: newBoxes },
                      } as Survey));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </Grid>
        </div>    
          {/* Preview Button */}
          <div style={{ marginTop: 30, marginBottom: 20 }}>
            <button
              onClick={() => setShowThankYouPreview(!showThankYouPreview)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#552a47',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.03711 12.3224C2.03711 12.3224 5.03711 5.32239 12.0371 5.32239C19.0371 5.32239 22.0371 12.3224 22.0371 12.3224C22.0371 12.3224 19.0371 19.3224 12.0371 19.3224C5.03711 19.3224 2.03711 12.3224 2.03711 12.3224Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.0371 15.3224C13.6939 15.3224 15.0371 13.9793 15.0371 12.3224C15.0371 10.6656 13.6939 9.32239 12.0371 9.32239C10.3802 9.32239 9.03711 10.6656 9.03711 12.3224C9.03711 13.9793 10.3802 15.3224 12.0371 15.3224Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showThankYouPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Preview Section */}
        {showThankYouPreview && (
          <PreviewContainer>
            <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#2d3748' }}>Preview</h4>
            <div style={{ marginBottom: 30 }}>
              {thankYouIcon ? (
                <img src={thankYouIcon} alt="Thank You Icon" style={{ width: 80, height: 80, marginBottom: 20 }} />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#f8f0f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#552a47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div style={{ padding: '0 20px', maxWidth: 700, margin: '0 auto', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16, color: '#552a47' }}>{thankYouTitle || 'Thank You!'}</h3>
                <div style={{ marginBottom: 30, color: '#4a5568', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
                  {thankYouDetails || 'Your responses have been successfully submitted. We appreciate your time and feedback.'}
                </div>
              </div>
            </div>
            <Grid style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 700, margin: '0 auto' }}>
              {thankYouBoxes.map((box, index) => (
                <div
                  key={index}
                  style={{
                    padding: 20,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 600, color: '#552a47' }}>
                      {index === 0 ? '1' : index === 1 ? '3' : index === 2 ? '0%' : '3 min 42 sec'}
                    </h4>
                    <div style={{ fontSize: 14, color: '#4a5568', fontWeight: 500 }}>{box.title}</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{box.subtitle}</div>
                  </div>
                </div>
              ))}
            </Grid>
          </PreviewContainer>
        )}
        <div style={{ marginTop: 16, fontSize: 13, color: '#718096' }}>
          <p>This preview shows how your thank you screen will appear to users after they complete the survey.</p>
        </div>
      </Section>
      )}

      {/* Modals for Remove Confirmation (implement as needed) */}
      {showRemoveLogoConfirm && (
        <div>
          {/* Modal JSX with confirm/cancel for removing logo */}
          <button onClick={() => handleRemoveImage('logo')}>Confirm</button>
          <button onClick={() => setShowRemoveLogoConfirm(false)}>Cancel</button>
        </div>
      )}
      {showRemoveFeaturedImageConfirm && (
        <div>
          {/* Modal JSX with confirm/cancel for removing featured image */}
          <button onClick={() => handleRemoveImage('featuredImage')}>Confirm</button>
          <button onClick={() => setShowRemoveFeaturedImageConfirm(false)}>Cancel</button>
        </div>
      )}
    </Panel>
  );
};

export default AppearanceTab;