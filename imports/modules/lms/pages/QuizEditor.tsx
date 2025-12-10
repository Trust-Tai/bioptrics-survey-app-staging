import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import {
  QuizEditorHeader,
  QuizTitle,
  SaveIndicator,
  QuestionsCanvas,
  QuestionEditor,
  DeleteQuestionConfirmation,
  QuizSettings,
} from '../components/quiz-editor';
import { useQuizEditor } from '../components/quiz-editor/hooks/useQuizEditor';
import { useQuestionManagement } from '../components/quiz-editor/hooks/useQuestionManagement';
import { useQuizAutoSave } from '../components/quiz-editor/hooks/useQuizAutoSave';
import {
  PageContainer,
  MainLayout,
  Canvas,
  CanvasInner,
} from '../styles/quizEditor.styles';
import type { QuizSettings as QuizSettingsType } from '../api/quizzes';

export const QuizEditor: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  // Use custom hooks
  const {
    quiz,
    module,
    course,
    loading,
    isEditingTitle,
    setIsEditingTitle,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    showSaved,
    handleBackToCourseBuilder,
    handleSaveTitle,
    handleCancelEditTitle,
    handlePublishQuiz,
  } = useQuizEditor(quizId, courseId);

  const {
    questions,
    setQuestions,
    selectedQuestion,
    setSelectedQuestion,
    deleteConfirm,
    setDeleteConfirm,
    draggedIndex,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useQuestionManagement(quizId, quiz?.questions || []);

  // Quiz settings state
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType>(
    quiz?.settings || {
      timeLimit: 30,
      passingScore: 80,
      maxAttempts: 3,
      allowRetakes: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      requireCompletion: false,
    }
  );

  // Sync questions when quiz data loads
  useEffect(() => {
    if (quiz?.questions) {
      setQuestions(quiz.questions);
    }
  }, [quiz?.questions]);

  // Sync settings when quiz data loads
  useEffect(() => {
    if (quiz?.settings) {
      setQuizSettings(quiz.settings);
    }
  }, [quiz?.settings]);

  // Estimated duration state
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(quiz?.estimatedMinutes || 5);
  const durationSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync estimated minutes when quiz loads
  useEffect(() => {
    if (quiz?.estimatedMinutes !== undefined) {
      setEstimatedMinutes(quiz.estimatedMinutes);
    }
  }, [quiz?.estimatedMinutes]);

  // Handle duration change with auto-save
  const handleDurationChange = (minutes: number) => {
    const newValue = Math.max(1, minutes);
    setEstimatedMinutes(newValue);
    
    // Clear existing timeout
    if (durationSaveTimeout.current) {
      clearTimeout(durationSaveTimeout.current);
    }
    
    // Auto-save after 500ms
    durationSaveTimeout.current = setTimeout(() => {
      if (quizId) {
        Meteor.call('quizzes.update', quizId, { estimatedMinutes: newValue });
      }
    }, 500);
  };

  // Auto-save hook
  const { showSaved: autoSaveShown, isSaving } = useQuizAutoSave(
    quizId,
    questions,
    quizSettings
  );

  // Combine save indicators
  const showSavedIndicator = showSaved || autoSaveShown;

  if (loading) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#6b7280'
        }}>
          Loading quiz...
        </div>
      </PageContainer>
    );
  }

  if (!quiz) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '16px',
          color: '#6b7280'
        }}>
          <h2>Quiz not found</h2>
          <button onClick={handleBackToCourseBuilder}>
            Back to Course Builder
          </button>
        </div>
      </PageContainer>
    );
  }

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setShowQuestionEditor(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setDeleteConfirm(questionId);
  };

  const handleSaveQuestion = (questionData: any) => {
    addQuestion(questionData);
    setShowQuestionEditor(false);
  };

  const handleUpdateQuestion = (questionId: string, updates: any) => {
    updateQuestion(questionId, updates);
    setShowQuestionEditor(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteQuestion(deleteConfirm);
    }
  };

  const handleUpdateSettings = (updates: Partial<QuizSettingsType>) => {
    setQuizSettings(prev => ({ ...prev, ...updates }));
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  return (
    <PageContainer>
      <QuizEditorHeader
        course={course}
        module={module}
        quiz={quiz}
        onBack={handleBackToCourseBuilder}
        onPublish={handlePublishQuiz}
      />

      <MainLayout>
        {/* Quiz Settings Sidebar - Left */}
        <QuizSettings
          settings={quizSettings}
          totalPoints={calculateTotalPoints()}
          estimatedMinutes={estimatedMinutes}
          onUpdate={handleUpdateSettings}
          onDurationChange={handleDurationChange}
        />

        <Canvas>
          <CanvasInner>
            <QuizTitle
              quiz={quiz}
              isEditing={isEditingTitle}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitleChange={setEditTitle}
              onEditDescriptionChange={setEditDescription}
              onStartEdit={() => setIsEditingTitle(true)}
              onSave={handleSaveTitle}
              onCancel={handleCancelEditTitle}
            />

            <QuestionsCanvas
              questions={questions}
              draggedIndex={draggedIndex}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          </CanvasInner>
        </Canvas>
      </MainLayout>

      <QuestionEditor
        isOpen={showQuestionEditor}
        question={selectedQuestion}
        onSave={handleSaveQuestion}
        onUpdate={handleUpdateQuestion}
        onClose={() => {
          setShowQuestionEditor(false);
          setSelectedQuestion(null);
        }}
      />

      <DeleteQuestionConfirmation
        isOpen={!!deleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <SaveIndicator show={showSavedIndicator} />
    </PageContainer>
  );
};
