import React, { createContext, useContext, useEffect, ReactNode } from 'react';

// Simplified theme interface - only for CSS variable setup
interface ColorThemeContextType {
  // Fixed theme object for compatibility with existing components
  currentTheme: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    sidebar: string;
    sidebarText: string;
  };
  isLoading: boolean;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

interface ColorThemeProviderProps {
  children: ReactNode;
}

export const ColorThemeProvider: React.FC<ColorThemeProviderProps> = ({ children }) => {
  // Set up CSS variables on mount - using fixed primary color
  useEffect(() => {
    const root = document.documentElement;
    
    // Set the primary color to our fixed value
    const primaryColor = '#ed6801';
    
    // Set main theme colors - using fixed values
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-secondary', '#c55501');
    root.style.setProperty('--color-accent', '#d29b0a');
    root.style.setProperty('--color-background', '#f8f9fa');
    root.style.setProperty('--color-text', '#2e2e2e');
    root.style.setProperty('--color-sidebar', 'transparent');
    root.style.setProperty('--color-sidebar-text', '#2c2c2c');
    
    // Set category colors - using fixed values
    root.style.setProperty('--color-culture', '#ed6801');
    root.style.setProperty('--color-operations', '#325b9b');
    root.style.setProperty('--color-benchmarking', '#d29b0a');
    root.style.setProperty('--color-neutral', '#a6a6a6');
    
    // Set gradients for each category
    root.style.setProperty('--gradient-culture', 'linear-gradient(135deg, #ed6801 0%, #ff8534 100%)');
    root.style.setProperty('--gradient-operations', 'linear-gradient(135deg, #325b9b 0%, #4a7bc8 100%)');
    root.style.setProperty('--gradient-benchmarking', 'linear-gradient(135deg, #d29b0a 0%, #f0b429 100%)');
    root.style.setProperty('--gradient-neutral', 'linear-gradient(135deg, #a6a6a6 0%, #c0c0c0 100%)');
    
    // Set Bootstrap variables
    root.style.setProperty('--bs-primary', primaryColor);
    root.style.setProperty('--bs-secondary', '#c55501');
    
    // Calculate and set derived colors based on primary color
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
  }, []); // Run once on mount

  const value = {
    // Fixed theme object for compatibility with existing components
    currentTheme: {
      id: 'default',
      name: 'Default Theme',
      primary: '#ed6801',
      secondary: '#c55501',
      accent: '#d29b0a',
      background: '#f8f9fa',
      text: '#2e2e2e',
      sidebar: 'transparent',
      sidebarText: '#2c2c2c',
    },
    isLoading: false,
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
