import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

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
      sidebar: 'transparent',
      sidebarText: '#2c2c2c',
      error: '#d32f2f'
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#800080',
      secondary: '#9370DB',
      accent: '#A9A59D',
      background: '#ffffff',
      text: '#333333',
      sidebar: '#800080',
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
  background: var(--color-background);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 24px;
  color: var(--color-primary);
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
  border: 2px solid ${props => props.isSelected ? props.$colors.primary : 'transparent'};
  cursor: pointer;
  
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

const Button = styled.button<{ $bgColor: string, $textColor: string, $isSelected?: boolean }>`
  background-color: ${props => props.$isSelected ? props.$bgColor : 'transparent'};
  color: ${props => props.$isSelected ? props.$textColor : props.$bgColor};
  border: 2px solid ${props => props.$bgColor};
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 15px;
  
  &:hover {
    background-color: ${props => props.$bgColor};
    color: ${props => props.$textColor};
  }
`;

const SuccessMessage = styled.div`
  background-color: rgba(67, 160, 71, 0.1);
  color: #155724;
  border-radius: 6px;
  padding: 12px 18px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 4px solid #43a047;
`;

const CustomThemeCard = styled.div<{ $colors: any }>`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid ${props => props.$colors.primary};
  background: ${props => props.$colors.background};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CustomThemeHeader = styled.div<{ $bgColor: string, $textColor: string }>`
  padding: 15px 20px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  font-weight: 600;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CustomThemeContent = styled.div<{ $bgColor: string }>`
  background-color: ${props => props.$bgColor};
  padding: 20px;
`;

const ColorInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const ColorInputLabel = styled.label<{ $textColor: string }>`
  color: ${props => props.$textColor};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const ColorInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const ColorHexInput = styled.input<{ $textColor: string, $bgColor: string }>`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  font-family: monospace;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$textColor};
  }
`;

const ResetButton = styled.button<{ $textColor: string }>`
  background: transparent;
  color: ${props => props.$textColor};
  border: 1px solid ${props => props.$textColor};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$textColor};
    color: white;
  }
