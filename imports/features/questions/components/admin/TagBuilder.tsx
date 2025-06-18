import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.bootstrap4.css';
import { Layers } from '/imports/api/layers';
import { FaTags } from 'react-icons/fa';
import './TagBuilder.css';

interface TagBuilderProps {
  selectedTagIds: string[];
  onTagChange: (tagIds: string[]) => void;
}

const TagBuilder: React.FC<TagBuilderProps> = ({ selectedTagIds = [], onTagChange }) => {
  const tagSelectRef = useRef<HTMLSelectElement>(null);
  const tomSelectInstance = useRef<any>(null);

  // Subscribe to and fetch tags from Layers collection
  const { allTags, loading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.byLocation', 'Questions');
    const allTags = Layers.find({ 
      location: { $regex: 'Questions', $options: 'i' } 
    }).fetch();

    return {
      allTags,
      loading: !subscription.ready()
    };
  }, []);

  // Initialize Tom Select only once when component mounts
  useEffect(() => {
    // Only initialize if we have a valid reference
    if (!tagSelectRef.current || tomSelectInstance.current) {
      return; // Skip if already initialized or no ref
    }
    
    // Log initial selected tag IDs for debugging
    console.log('Initial selectedTagIds in TagBuilder:', selectedTagIds);
    
    // Wait for tags to be loaded before initializing
    const initializeWhenTagsReady = () => {
      if (!allTags || allTags.length === 0) {
        // Tags not loaded yet, check again in 100ms
        console.log('Waiting for tags to load...');
        setTimeout(initializeWhenTagsReady, 100);
        return;
      }
      
      console.log('Tags loaded, count:', allTags.length);
      
      try {
        // Create a configuration that allows multiple selection with proper remove button
        const config: any = {
          plugins: ['remove_button'],
          placeholder: 'Select tags...',
          create: false,
          maxItems: null, // Allow multiple selections
          sortField: { field: 'text', direction: 'asc' },
          onChange: function(values: string[]) {
            // Only update state if values actually changed
            const currentValuesStr = values.sort().join(',');
            const existingValuesStr = [...selectedTagIds].sort().join(',');
            
            if (currentValuesStr !== existingValuesStr) {
              console.log('Tags changed:', values);
              
              // This is the most important part - directly call onTagChange with the selected tag IDs
              onTagChange(values);
            }
          }
        };
        
        console.log('Initializing Tom Select');
        // Cast the ref to any to avoid TypeScript error
        const ts = new TomSelect(tagSelectRef.current as any, config);
        tomSelectInstance.current = ts;
        
        // Clear any existing options and add the available tags
        ts.clearOptions();
        
        // Add all tags from Layers collection filtered by location "Questions"
        if (allTags && allTags.length > 0) {
          console.log('Adding tag options to TomSelect:', allTags.length);
          allTags.forEach(tag => {
            if (tag && tag._id) {
              ts.addOption({
                value: tag._id,
                text: tag.name
              });
            }
          });
        }
        
        // Set initial values if any
        if (selectedTagIds.length > 0) {
          console.log('Setting initial tag values:', selectedTagIds);
          ts.setValue(selectedTagIds, true); // Silent update
        }
      } catch (error) {
        console.error('Error initializing TomSelect:', error);
      }
    };
    
    // Start the initialization process
    initializeWhenTagsReady();
    
    // Clean up Tom Select instance when component unmounts
    return () => {
      if (tomSelectInstance.current) {
        try {
          tomSelectInstance.current.destroy();
        } catch (error) {
          console.error('Error destroying TomSelect:', error);
        }
        tomSelectInstance.current = null;
      }
    };
  }, [allTags, selectedTagIds, onTagChange]);
  
  // Update TomSelect when selectedTagIds changes
  useEffect(() => {
    // Skip if TomSelect is not initialized yet
    if (!tomSelectInstance.current) {
      return;
    }
    
    try {
      // Handle both array and undefined/null cases
      const safeSelectedTagIds = selectedTagIds || [];
      const currentValues = tomSelectInstance.current.getValue() || [];
      const currentValuesStr = [...currentValues].sort().join(',');
      const newValuesStr = [...safeSelectedTagIds].sort().join(',');
      
      if (currentValuesStr !== newValuesStr) {
        console.log('Updating TomSelect values from props:', safeSelectedTagIds);
        tomSelectInstance.current.setValue(safeSelectedTagIds, true);
      }
    } catch (error) {
      console.error('Error updating TomSelect values:', error);
    }
  }, [selectedTagIds]);

  return (
    <div className="form-group tag-builder">
      <label className="tag-builder-label">
        <FaTags /> Tag builder
      </label>
      <div className="tag-builder-container">
        <select
          ref={tagSelectRef}
          multiple
          className="tag-select"
        >
          {/* Options will be added by TomSelect */}
        </select>
        {loading && <div className="tag-loading">Loading tags...</div>}
      </div>
    </div>
  );
};

export default TagBuilder;
