import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { FiFilter, FiSearch, FiList, FiGrid, FiMove, FiPlus, FiEdit2, FiTrash2, FiCopy, FiArrowRight } from 'react-icons/fi';
import { Questions, QuestionDoc, QuestionVersion } from '../../questions/api/questions';
import { SurveySectionItem } from '../../surveys/components/SurveySections';

// Styled components
const Container = styled.div`
  padding: 20px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 0 12px;
  width: 300px;
  border: 1px solid #eee;
  
  svg {
    color: #666;
    margin-right: 8px;
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px 0;
    font-size: 14px;
    
    &:focus {
      outline: none;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#552a47' : '#fff'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  }
`;

const QuestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const QuestionCard = styled.div<{ isAssigned?: boolean }>`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 3px solid ${props => props.isAssigned ? '#2ecc71' : '#552a47'};
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const QuestionText = styled.div`
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const QuestionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
`;

const QuestionType = styled.span`
  background: #f5f0f5;
  color: #552a47;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Tag = styled.span<{ color?: string }>`
  background: ${props => props.color || '#f0f0f0'};
  color: ${props => props.color ? '#fff' : '#333'};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e5e5e5;
  }
  
  svg {
    font-size: 16px;
  }
`;

const AssignButton = styled.button<{ isAssigned?: boolean }>`
  background: ${props => props.isAssigned ? '#e8f5e9' : '#f5f0f5'};
  color: ${props => props.isAssigned ? '#2e7d32' : '#552a47'};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.isAssigned ? '#d7eeda' : '#e9dfe7'};
  }
`;

const SectionSelector = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
`;

const SectionItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: ${props => props.isActive ? '#f5f0f5' : '#fff'};
  border: 1px solid ${props => props.isActive ? '#552a47' : '#ddd'};
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.isActive ? '#f5f0f5' : '#f9f9f9'};
  }
`;

const SectionName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const QuestionCount = styled.span`
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
  
  svg {
    font-size: 40px;
    color: #ddd;
    margin-bottom: 16px;
  }
`;

const EmptyStateText = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptyStateSubtext = styled.div`
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
`;

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#552a47' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#552a47'};
  border: ${props => props.primary ? 'none' : '1px solid #552a47'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#693658' : 'rgba(85, 42, 71, 0.1)'};
  }
`;

// Interface for questions with section assignment
interface QuestionWithSection extends QuestionDoc {
  _id?: string; // Ensure _id is explicitly defined
  sectionId?: string;
  // Helper properties for easier access to current version data
  text?: string;
  type?: string;
  required?: boolean;
  options?: string[] | { min: number; max: number; step: number };
  tags?: string[];
  categories?: string[];
}

interface QuestionOrganizerProps {
  surveyId: string;
  sections: SurveySectionItem[];
  onAssignQuestion: (questionId: string, sectionId: string) => void;
  onRemoveQuestion: (questionId: string, sectionId: string) => void;
  onCreateQuestion: () => void;
  onEditQuestion: (questionId: string) => void;
}

