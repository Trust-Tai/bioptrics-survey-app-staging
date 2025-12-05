import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { ArrowLeft, Plus, GripVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { Courses } from '../api/courses';
import { Modules } from '../api/modules';
import { Topics } from '../api/topics';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';
import { BlockLibrary } from '../components/BlockLibrary';
import { BlockSettingsPanel } from '../components/BlockSettingsPanel';
import { ContentBlockRenderer } from '../components/blocks/ContentBlockRenderer';
import { createDefaultBlock, reorderBlocks, getBlockColor } from '../utils/blockHelpers';
import type { ContentBlock, ContentBlockType } from '../types/contentBlocks';
import type { TopicDoc } from '../api/topics';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
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
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #d1d5db;
`;

const BreadcrumbCurrent = styled.span`
  color: #111827;
  font-weight: 500;
`;

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Canvas = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`;

const CanvasInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const TitleSection = styled.div`
  margin-bottom: 32px;
`;

const TitleDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  flex: 1;
`;

const EditButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #6366f1;
  }
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  background: transparent;
  border: none;
  border-bottom: 2px solid #6366f1;
  outline: none;
  padding: 4px 0;
  margin-bottom: 12px;
`;

const TitleActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveButton = styled.button`
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4b5563;
  }
`;

const ContentSection = styled.div`
  min-height: 400px;
`;

const BlocksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BlockWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: opacity 0.2s;
`;

const BlockContainer = styled.div<{ color: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const BlockHeader = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.color}10;
  border-bottom: 1px solid #e5e7eb;
`;

const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #6b7280;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const BlockTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BlockActions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #111827;
  }
`;

const BlockContent = styled.div`
  padding: 20px;
`;

const AddBlockButton = styled.button`
  width: 100%;
  padding: 20px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 32px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const EmptyStateText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
`;

const DeleteConfirmation = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteDialog = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const DeleteTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const DeleteText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
`;

const DeleteActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`;

const SaveIndicator = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.show ? 1 : 0};
  transform: translateY(${props => props.show ? 0 : '10px'});
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 100;
`;

