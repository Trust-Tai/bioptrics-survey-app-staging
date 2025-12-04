import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleRegistry, ModuleConfig } from '../module-registry/ModuleRegistry';

interface ModuleContextType {
  modules: ModuleConfig[];
  isLoading: boolean;
  getModule: (id: string) => ModuleConfig | undefined;
  isModuleEnabled: (id: string) => boolean;
}

const ModuleContext = createContext<ModuleContextType | null>(null);

export const useModules = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};

interface ModuleProviderProps {
  children: React.ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize modules
    const loadedModules = ModuleRegistry.getAllModules();
    setModules(loadedModules);
    setIsLoading(false);
  }, []);

  const getModule = (id: string): ModuleConfig | undefined => {
    return ModuleRegistry.getModule(id);
  };

  const isModuleEnabled = (id: string): boolean => {
    return ModuleRegistry.isModuleEnabled(id);
  };

  const contextValue: ModuleContextType = {
    modules,
    isLoading,
    getModule,
    isModuleEnabled
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};

export default ModuleProvider;
