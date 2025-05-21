// Central color definitions for the application
// This file provides a single source of truth for colors

export const colors = {
  // Primary color and its shades
  primary: {
    main: '#552a47',      // Main primary color (previously #552a47 or #552a47)
    light: '#7a3e68',     // Lighter shade (previously #d4af37)
    lighter: '#9e5288',   // Even lighter shade
    dark: '#3d1f33',      // Darker shade
    darker: '#2a1523',    // Even darker shade
    subtle: '#f4ebf1',    // Very light shade for backgrounds (previously #f4ebf1)
    hover: '#693658',     // Hover state color
    active: '#4a2540',    // Active state color
    transparent: 'rgba(85, 42, 71, 0.1)', // Transparent version for overlays
  },
  
  // Text colors
  text: {
    primary: '#28211e',   // Primary text color
    secondary: '#6e5a67', // Secondary text color
    light: '#8a7a85',     // Light text color
    disabled: '#a8a8a8',  // Disabled text color
  },
  
  // UI colors
  ui: {
    background: '#ffffff',
    card: '#ffffff',
    border: '#e5d6e0',
    divider: '#eee',
  },
  
  // Status colors
  status: {
    success: '#2ecc40',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
  }
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Export hex values with opacity for convenience
export const colorWithOpacity = {
  primary10: getColorWithOpacity(colors.primary.main, 0.1),
  primary20: getColorWithOpacity(colors.primary.main, 0.2),
  primary30: getColorWithOpacity(colors.primary.main, 0.3),
  primary50: getColorWithOpacity(colors.primary.main, 0.5),
  primary70: getColorWithOpacity(colors.primary.main, 0.7),
};
