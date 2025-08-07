import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import progressBar from '../utils/nprogress';
import initMeteorProgressInterceptors from '../utils/meteorProgressInterceptor';

interface ProgressBarProviderProps {
  children: React.ReactNode;
}

/**
 * ProgressBarProvider component that initializes NProgress and handles routing transitions
 * This component should be placed high in the component tree, typically wrapping the entire app
 */
export const ProgressBarProvider: React.FC<ProgressBarProviderProps> = ({ children }) => {
  const location = useLocation();

  // Initialize NProgress and patch Meteor methods on mount
  useEffect(() => {
    // Initialize NProgress
    progressBar.initialize();
    
    // Patch Meteor methods and subscriptions
    initMeteorProgressInterceptors();
    
    console.log('NProgress initialized and Meteor methods patched');
    
    // Clean up function (not really needed, but good practice)
    return () => {
      progressBar.done();
    };
  }, []);

  // Show progress bar on route changes
  useEffect(() => {
    progressBar.start();
    
    // Complete the progress bar after a short delay to simulate loading
    const timer = setTimeout(() => {
      progressBar.done();
    }, 300);
    
    return () => {
      clearTimeout(timer);
      progressBar.done();
    };
  }, [location]);

  return <>{children}</>;
};

export default ProgressBarProvider;