`;

const UIPreferences: React.FC = () => {
  const { theme: currentThemeId, setTheme, setCustomTheme, colors } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>(currentThemeId || 'default');
  const [showMessage, setShowMessage] = useState(false);
  
  // Custom theme colors state
  const [customColors, setCustomColors] = useState({
    primary: '#542A46',
    secondary: '#3B1D31',
    accent: '#A9A59D',
    background: '#f8f9fa',
    text: '#2e2e2e',
    sidebar: '#542A46',
    sidebarText: '#ffffff'
  });
  
  const [isCustomThemeSelected, setIsCustomThemeSelected] = useState(false);

  // Load current theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bioptrics_theme');
    if (savedTheme) {
      try {
        const themeData = JSON.parse(savedTheme);
        if (themeData.name === 'custom') {
          setIsCustomThemeSelected(true);
          setCustomColors(themeData.colors);
          setSelectedTheme('custom');
        } else {
          const themePreset = themePresets.find(preset => preset.id === themeData.name);
          if (themePreset) {
            setSelectedTheme(themePreset.id);
            setIsCustomThemeSelected(false);
          }
        }
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themePresets.find(t => t.id === themeId);
    if (theme) {
      try {
        // Update ThemeContext
        setTheme(theme.id);
        setCustomTheme?.(theme.colors);
        
        // Apply CSS variables immediately for global theming
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (key === 'sidebarText') {
            root.style.setProperty(`--color-sidebar-text`, value);
          } else {
            root.style.setProperty(`--color-${key}`, value);
          }
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('bioptrics_theme', JSON.stringify({
          name: theme.id,
          colors: theme.colors,
          timestamp: new Date().getTime()
        }));
        
        // Update local state
        setSelectedTheme(theme.id);
        
        // Show success message
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
        
        console.log('Theme applied successfully:', theme.id);
      } catch (error) {
        console.error('Error applying theme:', error);
      }
    }
  };
  
  const applyCustomTheme = () => {
    try {
      // Ensure sidebar and sidebarText are properly set based on other colors
      const finalColors = {
        ...customColors,
        sidebar: customColors.primary, // Use primary color for sidebar
        sidebarText: '#ffffff', // Keep sidebar text white for readability
        error: '#d32f2f' // Default error color
      };
      
      // Update ThemeContext
      setTheme('custom');
      setCustomTheme?.(finalColors);
      
      // Apply CSS variables immediately for global theming
      const root = document.documentElement;
      Object.entries(finalColors).forEach(([key, value]) => {
        if (key === 'sidebarText') {
          root.style.setProperty(`--color-sidebar-text`, value);
        } else {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('bioptrics_theme', JSON.stringify({
        name: 'custom',
        colors: finalColors,
        timestamp: new Date().getTime()
      }));
      
      // Update local state
      setSelectedTheme('custom');
      setIsCustomThemeSelected(true);
      
      // Show success message
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      
      console.log('Custom theme applied successfully:', finalColors);
    } catch (error) {
      console.error('Error applying custom theme:', error);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(value) || value === '') {
      setCustomColors(prev => ({
        ...prev,
        [colorKey]: value
      }));
    }
  };

  const resetCustomTheme = () => {
    const defaultTheme = themePresets.find(t => t.id === 'default');
    if (defaultTheme) {
      setCustomColors({
        primary: defaultTheme.colors.primary,
        secondary: defaultTheme.colors.secondary,
        accent: defaultTheme.colors.accent,
        background: defaultTheme.colors.background,
        text: defaultTheme.colors.text,
        sidebar: defaultTheme.colors.sidebar,
        sidebarText: defaultTheme.colors.sidebarText
      });
    }
  };

  return (
    <Container>
      <Title>User Interface Preferences</Title>
      
      {showMessage && (
        <SuccessMessage>
          ✓ Theme applied successfully! The application will now use this color scheme.
        </SuccessMessage>
      )}
      
      <h3 style={{ marginBottom: '20px', fontWeight: 600, fontSize: '20px', color: 'var(--color-text)' }}>
        Select a Color Theme
      </h3>
      
      <ThemeGrid>
        {themePresets.map(theme => (
          <ThemeCard 
            key={theme.id} 
            isSelected={selectedTheme === theme.id && !isCustomThemeSelected}
            $colors={theme.colors}
            onClick={() => {
              setSelectedTheme(theme.id);
              setIsCustomThemeSelected(false);
            }}
          >
            <ThemeHeader 
              $bgColor={theme.colors.primary}
              $textColor="#ffffff"
            >
              {theme.name}
              {selectedTheme === theme.id && !isCustomThemeSelected && currentThemeId === theme.id && (
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
                $bgColor={theme.colors.primary}
                $textColor="#ffffff"
                $isSelected={selectedTheme === theme.id && !isCustomThemeSelected && currentThemeId === theme.id}
                onClick={(e) => {
                  // Prevent the click event from propagating to the parent ThemeCard's onClick handler
                  e.stopPropagation();
                  if (selectedTheme !== theme.id || currentThemeId !== theme.id || isCustomThemeSelected) {
                    applyTheme(theme.id);
                    setIsCustomThemeSelected(false);
                  }
                }}
              >
                {selectedTheme === theme.id && !isCustomThemeSelected && currentThemeId === theme.id ? 'Applied ✓' : 'Apply Theme'}
              </Button>
            </ThemeContent>
          </ThemeCard>
        ))}
        
        {/* Custom Theme Card */}
        <CustomThemeCard $colors={customColors}>
          <CustomThemeHeader 
            $bgColor={customColors.primary}
            $textColor="#ffffff"
          >
            Custom Theme
            {isCustomThemeSelected && currentThemeId === 'custom' && (
              <span>✓ Active</span>
            )}
          </CustomThemeHeader>
          <CustomThemeContent $bgColor={customColors.background}>
            <ColorInputGroup>
              <ColorInputLabel $textColor={customColors.text}>Primary Color</ColorInputLabel>
              <ColorInputRow>
                <ColorInput
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
                <ColorHexInput
                  type="text"
                  value={customColors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#542A46"
                  $textColor={customColors.text}
                  $bgColor={customColors.background}
                />
              </ColorInputRow>
            </ColorInputGroup>

            <ColorInputGroup>
              <ColorInputLabel $textColor={customColors.text}>Secondary Color</ColorInputLabel>
              <ColorInputRow>
                <ColorInput
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                />
                <ColorHexInput
                  type="text"
                  value={customColors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  placeholder="#3B1D31"
                  $textColor={customColors.text}
                  $bgColor={customColors.background}
                />
              </ColorInputRow>
            </ColorInputGroup>

            <ColorInputGroup>
              <ColorInputLabel $textColor={customColors.text}>Accent Color</ColorInputLabel>
              <ColorInputRow>
                <ColorInput
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                />
                <ColorHexInput
                  type="text"
                  value={customColors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#A9A59D"
                  $textColor={customColors.text}
                  $bgColor={customColors.background}
                />
              </ColorInputRow>
            </ColorInputGroup>

            <ColorInputGroup>
              <ColorInputLabel $textColor={customColors.text}>Background Color</ColorInputLabel>
              <ColorInputRow>
                <ColorInput
                  type="color"
                  value={customColors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                />
                <ColorHexInput
                  type="text"
                  value={customColors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  placeholder="#f8f9fa"
                  $textColor={customColors.text}
                  $bgColor={customColors.background}
                />
              </ColorInputRow>
            </ColorInputGroup>

            <ColorInputGroup>
              <ColorInputLabel $textColor={customColors.text}>Text Color</ColorInputLabel>
              <ColorInputRow>
                <ColorInput
                  type="color"
                  value={customColors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                />
                <ColorHexInput
                  type="text"
                  value={customColors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  placeholder="#2e2e2e"
                  $textColor={customColors.text}
                  $bgColor={customColors.background}
                />
              </ColorInputRow>
            </ColorInputGroup>

            <ResetButton 
              $textColor={customColors.text}
              onClick={resetCustomTheme}
            >
              Reset to Default
            </ResetButton>

            <Button
              $bgColor={customColors.primary}
              $textColor="#ffffff"
              $isSelected={isCustomThemeSelected && currentThemeId === 'custom'}
              onClick={applyCustomTheme}
            >
              {isCustomThemeSelected && currentThemeId === 'custom' ? 'Applied ✓' : 'Apply Custom Theme'}
            </Button>
          </CustomThemeContent>
        </CustomThemeCard>
      </ThemeGrid>
      
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '16px', fontWeight: 600, fontSize: '20px', color: 'var(--color-text)' }}>
          About Themes
        </h3>
        <p style={{ color: 'var(--color-text)', lineHeight: '1.5', fontSize: '16px' }}>
          Application themes change the appearance of the entire Bioptrics Survey App interface. 
          Select a theme that provides the most comfortable viewing experience for your needs.
          The selected theme will persist across your sessions and apply to all areas of the application.
        </p>
        <p style={{ color: 'var(--color-text)', lineHeight: '1.5', fontSize: '16px', marginTop: '12px' }}>
          Note: Theme settings are stored in your browser and are specific to the device you're currently using.
          Changes will take effect immediately across the entire application.
        </p>
      </div>
    </Container>
  );
};

export default UIPreferences;
