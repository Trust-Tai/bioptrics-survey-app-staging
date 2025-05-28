import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '/imports/api/surveys';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiFilter, FiTag, FiFolder, FiCopy, FiEdit, FiStar, FiTrash2, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';
import { useNavigate } from 'react-router-dom';
import { Questions } from '/imports/api/questions';
import { SurveyThemes } from '/imports/api/surveyThemes';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  flex: 1;
  padding: 8px;
  font-size: 16px;
  outline: none;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: 1px solid ${props => props.active ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#552a47' : '#eee'};
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const TemplateCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TemplateHeader = styled.div<{ color?: string }>`
  background: ${props => props.color || '#552a47'};
  color: white;
  padding: 16px;
  position: relative;
`;

const TemplateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const TemplateCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.8;
`;

const TemplateContent = styled.div`
  padding: 16px;
`;

const TemplateDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const TemplateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
`;

const TemplateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #6b3659;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #666;
`;

const CreateTemplateModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-height: 42px;
`;

const TagInputItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 14px;
`;

const TagInputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  min-width: 60px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const SaveButton = styled.button`
  padding: 10px 16px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

// Types
// Extend the SurveyDoc type to create a SurveyTemplate type
type SurveyTemplate = {
  _id?: string;
  title: string;
  description: string;
  color?: string;
  isTemplate: boolean;
  templateName: string;
  templateCategory: string;
  templateDescription: string;
  templateTags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface CreateTemplateForm {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

const SurveyTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateTemplateForm>({
    name: '',
    category: 'general',
    description: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');

  // Load templates
  const { templates, surveys, categories, loading, error } = useTracker(() => {
    try {
      const templatesHandle = Meteor.subscribe('surveys.templates');
      const surveysHandle = Meteor.subscribe('surveys.all');
      
      const isLoading = !templatesHandle.ready() || !surveysHandle.ready();
      
      let templateDocs: SurveyTemplate[] = [];
      let surveyDocs: any[] = [];
      let uniqueCategories = new Set<string>();
      
      if (!isLoading) {
        templateDocs = Surveys.find({ isTemplate: true }, { sort: { updatedAt: -1 } }).fetch() as unknown as SurveyTemplate[];
        surveyDocs = Surveys.find({ isTemplate: { $ne: true } }, { sort: { updatedAt: -1 } }).fetch();
        
        // Extract unique categories
        templateDocs.forEach(template => {
          if (template.templateCategory) {
            uniqueCategories.add(template.templateCategory);
          }
        });
      }
      
      return {
        templates: templateDocs,
        surveys: surveyDocs,
        categories: Array.from(uniqueCategories),
        loading: isLoading,
        error: null as string | null
      };
    } catch (err: unknown) {
      console.error('Error loading templates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      return {
        templates: [] as SurveyTemplate[],
        surveys: [] as any[],
        categories: [] as string[],
        loading: false,
        error: errorMessage
      };
    }
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.templateDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.templateTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory ? template.templateCategory === activeCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!createForm.tags.includes(newTag.trim())) {
        setCreateForm({
          ...createForm,
          tags: [...createForm.tags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCreateForm({
      ...createForm,
      tags: createForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Create template from existing survey
  const handleCreateTemplate = () => {
    if (!selectedSurveyId) return;
    
    const survey = surveys.find(s => s._id === selectedSurveyId);
    if (!survey) return;
    
    Meteor.call(
      'surveys.saveAsTemplate', 
      survey, 
      {
        name: createForm.name,
        category: createForm.category,
        description: createForm.description,
        tags: createForm.tags
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Error creating template:', error);
          alert('Failed to create template: ' + error.message);
        } else {
          setShowCreateModal(false);
          setCreateForm({
            name: '',
            category: 'general',
            description: '',
            tags: [],
          });
          setSelectedSurveyId(null);
        }
      }
    );
  };

  // Create new survey from template
  const handleUseTemplate = (templateId: string) => {
    Meteor.call(
      'surveys.createFromTemplate',
      templateId,
      { title: '', description: '' },
      (error: any, result: any) => {
        if (error) {
          console.error('Error creating survey from template:', error);
          alert('Failed to create survey: ' + error.message);
        } else {
          navigate(`/admin/survey-builder/${result._id}`);
        }
      }
    );
  };

  return (
    <AdminLayout>
      <DashboardBg>
        <div style={{ padding: '32px 0', minHeight: '100vh' }}>
          <Container>
            <Header>
              <Title>Survey Templates</Title>
              <TemplateButton onClick={() => setShowCreateModal(true)}>
                <FiPlus size={18} />
                Create Template
              </TemplateButton>
            </Header>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <SearchBar>
                <FiSearch size={18} color="#666" />
                <SearchInput 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBar>
            </div>

            <FilterContainer>
              <FilterButton 
                active={activeCategory === null} 
                onClick={() => setActiveCategory(null)}
              >
                All Categories
              </FilterButton>
              {categories.map(category => (
                <FilterButton 
                  key={category}
                  active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  <FiFolder size={16} />
                  {category}
                </FilterButton>
              ))}
            </FilterContainer>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading templates...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>{error}</div>
            ) : filteredTemplates.length === 0 ? (
              <EmptyState>
                <div style={{ fontSize: '18px', marginBottom: '16px' }}>No templates found</div>
                <p>Create your first template by clicking "Create Template" above.</p>
              </EmptyState>
            ) : (
              <TemplateGrid>
                {filteredTemplates.map(template => (
                  <TemplateCard key={template._id}>
                    <TemplateHeader color={template.color}>
                      <TemplateTitle>{template.templateName}</TemplateTitle>
                      <TemplateCategory>
                        <FiFolder size={14} />
                        {template.templateCategory}
                      </TemplateCategory>
                    </TemplateHeader>
                    <TemplateContent>
                      <TemplateDescription>{template.templateDescription}</TemplateDescription>
                      <TagContainer>
                        {template.templateTags.map(tag => (
                          <Tag key={tag}>
                            <FiTag size={12} />
                            {tag}
                          </Tag>
                        ))}
                      </TagContainer>
                    </TemplateContent>
                    <TemplateFooter>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                      <TemplateButton onClick={() => template._id && handleUseTemplate(template._id)}>
                        <FiCopy size={16} />
                        Use Template
                      </TemplateButton>
                    </TemplateFooter>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            )}
          </Container>
        </div>
      </DashboardBg>

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New Template</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>&times;</CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Select Survey to Convert</Label>
              <Select 
                value={selectedSurveyId || ''} 
                onChange={(e) => setSelectedSurveyId(e.target.value)}
              >
                <option value="">Select a survey...</option>
                {surveys.map(survey => (
                  <option key={survey._id} value={survey._id}>{survey.title}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Template Name</Label>
              <Input 
                type="text" 
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                placeholder="Enter a name for this template"
              />
            </FormGroup>

            <FormGroup>
              <Label>Category</Label>
              <Select 
                value={createForm.category}
                onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="customer">Customer Feedback</option>
                <option value="employee">Employee Feedback</option>
                <option value="event">Event Feedback</option>
                <option value="market">Market Research</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea 
                value={createForm.description}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                placeholder="Describe what this template is for and when to use it"
              />
            </FormGroup>

            <FormGroup>
              <Label>Tags</Label>
              <TagInput>
                {createForm.tags.map(tag => (
                  <TagInputItem key={tag}>
                    {tag}
                    <span 
                      style={{ cursor: 'pointer', fontSize: '16px' }} 
                      onClick={() => removeTag(tag)}
                    >
                      &times;
                    </span>
                  </TagInputItem>
                ))}
                <TagInputField 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={createForm.tags.length === 0 ? "Type and press Enter to add tags" : ""}
                />
              </TagInput>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Press Enter to add a tag
              </div>
            </FormGroup>

            <ModalFooter>
              <CancelButton onClick={() => setShowCreateModal(false)}>Cancel</CancelButton>
              <SaveButton 
                onClick={handleCreateTemplate}
                disabled={!selectedSurveyId || !createForm.name || !createForm.description}
              >
                Create Template
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </CreateTemplateModal>
      )}
    </AdminLayout>
  );
};

export default SurveyTemplates;
