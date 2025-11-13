import { useColorTheme } from '../../../../contexts/ColorThemeContext';
import { colors as staticColors } from './colors';

/**
 * Dynamic color hook that returns appropriate colors based on active theme
 * 
 * - Default theme: Returns multi-color palette (orange, blue, yellow, gray)
 * - Other themes: Returns single-color palette using theme's primary color
 */
export const useDynamicColors = () => {
  const { currentTheme } = useColorTheme();
  
  // If Default theme is active, use the original multi-color palette
  if (currentTheme.id === 'default') {
    return staticColors;
  }
  
  // For other themes, create a dynamic palette using theme's colors
  return {
    // Primary brand colors - all use theme primary color
    orange: currentTheme.primary,
    blue: currentTheme.primary,
    yellow: currentTheme.primary,
    gray: currentTheme.secondary,
    
    // Backgrounds - keep original values for consistency
    creamBg: staticColors.creamBg,
    peachBg: staticColors.peachBg,
    white: staticColors.white,
    grayLight: staticColors.grayLight,
    
    // Text colors - keep original values
    textDark: staticColors.textDark,
    textMedium: staticColors.textMedium,
    textLight: staticColors.textLight,
    
    // Borders - keep original values
    borderGray: staticColors.borderGray,
    
    // Category colors - all use theme primary for unified look
    category: {
      culture: currentTheme.primary,
      operations: currentTheme.primary,
      benchmarking: currentTheme.primary,
    },
    
    // Hover states - use theme secondary for darker hover effect
    hover: {
      orange: currentTheme.secondary,
      blue: currentTheme.secondary,
      yellow: currentTheme.secondary,
    }
  };
};

/**
 * Helper function to get card colors based on theme
 * Used by ToolCard component to determine card-specific colors
 */
export const useCardColors = (originalCardColor?: string, originalBgColor?: string) => {
  const { currentTheme } = useColorTheme();
  
  // Default theme: use original category colors
  if (currentTheme.id === 'default') {
    return {
      cardColor: originalCardColor || currentTheme.primary,
      cardBgColor: originalBgColor || '#f9f0e5',
    };
  }
  
  // Other themes: use theme primary color
  return {
    cardColor: currentTheme.primary,
    cardBgColor: `${currentTheme.primary}15`, // 15% opacity
  };
};
