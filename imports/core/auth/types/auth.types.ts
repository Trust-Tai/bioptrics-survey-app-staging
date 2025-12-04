export interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    organizationId?: string;
    roles: string[];
    permissions: string[];
    admin?: boolean;
    themePreference?: string;
  };
  moduleProgress?: {
    survey?: {
      completedSurveys: string[];
      totalResponses: number;
    };
    lms?: {
      enrolledCourses: string[];
      completedCourses: string[];
      totalLearningHours: number;
    };
  };
  preferences?: {
    theme: string;
    notifications: any;
    moduleSettings: Record<string, any>;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}
