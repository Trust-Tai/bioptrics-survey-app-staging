declare module '*.module.css';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  company?: string;
  marketingConsent?: boolean;
  onboardingComplete?: boolean;
  name?: string;
  [key: string]: any;
}