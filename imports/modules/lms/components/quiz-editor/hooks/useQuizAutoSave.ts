import { useEffect, useRef, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import type { QuizQuestion, QuizSettings } from '../../../api/quizzes';

export const useQuizAutoSave = (
  quizId: string | undefined,
  questions: QuizQuestion[],
  settings: QuizSettings
) => {
  const [showSaved, setShowSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const questionsRef = useRef<QuizQuestion[]>(questions);
  const settingsRef = useRef<QuizSettings>(settings);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when props change
  useEffect(() => {
    questionsRef.current = questions;
    settingsRef.current = settings;
  }, [questions, settings]);

  // Debounced save function
  const scheduleSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (quizId && !isSaving) {
        saveQuiz();
      }
    }, 2000); // Wait 2 seconds after last change before saving
  };

  const saveQuiz = () => {
    if (!quizId || isSaving) return;

    setIsSaving(true);

    Meteor.call(
      'quizzes.update',
      quizId,
      {
        questions: questionsRef.current,
        settings: settingsRef.current,
      },
      (error: any) => {
        setIsSaving(false);
        
        if (error) {
          console.error('Auto-save error:', error);
        } else {
          // Show saved indicator
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      }
    );
  };

  // Auto-save when questions or settings change
  useEffect(() => {
    if (quizId) {
      scheduleSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questions, settings, quizId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    showSaved,
    isSaving,
  };
};
