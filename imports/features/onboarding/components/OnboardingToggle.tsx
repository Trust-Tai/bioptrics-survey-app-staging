import React from 'react';
import styled from 'styled-components';
import { useOnboardingSession } from '../hooks/useOnboardingSession';

// Styled Components
const OnboardingToggleContainer = styled.div<{ collapsed: boolean }>`
  display: none;
  // display: flex; // Uncomment to make the toggle visible
  position: relative;
  margin-top: 20px;
  padding: 0 16px;
  align-items: center;
  justify-content: ${({ collapsed }) => (collapsed ? 'center' : 'flex-start')};
`;

const StyledOnboardingToggle = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  width: ${({ collapsed }) => (collapsed ? 'auto' : '100%')};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ToggleSwitch = styled.div<{ active: boolean }>`
  width: 44px;
  height: 24px;
  background: ${({ active }) => (active ? 'var(--color-primary, #007bff)' : '#ccc')};
  border-radius: 12px;
  position: relative;
  transition: background 0.3s;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${({ active }) => (active ? '22px' : '2px')};
    transition: left 0.3s;
  }
`;

const ToggleLabel = styled.span<{ collapsed: boolean }>`
  color: var(--color-sidebar-text);
  font-size: 14px;
  font-weight: 500;
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
`;

// Component Interface
interface OnboardingToggleProps {
  collapsed: boolean;
}

// Component
export const OnboardingToggle: React.FC<OnboardingToggleProps> = ({ collapsed }) => {
  const { enabled, toggleOnboarding } = useOnboardingSession();

  return (
    <OnboardingToggleContainer collapsed={collapsed}>
      <StyledOnboardingToggle collapsed={collapsed} onClick={toggleOnboarding}>
        <ToggleSwitch active={enabled} />
        <ToggleLabel collapsed={collapsed}>
          Onboarding Helper
        </ToggleLabel>
      </StyledOnboardingToggle>
    </OnboardingToggleContainer>
  );
};
