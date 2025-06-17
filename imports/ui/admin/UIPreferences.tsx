import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';

// Theme presets available for selection
const themePresets = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#542A46',
      secondary: '#3B1D31',
      accent: '#A9A59D',
      background: '#f8f9fa',
      text: '#2e2e2e',
      sidebar: '#542A46', // Matches primary for vibrancy
      sidebarText: '#ffffff',
      error: '#d32f2f'
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#800080', // Purple
      secondary: '#9370DB', // Light purple
      accent: '#A9A59D',
      background: '#ffffff',
      text: '#333333',
      sidebar: '#800080', // Matches primary for vibrancy
      sidebarText: '#ffffff',
      error: '#ff3333'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#9a4d85',
      secondary: '#7a3e68',
      accent: '#f0b160',
      background: '#2a2a2a',
      text: '#e0e0e0',
      sidebar: '#353535',
      sidebarText: '#e0e0e0',
      error: '#ff5555'
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    colors: {
      primary: '#1a6b9c',
      secondary: '#3a89b9',
      accent: '#f7b538',
      background: '#f5f9fc',
      text: '#333333',
      sidebar: '#1a6b9c',
      sidebarText: '#ffffff',
      error: '#e74c3c'
    }
  },
  {
    id: 'green',
    name: 'Tranquil Green',
    colors: {
      primary: '#2b6851',
      secondary: '#409973',
      accent: '#75736D',
      background: '#f5faf8',
      text: '#333333',
      sidebar: '#2b6851',
      sidebarText: '#ffffff',
      error: '#e74c3c'
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#ffcc00',
      background: '#ffffff',
      text: '#000000',
      sidebar: '#000000',
      sidebarText: '#ffffff',
      error: '#cc0000'
    }
  }
];

// Styled components
const Container = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.primaryColor};
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ThemeCard = styled.div<{ isSelected: boolean, $colors: any }>`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid ${props => props.isSelected ? props.$colors.accent : 'transparent'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ThemeHeader = styled.div<{ $bgColor: string, $textColor: string }>`
  padding: 15px 20px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  font-weight: 600;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ThemeContent = styled.div<{ $bgColor: string }>`
  background-color: ${props => props.$bgColor};
  padding: 20px;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  margin-right: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const ColorLabel = styled.div<{ $textColor: string }>`
  color: ${props => props.$textColor};
  font-size: 14px;
  font-weight: 500;
