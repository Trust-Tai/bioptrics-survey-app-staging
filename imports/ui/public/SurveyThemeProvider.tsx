import React, { useEffect } from 'react';

interface SurveyThemeProviderProps {
  children: React.ReactNode;
}

export const SurveyThemeProvider: React.FC<SurveyThemeProviderProps> = ({ children }) => {
  // Set up fixed CSS variables for surveys - no database fetching
  useEffect(() => {
    console.log('[SurveyThemeProvider] Setting up fixed CSS variables');
    
    // Remove any existing survey theme styles
    const existingStyle = document.getElementById('survey-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create fixed CSS rules using our primary color
    const cssRules = `
      :root {
        --survey-primary-color: var(--color-primary, #552a47);
        --survey-secondary-color: #97C646;
        --survey-accent-color: #b69d57;
        --survey-background-color: #ffffff;
        --survey-text-color: #333333;
        --survey-heading-font: 'Inter, sans-serif';
        --survey-body-font: 'Inter, sans-serif';
        --survey-primary-rgb: 85, 42, 71;
        --survey-primary-light: #6b3659;
        --survey-primary-dark: #3d1e2f;
      }
      
      .survey-public {
        --color-primary: var(--survey-primary-color);
        --color-secondary: var(--survey-secondary-color);
        --color-accent: var(--survey-accent-color);
        --color-background: var(--survey-background-color);
        --color-text: var(--survey-text-color);
        font-family: var(--survey-body-font);
      }
      
      .survey-public h1, .survey-public h2, .survey-public h3, 
      .survey-public h4, .survey-public h5, .survey-public h6 {
        font-family: var(--survey-heading-font);
      }
      
      .survey-public .btn-primary {
        background-color: var(--survey-primary-color);
        border-color: var(--survey-primary-color);
      }
      
      .survey-public .btn-primary:hover {
        background-color: var(--survey-primary-dark);
        border-color: var(--survey-primary-dark);
      }
      
      .survey-public .form-control:focus {
        border-color: var(--survey-primary-color);
        box-shadow: 0 0 0 0.2rem rgba(var(--survey-primary-rgb), 0.25);
      }
    `;
    
    // Create and inject style element
    const styleElement = document.createElement('style');
    styleElement.id = 'survey-theme-styles';
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
    
    console.log('[SurveyThemeProvider] Fixed CSS rules injected successfully');
    
    // Cleanup function
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
      document.body.classList.remove('survey-public');
    };
  }, []); // Run once on mount
  
  return <>{children}</>;
};

export default SurveyThemeProvider;
