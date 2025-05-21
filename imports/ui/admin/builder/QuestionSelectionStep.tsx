import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Questions, QuestionDoc } from '../../../api/questions';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiList, FiGrid, FiCheck, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';

// Use the actual interface from the Questions collection
interface Question extends QuestionDoc {
  _id: string;
}

interface QuestionSelectionStepProps {
  selectedQuestions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 20px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
`;

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: ${props => props.active ? '#f7fafc' : 'white'};
  border: none;
  color: ${props => props.active ? '#1c1c1c' : '#718096'};
  cursor: pointer;
  
  &:first-child {
    border-right: 1px solid #e2e8f0;
  }
  
  &:hover {
    background: #f7fafc;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuestionsColumn = styled.div<{ isGrid: boolean }>`
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  
  display: ${props => props.isGrid ? 'grid' : 'flex'};
  ${props => props.isGrid && `
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  `}
  ${props => !props.isGrid && `
    flex-direction: column;
    gap: 12px;
  `}
`;

const ColumnTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-top: 0;
  margin-bottom: 16px;
  grid-column: 1 / -1;
`;

const QuestionCard = styled.div<{ selected?: boolean }>`
  padding: 16px;
  border: 1px solid ${props => props.selected ? '#b7a36a' : '#e2e8f0'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#fffcf5' : 'white'};
  
  &:hover {
    border-color: #b7a36a;
    background: #fffcf5;
  }
`;

const QuestionText = styled.div`
  font-size: 14px;
  color: #1c1c1c;
  margin-bottom: 8px;
`;

const QuestionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: white;
  border: 1px solid ${props => props.danger ? '#e53e3e' : '#e2e8f0'};
  color: ${props => props.danger ? '#e53e3e' : '#718096'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.danger ? '#fff5f5' : '#f7fafc'};
  }
`;

const SelectedQuestionsList = styled.div`
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
`;

const SelectedQuestion = styled.div`
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MoveButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #718096;
`;

const PublishedBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background-color: #c6f6d5;
  color: #2f855a;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
`;

const DraftBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background-color: #e2e8f0;
  color: #4a5568;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
`;

const QuestionSelectionStep: React.FC<QuestionSelectionStepProps> = ({
  selectedQuestions,
  onQuestionsChange
}) => {
  // Fetch available questions from the database
  const availableQuestions = useTracker(() => {
    const subscription = Meteor.subscribe('questions.all');
    if (!subscription.ready()) {
      return [];
    }
    return Questions.find().fetch();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  
  // Filter questions based on search term
  const filteredQuestions = availableQuestions.filter(question => {
    const latestVersion = question.versions && question.versions.length > 0 
      ? question.versions[question.versions.length - 1] 
      : null;
    
    if (!latestVersion) return false;
    
    return latestVersion.questionText.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get a map of selected questions for quick lookup
  const selectedQuestionsMap = new Map(selectedQuestions.map(id => [id, true]));
  
  // Get question text by ID
  const getQuestionText = (id: string) => {
    const question = availableQuestions.find(q => q._id === id);
    if (!question || !question.versions || question.versions.length === 0) {
      return 'Unknown Question';
    }
    return question.versions[question.versions.length - 1].questionText;
  };
  
  // Handle question selection
  const toggleQuestionSelection = (questionId: string) => {
    if (selectedQuestionsMap.has(questionId)) {
      // Remove question
      const newSelectedQuestions = selectedQuestions.filter(id => id !== questionId);
      onQuestionsChange(newSelectedQuestions);
    } else {
      // Add question
      const newSelectedQuestions = [...selectedQuestions, questionId];
      onQuestionsChange(newSelectedQuestions);
    }
  };
  
  // Handle question movement in the list
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newSelectedQuestions = [...selectedQuestions];
    
    if (direction === 'up' && index > 0) {
      [newSelectedQuestions[index], newSelectedQuestions[index - 1]] = 
        [newSelectedQuestions[index - 1], newSelectedQuestions[index]];
    } else if (direction === 'down' && index < newSelectedQuestions.length - 1) {
      [newSelectedQuestions[index], newSelectedQuestions[index + 1]] = 
        [newSelectedQuestions[index + 1], newSelectedQuestions[index]];
    }
    
    onQuestionsChange(newSelectedQuestions);
  };
  
  // Handle question removal
  const removeQuestion = (questionId: string) => {
    const newSelectedQuestions = selectedQuestions.filter(id => id !== questionId);
    onQuestionsChange(newSelectedQuestions);
  };
  
  return (
    <Container>
      <SearchBar>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>
      
      <ToolbarContainer>
        <ViewToggle>
          <ViewToggleButton 
            active={!isGridView} 
            onClick={() => setIsGridView(false)}
          >
            <FiList />
          </ViewToggleButton>
          <ViewToggleButton 
            active={isGridView} 
            onClick={() => setIsGridView(true)}
          >
            <FiGrid />
          </ViewToggleButton>
        </ViewToggle>
      </ToolbarContainer>
      
      <ContentContainer>
        <QuestionsColumn isGrid={isGridView}>
          <ColumnTitle>Available Questions</ColumnTitle>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(question => {
              const latestVersion = question.versions && question.versions.length > 0 
                ? question.versions[question.versions.length - 1] 
                : null;
              
              if (!latestVersion) return null;
              
              const isSelected = selectedQuestionsMap.has(question._id || '');
              
              return (
                <QuestionCard 
                  key={question._id} 
                  selected={isSelected}
                  onClick={() => toggleQuestionSelection(question._id || '')}
                >
                  <QuestionText>{latestVersion.questionText}</QuestionText>
                  <PublishedBadge>v{latestVersion.version}</PublishedBadge>
                  <QuestionActions>
                    {isSelected ? (
                      <ActionButton>
                        <FiCheck />
                      </ActionButton>
                    ) : (
                      <ActionButton>
                        <FiPlus />
                      </ActionButton>
                    )}
                  </QuestionActions>
                </QuestionCard>
              );
            })
          ) : (
            <EmptyState>
              No questions found. Try adjusting your search criteria.
            </EmptyState>
          )}
        </QuestionsColumn>
        
        <SelectedQuestionsList>
          <ColumnTitle>Selected Questions ({selectedQuestions.length})</ColumnTitle>
          
          {selectedQuestions.length > 0 ? (
            selectedQuestions.map((questionId, index) => (
              <SelectedQuestion key={`selected-${questionId}`}>
                <QuestionText>{getQuestionText(questionId)}</QuestionText>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <MoveButtons>
                    <ActionButton 
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                    >
                      <FiArrowUp />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === selectedQuestions.length - 1}
                    >
                      <FiArrowDown />
                    </ActionButton>
                  </MoveButtons>
                  <ActionButton 
                    danger 
                    onClick={() => removeQuestion(questionId)}
                  >
                    <FiTrash2 />
                  </ActionButton>
                </div>
              </SelectedQuestion>
            ))
          ) : (
            <EmptyState>
              No questions selected yet. Click on questions from the available list to add them.
            </EmptyState>
          )}
        </SelectedQuestionsList>
      </ContentContainer>
    </Container>
  );
};

export default QuestionSelectionStep;
