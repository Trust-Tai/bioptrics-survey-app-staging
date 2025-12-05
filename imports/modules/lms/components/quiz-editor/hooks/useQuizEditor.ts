import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Quizzes, QuizDoc } from '../../../api/quizzes';
import { Courses } from '../../../api/courses';
import { Modules } from '../../../api/modules';

export const useQuizEditor = (
  quizId: string | undefined,
  courseId: string | undefined
) => {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // Fetch data from Meteor
  const { quiz, module, course, loading } = useTracker(() => {
    const quizSub = Meteor.subscribe('quizzes.single', quizId);
    const courseSub = Meteor.subscribe('courses.single', courseId);
    
    const quizDoc = Quizzes.findOne(quizId) as QuizDoc | undefined;
    const courseDoc = Courses.findOne(courseId);
    
    let moduleSub;
    let moduleDoc;
    
    if (quizDoc?.moduleId) {
      moduleSub = Meteor.subscribe('modules.single', quizDoc.moduleId);
      moduleDoc = Modules.findOne(quizDoc.moduleId);
    }
    
    return {
      quiz: quizDoc,
      module: moduleDoc,
      course: courseDoc,
      loading: !quizSub.ready() || !courseSub.ready() || (moduleSub && !moduleSub.ready()),
    };
  }, [quizId, courseId]);

  // Initialize edit fields from quiz
  useEffect(() => {
    if (quiz) {
      setEditTitle(quiz.title || '');
      setEditDescription(quiz.description || '');
    }
  }, [quiz?.title, quiz?.description]);

  const handleBackToCourseBuilder = () => {
    navigate(`/admin/lms/builder/${courseId}`);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && quizId) {
      Meteor.call('quizzes.update', quizId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      }, (error: any) => {
        if (!error) {
          setIsEditingTitle(false);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        } else {
          console.error('Title save error:', error);
        }
      });
    }
  };

  const handleCancelEditTitle = () => {
    setEditTitle(quiz?.title || '');
    setEditDescription(quiz?.description || '');
    setIsEditingTitle(false);
  };

  const handlePublishQuiz = () => {
    if (quizId) {
      const newStatus = quiz?.status === 'published' ? 'draft' : 'published';
      Meteor.call('quizzes.update', quizId, {
        status: newStatus,
      }, (error: any) => {
        if (!error) {
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        } else {
          console.error('Publish error:', error);
        }
      });
    }
  };

  return {
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
    setShowSaved,
    handleBackToCourseBuilder,
    handleSaveTitle,
    handleCancelEditTitle,
    handlePublishQuiz,
  };
};