const QuestionOrganizer: React.FC<QuestionOrganizerProps> = ({
  surveyId,
  sections,
  onAssignQuestion,
  onRemoveQuestion,
  onCreateQuestion,
  onEditQuestion
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Get questions from the database
  const { questions, categories, tags, questionTypes, isLoading } = useTracker(() => {
    const questionsSub = Meteor.subscribe('questions.all');
    const isLoading = !questionsSub.ready();
    
    if (isLoading) {
      return {
        questions: [] as QuestionWithSection[],
        categories: [] as string[],
        tags: [] as string[],
        questionTypes: [] as string[],
        isLoading
      };
    }
    
    // Fetch questions and add helper properties for easier access
    const questionsRaw = Questions.find({}).fetch();
    
    // Process questions to add helper properties from current version
    const questions: QuestionWithSection[] = questionsRaw.map((q: QuestionDoc) => {
      const currentVersionIndex = q.versions.findIndex(v => v.version === q.currentVersion);
      const currentVersion = q.versions[currentVersionIndex] || q.versions[q.versions.length - 1];
      
      return {
        ...q,
        _id: q._id || '', // Ensure _id is always available
        text: currentVersion.questionText,
        type: currentVersion.responseType,
        required: true, // Assuming all questions are required by default
        categories: [currentVersion.category],
        tags: currentVersion.categoryTags,
        sectionId: (q as any).sectionId // Cast to any to handle potential sectionId
      };
    });
    
    // Extract unique categories, tags, and question types
    const extractedCategories = [...new Set(questions.flatMap(q => q.categories || []))]; 
    const extractedTags = [...new Set(questions.flatMap(q => q.tags || []))]; 
    const extractedQuestionTypes = [...new Set(questions.map(q => q.type || ''))];
    
    return {
      questions,
      categories: extractedCategories,
      tags: extractedTags,
      questionTypes: extractedQuestionTypes,
      isLoading
    };
  }, []);
  
  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((question: QuestionWithSection) => {
    // Search term filter
    if (searchTerm && !question.text?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && (!question.categories || !question.categories.includes(selectedCategory))) {
      return false;
    }
    
    // Tag filter
    if (selectedTag && (!question.tags || !question.tags.includes(selectedTag))) {
      return false;
    }
    
    // Type filter
    if (selectedType && question.type !== selectedType) {
      return false;
    }
    
    // Section filter
    if (selectedSection) {
      if (selectedSection === 'unassigned') {
        return !question.sectionId;
      } else {
        return question.sectionId === selectedSection;
      }
    }
    
    return true;
  });
  
  // Check if a question is assigned to a section
  const isQuestionAssigned = (questionId: string) => {
    const question = questions.find((q: QuestionWithSection) => q._id === questionId);
    return !!question?.sectionId;
  };
  
  // Get the section a question is assigned to
  const getQuestionSection = (questionId: string) => {
    const question = questions.find((q: QuestionWithSection) => q._id === questionId);
    if (!question?.sectionId) return null;
    
    return sections.find(section => section.id === question.sectionId);
  };
  
  // Handle assigning a question to a section
  const handleAssignQuestion = (questionId: string, sectionId: string) => {
    onAssignQuestion(questionId, sectionId);
  };
  
  // Handle removing a question from a section
  const handleRemoveQuestion = (questionId: string) => {
    const question = questions.find((q: QuestionWithSection) => q._id === questionId);
    if (question?.sectionId) {
      onRemoveQuestion(questionId, question.sectionId);
    }
  };
  
  // Render question card
  const renderQuestionCard = (question: QuestionWithSection) => {
    // Add null check to ensure question._id is a string
    const isAssigned = question._id ? isQuestionAssigned(question._id) : false;
    const assignedSection = question._id ? getQuestionSection(question._id) : null;
    
    return (
      <QuestionCard key={question._id || `question-${Math.random()}`} isAssigned={isAssigned}>
        <QuestionText>{question.text || 'Untitled Question'}</QuestionText>
        
        <QuestionMeta>
          <QuestionType>{question.type || 'Unknown Type'}</QuestionType>
          {question.required && <span>Required</span>}
        </QuestionMeta>
        
        {(question.tags && question.tags.length > 0) && (
          <TagsContainer>
            {question.tags.map((tag, index) => (
              <Tag key={`${tag}-${index}`} color="#552a47">{tag}</Tag>
            ))}
          </TagsContainer>
        )}
        
        {isAssigned && assignedSection && (
          <div style={{ marginTop: '10px', fontSize: '13px' }}>
            <span style={{ fontWeight: 500 }}>Assigned to:</span> {assignedSection.name}
          </div>
        )}
        
        <ActionButtons>
          <ActionButton onClick={() => question._id && onEditQuestion(question._id)}>
            <FiEdit2 />
          </ActionButton>
          <ActionButton>
            <FiCopy />
          </ActionButton>
          
          {isAssigned ? (
            <AssignButton 
              isAssigned={true}
              onClick={() => question._id && handleRemoveQuestion(question._id)}
            >
              Remove from Section
            </AssignButton>
          ) : (
            <AssignButton onClick={() => question._id && setSelectedSection(question._id)}>
              <FiArrowRight />
              Assign to Section
            </AssignButton>
          )}
        </ActionButtons>
        
        {selectedSection === question._id && (
          <SectionSelector>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>Select a section:</div>
            <SectionList>
              {sections.map(section => (
                <SectionItem 
                  key={section.id}
                  isActive={assignedSection?.id === section.id}
                  onClick={() => {
                    if (question._id) {
                      handleAssignQuestion(question._id, section.id);
                      setSelectedSection('');
                    }
                  }}
                >
                  <SectionName>{section.name}</SectionName>
                  <QuestionCount>
                    {questions.filter((q) => q.sectionId === section.id).length} questions
                  </QuestionCount>
                </SectionItem>
              ))}
            </SectionList>
          </SectionSelector>
        )}
      </QuestionCard>
    );
  };
  
  return (
    <Container>
      <Header>
        <Title>Question Organizer</Title>
        
        <SearchBar>
          <FiSearch size={16} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>
      
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Category:</FilterLabel>
          <Select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Tag:</FilterLabel>
          <Select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Type:</FilterLabel>
          <Select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            {questionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Section:</FilterLabel>
          <Select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="unassigned">Unassigned</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </Select>
        </FilterGroup>
        
        <ViewToggle>
          <ToggleButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
          >
            <FiGrid size={16} />
            Grid
          </ToggleButton>
          <ToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <FiList size={16} />
            List
          </ToggleButton>
        </ViewToggle>
      </FilterContainer>
      
      {isLoading ? (
        <div>Loading questions...</div>
      ) : filteredQuestions.length > 0 ? (
        viewMode === 'grid' ? (
          <QuestionGrid>
            {filteredQuestions.map((question: QuestionWithSection) => renderQuestionCard(question))}
          </QuestionGrid>
        ) : (
          <QuestionList>
            {filteredQuestions.map((question: QuestionWithSection) => renderQuestionCard(question))}
          </QuestionList>
        )
      ) : (
        <EmptyState>
          <FiFilter size={40} />
          <EmptyStateText>No questions match your filters</EmptyStateText>
          <EmptyStateSubtext>Try adjusting your search or filters</EmptyStateSubtext>
          <Button primary onClick={onCreateQuestion}>
            <FiPlus size={16} />
            Create New Question
          </Button>
        </EmptyState>
      )}
    </Container>
  );
};

export default QuestionOrganizer;
