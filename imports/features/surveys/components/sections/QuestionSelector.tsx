import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiTag, 
  FiPlus, 
  FiUpload, 
  FiList, 
  FiType, 
  FiStar, 
  FiCheckSquare, 
  FiChevronDown, 
  FiHelpCircle 
} from 'react-icons/fi';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { QuestionItem } from '../../types';
import { useTracker } from 'meteor/react-meteor-data';
import { Layers, Layer } from '/imports/api/layers';
import RichTextRenderer from './RichTextRenderer';
import { Meteor } from 'meteor/meteor';
import { Questions } from '../../../questions/api/questions';
import { Surveys } from '../../../surveys/api/surveys';
import TagBuilder from '../../../questions/components/admin/TagBuilder';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import './QuestionSelector.css';

// Interface for the callback when a new question is created
interface QuestionCreatedCallback {
  (questionId: string): void;
}

interface QuestionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  selectedQuestionIds: string[];
  sectionId: string;
  onSelectQuestions: (questionIds: string[], sectionId: string) => void;
  onQuestionsRefresh?: () => void; // Optional callback to refresh questions list
}

// Extended QuestionItem interface with tags
interface ExtendedQuestionItem extends QuestionItem {
  categoryTags?: string[];
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  isOpen,
  onClose,
  questions,
  selectedQuestionIds,
  sectionId,
  onSelectQuestions,
  onQuestionsRefresh,
}) => {
  // State to handle closing animation
  const [isClosing, setIsClosing] = useState(false);
  
  // Initialize Tom Select on dropdowns
  useEffect(() => {
    // Initialize Tom Select on all dropdowns with the tom-select class
    const dropdowns = document.querySelectorAll('select.tom-select');
    
    // Destroy existing instances first
    dropdowns.forEach(dropdown => {
      const tomSelectInstance = (dropdown as any).tomselect;
      if (tomSelectInstance) {
        tomSelectInstance.destroy();
      }
    });
    
    // Create new instances
    dropdowns.forEach(dropdown => {
      // For tag select elements, we need special handling to only show options when typing
      const isTags = dropdown.classList.contains('tag-filter-select');
      
      const tomSelect = new TomSelect(dropdown, {
        plugins: ['remove_button'],
        create: false,
        sortField: { field: 'text', direction: 'asc' },
        placeholder: dropdown.getAttribute('data-placeholder') || 'Type to search for tags',
        render: {
          dropdown: function() {
            return '<div class="ts-dropdown-content" style="z-index: 1500;"></div>';
          },
          no_results: function() {
            return '<div class="no-results">No matching tags found</div>';
          }
        },
        dropdownParent: 'body', // This helps with z-index issues
        shouldOpen: false, // Don't open dropdown on focus by default
        openOnFocus: false // Explicitly prevent opening on focus
      });
      
      if (isTags) {
        // For tag selects, configure for proper tag display and selection
      
      // Don't prevent dropdown from opening on click for tags
      tomSelect.on('focus', function() {
        // Allow dropdown to open on focus for tags
        tomSelect.open();
      });
      
      // Keep dropdown open when typing
      tomSelect.on('type', function(str) {
        // Always keep dropdown open when interacting with tags
        tomSelect.open();
      });
      }
    });
    
    // Cleanup function to destroy instances when component unmounts
    return () => {
      dropdowns.forEach(dropdown => {
        const tomSelectInstance = (dropdown as any).tomselect;
        if (tomSelectInstance) {
          tomSelectInstance.destroy();
        }
      });
    };
  }, []); // No dependencies since we only need this on unmount
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // State for tag input and menu control
  const [tagInputValue, setTagInputValue] = useState('');
  const [tagMenuIsOpen, setTagMenuIsOpen] = useState(false);
  
  // State for selected question IDs (internal to this component)
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedQuestionIds || []);
  
  // State to track if a question was just created
  const [questionSaved, setQuestionSaved] = useState(false);
  
  // Get all available question types from the questions
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    questions.forEach(question => {
      if (question.type) {
        types.add(question.type);
      }
    });
    return Array.from(types);
  }, [questions]);
  
  // Get all available tags - using the same approach as TagBuilder
  const { allTags, loading: tagsLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    
    // Get all layers
    const rawTags = Layers.find({}).fetch();
    
    // Log all layers to see what's available
    console.log('All layers from collection:', rawTags);
    
    // Filter to include all layers - we'll filter in the UI as needed
    // This matches the approach in TagBuilder which doesn't filter by type
    
    return {
      allTags: rawTags,
      loading: !subscription.ready()
    };
  }, []);
  
  // Get questions with tags
  const questionsWithTags = useMemo(() => {
    const map = new Map<string, string[]>();
    
    // Fetch all questions with their tags
    const questionsWithTagsData = Questions.find({}).fetch();
    
    console.log('All questions data:', questionsWithTagsData);
    
    questionsWithTagsData.forEach(question => {
      // Get tags from the labels array in the versions object
      if (question._id && (question as any).versions && Array.isArray((question as any).versions) && (question as any).versions.length > 0) {
        // Get the latest version (first in the array)
        const latestVersion = (question as any).versions[0];
        
        // Check if the version has labels
        if (latestVersion && latestVersion.labels && Array.isArray(latestVersion.labels)) {
          const labels = latestVersion.labels;
          console.log(`Question ${question._id} has labels:`, labels);
          
          // Store labels as tags using both _id and id to ensure we can retrieve them
          map.set(question._id, labels);
          
          // If the question has an id property that's different from _id, store under that too
          if ((question as any).id && (question as any).id !== question._id) {
            map.set((question as any).id, labels);
            console.log(`Question has both _id: ${question._id} and id: ${(question as any).id}, storing labels under both`);
          }
        } else {
          console.log(`Question ${question._id} has no labels in the latest version`);
        }
      } else {
        console.log(`Question ${question._id} has no versions or versions property is missing`);
      }
    });
    
    return map;
  }, []);
  
  // Filter questions based on search term and filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        question.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((question as any).description && (question as any).description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by type
      const matchesType = selectedType === '' || question.type === selectedType;
      
      // Filter by tags
      let matchesTags = true;
      if (selectedTags.length > 0 && (question as ExtendedQuestionItem).categoryTags) {
        matchesTags = selectedTags.every(tagId => 
          (question as ExtendedQuestionItem).categoryTags?.includes(tagId)
        );
      } else if (selectedTags.length > 0) {
        // If question has no tags but tags are selected for filtering
        matchesTags = false;
      }
      
      // Only show questions that match all filters
      return matchesSearch && matchesType && matchesTags;
    });
  }, [questions, searchTerm, selectedType, selectedTags]);
  
  // Toggle question selection
  const handleToggleQuestion = (questionId: string) => {
    setSelectedIds(prev => {
      return prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
    });
  };
  
  // Toggle all filtered questions
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      // Add all filtered question IDs that aren't already selected
      const newIds = filteredQuestions
        .map(q => q.id || '')
        .filter(id => id && !selectedIds.includes(id));
      
      setSelectedIds(prev => [...prev, ...newIds]);
    } else {
      // Remove all filtered question IDs from selection
      const filteredIds = new Set(filteredQuestions.map(q => q.id || ''));
      setSelectedIds(prev => prev.filter(id => !filteredIds.has(id)));
    }
  };
  
  // Check if all filtered questions are selected
  const areAllFilteredQuestionsSelected = () => {
    return filteredQuestions.every(q => q.id && selectedIds.includes(q.id));
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: 'type' | 'tags', value: string | string[]) => {
    if (filterType === 'type') {
      setSelectedType(typeof value === 'string' ? value : '');
    } else {
      setSelectedTags(typeof value === 'string' ? [value] : value);
    }
  };
  
  // Handle saving selected questions
  const handleSave = () => {
    onSelectQuestions(selectedIds, sectionId);
    onClose();
  };
  
  // Handle question creation callback
  const handleQuestionCreated = (questionId: string) => {
    // Fetch the newly created question
    Meteor.call('questions.getOne', questionId, (error: any, result: any) => {
      if (error) {
        console.error('Error fetching new question:', error);
        return;
      }
      
      // Add the new question to the selected questions
      const newSelectedIds = [...selectedIds, questionId];
      setSelectedIds(newSelectedIds);
      
      // Refresh the questions list if a callback was provided
      if (onQuestionsRefresh) {
        onQuestionsRefresh();
      }
    });
  };

  return (
    <div className="question-selector-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isOpen ? 'flex' : 'none', /* Only display when open */
      justifyContent: 'flex-end',
      zIndex: 1500, /* Increased z-index to ensure it's above other elements */
      opacity: isClosing ? 0 : 1,
      transition: 'opacity 0.2s ease-in-out'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '1000px',
        height: '100%',
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        pointerEvents: 'auto' /* Ensure clicks work on the panel */
      }}>
        <div className="modal-header" style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
            Question Selector
          </h2>
          <button 
            onClick={() => {
              setIsClosing(true);
              setTimeout(() => {
                onClose();
              }, 200);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        
        <div className="modal-body" style={{
          padding: '0',
          overflowY: 'auto',
          flex: 1
        }}>
          <div className="question-selector-content">
              {/* Search and Filter Bar */}
              <div className="search-filter-bar" style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                {/* Unified search and filter row */}
                <div className="unified-filter-row" style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {/* Search Bar */}
                  <div className="filter-group" style={{
                    flex: '1 1 auto',
                    maxWidth: '250px'
                  }}>
                    <label htmlFor="typeFilter" style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#475569'
                    }}>
                      Search Title
                    </label>
                  <div className="search-bar" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0',
                    flex: '2 1 auto',
                    height: '42px',
                    outline: 'none'
                  }}>
                    <input 
                      type="text"
                      placeholder="Search questions by title"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus={false} /* Remove autofocus */
                      style={{
                        flex: 1,
                        border: 'none',
                        padding: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'transparent',
                      }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Clear search"
                      >
                        <FiX size={16} color="#94a3b8" />
                      </button>
                    )}
                  </div>

                  </div>
                  
                  
                  {/* Question Type Filter */}
                  <div className="filter-group" style={{
                    flex: '1 1 auto',
                    maxWidth: '250px'
                  }}>
                    <label htmlFor="typeFilter" style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#475569'
                    }}>
                      Question Type
                    </label>
                    <select
                      id="typeFilter"
                      className="tom-select"
                      multiple
                      data-placeholder="Filter by question type"
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                        handleFilterChange('type', selectedOptions);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {availableTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tag Filter */}
                  <div className="filter-group" style={{
                    flex: '1 1 auto',
                    maxWidth: '250px'
                  }}>
                    <label htmlFor="tagFilter" style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#475569'
                    }}>
                      Question Tags
                    </label>
                    <Select
                      id="tagFilter"
                      name="tagFilter"
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      menuIsOpen={tagMenuIsOpen}
                      inputValue={tagInputValue}
                      onInputChange={(newValue, actionMeta) => {
                        setTagInputValue(newValue);
                        // Only open menu when typing, not on click or blur
                        if (newValue) {
                          setTagMenuIsOpen(true);
                        } else if (actionMeta.action === 'input-blur') {
                          setTagMenuIsOpen(false);
                        }
                      }}
                      onMenuClose={() => setTagMenuIsOpen(false)}
                      options={
                        allTags
                          .filter((tag: Layer) => tag._id && tag.name)
                          .map((tag: Layer) => ({
                            value: tag._id!,
                            label: tag.name
                          }))
                      }
                      value={
                        selectedTags.map(tagId => ({
                          value: tagId,
                          label: allTags.find((tag: Layer) => tag._id === tagId)?.name || tagId
                        }))
                      }
                      onChange={(selected: any) => {
                        if (Array.isArray(selected)) {
                          const selectedIds = selected.map((option: {value: string}) => option.value);
                          handleFilterChange('tags', selectedIds);
                        } else {
                          handleFilterChange('tags', []);
                        }
                      }}
                      filterOption={(option: any, inputValue: string) => {
                        // Case-insensitive search
                        return option.label.toLowerCase().includes(inputValue.toLowerCase());
                      }}
                      noOptionsMessage={({inputValue}: {inputValue: string}) => 
                        !inputValue ? "Type to search for tags" : "No matching tags found"
                      }
                      placeholder="Type to search for tags"
                      styles={{
                        control: (provided: any) => ({
                          ...provided,
                          minHeight: '42px',
                          marginTop: '0px'
                        }),
                        menu: (provided: any) => ({
                          ...provided,
                          zIndex: 9999
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Select All Checkbox */}
              <div className="select-all-container" style={{
                padding: '12px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div 
                  className="custom-checkbox" 
                  onClick={() => handleToggleAll(!areAllFilteredQuestionsSelected())}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid #cbd5e1',
                    backgroundColor: areAllFilteredQuestionsSelected() ? '#4a2d4e' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginRight: '12px'
                  }}
                >
                  {areAllFilteredQuestionsSelected() && <FiCheck size={14} color="white" />}
                </div>
                <span style={{ fontSize: '14px', color: '#475569' }}>
                  Select All ({filteredQuestions.length} questions)
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#64748b' }}>
                  {selectedIds.length} selected
                </span>
              </div>
              
              {/* Questions List */}
              <div className="questions-list" style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '16px 24px 0', /* Added top padding for spacing */
              }}>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <div 
                      key={question.id} 
                      className="question-item" 
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer',
                        backgroundColor: selectedIds.includes(question.id || '') ? 'rgba(74, 45, 78, 0.05)' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => {
                        handleToggleQuestion(question.id || '');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggleQuestion(question.id);
                        }
                      }}
                    >
                      <div className="question-checkbox" style={{
                        marginTop: '4px'
                      }}>
                        {selectedIds.includes(question.id) ? (
                          <div className="custom-checkbox checkbox-checked" style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#4a2d4e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <FiCheck size={14} color="white" />
                          </div>
                        ) : (
                          <div className="custom-checkbox checkbox-unchecked" style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '2px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                          }} />
                        )}
                      </div>
                      <div className="question-content" style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div className="question-title" style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#334155'
                        }}>
                          {question.text || 'Untitled Question'}
                        </div>
                        
                        <div className="question-meta" style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginTop: '4px'
                        }}>
                          <div className="question-type" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#fff',
                            backgroundColor: '#f1f5f9',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}>
                            {question.type === 'multipleChoice' && <FiList size={12} />}
                            {question.type === 'text' && <FiType size={12} />}
                            {question.type === 'rating' && <FiStar size={12} />}
                            {question.type === 'checkbox' && <FiCheckSquare size={12} />}
                            {question.type === 'dropdown' && <FiChevronDown size={12} />}
                            {!['multipleChoice', 'text', 'rating', 'checkbox', 'dropdown'].includes(question.type) && <FiHelpCircle size={12} />}
                            {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                          </div>
                          
                          {/* Display tags if available */}
                          {(() => {
                            // Debug info
                            const questionId = question.id || '';
                            console.log(`Checking tags for question: ${questionId}`);
                            console.log(`Tags from map using id:`, questionsWithTags.get(questionId));
                            
                            // Get tags for this question
                            const tags = questionsWithTags.get(questionId);
                            
                            if (tags && tags.length > 0) {
                              console.log(`Found tags for question ${questionId}:`, tags);
                              return tags.map((tagId: string) => {
                                // Find the layer with this ID
                                const tagObj = allTags.find((tag: Layer) => tag && tag._id === tagId);
                                
                                // If we can't find the tag by ID, try finding by name (in case the ID is actually a name)
                                const tagName = tagObj ? tagObj.name : 
                                  (allTags.find((tag: Layer) => tag && tag.name === tagId) ? tagId : 'Unknown');
                                
                                console.log(`Tag ${tagId} maps to:`, tagObj || tagName);
                                
                                return (
                                  <div key={tagId} className="question-tag" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    color: '#4a2d4e',
                                    backgroundColor: 'rgba(74, 45, 78, 0.1)',
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    <FiTag size={12} />
                                    {tagName}
                                  </div>
                                );
                              });
                            } else {
                              console.log(`No tags found for question ${questionId}`);
                              return null;
                            }
                          })()
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-questions" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    color: '#64748b',
                    textAlign: 'center',
                    gap: '16px'
                  }}>
                    <FiSearch size={40} />
                    <h3>No Questions Found</h3>
                    <p>Try adjusting your filters or search terms to find what you're looking for.</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons-container" style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#ffffff',
                width: '96%',
                margin: '0 auto'
              }}>
                <button 
                  className="cancel-button"
                  onClick={(e) => {
                    // Only close if we're not in the middle of creating a question
                    if (!questionSaved) {
                      onClose();
                    } else {
                      // If a question was just created, reset the state but keep the modal open
                      setQuestionSaved(false);
                    }
                  }}
                  aria-label="Cancel"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="select-button"
                  onClick={handleSave}
                  aria-label="Select questions"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4a2d4e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Add Selected ({selectedIds.length})
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
