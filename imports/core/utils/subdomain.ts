// Subdomain detection and routing utilities
export interface SubdomainConfig {
  subdomain: string;
  moduleId: string;
  defaultRoute: string;
}

export class SubdomainRouter {
  private static subdomainMappings: SubdomainConfig[] = [
    {
      subdomain: 'pulse',
      moduleId: 'survey',
      defaultRoute: '/dashboard'
    },
    {
      subdomain: 'pulse-dev',
      moduleId: 'lms',
      defaultRoute: '/dashboard'
    }
  ];

  /**
   * Get current subdomain from window location or path
   */
  static getCurrentSubdomain(): string | null {
    if (typeof window === 'undefined') return null;
    
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const parts = hostname.split('.');
    
    // For localhost development - check path first
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check for path-based routing: localhost:3000/pulse or localhost:3000/pulse-dev
      const pathSegments = pathname.split('/').filter(segment => segment !== '');
      if (pathSegments.length > 0) {
        const firstSegment = pathSegments[0];
        // Check if first path segment matches any configured subdomain
        const matchingConfig = this.subdomainMappings.find(config => config.subdomain === firstSegment);
        if (matchingConfig) {
          return firstSegment;
        }
      }
      
      // Check for subdomain-based routing: pulse.localhost:3000
      if (parts.length > 1 && parts[0] !== 'www') {
        return parts[0];
      }
      return null;
    }
    
    // For production domains: pulse.yourdomain.com
    if (parts.length > 2) {
      const subdomain = parts[0];
      // Ignore 'www' subdomain
      return subdomain === 'www' ? null : subdomain;
    }
    
    return null;
  }

  /**
   * Get module configuration for current subdomain
   */
  static getModuleForSubdomain(subdomain: string): SubdomainConfig | null {
    return this.subdomainMappings.find(config => config.subdomain === subdomain) || null;
  }

  /**
   * Get module configuration for current location
   */
  static getCurrentModuleConfig(): SubdomainConfig | null {
    const subdomain = this.getCurrentSubdomain();
    return subdomain ? this.getModuleForSubdomain(subdomain) : null;
  }

  /**
   * Check if current request should be handled by a specific module
   */
  static shouldRouteToModule(): { moduleId: string; defaultRoute: string } | null {
    const config = this.getCurrentModuleConfig();
    return config ? { moduleId: config.moduleId, defaultRoute: config.defaultRoute } : null;
  }

  /**
   * Generate URL for a module
   */
  static getModuleUrl(moduleId: string, path: string = ''): string {
    const config = this.subdomainMappings.find(c => c.moduleId === moduleId);
    if (!config) return path;

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // For localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const portSuffix = port ? `:${port}` : '';
      return `${protocol}//${config.subdomain}.${hostname}${portSuffix}${path}`;
    }
    
    // For production
    const baseDomain = hostname.split('.').slice(-2).join('.');
    return `${protocol}//${config.subdomain}.${baseDomain}${path}`;
  }

  /**
   * Add new subdomain mapping
   */
  static addSubdomainMapping(config: SubdomainConfig): void {
    this.subdomainMappings.push(config);
  }

  /**
   * Get all subdomain mappings
   */
  static getAllMappings(): SubdomainConfig[] {
    return [...this.subdomainMappings];
  }
}

export default SubdomainRouter;
