import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiSave, FiShare2 } from 'react-icons/fi';
import SurveyShareModal from '../../../components/SurveyShareModal';

// Styled components
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const UrlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
`;

const UrlText = styled.span`
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const SaveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props: { saving: boolean }) => (props.saving ? '#f39c12' : '#2ecc71')};
  margin-right: 8px;
`;

const SaveButton = styled.button`
  padding: 10px 15px;
  border-radius: 8px;
  border: none;
  background-color: #552a47;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: ${(props: { disabled: boolean }) => (props.disabled ? 'wait' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(85, 42, 71, 0.3);

  &:hover:not(:disabled) {
    background-color: #6a3559;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(85, 42, 71, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  background-color: #fff;
  color: #000;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: ${(props: { disabled: boolean }) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  color: #000;

  &:hover:not([disabled]) {
    background-color: #f8f9fa;
  }
`;

// Props interface
interface SurveyHeaderSectionProps {
  survey: any;
  publicUrl: string | null;
  saving: boolean;
  showSavedMessage: boolean;
  isPublished: boolean;
  sections: any[];
  surveyQuestions: any[];
  selectedTheme: string;
  selectedTags: string[];
  selectedCategories: string[];
  setCopied: (copied: boolean) => void;
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (message: string) => void;
  handleSaveSurvey: (isAutoSave: boolean) => void;
  handleGeneratePublicUrl: () => void;
}

// Component
const SurveyHeaderSection: React.FC<SurveyHeaderSectionProps> = ({
  survey,
  publicUrl,
  saving,
  showSavedMessage,
  isPublished,
  sections,
  surveyQuestions,
  selectedTheme,
  selectedTags,
  selectedCategories,
  setCopied,
  showSuccessAlert,
  showErrorAlert,
  handleSaveSurvey,
  handleGeneratePublicUrl,
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdown to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle preview click
  const handlePreview = async () => {
    if (!survey?._id) {
      showErrorAlert('Please save the survey first before previewing.');
      return;
    }

    try {
      // Get the token (either encrypted or share token)
      const getToken = async () => {
        try {
          // Try to generate an encrypted token for the survey
          const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', survey._id);
          return encryptedToken;
        } catch (error) {
          console.error('Error generating encrypted token for preview:', error);
          // Fallback to shareToken if available
          if (survey.shareToken) {
            return survey.shareToken;
          }
          throw new Error('Could not generate token for preview');
        }
      };

      const token = await getToken();
      // Prepare survey data for preview
      const previewData = {
        ...survey,
        sections,
        sectionQuestions: surveyQuestions,
        selectedTheme,
        selectedTags,
        selectedCategories,
      };

      // Save to localStorage
      localStorage.setItem(`survey-preview-${token}`, JSON.stringify(previewData));

      // Open preview in new tab
      const baseUrl = window.location.origin;
      const previewUrl = `${baseUrl}/public/${token}?status=preview`;
      window.open(previewUrl, '_blank');
    } catch (error) {
      showErrorAlert(`Error preparing preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <Header>
        <TitleSection>
          <Title>{survey?.title || 'Untitled Survey'}</Title>
          {publicUrl && (
            <UrlContainer>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <UrlText>{publicUrl}</UrlText>
              {/* Copy URL icon */}
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  showSuccessAlert('URL copied to clipboard!');
                }}
                title="Copy URL"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="8"
                    y="2"
                    width="8"
                    height="4"
                    rx="1"
                    ry="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
              {/* Preview icon */}
              <IconButton onClick={handlePreview} title="Preview Survey">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </UrlContainer>
          )}
        </TitleSection>
        <Actions>
          <SaveIndicator saving={saving}>
            {saving ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                <span>Saving...</span>
              </>
            ) : showSavedMessage ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Saved</span>
              </>
            ) : null}
          </SaveIndicator>
          <SaveButton onClick={() => handleSaveSurvey(false)} disabled={saving}>
            <FiSave style={{ fontSize: '16px' }} /> {saving ? 'Saving...' : 'Save'}
          </SaveButton>
          <SaveButton 
            onClick={() => setShowShareModal(true)} 
            disabled={!survey?._id}
          >
            <FiShare2 style={{ fontSize: '16px' }} /> Share
          </SaveButton>
          <DropdownContainer ref={dropdownRef}>
            <DropdownButton onClick={() => setShowActionDropdown(!showActionDropdown)}>
              &#8230;
            </DropdownButton>
            {showActionDropdown && (
              <DropdownMenu>
                <DropdownItem
                  onClick={() => {
                    setShowActionDropdown(false);
                    handleGeneratePublicUrl();
                  }}
                  disabled={!survey?._id}
                >
                  {isPublished ? 'Publish Again' : 'Publish'}
                </DropdownItem>
              </DropdownMenu>
            )}
          </DropdownContainer>
        </Actions>
      </Header>
      
      {/* Survey Share Modal */}
      {showShareModal && (
        <SurveyShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          surveyId={survey?._id || ''}
          surveyTitle={survey?.title || 'Untitled Survey'}
        />
      )}
    </>
  );
};

export default SurveyHeaderSection;