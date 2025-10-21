import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Folders, FolderDoc } from '../../api/folders';
import { FaFolder } from 'react-icons/fa';
import styled from 'styled-components';

// Styled components
const FolderSelectorContainer = styled.div`
  margin-bottom: 20px;
`;

const Alert = styled.div<{ type: 'success' | 'error' }>`
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: ${props => props.type === 'success' ? 'var(--color-success, #4CAF50)' : 'var(--color-error, #f44336)'};
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text, #333);
`;

// Extend FolderDoc interface to include children for hierarchy
interface FolderWithChildren extends FolderDoc {
  children?: FolderWithChildren[];
  depth?: number;
}

interface FolderSelectorProps {
  selectedFolderId?: string | null;
  onFolderChange: (folderId: string | null) => void;
  hideLabel?: boolean;
  allowFolderCreation?: boolean;
}

// Helper function to build a flat list of folders with depth information
const buildFlatFolderList = (folders: FolderWithChildren[], depth = 0, result: FolderWithChildren[] = []) => {
  if (!folders || !Array.isArray(folders)) return result;
  
  folders.forEach(folder => {
    if (folder) {
      // Add the current folder with its depth
      result.push({ ...folder, depth });
      
      // Recursively process children if they exist
      if (folder.children && Array.isArray(folder.children) && folder.children.length > 0) {
        buildFlatFolderList(folder.children, depth + 1, result);
      }
    }
  });
  
  return result;
};

// React Select option type
interface SelectOption {
  value: string;
  label: string;
  depth?: number;
  isDisabled?: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ 
  selectedFolderId = null, 
  onFolderChange, 
  hideLabel = false,
  allowFolderCreation = true
}) => {
  // Alert state for notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Subscribe to and fetch folders
  const { allFolders, loading } = useTracker(() => {
    const subscription = Meteor.subscribe('folders.all');
    // Get all folders
    const rawFolders = Folders.find({ isActive: true }).fetch() as FolderWithChildren[];
    
    // Process folders to create proper parent-child relationships
    const processedFolders: FolderWithChildren[] = [];
    const folderMap: Record<string, FolderWithChildren> = {};
    
    // First, create a map of all folders by ID
    rawFolders.forEach(folder => {
      if (folder && folder._id) {
        // Initialize children array
        folder.children = [];
        folderMap[folder._id] = folder;
      }
    });
    
    // Then, build the hierarchy
    rawFolders.forEach(folder => {
      if (folder && folder._id) {
        if (folder.parentId && folderMap[folder.parentId]) {
          // This folder has a parent, add it to parent's children
          folderMap[folder.parentId].children?.push(folder);
        } else {
          // This is a root folder
          processedFolders.push(folder);
        }
      }
    });
    
    return {
      allFolders: processedFolders,
      loading: !subscription.ready()
    };
  }, []);

  // Function to prepare hierarchical options for React Select
  const prepareSelectOptions = (folders: FolderWithChildren[]): SelectOption[] => {
    const options = buildFlatFolderList(folders)
      .filter(folder => folder._id) // Filter out any folders without an ID
      .map(folder => ({
        value: folder._id!, // Non-null assertion since we filtered out undefined IDs
        label: folder.name,
        depth: folder.depth || 0,
        isDisabled: false
      }));
    
    // Add "None" option at the beginning
    return [
      { value: '', label: 'None (Root)', depth: 0, isDisabled: false },
      ...options
    ];
  };

  // Custom Option component to display hierarchical structure
  const CustomOption = (props: any) => {
    const { data } = props;
    const depth = data.depth || 0;
    const indent = '\u00A0\u00A0'.repeat(depth);
    const prefix = depth > 0 ? '└── ' : '';

    // Special styling for the create option
    if (data.__isNew__) {
      return (
        <components.Option {...props}>
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', color: 'var(--color-primary, #542A46)', fontWeight: 'bold' }}>
            Create folder: "{data.label}"
          </div>
        </components.Option>
      );
    }

    return (
      <components.Option {...props}>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', width: '100%', maxWidth: '100%' }}>
          {indent}{prefix}{data.label}
        </div>
      </components.Option>
    );
  };

  // Memoized select options
  const selectOptions = useMemo(() => {
    return prepareSelectOptions(allFolders || []);
  }, [allFolders]);

  // Find the currently selected option
  const selectedOption = useMemo(() => {
    if (!selectedFolderId) return selectOptions[0]; // Default to "None" option
    return selectOptions.find(option => option.value === selectedFolderId) || selectOptions[0];
  }, [selectedFolderId, selectOptions]);

  return (
    <FolderSelectorContainer className="folder-selector">
      {!hideLabel && (
        <Label>
          <FaFolder size={18} /> Folder
        </Label>
      )}
      {alert && (
        <Alert type={alert.type}>
          {alert.message}
        </Alert>
      )}
      {allowFolderCreation ? (
        <CreatableSelect
          id="questionFolder"
          name="questionFolder"
          options={selectOptions}
          value={selectedOption}
          onChange={(selected) => {
            if (selected) {
              // If "None" is selected, pass null
              onFolderChange(selected.value === '' ? null : selected.value);
            } else {
              onFolderChange(null);
            }
          }}
          formatCreateLabel={(inputValue) => `Create folder: "${inputValue}"`}
          onCreateOption={(inputValue) => {
            // Call Meteor method to create a new folder
            Meteor.call('folders.create', {
              name: inputValue,
              parentId: null, // Create at root level by default
              isActive: true,
              order: 0, // Default order
              id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate a unique ID
            }, (error: Meteor.Error, newFolderId: string) => {
              if (error) {
                setAlert({ type: 'error', message: `Error creating folder: ${error.message}` });
                setTimeout(() => setAlert(null), 5000);
                return;
              }
              
              // Select the new folder
              onFolderChange(newFolderId);
              setAlert({ type: 'success', message: `Folder "${inputValue}" created successfully!` });
              setTimeout(() => setAlert(null), 3000);
            });
          }}
          isLoading={loading}
          components={{ Option: CustomOption }}
          styles={{
            control: (provided) => ({
              ...provided,
              borderColor: 'var(--color-border, #ddd)',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'var(--color-primary, #542A46)',
              },
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected 
                ? 'var(--color-primary, #542A46)' 
                : state.isFocused 
                  ? 'var(--color-accent-light, #f0e6ee)'
                  : 'white',
              color: state.isSelected ? 'white' : 'var(--color-text, #333)',
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              width: 'auto',
              minWidth: '100%',
            }),
          }}
        />
      ) : (
        <Select
          id="questionFolder"
          name="questionFolder"
          options={selectOptions}
          value={selectedOption}
          onChange={(selected) => {
            if (selected) {
              // If "None" is selected, pass null
              onFolderChange(selected.value === '' ? null : selected.value);
            } else {
              onFolderChange(null);
            }
          }}
          isLoading={loading}
          components={{ Option: CustomOption }}
          styles={{
            control: (provided) => ({
              ...provided,
              borderColor: 'var(--color-border, #ddd)',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'var(--color-primary, #542A46)',
              },
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected 
                ? 'var(--color-primary, #542A46)' 
                : state.isFocused 
                  ? 'var(--color-accent-light, #f0e6ee)'
                  : 'white',
              color: state.isSelected ? 'white' : 'var(--color-text, #333)',
            }),
          }}
        />
      )}
    </FolderSelectorContainer>
  );
};

export default FolderSelector;
