import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Clock, FileText, Play, CheckCircle, Circle, 
  StickyNote, X, Save, Trash2, Edit2
} from 'lucide-react';
import { Courses } from '../../api/courses';
import { Modules } from '../../api/modules';
import { Topics } from '../../api/topics';
import { Enrollments } from '../../api/enrollments';
import { Notes } from '../../api/notes';
import { ContentBlockRenderer } from '../../components/blocks/ContentBlockRenderer';

// Main Layout
const PlayerContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

// Left Sidebar
const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const BackLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  
  &:hover {
    color: #1e3a5f;
  }
`;

const CourseTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const ProgressSection = styled.div`
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
`;

const ModulesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`;

const ModuleItem = styled.div`
  border-bottom: 1px solid #f3f4f6;
`;

const ModuleHeader = styled.button<{ $expanded: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ModuleNumber = styled.span<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
  
  ${props => props.$completed ? `
    background: #f97316;
    color: white;
    
    svg {
      width: 14px;
      height: 14px;
    }
  ` : `
    background: #f3f4f6;
    color: #1e3a5f;
  `}
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 4px;
`;

const ModuleProgress = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const TopicsList = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  padding-bottom: 8px;
`;

const TopicItem = styled.button<{ $active: boolean; $completed: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px 12px 36px;
  background: ${props => props.$active ? '#fff7ed' : 'transparent'};
  border: none;
  border-left: 3px solid ${props => props.$active ? '#f97316' : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  
  &:hover {
    background: ${props => props.$active ? '#fff7ed' : '#f9fafb'};
  }
`;

const TopicIcon = styled.div<{ $completed: boolean; $active: boolean }>`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$completed ? '#f97316' : props.$active ? '#f97316' : '#9ca3af'};
  }
`;

const TopicTitle = styled.span<{ $active: boolean }>`
  flex: 1;
  font-size: 14px;
  color: ${props => props.$active ? '#f97316' : '#374151'};
  font-weight: ${props => props.$active ? '500' : '400'};
`;

const TopicDuration = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

// Main Content Area
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderLeft = styled.div``;

const ModuleBreadcrumb = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const LessonTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Duration = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const NotesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const VideoPlaceholder = styled.div`
  background: #f3f4f6;
  border-radius: 12px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  
  svg {
    width: 64px;
    height: 64px;
    color: #f97316;
  }
`;

const LessonContent = styled.div`
  h3 {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
  }
  
  p {
    font-size: 16px;
    color: #4b5563;
    line-height: 1.7;
    margin: 0 0 16px 0;
  }
`;

const ContentFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: white;
  border-top: 1px solid #e5e7eb;
`;

const NavButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.$variant === 'primary' ? '#f97316' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#374151'};
  border: 1px solid ${props => props.$variant === 'primary' ? '#f97316' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#ea580c' : '#f9fafb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MarkCompleteButton = styled.button<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.$completed ? '#f0fdf4' : 'white'};
  color: ${props => props.$completed ? '#16a34a' : '#374151'};
  border: 1px solid ${props => props.$completed ? '#bbf7d0' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: ${props => props.$completed ? '#dcfce7' : '#f9fafb'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Notes Panel
const NotesPanel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => props.$open ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
`;

const NotesPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const NotesPanelTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CloseNotesButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const NotesPanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const NoteForm = styled.div`
  margin-bottom: 24px;
`;

const NoteInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #fed7aa;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const NoteTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SaveNoteButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #ea580c;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const NotesListTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 12px 0;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteCard = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
`;

const NoteCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NoteCardTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const NoteCardActions = styled.div`
  display: flex;
  gap: 4px;
`;

const NoteActionButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #9ca3af;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
  
  &.delete:hover {
    background: #fef2f2;
    color: #ef4444;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const NoteCardContent = styled.p`
  font-size: 13px;
  color: #4b5563;
  margin: 0 0 8px 0;
  line-height: 1.5;
`;

const NoteCardDate = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

const EmptyNotes = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  padding: 24px;
`;

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.3s;
  z-index: 150;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 16px;
  color: #6b7280;
`;

const Toast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e3a5f;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(${props => props.$visible ? '0' : '100px'});
  opacity: ${props => props.$visible ? 1 : 0};
  transition: all 0.3s;
  z-index: 300;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ToastMessage = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

export const LearnerCoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Fetch course data and enrollment
  const { 
    course, modules, topics, enrollment, notes, isLoading 
  } = useTracker(() => {
    if (!courseId) return { isLoading: true };

    const courseHandle = Meteor.subscribe('courses.published');
    const modulesHandle = Meteor.subscribe('modules.byCourse', courseId);
    const topicsHandle = Meteor.subscribe('topics.byCourse', courseId);
    const enrollmentHandle = Meteor.subscribe('enrollments.byCourse', courseId);
    const notesHandle = Meteor.subscribe('notes.byCourse', courseId);

    const loading = !courseHandle.ready() || !modulesHandle.ready() || 
                   !topicsHandle.ready() || !enrollmentHandle.ready();

    // Note: JWT auth uses 'admin' fallback for userId
    const userId = Meteor.userId() || 'admin';

    return {
      course: Courses.findOne(courseId),
      modules: Modules.find({ courseId }, { sort: { order: 1 } }).fetch(),
      topics: Topics.find({ courseId }, { sort: { order: 1 } }).fetch(),
      enrollment: Enrollments.findOne({ courseId, userId }),
      notes: Notes.find({ courseId, userId }, { sort: { updatedAt: -1 } }).fetch(),
      isLoading: loading,
    };
  }, [courseId]);

  // Current topic state
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);

  // Auto-enroll and set initial topic
  useEffect(() => {
    if (courseId && !isLoading && !enrollment) {
      Meteor.call('enrollments.autoEnroll', courseId);
    }
  }, [courseId, isLoading, enrollment]);

  // Set current topic from enrollment or first topic
  useEffect(() => {
    if (!currentTopicId && topics.length > 0) {
      if (enrollment?.currentTopicId) {
        setCurrentTopicId(enrollment.currentTopicId);
        // Expand the module containing current topic
        const topic = topics.find(t => t._id === enrollment.currentTopicId);
        if (topic) {
          setExpandedModules(new Set([topic.moduleId]));
        }
      } else {
        setCurrentTopicId(topics[0]._id);
        if (topics[0]) {
          setExpandedModules(new Set([topics[0].moduleId]));
        }
      }
    }
  }, [topics, enrollment, currentTopicId]);

  const currentTopic = topics.find(t => t._id === currentTopicId);
  const currentModule = modules.find(m => m._id === currentTopic?.moduleId);

  // Get topics for current module
  const getModuleTopics = (moduleId: string) => {
    return topics.filter(t => t.moduleId === moduleId);
  };

  // Check if topic is completed
  const isTopicCompleted = (topicId: string) => {
    if (!enrollment) return false;
    for (const mp of enrollment.modulesProgress) {
      const tp = mp.topicsProgress.find(t => t.topicId === topicId);
      if (tp?.completed) return true;
    }
    return false;
  };

  // Calculate module progress
  const getModuleProgress = (moduleId: string) => {
    const moduleTopics = getModuleTopics(moduleId);
    const completed = moduleTopics.filter(t => isTopicCompleted(t._id)).length;
    return { completed, total: moduleTopics.length };
  };

  // Calculate overall progress
  const overallProgress = enrollment?.overallProgress || 0;
  const totalLessons = topics.length;
  const completedLessons = enrollment?.modulesProgress.reduce((sum, mp) => 
    sum + mp.topicsProgress.filter(tp => tp.completed).length, 0) || 0;

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Navigate to topic
  const goToTopic = (topic: any) => {
    setCurrentTopicId(topic._id);
    if (courseId) {
      Meteor.call('enrollments.updatePosition', courseId, topic.moduleId, topic._id);
    }
    // Expand the module
    setExpandedModules(prev => new Set([...prev, topic.moduleId]));
  };

  // Get topics for current module, sorted by order
  const getCurrentModuleTopics = () => {
    if (!currentTopic) return [];
    return topics
      .filter(t => t.moduleId === currentTopic.moduleId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get the next topic - first within current module, then next module
  const getNextTopic = () => {
    if (!currentTopic) return null;
    
    const moduleTopics = getCurrentModuleTopics();
    const currentIndexInModule = moduleTopics.findIndex(t => t._id === currentTopicId);
    
    // If there's a next topic in the current module, return it
    if (currentIndexInModule < moduleTopics.length - 1) {
      return moduleTopics[currentIndexInModule + 1];
    }
    
    // Otherwise, find the next module and return its first topic
    const sortedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentModuleIndex = sortedModules.findIndex(m => m._id === currentTopic.moduleId);
    
    if (currentModuleIndex < sortedModules.length - 1) {
      const nextModule = sortedModules[currentModuleIndex + 1];
      const nextModuleTopics = topics
        .filter(t => t.moduleId === nextModule._id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return nextModuleTopics[0] || null;
    }
    
    return null; // No more topics
  };

  // Get the previous topic - first within current module, then previous module
  const getPreviousTopic = () => {
    if (!currentTopic) return null;
    
    const moduleTopics = getCurrentModuleTopics();
    const currentIndexInModule = moduleTopics.findIndex(t => t._id === currentTopicId);
    
    // If there's a previous topic in the current module, return it
    if (currentIndexInModule > 0) {
      return moduleTopics[currentIndexInModule - 1];
    }
    
    // Otherwise, find the previous module and return its last topic
    const sortedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentModuleIndex = sortedModules.findIndex(m => m._id === currentTopic.moduleId);
    
    if (currentModuleIndex > 0) {
      const prevModule = sortedModules[currentModuleIndex - 1];
      const prevModuleTopics = topics
        .filter(t => t.moduleId === prevModule._id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return prevModuleTopics[prevModuleTopics.length - 1] || null;
    }
    
    return null; // No previous topics
  };

  const hasPrevious = getPreviousTopic() !== null;
  const hasNext = getNextTopic() !== null;
  
  const goToPrevious = () => {
    const prevTopic = getPreviousTopic();
    if (prevTopic) {
      goToTopic(prevTopic);
    }
  };

  const goToNext = () => {
    const nextTopic = getNextTopic();
    if (nextTopic) {
      goToTopic(nextTopic);
    }
  };

  // Mark topic as complete
  const handleMarkComplete = () => {
    if (!courseId || !currentTopicId) {
      console.log('Mark complete: Missing courseId or currentTopicId', { courseId, currentTopicId });
      return;
    }

    // Check if already completed
    if (isTopicCompleted(currentTopicId)) {
      // Just go to next topic
      goToNext();
      return;
    }

    // Try to complete directly - the server will handle enrollment if needed
    completeTopicAndGoNext();
  };

  // Helper function to complete topic and navigate
  const completeTopicAndGoNext = () => {
    console.log('Completing topic:', { courseId, currentTopicId });
    
    Meteor.call('enrollments.completeTopic', courseId, currentTopicId, (error: any, result: any) => {
      if (error) {
        console.error('Mark complete error:', error);
        
        // If enrollment not found, try to enroll first then complete
        if (error.error === 'not-found' && error.reason?.includes('Enrollment')) {
          console.log('Enrollment not found, auto-enrolling...');
          Meteor.call('enrollments.autoEnroll', courseId, (enrollError: any, enrollResult: any) => {
            if (enrollError) {
              console.error('Auto-enroll failed:', enrollError);
              showToastMessage('Error', 'Failed to enroll in course. Please try again.');
              return;
            }
            console.log('Auto-enrolled successfully:', enrollResult);
            // Try completing again after enrollment
            Meteor.call('enrollments.completeTopic', courseId, currentTopicId, (retryError: any, retryResult: any) => {
              if (retryError) {
                console.error('Retry mark complete error:', retryError);
                showToastMessage('Error', retryError.reason || 'Failed to mark as complete');
                return;
              }
              console.log('Topic completed after enrollment:', retryResult);
              showToastMessage('Lesson completed!', 'Great progress! Keep learning.');
              setTimeout(() => goToNext(), 500);
            });
          });
          return;
        }
        
        showToastMessage('Error', error.reason || 'Failed to mark as complete');
        return;
      }
      
      console.log('Topic completed:', result);
      showToastMessage('Lesson completed!', 'Great progress! Keep learning.');
      
      // Go to next topic after a short delay
      setTimeout(() => {
        goToNext();
      }, 500);
    });
  };

  // Show toast
  const showToastMessage = (title: string, message: string) => {
    setToastMessage({ title, message });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Notes functions
  const handleSaveNote = () => {
    if (!courseId || !noteContent.trim()) {
      showToastMessage('Error', 'Please enter note content');
      return;
    }

    if (editingNoteId) {
      Meteor.call('notes.update', editingNoteId, { 
        title: noteTitle, 
        content: noteContent 
      }, (error: any) => {
        if (error) {
          console.error('Error updating note:', error);
          showToastMessage('Error', error.reason || 'Failed to update note');
        } else {
          showToastMessage('Note updated', 'Your note has been updated');
          setEditingNoteId(null);
          setNoteTitle('');
          setNoteContent('');
        }
      });
    } else {
      console.log('Creating note:', { courseId, topicId: currentTopicId, moduleId: currentTopic?.moduleId });
      Meteor.call('notes.create', {
        courseId,
        topicId: currentTopicId,
        moduleId: currentTopic?.moduleId,
        title: noteTitle,
        content: noteContent,
      }, (error: any, result: any) => {
        if (error) {
          console.error('Error creating note:', error);
          showToastMessage('Error', error.reason || 'Failed to save note');
        } else {
          console.log('Note created:', result);
          showToastMessage('Note saved', 'Your note has been added to My Notes');
          setNoteTitle('');
          setNoteContent('');
        }
      });
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note._id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      Meteor.call('notes.delete', noteId);
    }
  };

  // Get notes for current topic
  const currentTopicNotes = notes.filter(n => n.topicId === currentTopicId);

  if (isLoading) {
    return <LoadingState>Loading course...</LoadingState>;
  }

  if (!course) {
    return <LoadingState>Course not found</LoadingState>;
  }

  return (
    <PlayerContainer>
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <BackLink onClick={() => navigate('/admin/lms/learner/courses')}>
            <ChevronLeft size={16} />
            Back to Dashboard
          </BackLink>
          
          <CourseTitle>{course.title}</CourseTitle>
          
          <ProgressSection>
            <ProgressBar>
              <ProgressFill $progress={overallProgress} />
            </ProgressBar>
            <ProgressStats>
              <span>{completedLessons} of {totalLessons} lessons completed</span>
              <span>{overallProgress}%</span>
            </ProgressStats>
          </ProgressSection>
        </SidebarHeader>

        <ModulesList>
          {modules.map((module, index) => {
            const moduleTopics = getModuleTopics(module._id);
            const { completed, total } = getModuleProgress(module._id);
            const isExpanded = expandedModules.has(module._id);
            const isModuleComplete = completed === total && total > 0;

            return (
              <ModuleItem key={module._id}>
                <ModuleHeader
                  $expanded={isExpanded}
                  onClick={() => toggleModule(module._id)}
                >
                  <ModuleNumber $completed={isModuleComplete}>
                    {isModuleComplete ? <CheckCircle size={14} /> : index + 1}
                  </ModuleNumber>
                  <ModuleInfo>
                    <ModuleName>{module.title}</ModuleName>
                    <ModuleProgress>{completed}/{total} lessons</ModuleProgress>
                  </ModuleInfo>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </ModuleHeader>

                <TopicsList $expanded={isExpanded}>
                  {moduleTopics.map(topic => {
                    const isActive = topic._id === currentTopicId;
                    const isCompleted = isTopicCompleted(topic._id);

                    return (
                      <TopicItem
                        key={topic._id}
                        $active={isActive}
                        $completed={isCompleted}
                        onClick={() => goToTopic(topic)}
                      >
                        <TopicIcon $completed={isCompleted} $active={isActive}>
                          {isCompleted ? (
                            <CheckCircle />
                          ) : isActive ? (
                            <Play />
                          ) : (
                            <Circle />
                          )}
                        </TopicIcon>
                        <TopicTitle $active={isActive}>{topic.title}</TopicTitle>
                        <TopicDuration>{topic.estimatedMinutes || 5} min</TopicDuration>
                      </TopicItem>
                    );
                  })}
                </TopicsList>
              </ModuleItem>
            );
          })}
        </ModulesList>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <ContentHeader>
          <HeaderLeft>
            <ModuleBreadcrumb>{currentModule?.title}</ModuleBreadcrumb>
            <LessonTitle>{currentTopic?.title}</LessonTitle>
          </HeaderLeft>
          <HeaderRight>
            <Duration>
              <Clock />
              {currentTopic?.estimatedMinutes || 5} min
            </Duration>
            <NotesButton onClick={() => setNotesOpen(true)}>
              <StickyNote />
              Notes
            </NotesButton>
          </HeaderRight>
        </ContentHeader>

        <ContentArea>
          <ContentWrapper>
            {currentTopic?.contentBlocks && currentTopic.contentBlocks.length > 0 ? (
              currentTopic.contentBlocks.map((block: any) => (
                <ContentBlockRenderer
                  key={block.id}
                  block={block}
                  isEditing={false}
                  onUpdate={() => {}}
                />
              ))
            ) : (
              <>
                <VideoPlaceholder>
                  <Play />
                </VideoPlaceholder>
                <LessonContent>
                  <h3>{currentTopic?.title}</h3>
                  <p>
                    This is where the lesson content would appear. For video lessons, there would be a 
                    transcript and supplementary materials. For text lessons, the full reading content 
                    would be displayed here. For quizzes, interactive questions would be presented.
                  </p>
                </LessonContent>
              </>
            )}
          </ContentWrapper>
        </ContentArea>

        <ContentFooter>
          <NavButton
            disabled={!hasPrevious}
            onClick={goToPrevious}
          >
            <ChevronLeft />
            Previous
          </NavButton>
          
          <MarkCompleteButton
            $completed={isTopicCompleted(currentTopicId || '')}
            onClick={handleMarkComplete}
          >
            <CheckCircle />
            {isTopicCompleted(currentTopicId || '') ? 'Completed' : 'Mark Complete'}
          </MarkCompleteButton>
          
          <NavButton
            $variant="primary"
            disabled={!hasNext}
            onClick={goToNext}
          >
            Next Lesson
            <ChevronRight />
          </NavButton>
        </ContentFooter>
      </MainContent>

      {/* Notes Panel */}
      <Overlay $visible={notesOpen} onClick={() => setNotesOpen(false)} />
      <NotesPanel $open={notesOpen}>
        <NotesPanelHeader>
          <NotesPanelTitle>
            <StickyNote />
            Notes for this lesson
          </NotesPanelTitle>
          <CloseNotesButton onClick={() => setNotesOpen(false)}>
            <X size={20} />
          </CloseNotesButton>
        </NotesPanelHeader>

        <NotesPanelContent>
          <NoteForm>
            <NoteInput
              type="text"
              placeholder="Note title (optional)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <NoteTextarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <SaveNoteButton
              onClick={handleSaveNote}
              disabled={!noteContent.trim()}
            >
              <Save />
              {editingNoteId ? 'Update Note' : 'Save Note'}
            </SaveNoteButton>
          </NoteForm>

          <NotesListTitle>Your notes</NotesListTitle>
          <NotesList>
            {currentTopicNotes.length === 0 ? (
              <EmptyNotes>No notes yet</EmptyNotes>
            ) : (
              currentTopicNotes.map(note => (
                <NoteCard key={note._id}>
                  <NoteCardHeader>
                    <NoteCardTitle>{note.title || 'Untitled'}</NoteCardTitle>
                    <NoteCardActions>
                      <NoteActionButton onClick={() => handleEditNote(note)}>
                        <Edit2 />
                      </NoteActionButton>
                      <NoteActionButton 
                        className="delete"
                        onClick={() => handleDeleteNote(note._id)}
                      >
                        <Trash2 />
                      </NoteActionButton>
                    </NoteCardActions>
                  </NoteCardHeader>
                  <NoteCardContent>{note.content}</NoteCardContent>
                  <NoteCardDate>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </NoteCardDate>
                </NoteCard>
              ))
            )}
          </NotesList>
        </NotesPanelContent>
      </NotesPanel>

      {/* Toast */}
      <Toast $visible={showToast}>
        <ToastTitle>{toastMessage.title}</ToastTitle>
        <ToastMessage>{toastMessage.message}</ToastMessage>
      </Toast>
    </PlayerContainer>
  );
};

export default LearnerCoursePlayer;
