import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { Folders, FolderDoc } from '../../../questions/api/folders';
import { FaFolder, FaFolderOpen, FaPlus, FaEdit, FaTrash, FaEllipsisV, FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface FolderTreeProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
  onCreateFolder?: (parentId: string | null) => void;
  onEditFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onDrop?: (questionIds: string[], folderId: string | null) => void;
}

interface FolderItemProps {
  folder: FolderDoc;
  level: number;
  selectedFolderId: string | null;
  expandedFolders: string[];
  onToggleExpand: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder?: (parentId: string) => void;
  onEditFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onDrop?: (questionIds: string[], folderId: string) => void;
  childFolders: FolderDoc[];
}

const TreeContainer = styled.div`
  width: 100%;
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 10px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const FolderContainer = styled.div<{ level: number }>`
  padding-left: ${props => props.level * 20}px;
`;

const FolderItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'var(--color-hover)'};
  }
`;

const FolderName = styled.span`
  margin-left: 8px;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FolderActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: var(--color-text);
  
  &:hover {
    color: var(--color-accent);
  }
`;

const ExpandButton = styled.span`
  width: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const TreeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 10px;
`;

const TreeTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: var(--color-text);
`;

const AllQuestionsItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'transparent'};
  margin-bottom: 8px;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'var(--color-hover)'};
  }
`;

const UngroupedQuestionsItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'transparent'};
  margin-bottom: 8px;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--color-accent-light)' : 'var(--color-hover)'};
  }
`;

const FolderItemComponent: React.FC<FolderItemProps> = ({
  folder,
  level,
  selectedFolderId,
  expandedFolders,
  onToggleExpand,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onDrop,
  childFolders,
}) => {
  // Get all folders for nested filtering
  const { folders } = useTracker(() => {
    return {
      folders: Folders.find({ isActive: true }).fetch(),
    };
  }, []);
  const isExpanded = expandedFolders.includes(folder._id || '');
  const isSelected = selectedFolderId === folder._id;
  const hasChildren = childFolders.length > 0;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const questionIds = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (Array.isArray(questionIds) && questionIds.length > 0 && onDrop) {
        onDrop(questionIds, folder._id || '');
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };
  
  return (
    <FolderContainer level={level}>
      <FolderItem 
        isSelected={isSelected}
        onClick={() => onSelectFolder(folder._id || '')}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ExpandButton onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(folder._id || '');
        }}>
          {hasChildren && (
            <>
              <FaChevronDown size="0.8em" style={{ display: isExpanded ? 'inline' : 'none' }} />
              <FaChevronRight size="0.8em" style={{ display: isExpanded ? 'none' : 'inline' }} />
            </>
          )}
        </ExpandButton>
        
        {isExpanded ? 
          <FaFolderOpen color="var(--color-accent)" /> : 
          <FaFolder color="var(--color-accent)" />
        }
        <FolderName>{folder.name}</FolderName>
        
        <FolderActions>
          {onCreateFolder && (
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(folder._id || '');
              }}
              title="Create subfolder"
            >
              <FaPlus size="0.8em" />
            </ActionButton>
          )}
          
          {onEditFolder && (
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                onEditFolder(folder._id || '');
              }}
              title="Edit folder"
            >
              <FaEdit size="0.8em" />
            </ActionButton>
          )}
          
          {onDeleteFolder && (
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder._id || '');
              }}
              title="Delete folder"
            >
              <FaTrash size="0.8em" />
            </ActionButton>
          )}
        </FolderActions>
      </FolderItem>
      
      {isExpanded && childFolders.map(childFolder => (
        <FolderItemComponent
          key={childFolder._id}
          folder={childFolder}
          level={level + 1}
          selectedFolderId={selectedFolderId}
          expandedFolders={expandedFolders}
          onToggleExpand={onToggleExpand}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onDrop={onDrop}
          childFolders={childFolder._id ? 
            folders.filter((f: FolderDoc) => f.parentId === childFolder._id) : 
            []
          }
        />
      ))}
    </FolderContainer>
  );
};

const FolderTree: React.FC<FolderTreeProps> = ({
  onSelectFolder,
  selectedFolderId,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onDrop
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  
  // Get all folders
  const { folders, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('folders.all');
    const data = Folders.find({ isActive: true }, { sort: { name: 1 } }).fetch();
    return {
      folders: data,
      isLoading: !handle.ready(),
    };
  }, []);
  
  // Root folders (no parent)
  const rootFolders = folders.filter(folder => !folder.parentId);
  
  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDropOnUngrouped = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const questionIds = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (Array.isArray(questionIds) && questionIds.length > 0 && onDrop) {
        onDrop(questionIds, null);
      }
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };
  
  return (
    <TreeContainer>
      <TreeHeader>
        <TreeTitle>Folders</TreeTitle>
        {onCreateFolder && (
          <ActionButton 
            onClick={() => onCreateFolder(null)}
            title="Create root folder"
          >
            <FaPlus />
          </ActionButton>
        )}
      </TreeHeader>
      
      <AllQuestionsItem 
        isSelected={selectedFolderId === 'all'}
        onClick={() => onSelectFolder('all')}
      >
        <FaFolder color="var(--color-accent)" />
        <FolderName>All Questions</FolderName>
      </AllQuestionsItem>
      
      <UngroupedQuestionsItem 
        isSelected={selectedFolderId === null}
        onClick={() => onSelectFolder(null)}
        onDragOver={handleDragOver}
        onDrop={handleDropOnUngrouped}
      >
        <FaFolder color="var(--color-accent)" />
        <FolderName>Uncategorized</FolderName>
      </UngroupedQuestionsItem>
      
      {isLoading ? (
        <div>Loading folders...</div>
      ) : (
        rootFolders.map(folder => (
          <FolderItemComponent
            key={folder._id}
            folder={folder}
            level={0}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onToggleExpand={handleToggleExpand}
            onSelectFolder={onSelectFolder}
            onCreateFolder={onCreateFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            onDrop={onDrop}
            childFolders={folder._id ? 
            folders.filter((f: FolderDoc) => f.parentId === folder._id) : 
            []
          }
          />
        ))
      )}
    </TreeContainer>
  );
};

export default FolderTree;
