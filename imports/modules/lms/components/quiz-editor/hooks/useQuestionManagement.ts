import { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import type { QuizQuestion } from '../../../api/quizzes';

export const useQuestionManagement = (quizId: string | undefined, initialQuestions: QuizQuestion[] = []) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addQuestion = (questionData: Omit<QuizQuestion, 'id' | 'order'>) => {
    const newQuestion: QuizQuestion = {
      ...questionData,
      id: `question-${Date.now()}`,
      order: questions.length + 1,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    
    if (quizId) {
      saveQuestions(updatedQuestions);
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    
    setQuestions(updatedQuestions);
    
    if (quizId) {
      saveQuestions(updatedQuestions);
    }
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions
      .filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index + 1 }));
    
    setQuestions(updatedQuestions);
    setDeleteConfirm(null);
    
    if (quizId) {
      saveQuestions(updatedQuestions);
    }
  };

  const reorderQuestions = (dragIndex: number, dropIndex: number) => {
    const reordered = Array.from(questions);
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    
    const reindexed = reordered.map((q, index) => ({
      ...q,
      order: index + 1,
    }));
    
    setQuestions(reindexed);
    
    if (quizId) {
      saveQuestions(reindexed);
    }
  };

  const saveQuestions = (questionsToSave: QuizQuestion[]) => {
    Meteor.call('quizzes.update', quizId, {
      questions: questionsToSave,
    }, (error: any) => {
      if (error) {
        console.error('Save questions error:', error);
      }
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderQuestions(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  return {
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
    reorderQuestions,
    handleDragStart,
    handleDragOver,
    handleDrop,
    calculateTotalPoints,
  };
};
