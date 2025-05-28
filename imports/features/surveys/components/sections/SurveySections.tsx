import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiPlus, FiMove, FiInfo, FiCheckCircle, FiCopy, FiLayout, FiEye, FiBarChart2 } from 'react-icons/fi';

// Import components from the same directory
import SectionPreview from '/imports/features/surveys/components/sections/SectionPreview';
import SectionTemplates from '/imports/features/surveys/components/sections/SectionTemplates';
import SectionVisibilityConditions from '/imports/features/surveys/components/sections/SectionVisibilityConditions';
import SectionInstructions from '/imports/features/surveys/components/sections/SectionInstructions';

// Import shared types
import { SurveySectionItem, SectionTemplate } from '/imports/features/surveys/types/index';

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
  
  &:hover {
    border-color: ${props => props.isComplete ? '#2ecc71' : '#552a47'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const SectionHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
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

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #552a47;
  }
`;

const SectionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #888;
`;

const SectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionStats = styled.div`
  display: flex;
  gap: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AddSectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f9f4f8;
  border: 1px dashed #552a47;
  border-radius: 10px;
  color: #552a47;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0e6ee;
  }
`;

const SectionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const FormCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  input {
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 16px;
  background: ${props => props.primary ? '#552a47' : '#f5f5f5'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#6b3659' : '#eee'};
  }
`;

const SectionForm = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
`;

const TabContainer = styled.div`
  margin-bottom: 16px;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#552a47' : 'transparent'};
  color: ${props => props.isActive ? '#552a47' : '#666'};
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #552a47;
  }
`;

const TabContent = styled.div`
  padding: 8px 0;
`;

// Types for local use
interface SurveySection {
  id: string;
  name: string;
}

interface SectionQuestion {
  section: SurveySection;
  questionId: string;
}

interface SectionQuestionsMap {
  [sectionId: string]: string[];
}

export interface SurveySectionsProps {
  sections: SurveySectionItem[];
  onSectionsChange: (sections: SurveySectionItem[]) => void;
  organizationId?: string;
  isEditable?: boolean;
}

// The main component for managing survey sections
const SurveySections: React.FC<SurveySectionsProps> = ({ 
  sections, 
  onSectionsChange,
  organizationId,
  isEditable = true
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | null>(null);
  const [formData, setFormData] = useState<Partial<SurveySectionItem>>({
    name: '',
    description: '',
    isActive: true,
    priority: 0,
    color: '#552a47',
    isRequired: false,
  });
  const [activeTab, setActiveTab] = useState<'general' | 'visibility' | 'instructions' | 'templates'>('general');
  const [showPreview, setShowPreview] = useState(false);
  const [previewSection, setPreviewSection] = useState<SurveySectionItem | null>(null);
  
  // Generate a unique ID for new sections
  const generateId = () => {
    return `section_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // Open the modal to add a new section
  const handleAddSection = () => {
    setModalMode('add');
    setCurrentSection(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      priority: sections.length,
      color: '#552a47',
      isRequired: false,
    });
    setActiveTab('general');
    setShowModal(true);
  };
  
  // Open the modal to edit an existing section
  const handleEditSection = (section: SurveySectionItem) => {
    setModalMode('edit');
    setCurrentSection(section);
    setFormData({ ...section });
    setActiveTab('general');
    setShowModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name) return;
    
    if (modalMode === 'add') {
      // Add a new section
      const newSection: SurveySectionItem = {
        id: generateId(),
        name: formData.name || '',
        description: formData.description || '',
        isActive: formData.isActive ?? true,
        priority: formData.priority ?? sections.length,
        color: formData.color || '#552a47',
        isRequired: formData.isRequired ?? false,
        instructions: formData.instructions || '',
        visibilityCondition: formData.visibilityCondition,
        templateId: formData.templateId,
      };
      
      onSectionsChange([...sections, newSection]);
    } else if (modalMode === 'edit' && currentSection) {
      // Update an existing section
      const updatedSections = sections.map(s => 
        s.id === currentSection.id ? { ...s, ...formData } : s
      );
      
      onSectionsChange(updatedSections);
    }
    
    setShowModal(false);
  };
  
  // Handle section deletion
  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      const updatedSections = sections.filter(s => s.id !== sectionId);
      onSectionsChange(updatedSections);
    }
  };
  
  // Handle section duplication
  const handleDuplicateSection = (section: SurveySectionItem) => {
    const newSection: SurveySectionItem = {
      ...section,
      id: generateId(),
      name: `${section.name} (Copy)`,
      priority: sections.length,
    };
    
    onSectionsChange([...sections, newSection]);
  };
  
  // Handle section reordering
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    
    if (direction === 'up' && sectionIndex > 0) {
      newSections[sectionIndex] = newSections[sectionIndex - 1];
      newSections[sectionIndex - 1] = section;
    } else if (direction === 'down' && sectionIndex < newSections.length - 1) {
      newSections[sectionIndex] = newSections[sectionIndex + 1];
      newSections[sectionIndex + 1] = section;
    }
    
    // Update priorities
    const updatedSections = newSections.map((s, index) => ({
      ...s,
      priority: index,
    }));
    
    onSectionsChange(updatedSections);
  };
  
  // Handle section preview
  const handlePreview = (section: SurveySectionItem) => {
    setPreviewSection(section);
    setShowPreview(true);
  };
  
  // Handle section template selection
  const handleTemplateSelect = (template: SectionTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      instructions: template.instructions,
      templateId: template.id,
    }));
    
    setActiveTab('general');
  };
  
  // Sort sections by priority
  const sortedSections = [...sections].sort((a, b) => a.priority - b.priority);
  
  return (
    <SectionContainer>
      <SectionHeader>Survey Sections</SectionHeader>
      
      <SectionList>
        {sortedSections.map(section => (
          <SectionCard 
            key={section.id} 
            isActive={section.isActive}
            isComplete={section.completionPercentage === 100}
            style={{ borderLeft: `4px solid ${section.color || '#552a47'}` }}
          >
            <SectionHeader2>
              <SectionTitle>
                {section.isRequired && (
                  <span style={{ color: '#e74c3c', marginRight: 4 }}>*</span>
                )}
                {section.name}
              </SectionTitle>
              <SectionActions>
                {isEditable && (
                  <>
                    <ActionButton onClick={() => handlePreview(section)} title="Preview Section">
                      <FiEye size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => handleEditSection(section)} title="Edit Section">
                      <FiEdit2 size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDuplicateSection(section)} title="Duplicate Section">
                      <FiCopy size={16} />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleMoveSection(section.id, 'up')} 
                      title="Move Up"
                      disabled={section.priority === 0}
                      style={{ opacity: section.priority === 0 ? 0.5 : 1 }}
                    >
                      <FiMove size={16} style={{ transform: 'rotate(-90deg)' }} />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleMoveSection(section.id, 'down')} 
                      title="Move Down"
                      disabled={section.priority === sections.length - 1}
                      style={{ opacity: section.priority === sections.length - 1 ? 0.5 : 1 }}
                    >
                      <FiMove size={16} style={{ transform: 'rotate(90deg)' }} />
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteSection(section.id)} title="Delete Section">
                      <FiTrash2 size={16} />
                    </ActionButton>
                  </>
                )}
              </SectionActions>
            </SectionHeader2>
            
            {section.description && (
              <SectionDescription>{section.description}</SectionDescription>
            )}
            
            <SectionFooter>
              <SectionStatus>
                {section.isActive ? (
                  <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiCheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span style={{ color: '#95a5a6', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Inactive
                  </span>
                )}
                
                {section.visibilityCondition && (
                  <span style={{ marginLeft: 8, color: '#3498db', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiInfo size={14} /> Conditional
                  </span>
                )}
              </SectionStatus>
              
              <SectionStats>
                {section.questionIds && (
                  <StatItem>
                    <span>{section.questionIds.length} questions</span>
                  </StatItem>
                )}
                
                {section.completionPercentage !== undefined && (
                  <StatItem>
                    <FiBarChart2 size={14} />
                    <span>{section.completionPercentage}% complete</span>
                  </StatItem>
                )}
              </SectionStats>
            </SectionFooter>
          </SectionCard>
        ))}
        
        {isEditable && (
          <AddSectionButton onClick={handleAddSection}>
            <FiPlus size={18} />
            Add New Section
          </AddSectionButton>
        )}
      </SectionList>
      
      {/* Section Form Modal */}
      {showModal && (
        <SectionModal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{modalMode === 'add' ? 'Add New Section' : 'Edit Section'}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <TabContainer>
              <TabList>
                <Tab 
                  isActive={activeTab === 'general'} 
                  onClick={() => setActiveTab('general')}
                >
                  General
                </Tab>
                <Tab 
                  isActive={activeTab === 'visibility'} 
                  onClick={() => setActiveTab('visibility')}
                >
                  Visibility
                </Tab>
                <Tab 
                  isActive={activeTab === 'instructions'} 
                  onClick={() => setActiveTab('instructions')}
                >
                  Instructions
                </Tab>
                <Tab 
                  isActive={activeTab === 'templates'} 
                  onClick={() => setActiveTab('templates')}
                >
                  Templates
                </Tab>
              </TabList>
              
              <TabContent>
                {activeTab === 'general' && (
                  <SectionForm>
                    <FormGroup>
                      <FormLabel>Section Name*</FormLabel>
                      <FormInput 
                        type="text" 
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Description</FormLabel>
                      <FormTextarea 
                        name="description" 
                        value={formData.description || ''} 
                        onChange={handleInputChange} 
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Color</FormLabel>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <FormInput 
                          type="color" 
                          name="color" 
                          value={formData.color || '#552a47'} 
                          onChange={handleInputChange} 
                          style={{ width: 50, padding: 2 }}
                        />
                        <FormInput 
                          type="text" 
                          name="color" 
                          value={formData.color || '#552a47'} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Priority</FormLabel>
                      <FormInput 
                        type="number" 
                        name="priority" 
                        value={formData.priority?.toString() || '0'} 
                        onChange={handleInputChange} 
                        min="0" 
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormCheckbox>
                        <input 
                          type="checkbox" 
                          name="isActive" 
                          checked={formData.isActive ?? true} 
                          onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} 
                        />
                        <label>Active</label>
                      </FormCheckbox>
                    </FormGroup>
                    
                    <FormGroup>
                      <FormCheckbox>
                        <input 
                          type="checkbox" 
                          name="isRequired" 
                          checked={formData.isRequired ?? false} 
                          onChange={e => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))} 
                        />
                        <label>Required</label>
                      </FormCheckbox>
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Layout</FormLabel>
                      <FormSelect 
                        name="layout" 
                        value={formData.layout || 'standard'} 
                        onChange={handleInputChange}
                      >
                        <option value="standard">Standard</option>
                        <option value="grid">Grid</option>
                        <option value="card">Card</option>
                        <option value="tabbed">Tabbed</option>
                      </FormSelect>
                    </FormGroup>
                  </SectionForm>
                )}
                
                {activeTab === 'visibility' && (
                  <SectionVisibilityConditions
                    sections={sections}
                    condition={formData.visibilityCondition}
                    onChange={(condition: typeof formData.visibilityCondition) => setFormData(prev => ({ ...prev, visibilityCondition: condition }))}
                  />
                )}
                
                {activeTab === 'instructions' && (
                  <SectionInstructions
                    instructions={formData.instructions || ''}
                    onChange={(instructions: string) => setFormData(prev => ({ ...prev, instructions }))}
                  />
                )}
                
                {activeTab === 'templates' && (
                  <SectionTemplates
                    organizationId={organizationId}
                    onSelect={handleTemplateSelect}
                  />
                )}
              </TabContent>
            </TabContainer>
            
            <ButtonGroup>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={handleSubmit}>
                {modalMode === 'add' ? 'Add Section' : 'Update Section'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </SectionModal>
      )}
      
      {/* Section Preview Modal */}
      {showPreview && previewSection && (
        <SectionModal>
          <ModalContent style={{ maxWidth: 800 }}>
            <ModalHeader>
              <ModalTitle>Section Preview: {previewSection.name}</ModalTitle>
              <CloseButton onClick={() => setShowPreview(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <SectionPreview section={previewSection} />
            
            <ButtonGroup>
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </ButtonGroup>
          </ModalContent>
        </SectionModal>
      )}
    </SectionContainer>
  );
};

// Export the component and default sections for backward compatibility
export const SURVEY_SECTIONS = DEFAULT_SURVEY_SECTIONS;
export default SurveySections;
