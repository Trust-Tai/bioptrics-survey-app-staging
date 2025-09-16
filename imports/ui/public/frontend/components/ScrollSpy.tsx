import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface ScrollSpyProps {
  sections: Array<{
    id: string;
    name: string;
  }>;
  offset?: number;
  color?: string;
}

const ScrollSpy: React.FC<ScrollSpyProps> = ({
  sections,
  offset = 100,
  color = '#552A47'
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;
      
      // Find the current section based on scroll position
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(`section-${section.id}`);
        
        if (element) {
          const { top } = element.getBoundingClientRect();
          if (top <= offset) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, offset]);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - offset + 10,
        behavior: 'smooth'
      });
    }
  };
  
  // return (
  //   <NavContainer>
  //     {sections.map(section => (
  //       <NavItem 
  //         key={section.id}
  //         isActive={activeSection === section.id}
  //         onClick={() => scrollToSection(section.id)}
  //         color={color}
  //       >
  //         {section.name}
  //       </NavItem>
  //     ))}
  //   </NavContainer>
  // );
};

// Styled components
const NavContainer = styled.div`
  display: flex;
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

export default ScrollSpy;