export const TopicEditor: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, topicId } = useParams<{ courseId: string; moduleId: string; topicId: string }>();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch data from Meteor
  const { topic, module, course, loading } = useTracker(() => {
    const topicSub = Meteor.subscribe('topics.single', topicId);
    const moduleSub = Meteor.subscribe('modules.single', moduleId);
    const courseSub = Meteor.subscribe('courses.single', courseId);
    
    const topicDoc = Topics.findOne(topicId);
    const moduleDoc = Modules.findOne(moduleId);
    const courseDoc = Courses.findOne(courseId);
    
    return {
      topic: topicDoc,
      module: moduleDoc,
      course: courseDoc,
      loading: !topicSub.ready() || !moduleSub.ready() || !courseSub.ready(),
    };
  }, [topicId, moduleId, courseId]);

  // Initialize content blocks from topic
  useEffect(() => {
    if (topic?.contentBlocks) {
      setContentBlocks(topic.contentBlocks as ContentBlock[]);
      setEditTitle(topic.title);
    }
  }, [topic?.title, topic?.contentBlocks]);

  // Auto-save function
  const autoSave = () => {
    if (!topicId) return;
    
    Meteor.call('topics.update', topicId, { contentBlocks }, (error: any) => {
      if (!error) {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    });
  };

  // Debounced auto-save
  useEffect(() => {
    if (contentBlocks.length > 0 && topic) {
      if (saveTimeout) clearTimeout(saveTimeout);
      
      const timeout = setTimeout(() => {
        autoSave();
      }, 2000);
      
      setSaveTimeout(timeout);
    }
    
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [contentBlocks]);

  const handleBackToCourseBuilder = () => {
    navigate(`/admin/lms/builder/${courseId}`);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && topicId) {
      Meteor.call('topics.update', topicId, { title: editTitle.trim() }, (error: any) => {
        if (!error) {
          setIsEditingTitle(false);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      });
    }
  };

  const handleCancelEditTitle = () => {
    setEditTitle(topic?.title || '');
    setIsEditingTitle(false);
  };

  const handleAddBlock = (blockType: ContentBlockType) => {
    const newBlock = createDefaultBlock(blockType, contentBlocks.length);
    setContentBlocks(prev => [...prev, newBlock]);
  };

  const handleUpdateBlock = (blockId: string, settings: any) => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, settings: { ...block.settings, ...settings } } : block
      )
    );
    
    // Update selected block if it's being edited
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setContentBlocks(prev => {
      const filtered = prev.filter(block => block.id !== blockId);
      // Reorder remaining blocks
      return filtered.map((block, index) => ({ ...block, order: index }));
    });
    
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    
    setDeleteConfirm(null);
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
      const reordered = reorderBlocks(contentBlocks, draggedIndex, dropIndex);
      setContentBlocks(reordered);
    }
    
    setDraggedIndex(null);
  };

  const getBlockTypeName = (type: ContentBlockType): string => {
    switch (type) {
      case 'rich-text': return 'Rich Text';
      case 'image': return 'Image';
      case 'video': return 'Video';
      default: return 'Block';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <div>Loading...</div>
        </Header>
      </PageContainer>
    );
  }

  if (!topic) {
    return (
      <PageContainer>
        <Header>
          <div>Topic not found</div>
        </Header>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={handleBackToCourseBuilder}>
              <ArrowLeft size={20} />
            </BackButton>
            
            <Breadcrumb>
              <BreadcrumbLink onClick={handleBackToCourseBuilder}>
                {course?.topic || 'Course'}
              </BreadcrumbLink>
              <BreadcrumbSeparator>→</BreadcrumbSeparator>
              <BreadcrumbLink onClick={handleBackToCourseBuilder}>
                Module #{module?.order}: {module?.title}
              </BreadcrumbLink>
              <BreadcrumbSeparator>→</BreadcrumbSeparator>
              <BreadcrumbCurrent>{topic.title}</BreadcrumbCurrent>
            </Breadcrumb>
          </HeaderLeft>
          
          <Button variant="primary">
            Publish
          </Button>
        </HeaderContent>
      </Header>

      <MainLayout>
        <Canvas>
          <CanvasInner>
            <TitleSection>
              {isEditingTitle ? (
                <div>
                  <TitleInput
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEditTitle();
                    }}
                    autoFocus
                  />
                  <TitleActions>
                    <SaveButton onClick={handleSaveTitle}>
                      <Check size={16} /> Save
                    </SaveButton>
                    <CancelButton onClick={handleCancelEditTitle}>
                      <X size={16} /> Cancel
                    </CancelButton>
                  </TitleActions>
                </div>
              ) : (
                <TitleDisplay>
                  <Title>{topic.title}</Title>
                  <EditButton onClick={() => setIsEditingTitle(true)}>
                    <Edit2 size={20} />
                  </EditButton>
                </TitleDisplay>
              )}
            </TitleSection>

            <ContentSection>
              {contentBlocks.length === 0 ? (
                <EmptyState>
                  <EmptyStateTitle>Start Building Your Topic</EmptyStateTitle>
                  <EmptyStateText>
                    Add content blocks to create rich, engaging learning materials
                  </EmptyStateText>
                  <Button variant="primary" onClick={() => setShowLibrary(true)}>
                    <Plus size={18} /> Add Your First Block
                  </Button>
                </EmptyState>
              ) : (
                <BlocksList>
                  {contentBlocks.map((block, index) => (
                    <BlockWrapper
                      key={block.id}
                      isDragging={draggedIndex === index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={e => handleDragOver(e, index)}
                      onDrop={e => handleDrop(e, index)}
                    >
                      <BlockContainer color={getBlockColor(block.type)}>
                        <BlockHeader color={getBlockColor(block.type)}>
                          <BlockHeaderLeft>
                            <DragHandle>
                              <GripVertical size={18} />
                            </DragHandle>
                            <BlockTitle>{getBlockTypeName(block.type)}</BlockTitle>
                          </BlockHeaderLeft>
                          
                          <BlockActions>
                            <IconButton
                              onClick={() => setSelectedBlock(block)}
                              title="Settings"
                            >
                              <Edit2 size={16} />
                            </IconButton>
                            <IconButton
                              onClick={() => setDeleteConfirm(block.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </BlockActions>
                        </BlockHeader>
                        
                        <BlockContent>
                          <ContentBlockRenderer
                            block={block}
                            isEditing={true}
                            onUpdate={(settings) => handleUpdateBlock(block.id, settings)}
                          />
                        </BlockContent>
                      </BlockContainer>
                    </BlockWrapper>
                  ))}
                  
                  <AddBlockButton onClick={() => setShowLibrary(true)}>
                    <Plus size={20} />
                    Add Content Block
                  </AddBlockButton>
                </BlocksList>
              )}
            </ContentSection>
          </CanvasInner>
        </Canvas>

        {showLibrary && (
          <BlockLibrary
            onAddBlock={handleAddBlock}
            onClose={() => setShowLibrary(false)}
          />
        )}

        {selectedBlock && (
          <BlockSettingsPanel
            block={selectedBlock}
            onUpdate={(settings) => handleUpdateBlock(selectedBlock.id, settings)}
            onClose={() => setSelectedBlock(null)}
          />
        )}
      </MainLayout>

      {deleteConfirm && (
        <DeleteConfirmation onClick={() => setDeleteConfirm(null)}>
          <DeleteDialog onClick={e => e.stopPropagation()}>
            <DeleteTitle>Delete Content Block?</DeleteTitle>
            <DeleteText>
              This action cannot be undone. The block and all its content will be permanently removed.
            </DeleteText>
            <DeleteActions>
              <CancelButton onClick={() => setDeleteConfirm(null)}>
                Cancel
              </CancelButton>
              <DeleteButton onClick={() => handleDeleteBlock(deleteConfirm)}>
                Delete Block
              </DeleteButton>
            </DeleteActions>
          </DeleteDialog>
        </DeleteConfirmation>
      )}

      <SaveIndicator show={showSaved}>
        <Check size={18} />
        Saved
      </SaveIndicator>
    </PageContainer>
  );
};
