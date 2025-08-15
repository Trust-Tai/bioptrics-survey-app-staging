import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info';

// Define notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // in milliseconds, default will be applied if not provided
}

// Animation for notification entry
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Animation for notification exit
const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Container for all notifications
const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
`;

// Individual notification styling
const NotificationItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isExiting'].includes(prop),
})<{ type: NotificationType; isExiting: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: ${({ type }) => 
    type === 'success' ? 'var(--color-success, #4CAF50)' : 
    type === 'error' ? 'var(--color-error, #f44336)' : 
    'var(--color-info, #2196F3)'};
  color: white;
  font-weight: 500;
  animation: ${({ isExiting }) => 
    isExiting 
      ? css`${slideOut} 0.3s ease forwards` 
      : css`${slideIn} 0.3s ease forwards`};
`;

const NotificationContent = styled.div`
  flex: 1;
  margin: 0 10px;
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

// Create a singleton for managing notifications
class NotificationManager {
  private static instance: NotificationManager;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];
  private counter = 0;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public addNotification(type: NotificationType, message: string, duration?: number): string {
    const id = `notification-${this.counter++}`;
    const notification: Notification = { id, type, message, duration };
    this.notifications = [...this.notifications, notification];
    this.notifyListeners();
    return id;
  }

  public removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }

  // Helper methods for different notification types
  public success(message: string, duration = 3000): string {
    return this.addNotification('success', message, duration);
  }

  public error(message: string, duration = 5000): string {
    return this.addNotification('error', message, duration);
  }

  public info(message: string, duration = 4000): string {
    return this.addNotification('info', message, duration);
  }
}

// Export the singleton instance
export const notificationManager = NotificationManager.getInstance();

// Create a hook to use notifications in components
export const useNotifications = () => {
  return {
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
  };
};

// Component to display notifications
export const GlobalNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  // Handle notification removal with animation
  const handleRemove = (id: string, duration?: number) => {
    const removeAfter = duration || 3000;
    
    // Schedule removal after duration
    const timer = setTimeout(() => {
      // Mark as exiting to trigger animation
      setExitingIds(prev => [...prev, id]);
      
      // Actually remove after animation completes
      setTimeout(() => {
        notificationManager.removeNotification(id);
        setExitingIds(prev => prev.filter(exitId => exitId !== id));
      }, 300); // Animation duration
    }, removeAfter);

    return timer; // Return timer ID instead of cleanup function
  };

  // Render icon based on notification type
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return null;
    }
  };

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  // Set up removal timers for all notifications
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    notifications.forEach(notification => {
      const timer = handleRemove(notification.id, notification.duration);
      timers.push(timer);
    });
    
    // Clean up all timers on unmount or when notifications change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  return (
    <NotificationContainer>
      {notifications.map(notification => {
        const isExiting = exitingIds.includes(notification.id);

        return (
          <NotificationItem 
            key={notification.id} 
            type={notification.type}
            isExiting={isExiting}
          >
            <NotificationIcon>
              {renderIcon(notification.type)}
            </NotificationIcon>
            <NotificationContent>
              {notification.message}
            </NotificationContent>
            <CloseButton 
              onClick={() => {
                // Clear existing timer and remove immediately
                setExitingIds(prev => [...prev, notification.id]);
                setTimeout(() => {
                  notificationManager.removeNotification(notification.id);
                  setExitingIds(prev => prev.filter(exitId => exitId !== notification.id));
                }, 300);
              }}
              aria-label="Close notification"
            >
              <FaTimes />
            </CloseButton>
          </NotificationItem>
        );
      })}
    </NotificationContainer>
  );
};

export default GlobalNotification;
