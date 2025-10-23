import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Color theme definitions
export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  sidebar: string;
  sidebarText: string;
}

// Available color themes
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'bioptrics',
    name: 'Bioptrics',
    primary: '#542A46',
    secondary: '#3B1D31',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: 'transparent',
    sidebarText: '#2c2c2c',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    primary: '#be5f41',
    secondary: '#8a4329',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: 'transparent',
    sidebarText: '#2c2c2c',
  },
  {
    id: 'slate',
    name: 'Slate',
    primary: '#a6a6a6',
    secondary: '#7a7a7a',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: 'transparent',
    sidebarText: '#2c2c2c',
  },
  {
    id: 'golden',
    name: 'Golden',
    primary: '#fcca5e',
    secondary: '#e6b54a',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: 'transparent',
    sidebarText: '#2c2c2c',
  },
  {
    id: 'steel',
    name: 'Steel',
    primary: '#5a8596',
    secondary: '#456a7a',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: 'transparent',
    sidebarText: '#2c2c2c',
  },
];

interface ColorThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (themeId: string) => Promise<void>;
  availableThemes: ColorTheme[];
  isLoading: boolean;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

interface ColorThemeProviderProps {
  children: ReactNode;
}

export const ColorThemeProvider: React.FC<ColorThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme | null>(null); // Start with null
  const [isLoading, setIsLoading] = useState(true);

  // Get user's theme preference from their profile
  const { userThemePreference, isLoggedIn, subscriptionReady } = useTracker(() => {
    const handle = Meteor.subscribe('currentUserProfile');
    const user = Meteor.user();
    return {
      userThemePreference: user?.profile?.themePreference,
      isLoggedIn: !!user,
      subscriptionReady: handle.ready()
    };
  }, []);

  // Load theme preference on mount and when user changes
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (isLoggedIn && subscriptionReady) {
          // First try to use the reactive user data if available
          if (userThemePreference) {
            const savedTheme = COLOR_THEMES.find(theme => theme.id === userThemePreference);
            if (savedTheme) {
              console.log('Loading theme from user profile:', userThemePreference);
              setCurrentTheme(savedTheme);
              // Save to localStorage for early script access
              localStorage.setItem('admin-color-theme', savedTheme.id);
              setIsLoading(false);
              return;
            }
          }
          
          // If reactive data isn't available yet, fetch via method call
          try {
            console.log('Fetching theme preference via method call...');
            const themeId = await new Promise<string>((resolve, reject) => {
              Meteor.call('users.getThemePreference', (error: any, result: string) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              });
            });
            
            console.log('Theme preference from method:', themeId);
            const savedTheme = COLOR_THEMES.find(theme => theme.id === themeId);
            if (savedTheme) {
              setCurrentTheme(savedTheme);
              // Save to localStorage for early script access
              localStorage.setItem('admin-color-theme', savedTheme.id);
            } else {
              // Set default theme if no saved theme found
              setCurrentTheme(COLOR_THEMES[0]);
              localStorage.setItem('admin-color-theme', COLOR_THEMES[0].id);
            }
          } catch (methodError) {
            console.error('Error fetching theme preference via method:', methodError);
            // Set default theme on error
            setCurrentTheme(COLOR_THEMES[0]);
          }
        } else if (!isLoggedIn) {
          // Fallback to localStorage for non-logged users (shouldn't happen in admin)
          const savedThemeId = localStorage.getItem('admin-color-theme');
          if (savedThemeId) {
            const savedTheme = COLOR_THEMES.find(theme => theme.id === savedThemeId);
            if (savedTheme) {
              setCurrentTheme(savedTheme);
            } else {
              setCurrentTheme(COLOR_THEMES[0]);
            }
          } else {
            setCurrentTheme(COLOR_THEMES[0]);
          }
        }
        
        // If we still don't have a theme set, use default
        if (!currentTheme) {
          setCurrentTheme(COLOR_THEMES[0]);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Ensure we always have a theme set
        setCurrentTheme(COLOR_THEMES[0]);
      } finally {
        setIsLoading(false);
      }
    };

    // Load theme immediately on mount
    loadThemePreference();
  }, [userThemePreference, isLoggedIn, subscriptionReady]);

  // Apply theme to CSS custom properties - run as soon as possible
  useEffect(() => {
    if (currentTheme) {
      const root = document.documentElement;
      
      // Set main theme colors
      root.style.setProperty('--color-primary', currentTheme.primary);
      root.style.setProperty('--color-secondary', currentTheme.secondary);
      root.style.setProperty('--color-accent', currentTheme.accent);
      root.style.setProperty('--color-background', currentTheme.background);
      root.style.setProperty('--color-text', currentTheme.text);
      root.style.setProperty('--color-sidebar', currentTheme.sidebar);
      root.style.setProperty('--color-sidebar-text', currentTheme.sidebarText);
      
      // Set Bootstrap variables
      root.style.setProperty('--bs-primary', currentTheme.primary);
      root.style.setProperty('--bs-secondary', currentTheme.secondary);
      
      // Calculate and set derived colors based on primary color
      const primaryColor = currentTheme.primary;
      
      // Convert hex to RGB for alpha variations
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        // Set alpha variations of primary color
        root.style.setProperty('--color-primary-10', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
        root.style.setProperty('--color-primary-20', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
        root.style.setProperty('--color-primary-30', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
        
        // Calculate lighter and darker variations
        const lighten = (r: number, g: number, b: number, amount: number) => {
          return {
            r: Math.min(255, Math.round(r + (255 - r) * amount)),
            g: Math.min(255, Math.round(g + (255 - g) * amount)),
            b: Math.min(255, Math.round(b + (255 - b) * amount))
          };
        };
        
        const darken = (r: number, g: number, b: number, amount: number) => {
          return {
            r: Math.round(r * (1 - amount)),
            g: Math.round(g * (1 - amount)),
            b: Math.round(b * (1 - amount))
          };
        };
        
        const lighter = lighten(rgb.r, rgb.g, rgb.b, 0.2);
        const darker = darken(rgb.r, rgb.g, rgb.b, 0.2);
        const hover = darken(rgb.r, rgb.g, rgb.b, 0.1);
        
        root.style.setProperty('--color-primary-light', `rgb(${lighter.r}, ${lighter.g}, ${lighter.b})`);
        root.style.setProperty('--color-primary-dark', `rgb(${darker.r}, ${darker.g}, ${darker.b})`);
        root.style.setProperty('--color-primary-hover', `rgb(${hover.r}, ${hover.g}, ${hover.b})`);
      }
      
      // Mark theme as loaded to show content
      document.body.setAttribute('data-theme-loaded', 'true');
    }
  }, [currentTheme]);

  // Also listen for reactive changes in userThemePreference
  useEffect(() => {
    if (isLoggedIn && userThemePreference && currentTheme) {
      const savedTheme = COLOR_THEMES.find(theme => theme.id === userThemePreference);
      if (savedTheme && savedTheme.id !== currentTheme.id) {
        setCurrentTheme(savedTheme);
      }
    }
  }, [userThemePreference, isLoggedIn, currentTheme?.id]);


  const setTheme = async (themeId: string) => {
    const theme = COLOR_THEMES.find(t => t.id === themeId);
    if (theme) {
      console.log('Setting theme to:', themeId);
      // Briefly hide content during theme change
      document.body.removeAttribute('data-theme-loaded');
      setCurrentTheme(theme);
      
      try {
        // Always save to localStorage for early script access
        localStorage.setItem('admin-color-theme', themeId);
        console.log('Theme saved to localStorage');
        
        if (isLoggedIn) {
          // Also save to user profile
          console.log('Saving theme preference to user profile...');
          await new Promise((resolve, reject) => {
            Meteor.call('users.updateThemePreference', themeId, (error: any, result: any) => {
              if (error) {
                console.error('Error saving theme preference:', error);
                reject(error);
              } else {
                console.log('Theme preference saved successfully:', result);
                resolve(result);
              }
            });
          });
        }
      } catch (error) {
        console.error('Failed to save theme preference:', error);
        // Still apply the theme locally even if saving fails
      }
    }
  };

  // Don't render children until we have a theme loaded
  if (!currentTheme) {
    return null; // CSS will hide the body until theme is loaded
  }

  const value = {
    currentTheme,
    setTheme,
    availableThemes: COLOR_THEMES,
    isLoading,
  };

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};
