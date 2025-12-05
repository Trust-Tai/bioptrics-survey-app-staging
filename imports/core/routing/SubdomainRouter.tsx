import React, { useEffect, useState } from 'react';
import { SubdomainRouter as SubdomainUtils } from '../utils/subdomain';

// Import module-specific layouts
import LMSComingSoon from '/imports/modules/lms/pages/LMSComingSoon';

interface SubdomainAppRouterProps {
  children?: React.ReactNode;
}

export const SubdomainAppRouter: React.FC<SubdomainAppRouterProps> = ({ children }) => {
  const [moduleConfig, setModuleConfig] = useState<{ moduleId: string; defaultRoute: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we should route to a specific module based on subdomain or path
    const config = SubdomainUtils.shouldRouteToModule();
    setModuleConfig(config);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading module...</div>
      </div>
    );
  }

  // If we have a module config, render that module's content
  if (moduleConfig) {
    // For LMS module, we still want to go through normal app routing
    // so authentication and other protections are applied
    // The LMS routes will be handled by your existing routing system
    return <>{children}</>;
  }

  // Default: render the normal app
  return <>{children}</>;
};

export default SubdomainAppRouter;
