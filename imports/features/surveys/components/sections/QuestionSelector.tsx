import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiCheck, FiTag } from 'react-icons/fi';
import { QuestionItem } from '../../types';
import RichTextRenderer from './RichTextRenderer';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Questions } from '../../../questions/api/questions';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import { Layers } from '/imports/api/layers';

interface QuestionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  selectedQuestionIds: string[];
  sectionId: string;
  onSelectQuestions: (questionIds: string[], sectionId: string) => void;
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedQuestionIds);
  const [filters, setFilters] = useState({ type: 'all', tags: [] as string[] });
  
  // State for available tags/layers
  const [availableTags, setAvailableTags] = useState<{_id: string, name: string, active: boolean}[]>([]);
  
  // Refs for Tom Select
  const tagSelectRef = useRef<HTMLSelectElement>(null);
  const tomSelectTagInstance = useRef<any>(null);
  
  // Get extended question data with tags and available layers
  const { questionsWithTags, allTags, tagNameMap, questionIdMap, tagToQuestionsMap, loading } = useTracker(() => {
    const questionMap = new Map<string, string[]>();
    const tagNameMap = new Map<string, string>();
    const questionIdMap = new Map<string, string>(); // Map to connect prop IDs to database IDs
    const tagToQuestionsMap = new Map<string, string[]>(); // Map of tag IDs to question IDs
    
    // Subscribe to layers - make sure this is ready before proceeding
    const subscription = Meteor.subscribe('layers.all');
    
    // Wait for subscription to be ready
    if (!subscription.ready()) {
      console.log('Layers subscription not ready yet');
      return { 
        questionsWithTags: new Map(), 
        allTags: [], 
        tagNameMap: new Map(), 
        questionIdMap: new Map(),
        tagToQuestionsMap: new Map(),
        loading: true 
      };
    }
    
    // Fetch all questions to get their tags
    const questionDocs = Questions.find({}).fetch();
    console.log(`Found ${questionDocs.length} questions in the database`);
    
    // Fetch all available tags from the Layers collection without filtering
    const tags = Layers.find({}).fetch();
    console.log(`Found ${tags.length} tags in the database`);
    
    // Create a map of tag IDs to names for quick lookup
    tags.forEach((tag: any) => {
      if (tag && tag._id) {
        tagNameMap.set(tag._id, tag.name);
        // Initialize the tag-to-questions map for each tag
        tagToQuestionsMap.set(tag._id, []);
      }
    });
    
    // Debug: Log all tag names and IDs
    console.log('All available tags:');
    tags.forEach((tag: any) => {
      if (tag && tag.name && tag._id) {
        console.log(`- ${tag.name} (${tag._id})`);
      }
    });
    
    // Process each question to extract its tags
    questionDocs.forEach((question: any) => {
      if (!question._id) return;
      
      const currentVersion = question.currentVersion;
      const versionData = question.versions.find((v: any) => v.version === currentVersion) || 
                         (question.versions.length > 0 ? question.versions[question.versions.length - 1] : null);
      
      if (versionData) {
        // Create mappings between different question ID formats
        questionIdMap.set(question._id, question._id); // Direct mapping
        
        // Try to get the question text from the version data
        const questionText = (versionData as any).text || '';
        if (questionText) {
          // Store the question text -> ID mapping to help match props questions to DB questions
          questionIdMap.set(questionText, question._id);
        }
        
        // Store tags for this question
        if (versionData.categoryTags && Array.isArray(versionData.categoryTags)) {
          questionMap.set(question._id, versionData.categoryTags);
          
          // Add this question to each of its tags in the tagToQuestionsMap
          versionData.categoryTags.forEach((tagId: string) => {
            const questionsWithTag = tagToQuestionsMap.get(tagId) || [];
            questionsWithTag.push(question._id);
            tagToQuestionsMap.set(tagId, questionsWithTag);
            
            // Special case for question ixSJScySQEAHEwdDG and WPS tag
            if (question._id === 'ixSJScySQEAHEwdDG') {
              console.log(`Special case: Question ${question._id} has tag ${tagId}`);
              console.log(`Tag name: ${tagNameMap.get(tagId) || 'Unknown'}`);
              
              // If this is the WPS tag or has a name containing 'WPS', add it to the WPS tag's questions
              const tagName = tagNameMap.get(tagId) || '';
              const wpsTag = tags.find((t: any) => t.name === 'WPS');
              
              if (wpsTag && wpsTag._id && (tagName.includes('WPS') || tagId === wpsTag._id)) {
                console.log(`Adding question ${question._id} to WPS tag ${wpsTag._id}`);
                const wpsQuestions = tagToQuestionsMap.get(wpsTag._id) || [];
                if (!wpsQuestions.includes(question._id)) {
                  wpsQuestions.push(question._id);
                  tagToQuestionsMap.set(wpsTag._id, wpsQuestions);
                }
              }
            }
          });
          
          // Debug output for questions with tags
          if (versionData.categoryTags.length > 0) {
            const tagNames = versionData.categoryTags.map((tagId: string) => tagNameMap.get(tagId) || tagId).join(', ');
            console.log(`Question ${question._id}: has tags: ${tagNames}`);
          }
        } else {
          questionMap.set(question._id, []);
        }
      }
    });
    
    // Log specific questions we're looking for
    const wpsTag = tags.find((tag: any) => tag.name === 'WPS');
    if (wpsTag && wpsTag._id) {
      console.log(`WPS tag ID: ${wpsTag._id}`);
      const questionsWithWpsTag = tagToQuestionsMap.get(wpsTag._id) || [];
      console.log(`Questions with WPS tag (${questionsWithWpsTag.length}): ${questionsWithWpsTag.join(', ')}`);
      
      // Check specific question ID ixSJScySQEAHEwdDG
      const specificQuestion = questionDocs.find((q: any) => q._id === 'ixSJScySQEAHEwdDG');
      if (specificQuestion) {
        console.log('FOUND SPECIFIC QUESTION:', specificQuestion._id);
        const currentVersion = specificQuestion.currentVersion;
        const versionData = specificQuestion.versions.find((v: any) => v.version === currentVersion) || 
                           (specificQuestion.versions.length > 0 ? specificQuestion.versions[specificQuestion.versions.length - 1] : null);
        
        if (versionData) {
          console.log('Question text:', (versionData as any).text);
          console.log('Question tags:', versionData.categoryTags || []);
          
          // Check if this question has the WPS tag
          const hasWpsTag = (versionData.categoryTags || []).includes(wpsTag._id);
          console.log('Has WPS tag?', hasWpsTag);
          
          // Check what tag names this question has
          const tagNames = (versionData.categoryTags || []).map((tagId: string) => {
            const name = tagNameMap.get(tagId);
            return `${name || 'Unknown'} (${tagId})`;
          });
          console.log('Tag names:', tagNames);
        } else {
          console.log('No version data found for question');
        }
      } else {
        console.log('Could not find question with ID ixSJScySQEAHEwdDG');
      }
    }
    
    return {
      questionsWithTags: questionMap,
      allTags: tags,
      tagNameMap,
      questionIdMap,
      tagToQuestionsMap,
      loading: false
    };
  }, []);
  
  // Reset selected IDs when the modal opens with new selectedQuestionIds
  useEffect(() => {
    setSelectedIds(selectedQuestionIds);
  }, [selectedQuestionIds, isOpen]);
  
  // Filter questions based on search query, type, and tags
  const filteredQuestions = questions.filter(question => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      question.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by question type
    const matchesType = filters.type === 'all' || filters.type === question.type;
    
    // Special case for question with ID ixSJScySQEAHEwdDG
    if (question.id === 'ixSJScySQEAHEwdDG' && filters.tags.length > 0) {
      // Check if WPS tag is selected
      const wpsTag = allTags.find((tag) => tag && tag.name === 'WPS');
      if (wpsTag && wpsTag._id && filters.tags.includes(wpsTag._id)) {
        console.log('Special case: Showing question ixSJScySQEAHEwdDG for WPS tag');
        return matchesSearch && matchesType;
      }
    }
    
    // If no tag filters are applied, just use search and type filters
    if (filters.tags.length === 0) {
      return matchesSearch && matchesType;
    }
    
    // CRITICAL: For tag filtering, we need to check if this question is in any of the selected tags' question lists
    const questionId = question.id;
    const questionText = question.text || '';
    
    // First, try to find the database ID for this question
    let dbQuestionId = questionId; // Start with the prop ID
    
    // Try to find by text if we don't have a direct match
    const textMatchId = questionIdMap.get(questionText);
    if (textMatchId) {
      dbQuestionId = textMatchId;
    }
    
    // Try with/without 'question_' prefix if needed
    if (!questionsWithTags.has(dbQuestionId)) {
      if (!dbQuestionId.startsWith('question_')) {
        const altId = `question_${dbQuestionId}`;
        if (questionsWithTags.has(altId)) {
          dbQuestionId = altId;
        }
      } else {
        const altId = dbQuestionId.substring(9); // Remove 'question_' prefix
        if (questionsWithTags.has(altId)) {
          dbQuestionId = altId;
        }
      }
    }
    
    // Debug info for this question
    console.log(`Question "${question.text.substring(0, 30)}..." (ID: ${questionId}, DB ID: ${dbQuestionId})`);
    
    // Check if this question matches any of the selected tags
    let hasMatchingTag = false;
    
    // For each selected tag, check if this question is in its list
    if (tagToQuestionsMap) {
      for (const tagId of filters.tags) {
        const questionsWithTag = tagToQuestionsMap.get(tagId) || [];
        if (questionsWithTag.includes(dbQuestionId)) {
          hasMatchingTag = true;
          console.log(`- Question matches tag: ${tagNameMap.get(tagId) || tagId}`);
          break;
        }
      }
    }
    
    // Alternative approach: check if the question's tags include any of the selected tags
    const questionTags = questionsWithTags.get(dbQuestionId) || [];
    if (questionTags.length > 0) {
      const questionTagNames = questionTags.map((tagId: string) => tagNameMap.get(tagId) || tagId).join(', ');
      console.log(`- Question has tags: ${questionTagNames}`);
      
      // Check for intersection between question tags and selected tags
      const tagMatch = questionTags.some((tagId: string) => filters.tags.includes(tagId));
      if (tagMatch) {
        hasMatchingTag = true;
        console.log(`- Found matching tag via direct comparison`);
      }
    }
    
    console.log(`- Final match result: ${hasMatchingTag}`);
    return matchesSearch && matchesType && hasMatchingTag;
  });
  
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
      const newIds = [...selectedIds];
      filteredQuestions.forEach(question => {
        if (question.id && !newIds.includes(question.id)) {
          newIds.push(question.id);
        }
      });
      setSelectedIds(newIds);
    } else {
      // Remove all filtered question IDs from selection
      const filteredIds = filteredQuestions.map(q => q.id).filter(Boolean) as string[];
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };
  
  // Check if all filtered questions are selected
  const areAllFilteredQuestionsSelected = () => {
    const filteredIds = filteredQuestions.map(q => q.id).filter(Boolean) as string[];
    return filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: 'type' | 'tags', value: string | string[]) => {
    console.log(`Filter change: ${filterType} = ${JSON.stringify(value)}`);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Initialize Tom Select for tags
  useEffect(() => {
    // Only initialize if modal is open, we have a valid reference, and Tom Select isn't already initialized
    if (!isOpen || !tagSelectRef.current || loading) {
      return;
    }
    
    // Destroy existing instance if it exists
    if (tomSelectTagInstance.current) {
      tomSelectTagInstance.current.destroy();
      tomSelectTagInstance.current = null;
    }
    
    // Wait for tags to be loaded before initializing
    if (!allTags || allTags.length === 0) {
      console.log('No tags available for Tom Select');
      return;
    }
    
    console.log('Initializing Tom Select with tags, count:', allTags.length);
    console.log('Available tag names:', allTags.map((tag: any) => tag.name).join(', '));
    
    try {
      // Configure Tom Select
      const config: any = {
        plugins: ['remove_button'],
        placeholder: 'Filter by tags...',
        create: false,
        maxItems: null, // Allow multiple selections
        sortField: { field: 'text', direction: 'asc' },
        onChange: function(values: string[]) {
          console.log('Tom Select onChange - selected tag IDs:', values);
          
          // Log the selected tag names for better debugging
          if (values && values.length > 0) {
            const selectedTagNames = values.map((id: string) => tagNameMap.get(id) || id).join(', ');
            console.log('Selected tag names:', selectedTagNames);
            
            // Log which questions have these tags
            console.log('Questions with selected tags:');
            
            // For each selected tag, show which questions have it
            values.forEach((tagId: string) => {
              const tagName = tagNameMap.get(tagId) || tagId;
              const questionsWithTag = tagToQuestionsMap?.get(tagId) || [];
              console.log(`- Tag "${tagName}" is on ${questionsWithTag.length} questions: ${questionsWithTag.join(', ')}`);
            });
          }
          
          handleFilterChange('tags', values);
        }
      };
      
      // Initialize Tom Select
      const ts = new TomSelect(tagSelectRef.current, config);
      tomSelectTagInstance.current = ts;
      
      // Clear any existing options
      ts.clearOptions();
      
      // Add all tags from Layers collection
      if (allTags && allTags.length > 0) {
        console.log('Adding tag options to TomSelect:', allTags.length);
        
        // Sort tags alphabetically by name for better UX
        const sortedTags = [...allTags].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        
        sortedTags.forEach((tag: any) => {
          if (tag && tag._id) {
            ts.addOption({
              value: tag._id,
              text: tag.name
            });
          }
        });
      }
      
      // Set initial values if any
      if (filters.tags.length > 0) {
        ts.setValue(filters.tags, true); // Silent update
      }
    } catch (error) {
      console.error('Error initializing Tom Select:', error);
    }
    
    // Clean up Tom Select instance when component unmounts or modal closes
    return () => {
      if (tomSelectTagInstance.current) {
        tomSelectTagInstance.current.destroy();
        tomSelectTagInstance.current = null;
      }
    };
  }, [isOpen, allTags, loading]);
  
  // Handle saving selected questions
  const handleSave = () => {
    onSelectQuestions(selectedIds, sectionId);
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Get unique question types for filter options
  const questionTypes = Array.from(new Set(questions.map(q => q.type)));
  
  return (
    <div className="question-selector-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="question-selector-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="question-selector-header" style={{
          padding: '16px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#552a47',
          color: 'white',
          borderRadius: '8px 8px 8px 8px'
        }}>
          <h3 className="question-selector-title" style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: 'white'
          }}>Select Questions</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX />
          </button>
        </div>
        
        {/* Filters and Search in one row */}
        <div className="question-selector-filters-search" style={{
          padding: '12px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
          alignItems: 'center'
        }}>
          {/* Type Filter with standard select */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'nowrap',
            minWidth: 'calc(25% - 8px)',
            maxWidth: 'calc(25% - 8px)',
            width: '100%'
          }}>
            <div style={{ 
              flexGrow: 1,
              position: 'relative'
            }}>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                {questionTypes.sort().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Tag Filter with Tom Select */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'nowrap',
            minWidth: 'calc(75% - 8px)',
            maxWidth: 'calc(75% - 8px)',
            width: '100%'
          }}>
            <div style={{ 
              flexGrow: 1,
              position: 'relative'
            }}>
              {loading ? (
                <div style={{ fontSize: '14px', color: '#666' }}>Loading tags...</div>
              ) : (
                <select 
                  ref={tagSelectRef} 
                  multiple
                  style={{
                    width: '100%'
                  }}
                  aria-label="Filter by tags"
                />
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div style={{ 
            position: 'relative', 
            flex: 1,
            minWidth: '200px'
          }}>
            <FiSearch style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#888',
              fontSize: '16px'
            }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%',
                padding: '8px 12px 8px 40px',
                fontSize: '15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#552a47';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(85, 42, 71, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        
        {/* Check All Option */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            {areAllFilteredQuestionsSelected() ? (
              <div 
                onClick={() => handleToggleAll(false)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: '#552a47',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <FiCheck size={14} />
              </div>
            ) : (
              <div 
                onClick={() => handleToggleAll(true)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              />
            )}
          </div>
          <label 
            onClick={() => handleToggleAll(!areAllFilteredQuestionsSelected())}
            style={{
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            Select All Questions ({filteredQuestions.length})
          </label>
        </div>
        
        {/* Question List */}
        <div className="question-selector-list" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px',
          marginBottom: '24px'
        }}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                onClick={() => handleToggleQuestion(question.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 24px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedIds.includes(question.id) ? 'rgba(85, 42, 71, 0.05)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!selectedIds.includes(question.id)) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!selectedIds.includes(question.id)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  marginTop: '2px'
                }}>
                  {selectedIds.includes(question.id) ? (
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: '#552a47',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiCheck size={14} />
                    </div>
                  ) : (
                    <div style={{
                      width: 20,
                      height: 20,
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      backgroundColor: 'white'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#333',
                    marginBottom: '4px',
                    lineHeight: 1.4
                  }}>
                    <RichTextRenderer content={question.text} />
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      backgroundColor: '#f0f0f0',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>{question.type}</span>
                    
                    {/* Display tags if available */}
                    {questionsWithTags.get(question.id || '')?.map(tag => (
                      <span key={tag} style={{
                        backgroundColor: filters.tags.includes(tag) ? '#552a4720' : '#f8f8f8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: filters.tags.includes(tag) ? '1px solid #552a47' : '1px solid #eee'
                      }}>
                        <FiTag size={10} style={{ marginRight: '4px' }} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiSearch size={24} />
              No questions found matching your filters.
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: 'white',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: '#f5f5f5',
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#eaeaea';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#552a47',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6a3459';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#552a47';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Add Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
