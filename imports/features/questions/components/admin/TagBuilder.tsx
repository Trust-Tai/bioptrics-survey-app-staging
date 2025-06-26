import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Select, { components } from 'react-select';
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
        <Select
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
          components={{
            Option: CustomOption
          }}
          styles={{
            option: (base) => ({
              ...base,
              fontFamily: 'monospace',
              whiteSpace: 'pre'
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: '300px'
            })
          }}
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
