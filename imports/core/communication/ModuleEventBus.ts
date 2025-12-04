export interface ModuleEvent {
  type: string;
  data: any;
  timestamp: Date;
  moduleId: string;
  userId?: string;
}

export type EventCallback = (event: ModuleEvent) => void;

export class ModuleEventBus {
  private static instance: ModuleEventBus;
  private events: Map<string, EventCallback[]> = new Map();
  private eventHistory: ModuleEvent[] = [];
  private maxHistorySize = 1000;

  private constructor() {}

  static getInstance(): ModuleEventBus {
    if (!ModuleEventBus.instance) {
      ModuleEventBus.instance = new ModuleEventBus();
    }
    return ModuleEventBus.instance;
  }

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, []);
    }
    
    this.events.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publish an event
   */
  publish(eventType: string, data: any, moduleId: string, userId?: string): void {
    const event: ModuleEvent = {
      type: eventType,
      data,
      timestamp: new Date(),
      moduleId,
      userId
    };

    // Add to history
    this.addToHistory(event);

    // Notify subscribers
    const callbacks = this.events.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }

    // Also notify wildcard subscribers
    const wildcardCallbacks = this.events.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in wildcard event callback:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to all events (wildcard)
   */
  subscribeToAll(callback: EventCallback): () => void {
    return this.subscribe('*', callback);
  }

  /**
   * Get event history
   */
  getEventHistory(moduleId?: string, eventType?: string): ModuleEvent[] {
    let history = this.eventHistory;

    if (moduleId) {
      history = history.filter(event => event.moduleId === moduleId);
    }

    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Add event to history
   */
  private addToHistory(event: ModuleEvent): void {
    this.eventHistory.push(event);
    
    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.events.get(eventType)?.length || 0;
    }
    
    let total = 0;
    this.events.forEach(callbacks => {
      total += callbacks.length;
    });
    return total;
  }
}

// Common event types used across modules
export const ModuleEvents = {
  // User events
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  
  // Survey events
  SURVEY_CREATED: 'survey.created',
  SURVEY_COMPLETED: 'survey.completed',
  SURVEY_PUBLISHED: 'survey.published',
  SURVEY_RESPONSE_SUBMITTED: 'survey.response_submitted',
  
  // LMS events
  COURSE_ENROLLED: 'lms.course_enrolled',
  COURSE_COMPLETED: 'lms.course_completed',
  LESSON_COMPLETED: 'lms.lesson_completed',
  ASSESSMENT_COMPLETED: 'lms.assessment_completed',
  
  // Analytics events
  ANALYTICS_REPORT_GENERATED: 'analytics.report_generated',
  ANALYTICS_DASHBOARD_VIEWED: 'analytics.dashboard_viewed',
  
  // System events
  MODULE_LOADED: 'system.module_loaded',
  MODULE_ERROR: 'system.module_error',
  NOTIFICATION_SENT: 'system.notification_sent'
} as const;

export type ModuleEventType = typeof ModuleEvents[keyof typeof ModuleEvents];

export default ModuleEventBus;
