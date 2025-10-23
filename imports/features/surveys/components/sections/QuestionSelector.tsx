import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiTag, 
  FiList, 
  FiType, 
  FiStar, 
  FiCheckSquare, 
  FiChevronDown, 
  FiHelpCircle 
} from 'react-icons/fi';
import { QuestionItem } from '../../types';
import { useTracker } from 'meteor/react-meteor-data';
import { Layers, Layer } from '/imports/api/layers';
import { Meteor } from 'meteor/meteor';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import './QuestionSelector.css';


interface QuestionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  selectedQuestionIds: string[];
  sectionId: string;
  onSelectQuestions: (questionIds: string[], sectionId: string) => void;
  onRemoveQuestions?: (questionIds: string[], sectionId: string) => void; // NEW: Real-time removal
  onQuestionsRefresh?: () => void; // Optional callback to refresh questions list
  allSurveyQuestions?: QuestionItem[]; // NEW: All questions across sections for indicators
  sections?: Array<{ id: string; name: string }>; // NEW: Section data for indicators
  surveyId?: string; // For server-side pagination
}

// Extended QuestionItem interface with tags
interface ExtendedQuestionItem extends QuestionItem {
  categoryTags?: string[];
}

import { Questions } from '../../../../features/questions/api/questions';

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  isOpen,
  onClose,
  questions,
  selectedQuestionIds,
  sectionId,
  onSelectQuestions,
  onRemoveQuestions,
  onQuestionsRefresh,
  allSurveyQuestions,
  sections,
  surveyId,
}) => {
  // console.log("isOpen",isOpen)
  // State to handle closing animation
  const [isClosing, setIsClosing] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Pagination state: 50 per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSizeOptions = [5, 10, 25, 50];
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalCount, setTotalCount] = useState<number>(questions?.length || 0);
  const [isSubReady, setIsSubReady] = useState<boolean>(false);
  
  // Initialize Tom Select on dropdowns
  useEffect(() => {
    console.log('Initializing TomSelect with selectedType:', selectedType);
    
    // Initialize Tom Select on all dropdowns with the tom-select class
    // Exclude the typeFilter which now uses a standard select
    const dropdowns = document.querySelectorAll('select.tom-select:not(#typeFilter)');
    
    // Destroy existing instances first
    dropdowns.forEach(dropdown => {
      const tomSelectInstance = (dropdown as HTMLSelectElement & { tomselect?: any }).tomselect;
      if (tomSelectInstance) {
        tomSelectInstance.destroy();
      }
    });
    
    // Create new instances
    dropdowns.forEach(dropdown => {
      // For tag select elements, we need special handling to only show options when typing
      const isTags = dropdown.classList.contains('tag-filter-select');
      
      console.log('Initializing dropdown:', dropdown.id, { isTags });
      
      const tomSelect = new TomSelect(dropdown as HTMLSelectElement, {
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
        tomSelect.on('type', function() {
          // Always keep dropdown open when interacting with tags
          tomSelect.open();
        });
      }
      
      // No special handling for type filter needed anymore as we're using a standard select
    });
    
    // Cleanup function to destroy instances when component unmounts
    return () => {
      dropdowns.forEach(dropdown => {
        const tomSelectInstance = (dropdown as HTMLSelectElement & { tomselect?: any }).tomselect;
        if (tomSelectInstance) {
          tomSelectInstance.destroy();
        }
      });
    };
  }, []); // No need to reinitialize when selectedType changes anymore
  
  
  // State for selected question IDs (internal to this component)
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedQuestionIds || []);
  
  // Only update if the modal is opening or if there are significant changes
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isOpen && isInitialLoad) {
      setSelectedIds(selectedQuestionIds || []);
      setIsInitialLoad(false);
    }
  }, [isOpen, selectedQuestionIds, isInitialLoad]);
  
  // Reset initial load flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialLoad(true);
    }
  }, [isOpen]);
  
  // State to track if a question was just created
  const [questionSaved, setQuestionSaved] = useState(false);
  
  // Suppress unused variable warning for questionSaved
  void questionSaved;
  
  // We're now using hardcoded question types in the dropdown
  // This array is kept for reference but not used in the UI
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    questions.forEach(question => {
      if (question.type) {
        types.add(question.type);
      }
    });
    return Array.from(types);
  }, [questions]);
  
  // Log available types for debugging
  useEffect(() => {
    console.log('Available question types in data:', availableTypes);
  }, [availableTypes]);
  
  // Get all available tags - using the same approach as TagBuilder
  const { allTags } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    
    // Get all layers
    const rawTags = Layers.find({}).fetch();
    
    // Log all layers to see what's available
    console.log('All layers from collection:', rawTags);
    
    // Filter to include all layers - we'll filter in the UI as needed
    // This matches the approach in TagBuilder which doesn't filter by type
    
    return {
      allTags: rawTags
    };
  }, []);
  
  // Get questions with tags
  const questionsWithTags = useMemo(() => {
    const map = new Map<string, string[]>();
    
    // Fetch all questions with their tags
    const questionsWithTagsData = Questions.find({}).fetch();
    
    questionsWithTagsData.forEach(question => {
      // Get tags from the labels array in the versions object
      if (question._id && (question as any).versions && Array.isArray((question as any).versions) && (question as any).versions.length > 0) {
        // Get the latest version (first in the array)
        const latestVersion = (question as any).versions[0];
        
        // Check if the version has labels
        if (latestVersion && latestVersion.labels && Array.isArray(latestVersion.labels)) {
          const labels = latestVersion.labels;
          
          // Store labels as tags using both _id and id to ensure we can retrieve them
          map.set(question._id, labels);
          
          // If the question has an id property that's different from _id, store under that too
          if ((question as any).id && (question as any).id !== question._id) {
            map.set((question as any).id, labels);
          }
        }
      }
    });
    
    return map;
  }, []);
  
  // Filter questions based on search term and filters
  const filteredQuestions = useMemo(() => {
    const source = isSubReady ? Questions.find({}, { sort: { createdAt: -1 } }).fetch().map((q: Record<string, any>) => {
      // Map to QuestionItem shape quickly
      const latest = (q.versions && q.versions.find((v: Record<string, any>) => v.version === q.currentVersion)) || (q.versions || [])[0] || {};
      return {
        id: q._id,
        text: (latest.questionText || '').replace(/<[^>]*>/g, ''),
        type: latest.responseType || 'text',
        status: 'published',
      } as QuestionItem;
    }) : questions;
    return source.filter(question => {
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
  }, [questions, searchTerm, selectedType, selectedTags, isSubReady]);
  
  // Debug logging for filtered questions
  useEffect(() => {
    console.log('Filtered questions count:', filteredQuestions.length);
    console.log('First 3 filtered questions:', filteredQuestions.slice(0, 3));
    console.log('Current filters:', { searchTerm, selectedType, selectedTags });
  }, [filteredQuestions, searchTerm, selectedType, selectedTags]);

  // Reset to first page when filters/search change
  useEffect(() => {
    console.log('Resetting to page 1 due to filter change');
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedTags, questions]);
  
  // Compute pagination
  const totalPages = Math.max(1, Math.ceil((isSubReady ? totalCount : filteredQuestions.length) / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageQuestions = useMemo(() => {
    // When using server-side pagination, we need to apply filters manually
    if (isSubReady) {
      console.log('Using server-side pagination with filters:', { searchTerm, selectedType });
      
      // Get all questions from the subscription
      const docs = Questions.find({}, { sort: { createdAt: -1 } }).fetch();
      
      // Map to QuestionItem format
      const mappedDocs = docs.map((q: Record<string, any>) => {
        const latest = (q.versions && q.versions.find((v: Record<string, any>) => v.version === q.currentVersion)) || (q.versions || [])[0] || {};
        return {
          id: q._id,
          text: (latest.questionText || '').replace(/<[^>]*>/g, ''),
          type: latest.responseType || 'text',
          status: 'published',
        } as QuestionItem;
      });
      
      // Apply the same filtering logic as in filteredQuestions
      return mappedDocs.filter(question => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          question.text?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by type
        const matchesType = selectedType === '' || question.type === selectedType;
        
        // Only show questions that match all filters
        const matches = matchesSearch && matchesType;
        
        // Debug individual question filtering
        if (searchTerm || selectedType) {
          console.log(`Server-side question ${question.id} (${question.text?.substring(0, 20)}...)`, { 
            matchesSearch, 
            matchesType,
            included: matches
          });
        }
        
        return matches;
      });
    }
    
    // For client-side pagination, use the already filtered questions
    return filteredQuestions.slice(startIndex, startIndex + pageSize);
  }, [filteredQuestions, startIndex, pageSize, isSubReady, searchTerm, selectedType, selectedTags]);
  
  // Helper function to get question's current section
  const getQuestionSection = (questionId: string): string | null => {
    const question = allSurveyQuestions?.find(q => q.id === questionId);
    return question?.sectionId || null;
  };
  
  // Helper function to get section name
  const getSectionName = (sectionId: string): string => {
    const section = sections?.find(s => s.id === sectionId);
    return section?.name || 'Unknown Section';
  };
  
  // State to track pending removals to avoid conflicts
  const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set());
  
  // Toggle question selection
  const handleToggleQuestion = (questionId: string) => {
    const questionSection = getQuestionSection(questionId);
    
    // Check if question is already in a different section
    if (questionSection && questionSection !== sectionId) {
      console.warn(`Question already selected in ${getSectionName(questionSection)}`);
      return; // Prevent selection
    }
    
    // Check if this question is pending removal
    if (pendingRemovals.has(questionId)) {
      console.log('Question is pending removal, ignoring toggle');
      return;
    }
    
    setSelectedIds(prev => {
      const wasSelected = prev.includes(questionId);
      const wasPreSelected = selectedQuestionIds.includes(questionId);
      
      if (wasSelected) {
        // Deselecting - only trigger real-time removal if it was pre-selected
        if (wasPreSelected && onRemoveQuestions) {
          // Add to pending removals to prevent conflicts
          setPendingRemovals(current => new Set([...current, questionId]));
          
          // Question was removed - notify parent with debouncing
          setTimeout(() => {
            onRemoveQuestions([questionId], sectionId);
            // Remove from pending after a delay
            setTimeout(() => {
              setPendingRemovals(current => {
                const newSet = new Set(current);
                newSet.delete(questionId);
                return newSet;
              });
            }, 1000);
          }, 100);
        }
        return prev.filter(id => id !== questionId);
      } else {
        // Selecting - no real-time update, just local state
        return [...prev, questionId];
      }
    });
  };
  
  // Toggle all filtered questions
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      // Add all current page question IDs that aren't already selected
      const newIds = currentPageQuestions
        .map(q => q.id || '')
        .filter(id => id && !selectedIds.includes(id));
      
      setSelectedIds(prev => [...prev, ...newIds]);
    } else {
      // Remove all current page question IDs from selection
      const filteredIds = new Set(currentPageQuestions.map(q => q.id || ''));
      setSelectedIds(prev => prev.filter(id => !filteredIds.has(id)));
    }
  };
  
  // Check if all current page questions are selected
  const areAllFilteredQuestionsSelected = () => {
    return currentPageQuestions.length > 0 && currentPageQuestions.every(q => q.id && selectedIds.includes(q.id));
  };

  // Server-side subscription for pagination
  useEffect(() => {
    if (!isOpen) return;
    // Fetch total count once per open
    if (surveyId) {
      Meteor.call('questions.count', surveyId, (err: Error | null, count: number) => {
        if (!err && typeof count === 'number') setTotalCount(count);
      });
    } else {
      Meteor.call('questions.count', (err: Error | null, count: number) => {
        if (!err && typeof count === 'number') setTotalCount(count);
      });
    }
  }, [isOpen, surveyId]);

  useEffect(() => {
    if (!isOpen) return;
    setIsSubReady(false);
    const skip = (currentPage - 1) * pageSize;
    const limit = pageSize;
    const handle = Meteor.subscribe('questions.all', surveyId, skip, limit, {
      onReady: () => setIsSubReady(true),
      onStop: () => setIsSubReady(false),
    });
    return () => handle.stop();
  }, [isOpen, surveyId, currentPage, pageSize]);

  // Reset page when pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);
  
  // Reset isClosing state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);
  
  // Handle filter changes
  const handleFilterChange = (filterType: 'type' | 'tags', value: string | string[]) => {
    console.log(`Filter change: ${filterType}`, value);
    
    if (filterType === 'type') {
      // For type filter, ensure we have a string value
      const typeValue = typeof value === 'string' ? value : '';
      console.log('Setting selectedType to:', typeValue);
      setSelectedType(typeValue);
    } else {
      // For tags filter, ensure we have an array value
      const tagsValue = typeof value === 'string' ? [value] : value;
      console.log('Setting selectedTags to:', tagsValue);
      setSelectedTags(tagsValue);
    }
    
    // Log the current filter state after the update
    setTimeout(() => {
      console.log('Current filter state:', { 
        searchTerm, 
        selectedType: typeof value === 'string' && filterType === 'type' ? value : selectedType,
        selectedTags: filterType === 'tags' ? (typeof value === 'string' ? [value] : value) : selectedTags
      });
    }, 0);
  };
  
  // Handle saving selected questions
  const handleSave = () => {
    // Only add newly selected questions (removals are handled real-time)
    const newlySelectedIds = selectedIds.filter(id => !selectedQuestionIds.includes(id));
    if (newlySelectedIds.length > 0) {
      onSelectQuestions(newlySelectedIds, sectionId);
    }
    
    // Clear pending removals and reset state
    setPendingRemovals(new Set());
    onClose();
  };
  
  // Check if Add button should be disabled
  const newSelections = selectedIds.filter(id => !selectedQuestionIds.includes(id));
  const isAddButtonDisabled = newSelections.length === 0;
  
  // Get button text based on selection
  const getAddButtonText = () => {
    if (selectedIds.length === 0) {
      return 'No Questions Selected';
    }
    if (newSelections.length === 0) {
      return `${selectedIds.length} Already Selected`;
    }
    return `Add Selected (${newSelections.length})`;
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
                      className="standard-select"
                      value={selectedType}
                      onChange={(e) => {
                        console.log('Type filter changed:', e.target.value);
                        handleFilterChange('type', e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '14px',
                        color: '#334155',
                        appearance: 'auto',
                        height: '42px'
                      }}
>
                      <option value="">All Types</option>
                      <option value="radio">Single Choice (Radio)</option>
                      <option value="checkbox">Multiple Choice (Checkbox)</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="rating">Rating Scale</option>
                      <option value="likert">Likert Scale</option>
                      <option value="ranking">Ranking</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  
                  {/* Tag Filter */}
                  {/* <div className="filter-group" style={{
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
                  </div> */}
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
                    backgroundColor: areAllFilteredQuestionsSelected() ? '#552a47' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginRight: '12px'
                  }}
                >
                  {areAllFilteredQuestionsSelected() && <FiCheck size={14} color="#ffffff" />}
                </div>
                <span style={{ fontSize: '14px', color: '#475569' }}>
                  Select All (page {currentPage} of {totalPages})
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
                {currentPageQuestions.length > 0 ? (
                  currentPageQuestions.map((question) => {
                    const currentSection = getQuestionSection(question.id);
                    const isInDifferentSection = currentSection && currentSection !== sectionId;
                    const isSelected = selectedIds.includes(question.id || '');
                    
                    return (
                    <div 
                      key={question.id} 
                      className="question-item" 
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: isInDifferentSection ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected 
                          ? 'rgba(85, 42, 71, 0.05)' 
                          : isInDifferentSection 
                            ? 'rgba(85, 42, 71, 0.03)'
                            : 'transparent',
                        opacity: isInDifferentSection ? 0.8 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        if (!isInDifferentSection) {
                          handleToggleQuestion(question.id || '');
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!isInDifferentSection) {
                            handleToggleQuestion(question.id);
                          }
                        }
                      }}
                    >
                      <div className="question-checkbox" style={{
                        marginTop: '4px'
                      }}>
                        {isSelected ? (
                          <div className="custom-checkbox checkbox-checked" style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#552a47',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isInDifferentSection ? 'not-allowed' : 'pointer'
                          }}>
                            <FiCheck size={14} color="#ffffff" />
                          </div>
                        ) : (
                          <div className="custom-checkbox checkbox-unchecked" style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `2px solid ${isInDifferentSection ? '#552a47' : '#cbd5e1'}`,
                            backgroundColor: '#ffffff',
                            cursor: isInDifferentSection ? 'not-allowed' : 'pointer'
                          }} />
                        )}
                      </div>
                      <div className="question-content" style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        position: 'relative'
                      }}>
                        <div className="question-title" style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#334155',
                          paddingRight: isInDifferentSection ? '120px' : '0'
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
                            // console.log(`Checking tags for question: ${questionId}`);
                            // console.log(`Tags from map using id:`, questionsWithTags.get(questionId));
                            
                            // Get tags for this question
                            const tags = questionsWithTags.get(questionId);
                            
                            if (tags && tags.length > 0) {
                              // console.log(`Found tags for question ${questionId}:`, tags);
                              return tags.map((tagId: string) => {
                                // Find the layer with this ID
                                const tagObj = allTags.find((tag: Layer) => tag && tag._id === tagId);
                                
                                // If we can't find the tag by ID, try finding by name (in case the ID is actually a name)
                                const tagName = tagObj ? tagObj.name : 
                                  (allTags.find((tag: Layer) => tag && tag.name === tagId) ? tagId : 'Unknown');
                                
                                // console.log(`Tag ${tagId} maps to:`, tagObj || tagName);
                                
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
                              // console.log(`No tags found for question ${questionId}`);
                              return null;
                            }
                          })()}
                        </div>
                        
                        {/* Section indicator - positioned as a badge */}
                        {isInDifferentSection && (
                          <div className="section-indicator" style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            fontSize: '11px',
                            color: '#ffffff',
                            backgroundColor: '#552a47',
                            padding: '3px 6px',
                            borderRadius: '12px',
                            border: '1px solid #552a47',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            In {getSectionName(currentSection)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })
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
                    <p>Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination Controls (Rows per page + Prev/Next + Page numbers) */}
              <div style={{
                padding: '12px 24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {/* Rows per page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: '#334155'
                    }}
                  >
                    {pageSizeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                {/* Pager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                      color: currentPage === 1 ? '#94a3b8' : '#475569',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: pageNum === currentPage ? '1px solid var(--color-primary, #552a47)' : '1px solid #e2e8f0',
                        backgroundColor: pageNum === currentPage ? 'var(--color-primary, #552a47)' : '#ffffff',
                        color: pageNum === currentPage ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        minWidth: 34,
                      }}
                      aria-label={`Go to page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                      color: currentPage === totalPages ? '#94a3b8' : '#475569',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
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
                  onClick={() => {
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
                  disabled={isAddButtonDisabled}
                  aria-label="Select questions"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isAddButtonDisabled ? '#94a3b8' : '#552a47',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 500,
                    cursor: isAddButtonDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isAddButtonDisabled ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                    opacity: isAddButtonDisabled ? 0.6 : 1
                  }}
                >
                  {getAddButtonText()}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
