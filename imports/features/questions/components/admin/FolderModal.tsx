import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import LoadingButton from '/imports/shared/components/LoadingButton';
import { Folders, FolderDoc } from '../../../questions/api/folders';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: FolderDoc | null;
  parentId?: string | null;
  onSuccess?: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text);
  
  &:hover {
    color: var(--color-accent);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text);
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  
  &:hover {
    background-color: var(--color-hover);
  }
`;

const SubmitButton = styled(Button)`
  background-color: var(--color-accent);
  border: 1px solid var(--color-accent);
  color: white;
  
  &:hover {
    background-color: var(--color-accent-dark);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-error);
  font-size: 14px;
  margin-top: 10px;
`;

const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  parentId,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FolderDoc[]>([]);
  
  // Load folders for parent selection
  useEffect(() => {
    if (isOpen) {
      Meteor.subscribe('folders.all', {
        onReady: () => {
          const allFolders = Folders.find({ isActive: true }).fetch();
          setFolders(allFolders);
        }
      });
    }
  }, [isOpen]);
  
  // Initialize form when folder changes
  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
      setDescription(folder.description || '');
      setSelectedParentId(folder.parentId || null);
    } else {
      setName('');
      setDescription('');
      setSelectedParentId(parentId || null);
    }
    setError(null);
  }, [folder, parentId]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!name.trim()) {
      setError('Folder name is required');
      setLoading(false);
      return;
    }
    
    // Prevent circular references
    if (folder && folder._id && selectedParentId === folder._id) {
      setError('A folder cannot be its own parent');
      setLoading(false);
      return;
    }
    
    // Check for circular references in the folder hierarchy
    if (folder && folder._id && selectedParentId) {
      let currentParentId = selectedParentId;
      let isCircular = false;
      
      // Check if any parent in the chain is the current folder
      while (currentParentId && !isCircular) {
        if (currentParentId === folder._id) {
          isCircular = true;
          break;
        }
        
        const parentFolder = folders.find(f => f._id === currentParentId);
        currentParentId = parentFolder?.parentId || null;
      }
      
      if (isCircular) {
        setError('This would create a circular reference in the folder structure');
        setLoading(false);
        return;
      }
    }
    
    const folderData = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: selectedParentId,
      organizationId: folder?.organizationId,
    };
    
    if (folder && folder._id) {
      // Update existing folder
      Meteor.call('folders.update', folder._id, folderData, (error: Meteor.Error) => {
        setLoading(false);
        if (error) {
          setError(error.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      });
    } else {
      // Create new folder
      Meteor.call('folders.insert', folderData, (error: Meteor.Error) => {
        setLoading(false);
        if (error) {
          setError(error.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      });
    }
  };
  
  // Filter out the current folder and its children from parent options
  const getValidParentOptions = () => {
    if (!folder || !folder._id) return folders;
    
    // Function to get all descendant folder IDs
    const getDescendantIds = (folderId: string): string[] => {
      const directChildren = folders.filter(f => f.parentId === folderId);
      const childIds = directChildren.map(c => c._id || '');
      
      return [
        ...childIds,
        ...directChildren.flatMap(child => child._id ? getDescendantIds(child._id) : [])
      ];
    };
    
    const invalidIds = folder._id ? [folder._id, ...getDescendantIds(folder._id)] : [];
    return folders.filter(f => !invalidIds.includes(f._id || ''));
  };
  
  const validParentOptions = getValidParentOptions();
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{folder ? 'Edit Folder' : 'Create New Folder'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="folderName">Folder Name *</Label>
            <Input
              id="folderName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter folder name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="folderDescription">Description</Label>
            <TextArea
              id="folderDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter folder description (optional)"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="parentFolder">Parent Folder</Label>
            <Select
              id="parentFolder"
              value={selectedParentId || ''}
              onChange={e => setSelectedParentId(e.target.value || null)}
            >
              <option value="">None (Root Folder)</option>
              {validParentOptions.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <LoadingButton 
              type="submit" 
              isLoading={loading} 
              loadingText="Saving..."
              variant="primary"
            >
              {folder ? 'Update Folder' : 'Create Folder'}
            </LoadingButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FolderModal;
