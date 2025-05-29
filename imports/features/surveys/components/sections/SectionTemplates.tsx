import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCheck, FiInfo } from 'react-icons/fi';
import { SectionTemplate } from '/imports/features/surveys/types';

const TemplatesContainer = styled.div`
  margin-bottom: 24px;
`;

const TemplatesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const TemplateCard = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const TemplateTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
`;

const TemplateDescription = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
`;

const TemplateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f9f4f8;
  border: 1px solid #552a47;
  border-radius: 4px;
  color: #552a47;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0e6ee;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
`;

// Using the SectionTemplate interface from shared types

interface SectionTemplatesProps {
  organizationId?: string;
  onSelect: (template: SectionTemplate) => void;
}

// Mock templates for demo purposes
const DEFAULT_TEMPLATES: SectionTemplate[] = [
  {
    id: 'template_1',
    name: 'Welcome Section',
    description: 'Introduction to the survey with welcome message',
    instructions: '<p>Welcome to our survey! This survey will help us understand your experience better.</p><p>Please answer all questions honestly. Your responses are anonymous and will be used to improve our services.</p>',
    isDefault: true,
  },
  {
    id: 'template_2',
    name: 'Demographic Information',
    description: 'Collect basic demographic data',
    instructions: '<p>In this section, we\'ll collect some basic demographic information to help us analyze the results.</p><p>This information is optional and will be kept confidential.</p>',
    isDefault: true,
  },
  {
    id: 'template_3',
    name: 'Feedback Section',
    description: 'Collect general feedback and comments',
    instructions: '<p>This section is for your general feedback and comments.</p><p>Please share any additional thoughts or suggestions you have about our services.</p>',
    isDefault: true,
  },
];

export const SectionTemplates: React.FC<SectionTemplatesProps> = ({
  organizationId,
  onSelect,
}) => {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simulate loading templates from the server
  useEffect(() => {
    // In a real app, you would fetch templates from the server
    // For now, we'll just use the default templates
    setTimeout(() => {
      setTemplates(DEFAULT_TEMPLATES);
      setLoading(false);
    }, 500);
  }, [organizationId]);
  
  if (loading) {
    return (
      <TemplatesContainer>
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
          Loading templates...
        </div>
      </TemplatesContainer>
    );
  }
  
  return (
    <TemplatesContainer>
      {templates.length > 0 ? (
        <TemplatesList>
          {templates.map(template => (
            <TemplateCard key={template.id}>
              <TemplateTitle>{template.name}</TemplateTitle>
              <TemplateDescription>{template.description}</TemplateDescription>
              <TemplateFooter>
                {template.isDefault && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiInfo size={12} />
                    Default
                  </span>
                )}
                <SelectButton onClick={() => onSelect(template)}>
                  <FiCheck size={12} />
                  Select
                </SelectButton>
              </TemplateFooter>
            </TemplateCard>
          ))}
        </TemplatesList>
      ) : (
        <EmptyState>
          <p>No templates available.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Create custom templates to save time when building surveys.</p>
        </EmptyState>
      )}
    </TemplatesContainer>
  );
};

export default SectionTemplates;
