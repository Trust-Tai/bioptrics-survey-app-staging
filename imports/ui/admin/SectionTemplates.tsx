import React from 'react';
import styled from 'styled-components';
import { FiCopy, FiInfo, FiTag } from 'react-icons/fi';

// Styled components for the section templates UI
const TemplateContainer = styled.div`
  margin-bottom: 24px;
`;

const TemplateHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 16px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TemplateCard = styled.div`
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #552a47;
    box-shadow: 0 2px 8px rgba(85, 42, 71, 0.1);
    transform: translateY(-2px);
  }
`;

const TemplateTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #28211e;
  margin: 0 0 8px 0;
`;

const TemplateDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
`;

const TemplateMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #888;
`;

const TemplateTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
`;

// Section Template interface
export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  color: string;
  instructions?: string;
  isRequired?: boolean;
  progressIndicator?: boolean;
  timeLimit?: number; // in seconds
  customCss?: string;
  layout?: 'standard' | 'grid' | 'card' | 'tabbed';
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  skipLogic?: {
    enabled: boolean;
    rules: Array<{
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      questionId: string;
      value: any;
      skipToSectionId: string;
    }>;
  };
  feedback?: {
    enabled: boolean;
    prompt?: string;
    type: 'rating' | 'text' | 'both';
  };
}

// Default section templates
export const DEFAULT_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'template-welcome',
    name: 'Welcome Screen',
    description: 'Introduction to the survey with title, description, and logo',
    category: 'Basic',
    tags: ['introduction', 'welcome'],
    color: '#552a47',
    instructions: 'Welcome to our survey! Please take a few minutes to share your thoughts with us.',
    isRequired: true,
    progressIndicator: true,
    layout: 'standard',
    theme: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#552a47',
      fontFamily: 'Arial, sans-serif'
    },
    skipLogic: {
      enabled: false,
      rules: []
    },
    feedback: {
      enabled: false,
      type: 'both'
    }
  },
  {
    id: 'template-demographics',
    name: 'Demographics',
    description: 'Collect demographic information from respondents',
    category: 'Basic',
    tags: ['demographics', 'personal'],
    color: '#3498db',
    instructions: 'Please provide some information about yourself. This helps us analyze the results.',
    isRequired: false,
    progressIndicator: true,
    layout: 'grid',
    theme: {
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
      accentColor: '#3498db',
      fontFamily: 'Arial, sans-serif'
    },
    skipLogic: {
      enabled: false,
      rules: []
    },
    feedback: {
      enabled: false,
      type: 'both'
    }
  },
  {
    id: 'template-feedback',
    name: 'Feedback & Communication',
    description: 'Questions about feedback quality and communication effectiveness',
    category: 'Engagement',
    tags: ['feedback', 'communication'],
    color: '#2ecc71',
    instructions: 'Please rate the quality of feedback and communication in your team.',
    isRequired: true,
    progressIndicator: true,
    layout: 'card',
    theme: {
      backgroundColor: '#f0f8f1',
      textColor: '#333333',
      accentColor: '#2ecc71',
      fontFamily: 'Arial, sans-serif'
    },
    skipLogic: {
      enabled: false,
      rules: []
    },
    feedback: {
      enabled: true,
      prompt: 'How would you rate this section?',
      type: 'rating'
    }
  },
  {
    id: 'template-manager',
    name: 'Manager Relationships',
    description: 'Questions about manager effectiveness and relationships',
    category: 'Engagement',
    tags: ['management', 'leadership'],
    color: '#e74c3c',
    instructions: 'Please answer the following questions about your relationship with your manager.',
    isRequired: true,
    progressIndicator: true
  },
  {
    id: 'template-team',
    name: 'Team Dynamics',
    description: 'Questions about team collaboration and peer relationships',
    category: 'Engagement',
    tags: ['team', 'collaboration'],
    color: '#f39c12',
    instructions: 'This section explores how your team works together and collaborates.',
    isRequired: true,
    progressIndicator: true
  },
  {
    id: 'template-recognition',
    name: 'Recognition & Pride',
    description: 'Questions about recognition, rewards, and organizational pride',
    category: 'Engagement',
    tags: ['recognition', 'rewards'],
    color: '#9b59b6',
    instructions: 'Please share your thoughts on recognition and your sense of pride in the organization.',
    isRequired: true,
    progressIndicator: true
  },
  {
    id: 'template-safety',
    name: 'Safety & Wellness',
    description: 'Questions about workplace safety and employee wellness',
    category: 'Wellbeing',
    tags: ['safety', 'wellness', 'health'],
    color: '#16a085',
    instructions: 'This section focuses on workplace safety and your overall wellbeing.',
    isRequired: true,
    progressIndicator: true
  },
  {
    id: 'template-custom',
    name: 'Custom Questions',
    description: 'Site-specific custom questions for this survey',
    category: 'Custom',
    tags: ['custom', 'specific'],
    color: '#34495e',
    instructions: 'These questions are specific to your site or department.',
    isRequired: false,
    progressIndicator: true
  },
  {
    id: 'template-completion',
    name: 'Survey Completion',
    description: 'Thank you message and next steps after survey completion',
    category: 'Basic',
    tags: ['completion', 'thank you'],
    color: '#27ae60',
    instructions: 'Thank you for completing our survey! Your feedback is valuable to us.',
    isRequired: true,
    progressIndicator: true
  }
];

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  color: string;
  instructions?: string;
  isRequired?: boolean;
  progressIndicator?: boolean;
  timeLimit?: number;
  customCss?: string;
}

interface SectionTemplatesProps {
  onSelectTemplate: (template: SectionTemplate) => void;
  customTemplates?: SectionTemplate[];
}

const SectionTemplates: React.FC<SectionTemplatesProps> = ({ 
  onSelectTemplate,
  customTemplates = []
}) => {
  // Combine default and custom templates
  const allTemplates = [...DEFAULT_SECTION_TEMPLATES, ...customTemplates];
  
  // Group templates by category
  const templatesByCategory = allTemplates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, SectionTemplate[]>);
  
  return (
    <TemplateContainer>
      <TemplateHeader>Section Templates</TemplateHeader>
      
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        <div key={category}>
          <h4 style={{ margin: '16px 0 12px 0', fontSize: 16, color: '#444' }}>{category}</h4>
          <TemplateGrid>
            {templates.map(template => (
              <TemplateCard 
                key={template.id}
                onClick={() => onSelectTemplate(template)}
              >
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 12, 
                  background: template.color,
                  marginBottom: 8
                }} />
                <TemplateTitle>{template.name}</TemplateTitle>
                <TemplateDescription>{template.description}</TemplateDescription>
                <TemplateMeta>
                  <FiInfo size={14} />
                  <div>
                    {template.tags.map(tag => (
                      <TemplateTag key={tag}>
                        <FiTag size={12} />
                        {tag}
                      </TemplateTag>
                    ))}
                  </div>
                </TemplateMeta>
              </TemplateCard>
            ))}
          </TemplateGrid>
        </div>
      ))}
    </TemplateContainer>
  );
};

export default SectionTemplates;
