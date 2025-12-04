import { Meteor } from 'meteor/meteor';

export const getStoredToken = (type: 'user' | 'admin' = 'user'): string | null => {
  if (typeof window === 'undefined') return null;
  
  const tokenKey = type === 'admin' ? 'admin_jwt' : 'jwt';
  return localStorage.getItem(tokenKey);
};

export const setStoredToken = (token: string, type: 'user' | 'admin' = 'user'): void => {
  if (typeof window === 'undefined') return;
  
  const tokenKey = type === 'admin' ? 'admin_jwt' : 'jwt';
  localStorage.setItem(tokenKey, token);
};

export const removeStoredToken = (type: 'user' | 'admin' = 'user'): void => {
  if (typeof window === 'undefined') return;
  
  const tokenKey = type === 'admin' ? 'admin_jwt' : 'jwt';
  localStorage.removeItem(tokenKey);
};

export const clearAllTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('jwt');
  localStorage.removeItem('admin_jwt');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const getUserFromToken = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const checkAuthStatus = (): boolean => {
  const token = getStoredToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

export const checkAdminAuthStatus = (): boolean => {
  const token = getStoredToken('admin');
  if (!token) return false;
  
  return !isTokenExpired(token);
};
