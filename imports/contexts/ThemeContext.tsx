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
  primary: '#007bff',
  secondary: '#6c757d',
  accent: '#e9ecef',
  background: '#ffffff',
  text: '#212529',
  sidebar: '#343a40',
  sidebarText: '#f8f9fa',
};

const darkTheme: ThemeColors = {
  primary: '#1a73e8',
  secondary: '#5f6368',
  accent: '#202124',
  background: '#121212',
  text: '#e8eaed',
  sidebar: '#343a40',
  sidebarText: '#f8f9fa',
};

const defaultColors: ThemeColors = {
  primary: '#007bff',
  secondary: '#6c757d',
  accent: '#e9ecef',
  background: '#ffffff',
  text: '#212529',
  sidebar: '#343a40',
  sidebarText: '#f8f9fa',
};

const defaultTheme: ThemeContextType = {
  colors: defaultColors,
  isDark: false,
  toggleTheme: () => {},
  // Map colors to the styled-components DefaultTheme properties
  primaryColor: defaultColors.primary,
  secondaryColor: defaultColors.secondary,
  accentColor: defaultColors.accent,
  backgroundColor: defaultColors.background,
  textColor: defaultColors.text,
  sidebarColor: '#343a40',
  sidebarTextColor: '#f8f9fa',
  errorColor: '#dc3545',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const colors = isDark ? darkTheme : lightTheme;

  const themeValue: ThemeContextType = {
    colors,
    isDark,
    toggleTheme,
    // Map colors to styled-components compatible properties
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    backgroundColor: colors.background,
    textColor: colors.text,
    sidebarColor: '#343a40',
    sidebarTextColor: '#f8f9fa',
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