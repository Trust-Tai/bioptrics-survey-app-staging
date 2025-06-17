import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DefaultTheme, ThemeProvider as StyledThemeProvider } from 'styled-components';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  setCustomTheme?: (customTheme: Partial<CustomThemeColors>) => void;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    sidebar: string;
    error: string;
    sidebarText?: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  // Properties required by styled-components DefaultTheme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  sidebarColor: string;
  sidebarText?: string;
  errorColor: string;
}

// Interface for custom theme colors
interface CustomThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  sidebar: string;
  error: string;
}

// Default theme values
const defaultColors = {
  primary: '#542A46',
  secondary: '#3B1D31',
  accent: '#A9A59D',
  background: '#f8f9fa',
  text: '#2e2e2e',
  sidebar: '#542A46',
  sidebarText: '#ffffff',
  error: '#d32f2f',
};

const defaultTheme: ThemeContextType = {
  theme: 'light',
  setTheme: () => {},
  colors: defaultColors,
  fonts: {
    primary: '"Open Sans", sans-serif',
    secondary: '"Roboto", sans-serif',
  },
  // Map colors to the styled-components DefaultTheme properties
  primaryColor: defaultColors.primary,
  secondaryColor: defaultColors.secondary,
  accentColor: defaultColors.accent,
  backgroundColor: defaultColors.background,
  textColor: defaultColors.text,
  sidebarColor: defaultColors.sidebar,
  sidebarText: defaultColors.sidebarText,
  errorColor: defaultColors.error,
};

// Create the context
const ThemeContext = createContext<ThemeContextType>(defaultTheme);

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [themeColors, setThemeColors] = useState({...defaultColors});
  const [themeFonts, setThemeFonts] = useState(defaultTheme.fonts);
  
  useEffect(() => {
    // Try to load saved theme from localStorage if available
    const savedTheme = localStorage.getItem('bioptrics_theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setCurrentTheme(parsedTheme.name || 'default');
        if (parsedTheme.colors) {
          const updatedColors = {
            ...themeColors,
            ...parsedTheme.colors,
          };
          setThemeColors(updatedColors);
        }
        if (parsedTheme.fonts) {
          setThemeFonts({
            ...themeFonts,
            ...parsedTheme.fonts,
          });
        }
      } catch (e) {
        console.error('Error parsing saved theme:', e);
      }
    }
    
    // Apply CSS variables to document root for global theming
    updateCssVariables(themeColors);
  }, []);
  
  // Update theme and save to localStorage
  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
    
    // Here we would update colors and fonts based on the selected theme
    // For now, we'll just persist the current theme name
    localStorage.setItem('bioptrics_theme', JSON.stringify({ 
      name: theme,
      colors: themeColors,
      fonts: themeFonts
    }));
    
    // Update CSS variables
    updateCssVariables(themeColors);
  };

  // Function to set custom theme colors
  const setCustomTheme = (customTheme: Partial<CustomThemeColors>) => {
    const updatedColors = {
      ...themeColors,
      ...customTheme
    };
    setThemeColors(updatedColors);
    localStorage.setItem('bioptrics_theme', JSON.stringify({ 
      name: currentTheme,
      colors: updatedColors,
      fonts: themeFonts
    }));
    updateCssVariables(updatedColors);
  };
  
  // Apply theme colors as CSS variables
  const updateCssVariables = (colors: typeof defaultColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-sidebar', colors.sidebar);
    root.style.setProperty('--color-sidebar-text', colors.sidebarText || '#ffffff');
    root.style.setProperty('--color-error', colors.error);
  };
  
  // Create the complete theme object with both nested colors and flat properties for styled-components
  const themeContextValue: ThemeContextType = {
    theme: currentTheme,
    setTheme,
    setCustomTheme,
    colors: themeColors,
    fonts: themeFonts,
    // Map colors to the styled-components DefaultTheme properties
    primaryColor: themeColors.primary,
    secondaryColor: themeColors.secondary,
    accentColor: themeColors.accent,
    backgroundColor: themeColors.background,
    textColor: themeColors.text,
    sidebarColor: themeColors.sidebar,
    sidebarText: themeColors.sidebarText,
    errorColor: themeColors.error || defaultColors.error,
  };

  // Create a theme object for styled-components
  const styledComponentsTheme: DefaultTheme = {
    primaryColor: themeColors.primary,
    secondaryColor: themeColors.secondary,
    accentColor: themeColors.accent,
    backgroundColor: themeColors.background,
    textColor: themeColors.text,
    sidebarColor: themeColors.sidebar,
    sidebarText: themeColors.sidebarText,
    errorColor: themeColors.error || defaultColors.error,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <StyledThemeProvider theme={styledComponentsTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;