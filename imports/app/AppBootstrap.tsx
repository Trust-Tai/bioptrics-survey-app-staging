import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ModuleRegistry } from '../core/module-registry/ModuleRegistry';
import { AppRouter } from '../core/routing/ModuleRouter';
import { ModuleEventBus } from '../core/communication/ModuleEventBus';

// Import modules
import { SurveyModule } from '../modules/survey/SurveyModule';
import { LMSModule, initializeLMSEventListeners } from '../modules/lms/LMSModule';

// Import providers
import { ColorThemeProvider } from '../contexts/ColorThemeContext';
import { OrganizationProvider } from '../features/organization/contexts/OrganizationContext';

interface AppBootstrapProps {
  children?: React.ReactNode;
}

export const AppBootstrap: React.FC<AppBootstrapProps> = ({ children }) => {
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      console.log('🚀 Initializing Trust-Tai Application...');
      
      // Register modules
      console.log('📦 Registering modules...');
      ModuleRegistry.register(SurveyModule);
      ModuleRegistry.register(LMSModule);
      
      // Initialize cross-module event listeners
      console.log('🔗 Setting up inter-module communication...');
      initializeLMSEventListeners();
      
      // Validate module dependencies
      console.log('✅ Validating module dependencies...');
      const modules = ModuleRegistry.getAllModules();
      for (const module of modules) {
        if (!ModuleRegistry.validateDependencies(module.id)) {
          console.warn(`⚠️ Module ${module.name} has unmet dependencies`);
        }
      }
      
      // Publish application ready event
      ModuleEventBus.getInstance().publish(
        'system.application_ready',
        { 
          modules: modules.map(m => ({ id: m.id, name: m.name, version: m.version })),
          timestamp: new Date()
        },
        'system'
      );
      
      setModulesLoaded(true);
      console.log('✨ Application initialized successfully!');
      
    } catch (err) {
      console.error('❌ Failed to initialize application:', err);
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
        <h2>Application Initialization Error</h2>
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
        <h2>Loading Trust-Tai Platform...</h2>
        <p>Initializing modules and services...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ColorThemeProvider>
        <OrganizationProvider>
          <div className="trust-tai-app">
            <AppRouter>
              {children}
            </AppRouter>
            
            {/* Module Status Debug Panel (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <ModuleDebugPanel />
            )}
          </div>
        </OrganizationProvider>
      </ColorThemeProvider>
    </BrowserRouter>
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
          right: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          zIndex: 9999
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
      right: '20px',
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
        <strong>Module Status</strong>
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

export default AppBootstrap;
