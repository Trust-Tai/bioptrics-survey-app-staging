import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SurveyThemes, SurveyThemeType } from '../../features/survey-themes/api/surveyThemes';

interface SurveyThemeProviderProps {
  themeId?: string;
  themeObject?: any;
  children: React.ReactNode;
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  try {
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('Error parsing color:', error);
    return '85, 42, 71'; // Default color (552a47)
  }
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  // Remove the # if present
  color = color.replace('#', '');
  
  // Parse the hex values
  const num = parseInt(color, 16);
  
  // Extract the RGB components
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  // Clamp the values
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  
  // Convert back to hex
  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

// Generate CSS rules based on theme properties
const generateCssRules = (theme: SurveyThemeType): string => {
  // Extract theme properties with fallbacks
  const primaryColor = theme.primaryColor || theme.color || '#552a47';
  const secondaryColor = theme.secondaryColor || '#97C646';
  const accentColor = theme.accentColor || '#b69d57';
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#333333';
  const headingFont = theme.headingFont || 'Inter, sans-serif';
  const bodyFont = theme.bodyFont || 'Inter, sans-serif';
  
  // Get RGB values for primary color
  const primaryColorRgb = hexToRgb(primaryColor);
  console.log('Primary color:', primaryColor);
  console.log('Body font:', bodyFont);
  console.log('Heading font:', headingFont);
  
  return `
    /* Apply theme variables with high specificity */
    :root,
    html,
    body,
    .survey-public,
    html.survey-public,
    body.survey-public {
      --primary-color: ${primaryColor} !important;
      --primary-color-rgb: ${primaryColorRgb} !important;
      --secondary-color: ${secondaryColor} !important;
      --accent-color: ${accentColor} !important;
      --background-color: ${backgroundColor} !important;
      --text-color: ${textColor} !important;
      --heading-font: ${headingFont} !important;
      --body-font: ${bodyFont} !important;
      --button-background: ${primaryColor} !important;
      --button-text: #ffffff !important;
      --button-hover: ${adjustColor(primaryColor, -15)} !important;
      --button-radius: 30px !important;
      --heading-color: ${textColor} !important;
    }
    
    /* Apply direct styles to body and html for better compatibility */
    body.survey-public {
      background-color: ${backgroundColor};
      color: ${textColor};
    }
    
    /* Apply font styles directly */
    body.survey-public,
    body.survey-public * {
      font-family: ${bodyFont};
    }
    
    body.survey-public h1,
    body.survey-public h2,
    body.survey-public h3,
    body.survey-public h4,
    body.survey-public h5,
    body.survey-public h6,
    body.survey-public .heading {
      font-family: ${headingFont};
    }
  `;
};

const SurveyThemeProvider: React.FC<SurveyThemeProviderProps> = ({ themeId, themeObject, children }) => {
  const [cssRules, setCssRules] = useState<string>('');
  
  // Load theme data from database
  const { loading, theme } = useTracker(() => {
    // If a complete theme object is provided directly, use it without database lookup
    if (themeObject) {
      console.log('[SurveyThemeProvider] Using provided theme object:', {
        id: themeObject._id,
        name: themeObject.name
      });
      
      return {
        loading: false,
        theme: themeObject as SurveyThemeType
      };
    }
    
    if (!themeId) {
      console.warn('[SurveyThemeProvider] No theme ID provided, using default');
      return {
        loading: false,
        theme: {
          _id: 'default',
          name: 'Default Theme',
          primaryColor: '#552a47',
          secondaryColor: '#97C646',
          accentColor: '#b69d57',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          headingFont: 'Inter, sans-serif',
          bodyFont: 'Inter, sans-serif'
        } as SurveyThemeType
      };
    }
    
    console.log('[SurveyThemeProvider] Subscribing to theme:', themeId);
    
    const handle = Meteor.subscribe('surveyThemes.byId', themeId);
    
    // Try multiple approaches to find the theme
    let themeData = null;
    
    // First, try to find by exact ID match
    themeData = SurveyThemes.findOne({ _id: themeId });
    
    // If not found, try case-insensitive ID match
    if (!themeData && typeof themeId === 'string') {
      themeData = SurveyThemes.findOne({ _id: { $regex: new RegExp('^' + themeId + '$', 'i') } });
    }
    
    // If still not found, try by name
    if (!themeData && typeof themeId === 'string') {
      themeData = SurveyThemes.findOne({ name: { $regex: new RegExp(themeId, 'i') } });
    }
    
    // If still not found, try to find any theme with similar ID or name
    if (!themeData && typeof themeId === 'string') {
      themeData = SurveyThemes.findOne({ $or: [
        { _id: { $regex: new RegExp(themeId, 'i') } },
        { name: { $regex: new RegExp(themeId, 'i') } }
      ]});
    }
    
    console.log('[SurveyThemeProvider] Theme data loaded:', themeData ? 'yes' : 'no');
    
    // If we found the theme, log its details
    if (themeData) {
      console.log('[SurveyThemeProvider] Theme details:', {
        id: themeData._id,
        name: themeData.name,
        primaryColor: themeData.primaryColor || themeData.color,
        secondaryColor: themeData.secondaryColor,
        bodyFont: themeData.bodyFont,
        headingFont: themeData.headingFont
      });
    } else {
      console.warn('[SurveyThemeProvider] Theme not found in database:', themeId);
      // Log all available themes for debugging
      const allThemes = SurveyThemes.find({}).fetch();
      console.log('[SurveyThemeProvider] Available themes:', 
        allThemes.map(t => ({ id: t._id, name: t.name })));
    }
    
    return {
      loading: !handle.ready(),
      theme: themeData || {
        _id: 'default',
        name: 'Default Theme',
        primaryColor: '#552a47',
        secondaryColor: '#97C646',
        accentColor: '#b69d57',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif'
      } as SurveyThemeType
    };
  }, [themeId, themeObject]);
  
  // Generate CSS rules based on theme properties
  useEffect(() => {
    if (!theme) {
      console.log('[SurveyThemeProvider] No theme data available, using default styles');
      // Apply default styles even when no theme is available
      const defaultCss = generateCssRules({
        _id: 'default',
        name: 'Default Theme',
        primaryColor: '#552a47',
        secondaryColor: '#97C646',
        accentColor: '#b69d57',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif'
      } as SurveyThemeType);
      
      setCssRules(defaultCss);
      return;
    }
    
    console.log('[SurveyThemeProvider] Applying theme:', theme.name);
    console.log('[SurveyThemeProvider] Theme colors:', {
      primary: theme.primaryColor || theme.color,
      secondary: theme.secondaryColor,
      accent: theme.accentColor,
      background: theme.backgroundColor,
      text: theme.textColor
    });
    
    const rules = generateCssRules(theme);
    setCssRules(rules);
    console.log('[SurveyThemeProvider] CSS rules generated');
    
  }, [theme]);
  
  // Apply theme directly to document head for maximum compatibility
  useEffect(() => {
    if (!cssRules) return;
    
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    styleElement.setAttribute('id', 'survey-theme-styles');
    styleElement.textContent = cssRules;
    
    // Remove any existing theme styles
    const existingStyle = document.getElementById('survey-theme-styles');
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle);
      console.log('[SurveyThemeProvider] Removed existing theme styles');
    }
    
    // Add the new styles to head
    document.head.appendChild(styleElement);
    console.log('[SurveyThemeProvider] Theme styles injected into document head');
    console.log('[SurveyThemeProvider] CSS rules:', cssRules.substring(0, 200) + '...');
    
    // Add a class to the body to indicate theme is loaded
    document.body.classList.add('theme-loaded');
    
    // Debug: Check if survey-public class is present
    if (document.body.classList.contains('survey-public')) {
      console.log('[SurveyThemeProvider] survey-public class is present on body');
    } else {
      console.warn('[SurveyThemeProvider] survey-public class is NOT present on body');
      // Add it if missing
      document.body.classList.add('survey-public');
      console.log('[SurveyThemeProvider] Added survey-public class to body');
    }
    
    // Debug: Check computed styles
    setTimeout(() => {
      const bodyStyles = window.getComputedStyle(document.body);
      console.log('[SurveyThemeProvider] Computed styles:', {
        primaryColor: bodyStyles.getPropertyValue('--primary-color'),
        bodyFont: bodyStyles.getPropertyValue('--body-font'),
        fontFamily: bodyStyles.fontFamily
      });
    }, 100);
    
    return () => {
      // Clean up on unmount
      const styleToRemove = document.getElementById('survey-theme-styles');
      if (styleToRemove && styleToRemove.parentNode) {
        styleToRemove.parentNode.removeChild(styleToRemove);
      }
      document.body.classList.remove('theme-loaded');
    };
  }, [cssRules]);
  
  if (loading) {
    console.log('[SurveyThemeProvider] Still loading theme data...');
    return <>{children}</>;
  }
  
  return <>{children}</>;
};

export default SurveyThemeProvider;
