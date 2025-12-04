// Database schemas for core collections
export interface UserSchema {
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
  moduleProgress?: Record<string, any>;
  preferences?: Record<string, any>;
}

export interface OrganizationSchema {
  _id: string;
  name: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogSchema {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  moduleId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
