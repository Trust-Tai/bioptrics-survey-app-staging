import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import progressBar from '../utils/nprogress';

/**
 * Hook to show progress bar during route changes
 */
export const useNProgress = () => {
  const location = useLocation();

  useEffect(() => {
    // Start the progress bar when location changes
    progressBar.start();

    // Complete the progress bar after a short delay to simulate loading
    const timer = setTimeout(() => {
      progressBar.done();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [location]);

  return null;
};

export default useNProgress;
