import React, { createContext, useContext } from 'react';
import { AuthContext, useAuthState } from '../auth/hooks/useAuth';
import { AuthContextType } from '../auth/types/auth.types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
