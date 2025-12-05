import React, { useState, useEffect } from 'react';
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

  const [activeTab, setActiveTab] = useState<'outline' | 'content'>('content');
  
  // Auto-save hook
  const { showSaved: autoShowSaved } = useAutoSave(topicId, contentBlocks);
  
  // Combine save indicators
  const showSaved = titleShowSaved || autoShowSaved;

  // Initialize content blocks from topic
  useEffect(() => {
    if (topic?.contentBlocks) {
      setContentBlocks(topic.contentBlocks as any);
    }
  }, [topic?.contentBlocks]);

  const handleAddBlock = (blockType: any) => {
    addBlock(blockType);
    // Stay on content tab after adding block
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <TopicEditorHeader
          course={course}
          module={module}
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
          course={course}
          module={module}
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
        course={course}
        module={module}
        topic={topic}
        onBack={handleBackToCourseBuilder}
      />

      <MainLayout>
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
          onAddBlock={() => setActiveTab('content')}
          onEditBlock={setSelectedBlock}
          onDeleteBlock={setDeleteConfirm}
          onUpdateBlock={updateBlock}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {/* Sticky Right Sidebar - Always visible */}
        <RightSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedBlock={selectedBlock}
          onAddBlock={handleAddBlock}
          onUpdateBlock={settings => selectedBlock && updateBlock(selectedBlock.id, settings)}
          onCloseSettings={() => setSelectedBlock(null)}
          course={course}
          module={module}
          topic={topic}
        />
      </MainLayout>

      <DeleteConfirmation
        isOpen={!!deleteConfirm}
        onConfirm={() => deleteBlock(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      <SaveIndicator show={showSaved} />
    </PageContainer>
  );
};
