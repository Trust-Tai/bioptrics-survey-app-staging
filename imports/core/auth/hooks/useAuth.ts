import { useState, useEffect, useContext, createContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AuthContextType, User } from '../types/auth.types';

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth hook implementation
export const useAuthState = (): AuthContextType => {
  const [isLoading, setIsLoading] = useState(true);

  // Use Meteor's reactive user data
  const user = useTracker(() => {
    const meteorUser = Meteor.user();
    if (!meteorUser) return null;

    return {
      _id: meteorUser._id,
      email: meteorUser.emails?.[0]?.address || '',
      profile: {
        firstName: meteorUser.profile?.firstName || '',
        lastName: meteorUser.profile?.lastName || '',
        organizationId: meteorUser.profile?.organizationId,
        roles: meteorUser.profile?.roles || [],
        permissions: meteorUser.profile?.permissions || [],
        admin: meteorUser.profile?.admin || false,
        themePreference: meteorUser.profile?.themePreference || 'default'
      },
      moduleProgress: meteorUser.moduleProgress || {},
      preferences: meteorUser.preferences || {
        theme: 'default',
        notifications: {},
        moduleSettings: {}
      }
    } as User;
  }, []);

  useEffect(() => {
    // Set loading to false once we have initial user state
    setIsLoading(false);
  }, [user]);

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  const logout = (): void => {
    Meteor.logout();
    // Clear any local storage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('admin_jwt');
    }
  };

  const hasPermissions = (permissions: string[]): boolean => {
    if (!user || !user.profile.permissions) return false;
    return permissions.every(permission => 
      user.profile.permissions.includes(permission)
    );
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.profile.roles) return false;
    return user.profile.roles.includes(role);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    hasPermissions,
    hasRole
  };
};

export { AuthContext };
