import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Trash2, ChevronDown, Upload, Copy, GripVertical, FileText, Eye, Check } from 'lucide-react';
import { Courses } from '../api/courses';
import { Modules } from '../api/modules';
import { Topics } from '../api/topics';
import { Quizzes } from '../api/quizzes';
import { TopicCard } from '../components/TopicCard';
import { QuizCard } from '../components/QuizCard';
import { useToast, ToastManager } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import type { ModuleDoc } from '../api/modules';
import type { TopicDoc } from '../api/topics';
import type { QuizDoc } from '../api/quizzes';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #e5e7eb;
  height: 48px;
  position: relative;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  background: white;
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
  
  a {
    color: #6b7280;
    text-decoration: none;
    
    &:hover {
      color: #3b82f6;
      text-decoration: underline;
    }
  }
  
  span.separator {
    color: #9ca3af;
  }
  
  span.current {
    color: #111827;
    font-weight: 500;
  }
`;

const DraftBadge = styled.span`
  background: #0ea5e9;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 12px;
  text-transform: capitalize;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
`;

const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  
  svg {
    color: #10b981;
  }
`;

const PreviewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: white;
  flex: 1;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const CourseTitle = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 600;
  color: #111827 !important;
  margin: 0;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 10;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const HeaderTitleInput = styled.input`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  padding: 4px 8px;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  outline: none;
  text-align: center;
  min-width: 200px;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f97316;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ea580c;
  }
  
  &:disabled {
    background: #fdba74;
    cursor: not-allowed;
  }
`;

const SplitContainer = styled.div`
  display: flex;
  height: calc(100vh - 48px);
`;

const LeftPanel = styled.div`
  width: 33.333%;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  background: white;
`;

const RightPanel = styled.div`
  flex: 1;
  background: #f9fafb;
  overflow-y: auto;
`;

const FormSection = styled.div`
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
  font-style: italic;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Required = styled.span`
  color: #dc2626;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ObjectiveRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: start;
  margin-bottom: 12px;
`;

const RemoveButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: #dc2626;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #fee2e2;
  }
`;

const UploadBox = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #6b7280;
  
  svg {
    margin: 0 auto 8px;
  }
`;

const CourseOutlineSection = styled.div`
  padding: 24px;
`;

const OutlineHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const OutlineTitleSection = styled.div``;

const OutlineTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const OutlineSubtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0 0;
`;

const OutlineHeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const OutlineStats = styled.div`
  font-size: 14px;
  color: #374151;
  text-align: right;
  
  .total {
    font-weight: 600;
  }
  
  .details {
    font-size: 13px;
    color: #6b7280;
  }
`;


const ModuleCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
`;

const DragHandle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #d1d5db;
  cursor: grab;
  padding: 4px;
  
  &:hover {
    color: #9ca3af;
  }
`;

const ModuleIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #dbeafe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
`;

const ModuleInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModuleLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const ModuleTitleText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
  }
`;

const ModuleTitleInput = styled.input`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModuleMeta = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`;

const ModuleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #9ca3af;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
  
  &:hover.delete {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const ModuleContent = styled.div`
  border-top: 1px solid #e5e7eb;
  padding: 20px 24px;
  background: white;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#1e3a5f' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#1e3a5f' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #1e3a5f;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const SmallButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: ${props => props.$primary ? '#f97316' : 'white'};
  border: 1px solid ${props => props.$primary ? '#f97316' : '#d1d5db'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$primary ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$primary ? '#ea580c' : '#f9fafb'};
    border-color: ${props => props.$primary ? '#ea580c' : '#9ca3af'};
  }
`;

const ContentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const EmptyState = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`;

const AddModuleButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: var(--color-primary, #6366f1);
    color: var(--color-primary, #6366f1);
    background: rgba(99, 102, 241, 0.05);
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #6b7280;
`;

const ErrorState = styled.div`
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  color: #991b1b;
  margin-bottom: 24px;
`;

interface CourseFormData {
  title: string;
  topic: string;
  description: string;
  learnerAudience: string;
  learningObjectives: string[];
}

const CourseBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const isNewCourse = courseId === 'new' || !courseId;
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Form state
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    topic: '',
    description: '',
    learnerAudience: 'All Levels',
    learningObjectives: [''],
  });

  // UI state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<Record<string, 'goals' | 'contents'>>({});
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingQuizTitle, setEditingQuizTitle] = useState('');
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const [headerTitleValue, setHeaderTitleValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const hasInitializedModules = useRef(false);
  
  // Local state for module fields to avoid race conditions
  const [localModuleGoals, setLocalModuleGoals] = useState<Record<string, string>>({});
  const [localModuleDurations, setLocalModuleDurations] = useState<Record<string, number>>({});
  const moduleGoalsSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const moduleDurationSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Subscribe to data
  const { course, modules, topics, quizzes, isLoading } = useTracker(() => {
    if (isNewCourse || !courseId) {
      return {
        course: null,
        modules: [],
        topics: [],
        quizzes: [],
        isLoading: false,
      };
    }

    const courseHandle = Meteor.subscribe('courses.single', courseId);
    const structureHandle = Meteor.subscribe('course.fullStructure', courseId);

    return {
      course: Courses.findOne(courseId),
      modules: Modules.find({ courseId }, { sort: { order: 1 } }).fetch(),
      topics: Topics.find({ courseId }, { sort: { order: 1 } }).fetch(),
      quizzes: Quizzes.find({ courseId }, { sort: { order: 1 } }).fetch(),
      isLoading: !courseHandle.ready() || !structureHandle.ready(),
    };
  }, [courseId, isNewCourse]);

  // Load course data
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        topic: course.title || '',
        description: course.description || '',
        learnerAudience: (course as any).learnerAudience || 'All Levels',
        learningObjectives: (course as any).learningObjectives?.length > 0 
          ? (course as any).learningObjectives 
          : [''],
      });
    }
  }, [course]);

  // Expand first module by default on initial load only
  useEffect(() => {
    if (modules.length > 0 && !hasInitializedModules.current) {
      setExpandedModules(new Set([modules[0]._id]));
      hasInitializedModules.current = true;
    }
  }, [modules.length]);

  // Auto-save
  const autoSaveCourse = async () => {
    if (isNewCourse || !courseId || !formData.topic.trim()) {
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('courses.update', courseId, {
          title: formData.topic.trim(),
          description: formData.description.trim(),
          learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
          learnerAudience: formData.learnerAudience.trim(),
        }, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Handle module description change with debounce to prevent race conditions
  const handleModuleGoalsChange = (moduleId: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalModuleGoals(prev => ({ ...prev, [moduleId]: value }));
    
    // Clear existing timeout for this module
    if (moduleGoalsSaveTimeouts.current[moduleId]) {
      clearTimeout(moduleGoalsSaveTimeouts.current[moduleId]);
    }
    
    // Debounce the server save (500ms delay)
    moduleGoalsSaveTimeouts.current[moduleId] = setTimeout(() => {
      Meteor.call('modules.update', moduleId, { goals: value });
    }, 500);
  };

  // Get module goals value (local state takes priority, then server data)
  const getModuleGoals = (module: ModuleDoc): string => {
    if (localModuleGoals.hasOwnProperty(module._id)) {
      return localModuleGoals[module._id];
    }
    return module.goals || '';
  };

  // Handle module duration change with debounce
  const handleModuleDurationChange = (moduleId: string, value: number) => {
    setLocalModuleDurations(prev => ({ ...prev, [moduleId]: value }));
    
    if (moduleDurationSaveTimeouts.current[moduleId]) {
      clearTimeout(moduleDurationSaveTimeouts.current[moduleId]);
    }
    
    moduleDurationSaveTimeouts.current[moduleId] = setTimeout(() => {
      Meteor.call('modules.update', moduleId, { estimatedMinutes: value });
    }, 500);
  };

  // Get module duration value - calculated dynamically from topics and quizzes
  const getModuleDuration = (module: ModuleDoc): number => {
    // Get all topics belonging to this module
    const moduleTopics = topics.filter(t => t.moduleId === module._id);
    const moduleQuizzes = quizzes.filter(q => q.moduleId === module._id);
    
    // Sum up estimated minutes from topics (default 5 min per topic)
    const topicsDuration = moduleTopics.reduce((sum, topic) => {
      return sum + (topic.estimatedMinutes || 5);
    }, 0);
    
    // Sum up estimated minutes from quizzes (default 5 min per quiz)
    const quizzesDuration = moduleQuizzes.reduce((sum, quiz) => {
      return sum + (quiz.estimatedMinutes || 5);
    }, 0);
    
    return topicsDuration + quizzesDuration;
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    const timeout = setTimeout(() => {
      // Use the new value directly to avoid stale closure
      if (isNewCourse || !courseId || !newFormData.topic.trim()) {
        return;
      }
      Meteor.call('courses.update', courseId, {
        title: newFormData.topic.trim(),
        description: newFormData.description.trim(),
        learningObjectives: newFormData.learningObjectives.filter(obj => obj.trim() !== ''),
        learnerAudience: newFormData.learnerAudience.trim(),
      }, (error: any) => {
        if (error) console.error('Auto-save failed:', error);
      });
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  // Header title editing
  const handleStartEditingHeaderTitle = () => {
    setHeaderTitleValue(formData.topic);
    setIsEditingHeaderTitle(true);
  };

  const handleFinishEditingHeaderTitle = () => {
    const trimmedTitle = headerTitleValue.trim();
    if (trimmedTitle) {
      setFormData(prev => ({ ...prev, topic: trimmedTitle, title: trimmedTitle }));
      // Trigger auto-save with the new value directly
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
      if (!isNewCourse && courseId) {
        const timeout = setTimeout(() => {
          Meteor.call('courses.update', courseId, {
            title: trimmedTitle,
            description: formData.description.trim(),
            learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
            learnerAudience: formData.learnerAudience.trim(),
          }, (error: any) => {
            if (error) console.error('Auto-save failed:', error);
          });
        }, 500);
        setAutoSaveTimeout(timeout);
      }
    }
    setIsEditingHeaderTitle(false);
  };

  const handleSaveCourse = async () => {
    if (!formData.topic.trim()) {
      toast.warning('Please enter a course topic');
      return;
    }

    setIsSaving(true);

    try {
      if (isNewCourse) {
        // Create new course
        await new Promise((resolve, reject) => {
          Meteor.call('courses.insert', {
            title: formData.topic.trim(),
            description: formData.description.trim(),
            learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
            learnerAudience: formData.learnerAudience.trim(),
          }, (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          });
        }).then((newCourseId) => {
          navigate(`/admin/lms/builder/${newCourseId}`, { replace: true });
          toast.success('Course created successfully!');
        });
      } else {
        // Update existing course
        await new Promise((resolve, reject) => {
          Meteor.call('courses.update', courseId, {
            title: formData.topic.trim(),
            description: formData.description.trim(),
            learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
            learnerAudience: formData.learnerAudience.trim(),
          }, (error: any) => {
            if (error) reject(error);
            else resolve(true);
          });
        });
        toast.success('Course saved successfully!');
      }
    } catch (error: any) {
      console.error('Course save error:', error);
      const errorMessage = error.reason || error.message || 'Unknown error';
      toast.error(`Failed to save course: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Module management
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set<string>();
      // If clicking on already open module, close it. Otherwise, open only this module
      if (!prev.has(moduleId)) {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleAddModule = async () => {
    if (isNewCourse) {
      toast.warning('Please save the course first before adding modules');
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('modules.create', courseId, {
          title: `Module ${modules.length + 1}`,
          estimatedMinutes: 60,
        }, (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (error: any) {
      toast.error('Failed to add module: ' + error.message);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    const confirmed = await confirm({
      title: 'Delete Module?',
      message: 'This will permanently delete this module and all topics and quizzes inside it. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('modules.delete', moduleId, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    } catch (error: any) {
      toast.error('Failed to delete module: ' + error.message);
    }
  };

  const handleCopyModule = async (moduleId: string) => {
    try {
      await new Promise((resolve, reject) => {
        Meteor.call('modules.copy', moduleId, (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      toast.success('Module copied successfully!');
    } catch (error: any) {
      toast.error('Failed to copy module: ' + error.message);
    }
  };

  const handleModuleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    // Reorder the modules array
    const reorderedModules = Array.from(modules);
    const [removed] = reorderedModules.splice(sourceIndex, 1);
    reorderedModules.splice(destIndex, 0, removed);

    // Get the new order of module IDs
    const moduleIds = reorderedModules.map(m => m._id);

    // Call the server to update the order
    Meteor.call('modules.reorder', courseId, moduleIds, (error: any) => {
      if (error) {
        toast.error('Failed to reorder modules: ' + error.message);
      }
    });
  }, [modules, courseId, toast]);

  // Topic drag and drop
  const handleTopicDragEnd = useCallback((moduleId: string) => (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    // Get topics for this module
    const moduleTopics = topics.filter(t => t.moduleId === moduleId).sort((a, b) => a.order - b.order);
    
    // Reorder the topics array
    const reorderedTopics = Array.from(moduleTopics);
    const [removed] = reorderedTopics.splice(sourceIndex, 1);
    reorderedTopics.splice(destIndex, 0, removed);

    // Get the new order of topic IDs
    const topicIds = reorderedTopics.map(t => t._id);

    // Call the server to update the order
    Meteor.call('topics.reorder', moduleId, topicIds, (error: any) => {
      if (error) {
        toast.error('Failed to reorder topics: ' + error.message);
      }
    });
  }, [topics, toast]);

  // Quiz drag and drop
  const handleQuizDragEnd = useCallback((moduleId: string) => (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    // Get quizzes for this module
    const moduleQuizzes = quizzes.filter(q => q.moduleId === moduleId).sort((a, b) => a.order - b.order);
    
    // Reorder the quizzes array
    const reorderedQuizzes = Array.from(moduleQuizzes);
    const [removed] = reorderedQuizzes.splice(sourceIndex, 1);
    reorderedQuizzes.splice(destIndex, 0, removed);

    // Get the new order of quiz IDs
    const quizIds = reorderedQuizzes.map(q => q._id);

    // Call the server to update the order
    Meteor.call('quizzes.reorder', moduleId, quizIds, (error: any) => {
      if (error) {
        toast.error('Failed to reorder quizzes: ' + error.message);
      }
    });
  }, [quizzes, toast]);

  const handleStartEditingModule = (moduleId: string, currentTitle: string) => {
    setEditingModuleId(moduleId);
    setEditingTitle(currentTitle);
  };

  const handleFinishEditingModule = async (moduleId: string) => {
    if (editingTitle.trim()) {
      try {
        await new Promise((resolve, reject) => {
          Meteor.call('modules.update', moduleId, {
            title: editingTitle.trim(),
          }, (error: any) => {
            if (error) reject(error);
            else resolve(true);
          });
        });
      } catch (error: any) {
        toast.error('Failed to save module name: ' + error.message);
      }
    }
    setEditingModuleId(null);
    setEditingTitle('');
  };

  // Topic management
  const handleAddTopic = async (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    if (!module) return;

    // Keep only this module expanded when adding a topic
    setExpandedModules(new Set([moduleId]));

    const topicsInModule = topics.filter(t => t.moduleId === moduleId);
    const topicNumber = topicsInModule.length + 1;

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('topics.create', courseId, moduleId, {
          title: `Topic ${topicNumber}`,
          description: '',
        }, (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (error: any) {
      toast.error('Failed to add topic: ' + error.message);
    }
  };

  const handleDeleteTopic = async (moduleId: string, topicId: string) => {
    const confirmed = await confirm({
      title: 'Delete Topic?',
      message: 'Are you sure you want to delete this topic? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('topics.delete', topicId, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    } catch (error: any) {
      toast.error('Failed to delete topic: ' + error.message);
    }
  };

  const handleStartEditingTopic = (topicId: string, currentTitle: string) => {
    setEditingTopicId(topicId);
    setEditingTopicTitle(currentTitle);
  };

  const handleFinishEditingTopic = async (moduleId: string, topicId: string) => {
    if (editingTopicTitle.trim()) {
      try {
        await new Promise((resolve, reject) => {
          Meteor.call('topics.update', topicId, {
            title: editingTopicTitle.trim(),
          }, (error: any) => {
            if (error) reject(error);
            else resolve(true);
          });
        });
      } catch (error: any) {
        toast.error('Failed to save topic title: ' + error.message);
      }
    }
    setEditingTopicId(null);
    setEditingTopicTitle('');
  };

  // Quiz management
  const handleAddQuiz = async (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    if (!module) return;

    // Keep only this module expanded when adding a quiz
    setExpandedModules(new Set([moduleId]));

    const quizzesInModule = quizzes.filter(q => q.moduleId === moduleId);
    const quizNumber = quizzesInModule.length + 1;

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('quizzes.create', courseId, moduleId, {
          title: `Quiz #${quizNumber}: Evaluation`,
          description: '',
        }, (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (error: any) {
      toast.error('Failed to add quiz: ' + error.message);
    }
  };

  const handleDeleteQuiz = async (moduleId: string, quizId: string) => {
    const confirmed = await confirm({
      title: 'Delete Quiz?',
      message: 'Are you sure you want to delete this quiz? All questions will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await new Promise((resolve, reject) => {
        Meteor.call('quizzes.delete', quizId, (error: any) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    } catch (error: any) {
      toast.error('Failed to delete quiz: ' + error.message);
    }
  };

  const handleStartEditingQuiz = (quizId: string, currentTitle: string) => {
    setEditingQuizId(quizId);
    setEditingQuizTitle(currentTitle);
  };

  const handleFinishEditingQuiz = async (moduleId: string, quizId: string) => {
    if (editingQuizTitle.trim()) {
      try {
        await new Promise((resolve, reject) => {
          Meteor.call('quizzes.update', quizId, {
            title: editingQuizTitle.trim(),
          }, (error: any) => {
            if (error) reject(error);
            else resolve(true);
          });
        });
      } catch (error: any) {
        toast.error('Failed to save quiz title: ' + error.message);
      }
    }
    setEditingQuizId(null);
    setEditingQuizTitle('');
  };

  // Calculate total length - dynamically from all topics and quizzes
  const getTotalLength = () => {
    const totalMinutes = modules.reduce((sum, module) => sum + getModuleDuration(module), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Get total topics count
  const getTotalTopics = () => {
    return topics.length;
  };

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Breadcrumb>
          <a href="/admin/lms">Programs</a>
          <span className="separator">/</span>
          <a href="/admin/lms">Courses</a>
          <span className="separator">/</span>
          <span className="current">{formData.topic || 'Untitled Course'}</span>
          <DraftBadge>Draft</DraftBadge>
        </Breadcrumb>
        {isEditingHeaderTitle ? (
          <HeaderTitleInput
            type="text"
            value={headerTitleValue}
            onChange={(e) => setHeaderTitleValue(e.target.value)}
            onBlur={handleFinishEditingHeaderTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishEditingHeaderTitle();
              if (e.key === 'Escape') setIsEditingHeaderTitle(false);
            }}
            autoFocus
          />
        ) : (
          <CourseTitle onClick={handleStartEditingHeaderTitle}>
            {formData.topic || 'Untitled Course'}
          </CourseTitle>
        )}
        <HeaderContent>
          <HeaderActions>
            <SaveStatus>
              <Check size={16} />
              All changes saved · just now
            </SaveStatus>
            <PreviewButton>
              <Eye size={16} />
              Preview learner view
            </PreviewButton>
            <SaveButton
              onClick={handleSaveCourse}
              disabled={isSaving || !formData.topic.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </SaveButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      {/* Split Screen */}
      <SplitContainer>
        {/* Left Panel - Course Form */}
        <LeftPanel>
          <FormSection>
            <SectionTitle>Course Setup</SectionTitle>
            <SectionSubtitle>
              These details appear on the course page and help us generate a tailored outline.
            </SectionSubtitle>

            <FormGroup>
              <Label>
                Course Topic <Required>*</Required>
              </Label>
              <Input
                type="text"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="e.g., Digital Marketing Fundamentals"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                Learning Objectives <Required>*</Required>
              </Label>
              <TextArea
                value={formData.learningObjectives.join('\n• ')}
                onChange={(e) => {
                  const value = e.target.value;
                  const objectives = value.split('\n• ').map(obj => obj.replace(/^• /, ''));
                  handleInputChange('learningObjectives', objectives.filter(obj => obj.trim() !== ''));
                }}
                placeholder="By the end of this course, learners will be able to:
• Identify key concepts
• Apply learned skills"
                rows={4}
              />
              <HelperText>What will learners be able to do by the end of this course?</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>
                Learner Audience <Required>*</Required>
              </Label>
              <Input
                type="text"
                value={formData.learnerAudience}
                onChange={(e) => handleInputChange('learnerAudience', e.target.value)}
                placeholder="e.g., New Managers, Team Leaders, Emerging Leaders"
              />
              <HelperText>Who is this course for?</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Course Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the course"
                rows={4}
              />
            </FormGroup>

            <FormGroup>
              <Label>Upload Content</Label>
              <UploadBox>
                <Upload size={24} />
                <p>Drop files here or click to upload</p>
              </UploadBox>
            </FormGroup>
          </FormSection>
        </LeftPanel>

        {/* Right Panel - Course Outline */}
        <RightPanel>
          <CourseOutlineSection>
            {isLoading ? (
              <LoadingState>Loading course data...</LoadingState>
            ) : (
              <>
                <OutlineHeader>
                  <OutlineTitleSection>
                    <OutlineTitle>Course Outline</OutlineTitle>
                    <OutlineSubtitle>Drag to reorder modules and topics. Click any topic to edit its content.</OutlineSubtitle>
                  </OutlineTitleSection>
                  <OutlineHeaderRight>
                    <OutlineStats>
                      <div className="total">Total length: {getTotalLength()}</div>
                      <div className="details">{modules.length} modules · {getTotalTopics()} topics</div>
                    </OutlineStats>
                  </OutlineHeaderRight>
                </OutlineHeader>

                {modules.length > 0 ? (
                  <DragDropContext onDragEnd={handleModuleDragEnd}>
                    <Droppable droppableId="modules">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {modules.map((module, index) => {
                            const moduleTopics = topics.filter(t => t.moduleId === module._id);
                            const moduleQuizzes = quizzes.filter(q => q.moduleId === module._id);
                            const isExpanded = expandedModules.has(module._id);
                            const currentTab = selectedTab[module._id] || 'contents';

                            // Calculate module duration
                            const moduleDuration = getModuleDuration(module);
                            const durationDisplay = moduleDuration >= 60 
                              ? `${Math.floor(moduleDuration / 60)}h ${moduleDuration % 60}m`
                              : `${moduleDuration}m`;

                            return (
                              <Draggable key={module._id} draggableId={module._id} index={index}>
                                {(provided, snapshot) => (
                                  <ModuleCard
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.9 : 1,
                                    }}
                                  >
                                    <ModuleHeader>
                                      <DragHandle {...provided.dragHandleProps}>
                                        <GripVertical size={20} />
                                      </DragHandle>
                            <ModuleIcon>
                              <FileText size={20} />
                            </ModuleIcon>
                            <ModuleInfo>
                              <ModuleLabel>MODULE {module.order}</ModuleLabel>
                              {editingModuleId === module._id ? (
                                <ModuleTitleInput
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onBlur={() => handleFinishEditingModule(module._id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFinishEditingModule(module._id);
                                    if (e.key === 'Escape') {
                                      setEditingModuleId(null);
                                      setEditingTitle('');
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                              ) : (
                                <ModuleTitleText
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditingModule(module._id, module.title);
                                  }}
                                >
                                  {module.title}
                                </ModuleTitleText>
                              )}
                              <ModuleMeta>
                                {moduleTopics.length} topics · ~{durationDisplay}
                              </ModuleMeta>
                            </ModuleInfo>
                            <ModuleActions>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyModule(module._id);
                                }}
                                title="Copy module"
                              >
                                <Copy size={16} />
                              </IconButton>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModule(module._id);
                                }}
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                              </IconButton>
                              <IconButton
                                className="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(module._id);
                                }}
                                title="Delete module"
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </ModuleActions>
                          </ModuleHeader>

                          {isExpanded && (
                            <ModuleContent>
                              <TabsContainer>
                                <Tab
                                  active={currentTab === 'contents'}
                                  onClick={() => setSelectedTab(prev => ({ ...prev, [module._id]: 'contents' }))}
                                >
                                  Contents
                                </Tab>
                                <Tab
                                  active={currentTab === 'goals'}
                                  onClick={() => setSelectedTab(prev => ({ ...prev, [module._id]: 'goals' }))}
                                >
                                  Goals
                                </Tab>
                              </TabsContainer>

                              {currentTab === 'contents' && (
                                <>
                                  <ButtonGroup>
                                    <SmallButton $primary onClick={() => handleAddTopic(module._id)}>
                                      <Plus size={14} />
                                      New Topic
                                    </SmallButton>
                                    <SmallButton onClick={() => handleAddQuiz(module._id)}>
                                      <Plus size={14} />
                                      New Quiz
                                    </SmallButton>
                                  </ButtonGroup>

                                  {moduleTopics.length > 0 || moduleQuizzes.length > 0 ? (
                                    <>
                                      {moduleTopics.length > 0 && (
                                        <DragDropContext onDragEnd={handleTopicDragEnd(module._id)}>
                                          <Droppable droppableId={`topics-${module._id}`}>
                                            {(provided) => (
                                              <ContentList
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                              >
                                                {moduleTopics.map((topic, index) => (
                                                  <Draggable key={topic._id} draggableId={`topic-${topic._id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                      >
                                                        <TopicCard
                                                          topic={{ ...topic, id: topic._id }}
                                                          moduleId={module._id}
                                                          courseId={courseId || ''}
                                                          onDelete={handleDeleteTopic}
                                                          isEditing={editingTopicId === topic._id}
                                                          editingTitle={editingTopicTitle}
                                                          onStartEdit={handleStartEditingTopic}
                                                          onFinishEdit={handleFinishEditingTopic}
                                                          onCancelEdit={() => {
                                                            setEditingTopicId(null);
                                                            setEditingTopicTitle('');
                                                          }}
                                                          onTitleChange={setEditingTopicTitle}
                                                        />
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {provided.placeholder}
                                              </ContentList>
                                            )}
                                          </Droppable>
                                        </DragDropContext>
                                      )}
                                      {moduleQuizzes.length > 0 && (
                                        <DragDropContext onDragEnd={handleQuizDragEnd(module._id)}>
                                          <Droppable droppableId={`quizzes-${module._id}`}>
                                            {(provided) => (
                                              <ContentList
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{ marginTop: moduleTopics.length > 0 ? '8px' : '0' }}
                                              >
                                                {moduleQuizzes.map((quiz, index) => (
                                                  <Draggable key={quiz._id} draggableId={`quiz-${quiz._id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                      >
                                                        <QuizCard
                                                          quiz={{ ...quiz, id: quiz._id }}
                                                          moduleId={module._id}
                                                          courseId={courseId || ''}
                                                          onDelete={handleDeleteQuiz}
                                                          isEditing={editingQuizId === quiz._id}
                                                          editingTitle={editingQuizTitle}
                                                          onStartEdit={handleStartEditingQuiz}
                                                          onFinishEdit={handleFinishEditingQuiz}
                                                          onCancelEdit={() => {
                                                            setEditingQuizId(null);
                                                            setEditingQuizTitle('');
                                                          }}
                                                          onTitleChange={setEditingQuizTitle}
                                                        />
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {provided.placeholder}
                                              </ContentList>
                                            )}
                                          </Droppable>
                                        </DragDropContext>
                                      )}
                                    </>
                                  ) : (
                                    <EmptyState>
                                      No content yet. Click buttons above to add topics or quizzes.
                                    </EmptyState>
                                  )}
                                </>
                              )}

                              {currentTab === 'goals' && (
                                <div>
                                  {/* Estimated Duration - Hidden for now
                                  <FormGroup>
                                    <Label>Estimated Duration</Label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Input
                                        type="number"
                                        value={getModuleDuration(module)}
                                        onChange={(e) => handleModuleDurationChange(module._id, parseInt(e.target.value) || 0)}
                                        min="0"
                                        style={{ width: '80px' }}
                                        placeholder="60"
                                      />
                                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Minutes</span>
                                    </div>
                                  </FormGroup>
                                  */}
                                  <FormGroup>
                                    <Label>Module Description</Label>
                                    <TextArea
                                      value={getModuleGoals(module)}
                                      onChange={(e) => handleModuleGoalsChange(module._id, e.target.value)}
                                      placeholder="Describe what this module covers..."
                                      rows={4}
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </ModuleContent>
                          )}
                        </ModuleCard>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <AddModuleButton onClick={handleAddModule}>
            <Plus size={16} />
            <span>Add New Module</span>
          </AddModuleButton>
        </DragDropContext>
      ) : (
        <EmptyState>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Start building your course
          </h3>
          <p style={{ marginBottom: '24px' }}>
            Fill in the course details on the left, then add modules here.
          </p>
          <SmallButton onClick={handleAddModule} style={{ margin: '0 auto' }}>
            <Plus size={16} />
            Build manually
          </SmallButton>
        </EmptyState>
      )}
              </>
            )}
          </CourseOutlineSection>
        </RightPanel>
      </SplitContainer>
      
      {/* Toast Notifications */}
      <ToastManager toasts={toast.toasts} onRemove={toast.removeToast} />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </PageContainer>
  );
};

export default CourseBuilder;
