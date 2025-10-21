import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  sidebar: string;
  sidebarText: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  theme?: string;
  setTheme: (themeId: string) => void;
  setCustomTheme?: (colors: ThemeColors) => void;
  // Add styled-components compatible properties
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  errorColor: string;
}

const lightTheme: ThemeColors = {
  primary: 'var(--color-primary, #542A46)',
  secondary: '#3B1D31',
  accent: '#A9A59D',
  background: '#f8f9fa',
  text: '#2e2e2e',
  sidebar: 'var(--color-primary, #542A46)',
  sidebarText: '#ffffff', // White text on dark sidebar
};

const darkTheme: ThemeColors = {
  primary: '#9a4d85',
  secondary: '#7a3e68',
  accent: '#f0b160',
  background: '#2a2a2a',
  text: '#e0e0e0',
  sidebar: '#353535',
  sidebarText: '#ffffff', // White text on dark sidebar
};

const defaultColors: ThemeColors = {
  primary: 'var(--color-primary, #542A46)',
  secondary: '#3B1D31',
  accent: '#A9A59D',
  background: '#f8f9fa',
  text: '#2e2e2e',
  sidebar: 'var(--color-primary, #542A46)',
  sidebarText: '#ffffff', // White text on dark sidebar
};

const defaultTheme: ThemeContextType = {
  colors: defaultColors,
  isDark: false,
  toggleTheme: () => {},
  theme: 'default',
  setTheme: () => {},
  setCustomTheme: () => {},
  // Map colors to the styled-components DefaultTheme properties
  primaryColor: defaultColors.primary,
  secondaryColor: defaultColors.secondary,
  accentColor: defaultColors.accent,
  backgroundColor: defaultColors.background,
  textColor: defaultColors.text,
  sidebarColor: defaultColors.sidebar,
  sidebarTextColor: defaultColors.sidebarText,
  errorColor: '#dc3545',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply CSS variables to document root
const applyCSSVariables = (colors: ThemeColors) => {
  const root = document.documentElement;
  
  // Set all color variables
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-sidebar', colors.sidebar);
  root.style.setProperty('--color-sidebar-text', '#2c2c2c');
  
  console.log('CSS Variables applied:', {
    primary: colors.primary,
    sidebar: colors.sidebar,
    sidebarText: colors.sidebarText
  });
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentColors, setCurrentColors] = useState<ThemeColors>(defaultColors);

  // Load theme from localStorage on startup
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('bioptrics_theme');
      if (savedTheme) {
        const themeData = JSON.parse(savedTheme);
        if (themeData.colors && themeData.name) {
          setCurrentTheme(themeData.name);
          setCurrentColors(themeData.colors);
          applyCSSVariables(themeData.colors);
          console.log('Loaded theme from localStorage:', themeData.name);
        }
      } else {
        // Apply default theme if no saved theme
        applyCSSVariables(defaultColors);
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      applyCSSVariables(defaultColors);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const colors = newTheme ? darkTheme : lightTheme;
    setCurrentColors(colors);
    applyCSSVariables(colors);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    console.log('Theme ID set to:', themeId);
  };

  const setCustomTheme = (colors: ThemeColors) => {
    setCurrentColors(colors);
    applyCSSVariables(colors);
    console.log('Custom theme colors applied:', colors);
  };

  const colors = currentColors;

  const themeValue: ThemeContextType = {
    colors,
    isDark,
    toggleTheme,
    theme: currentTheme,
    setTheme,
    setCustomTheme,
    // Map colors to styled-components compatible properties
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    backgroundColor: colors.background,
    textColor: colors.text,
    sidebarColor: colors.sidebar,
    sidebarTextColor: colors.sidebarText,
    errorColor: '#dc3545',
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};