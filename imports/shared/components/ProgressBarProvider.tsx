import React from 'react';

interface ProgressBarProviderProps {
  children: React.ReactNode;
}

/**
 * ProgressBarProvider component (NProgress implementation removed)
 * This is now just a pass-through component that renders its children
 */
export const ProgressBarProvider: React.FC<ProgressBarProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProgressBarProvider;
