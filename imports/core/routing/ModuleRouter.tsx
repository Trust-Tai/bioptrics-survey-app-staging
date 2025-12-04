import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleRegistry, ModuleConfig } from '../module-registry/ModuleRegistry';
import { useAuth } from '../auth/hooks/useAuth';

interface ModuleRouterProps {
  moduleId: string;
}

interface RouteGuardProps {
  permissions?: string[];
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ permissions, children }) => {
  const { user, hasPermissions } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permissions && permissions.length > 0 && !hasPermissions(permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const ModuleRouter: React.FC<ModuleRouterProps> = ({ moduleId }) => {
  const module = ModuleRegistry.getModule(moduleId);

  if (!module || !module.enabled) {
    return <Navigate to="/404" replace />;
  }

  return (
    <Routes>
      {module.routes.map((route, index) => {
        const RouteComponent = route.component;
        const LayoutComponent = route.layout;

        const element = (
          <RouteGuard permissions={route.permissions}>
            {LayoutComponent ? (
              <LayoutComponent children={<RouteComponent />} />
            ) : (
              <RouteComponent />
            )}
          </RouteGuard>
        );

        return (
          <Route
            key={`${moduleId}-${index}`}
            path={route.path}
            element={element}
          />
        );
      })}
      
      {/* Default redirect to first route */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={module.routes[0]?.path || '/dashboard'} 
            replace 
          />
        } 
      />
    </Routes>
  );
};

interface AppRouterProps {
  children?: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  const modules = ModuleRegistry.getAllModules();

  return (
    <Routes>
      {/* Core routes */}
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/dashboard" element={<div>Main Dashboard</div>} />
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      <Route path="/404" element={<div>Page Not Found</div>} />
      
      {/* Module routes */}
      {modules.map(module => (
        <Route
          key={module.id}
          path={`/${module.id}/*`}
          element={<ModuleRouter moduleId={module.id} />}
        />
      ))}
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {children}
    </Routes>
  );
};

export default ModuleRouter;
