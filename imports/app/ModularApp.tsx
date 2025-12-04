import React, { useState, useEffect } from 'react';
import { ModuleRegistry } from '../core/module-registry/ModuleRegistry';
import { ModuleEventBus } from '../core/communication/ModuleEventBus';

// Import your existing providers
import { ColorThemeProvider } from '../contexts/ColorThemeContext';
import { OrganizationProvider } from '../features/organization/contexts/OrganizationContext';

// Import your existing App component
import App from '../ui/App';
import { SubdomainAppRouter } from '../core/routing/SubdomainRouter';

interface ModularAppProps {
  children?: React.ReactNode;
}

export const ModularApp: React.FC<ModularAppProps> = ({ children }) => {
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeModularArchitecture();
  }, []);

  const initializeModularArchitecture = async () => {
    try {
      console.log('🚀 Initializing Modular Architecture...');
      
      // Register Survey Module (simplified version)
      const SurveyModule = {
        id: 'survey',
        name: 'Survey Management',
        version: '1.0.0',
        description: 'Survey creation, management, and analytics',
        enabled: true,
        order: 1,
        routes: [
          {
            path: '/dashboard',
            component: () => React.createElement('div', null, 'Survey Dashboard'),
            permissions: ['survey.read']
          },
          {
            path: '/builder/:surveyId?',
            component: () => React.createElement('div', null, 'Survey Builder'),
            permissions: ['survey.write']
          }
        ],
        permissions: [
          'survey.read',
          'survey.write',
          'survey.delete',
          'survey.publish',
          'survey.analytics'
        ],
        dependencies: ['core.auth', 'core.database'],
        api: {},
        components: {}
      };

      // Register LMS Module (Coming Soon)
      const LMSModule = {
        id: 'lms',
        name: 'Learning Management System',
        version: '1.0.0',
        description: 'Course creation, student portal, and learning analytics',
        enabled: true,
        order: 2,
        routes: [
          {
            path: '/dashboard',
            component: () => React.createElement('div', null, 'LMS Coming Soon'),
            permissions: ['lms.read']
          },
          {
            path: '/courses',
            component: () => React.createElement('div', null, 'Course Builder Coming Soon'),
            permissions: ['lms.course.write']
          },
          {
            path: '/student-portal',
            component: () => React.createElement('div', null, 'Student Portal Coming Soon'),
            permissions: ['lms.student']
          }
        ],
        permissions: [
          'lms.read',
          'lms.write',
          'lms.course.read',
          'lms.course.write',
          'lms.student',
          'lms.instructor',
          'lms.analytics'
        ],
        dependencies: ['core.auth', 'core.database'],
        api: {},
        components: {}
      };

      ModuleRegistry.register(SurveyModule);
      ModuleRegistry.register(LMSModule);
      
      // Publish application ready event
      ModuleEventBus.getInstance().publish(
        'system.application_ready',
        { 
          modules: [
            { id: 'survey', name: 'Survey Management', version: '1.0.0' },
            { id: 'lms', name: 'Learning Management System', version: '1.0.0' }
          ],
          timestamp: new Date()
        },
        'system'
      );
      
      setModulesLoaded(true);
      console.log('✨ Modular Architecture initialized successfully!');
      
    } catch (err) {
      console.error('❌ Failed to initialize modular architecture:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>Modular Architecture Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Application
        </button>
      </div>
    );
  }

  if (!modulesLoaded) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>Loading Modular Architecture...</h2>
        <p>Initializing survey module...</p>
      </div>
    );
  }

  // Once modules are loaded, render the existing App with subdomain routing
  return (
    <ColorThemeProvider>
      <OrganizationProvider>
        <div className="modular-app">
          <SubdomainAppRouter>
            <App />
          </SubdomainAppRouter>
          
          {/* Module Debug Panel (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <ModuleDebugPanel />
          )}
        </div>
      </OrganizationProvider>
    </ColorThemeProvider>
  );
};

// Debug panel for development
const ModuleDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modules = ModuleRegistry.getAllModules();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '20px'
        }}
      >
        🔧
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <strong>Module Registry</strong>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      {modules.map(module => (
        <div key={module.id} style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold' }}>
            {module.name} v{module.version}
          </div>
          <div style={{ color: module.enabled ? 'green' : 'red' }}>
            {module.enabled ? '✅ Enabled' : '❌ Disabled'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Routes: {module.routes.length} | 
            Permissions: {module.permissions.length}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModularApp;
