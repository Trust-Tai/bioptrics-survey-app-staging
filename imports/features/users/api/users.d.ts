import { Meteor } from 'meteor/meteor';

declare module 'meteor/meteor' {
  namespace Meteor {
    interface UserProfile {
      name?: string;
      role?: string;
      organization?: string;
      admin?: boolean;
      onboardingComplete?: boolean;
      marketingConsent?: boolean;
    }

    interface User {
      _id: string;
      emails?: Array<{
        address: string;
        verified: boolean;
      }>;
      profile?: UserProfile;
      createdAt?: Date;
    }
  }
}
