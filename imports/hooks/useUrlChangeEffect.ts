import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Hook that detects URL changes and runs a callback
 * 
 * @param callback - Function to call when URL changes
 * @param dependencies - Additional dependencies for the effect
 */
export function useUrlChangeEffect(
  callback: (previousPath: string, currentPath: string) => void,
  dependencies: any[] = []
) {
  const location = useLocation();
  const navigate = useNavigate();
  const previousPathRef = useRef(location.pathname);
  
  // Effect to handle React Router location changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // If the path has changed
    if (previousPathRef.current !== currentPath) {
      // Call the callback with previous and current paths
      callback(previousPathRef.current, currentPath);
      
      // Update the ref
      previousPathRef.current = currentPath;
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, callback, ...dependencies]);
  
  // Effect to handle browser history changes (back/forward buttons)
  useEffect(() => {
    // Function to handle popstate events
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      
      // If the path has changed
      if (previousPathRef.current !== currentPath) {
        // Call the callback with previous and current paths
        callback(previousPathRef.current, currentPath);
        
        // Update the ref
        previousPathRef.current = currentPath;
      }
    };
    
    // Add event listener for browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);
  
  // Effect to handle clicks on links outside React Router
  useEffect(() => {
    // Function to handle click events on links
    const handleLinkClick = (event: MouseEvent) => {
      // Check if the clicked element is a link
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        
        // Only handle internal links that don't use React Router
        if (href && href.startsWith('/') && !link.hasAttribute('data-rr-ui-event-key')) {
          // Get the path from the href
          const path = new URL(href, window.location.origin).pathname;
          
          // If the path is different from the current path
          if (path !== previousPathRef.current) {
            // Call the callback before the navigation happens
            callback(previousPathRef.current, path);
            
            // Update the ref
            previousPathRef.current = path;
          }
        }
      }
    };
    
    // Add event listener for capturing clicks
    document.addEventListener('click', handleLinkClick, true);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);
}

export default useUrlChangeEffect;
