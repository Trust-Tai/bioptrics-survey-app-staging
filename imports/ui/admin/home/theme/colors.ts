// Client color palette - "flower orange color palette"
export const colors = {
  // Primary brand colors
  orange: '#be5f41',      // Primary orange - Culture Assessments
  gray: '#a6a6a6',        // Neutral gray
  yellow: '#fcca5e',      // Accent yellow - Benchmarking Tools
  blue: '#325b9b',        // Secondary blue - Operations & Governance
  
  // Backgrounds
  creamBg: '#fff8e4',     // Hero section background
  peachBg: '#ffefe3',     // Help section background
  white: '#FFFFFF',
  grayLight: '#f5f7f8',
  
  // Text colors
  textDark: '#2c3e50',
  textMedium: '#6c757d',
  textLight: '#FFFFFF',
  
  // Borders
  borderGray: '#dee2e6',
  
  // Category-specific colors
  category: {
    culture: '#be5f41',      // Orange for Culture Assessments
    operations: '#325b9b',   // Blue for Operations & Governance
    benchmarking: '#d29b0a', // Yellow for Benchmarking Tools
  },
  
  // Hover states (darker versions)
  hover: {
    orange: '#a04d33',
    blue: '#4a6d7a',
    yellow: '#e5b54d',
  }
};

export type CategoryColor = keyof typeof colors.category;
