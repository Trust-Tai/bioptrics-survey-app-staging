import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Onboarding Steps Collection
export const OnboardingSteps = new Mongo.Collection('onboardingSteps');

// Publication
if (Meteor.isServer) {
  Meteor.publish('onboardingSteps', function () {
    return OnboardingSteps.find({});
  });
}

// Seed onboarding steps
export const seedOnboardingSteps = async () => {
  const onboardingStepsCount = await OnboardingSteps.find().countAsync();
  console.log(`Found ${onboardingStepsCount} onboarding steps`);
  
  if (onboardingStepsCount === 0) {
    const defaultSteps = [
      {
        stepNumber: 1,
        title: "Getting Started: Set Up Organization Details",
        type: "form",
        targetUrl: "/admin/org-setup",
        requiredAction: "organization.setup",
        isOptional: false,
        estimatedTimeMinutes: 5,
        prerequisites: [],
        helpText: "Add your organization name, logo, and basic settings to personalize your account",
        subTasks: [
          {
            id: "navigate-org-setup",
            title: "Navigate to Organization Setup",
            description: "Click on the Organization Setup link in the sidebar",
            targetSelector: "[data-nav='org-setup']",
            selectors: ["a[href='/admin/org-setup']"],
            targetUrl: "/admin/org-setup",
            isCompleted: false,
            order: 1
          },
          {
            id: "click-branding-tab",
            title: "Open Branding Tab",
            description: "Click on the Branding tab to customize your organization's appearance",
            targetSelector: "[data-tab='branding']",
            selectors: ["a[href='/admin/org-setup/branding']"],
            isCompleted: false,
            order: 2
          },
          {
            id: "open-branding-settings",
            title: "Open Branding Settings",
            description: "Click on the Branding button to access branding settings",
            targetSelector: "[data-field='logo-upload']",
            selectors: ["#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div > div > div:nth-child(1) > button:nth-child(3)"],
            isCompleted: false,
            order: 3
          },
          {
            id: "provide-organization-details",
            title: "Provide Organization Details",
            description: "Enter organization details and click Save Settings",
            targetSelector: "[data-field='org-name']",
            selectors: ["#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div > div > div:nth-child(2) > form > div:nth-child(2) > button"],
            isCompleted: false,
            order: 4
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        stepNumber: 2,
        title: "Getting Started: Create Your First Survey",
        type: "action",
        targetUrl: "/admin/surveys/new",
        requiredAction: "survey.create",
        isOptional: false,
        estimatedTimeMinutes: 10,
        prerequisites: [],
        helpText: "Click 'Create Survey' to get started with building your first survey",
        subTasks: [
          {
            id: "navigate-surveys",
            title: "Navigate to Surveys Page",
            description: "Click on the Surveys link in the sidebar",
            targetSelector: "[data-nav='surveys']",
            selectors: ["a[href='/admin/surveys/all']"],
            targetUrl: "/admin/surveys/all",
            isCompleted: false,
            order: 1
          },
          {
            id: "click-add-survey",
            title: "Add New Survey",
            description: "Click the 'Add Survey' button to start creating a new survey.",
            targetSelector: "#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div > div.sc-kmEFuU.dFLyNx > button",
            selectors: ["#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div > div.sc-kmEFuU.dFLyNx > button"],
            targetUrl: "/admin/surveys/new",
            isCompleted: false,
            order: 2
          },
          {
            id: "save-survey",
            title: "Save Survey",
            description: "Fill out all survey details, then click the Save button to save your changes.",
            targetSelector: "#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div.survey-builder-container > div.survey-builder-header > div.survey-builder-actions > button",
            selectors: ["#react-target > div:nth-child(1) > div > main > div.sc-ePASVD.fPIJmP > div.survey-builder-container > div.survey-builder-header > div.survey-builder-actions > button"],
            isCompleted: false,
            order: 3
          },
          {
            id: "view-new-survey",
            title: "View Your New Survey",
            description: "Navigate to the Surveys page to view your newly created survey.",
            targetSelector: "[data-nav='surveys']",
            selectors: ["a[href='/admin/surveys/all']"],
            targetUrl: "/admin/surveys/all",
            isCompleted: false,
            order: 4
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        stepNumber: 3,
        title: "Getting Started: Add Questions to Your Survey",
        type: "action",
        targetUrl: "/admin/surveys/:surveyId/questions",
        requiredAction: "question.add",
        isOptional: false,
        estimatedTimeMinutes: 10,
        prerequisites: [],
        helpText: "Add at least 3 questions to make your survey engaging and useful",
        subTasks: [
          {
            id: "navigate-questions",
            title: "Navigate to Questions Tab",
            description: "Click on the Questions tab in your survey builder",
            targetSelector: "[data-tab='questions']",
            selectors: [],
            isCompleted: false,
            order: 1
          },
          {
            id: "add-first-question",
            title: "Add First Question",
            description: "Click 'Add Question' to create your first survey question",
            targetSelector: "[data-action='add-question']",
            selectors: [],
            isCompleted: false,
            order: 2
          },
          {
            id: "set-question-type",
            title: "Choose Question Type",
            description: "Select an appropriate question type (multiple choice, text, rating, etc.)",
            targetSelector: "[data-field='question-type']",
            selectors: [],
            isCompleted: false,
            order: 3
          },
          {
            id: "write-question-text",
            title: "Write Question Text",
            description: "Enter the question text that participants will see",
            targetSelector: "[data-field='question-text']",
            selectors: [],
            isCompleted: false,
            order: 4
          },
          {
            id: "add-answer-options",
            title: "Add Answer Options",
            description: "Add answer choices for multiple choice questions",
            targetSelector: "[data-field='answer-options']",
            selectors: [],
            isCompleted: false,
            order: 5
          },
          {
            id: "save-question",
            title: "Save Question",
            description: "Click Save to add the question to your survey",
            targetSelector: "[data-action='save-question']",
            selectors: [],
            isCompleted: false,
            order: 6
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      for (const step of defaultSteps) {
        await OnboardingSteps.insertAsync(step);
      }
    } catch (error) {
      console.error('Error seeding onboarding steps:', error);
    }
  }
};

// Backend methods for sub-task management
if (Meteor.isServer) {
  Meteor.methods({
    // Complete a specific sub-task
    async 'onboarding.completeSubTask'(stepNumber, subTaskId) {
      check(stepNumber, Number);
      check(subTaskId, String);
      
      try {
        const result = await OnboardingSteps.updateAsync(
          { 
            stepNumber: stepNumber,
            'subTasks.id': subTaskId 
          },
          { 
            $set: { 
              'subTasks.$.isCompleted': true,
              'subTasks.$.completedAt': new Date()
            } 
          }
        );
        
        console.log(`Sub-task ${subTaskId} completed for step ${stepNumber}`);
        return result;
      } catch (error) {
        console.error('Error completing sub-task:', error);
        throw new Meteor.Error('sub-task-completion-failed', 'Failed to complete sub-task');
      }
    },

    // Reset a specific sub-task
    async 'onboarding.resetSubTask'(stepNumber, subTaskId) {
      check(stepNumber, Number);
      check(subTaskId, String);
      
      try {
        const result = await OnboardingSteps.updateAsync(
          { 
            stepNumber: stepNumber,
            'subTasks.id': subTaskId 
          },
          { 
            $set: { 'subTasks.$.isCompleted': false },
            $unset: { 'subTasks.$.completedAt': '' }
          }
        );
        
        console.log(`Sub-task ${subTaskId} reset for step ${stepNumber}`);
        return result;
      } catch (error) {
        console.error('Error resetting sub-task:', error);
        throw new Meteor.Error('sub-task-reset-failed', 'Failed to reset sub-task');
      }
    },

    // Reset all sub-tasks for a specific step
    async 'onboarding.resetStepSubTasks'(stepNumber) {
      check(stepNumber, Number);
      
      try {
        const result = await OnboardingSteps.updateAsync(
          { stepNumber: stepNumber },
          { 
            $set: { 'subTasks.$[].isCompleted': false },
            $unset: { 'subTasks.$[].completedAt': '' }
          }
        );
        
        console.log(`All sub-tasks reset for step ${stepNumber}`);
        return result;
      } catch (error) {
        console.error('Error resetting step sub-tasks:', error);
        throw new Meteor.Error('step-reset-failed', 'Failed to reset step sub-tasks');
      }
    },

    // Get sub-task completion status for a step
    async 'onboarding.getStepProgress'(stepNumber) {
      check(stepNumber, Number);
      
      try {
        const step = await OnboardingSteps.findOneAsync({ stepNumber: stepNumber });
        
        if (!step || !step.subTasks) {
          return { totalSubTasks: 0, completedSubTasks: 0, progress: 0 };
        }
        
        const totalSubTasks = step.subTasks.length;
        const completedSubTasks = step.subTasks.filter(task => task.isCompleted).length;
        const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;
        
        return {
          totalSubTasks,
          completedSubTasks,
          progress: Math.round(progress),
          subTasks: step.subTasks
        };
      } catch (error) {
        console.error('Error getting step progress:', error);
        throw new Meteor.Error('progress-fetch-failed', 'Failed to get step progress');
      }
    },

    // Reset all onboarding data (including sub-tasks)
    async 'onboarding.forceReset'() {
      try {
        console.log('Clearing onboarding steps...');
        await OnboardingSteps.removeAsync({});
        console.log('Re-seeding onboarding steps...');
        return await seedOnboardingSteps();
      } catch (error) {
        console.error('Error resetting onboarding:', error);
        throw new Meteor.Error('onboarding-reset-failed', 'Failed to reset onboarding data');
      }
    },

    // Mark sub-task as viewed/interacted with (for tracking user engagement)
    async 'onboarding.trackSubTaskInteraction'(stepNumber, subTaskId, interactionType = 'viewed') {
      check(stepNumber, Number);
      check(subTaskId, String);
      check(interactionType, String);
      
      try {
        const result = await OnboardingSteps.updateAsync(
          { 
            stepNumber: stepNumber,
            'subTasks.id': subTaskId 
          },
          { 
            $set: { 
              [`subTasks.$.lastInteraction`]: {
                type: interactionType,
                timestamp: new Date()
              }
            }
          }
        );
        
        return result;
      } catch (error) {
        console.error('Error tracking sub-task interaction:', error);
        // Don't throw error for tracking failures
        return false;
      }
    }
  });
}
