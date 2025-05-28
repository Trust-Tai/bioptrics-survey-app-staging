import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiFilter, FiSearch, FiPlus, FiX, FiArrowRight, FiArrowLeft, FiLink } from 'react-icons/fi';
import { SurveySectionItem } from './SurveySections';

// Styled components for the question assignment UI
const AssignmentContainer = styled.div`
  margin-bottom: 32px;
`;

const AssignmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AssignmentTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 12px;
  width: 300px;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.active ? '#552a47' : '#ddd'};
  background: ${props => props.active ? '#f9f4f8' : '#fff'};
  color: ${props => props.active ? '#552a47' : '#666'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
  }
`;

const AssignmentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 20px;
  align-items: start;
`;

const QuestionList = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  max-height: 500px;
  display: flex;
  flex-direction: column;
`;

const QuestionListHeader = styled.div`
  background: #f5f5f5;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionListBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
`;

const QuestionItem = styled.div<{ selected?: boolean }>`
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  background: ${props => props.selected ? '#f9f4f8' : 'transparent'};
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.selected ? '#f9f4f8' : '#f9f9f9'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionTitle = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
`;

const QuestionMeta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 8px;
`;

const Tag = styled.span`
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${props => props.disabled ? '#eee' : '#ddd'};
  background: ${props => props.disabled ? '#f9f9f9' : '#fff'};
  color: ${props => props.disabled ? '#ccc' : '#552a47'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.disabled ? '#f9f9f9' : '#f5f0f5'};
    border-color: ${props => props.disabled ? '#eee' : '#552a47'};
  }
`;

const DependencyContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f9f9f9;
`;

const DependencyTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DependencyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #eee;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 14px;
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

// Define the question type
interface Question {
  id: string;
  text: string;
  type: string;
  category?: string;
  tags?: string[];
  sectionId?: string;
  dependencies?: Array<{
    questionId: string;
    condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
}

interface QuestionAssignmentProps {
  sections: SurveySectionItem[];
  questions: Question[];
  onQuestionsChange: (updatedQuestions: Question[]) => void;
}

const QuestionAssignment: React.FC<QuestionAssignmentProps> = ({
  sections,
  questions,
  onQuestionsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingDependency, setEditingDependency] = useState<string | null>(null);
  
  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const sectionId = question.sectionId || 'unassigned';
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(question);
    return acc;
  }, {} as Record<string, Question[]>);
  
  // Filter questions based on search term and active filter
  const filteredUnassignedQuestions = questions
    .filter(q => !q.sectionId)
    .filter(q => {
      // Apply search filter
      if (searchTerm && !q.text.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply category/tag filter
      if (activeFilter === 'all') return true;
      if (activeFilter === 'multiple-choice' && q.type === 'multiple-choice') return true;
      if (activeFilter === 'text' && q.type === 'text') return true;
      if (activeFilter === 'rating' && q.type === 'rating') return true;
      if (activeFilter && q.category === activeFilter) return true;
      if (activeFilter && q.tags?.includes(activeFilter)) return true;
      
      return !activeFilter;
    });
  
  // Get assigned questions for the selected section
  const assignedQuestions = selectedSection 
    ? questions.filter(q => q.sectionId === selectedSection)
    : [];
  
  // Handle assigning questions to a section
  const handleAssignQuestions = () => {
    if (!selectedSection) return;
    
    const updatedQuestions = questions.map(q => {
      if (selectedQuestions.includes(q.id)) {
        return { ...q, sectionId: selectedSection };
      }
      return q;
    });
    
    onQuestionsChange(updatedQuestions);
    setSelectedQuestions([]);
  };
  
  // Handle removing questions from a section
  const handleRemoveQuestions = () => {
    const updatedQuestions = questions.map(q => {
      if (selectedQuestions.includes(q.id)) {
        const { sectionId, ...rest } = q;
        return rest;
      }
      return q;
    });
    
    onQuestionsChange(updatedQuestions);
    setSelectedQuestions([]);
  };
  
  // Handle toggling question selection
  const handleToggleQuestionSelection = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };
  
  // Handle adding a dependency
  const handleAddDependency = (questionId: string, dependsOnQuestionId: string, condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan', value: any) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const dependencies = q.dependencies || [];
        return {
          ...q,
          dependencies: [
            ...dependencies,
            { questionId: dependsOnQuestionId, condition, value }
          ]
        };
      }
      return q;
    });
    
    onQuestionsChange(updatedQuestions);
    setEditingDependency(null);
  };
  
  // Handle removing a dependency
  const handleRemoveDependency = (questionId: string, dependsOnQuestionId: string) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId && q.dependencies) {
        return {
          ...q,
          dependencies: q.dependencies.filter(d => d.questionId !== dependsOnQuestionId)
        };
      }
      return q;
    });
    
    onQuestionsChange(updatedQuestions);
  };
  
  // Get unique categories and tags for filters
  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))] as string[];
  const questionTypes = ['multiple-choice', 'text', 'rating'];
  
  return (
    <AssignmentContainer>
      <AssignmentHeader>
        <AssignmentTitle>Question Assignment</AssignmentTitle>
        
        <SearchBar>
          <FiSearch size={16} color="#888" />
          <SearchInput 
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </AssignmentHeader>
      
      <FiltersContainer>
        <FilterButton 
          active={activeFilter === null}
          onClick={() => setActiveFilter(null)}
        >
          <FiFilter size={14} />
          All
        </FilterButton>
        
        {questionTypes.map(type => (
          <FilterButton 
            key={type}
            active={activeFilter === type}
            onClick={() => setActiveFilter(type)}
          >
            {type === 'multiple-choice' && 'Multiple Choice'}
            {type === 'text' && 'Text Input'}
            {type === 'rating' && 'Rating Scale'}
          </FilterButton>
        ))}
        
        {categories.map(category => (
          <FilterButton 
            key={category}
            active={activeFilter === category}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </FilterButton>
        ))}
      </FiltersContainer>
      
      <AssignmentGrid>
        <div>
          <QuestionList>
            <QuestionListHeader>
              <span>Unassigned Questions ({filteredUnassignedQuestions.length})</span>
            </QuestionListHeader>
            <QuestionListBody>
              {filteredUnassignedQuestions.map(question => (
                <QuestionItem 
                  key={question.id}
                  selected={selectedQuestions.includes(question.id)}
                  onClick={() => handleToggleQuestionSelection(question.id)}
                >
                  <QuestionTitle>{question.text}</QuestionTitle>
                  <QuestionMeta>
                    <span>{question.type}</span>
                    {question.category && <Tag>{question.category}</Tag>}
                  </QuestionMeta>
                </QuestionItem>
              ))}
              {filteredUnassignedQuestions.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  No unassigned questions found
                </div>
              )}
            </QuestionListBody>
          </QuestionList>
        </div>
        
        <ActionButtons>
          <ActionButton 
            onClick={handleAssignQuestions}
            disabled={selectedQuestions.length === 0 || !selectedSection}
            title="Assign to section"
          >
            <FiArrowRight size={18} />
          </ActionButton>
          <ActionButton 
            onClick={handleRemoveQuestions}
            disabled={selectedQuestions.length === 0 || selectedQuestions.some(id => {
              const question = questions.find(q => q.id === id);
              return !question?.sectionId;
            })}
            title="Remove from section"
          >
            <FiArrowLeft size={18} />
          </ActionButton>
        </ActionButtons>
        
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Select 
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(e.target.value ? e.target.value : null)}
            >
              <option value="">Select a section</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Select>
          </div>
          
          <QuestionList>
            <QuestionListHeader>
              <span>
                {selectedSection 
                  ? `Questions in ${sections.find(s => s.id === selectedSection)?.name} (${assignedQuestions.length})`
                  : 'Select a section to view assigned questions'
                }
              </span>
            </QuestionListHeader>
            <QuestionListBody>
              {selectedSection ? (
                assignedQuestions.length > 0 ? (
                  assignedQuestions.map(question => (
                    <QuestionItem 
                      key={question.id}
                      selected={selectedQuestions.includes(question.id)}
                      onClick={() => handleToggleQuestionSelection(question.id)}
                    >
                      <QuestionTitle>{question.text}</QuestionTitle>
                      <QuestionMeta>
                        <span>{question.type}</span>
                        {question.category && <Tag>{question.category}</Tag>}
                        {question.dependencies && question.dependencies.length > 0 && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: '#552a47',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDependency(editingDependency === question.id ? null : question.id);
                          }}
                          >
                            <FiLink size={12} />
                            {question.dependencies.length} dependencies
                          </span>
                        )}
                      </QuestionMeta>
                      
                      {editingDependency === question.id && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                            Dependencies
                          </div>
                          
                          {question.dependencies?.map(dep => {
                            const dependsOnQuestion = questions.find(q => q.id === dep.questionId);
                            return (
                              <DependencyRow key={dep.questionId}>
                                <div style={{ flex: 1, fontSize: '13px' }}>
                                  <div style={{ fontWeight: 500 }}>
                                    {dependsOnQuestion?.text}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    {dep.condition} {dep.value}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDependency(question.id, dep.questionId);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888'
                                  }}
                                >
                                  <FiX size={16} />
                                </button>
                              </DependencyRow>
                            );
                          })}
                          
                          <div style={{ marginTop: '12px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // This is a simplified example - in a real app you'd have a proper form
                                // for selecting the question, condition, and value
                                const dependsOnQuestionId = assignedQuestions.find(q => q.id !== question.id)?.id;
                                if (dependsOnQuestionId) {
                                  handleAddDependency(question.id, dependsOnQuestionId, 'equals', 'Yes');
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#f0f0f0',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              <FiPlus size={14} />
                              Add Dependency
                            </button>
                          </div>
                        </div>
                      )}
                    </QuestionItem>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                    No questions assigned to this section
                  </div>
                )
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  Select a section to view assigned questions
                </div>
              )}
            </QuestionListBody>
          </QuestionList>
        </div>
      </AssignmentGrid>
    </AssignmentContainer>
  );
};

export default QuestionAssignment;
