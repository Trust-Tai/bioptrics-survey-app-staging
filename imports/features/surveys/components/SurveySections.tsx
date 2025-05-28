import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiPlus, FiMove, FiInfo, FiCheckCircle, FiCopy, FiLayout, FiEye, FiBarChart2 } from 'react-icons/fi';
import SectionPreview from '../../../../imports/features/surveys/components/sections/SectionPreview';
import SectionTemplates from '../../../../imports/features/surveys/components/sections/SectionTemplates';
import { SectionTemplate } from '../../../../imports/ui/admin/SectionTemplates';
import SectionVisibilityConditions from '../../../../imports/features/surveys/components/sections/SectionVisibilityConditions';
import SectionInstructions from '../../../../imports/features/surveys/components/sections/SectionInstructions';

// Define the base survey sections that can be customized
export const DEFAULT_SURVEY_SECTIONS = [
  'Welcome Screen',
  'Engagement/Manager Relationships',
  'Peer/Team Dynamics',
  'Feedback & Communication Quality',
  'Recognition and Pride',
  'Safety & Wellness Indicators',
  'Site-specific open text boxes',
  'Optional Demographics',
];

// Styled components for the redesigned section UI
const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 16px;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionCard = styled.div<{ isActive?: boolean; isComplete?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: ${props => {
    if (props.isComplete) return '#f0f9f0';
    return props.isActive ? '#f9f4f8' : '#fff';
  }};
  border: 1px solid ${props => {
    if (props.isComplete) return '#2ecc71';
    return props.isActive ? '#552a47' : '#e5d6c7';
  }};
  border-radius: 10px;
  transition: all 0.2s;
  box-shadow: ${props => props.isActive ? '0 2px 8px rgba(85, 42, 71, 0.1)' : 'none'};
  position: relative;
  
  &:hover {
    border-color: ${props => props.isComplete ? '#2ecc71' : '#552a47'};
    box-shadow: 0 2px 8px rgba(85, 42, 71, 0.1);
  }
  
  &::before {
    content: ${props => props.isComplete ? '"✓"' : '""'};
    display: ${props => props.isComplete ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: #2ecc71;
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
  }
`;

const SectionContent = styled.div`
  flex: 1;
  margin-bottom: 12px;
`;

const SectionMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #28211e;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SectionProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const SectionProgressBar = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background-color: #2ecc71;
  transition: width 0.3s ease;
`;

const SectionStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const SectionCompletionBadge = styled.div<{ isComplete?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.isComplete ? '#2ecc71' : '#f39c12'};
  background: ${props => props.isComplete ? 'rgba(46, 204, 113, 0.1)' : 'rgba(243, 156, 18, 0.1)'};
  padding: 4px 8px;
  border-radius: 4px;
`;

const QuickActionsMenu = styled.div`
  display: flex;
  justify-content: space-between;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
`;

const QuickActionButton = styled.button`
  background: transparent;
  border: none;
  color: #552a47;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(85, 42, 71, 0.1);
  }
  
  svg {
    font-size: 16px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f0f0;
    color: #552a47;
  }
`;

const AddSectionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px dashed #552a47;
  color: #552a47;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f9f4f8;
  }
`;

const SectionForm = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
  max-width: 800px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #28211e;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.primary ? '#552a47' : '#f5f5f5'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
`;

// Types for the survey sections
export type SurveySection = string;

export interface SectionQuestion {
section: SurveySection;
questionId: string;
}

export interface SectionQuestionsMap {
  [section: string]: string[]; // array of question IDs per section
}

export interface SurveySectionItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  icon?: string;
  color?: string;
  instructions?: string;
  isRequired?: boolean;
  visibilityCondition?: {
    dependsOnSectionId?: string;
    dependsOnQuestionId?: string;
    condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  timeLimit?: number; // in seconds
  questionIds?: string[];
  templateId?: string;
  customCss?: string;
  progressIndicator?: boolean;
  completionPercentage?: number; // For analytics
  averageTimeSpent?: number; // For analytics in seconds
  skipLogic?: {
    enabled: boolean;
    rules: Array<{
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      questionId: string;
      value: any;
      skipToSectionId: string;
    }>;
  };
  layout?: 'standard' | 'grid' | 'card' | 'tabbed';
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  feedback?: {
    enabled: boolean;
    prompt?: string;
    type: 'rating' | 'text' | 'both' | 'thumbs';
  };
}

interface SurveySectionsProps {
  sections: SurveySectionItem[];
  onSectionsChange: (sections: SurveySectionItem[]) => void;
  organizationId?: string;
  isEditable?: boolean;
}

// The main component for managing survey sections
export const SurveySections: React.FC<SurveySectionsProps> = ({ 
  sections, 
  onSectionsChange,
  organizationId,
  isEditable = true
}) => {
  const [previewingSection, setPreviewingSection] = useState<SurveySectionItem | null>(null);
  const [previewSectionIndex, setPreviewSectionIndex] = useState<number>(0);
  const [editingSection, setEditingSection] = useState<SurveySectionItem | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [newSection, setNewSection] = useState<Partial<SurveySectionItem>>({
    name: '',
    description: '',
    isActive: true,
    priority: sections.length + 1
  });

  // Handle section drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newSections = [...sections];
    const draggedSection = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);

    // Update priorities
    newSections.forEach((section, index) => {
      section.priority = index;
    });

    onSectionsChange(newSections);
  };

  // Handle editing a section
  const handleEdit = (section: SurveySectionItem) => {
    setEditingSection(section);
    setIsAdding(false);
    setPreviewingSection(null);
  };
  
  // Handle previewing a section
  const handlePreview = (section: SurveySectionItem, index: number) => {
    setPreviewingSection(section);
    setPreviewSectionIndex(index);
    setIsAdding(false);
    setEditingSection(null);
    setShowTemplates(false);
  };
  
  // Generate mock analytics data for preview
  const generateMockAnalytics = (section: SurveySectionItem) => {
    return {
      avgCompletionTime: section.averageTimeSpent || Math.floor(Math.random() * 180) + 60, // 1-4 minutes
      responseRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      dropoffRate: Math.floor(Math.random() * 20), // 0-20%
      avgRating: Math.random() * 2 + 3, // 3-5 rating
      completionPercentage: section.completionPercentage || Math.floor(Math.random() * 40) + 60, // 60-100%
    };
  };
  
  // Handle next section in preview
  const handleNextSection = () => {
    if (previewSectionIndex < sections.length - 1) {
      setPreviewSectionIndex(previewSectionIndex + 1);
      setPreviewingSection(sections[previewSectionIndex + 1]);
    } else {
      // End of preview
      setPreviewingSection(null);
    }
  };
  
  // Handle previous section in preview
  const handlePreviousSection = () => {
    if (previewSectionIndex > 0) {
      setPreviewSectionIndex(previewSectionIndex - 1);
      setPreviewingSection(sections[previewSectionIndex - 1]);
    }
  };

  // Handle deleting a section
  const handleDelete = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      const newSections = sections.filter(s => s.id !== sectionId);
      // Update priorities
      newSections.forEach((section, index) => {
        section.priority = index;
      });
      onSectionsChange(newSections);
    }
  };

  // Handle toggling a section's active state
  const handleToggleActive = (sectionId: string) => {
    const newSections = sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, isActive: !section.isActive };
      }
      return section;
    });
    onSectionsChange(newSections);
  };

  // Handle selecting a template
  const handleSelectTemplate = (template: SectionTemplate) => {
    const newSectionFromTemplate: SurveySectionItem = {
      id: `section-${Date.now()}`,
      name: template.name,
      description: template.description,
      isActive: true,
      priority: sections.length,
      color: template.color,
      instructions: template.instructions,
      isRequired: template.isRequired,
      progressIndicator: template.progressIndicator,
      timeLimit: template.timeLimit,
      customCss: template.customCss,
      templateId: template.id,
      layout: template.layout || 'standard',
      theme: template.theme || {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        accentColor: '#4a90e2',
        fontFamily: 'Arial, sans-serif'
      },
      skipLogic: template.skipLogic || {
        enabled: false,
        rules: []
      },
      feedback: template.feedback || {
        enabled: false,
        type: 'both'
      }
    };
    
    onSectionsChange([...sections, newSectionFromTemplate]);
    setShowTemplates(false);
  };

  // Handle saving a section
  const handleSaveSection = () => {
    if (editingSection) {
      // Update existing section
      const newSections = sections.map(section => {
        if (section.id === editingSection.id) {
          return editingSection;
        }
        return section;
      });
      onSectionsChange(newSections);
      setEditingSection(null);
    } else if (isAdding && newSection.name) {
      // Add new section
      const sectionToAdd: SurveySectionItem = {
        id: `section-${Date.now()}`,
        name: newSection.name,
        description: newSection.description || '',
        isActive: true,
        priority: sections.length,
        color: newSection.color || '#552a47',
        instructions: newSection.instructions,
        isRequired: newSection.isRequired,
        progressIndicator: newSection.progressIndicator
      };
      onSectionsChange([...sections, sectionToAdd]);
      setNewSection({
        name: '',
        description: '',
        isActive: true,
        priority: sections.length + 1
      });
      setIsAdding(false);
    }
  };

  // Handle duplicating a section
  const handleDuplicate = (section: SurveySectionItem) => {
    const newSection: SurveySectionItem = {
      id: `section-${Date.now()}`,
      name: section.name,
      description: section.description,
      isActive: section.isActive,
      priority: sections.length,
      color: section.color,
      instructions: section.instructions,
      isRequired: section.isRequired,
      progressIndicator: section.progressIndicator,
      questionIds: section.questionIds,
      templateId: section.templateId,
      customCss: section.customCss,
      completionPercentage: section.completionPercentage,
      averageTimeSpent: section.averageTimeSpent,
      skipLogic: section.skipLogic,
      layout: section.layout,
      theme: section.theme,
      feedback: section.feedback
    };
    onSectionsChange([...sections, newSection]);
  };

  // Handle assigning questions to a section
  const handleAssignQuestions = (section: SurveySectionItem) => {
    // TO DO: implement assigning questions to a section
  };

  // Handle viewing analytics for a section
  const handleViewAnalytics = (section: SurveySectionItem) => {
    // TO DO: implement viewing analytics for a section
  };

  return (
    <SectionContainer>
      <SectionHeader>Survey Sections</SectionHeader>
      
      {previewingSection ? (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <button 
              onClick={() => setPreviewingSection(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#552a47',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              ← Back to Sections
            </button>
          </div>
          
          <SectionPreview 
            section={previewingSection}
            totalSections={sections.length}
            currentSectionIndex={previewSectionIndex}
            onNext={handleNextSection}
            onPrevious={handlePreviousSection}
            analytics={generateMockAnalytics(previewingSection)}
          />
        </div>
      ) : (
        <SectionList>
          {sections.sort((a, b) => a.priority - b.priority).map((section, index) => {
            const analytics = generateMockAnalytics(section);
            const isComplete = analytics.completionPercentage === 100;
            return (
              <SectionCard 
                key={section.id || index} 
                isActive={section.isActive}
                isComplete={isComplete}
                draggable={isEditable}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <SectionMain>
                  <SectionContent>
                    <SectionTitle>{section.name}</SectionTitle>
                    {section.description && (
                      <SectionDescription>{section.description}</SectionDescription>
                    )}
                  </SectionContent>
                  
                  <SectionActions>
                    {isEditable && (
                      <>
                        <ActionButton onClick={() => handleEdit(section)}>
                          <FiEdit2 size={16} />
                        </ActionButton>
                        <ActionButton onClick={() => handleDelete(section.id)}>
                          <FiTrash2 size={16} />
                        </ActionButton>
                        <ActionButton onClick={() => handleDuplicate(section)}>
                          <FiCopy size={16} />
                        </ActionButton>
                      </>
                    )}
                    <ActionButton onClick={() => handlePreview(section, index)}>
                      <FiEye size={16} />
                    </ActionButton>
                  </SectionActions>
                </SectionMain>
                
                {/* Section Completion Progress */}
                <SectionProgressContainer>
                  <SectionProgressBar percent={analytics.completionPercentage} />
                </SectionProgressContainer>
                
                <SectionStats>
                  <div>Questions: {section.questionIds?.length || 0}</div>
                  <SectionCompletionBadge isComplete={isComplete}>
                    {isComplete ? (
                      <>
                        <FiCheckCircle size={12} />
                        Complete
                      </>
                    ) : (
                      <>
                        {analytics.completionPercentage}% Complete
                      </>
                    )}
                  </SectionCompletionBadge>
                </SectionStats>
                
                {/* Quick Actions Menu */}
                <QuickActionsMenu>
                  <QuickActionButton onClick={() => handleEdit(section)}>
                    <FiEdit2 />
                    Edit
                  </QuickActionButton>
                  <QuickActionButton onClick={() => handlePreview(section, index)}>
                    <FiEye />
                    Preview
                  </QuickActionButton>
                  <QuickActionButton onClick={() => handleAssignQuestions(section)}>
                    <FiLayout />
                    Assign Questions
                  </QuickActionButton>
                  <QuickActionButton onClick={() => handleViewAnalytics(section)}>
                    <FiBarChart2 />
                    Analytics
                  </QuickActionButton>
                </QuickActionsMenu>
              </SectionCard>
            );
          })}
        </SectionList>
      )}
      
      {!isAdding && !editingSection && !showTemplates && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <AddSectionButton onClick={() => setIsAdding(true)}>
            <FiPlus size={18} />
            Add Custom Section
          </AddSectionButton>
          <AddSectionButton onClick={() => setShowTemplates(true)} style={{ background: '#f9f4f8' }}>
            <FiLayout size={18} />
            Use Template
          </AddSectionButton>
        </div>
      )}
      
      {isAdding && (
        <SectionForm>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Add New Section</h3>
          
          {/* Basic Information */}
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 500, fontSize: 16 }}>Basic Information</h4>
            
            <FormGroup>
              <Label>Section Name</Label>
              <Input 
                type="text" 
                value={newSection.name} 
                onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                placeholder="Enter section name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <Input 
                type="text" 
                value={newSection.description || ''} 
                onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                placeholder="Enter section description"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Section Instructions</Label>
              <textarea
                value={newSection.instructions || ''}
                onChange={(e) => setNewSection({...newSection, instructions: e.target.value})}
                placeholder="Instructions for respondents about this section"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </FormGroup>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Section Color</Label>
                <Input 
                  type="color" 
                  value={newSection.color || '#552a47'} 
                  onChange={(e) => setNewSection({...newSection, color: e.target.value})}
                  style={{ height: 40 }}
                />
              </FormGroup>
            </div>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newSection.isRequired || false} 
                  onChange={(e) => setNewSection({...newSection, isRequired: e.target.checked})}
                  style={{ width: 18, height: 18 }}
                />
                <span>Required Section</span>
              </label>
            </FormGroup>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newSection.progressIndicator || false} 
                  onChange={(e) => setNewSection({...newSection, progressIndicator: e.target.checked})}
                  style={{ width: 18, height: 18 }}
                />
                <span>Show Progress Indicator</span>
              </label>
            </FormGroup>
          </div>
          
          <FormActions>
            <Button onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button primary onClick={handleSaveSection} disabled={!newSection.name}>Save</Button>
          </FormActions>
        </SectionForm>
      )}
      
      {showTemplates && (
        <div style={{ marginTop: 16 }}>
          <SectionTemplates onSelectTemplate={handleSelectTemplate} />
          <Button 
            onClick={() => setShowTemplates(false)}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {editingSection && (
        <SectionForm>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Edit Section</h3>
          
          {/* Basic Information */}
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 500, fontSize: 16 }}>Basic Information</h4>
            
            <FormGroup>
              <Label>Section Name</Label>
              <Input 
                type="text" 
                value={editingSection.name} 
                onChange={(e) => setEditingSection({...editingSection, name: e.target.value})}
                placeholder="Enter section name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <Input 
                type="text" 
                value={editingSection.description || ''} 
                onChange={(e) => setEditingSection({...editingSection, description: e.target.value})}
                placeholder="Enter section description"
              />
            </FormGroup>
            
            <SectionInstructions
              instructions={editingSection.instructions}
              isEditable={true}
              onSave={(instructions) => setEditingSection({...editingSection, instructions})}
            />
            
            <div style={{ display: 'flex', gap: 16 }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Section Color</Label>
                <Input 
                  type="color" 
                  value={editingSection.color || '#552a47'} 
                  onChange={(e) => setEditingSection({...editingSection, color: e.target.value})}
                  style={{ height: 40 }}
                />
              </FormGroup>
              
              <FormGroup style={{ flex: 1 }}>
                <Label>Priority</Label>
                <Input 
                  type="number" 
                  value={editingSection.priority} 
                  onChange={(e) => setEditingSection({...editingSection, priority: parseInt(e.target.value)})}
                  min="0"
                />
              </FormGroup>
            </div>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editingSection.isActive} 
                  onChange={(e) => setEditingSection({...editingSection, isActive: e.target.checked})}
                  style={{ width: 18, height: 18 }}
                />
                <span>Active</span>
              </label>
            </FormGroup>
          </div>
          
          {/* Visibility Conditions */}
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 500, fontSize: 16 }}>Visibility Conditions</h4>
            <SectionVisibilityConditions
              sections={sections}
              currentSectionId={editingSection.id}
              visibilityCondition={editingSection.visibilityCondition}
              onChange={(visibilityCondition) => setEditingSection({...editingSection, visibilityCondition})}
            />
          </div>
          
          {/* Advanced Settings */}
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 500, fontSize: 16 }}>Advanced Settings</h4>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editingSection.isRequired || false} 
                  onChange={(e) => setEditingSection({...editingSection, isRequired: e.target.checked})}
                  style={{ width: 18, height: 18 }}
                />
                <span>Required Section</span>
              </label>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4, marginLeft: 26 }}>Respondents must complete this section to submit the survey</div>
            </FormGroup>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editingSection.progressIndicator || false} 
                  onChange={(e) => setEditingSection({...editingSection, progressIndicator: e.target.checked})}
                  style={{ width: 18, height: 18 }}
                />
                <span>Show Progress Indicator</span>
              </label>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4, marginLeft: 26 }}>Display progress bar for this section</div>
            </FormGroup>
            
            <FormGroup>
              <Label>Time Limit (seconds)</Label>
              <Input 
                type="number" 
                value={editingSection.timeLimit || ''} 
                onChange={(e) => setEditingSection({...editingSection, timeLimit: e.target.value ? parseInt(e.target.value) : undefined})}
                placeholder="Leave empty for no time limit"
                min="0"
              />
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Set a time limit for completing this section (in seconds)</div>
            </FormGroup>
          </div>
          
          {/* Visibility Conditions */}
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 500, fontSize: 16 }}>Visibility Conditions</h4>
            <p style={{ fontSize: 14, marginBottom: 16, color: '#666' }}>Set conditions for when this section should be displayed to respondents</p>
            
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!editingSection.visibilityCondition} 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditingSection({
                        ...editingSection, 
                        visibilityCondition: { condition: 'equals', value: '' as any }
                      });
                    } else {
                      const { visibilityCondition, ...rest } = editingSection;
                      setEditingSection(rest);
                    }
                  }}
                  style={{ width: 18, height: 18 }}
                />
                <span>Enable Conditional Visibility</span>
              </label>
            </FormGroup>
            
            {editingSection.visibilityCondition && (
              <div style={{ marginLeft: 26 }}>
                <FormGroup>
                  <Label>Depends on Section</Label>
                  <select
                    value={editingSection.visibilityCondition?.dependsOnSectionId || ''}
                    onChange={(e) => {
                      if (editingSection.visibilityCondition) {
                        setEditingSection({
                          ...editingSection,
                          visibilityCondition: {
                            condition: editingSection.visibilityCondition.condition,
                            value: editingSection.visibilityCondition.value,
                            dependsOnSectionId: e.target.value || undefined
                          }
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select a section</option>
                    {sections
                      .filter(s => s.id !== editingSection.id)
                      .sort((a, b) => a.priority - b.priority)
                      .map(section => (
                        <option key={section.id} value={section.id}>{section.name}</option>
                      ))
                    }
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Condition</Label>
                  <select
                    value={editingSection.visibilityCondition?.condition || 'equals'}
                    onChange={(e) => {
                      if (editingSection.visibilityCondition) {
                        const condition = e.target.value as 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
                        setEditingSection({
                          ...editingSection,
                          visibilityCondition: {
                            ...editingSection.visibilityCondition,
                            condition
                          }
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="equals">Equals</option>
                    <option value="notEquals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greaterThan">Greater Than</option>
                    <option value="lessThan">Less Than</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Value</Label>
                  <Input 
                    type="text" 
                    value={editingSection.visibilityCondition?.value || ''} 
                    onChange={(e) => {
                      if (editingSection.visibilityCondition) {
                        setEditingSection({
                          ...editingSection,
                          visibilityCondition: {
                            ...editingSection.visibilityCondition,
                            value: e.target.value
                          }
                        });
                      }
                    }}
                    placeholder="Value to compare against"
                  />
                </FormGroup>
              </div>
            )}
          </div>
          
          <FormActions>
            <Button onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button primary onClick={handleSaveSection} disabled={!editingSection.name}>Save</Button>
          </FormActions>
        </SectionForm>
      )}
    </SectionContainer>
  );
};

// Export the component and default sections for backward compatibility
export const SURVEY_SECTIONS = DEFAULT_SURVEY_SECTIONS;
export default SurveySections;
