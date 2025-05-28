import React, { useState } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiCheckCircle, FiX } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TemplateCard = styled.div<{ isSelected?: boolean }>`
  background: ${props => props.isSelected ? '#f9f4f8' : '#fff'};
  border: 1px solid ${props => props.isSelected ? '#552a47' : '#e5d6c7'};
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #552a47;
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TemplateName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 4px 0;
`;

const TemplateDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #552a47;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #693658;
  }
`;

const TemplateStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const AddButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #693658;
  }
`;

const FormContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 16px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SaveButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #693658;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 24px;
`;

const EmptyStateTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
`;

// Define the section template interface
export interface SectionTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  isDefault?: boolean;
  category?: string;
  tags?: string[];
  questionCount?: number;
  usageCount?: number;
  structure?: {
    layout?: 'standard' | 'grid' | 'card' | 'tabbed';
    theme?: {
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
    };
    feedback?: {
      enabled: boolean;
      type: 'rating' | 'text' | 'both' | 'thumbs';
    };
  };
}

interface SectionTemplateManagerProps {
  organizationId?: string;
  onSelectTemplate?: (template: SectionTemplate) => void;
}

const SectionTemplateManager: React.FC<SectionTemplateManagerProps> = ({
  organizationId,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<SectionTemplate[]>([
    {
      id: 'template-1',
      name: 'Employee Engagement',
      description: 'Standard template for measuring employee engagement and satisfaction',
      createdAt: new Date(),
      isDefault: true,
      category: 'Engagement',
      tags: ['engagement', 'satisfaction'],
      questionCount: 10,
      usageCount: 24,
      structure: {
        layout: 'standard',
        feedback: {
          enabled: true,
          type: 'rating'
        }
      }
    },
    {
      id: 'template-2',
      name: 'Manager Effectiveness',
      description: 'Template for evaluating manager performance and leadership skills',
      createdAt: new Date(),
      category: 'Leadership',
      tags: ['management', 'leadership'],
      questionCount: 8,
      usageCount: 15,
      structure: {
        layout: 'grid',
        feedback: {
          enabled: true,
          type: 'both'
        }
      }
    },
    {
      id: 'template-3',
      name: 'Onboarding Experience',
      description: 'Template for gathering feedback on the employee onboarding process',
      createdAt: new Date(),
      category: 'Onboarding',
      tags: ['onboarding', 'new hire'],
      questionCount: 12,
      usageCount: 8,
      structure: {
        layout: 'tabbed',
        feedback: {
          enabled: true,
          type: 'thumbs'
        }
      }
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SectionTemplate>>({
    name: '',
    description: '',
    category: '',
    tags: [],
    structure: {
      layout: 'standard',
      feedback: {
        enabled: true,
        type: 'rating'
      }
    }
  });
  
  // Handle selecting a template
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (onSelectTemplate) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        onSelectTemplate(template);
      }
    }
  };
  
  // Handle adding a new template
  const handleAddTemplate = () => {
    setIsAdding(true);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      structure: {
        layout: 'standard',
        feedback: {
          enabled: true,
          type: 'rating'
        }
      }
    });
  };
  
  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setIsEditing(true);
      setIsAdding(false);
      setFormData({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        structure: template.structure
      });
    }
  };
  
  // Handle duplicating a template
  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate: SectionTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (Copy)`,
        createdAt: new Date(),
        isDefault: false,
        usageCount: 0
      };
      
      setTemplates([...templates, newTemplate]);
    }
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      
      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
      }
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdding) {
      const newTemplate: SectionTemplate = {
        id: `template-${Date.now()}`,
        name: formData.name || 'Untitled Template',
        description: formData.description,
        createdAt: new Date(),
        category: formData.category,
        tags: formData.tags,
        questionCount: 0,
        usageCount: 0,
        structure: formData.structure
      };
      
      setTemplates([...templates, newTemplate]);
    } else if (isEditing && formData.id) {
      setTemplates(templates.map(t => 
        t.id === formData.id 
          ? { 
              ...t, 
              name: formData.name || t.name,
              description: formData.description,
              category: formData.category,
              tags: formData.tags,
              structure: formData.structure,
              updatedAt: new Date()
            } 
          : t
      ));
    }
    
    setIsAdding(false);
    setIsEditing(false);
  };
  
  // Handle canceling the form
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
  };
  
  return (
    <Container>
      <Header>
        <Title>Section Templates</Title>
        <AddButton onClick={handleAddTemplate}>
          <FiPlus size={16} />
          Add Template
        </AddButton>
      </Header>
      
      {(isAdding || isEditing) && (
        <FormContainer>
          <FormTitle>{isAdding ? 'Create New Template' : 'Edit Template'}</FormTitle>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Template Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleInputChange} 
                placeholder="Enter template name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description || ''} 
                onChange={handleInputChange} 
                placeholder="Enter template description"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="category">Category</Label>
              <Input 
                type="text" 
                id="category" 
                name="category" 
                value={formData.category || ''} 
                onChange={handleInputChange} 
                placeholder="Enter category"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Layout</Label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['standard', 'grid', 'card', 'tabbed'].map(layout => (
                  <label key={layout} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '8px 12px',
                    border: `1px solid ${formData.structure?.layout === layout ? '#552a47' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: formData.structure?.layout === layout ? '#f9f4f8' : 'transparent'
                  }}>
                    <input 
                      type="radio" 
                      name="layout" 
                      value={layout} 
                      checked={formData.structure?.layout === layout}
                      onChange={() => setFormData({
                        ...formData,
                        structure: {
                          ...formData.structure,
                          layout: layout as 'standard' | 'grid' | 'card' | 'tabbed'
                        }
                      })}
                      style={{ marginRight: '4px' }}
                    />
                    {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </label>
                ))}
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label>Feedback Type</Label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['rating', 'text', 'both', 'thumbs'].map(type => (
                  <label key={type} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '8px 12px',
                    border: `1px solid ${formData.structure?.feedback?.type === type ? '#552a47' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: formData.structure?.feedback?.type === type ? '#f9f4f8' : 'transparent'
                  }}>
                    <input 
                      type="radio" 
                      name="feedbackType" 
                      value={type} 
                      checked={formData.structure?.feedback?.type === type}
                      onChange={() => setFormData({
                        ...formData,
                        structure: {
                          ...formData.structure,
                          feedback: {
                            enabled: true,
                            type: type as 'rating' | 'text' | 'both' | 'thumbs'
                          }
                        }
                      })}
                      style={{ marginRight: '4px' }}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </FormGroup>
            
            <FormActions>
              <CancelButton type="button" onClick={handleCancel}>
                Cancel
              </CancelButton>
              <SaveButton type="submit">
                {isAdding ? 'Create Template' : 'Save Changes'}
              </SaveButton>
            </FormActions>
          </form>
        </FormContainer>
      )}
      
      {templates.length === 0 ? (
        <EmptyState>
          <FiPlus size={32} color="#552a47" />
          <EmptyStateTitle>No Templates Yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create your first section template to streamline survey creation.
          </EmptyStateDescription>
          <AddButton onClick={handleAddTemplate}>
            <FiPlus size={16} />
            Add Template
          </AddButton>
        </EmptyState>
      ) : (
        <TemplateGrid>
          {templates.map(template => (
            <TemplateCard 
              key={template.id} 
              isSelected={selectedTemplate === template.id}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <TemplateHeader>
                <div>
                  <TemplateName>{template.name}</TemplateName>
                  {template.category && (
                    <div style={{ 
                      display: 'inline-block',
                      fontSize: '12px',
                      padding: '2px 8px',
                      background: '#f0f0f0',
                      borderRadius: '12px',
                      color: '#666'
                    }}>
                      {template.category}
                    </div>
                  )}
                </div>
                <TemplateActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleEditTemplate(template.id);
                  }}>
                    <FiEdit2 size={16} />
                  </ActionButton>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTemplate(template.id);
                  }}>
                    <FiCopy size={16} />
                  </ActionButton>
                  {!template.isDefault && (
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}>
                      <FiTrash2 size={16} />
                    </ActionButton>
                  )}
                </TemplateActions>
              </TemplateHeader>
              
              {template.description && (
                <TemplateDescription>{template.description}</TemplateDescription>
              )}
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                {template.tags?.map(tag => (
                  <div key={tag} style={{ 
                    fontSize: '12px',
                    padding: '2px 8px',
                    background: '#f9f4f8',
                    borderRadius: '12px',
                    color: '#552a47'
                  }}>
                    {tag}
                  </div>
                ))}
              </div>
              
              <TemplateStats>
                <div>Questions: {template.questionCount}</div>
                <div>Used: {template.usageCount} times</div>
              </TemplateStats>
              
              {selectedTemplate === template.id && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  background: '#f9f4f8',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#552a47',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <FiCheckCircle size={16} />
                  Selected
                </div>
              )}
            </TemplateCard>
          ))}
        </TemplateGrid>
      )}
    </Container>
  );
};

export default SectionTemplateManager;
