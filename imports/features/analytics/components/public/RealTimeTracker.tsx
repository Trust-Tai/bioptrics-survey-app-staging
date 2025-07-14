import React, { useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useLocation, useParams } from 'react-router-dom';
import { RealTimeEvent } from '../../api/realTimeTracker';

interface RealTimeTrackerProps {
  surveyId: string;
  respondentId: string;
  currentQuestionId?: string;
  currentSectionId?: string;
}

/**
 * Invisible component that tracks user activity on the public survey
 * and sends events to the server for real-time analytics
 */
export const RealTimeTracker: React.FC<RealTimeTrackerProps> = ({
  surveyId,
  respondentId,
  currentQuestionId,
  currentSectionId
}) => {
  const location = useLocation();
  const lastActivityRef = useRef<Date>(new Date());
  const startTimeRef = useRef<Date>(new Date());
  const lastQuestionIdRef = useRef<string | undefined>(currentQuestionId);
  const lastSectionIdRef = useRef<string | undefined>(currentSectionId);
  const isActiveRef = useRef<boolean>(true);
  const activityIntervalRef = useRef<number | null>(null);
  
  // Get device and browser information
  const deviceInfo = useTracker(() => {
    const userAgent = navigator.userAgent;
    
    // Determine device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const deviceType = isTablet ? 'Tablet' : (isMobile ? 'Mobile' : 'Desktop');
    
    // Determine browser
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
    else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) browser = 'Internet Explorer';
    
    // Determine OS
    let os = 'Unknown';
    if (userAgent.indexOf('Windows') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'MacOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (userAgent.indexOf('iOS') !== -1) os = 'iOS';
    
    return {
      type: deviceType,
      browser,
      os
    };
  }, []);
  
  // Track page view on mount
  useEffect(() => {
    // Track initial page view
    trackEvent('pageView');
    
    // Track survey start
    trackEvent('surveyStart');
    
    // Set up activity tracking
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);
    
    // Set up visibility change tracking
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up interval to check for inactivity
    activityIntervalRef.current = window.setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
      
      // If inactive for more than 2 minutes, consider as dropout
      if (timeSinceLastActivity > 2 * 60 * 1000 && isActiveRef.current) {
        isActiveRef.current = false;
        trackEvent('surveyDropout');
      }
    }, 30000); // Check every 30 seconds
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
      
      // Track survey dropout if they leave without completing
      if (isActiveRef.current) {
        trackEvent('surveyDropout');
      }
    };
  }, []);
  
  // Track question changes
  useEffect(() => {
    if (currentQuestionId && currentQuestionId !== lastQuestionIdRef.current) {
      // If there was a previous question, track time spent on it
      if (lastQuestionIdRef.current) {
        const timeSpent = new Date().getTime() - lastActivityRef.current.getTime();
        
        trackEvent('questionAnswer', {
          questionId: lastQuestionIdRef.current,
          timeSpent
        });
      }
      
      // Update refs
      lastQuestionIdRef.current = currentQuestionId;
      lastActivityRef.current = new Date();
    }
  }, [currentQuestionId]);
  
  // Track section changes
  useEffect(() => {
    if (currentSectionId && currentSectionId !== lastSectionIdRef.current) {
      // If there was a previous section, track completion
      if (lastSectionIdRef.current) {
        trackEvent('sectionComplete', {
          sectionId: lastSectionIdRef.current
        });
      }
      
      // Update refs
      lastSectionIdRef.current = currentSectionId;
    }
  }, [currentSectionId]);
  
  // Track location changes
  useEffect(() => {
    trackEvent('pageView');
  }, [location.pathname]);
  
  // Helper function to update activity timestamp
  const updateActivity = () => {
    lastActivityRef.current = new Date();
    
    // If previously marked as inactive, mark as active again
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      trackEvent('pageView'); // Track as a new page view when they return
    }
  };
  
  // Handle visibility change (tab switching)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      updateActivity();
    }
  };
  
  // Helper function to track events
  const trackEvent = (
    eventType: RealTimeEvent['eventType'], 
    additionalData: Partial<RealTimeEvent> = {}
  ) => {
    try {
      const event: Omit<RealTimeEvent, '_id'> = {
        surveyId,
        respondentId,
        eventType,
        timestamp: new Date(),
        device: deviceInfo,
        ...additionalData
      };
      
      // If it's a survey complete event, calculate total time spent
      if (eventType === 'surveyComplete') {
        event.timeSpent = new Date().getTime() - startTimeRef.current.getTime();
      }
      
      // Add current question and section if available
      if (currentQuestionId && !event.questionId) {
        event.questionId = currentQuestionId;
      }
      
      if (currentSectionId && !event.sectionId) {
        event.sectionId = currentSectionId;
      }
      
      // Send to server
      Meteor.call('realTimeAnalytics.trackEvent', event, (error: any) => {
        if (error) {
          console.error('Error tracking real-time event:', error);
        }
      });
    } catch (error) {
      console.error('Error tracking real-time event:', error);
    }
  };
  
  // This component doesn't render anything
  return null;
};

export default RealTimeTracker;
