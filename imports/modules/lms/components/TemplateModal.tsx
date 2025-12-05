import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '../../../ui/components/shared/Modal';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';
import { Badge } from '../../../ui/components/shared/Badge';
import type { CourseTemplateDoc } from '../api/courseTemplates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  templates: CourseTemplateDoc[];
  onSelectTemplate: (templateId: string) => void;
}

const ModalContent = styled.div`
  padding: 20px 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 20px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

const CategoryTab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? 'var(--color-primary, #6366f1)' : '#e5e7eb'};
  background: ${props => props.active ? 'var(--color-primary, #6366f1)' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    border-color: var(--color-primary, #6366f1);
    ${props => !props.active && `
      background: rgba(99, 102, 241, 0.05);
      color: var(--color-primary, #6366f1);
    `}
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

const TemplateCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  
  &:hover {
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

const TemplateTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const TemplateDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
`;

const TemplateDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const TemplateIncludes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const IncludeItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #059669;
  
  svg {
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #9ca3af;
`;

// Sample categories
const CATEGORIES = [
  'All',
  'Business Ethics',
  'Career Management',
  'Change Management',
  'Communication',
  'Compliance',
  'Critical Thinking',
  'Customer Service',
];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onBack,
  templates,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Template" size="lg">
      <ModalContent>
        <BackButton onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to options</span>
        </BackButton>

        <CategoryTabs>
          {CATEGORIES.map((category) => (
            <CategoryTab
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>

        {filteredTemplates.length > 0 ? (
          <TemplatesGrid>
            {filteredTemplates.map((template) => (
              <TemplateCard key={template._id} onClick={() => onSelectTemplate(template._id)}>
                <TemplateHeader>
                  <div style={{ flex: 1 }}>
                    <TemplateTitle>{template.title}</TemplateTitle>
                    <TemplateDuration>
                      <Clock size={14} />
                      <span>{template.duration}</span>
                    </TemplateDuration>
                  </div>
                  <Badge variant="info">{template.category}</Badge>
                </TemplateHeader>

                <TemplateDescription>{template.description}</TemplateDescription>

                <TemplateIncludes>
                  {template.includes.map((item, index) => (
                    <IncludeItem key={index}>
                      <CheckCircle size={14} />
                      <span>{item}</span>
                    </IncludeItem>
                  ))}
                </TemplateIncludes>
              </TemplateCard>
            ))}
          </TemplatesGrid>
        ) : (
          <EmptyState>
            <p>No templates found in this category.</p>
          </EmptyState>
        )}
      </ModalContent>
    </Modal>
  );
};
