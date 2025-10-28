import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiSave, FiShare2, FiCheck } from 'react-icons/fi';
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

interface SaveIndicatorProps {
  saving: boolean;
}

const SaveIndicator = styled.div<SaveIndicatorProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => (props.saving ? '#f39c12' : '#2ecc71')};
  margin-right: 8px;
`;

interface ButtonProps {
  disabled?: boolean;
}

const SaveButton = styled.button<ButtonProps>`
  padding: 10px 15px;
  border-radius: 8px;
  border: none;
  background-color: var(--color-primary, #552a47);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: ${props => (props.disabled ? 'wait' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.7 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(85, 42, 71, 0.3);

  &:hover:not(:disabled) {
    background-color: var(--color-secondary, #6a3559);
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



// Props interface
interface SurveyHeaderSectionProps {
  survey: any;
  publicUrl: string | null;
  saving: boolean;
  showSavedMessage: boolean;
  isPublished: boolean;
  hasUnsavedChanges: boolean;
  sections: any[];
  surveyQuestions: any[];
  selectedTheme: string;
  selectedTags: string[];
  selectedCategories: string[];
  setCopied: (copied: boolean) => void;
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (message: string) => void;
  handleSaveSurvey: (isAutoSave: boolean) => Promise<boolean>;
  handleGeneratePublicUrl: () => void;
}

// Component
const SurveyHeaderSection: React.FC<SurveyHeaderSectionProps> = ({
  survey,
  publicUrl,
  saving,
  showSavedMessage,
  isPublished,
  hasUnsavedChanges,
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
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Combined Save & Publish handler
  const handleSaveAndPublish = async () => {
    try {
      console.log('Starting save and publish process...');
      
      // Step 1: Save the survey with validation
      const saveResult = await handleSaveSurvey(false);
      
      if (saveResult.success && saveResult.surveyId) {
        console.log('Save successful, proceeding with publish...', saveResult.surveyId);
        
        // Step 2: Generate public URL using the fresh survey ID
        await generatePublicUrlWithId(saveResult.surveyId, saveResult.surveyData);
        
        // Step 3: Show success message
        showSuccessAlert('Survey saved successfully!');
      } else {
        // Save failed due to validation - error already shown by parent component
        console.log('Save failed - publish cancelled due to validation errors');
      }
    } catch (error) {
      console.error('Error during save and publish:', error);
      showErrorAlert('Failed to save and publish survey. Please try again.');
    }
  };

  // Generate public URL with fresh survey ID and data
  const generatePublicUrlWithId = async (surveyId: string, surveyData: any) => {
    try {
      console.log('Generating public URL for survey:', surveyId);
      
      // Call the server method to mark the survey as public
      const updatedSurvey = await Meteor.callAsync('surveys.makePublic', surveyId);
      
      if (!updatedSurvey) {
        showErrorAlert('Failed to make the survey public.');
        return;
      }
      
      // Update the survey status to active
      await Meteor.callAsync('surveys.updateStatus', surveyId, 'active');
      
      try {
        // Generate an encrypted token for the survey ID
        const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', surveyId);
        
        // Generate the public URL using the encrypted token
        const baseUrl = window.location.origin;
        const publicSurveyUrl = `${baseUrl}/public/${encryptedToken}`;
        
        // Update state immediately with the generated URL
        // Note: We're calling the parent component's state setter
        if (typeof window !== 'undefined') {
          // Trigger a custom event to update the parent component's publicUrl state
          window.dispatchEvent(new CustomEvent('surveyPublished', { 
            detail: { 
              publicUrl: publicSurveyUrl,
              surveyId: surveyId 
            } 
          }));
        }
        
        console.log('Public URL generated successfully:', publicSurveyUrl);
      } catch (tokenError: any) {
        console.error('Error generating encrypted token:', tokenError);
        // Fallback to shareToken if available
        if (updatedSurvey.shareToken) {
          const baseUrl = window.location.origin;
          const publicSurveyUrl = `${baseUrl}/public/${updatedSurvey.shareToken}`;
          
          // Update state with fallback URL
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('surveyPublished', { 
              detail: { 
                publicUrl: publicSurveyUrl,
                surveyId: surveyId 
              } 
            }));
          }
          
          console.log('Public URL generated with fallback token:', publicSurveyUrl);
        } else {
          showErrorAlert('Failed to generate secure token for the survey.');
        }
      }
    } catch (error: any) {
      console.error('Error in generatePublicUrlWithId:', error);
      showErrorAlert(`Error generating public URL: ${error.message}`);
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
          
          {/* Save Button - handles both save and publish */}
          <SaveButton 
            onClick={handleSaveAndPublish} 
            disabled={saving || !hasUnsavedChanges}
            style={{cursor: !hasUnsavedChanges ? 'not-allowed' : 'pointer' }}
            title={hasUnsavedChanges ? "Save and publish survey" : "No changes to save"}
          >
            <FiSave style={{ fontSize: '16px' }} />
            {saving ? 'Saving...' : 'Save'}
          </SaveButton>
          
          {/* Share Button */}
          <SaveButton 
            onClick={() => setShowShareModal(true)} 
            disabled={!survey?._id}
            style={{ 
              cursor: !survey?._id ? 'not-allowed' : 'pointer',
              borderRadius: '8px'
            }}
          >
            <FiShare2 style={{ fontSize: '16px' }} /> Share
          </SaveButton>
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