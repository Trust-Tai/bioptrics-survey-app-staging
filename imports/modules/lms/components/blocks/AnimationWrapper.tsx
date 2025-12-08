import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { AnimationSettings } from '../../types/contentBlocks';

interface AnimationWrapperProps {
  children: React.ReactNode;
  animation?: AnimationSettings;
  isEditing?: boolean;
}

// Define all keyframe animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const zoomOut = keyframes`
  from {
    opacity: 0;
    transform: scale(1.2);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(50px);
  }
  to {
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
`;

const slideLeft = keyframes`
  from {
    transform: translateX(-50px);
  }
  to {
    transform: translateX(0);
  }
`;

const slideRight = keyframes`
  from {
    transform: translateX(50px);
  }
  to {
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-20px);
  }
  70% {
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(0);
  }
  90% {
    transform: translateY(-4px);
  }
`;

const flip = keyframes`
  from {
    opacity: 0;
    transform: perspective(400px) rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateY(0deg);
  }
`;

const rotate = keyframes`
  from {
    opacity: 0;
    transform: rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: rotate(0deg);
  }
`;

// Map animation types to keyframes
const animationMap = {
  'none': null,
  'fade-in': fadeIn,
  'fade-in-up': fadeInUp,
  'fade-in-down': fadeInDown,
  'fade-in-left': fadeInLeft,
  'fade-in-right': fadeInRight,
  'zoom-in': zoomIn,
  'zoom-out': zoomOut,
  'slide-up': slideUp,
  'slide-down': slideDown,
  'slide-left': slideLeft,
  'slide-right': slideRight,
  'bounce': bounce,
  'flip': flip,
  'rotate': rotate,
};

interface AnimatedContainerProps {
  $isVisible: boolean;
  $animationType: string;
  $duration: number;
  $delay: number;
  $easing: string;
  $trigger: string;
  $isHoverTrigger: boolean;
}

const AnimatedContainer = styled.div<AnimatedContainerProps>`
  ${props => {
    // If no animation or none type, just show content
    if (props.$animationType === 'none') {
      return css`opacity: 1;`;
    }

    const animation = animationMap[props.$animationType as keyof typeof animationMap];
    
    // Handle hover trigger
    if (props.$isHoverTrigger) {
      return css`
        opacity: 1;
        transition: transform ${props.$duration}s ${props.$easing};
        
        &:hover {
          animation: ${animation} ${props.$duration}s ${props.$easing} forwards;
        }
      `;
    }

    // For on-load and on-scroll triggers
    if (!props.$isVisible) {
      return css`
        opacity: 0;
      `;
    }

    return css`
      animation: ${animation} ${props.$duration}s ${props.$easing} ${props.$delay}s both;
    `;
  }}
`;

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({ 
  children, 
  animation,
  isEditing = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevSettingsRef = useRef<string>('');

  // Default animation settings
  const defaultAnimation: AnimationSettings = {
    enabled: false,
    type: 'none',
    duration: 0.5,
    delay: 0,
    trigger: 'on-scroll',
    easing: 'ease',
  };

  const settings = animation || defaultAnimation;
  
  // Enable animations in both editing and viewing modes
  const shouldAnimate = settings.enabled && settings.type !== 'none';

  // Serialize current settings for comparison
  const currentSettingsString = JSON.stringify({
    enabled: settings.enabled,
    type: settings.type,
    duration: settings.duration,
    delay: settings.delay,
    trigger: settings.trigger,
    easing: settings.easing,
  });

  // Auto re-trigger animation when settings change
  useEffect(() => {
    if (prevSettingsRef.current && prevSettingsRef.current !== currentSettingsString) {
      // Settings changed - reset and replay animation
      setIsVisible(false);
      
      // Brief delay to allow CSS to reset
      const resetTimer = setTimeout(() => {
        if (shouldAnimate) {
          if (settings.trigger === 'on-load' || settings.trigger === 'on-scroll') {
            setIsVisible(true);
          }
          setAnimationKey(prev => prev + 1);
        }
      }, 50);
      
      return () => clearTimeout(resetTimer);
    }
    prevSettingsRef.current = currentSettingsString;
  }, [currentSettingsString, shouldAnimate, settings.trigger]);

  // Handle on-load trigger - initial mount and when trigger changes to on-load
  useEffect(() => {
    if (!shouldAnimate) return;
    if (settings.trigger === 'on-load') {
      // Small delay to ensure animation plays
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [settings.trigger, shouldAnimate, animationKey]);

  // Handle on-scroll trigger with Intersection Observer
  useEffect(() => {
    if (!shouldAnimate) return;
    if (settings.trigger !== 'on-scroll') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is in view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [settings.trigger, shouldAnimate, animationKey]);

  // If not animating, render children directly
  if (!shouldAnimate) {
    return <div style={{ width: '100%' }}>{children}</div>;
  }

  return (
    <AnimatedContainer
      ref={ref}
      key={animationKey}
      $isVisible={isVisible || settings.trigger === 'on-hover'}
      $animationType={settings.type}
      $duration={settings.duration}
      $delay={settings.delay}
      $easing={settings.easing || 'ease'}
      $trigger={settings.trigger}
      $isHoverTrigger={settings.trigger === 'on-hover'}
    >
      {children}
    </AnimatedContainer>
  );
};

export default AnimationWrapper;
