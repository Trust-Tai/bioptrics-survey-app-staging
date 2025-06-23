import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { getCurrentDeviceType } from '../../../utils/deviceDetection';

/**
 * DeviceTracker component
 * 
 * This component silently tracks device information when a user loads a survey.
 * It doesn't render anything visible but captures device type information
 * and stores it for analytics purposes.
 */
interface DeviceTrackerProps {
  surveyId: string;
  respondentId: string;
}

const DeviceTracker: React.FC<DeviceTrackerProps> = ({ surveyId, respondentId }) => {
  useEffect(() => {
    // Only run once when the component mounts
    const deviceType = getCurrentDeviceType();
    console.log(`[DeviceTracker] Detected device type: ${deviceType} for survey ${surveyId}`);
    
    // Track the device type when starting a survey
    Meteor.call(
      'incompleteSurveyResponses.start', 
      surveyId, 
      respondentId, 
      deviceType,
      (error: Error | null, result: string) => {
        if (error) {
          console.error('[DeviceTracker] Error tracking device:', error);
        } else {
          console.log(`[DeviceTracker] Successfully tracked device for response ID: ${result}`);
        }
      }
    );
  }, [surveyId, respondentId]);

  // This component doesn't render anything visible
  return null;
};

export default DeviceTracker;
