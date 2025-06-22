import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SurveyResponses } from './surveyResponses';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';

// Define the interface for device usage data
export interface DeviceUsageData {
  deviceType: string;
  count: number;
  percentage: number;
}

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Get device usage data for analytics dashboard
     * Aggregates data from both completed and incomplete survey responses
     * @returns Array of device usage data with counts and percentages
     */
    async 'getDeviceUsageData'() {
      // Check if user is authenticated
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to access this data');
      }

      console.log('Getting device usage data...');
      
      try {
        // Get all completed survey responses
        const completedResponses = await SurveyResponses.find({}).fetchAsync();
        
        console.log('Checking completed responses:', completedResponses.length);
        // Log a few responses to debug
        if (completedResponses.length > 0) {
          console.log('Sample completed response metadata:', completedResponses[0].metadata);
        }
        
        // Get all incomplete survey responses that aren't abandoned
        const incompleteResponses = await IncompleteSurveyResponses.find({
          isCompleted: false,
          isAbandoned: { $exists: false }
        }).fetchAsync();
        
        console.log(`Found ${completedResponses.length} completed responses and ${incompleteResponses.length} incomplete responses with device data`);
        
        // Count device types from completed responses
        const deviceCounts: Record<string, number> = {
          desktop: 0,
          tablet: 0,
          mobile: 0
        };
        
        // Process completed responses
        completedResponses.forEach(response => {
          // Get device type from metadata, defaulting to desktop if not found
          const deviceType = response.metadata?.deviceType;
          if (deviceType && (deviceType === 'desktop' || deviceType === 'tablet' || deviceType === 'mobile')) {
            deviceCounts[deviceType]++;
          } else {
            // Default to desktop if not specified
            deviceCounts.desktop++;
          }
        });
        
        // Process incomplete responses
        incompleteResponses.forEach(response => {
          const deviceType = response.deviceType || 'desktop';
          if (deviceType === 'desktop' || deviceType === 'tablet' || deviceType === 'mobile') {
            deviceCounts[deviceType]++;
          } else {
            // Default to desktop for any unrecognized device types
            deviceCounts.desktop++;
          }
        });
        
        // Calculate total responses
        const totalResponses = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);
        
        // Format the data for the chart
        const result: DeviceUsageData[] = Object.entries(deviceCounts).map(([deviceType, count]) => ({
          deviceType,
          count,
          percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
        }));
        
        console.log('Device usage data:', result);
        
        return result;
      } catch (error) {
        console.error('Error getting device usage data:', error);
        throw new Meteor.Error('internal-error', 'Failed to get device usage data');
      }
    }
  });
}
