import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiMove, FiEdit2, FiFilter, FiSearch, FiCheckSquare, FiSquare, FiCopy, FiArrowDown, FiArrowUp } from 'react-icons/fi';

// Import shared types
import { SurveySectionItem, QuestionItem } from '/imports/features/surveys/types';

// Styled components for the section questions UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 16px;
`;

const SectionSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const SectionTab = styled.button<{ isActive: boolean }>`
  padding: 10px 16px;
  background: ${props => props.isActive ? '#552a47' : '#fff'};
  color: ${props => props.isActive ? '#fff' : '#333'};
  border: 1px solid ${props => props.isActive ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    background: ${props => props.isActive ? '#552a47' : '#f9f4f8'};
  }
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 100px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 10px 10px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #552a47;
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
  }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${props => props.isActive ? '#f9f4f8' : '#fff'};
  border: 1px solid ${props => props.isActive ? '#552a47' : '#ddd'};
  border-radius: 6px;
  color: ${props => props.isActive ? '#552a47' : '#333'};
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    border-color: #552a47;
  }
`;

const BulkActionBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  padding: 10px;
  background: #f9f4f8;
  border-radius: 6px;
`;

const QuestionItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  background: ${props => props.isSelected ? '#f9f4f8' : '#fff'};
  border: 1px solid ${props => props.isSelected ? '#552a47' : '#ddd'};
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const QuestionTitle = styled.div`
  font-size: 15px;
  color: #333;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuestionType = styled.span`
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
`;

const QuestionActions = styled.div`
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

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
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
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.primary ? '#6b3659' : '#eee'};
  }
`;

// Using QuestionItem from shared types

interface SectionQuestionsProps {
  sections: SurveySectionItem[];
  questions: QuestionItem[];
  onQuestionsChange: (questions: QuestionItem[]) => void;
}

const SectionQuestions: React.FC<SectionQuestionsProps> = ({
  sections,
  questions,
  onQuestionsChange
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionItem[]>([]);
  
  // Filter questions when active section or search query changes
  useEffect(() => {
    let filtered = [...questions];
    
    // Filter by section
    if (activeSection) {
      filtered = filtered.filter(q => q.sectionId === activeSection);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(query) || 
        q.type.toLowerCase().includes(query)
      );
    }
    
    setFilteredQuestions(filtered);
  }, [activeSection, searchQuery, questions]);
  
  // Handle assigning a question to a section
  const handleAssignQuestion = (questionId: string, sectionId: string | undefined) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return { ...q, sectionId };
      }
      return q;
    });
    
    onQuestionsChange(updatedQuestions);
  };
  
  // Handle removing a question from a section
  const handleRemoveFromSection = (questionId: string) => {
    handleAssignQuestion(questionId, undefined);
  };
  
  // Handle reordering questions within a section
  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    e.dataTransfer.setData('text/plain', questionId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    const draggedQuestionId = e.dataTransfer.getData('text/plain');
    
    if (draggedQuestionId === targetQuestionId) return;
    
    // Find the indices of the dragged and target questions
    const draggedIndex = filteredQuestions.findIndex(q => q.id === draggedQuestionId);
    const targetIndex = filteredQuestions.findIndex(q => q.id === targetQuestionId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Create a new array with the reordered questions
    const reorderedQuestions = [...filteredQuestions];
    const [draggedQuestion] = reorderedQuestions.splice(draggedIndex, 1);
    reorderedQuestions.splice(targetIndex, 0, draggedQuestion);
    
    // Update the questions array with the new order
    const updatedQuestions = [...questions];
    const sectionQuestions = updatedQuestions.filter(q => q.sectionId === activeSection);
    
    reorderedQuestions.forEach((q, index) => {
      const questionIndex = updatedQuestions.findIndex(uq => uq.id === q.id);
      if (questionIndex !== -1) {
        updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], order: index };
      }
    });
    
    onQuestionsChange(updatedQuestions);
  };
  
  // Get unassigned questions
  const unassignedQuestions = questions.filter(q => !q.sectionId);
  
  return (
    <Container>
      <Header>Section Questions</Header>
      
      <SectionSelector>
        {sections
          .filter(s => s.isActive)
          .sort((a, b) => a.priority - b.priority)
          .map(section => (
            <SectionTab
              key={section.id}
              isActive={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
              style={{ borderLeft: `4px solid ${section.color || '#552a47'}` }}
            >
              {section.name}
            </SectionTab>
          ))
        }
        <SectionTab
          isActive={activeSection === null}
          onClick={() => setActiveSection(null)}
        >
          Unassigned
        </SectionTab>
      </SectionSelector>
      
      <SearchBar>
        <SearchInput>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInput>
      </SearchBar>
      
      {activeSection !== null ? (
        <>
          <QuestionList>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <QuestionItem
                  key={question.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, question.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, question.id)}
                >
                  <QuestionTitle>
                    <FiMove size={16} style={{ color: '#999', cursor: 'grab' }} />
                    {question.text}
                  </QuestionTitle>
                  <QuestionType>{question.type}</QuestionType>
                  <QuestionActions>
                    <ActionButton
                      onClick={() => handleRemoveFromSection(question.id)}
                      title="Remove from section"
                    >
                      <FiTrash2 size={16} />
                    </ActionButton>
                  </QuestionActions>
                </QuestionItem>
              ))
            ) : (
              <EmptyState>
                {searchQuery ? (
                  <p>No questions match your search criteria.</p>
                ) : (
                  <p>No questions in this section yet. Add questions from the unassigned list.</p>
                )}
              </EmptyState>
            )}
          </QuestionList>
        </>
      ) : (
        <>
          <QuestionList>
            {unassignedQuestions.length > 0 ? (
              unassignedQuestions.map(question => (
                <QuestionItem key={question.id}>
                  <QuestionTitle>{question.text}</QuestionTitle>
                  <QuestionType>{question.type}</QuestionType>
                  <QuestionActions>
                    <select
                      onChange={(e) => handleAssignQuestion(question.id, e.target.value)}
                      value=""
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      <option value="" disabled>Assign to section</option>
                      {sections
                        .filter(s => s.isActive)
                        .sort((a, b) => a.priority - b.priority)
                        .map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))
                      }
                    </select>
                  </QuestionActions>
                </QuestionItem>
              ))
            ) : (
              <EmptyState>
                <p>No unassigned questions available.</p>
              </EmptyState>
            )}
          </QuestionList>
        </>
      )}
    </Container>
  );
};

export default SectionQuestions;
