import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { QuizBlock, QuizQuestion, QuizAnswer } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Textarea,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  FileListContainer,
  FileItemCard,
  FileItemHeader,
  FileItemTitle,
  DeleteFileButton,
  AddFileButton,
  SmallInput,
} from '../shared/StyledComponents';

interface QuizSettingsProps {
  block: QuizBlock;
  onUpdate: (settings: any) => void;
}

export const QuizSettings: React.FC<QuizSettingsProps> = ({ block, onUpdate }) => {
  const questions = block.settings?.questions || [];

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: 'New Question',
      answers: [
        { id: `answer-${Date.now()}-1`, text: 'Answer 1' },
        { id: `answer-${Date.now()}-2`, text: 'Answer 2' },
      ],
      correctAnswer: '',
      explanation: '',
    };
    onUpdate({ questions: [...questions, newQuestion] });
  };

  const handleRemoveQuestion = (questionId: string) => {
    onUpdate({ questions: questions.filter((q: QuizQuestion) => q.id !== questionId) });
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    onUpdate({
      questions: questions.map((q: QuizQuestion) => 
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const handleAddAnswer = (questionId: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      const newAnswer: QuizAnswer = {
        id: `answer-${Date.now()}`,
        text: 'New Answer',
      };
      handleUpdateQuestion(questionId, {
        answers: [...(question.answers || []), newAnswer],
      });
    }
  };

  const handleRemoveAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      handleUpdateQuestion(questionId, {
        answers: (question.answers || []).filter((a: QuizAnswer) => a.id !== answerId),
      });
    }
  };

  const handleUpdateAnswer = (questionId: string, answerId: string, text: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      handleUpdateQuestion(questionId, {
        answers: (question.answers || []).map((a: QuizAnswer) =>
          a.id === answerId ? { ...a, text } : a
        ),
      });
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Quiz Questions</Label>
        <FileListContainer>
          {questions.map((question: QuizQuestion, index: number) => (
            <FileItemCard key={question.id}>
              <FileItemHeader>
                <FileItemTitle>Question {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveQuestion(question.id)}
                  title="Remove question"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Question Text</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Answers</Label>
                {(question.answers || []).map((answer: QuizAnswer) => (
                  <div key={answer.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <SmallInput
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleUpdateAnswer(question.id, answer.id, e.target.value)}
                      placeholder="Answer text"
                    />
                    <DeleteFileButton
                      onClick={() => handleRemoveAnswer(question.id, answer.id)}
                      title="Remove answer"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </DeleteFileButton>
                  </div>
                ))}
                <button
                  onClick={() => handleAddAnswer(question.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  + Add Answer
                </button>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Correct Answer</Label>
                <Select
                  value={question.correctAnswer || ''}
                  onChange={(e) => handleUpdateQuestion(question.id, { correctAnswer: e.target.value })}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <option value="">Select correct answer</option>
                  {(question.answers || []).map((answer: QuizAnswer) => (
                    <option key={answer.id} value={answer.id}>
                      {answer.text}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Explanation (Optional)</Label>
                <Textarea
                  value={question.explanation || ''}
                  onChange={(e) => handleUpdateQuestion(question.id, { explanation: e.target.value })}
                  placeholder="Explain the correct answer"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddQuestion}>
          <Plus size={16} />
          Add Question
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Quiz Options</Label>
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showScoreImmediately"
            checked={block.settings?.showScoreImmediately !== false}
            onChange={(e) => onUpdate({ showScoreImmediately: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showScoreImmediately">Show score immediately</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowRetry"
            checked={block.settings?.allowRetry !== false}
            onChange={(e) => onUpdate({ allowRetry: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowRetry">Allow retry</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

export default QuizSettings;
