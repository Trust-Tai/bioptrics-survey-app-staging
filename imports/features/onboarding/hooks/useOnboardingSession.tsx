import { Session } from 'meteor/session';
import { useTracker } from 'meteor/react-meteor-data';
import { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { OnboardingSteps } from '../../../api/onboardingSteps';

// Types
export interface OnboardingSubTask {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  selectors?: string[]; // CSS selectors for elements to highlight
  targetUrl?: string;
  isCompleted: boolean;
  order: number;
  completedAt?: Date;
  lastInteraction?: {
    type: string;
    timestamp: Date;
  };
}

export interface OnboardingStep {
  _id: string;
  stepNumber: number;
  title: string;
  helpText: string;
  type: string;
  targetUrl: string;
  requiredAction: string;
  isOptional: boolean;
  estimatedTimeMinutes: number;
  prerequisites: string[];
  selectors?: string[]; // CSS selectors for step-level highlights
  subTasks?: OnboardingSubTask[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useOnboardingSession = () => {
  // Initialize from localStorage on first load
  useEffect(() => {
    // Only initialize if Session values are undefined
    // Always default to false unless explicitly set to 'true' in localStorage
    try {
      const saved = localStorage.getItem('onboarding-enabled');
      const initialValue = saved === 'true';
      Session.set('onboarding-enabled', initialValue);
    } catch (error) {
      console.error('Error loading onboarding-enabled from localStorage:', error);
      Session.set('onboarding-enabled', false);
    }

    if (Session.get('onboarding-step') === undefined) {
      try {
        const saved = localStorage.getItem('onboarding-step');
        const initialValue = saved ? parseInt(saved, 10) : 1;
        Session.set('onboarding-step', initialValue);
      } catch (error) {
        console.error('Error loading onboarding-step from localStorage:', error);
        Session.set('onboarding-step', 1);
      }
    }
  }, []);

  // Use Meteor's reactive Session with debugging
  const enabled = useTracker(() => {
    const value = Session.get('onboarding-enabled') || false;
    return value;
  }, []);

  const currentStepNumber = useTracker(() => {
    const value = Session.get('onboarding-step') || 1;
    return value;
  }, []);

  // Get onboarding steps from MongoDB
  const onboardingSteps = useTracker(() => {
    const subscription = Meteor.subscribe('onboardingSteps');
    
    if (subscription.ready()) {
      const steps = OnboardingSteps.find({}, { sort: { stepNumber: 1 } }).fetch() as OnboardingStep[];
      return steps;
    }
    
    return [] as OnboardingStep[];
  }, []);

  const toggleOnboarding = () => {
    const newValue = !enabled;
    Session.set('onboarding-enabled', newValue);
    localStorage.setItem('onboarding-enabled', newValue.toString());
  };

  const nextStep = () => {
    const maxStep = Math.max(...onboardingSteps.map(step => step.stepNumber));
    if (currentStepNumber < maxStep) {
      const newStep = currentStepNumber + 1;
      Session.set('onboarding-step', newStep);
      localStorage.setItem('onboarding-step', newStep.toString());
    }
  };

  const previousStep = () => {
    if (currentStepNumber > 1) {
      const newStep = currentStepNumber - 1;
      Session.set('onboarding-step', newStep);
      localStorage.setItem('onboarding-step', newStep.toString());
    }
  };

  const goToStep = (stepNumber: number) => {
    const validStep = onboardingSteps.find(step => step.stepNumber === stepNumber);
    if (validStep) {
      Session.set('onboarding-step', stepNumber);
      localStorage.setItem('onboarding-step', stepNumber.toString());
    }
  };

  const resetOnboarding = () => {
    Session.set('onboarding-step', 1);
    localStorage.setItem('onboarding-step', '1');
  };

  const completeOnboarding = () => {
    Session.set('onboarding-enabled', false);
    Session.set('onboarding-step', 1);
    localStorage.setItem('onboarding-enabled', 'false');
    localStorage.setItem('onboarding-step', '1');
  };

  // Get current step data
  const currentStep = onboardingSteps.find(step => step.stepNumber === currentStepNumber) || null;

  return {
    // State
    enabled,
    currentStepNumber,
    currentStep,
    onboardingSteps,
    
    // Actions
    toggleOnboarding,
    nextStep,
    previousStep,
    goToStep,
    resetOnboarding,
    completeOnboarding,
    
    // Computed values
    isFirstStep: currentStepNumber === 1,
    isLastStep: onboardingSteps.length > 0 ? currentStepNumber === Math.max(...onboardingSteps.map(step => step.stepNumber)) : false,
    totalSteps: onboardingSteps.length,
    progress: onboardingSteps.length > 0 ? (currentStepNumber / onboardingSteps.length) * 100 : 0
  };
};
