import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Plus, Trash2 } from 'lucide-react';
import type { QuizQuestion } from '../../api/quizzes';

interface QuestionEditorProps {
  isOpen: boolean;
  question?: QuizQuestion | null;
  onSave: (questionData: Omit<QuizQuestion, 'id' | 'order'>) => void;
  onUpdate: (questionId: string, updates: Partial<QuizQuestion>) => void;
  onClose: () => void;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  z-index: 1001;
  overflow-y: auto;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #111827;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px;
    ring-color: rgba(59, 130, 246, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px;
    ring-color: rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px;
    ring-color: rgba(59, 130, 246, 0.1);
  }
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Radio = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const OptionInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    background: #fef2f2;
  }
`;

const AddOptionButton = styled.button`
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #6b7280;
`;

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  isOpen,
  question,
  onSave,
  onUpdate,
  onClose,
}) => {
  const isEditMode = !!question;
  
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [explanation, setExplanation] = useState('');

  // Initialize form from question data
  useEffect(() => {
    if (question) {
      setQuestionType(question.type);
      setQuestionText(question.question);
      setOptions(question.options || ['', '', '', '']);
      setCorrectAnswer(Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer);
      setPoints(question.points);
      setExplanation(''); // Explanation not in current schema
    } else {
      // Reset form for new question
      setQuestionType('multiple-choice');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setPoints(1);
      setExplanation('');
    }
  }, [question, isOpen]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Reset correct answer if it was the removed option
      if (correctAnswer === options[index]) {
        setCorrectAnswer('');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    if (questionType === 'multiple-choice' && !correctAnswer) {
      alert('Please select a correct answer');
      return;
    }

    if (questionType === 'multiple-choice' && options.some(opt => !opt.trim())) {
      alert('Please fill in all options');
      return;
    }

    const questionData: Omit<QuizQuestion, 'id' | 'order'> = {
      type: questionType,
      question: questionText.trim(),
      points,
      correctAnswer: questionType === 'true-false' ? correctAnswer : 
                     questionType === 'short-answer' ? correctAnswer :
                     correctAnswer,
      ...(questionType === 'multiple-choice' && { options: options.filter(opt => opt.trim()) }),
    };

    if (isEditMode && question) {
      onUpdate(question.id, questionData);
    } else {
      onSave(questionData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{isEditMode ? 'Edit Question' : 'Add New Question'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormGroup>
            <Label>Question Type</Label>
            <Select value={questionType} onChange={(e) => setQuestionType(e.target.value as any)}>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Question</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question here..."
            />
          </FormGroup>

          {questionType === 'multiple-choice' && (
            <FormGroup>
              <Label>Options (select the correct answer)</Label>
              <OptionsList>
                {options.map((option, index) => (
                  <OptionItem key={index}>
                    <Radio
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswer === option}
                      onChange={() => setCorrectAnswer(option)}
                    />
                    <OptionInput
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <RemoveButton onClick={() => handleRemoveOption(index)}>
                        <Trash2 size={16} />
                      </RemoveButton>
                    )}
                  </OptionItem>
                ))}
              </OptionsList>
              <AddOptionButton onClick={handleAddOption} style={{ marginTop: '12px' }}>
                <Plus size={16} />
                Add Option
              </AddOptionButton>
            </FormGroup>
          )}

          {questionType === 'true-false' && (
            <FormGroup>
              <Label>Correct Answer</Label>
              <Select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>
                <option value="">Select answer...</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </Select>
            </FormGroup>
          )}

          {questionType === 'short-answer' && (
            <FormGroup>
              <Label>Model Answer</Label>
              <Input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter the expected answer..."
              />
              <HelpText>This will be used as a reference for manual grading</HelpText>
            </FormGroup>
          )}

          <FormGroup>
            <Label>Points</Label>
            <Input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              placeholder="Points"
            />
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave}>
            {isEditMode ? 'Update Question' : 'Add Question'}
          </SaveButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};
