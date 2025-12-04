import React from 'react';

export interface ModuleConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: React.ComponentType;
  routes: ModuleRoute[];
  permissions: string[];
  dependencies: string[];
  api?: any;
  components?: any;
  enabled: boolean;
  order?: number;
}

export interface ModuleRoute {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  permissions?: string[];
  layout?: React.ComponentType;
}

export interface ModuleAPI {
  [key: string]: any;
}

export class ModuleRegistry {
  private static modules: Map<string, ModuleConfig> = new Map();
  private static apis: Map<string, ModuleAPI> = new Map();

  /**
   * Register a module with the application
   */
  static register(config: ModuleConfig): void {
    if (this.modules.has(config.id)) {
      console.warn(`Module ${config.id} is already registered. Overwriting...`);
    }
    
    this.modules.set(config.id, config);
    
    if (config.api) {
      this.apis.set(config.id, config.api);
    }
    
    console.log(`Module registered: ${config.name} (${config.id})`);
  }

  /**
   * Get a specific module by ID
   */
  static getModule(id: string): ModuleConfig | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   */
  static getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values())
      .filter(module => module.enabled)
      .sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  /**
   * Get modules that the user has permission to access
   */
  static getModulesByPermission(userPermissions: string[]): ModuleConfig[] {
    return this.getAllModules().filter(module => {
      if (module.permissions.length === 0) return true;
      return module.permissions.some(permission => 
        userPermissions.includes(permission)
      );
    });
  }

  /**
   * Get module API
   */
  static getModuleAPI(moduleId: string): ModuleAPI | undefined {
    return this.apis.get(moduleId);
  }

  /**
   * Check if a module is registered and enabled
   */
  static isModuleEnabled(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    return module ? module.enabled : false;
  }

  /**
   * Get all routes from all enabled modules
   */
  static getAllRoutes(): Array<ModuleRoute & { moduleId: string }> {
    const routes: Array<ModuleRoute & { moduleId: string }> = [];
    
    this.getAllModules().forEach(module => {
      module.routes.forEach(route => {
        routes.push({
          ...route,
          moduleId: module.id,
          path: `/${module.id}${route.path}`
        });
      });
    });
    
    return routes;
  }

  /**
   * Validate module dependencies
   */
  static validateDependencies(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;

    return module.dependencies.every(dep => {
      const [depModule] = dep.split('.');
      return this.isModuleEnabled(depModule);
    });
  }

  /**
   * Disable a module
   */
  static disableModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.enabled = false;
      console.log(`Module disabled: ${module.name} (${moduleId})`);
    }
  }

  /**
   * Enable a module
   */
  static enableModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      if (this.validateDependencies(moduleId)) {
        module.enabled = true;
        console.log(`Module enabled: ${module.name} (${moduleId})`);
      } else {
        console.error(`Cannot enable module ${moduleId}: missing dependencies`);
      }
    }
  }
}

export default ModuleRegistry;
