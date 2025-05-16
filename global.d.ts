declare module '*.module.css';

interface UserProfile {
  marketingConsent?: boolean;
  onboardingComplete?: boolean;
  [key: string]: any;
}