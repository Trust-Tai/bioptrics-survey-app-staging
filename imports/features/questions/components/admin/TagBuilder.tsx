import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Layers, Layer } from '/imports/api/layers';
import { FaTags } from 'react-icons/fa';
import './TagBuilder.css';

// Extend Layer interface to include children for hierarchy
interface LayerWithChildren extends Layer {
  children?: LayerWithChildren[];
  depth?: number;
}

interface TagBuilderProps {
  selectedTagIds: string[];
  onTagChange: (tagIds: string[]) => void;
}

// Helper function to build a flat list of tags with depth information
const buildFlatTagList = (tags: LayerWithChildren[], depth = 0, result: LayerWithChildren[] = []) => {
  if (!tags || !Array.isArray(tags)) return result;
  
  tags.forEach(tag => {
    if (tag) {
      // Add the current tag with its depth
      result.push({ ...tag, depth });
      
      // Recursively process children if they exist
      if (tag.children && Array.isArray(tag.children) && tag.children.length > 0) {
        buildFlatTagList(tag.children, depth + 1, result);
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

const TagBuilder: React.FC<TagBuilderProps> = ({ selectedTagIds = [], onTagChange }) => {
  // State for alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Subscribe to and fetch tags from Layers collection
  const { allTags, loading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    // Get all tags and ensure they're properly structured with children
    const rawTags = Layers.find({}).fetch() as LayerWithChildren[];
    
    // Process tags to create proper parent-child relationships
    const processedTags: LayerWithChildren[] = [];
    const tagMap: Record<string, LayerWithChildren> = {};
    
    // First, create a map of all tags by ID
    rawTags.forEach(tag => {
      if (tag && tag._id) {
        // Initialize children array
        tag.children = [];
        tagMap[tag._id] = tag;
      }
    });
    
    // Then, build the hierarchy
    rawTags.forEach(tag => {
      if (tag && tag._id) {
        if (tag.parentId && tagMap[tag.parentId]) {
          // This tag has a parent, add it to parent's children
          tagMap[tag.parentId].children?.push(tag);
        } else {
          // This is a root tag
          processedTags.push(tag);
        }
      }
    });
    
    console.log('Processed hierarchical tags:', processedTags);

    return {
      allTags: processedTags,
      loading: !subscription.ready()
    };
  }, []);

  // Function to prepare hierarchical options for React Select
  const prepareSelectOptions = (tags: LayerWithChildren[]): SelectOption[] => {
    return buildFlatTagList(tags.filter(tag => tag.active))
      .filter(tag => tag._id) // Filter out any tags without an ID
      .map(tag => ({
        value: tag._id!, // Non-null assertion since we filtered out undefined IDs
        label: tag.name,
        depth: tag.depth || 0,
        isDisabled: false
      }));
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
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', color: '#552a47', fontWeight: 'bold' }}>
            ✨ Create this tag: "{data.label}"
          </div>
        </components.Option>
      );
    }

    return (
      <components.Option {...props}>
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {indent}{prefix}{data.label}
        </div>
      </components.Option>
    );
  };

  // Memoized select options
  const selectOptions = useMemo(() => {
    return prepareSelectOptions(allTags || []);
  }, [allTags]);
  
  // Debug the options to ensure hierarchy is working
  useEffect(() => {
    if (selectOptions.length > 0) {
      console.log('Hierarchical select options:', selectOptions);
    }
  }, [selectOptions]);

  // Effect to handle changes in availableTags (when tags are activated/deactivated)
  useEffect(() => {
    if (allTags && allTags.length > 0) {
      // Get all tag IDs including from nested children using our flat list function
      const flattenedTags = buildFlatTagList(allTags);
      const activeTagIds = flattenedTags.filter(tag => tag.active).map(tag => tag._id);
      
      const updatedSelectedTags = selectedTagIds.filter(tagId => activeTagIds.includes(tagId));
      if (updatedSelectedTags.length !== selectedTagIds.length) {
        onTagChange(updatedSelectedTags);
      }
    }
  }, [allTags, selectedTagIds, onTagChange]);

  return (
    <div className="form-group tag-builder">
      <label className="tag-builder-label">
        <FaTags size={18} /> Tag builder
      </label>
      <div className="tag-builder-container">
        {alert && (
          <div className={`alert alert-${alert.type}`} style={{
            padding: '8px 12px',
            marginBottom: '10px',
            borderRadius: '4px',
            backgroundColor: alert.type === 'success' ? '#d4edda' : '#f8d7da',
            color: alert.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${alert.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {alert.message}
          </div>
        )}
        <CreatableSelect
          id="questionTags"
          name="questionTags"
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          options={selectOptions}
          value={selectOptions.filter(option => selectedTagIds.includes(option.value))}
          onChange={(selected) => {
            if (Array.isArray(selected)) {
              onTagChange(selected.map(option => option.value));
            } else {
              onTagChange([]);
            }
          }}
          onCreateOption={(inputValue) => {
            // Call Meteor method to create a new tag
            Meteor.call('layers.create', {
              name: inputValue,
              color: 'rgb(85, 42, 71)',
              active: true,
              location: 'Questions',
              fields: [], // Required empty array for fields
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate a unique ID
            }, (error: Meteor.Error, newTagId: string) => {
              if (error) {
                setAlert({ type: 'error', message: `Error creating tag: ${error.message}` });
                setTimeout(() => setAlert(null), 5000);
                return;
              }
              
              // Add the new tag to selected tags
              onTagChange([...selectedTagIds, newTagId]);
              setAlert({ type: 'success', message: `Tag "${inputValue}" created successfully!` });
              setTimeout(() => setAlert(null), 3000);
            });
          }}
          components={{
            Option: CustomOption
          }}
          styles={{
            option: (base) => ({
              ...base,
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              width: 'auto',
              minWidth: '100%',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: '300px',
              backgroundColor: 'white',
              padding: '4px'
            }),
            control: (base) => ({
              ...base,
              width: '100%',
              minWidth: '300px'
            }),
            container: (base) => ({
              ...base,
              width: '100%'
            })
          }}
          formatCreateLabel={(inputValue) => `Create this tag: "${inputValue}"`}
          classNamePrefix="react-select"
          placeholder="Select tags..."
        />
        {loading && <div className="tag-loading">Loading tags...</div>}
        {!loading && allTags && allTags.length === 0 && (
          <div className="tag-empty">No tags available. Please create tags in the Tags & Classifications section.</div>
        )}
      </div>
      <div className="tag-builder-help">
        Select tags to categorize this question
      </div>
    </div>
  );
};

export default TagBuilder;
