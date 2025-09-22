import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

interface ScrollSpyProps {
  sections: Array<{
    id: string;
    name: string;
  }>;
  offset?: number;
  color?: string;
  onActiveSectionChange?: (sectionId: string) => void;
}

const ScrollSpy: React.FC<ScrollSpyProps> = ({
  sections,
  offset = 100,
  color = '#552A47',
  onActiveSectionChange
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Use ref to store the latest activeSection value without triggering re-renders
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;
  
  // Store onActiveSectionChange in a ref to avoid dependency changes
  const onActiveSectionChangeRef = useRef(onActiveSectionChange);
  useEffect(() => {
    onActiveSectionChangeRef.current = onActiveSectionChange;
  }, [onActiveSectionChange]);
  
  // Memoize the scroll handler to prevent recreating it on every render
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + offset;
    
    // Find the current section based on scroll position
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const element = document.getElementById(`section-${section.id}`);
      
      if (element) {
        const { top } = element.getBoundingClientRect();
        if (top <= offset && activeSectionRef.current !== section.id) {
          setActiveSection(section.id);
          // Notify parent component about the active section change
          if (onActiveSectionChangeRef.current) {
            onActiveSectionChangeRef.current(section.id);
          }
          break;
        }
      }
    }
  }, [sections, offset]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - offset + 10,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <NavContainer>
      {sections.map(section => (
        <NavItem 
          key={section.id}
          isActive={activeSection === section.id}
          onClick={() => scrollToSection(section.id)}
          color={color}
        >
          {section.name}
        </NavItem>
      ))}
    </NavContainer>
  );
};

// Styled components
const NavContainer = styled.div`
  display: none;
  gap: 1rem;
  padding: 1rem 0;
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
`;

const NavItem = styled.button<{ isActive: boolean; color: string }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background-color: ${props => props.isActive ? props.color : '#f3f4f6'};
  color: ${props => props.isActive ? 'white' : '#4b5563'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? props.color : '#e5e7eb'};
  }
`;

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(ScrollSpy);