`;

const Button = styled.button<{ $bgColor: string, $textColor: string }>`
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  margin-top: 15px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  border-radius: 6px;
  padding: 12px 18px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UIPreferences: React.FC = () => {
  const { theme: currentThemeId, setTheme, setCustomTheme, colors } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>(currentThemeId || 'light');
  const [showMessage, setShowMessage] = useState(false);
  
  // Apply theme on component mount
  useEffect(() => {
    const currentPreset = themePresets.find(preset => preset.id === currentThemeId);
    if (currentPreset) {
      setSelectedTheme(currentPreset.id);
    }
  }, [currentThemeId]);
  
  const applyTheme = (themeId: string) => {
    const theme = themePresets.find(t => t.id === themeId);
    if (theme) {
      try {
        // Apply theme ID globally
        setTheme(theme.id);
        
        // Apply custom colors to update all styled components
        setCustomTheme?.(theme.colors);
        
        // Force immediate effect on CSS variables
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (key === 'sidebarText') {
            root.style.setProperty(`--color-sidebar-text`, value);
          } else {
            root.style.setProperty(`--color-${key}`, value);
          }
        });
        
        // Store in localStorage for persistence with a timestamp to force refresh
        localStorage.setItem('bioptrics_theme', JSON.stringify({
          name: theme.id,
          colors: theme.colors,
          timestamp: new Date().getTime() // Add timestamp to ensure changes are detected
        }));
        
        // Update local state
        setSelectedTheme(theme.id);
        
        // Force immediate visual updates by applying styles directly
        document.body.style.transition = 'background-color 0.2s, color 0.2s';
        document.body.style.backgroundColor = theme.colors.background;
        document.body.style.color = theme.colors.text;
        
        // Apply themed colors to all relevant elements
        const buttons = document.querySelectorAll('button:not([data-theme-ignore])');
        buttons.forEach(button => {
          (button as HTMLElement).style.backgroundColor = theme.colors.primary;
          (button as HTMLElement).style.color = theme.colors.background === '#000000' ? theme.colors.text : '#fff';
        });
        
        // Apply transitions
        const allElements = document.querySelectorAll('div, p, h1, h2, h3, h4, h5, h6, span');
        allElements.forEach(el => {
          (el as HTMLElement).style.transition = 'background-color 0.3s, color 0.3s';
        });
        
        // Show success message
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
        
        // Force a re-render of components by setting a small timeout
        setTimeout(() => {
          console.log('Theme applied globally:', theme.id);
        }, 50);
      } catch (error) {
        console.error('Error applying theme:', error);
      }
    }
  };
  
  return (
        <Container>
          <Title>User Interface Preferences</Title>
          
          {showMessage && (
            <SuccessMessage>
              Theme applied successfully! The application will now use this color scheme.
            </SuccessMessage>
          )}
          
          <h3 style={{ marginBottom: '20px', fontWeight: 600, fontSize: '20px', color: colors.text }}>
            Select a Color Theme
          </h3>
          
          <ThemeGrid>
            {themePresets.map(theme => (
              <ThemeCard 
                key={theme.id} 
                isSelected={selectedTheme === theme.id}
                $colors={theme.colors}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <ThemeHeader 
                  $bgColor={theme.colors.primary}
                  $textColor="#ffffff"
                >
                  {theme.name}
                  {selectedTheme === theme.id && (
                    <span>✓ Active</span>
                  )}
                </ThemeHeader>
                <ThemeContent $bgColor={theme.colors.background}>
                  <ColorRow>
                    <ColorSwatch $color={theme.colors.primary} />
                    <ColorLabel $textColor={theme.colors.text}>Primary</ColorLabel>
                  </ColorRow>
                  <ColorRow>
                    <ColorSwatch $color={theme.colors.secondary} />
                    <ColorLabel $textColor={theme.colors.text}>Secondary</ColorLabel>
                  </ColorRow>
                  <ColorRow>
                    <ColorSwatch $color={theme.colors.accent} />
                    <ColorLabel $textColor={theme.colors.text}>Accent</ColorLabel>
                  </ColorRow>
                  <ColorRow>
                    <ColorSwatch $color={theme.colors.background} />
                    <ColorLabel $textColor={theme.colors.text}>Background</ColorLabel>
                  </ColorRow>
                  
                  <Button
                    $bgColor={theme.colors.accent}
                    $textColor="#ffffff"
                    onClick={(e) => {
                      e.preventDefault(); // Use preventDefault instead of stopPropagation
                      if (selectedTheme !== theme.id || currentThemeId !== theme.id) {
                        applyTheme(theme.id);
                      }
                    }}
                  >
                    {selectedTheme === theme.id ? 'Applied' : 'Apply Theme'}
                  </Button>
                </ThemeContent>
              </ThemeCard>
            ))}
          </ThemeGrid>
          
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 600, fontSize: '20px', color: colors.text }}>
              About Themes
            </h3>
            <p style={{ color: colors.text, lineHeight: '1.5', fontSize: '16px' }}>
              Application themes change the appearance of the entire Bioptrics Survey App interface. 
              Select a theme that provides the most comfortable viewing experience for your needs.
              The selected theme will persist across your sessions until you change it again.
            </p>
            <p style={{ color: colors.text, lineHeight: '1.5', fontSize: '16px', marginTop: '12px' }}>
              Note: Theme settings are stored in your browser and are specific to the device you're currently using.
            </p>
          </div>
        </Container>
  );
};

export default UIPreferences;
