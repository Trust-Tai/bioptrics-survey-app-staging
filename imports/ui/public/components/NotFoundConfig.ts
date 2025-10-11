/**
 * Configuration file for the NotFoundPage component.
 * This allows for easy customization of the 404 page without modifying the component itself.
 * 
 * To change the appearance or behavior of the 404 page, simply update the values in this file.
 */

export interface NotFoundConfig {
  // Text content
  title: string;
  message: string;
  
  // Button text
  backButtonText: string;
  homeButtonText: string;
  
  // Button visibility
  showBackButton: boolean;
  showHomeButton: boolean;
  
  // Routes
  homeRoute: string;
  
  // Styling
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Custom content - can be extended as needed
  customHeaderContent?: string;
  customFooterContent?: string;
  
  // Feature flags
  enableAnimation: boolean;
  enableLogging: boolean;
}

// Default configuration
const defaultConfig: NotFoundConfig = {
  title: "Page Not Found",
  message: "The page you are looking for doesn't exist or has been moved.",
  
  backButtonText: "Go Back",
  homeButtonText: "Home Page",
  
  showBackButton: true,
  showHomeButton: true,
  
  homeRoute: "/",
  
  backgroundColor: "var(--color-background, #f8f9fa)",
  textColor: "var(--color-text, #333)",
  primaryColor: "var(--color-primary, #542A46)",
  secondaryColor: "var(--color-secondary, #7B3F69)",
  
  enableAnimation: true,
  enableLogging: false
};

// Export the configuration
export default defaultConfig;
