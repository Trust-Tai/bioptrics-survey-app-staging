import React, { useState } from 'react';
import styled from 'styled-components';
import { FiClipboard, FiBook, FiChevronDown } from 'react-icons/fi';
import { ModuleRegistry } from '../core/module-registry/ModuleRegistry';
import LMSComingSoon from '../modules/lms/pages/LMSComingSoon';

const NavigationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
`;

const ModuleButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const MenuItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

const ModuleIcon = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleName = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
`;

const ModuleStatus = styled.div<{ enabled: boolean }>`
  font-size: 12px;
  color: ${props => props.enabled ? '#48bb78' : '#ed8936'};
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10001;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const ModuleNavigation: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLMSModalOpen, setIsLMSModalOpen] = useState(false);
  const modules = ModuleRegistry.getAllModules();

  const handleModuleClick = (moduleId: string) => {
    if (moduleId === 'lms') {
      setIsLMSModalOpen(true);
    }
    setIsDropdownOpen(false);
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'survey':
        return <FiClipboard />;
      case 'lms':
        return <FiBook />;
      default:
        return <div>{moduleId.charAt(0).toUpperCase()}</div>;
    }
  };

  const getModuleColor = (moduleId: string) => {
    switch (moduleId) {
      case 'survey':
        return '#667eea';
      case 'lms':
        return '#764ba2';
      default:
        return '#718096';
    }
  };

  return (
    <>
      <NavigationContainer>
        <ModuleButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <span>Modules</span>
          <FiChevronDown style={{ 
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }} />
        </ModuleButton>

        <DropdownMenu isOpen={isDropdownOpen}>
          {modules.map(module => (
            <MenuItem 
              key={module.id} 
              onClick={() => handleModuleClick(module.id)}
            >
              <ModuleIcon color={getModuleColor(module.id)}>
                {getModuleIcon(module.id)}
              </ModuleIcon>
              <ModuleInfo>
                <ModuleName>{module.name}</ModuleName>
                <ModuleStatus enabled={module.enabled}>
                  {module.id === 'lms' ? 'Coming Soon' : 'Active'}
                </ModuleStatus>
              </ModuleInfo>
            </MenuItem>
          ))}
        </DropdownMenu>
      </NavigationContainer>

      <Modal isOpen={isLMSModalOpen}>
        <ModalContent>
          <CloseButton onClick={() => setIsLMSModalOpen(false)}>
            ×
          </CloseButton>
          <LMSComingSoon />
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModuleNavigation;
