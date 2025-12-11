import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TopicEditorHeader } from '../components/topic-editor/TopicEditorHeader';
import { ContentCanvas } from '../components/topic-editor/ContentCanvas';
import { DeleteConfirmation } from '../components/topic-editor/DeleteConfirmation';
import { SaveIndicator } from '../components/topic-editor/SaveIndicator';
import { RightSidebar } from '../components/topic-editor/RightSidebar';
import { useTopicEditor } from '../components/topic-editor/hooks/useTopicEditor';
import { useBlockManagement } from '../components/topic-editor/hooks/useBlockManagement';
import { useAutoSave } from '../components/topic-editor/hooks/useAutoSave';
import { PageContainer, MainLayout } from '../styles/topicEditor.styles';

export const TopicEditor: React.FC = () => {
  const { courseId, moduleId, topicId } = useParams<{ courseId: string; moduleId: string; topicId: string }>();
  
  // Use custom hooks
  const {
    topic,
    module,
    course,
    loading,
    isEditingTitle,
    setIsEditingTitle,
    editTitle,
    setEditTitle,
    showSaved: titleShowSaved,
    handleBackToCourseBuilder,
    handleSaveTitle,
    handleCancelEditTitle,
  } = useTopicEditor(courseId, moduleId, topicId);

  const {
    contentBlocks,
    setContentBlocks,
    selectedBlock,
    setSelectedBlock,
    draggedIndex,
    deleteConfirm,
    setDeleteConfirm,
    addBlock,
    updateBlock,
    deleteBlock,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useBlockManagement();

  const [activeTab, setActiveTab] = useState<'outline' | 'content' | 'settings'>('content');
  const [highlightSidebar, setHighlightSidebar] = useState(false);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Handle highlight sidebar when add block button is clicked
  const handleHighlightSidebar = () => {
    setActiveTab('content');
    setHighlightSidebar(true);
    // Clear previous timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    // Auto-reset after animation
    highlightTimeoutRef.current = setTimeout(() => setHighlightSidebar(false), 2000);
  };
  
  // Auto-save hook
  const { showSaved: autoShowSaved } = useAutoSave(topicId, contentBlocks);
  
  // Combine save indicators
  const showSaved = titleShowSaved || autoShowSaved;

  // Track if user has made local changes (to prevent server overwriting them)
  const hasLocalChanges = useRef(false);
  
  // Initialize content blocks from topic
  // Only sync from server if user hasn't made local changes
  useEffect(() => {
    if (topic?.contentBlocks && !hasLocalChanges.current) {
      setContentBlocks(topic.contentBlocks as any);
    }
  }, [topic?.contentBlocks]);

  // Reset local changes flag when navigating to different topic
  useEffect(() => {
    hasLocalChanges.current = false;
  }, [topicId]);

  const handleAddBlock = (blockType: any) => {
    hasLocalChanges.current = true; // Mark as having local changes
    addBlock(blockType);
    // Stay on content tab after adding block
  };

  // Wrapper for updateBlock that marks local changes
  const handleUpdateBlock = (blockId: string, settings: any) => {
    hasLocalChanges.current = true;
    updateBlock(blockId, settings);
  };

  // Wrapper for deleteBlock that marks local changes
  const handleDeleteBlock = (blockId: string) => {
    hasLocalChanges.current = true;
    deleteBlock(blockId);
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <TopicEditorHeader
          course={(course as any) ?? undefined}
          module={(module?._id ? module : undefined) as any}
          topic={topic}
          onBack={handleBackToCourseBuilder}
        />
        <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>
      </PageContainer>
    );
  }

  // Not found state
  if (!topic) {
    return (
      <PageContainer>
        <TopicEditorHeader
          course={(course as any) ?? undefined}
          module={(module?._id ? module : undefined) as any}
          topic={topic}
          onBack={handleBackToCourseBuilder}
        />
        <div style={{ padding: '32px', textAlign: 'center' }}>Topic not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TopicEditorHeader
        course={(course as any) ?? undefined}
        module={(module?._id ? module : undefined) as any}
        topic={topic}
        onBack={handleBackToCourseBuilder}
      />

      <MainLayout>
        {/* Left Sidebar - Block Library & Settings */}
        <RightSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedBlock={selectedBlock}
          onAddBlock={handleAddBlock}
          onUpdateBlock={settings => selectedBlock && handleUpdateBlock(selectedBlock.id, settings)}
          onCloseSettings={() => setSelectedBlock(null)}
          course={course}
          module={module}
          topic={topic}
          topicId={topicId}
          highlightSidebar={highlightSidebar}
        />

        <ContentCanvas
          topicTitle={topic.title}
          isEditingTitle={isEditingTitle}
          editTitleValue={editTitle}
          onEditTitleChange={setEditTitle}
          onStartEditTitle={() => setIsEditingTitle(true)}
          onSaveTitle={handleSaveTitle}
          onCancelEditTitle={handleCancelEditTitle}
          blocks={contentBlocks}
          draggedIndex={draggedIndex}
          onAddBlock={handleHighlightSidebar}
          onEditBlock={setSelectedBlock}
          onDeleteBlock={setDeleteConfirm}
          onUpdateBlock={handleUpdateBlock}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      </MainLayout>

      <DeleteConfirmation
        isOpen={!!deleteConfirm}
        onConfirm={() => handleDeleteBlock(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      <SaveIndicator show={showSaved} />
    </PageContainer>
  );
};
