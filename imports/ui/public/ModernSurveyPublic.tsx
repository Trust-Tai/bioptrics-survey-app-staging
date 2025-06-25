import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { decryptToken } from '../../utils/tokenUtils';
import { Surveys } from '../../features/surveys/api/surveys';
import ModernSurveyContent from './components/ModernSurveyContent';
import ModernSurveyLoader from './components/ModernSurveyLoader';
import ModernSurveyError from './components/ModernSurveyError';
import SurveyThemeProvider from './SurveyThemeProvider';

// Types
interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  selectedQuestions?: Record<string, any[]>;
  siteTextQuestions?: any[];
  shareToken?: string;
  sectionQuestions?: any[];
  surveySections?: any[];
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background-color, #ffffff);
  display: flex;
  flex-direction: column;
  font-family: var(--body-font, 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
  color: var(--text-color, #333333);
`;

const Header = styled.header`
  padding: 20px 40px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  height: 40px;
  object-fit: contain;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Footer = styled.footer`
  padding: 20px 40px;
  background: var(--secondary-color, #fafafa);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
  font-size: 14px;
  color: var(--text-color, #666);
  font-family: var(--body-font, 'Inter, sans-serif');
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

/**
 * ModernSurveyPublic - Main component for the public survey interface
 * Handles loading survey data and rendering the appropriate content
 */
const ModernSurveyPublic: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const isPreviewMode = new URLSearchParams(location.search).get('status') === 'preview';
  
  // State for loading, survey data, errors, and theme
  const [isLoading, setIsLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<string>('default');
  const [themeObject, setThemeObject] = useState<any>(null);
  
  // Add survey-public class to body for theme styling
  useEffect(() => {
    document.body.classList.add('survey-public');
    document.documentElement.classList.add('survey-public');
    
    return () => {
      document.body.classList.remove('survey-public');
      document.documentElement.classList.remove('survey-public');
    };
  }, []);
  
  // For preview mode, get survey from localStorage
  useEffect(() => {
    if (isPreviewMode && token) {
      try {
        const storedData = localStorage.getItem(`survey-preview-${token}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setSurveyData(parsedData);
          
          // Extract theme ID from preview survey data
          if (parsedData.defaultSettings?.themes?.length) {
            console.log('[ModernSurveyPublic] Found theme in preview data:', parsedData.defaultSettings.themes[0]);
            setThemeId(parsedData.defaultSettings.themes[0]);
          }
        } else {
          setLoadError('Preview data not found');
        }
      } catch (e) {
        console.error('[ModernSurveyPublic] Error loading preview data:', e);
        setLoadError('Error loading preview data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isPreviewMode, token]);
  
  // For published surveys, get from database using useTracker
  const { loading: dbLoading, survey: dbSurvey } = useTracker(() => {
    if (isPreviewMode || !token) {
      return { loading: false, survey: null };
    }
    
    console.log('Looking for survey with token:', token);
    
    // We pass the encrypted token to the publication, which will handle decryption
    // This is the same approach used in the original SurveyPublic component
    const handle = Meteor.subscribe('surveys.preview', token);
    
    // Try to find the survey using multiple strategies
    let survey;
    
    // Strategy 1: Try to decrypt the token and find by ID
    try {
      const decryptedId = decryptToken(token);
      if (decryptedId) {
        console.log('Successfully decrypted token to:', decryptedId);
        survey = Surveys.findOne({ _id: decryptedId });
        if (survey) {
          console.log('Found survey by decrypted ID');
        }
      }
    } catch (error: any) {
      console.log('Token decryption failed, trying alternative methods');
    }
    
    // Strategy 2: Try to find by shareToken directly
    if (!survey) {
      survey = Surveys.findOne({ shareToken: token });
      if (survey) {
        console.log('Found survey by shareToken');
      }
    }
    
    // Debug: Check what surveys are available in the collection
    const allSurveys = Surveys.find({}).fetch();
    console.log(`Total surveys in collection: ${allSurveys.length}`);
    if (allSurveys.length > 0) {
      console.log('Available survey IDs:', allSurveys.map(s => s._id));
      console.log('Available shareTokens:', allSurveys.map(s => s.shareToken).filter(Boolean));
    }
    
    return {
      loading: !handle.ready(),
      survey
    };
  }, [isPreviewMode, token]);
  
  // Update loading state and survey data when database data changes
  useEffect(() => {
    if (!isPreviewMode) {
      setIsLoading(dbLoading);
      if (dbSurvey) {
        setSurveyData(dbSurvey as unknown as Survey);
        
        // Extract theme ID from database survey data
        console.log('[ModernSurveyPublic] Survey ID:', dbSurvey._id);
        console.log('[ModernSurveyPublic] Full defaultSettings:', dbSurvey.defaultSettings);
        
        // Try to find theme ID and theme object in various locations
        let foundThemeId = null;
        let foundThemeObject = null;
        
        // First check for theme object in defaultSettings
        const defaultSettingsAny = dbSurvey.defaultSettings as any;
        if (defaultSettingsAny?.themeObject) {
          foundThemeObject = defaultSettingsAny.themeObject;
          foundThemeId = foundThemeObject._id;
          console.log('[ModernSurveyPublic] Found theme object in defaultSettings.themeObject:', foundThemeObject);
        }
        // Then check in defaultSettings.themes array
        else if (dbSurvey.defaultSettings?.themes?.length) {
          foundThemeId = dbSurvey.defaultSettings.themes[0];
          console.log('[ModernSurveyPublic] Found theme in defaultSettings.themes:', foundThemeId);
        }
        
        // Check other possible locations using type assertion if no theme object found
        if (!foundThemeId) {
          const surveyAny = dbSurvey as any;
          
          if (surveyAny.theme) {
            foundThemeId = surveyAny.theme;
            console.log('[ModernSurveyPublic] Found theme in survey.theme:', foundThemeId);
          } else if (surveyAny.themeId) {
            foundThemeId = surveyAny.themeId;
            console.log('[ModernSurveyPublic] Found theme in survey.themeId:', foundThemeId);
          } else if (surveyAny.defaultSettings?.themeId) {
            foundThemeId = surveyAny.defaultSettings.themeId;
            console.log('[ModernSurveyPublic] Found theme in defaultSettings.themeId:', foundThemeId);
          } else if (surveyAny.settings?.theme) {
            foundThemeId = surveyAny.settings.theme;
            console.log('[ModernSurveyPublic] Found theme in settings.theme:', foundThemeId);
          }
        }
        
        // Set theme ID and theme object
        if (foundThemeObject) {
          setThemeObject(foundThemeObject);
          setThemeId(foundThemeId || 'default');
        } else if (foundThemeId) {
          setThemeId(foundThemeId);
          setThemeObject(null);
        } else {
          console.warn('[ModernSurveyPublic] No theme found in survey data, using default');
          // Set a default theme ID if none is found
          setThemeId('default');
          setThemeObject(null);
        }
      } else if (!dbLoading) {
        setLoadError('Survey not found');
      }
    }
  }, [dbLoading, dbSurvey, isPreviewMode]);
  
  // Render appropriate content based on state
  if (isLoading) {
    return (
      <SurveyThemeProvider themeId={themeId} themeObject={themeObject}>
        <PageContainer>
          {/* Remove header completely during loading */}
          <MainContent>
            <ModernSurveyLoader />
          </MainContent>
          <Footer>
            © {new Date().getFullYear()} Bioptrics Platform. All rights reserved.
          </Footer>
        </PageContainer>
      </SurveyThemeProvider>
    );
  }
  
  if (loadError || !surveyData) {
    return (
      <SurveyThemeProvider themeId={themeId} themeObject={themeObject}>
        <PageContainer>
          <Header>
            <HeaderContent>
              {/* No logo in this state */}
            </HeaderContent>
          </Header>
          <MainContent>
            <ModernSurveyError message={loadError || "Survey not found"} />
          </MainContent>
          <Footer>
            © {new Date().getFullYear()} Bioptrics Survey Platform. All rights reserved.
          </Footer>
        </PageContainer>
      </SurveyThemeProvider>
    );
  }
  
  return (
    <SurveyThemeProvider themeId={themeId} themeObject={themeObject}>
      <PageContainer>
        <MainContent>
          <ModernSurveyContent 
            survey={surveyData} 
            isPreviewMode={isPreviewMode} 
            token={token || ''} 
          />
        </MainContent>
        <Footer>
          © {new Date().getFullYear()} Powered By Bioptrics. All rights reserved.
        </Footer>
      </PageContainer>
    </SurveyThemeProvider>
  );
};

export default ModernSurveyPublic;
