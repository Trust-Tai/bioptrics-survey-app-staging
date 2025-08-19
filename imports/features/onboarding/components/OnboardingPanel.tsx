import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Session } from 'meteor/session';
import { useTracker } from 'meteor/react-meteor-data';
import { useOnboardingSession } from '../hooks/useOnboardingSession';
import { useElementHighlighter } from '../hooks/useElementHighlighter';

// Keyframes for sub-task pulsing animation
const subTaskPulse = keyframes`
  0% { 
    border-color: #007bff;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  50% { 
    border-color: #0056b3;
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
  }
  100% { 
    border-color: #007bff;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
`;

// Styled Components
const OnboardingPanelContainer = styled.div<{ collapsed: boolean }>`
  max-width: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 1px solid #e9ecef;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  margin-bottom: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
`;

const OnboardingStepCircle = styled.div`
  width: 32px;
  height: 32px;
  background: var(--color-primary, #007bff);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OnboardingContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0; /* Allow content to shrink */
`;

const OnboardingTaskTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #212529);
`;

const OnboardingSubTasksContainer = styled.div`
  width: 100%;
  order: 3; /* Ensure it appears after the main content row */
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const OnboardingSubTasksTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #495057);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
`;

const OnboardingSubTask = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive', 'isCompleted'].includes(prop),
})<{ isActive: boolean; isCompleted: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
`;

const OnboardingSubTaskContent = styled.div`
  flex: 1;
`;

const OnboardingSubTaskTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isCompleted',
})<{ isCompleted: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ isCompleted }) => isCompleted ? '#28a745' : '#495057'};
  text-decoration: ${({ isCompleted }) => isCompleted ? 'line-through' : 'none'};
`;

const OnboardingSubTaskDescription = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
`;

const OnboardingProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OnboardingProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: var(--color-background, #e9ecef);
  border-radius: 3px;
  overflow: hidden;
  max-width: 40%;
`;

const OnboardingProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'progress',
})<{ progress: number }>`
  height: 100%;
  background: var(--color-primary, #007bff);
  border-radius: 3px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const OnboardingButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-shrink: 0;
`;

const OnboardingSkipButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--color-accent, #dee2e6);
  background: var(--color-background, #f8f9fa);
  color: var(--color-secondary, #6c757d);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: var(--color-accent, #e9ecef);
    border-color: var(--color-secondary, #adb5bd);
    color: var(--color-text, #495057);
  }
`;

const OnboardingResetButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #dc3545;
  background: #ffffff;
  color: #dc3545;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #dc3545;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  }
`;

const OnboardingFollowButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: var(--color-primary, #007bff);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    filter: brightness(1.05);
  }
`;

// Component Interface
interface OnboardingPanelProps {
  collapsed: boolean;
}

// Component
export const OnboardingPanel: React.FC<OnboardingPanelProps> = ({ collapsed }) => {
  const { currentStep, nextStep, resetOnboarding, completeOnboarding, currentStepNumber, totalSteps, progress, enabled } = useOnboardingSession();
  // Helper toggle state (assume Session key 'onboarding-helper-enabled')
  const onboardingHelperEnabled = useTracker(() => Session.get('onboarding-helper-enabled') !== false, []);
  const setOnboardingHelperEnabled = (value: boolean) => {
    Session.set('onboarding-helper-enabled', value);
    localStorage.setItem('onboarding-helper-enabled', value.toString());
  };
  
  // Initialize persistent state from localStorage on first load
  React.useEffect(() => {
    if (Session.get('onboarding-show-subtasks') === undefined) {
      try {
        const saved = localStorage.getItem('onboarding-show-subtasks');
        const initialValue = saved === 'true';
        Session.set('onboarding-show-subtasks', initialValue);
      } catch (error) {
        console.error('Error loading onboarding-show-subtasks from localStorage:', error);
        Session.set('onboarding-show-subtasks', false);
      }
    }

    if (Session.get('onboarding-current-subtask-index') === undefined) {
      try {
        const saved = localStorage.getItem('onboarding-current-subtask-index');
        const initialValue = saved ? parseInt(saved, 10) : 0;
        Session.set('onboarding-current-subtask-index', initialValue);
      } catch (error) {
        console.error('Error loading onboarding-current-subtask-index from localStorage:', error);
        Session.set('onboarding-current-subtask-index', 0);
      }
    }
  }, []);

  // Persistent state from Session
  const showSubTasks = useTracker(() => Session.get('onboarding-show-subtasks') || false, []);
  const currentSubTaskIndex = useTracker(() => Session.get('onboarding-current-subtask-index') || 0, []);

  // Persistent state setters
  const setShowSubTasks = (value: boolean) => {
    Session.set('onboarding-show-subtasks', value);
    localStorage.setItem('onboarding-show-subtasks', value.toString());
  };
  const setCurrentSubTaskIndex = (value: number) => {
    Session.set('onboarding-current-subtask-index', value);
    localStorage.setItem('onboarding-current-subtask-index', value.toString());
  };

  // Reset onboarding and sub-task state
  const handleReset = () => {
    resetOnboarding();
    setShowSubTasks(false);
    setCurrentSubTaskIndex(0);
  };

  // Sub-task helpers
  const subTasks = currentStep?.subTasks || [];
  const totalSubTasks = subTasks.length;
  const hasMoreSubTasks = currentSubTaskIndex < totalSubTasks - 1;

  // Compute selectors to highlight
  const selectorsToHighlight = React.useMemo(() => {
    if (!currentStep) return [];
    if (showSubTasks && currentStep.subTasks && currentStep.subTasks.length > 0 && currentStep.subTasks[currentSubTaskIndex]?.selectors) {
      return currentStep.subTasks[currentSubTaskIndex].selectors || [];
    }
    if (showSubTasks) {
      return currentStep.selectors || [];
    }
    return [];
  }, [currentStep, showSubTasks, currentSubTaskIndex]);

  // ...existing code...

  // Highlight hook
  const { applyHighlights, clearHighlights } = useElementHighlighter({
    selectors: selectorsToHighlight,
    enabled: showSubTasks && selectorsToHighlight.length > 0
  });

  // Toggle following mode
  const handleFollow = () => setShowSubTasks(!showSubTasks);

  // Skip current step or sub-task
  const handleSkip = () => {
    if (!showSubTasks) {
      // If on last step (step 2), fully complete onboarding
      if (currentStepNumber === 2) {
        completeOnboarding();
        setShowSubTasks(false);
        setCurrentSubTaskIndex(0);
      } else {
        nextStep();
      }
    } else if (hasMoreSubTasks) {
      clearHighlights(false);
      setCurrentSubTaskIndex(currentSubTaskIndex + 1);
    } else {
      // If on last step (step 2), fully complete onboarding
      if (currentStepNumber === 2) {
        clearHighlights(false);
        setShowSubTasks(false);
        setCurrentSubTaskIndex(0);
        completeOnboarding();
      } else {
        clearHighlights(false);
        setCurrentSubTaskIndex(0);
        nextStep();
      }
    }
  };

  // Reset sub-task index if out of bounds when step changes
  React.useEffect(() => {
    const subTasks = currentStep?.subTasks || [];
    if (currentSubTaskIndex >= subTasks.length && subTasks.length > 0) {
      setCurrentSubTaskIndex(0);
    }
  }, [currentStepNumber, currentStep?.subTasks?.length]);

  // Highlight application with retry for late DOM
  const highlightAppliedRef = React.useRef(false);
  React.useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 150;
    const initialDelay = 100;
    highlightAppliedRef.current = false;
    function tryHighlight() {
      if (!showSubTasks || selectorsToHighlight.length === 0) return;
      if (cancelled || highlightAppliedRef.current) return;
      const found = selectorsToHighlight.some((selector) => document.querySelector(selector));
      if (found) {
        applyHighlights();
        highlightAppliedRef.current = true;
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryHighlight, delay);
      }
    }
    setTimeout(tryHighlight, initialDelay);
    return () => { cancelled = true; };
  }, [currentSubTaskIndex, showSubTasks, selectorsToHighlight, applyHighlights]);

  // Step 3: Attach real event handler to highlighted elements for onboarding progression
  React.useEffect(() => {
    if (!showSubTasks || selectorsToHighlight.length === 0) return;

    // Find all elements matching the selectors
    const elements: HTMLElement[] = selectorsToHighlight
      .map((selector: string) => Array.from(document.querySelectorAll(selector)))
      .flat()
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    // Handler to progress onboarding when user interacts with highlighted element
    const onboardingListener = (event: Event) => {
      // Progress onboarding: advance to next sub-task or step
      if (hasMoreSubTasks) {
        clearHighlights(false);
        setCurrentSubTaskIndex(currentSubTaskIndex + 1);
      } else {
        // If on last step (step 2), fully complete onboarding
        if (currentStepNumber === 2) {
          clearHighlights(false);
          setShowSubTasks(false);
          setCurrentSubTaskIndex(0);
          completeOnboarding();
        } else {
          clearHighlights(false);
          setCurrentSubTaskIndex(0);
          nextStep();
        }
      }
      // Let the default action occur (navigation, etc.)
    };
    elements.forEach((el) => {
      el.addEventListener('click', onboardingListener);
    });

    // Cleanup: remove listeners
    return () => {
      elements.forEach((el) => {
        el.removeEventListener('click', onboardingListener);
      });
    };
  }, [showSubTasks, selectorsToHighlight.join(','), hasMoreSubTasks, currentSubTaskIndex, clearHighlights, setCurrentSubTaskIndex, setShowSubTasks, nextStep]);

  if (!currentStep) {
    // Show a fallback if no step is loaded yet
    return (
      <OnboardingPanelContainer collapsed={collapsed}>
        <OnboardingStepCircle>1</OnboardingStepCircle>
        <OnboardingContent>
          <OnboardingTaskTitle>Getting Started</OnboardingTaskTitle>
          <OnboardingProgressContainer>
            <OnboardingProgressBar>
              <OnboardingProgressFill progress={0} />
            </OnboardingProgressBar>
          </OnboardingProgressContainer>
        </OnboardingContent>
        <OnboardingButtonsContainer>
          <OnboardingResetButton onClick={handleReset}>
            Reset
          </OnboardingResetButton>
          <OnboardingSkipButton>Skip</OnboardingSkipButton>
          <OnboardingFollowButton>Follow</OnboardingFollowButton>
        </OnboardingButtonsContainer>
      </OnboardingPanelContainer>
    );
  }

  if (!enabled) return null;

  return (
    <OnboardingPanelContainer collapsed={collapsed}>
      <OnboardingStepCircle>{currentStepNumber}</OnboardingStepCircle>
      <OnboardingContent>
        <OnboardingTaskTitle>{currentStep.title}</OnboardingTaskTitle>
        
        <OnboardingProgressContainer>
          <OnboardingProgressBar>
            <OnboardingProgressFill progress={progress} />
          </OnboardingProgressBar>
        </OnboardingProgressContainer>
      </OnboardingContent>
      
      <OnboardingButtonsContainer>
        <OnboardingResetButton onClick={handleReset}>
          Reset
        </OnboardingResetButton>
        <OnboardingSkipButton onClick={handleSkip}>
          {!showSubTasks ? 'Skip Step' : hasMoreSubTasks ? 'Skip Task' : 'Skip to Next'}
        </OnboardingSkipButton>
        <OnboardingFollowButton onClick={handleFollow}>
          {!showSubTasks ? 'Follow' : 'Hide'}
        </OnboardingFollowButton>
      </OnboardingButtonsContainer>

      {/* Sub-tasks Display - Show only the current sub-task - spans full width */}
      {showSubTasks && (
        <OnboardingSubTasksContainer>
          {subTasks.length > 0 ? (
            <>
              <OnboardingSubTasksTitle>
                Task {currentSubTaskIndex + 1} of {totalSubTasks}
              </OnboardingSubTasksTitle>
              
              {/* Show only the current sub-task */}
              {subTasks[currentSubTaskIndex] && (
                <OnboardingSubTask
                  isActive={true}
                  isCompleted={false}
                >
                  <OnboardingSubTaskContent>
                    <OnboardingSubTaskTitle isCompleted={false}>
                      {subTasks[currentSubTaskIndex].title}
                    </OnboardingSubTaskTitle>
                    <OnboardingSubTaskDescription>
                      {subTasks[currentSubTaskIndex].description}
                    </OnboardingSubTaskDescription>
                  </OnboardingSubTaskContent>
                </OnboardingSubTask>
              )}
            </>
          ) : (
            <>
              <OnboardingSubTasksTitle>
                Following Mode Active
              </OnboardingSubTasksTitle>
              <OnboardingSubTask
                isActive={true}
                isCompleted={false}
              >
                <OnboardingSubTaskContent>
                  <OnboardingSubTaskTitle isCompleted={false}>
                    {currentStep.title}
                  </OnboardingSubTaskTitle>
                  <OnboardingSubTaskDescription>
                    This step doesn't have detailed sub-tasks, but following mode is active. You can navigate to other pages and the following will remain enabled.
                  </OnboardingSubTaskDescription>
                </OnboardingSubTaskContent>
              </OnboardingSubTask>
            </>
          )}
        </OnboardingSubTasksContainer>
      )}
    </OnboardingPanelContainer>
  );
};
