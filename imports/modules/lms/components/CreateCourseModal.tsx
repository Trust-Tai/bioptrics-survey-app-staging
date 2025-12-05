import React from 'react';
import styled from 'styled-components';
import { PlusCircle, LayoutTemplate } from 'lucide-react';
import { Modal } from '../../../ui/components/shared/Modal';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFromScratch: () => void;
  onUseTemplate: () => void;
}

const ModalContent = styled.div`
  padding: 20px 0;
`;

const Description = styled.p`
  text-align: center;
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 15px;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const OptionCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 24px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
  
  &:hover {
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`;

const IconWrapper = styled.div<{ color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.2s ease;
  
  ${OptionCard}:hover & {
    transform: scale(1.1);
  }
`;

const OptionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  text-align: center;
`;

const OptionDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: center;
`;

const OptionFeature = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
`;

const ActionButton = styled.div`
  width: 100%;
`;

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onStartFromScratch,
  onUseTemplate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Course" size="lg">
      <ModalContent>
        <Description>Choose how you'd like to start</Description>

        <OptionsGrid>
          {/* Start from Scratch */}
          <OptionCard onClick={onStartFromScratch}>
            <IconWrapper color="rgba(249, 115, 22, 0.1)">
              <PlusCircle size={32} color="#f97316" />
            </IconWrapper>
            <OptionTitle>Start from Scratch</OptionTitle>
            <OptionDescription>
              Build your course from the ground up with complete creative freedom. Add blocks,
              customize layouts, and create exactly what you envision.
            </OptionDescription>
            <OptionFeature>
              <span>✨</span>
              <span>Fully customizable</span>
            </OptionFeature>
            <ActionButton>
              <Button variant="primary" size="medium" onClick={onStartFromScratch}>
                Start Building
              </Button>
            </ActionButton>
          </OptionCard>

          {/* Use a Template */}
          <OptionCard onClick={onUseTemplate}>
            <IconWrapper color="rgba(99, 102, 241, 0.1)">
              <LayoutTemplate size={32} color="#6366f1" />
            </IconWrapper>
            <OptionTitle>Use a Template</OptionTitle>
            <OptionDescription>
              Get started quickly with professionally designed templates. Choose from compliance,
              onboarding, microlearning, and more.
            </OptionDescription>
            <OptionFeature>
              <span>⚡</span>
              <span>Quick start with best practices</span>
            </OptionFeature>
            <ActionButton>
              <Button variant="primary" size="medium" onClick={onUseTemplate}>
                Browse Templates
              </Button>
            </ActionButton>
          </OptionCard>
        </OptionsGrid>
      </ModalContent>
    </Modal>
  );
};
