import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, Upload } from 'lucide-react';
import { Courses } from '../api/courses';
import { Modules } from '../api/modules';
import { Topics } from '../api/topics';
import { Quizzes } from '../api/quizzes';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';
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
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const BuilderBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary, #6366f1);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
`;

const BetaBadge = styled.span`
  font-size: 11px;
  background: #f97316;
  padding: 2px 6px;
  border-radius: 4px;
`;

const SaveButton = styled(Button)`
  min-width: 100px;
`;

const SplitContainer = styled.div`
  display: flex;
  height: calc(100vh - 73px);
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const OutlineTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const OutlineStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ModuleTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ModuleTitleInput = styled.input`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 6px 10px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModuleTitleText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
  }
`;

const ModuleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 16px;
  background: #f9fafb;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--color-primary, #6366f1)' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary, #6366f1)' : 'transparent'};
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: var(--color-primary, #6366f1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SmallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--color-primary, #6366f1);
    color: var(--color-primary, #6366f1);
    background: rgba(99, 102, 241, 0.05);
  }
`;

const ContentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const hasInitializedModules = useRef(false);

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

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    const timeout = setTimeout(() => {
      autoSaveCourse();
    }, 2000);

    setAutoSaveTimeout(timeout);
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

  // Calculate total length
  const getTotalLength = () => {
    const totalMinutes = modules.reduce((sum, module) => sum + module.estimatedMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/admin/lms')}>
              <ArrowLeft size={20} />
            </BackButton>
            <BuilderBadge>
              <span>Course Builder</span>
              <BetaBadge>BETA</BetaBadge>
            </BuilderBadge>
          </HeaderLeft>
          <SaveButton
            variant="primary"
            onClick={handleSaveCourse}
            disabled={isSaving || !formData.topic.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </SaveButton>
        </HeaderContent>
      </Header>

      {/* Split Screen */}
      <SplitContainer>
        {/* Left Panel - Course Form */}
        <LeftPanel>
          <FormSection>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Generate course outline
            </h2>

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
              {formData.learningObjectives.map((objective, index) => (
                <ObjectiveRow key={index}>
                  <TextArea
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...formData.learningObjectives];
                      newObjectives[index] = e.target.value;
                      handleInputChange('learningObjectives', newObjectives);
                    }}
                    placeholder={`Learning objective ${index + 1}`}
                    rows={2}
                  />
                  {formData.learningObjectives.length > 1 && (
                    <RemoveButton
                      onClick={() => {
                        const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
                        handleInputChange('learningObjectives', newObjectives);
                      }}
                    >
                      <Trash2 size={14} />
                    </RemoveButton>
                  )}
                </ObjectiveRow>
              ))}
              <SmallButton
                onClick={() => {
                  handleInputChange('learningObjectives', [...formData.learningObjectives, '']);
                }}
                style={{ marginTop: '8px' }}
              >
                <Plus size={14} />
                Add Objective
              </SmallButton>
            </FormGroup>

            <FormGroup>
              <Label>
                Learner Audience <Required>*</Required>
              </Label>
              <TextArea
                value={formData.learnerAudience}
                onChange={(e) => handleInputChange('learnerAudience', e.target.value)}
                placeholder="Describe your target audience"
                rows={3}
              />
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
                  <OutlineTitle>Course Outline</OutlineTitle>
                  <OutlineStats>
                    <span>✓ Saved</span>
                    <span>Total length: {getTotalLength()}</span>
                  </OutlineStats>
                </OutlineHeader>

                {modules.length > 0 ? (
                  <>
                    {modules.map((module) => {
                      const moduleTopics = topics.filter(t => t.moduleId === module._id);
                      const moduleQuizzes = quizzes.filter(q => q.moduleId === module._id);
                      const isExpanded = expandedModules.has(module._id);
                      const currentTab = selectedTab[module._id] || 'contents';

                      return (
                        <ModuleCard key={module._id}>
                          <ModuleHeader onClick={() => toggleModule(module._id)}>
                            <ModuleTitle>
                              <IconButton as="div">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </IconButton>
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
                                  {module.order}. {module.title}
                                </ModuleTitleText>
                              )}
                            </ModuleTitle>
                            <ModuleActions>
                              <IconButton
                                className="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(module._id);
                                }}
                              >
                                <Trash2 size={14} />
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
                                    <SmallButton onClick={() => handleAddTopic(module._id)}>
                                      <Plus size={14} />
                                      New Topic
                                    </SmallButton>
                                    <SmallButton onClick={() => handleAddQuiz(module._id)}>
                                      ✓ New Quiz
                                    </SmallButton>
                                  </ButtonGroup>

                                  {moduleTopics.length > 0 || moduleQuizzes.length > 0 ? (
                                    <ContentList>
                                      {moduleTopics.map((topic) => (
                                        <TopicCard
                                          key={topic._id}
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
                                      ))}
                                      {moduleQuizzes.map((quiz) => (
                                        <QuizCard
                                          key={quiz._id}
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
                                      ))}
                                    </ContentList>
                                  ) : (
                                    <EmptyState>
                                      No content yet. Click buttons above to add topics or quizzes.
                                    </EmptyState>
                                  )}
                                </>
                              )}

                              {currentTab === 'goals' && (
                                <div>
                                  <FormGroup>
                                    <Label>Estimated Duration</Label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Input
                                        type="number"
                                        value={module.estimatedMinutes}
                                        onChange={(e) => {
                                          const minutes = parseInt(e.target.value) || 0;
                                          Meteor.call('modules.update', module._id, {
                                            estimatedMinutes: minutes,
                                          }, (error: any) => {
                                            if (error) {
                                              toast.error('Failed to update duration: ' + error.message);
                                            }
                                          });
                                        }}
                                        min="0"
                                        style={{ width: '80px' }}
                                        placeholder="60"
                                      />
                                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Minutes</span>
                                    </div>
                                  </FormGroup>
                                  <FormGroup>
                                    <Label>Module Description</Label>
                                    <TextArea
                                      value={module.goals || ''}
                                      onChange={(e) => {
                                        Meteor.call('modules.update', module._id, {
                                          goals: e.target.value,
                                        });
                                      }}
                                      placeholder="Describe what this module covers..."
                                      rows={4}
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </ModuleContent>
                          )}
                        </ModuleCard>
                      );
                    })}

                    <AddModuleButton onClick={handleAddModule}>
                      <Plus size={16} />
                      <span>Add Module</span>
                    </AddModuleButton>
                  </>
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
