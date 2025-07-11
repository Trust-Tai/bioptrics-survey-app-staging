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
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { QuestionItem } from '../../types';
import { useTracker } from 'meteor/react-meteor-data';
import { Layers, Layer } from '/imports/api/layers';
import RichTextRenderer from './RichTextRenderer';
import { Meteor } from 'meteor/meteor';
import { Questions } from '../../../questions/api/questions';
import { Sections } from '../../../questions/api/sections';
import { Surveys } from '../../../surveys/api/surveys';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import EnhancedQuestionBuilder from '../../../questions/components/admin/EnhancedQuestionBuilder';
import QuestionBuilderStateManager from '../../../questions/components/admin/QuestionBuilderStateManager';
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
  // State for managing the active tab index
  const [tabIndex, setTabIndex] = useState(0);
  
  // State for new custom field form
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  
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
      new TomSelect(dropdown, {
        plugins: ['remove_button'],
        create: false,
        sortField: { field: 'text', direction: 'asc' },
        render: {
          dropdown: function() {
            return '<div class="ts-dropdown-content" style="z-index: 1500;"></div>';
          }
        },
        dropdownParent: 'body' // This helps with z-index issues
      });
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
  }, [tabIndex]); // Re-initialize when tab changes
  
  // State for form fields to preserve data when switching tabs
  interface FormDataState {
    questionText: string;
    questionDescription: string;
    branchingEnabled: boolean;
    questionType: string;
    questionImage: File | null;
    questionImagePreview: string;
    questionTags: string[];
    isRequired: boolean;
    answerOptions: { text: string; value: string }[];
    primaryCategory: string[];
    categories: string[];
    surveyThemes: string[];
    customFields: { name: string; value: string }[];
    // Settings tab fields
    feedbackCollection: string;
    isReusable: boolean;
    isActive: boolean;
    collectDemographics: boolean;
    demographicsMetrics: {
      ageGroup: boolean;
      gender: boolean;
      location: boolean;
      education: boolean;
      income: boolean;
      ethnicity: boolean;
      employment: boolean;
      household: boolean;
      language: boolean;
      device: boolean;
      industry: boolean;
      marital: boolean;
    };
    [key: string]: any; // Allow for dynamic keys
  }

  // Add validation state for form fields
  const [validationErrors, setValidationErrors] = useState<{
    questionText?: string;
  }>({});

  const [formData, setFormData] = useState<FormDataState>({
    questionText: '',
    questionDescription: '',
    branchingEnabled: false,
    questionType: 'likert', // Default question type
    questionImage: null,
    questionImagePreview: '',
    questionTags: [],
    isRequired: false,
    answerOptions: [],
    primaryCategory: [],
    categories: [],
    surveyThemes: [],
    customFields: [],
    // Settings tab fields
    feedbackCollection: 'none',
    isReusable: false,
    isActive: true,
    collectDemographics: true,
    demographicsMetrics: {
      ageGroup: false,
      gender: false,
      location: false,
      education: false,
      income: false,
      ethnicity: false,
      employment: false,
      household: false,
      language: false,
      device: false,
      industry: false,
      marital: false,
    },
  });
  
  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Clear validation errors when user types in a field
    if (name === 'questionText' && validationErrors.questionText) {
      setValidationErrors(prev => ({ ...prev, questionText: undefined }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Functions to navigate between tabs with validation
  const goToNextTab = () => {
    // Validate required fields before allowing navigation
    if (tabIndex === 0 && (!formData.questionText || formData.questionText.trim() === '')) {
      // Show validation error for question text
      setValidationErrors(prev => ({
        ...prev,
        questionText: 'Question Text is required'
      }));
      return; // Prevent navigation
    }
    
    // Clear validation errors when moving forward
    setValidationErrors({});
    
    // There are 6 tabs (0-5), so max index is 5
    if (tabIndex < 5) {
      // Use a setTimeout to ensure DOM operations are complete
      setTimeout(() => {
        setTabIndex(tabIndex + 1);
      }, 0);
    }
  };
  
  const goToPrevTab = () => {
    // Clear validation errors when moving backward
    setValidationErrors({});
    
    if (tabIndex > 0) {
      // Use a setTimeout to ensure DOM operations are complete
      setTimeout(() => {
        setTabIndex(tabIndex - 1);
      }, 0);
    }
  };
  
  // Safe tab switching function to use after validation
  const safeSetTabIndex = (index: number) => {
    // Validate required fields before allowing navigation to tabs other than the first
    if (index > 0 && (!formData.questionText || formData.questionText.trim() === '')) {
      // Show validation error for question text
      setValidationErrors(prev => ({
        ...prev,
        questionText: 'Question Text is required'
      }));
      // Force navigation to the first tab
      setTimeout(() => {
        setTabIndex(0);
      }, 0);
      return;
    }
    
    // Use a setTimeout to ensure DOM operations are complete
    setTimeout(() => {
      setTabIndex(index);
    }, 0);
  };
  // Function to handle image preview
  const handleImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Update state with the file and preview
        setFormData(prev => ({
          ...prev,
          questionImage: file,
          questionImagePreview: e.target.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Function to add a tag
  const addTag = (tagText: string) => {
    const tagDisplay = document.getElementById('tagDisplay');
    if (!tagDisplay) return;

    // Check if tag already exists
    const existingTags = Array.from(tagDisplay.children)
      .map(tag => (tag as HTMLElement).dataset.tagValue)
      .filter(Boolean);

    if (existingTags.includes(tagText)) return;

    // Create tag element
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.dataset.tagValue = tagText;
    tagElement.style.backgroundColor = '#552a47';
    tagElement.style.color = 'white';
    tagElement.style.padding = '4px 10px';
    tagElement.style.borderRadius = '16px';
    tagElement.style.fontSize = '12px';
    tagElement.style.display = 'flex';
    tagElement.style.alignItems = 'center';
    tagElement.style.gap = '5px';

    // Tag text
    const tagTextSpan = document.createElement('span');
    tagTextSpan.textContent = tagText;

    // Remove button
    const removeButton = document.createElement('span');
    removeButton.innerHTML = '×';
    removeButton.style.cursor = 'pointer';
    removeButton.style.fontSize = '14px';
    removeButton.style.fontWeight = 'bold';
    removeButton.onclick = (e) => {
      e.stopPropagation();
      tagDisplay.removeChild(tagElement);

      // Update the hidden input value
      updateTagInputValue();
    };

    // Add elements to tag
    tagElement.appendChild(tagTextSpan);
    tagElement.appendChild(removeButton);

    // Add tag to display
    tagDisplay.appendChild(tagElement);

    // Update the hidden input value
    updateTagInputValue();
  };

  // Function to update tag input value
  const updateTagInputValue = () => {
    const tagDisplay = document.getElementById('tagDisplay');
    const tagInput = document.getElementById('tagInput') as HTMLInputElement;
    if (!tagDisplay || !tagInput) return;

    const tags = Array.from(tagDisplay.children)
      .map(tag => (tag as HTMLElement).dataset.tagValue)
      .filter(Boolean);

    tagInput.value = tags.join(', ');
  };

  // Function to update the hidden tag input with current tags
  const updateTagInput = () => {
    const tagDisplay = document.getElementById('tagDisplay');
    const tagInput = document.getElementById('tagInput') as HTMLInputElement;
    
    if (tagDisplay && tagInput) {
      const tags = Array.from(tagDisplay.querySelectorAll('.tag')).map(
        tag => tag.querySelector('span')?.textContent || ''
      ).filter(Boolean);
      
      // Update the hidden input value with comma-separated tags
      tagInput.dataset.tags = tags.join(',');
    }
  };

  // Function to add a custom field to the list
  const addCustomField = (name: string, value: string) => {
    // Add the new custom field to the formData state
    setFormData(prev => {
      // Make sure demographicsMetrics is properly initialized if it doesn't exist
      const demographicsMetrics = prev.demographicsMetrics || {
        ageGroup: false,
        gender: false,
        location: false,
        education: false,
        income: false,
        ethnicity: false,
        employment: false,
        household: false,
        language: false,
        device: false,
        industry: false,
        marital: false,
      };
      
      return {
        ...prev,
        demographicsMetrics, // Ensure demographicsMetrics is included
        customFields: [...prev.customFields, { name, value }]
      };
    });
  };

  // Function to remove a custom field
  const removeCustomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  // Function to format text in the textarea using React state
  const formatText = (fieldName: string, format: 'bold' | 'italic' | 'underline') => {
    // Get the textarea element to access selection
    const textArea = document.getElementById(fieldName) as HTMLTextAreaElement;
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentValue = formData[fieldName as keyof typeof formData] as string || '';
    const selectedText = currentValue.substring(start, end) || '';

    let formattedText = '';
    let cursorPosition = 0;

    // Apply the appropriate formatting
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        cursorPosition = start + 2;
        break;
    }

    // Create the new value with formatting
    const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
    
    // Update the state
    setFormData(prev => ({
      ...prev,
      [fieldName]: newValue
    }));
    
    // After state update, we need to restore cursor position
    // This needs to happen after React has updated the DOM
    setTimeout(() => {
      if (textArea) {
        textArea.focus();
        if (start === end) {
          // If no text was selected, place cursor between formatting markers
          textArea.selectionStart = cursorPosition;
          textArea.selectionEnd = cursorPosition;
        } else {
          // If text was selected, select the newly formatted text
          textArea.selectionStart = start;
          textArea.selectionEnd = start + formattedText.length;
        }
      }
    }, 0);
  };

  // Function to apply text formatting (bold, italic, underline)
  const applyFormatting = (elementId: string, format: 'bold' | 'italic' | 'underline') => {
    formatText(elementId, format);
  };

  // Define question types array
  const questionTypes = ['radio', 'checkbox', 'dropdown', 'text', 'textarea', 'rating', 'likert', 'ranking', 'date', 'file'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedQuestionIds);
  const [filters, setFilters] = useState({ type: 'all', tags: [] as string[] });
  const [activeTab, setActiveTab] = useState(0);
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null);
  const [questionSaved, setQuestionSaved] = useState(false);
  
  // Refs for tag select
  const tagSelectRef = useRef<HTMLSelectElement>(null);
  const tomSelectTagInstance = useRef<any>(null);

  // State for available tags/layers
  const [availableTags, setAvailableTags] = useState<{_id: string, name: string, active: boolean}[]>([]);

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

    
    // Fetch all available tags from the Layers collection without filtering
    const tags = Layers.find({}).fetch();

    
    // Create a map of tag IDs to names for quick lookup
    tags.forEach((tag: Layer) => {
      if (tag && tag._id) {
        tagNameMap.set(tag._id, tag.name || '');
        // Initialize the tag-to-questions map for each tag
        tagToQuestionsMap.set(tag._id, []);
      }
    });
    
    // Debug: Log all tag names and IDs

    tags.forEach((tag: Layer) => {
      if (tag && tag.name && tag._id) {
        // Debug code can go here if needed
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
        
        // Store tags for this question - check both categoryTags and labels arrays
        const tagsList = [];
        
        // Check for categoryTags
        if (versionData.categoryTags && Array.isArray(versionData.categoryTags)) {
          tagsList.push(...versionData.categoryTags);
        }
        
        // Check for labels
        if (versionData.labels && Array.isArray(versionData.labels)) {
          tagsList.push(...versionData.labels);
        } else if (question.labels && Array.isArray(question.labels)) {
          // Some questions might have labels at the root level
          tagsList.push(...question.labels);
        }
        
        // Log for debugging
        if (tagsList.length > 0) {
          console.log(`Question ${question._id} has tags:`, tagsList);
        }
        
        // Store the combined tags list
        if (tagsList.length > 0) {
          questionMap.set(question._id, tagsList);
          
          // Add this question to each of its tags in the tagToQuestionsMap
          tagsList.forEach((tagId: string) => {
            const questionsWithTag = tagToQuestionsMap.get(tagId) || [];
            questionsWithTag.push(question._id);
            tagToQuestionsMap.set(tagId, questionsWithTag);
            
            // Special case for question ixSJScySQEAHEwdDG and WPS tag
            if (question._id === 'ixSJScySQEAHEwdDG') {


              
              // If this is the WPS tag or has a name containing 'WPS', add it to the WPS tag's questions
              const tagName = tagNameMap.get(tagId) || '';
              const wpsTag = tags.find((t: Layer) => t && t.name === 'WPS');
              
              if (wpsTag && wpsTag._id && (tagName.includes('WPS') || tagId === wpsTag._id)) {

                const wpsQuestions = tagToQuestionsMap.get(wpsTag._id) || [];
                if (!wpsQuestions.includes(question._id)) {
                  wpsQuestions.push(question._id);
                  tagToQuestionsMap.set(wpsTag._id, wpsQuestions);
                }
              }
            }
          });
          
          // Debug output for questions with tags
          if (tagsList.length > 0) {
            const tagNames = tagsList.map((tagId: string) => tagNameMap.get(tagId) || tagId).join(', ');

          }
        } else {
          questionMap.set(question._id, []);
        }
      }
    });
    
    // Log specific questions we're looking for
    const wpsTag = tags.find((tag: Layer) => tag && tag.name === 'WPS');
    if (wpsTag && wpsTag._id) {

      const questionsWithWpsTag = tagToQuestionsMap.get(wpsTag._id) || [];

      
      // Check specific question ID ixSJScySQEAHEwdDG
      const specificQuestion = questionDocs.find((q) => q && q._id === 'ixSJScySQEAHEwdDG');
      if (specificQuestion) {

        const currentVersion = specificQuestion.currentVersion;
        const versionData = specificQuestion.versions.find((v) => v && v.version === currentVersion) || 
                           (specificQuestion.versions.length > 0 ? specificQuestion.versions[specificQuestion.versions.length - 1] : null);
        
        if (versionData) {


          
          // Check if this question has the WPS tag
          const hasWpsTag = (versionData.categoryTags || []).includes(wpsTag._id);

          
          // Check what tag names this question has
          const tagNames = (versionData.categoryTags || []).map((tagId: string) => {
            const name = tagNameMap.get(tagId);
            return `${name || 'Unknown'} (${tagId})`;
          });

        } else {

        }
      } else {

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
  
  // Handle newly created question selection when tab changes
  useEffect(() => {
    // If we have a new question ID and we're on the first tab (Select Existing Questions)
    if (newQuestionId && activeTab === 0) {
      // Make sure the new question is selected
      if (!selectedIds.includes(newQuestionId)) {
        setSelectedIds(prev => [...prev, newQuestionId]);
      }
      // Clear the new question ID after handling it
      setNewQuestionId(null);
    }
  }, [activeTab, newQuestionId, selectedIds]);
  
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
      const wpsTag = allTags.find((tag: Layer) => tag && tag.name === 'WPS');
      if (wpsTag && wpsTag._id && filters.tags.includes(wpsTag._id)) {

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

    
    // Check if this question matches any of the selected tags
    let hasMatchingTag = false;
    
    // For each selected tag, check if this question is in its list
    if (tagToQuestionsMap) {
      for (const tagId of filters.tags) {
        const questionsWithTag = tagToQuestionsMap.get(tagId) || [];
        if (questionsWithTag.includes(dbQuestionId)) {
          hasMatchingTag = true;

          break;
        }
      }
    }
    
    // Alternative approach: check if the question's tags include any of the selected tags
    const questionTags = questionsWithTags.get(dbQuestionId) || [];
    if (questionTags.length > 0) {
      const questionTagNames = questionTags.map((tagId: string) => tagNameMap.get(tagId) || tagId).join(', ');

      
      // Check for intersection between question tags and selected tags
      const tagMatch = questionTags.some((tagId: string) => filters.tags.includes(tagId));
      if (tagMatch) {
        hasMatchingTag = true;

      }
    }
    

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

      return;
    }
    


    
    try {
      // Configure Tom Select
      const config: any = {
        plugins: ['remove_button'],
        placeholder: 'Filter by tags...',
        create: false,
        maxItems: null, // Allow multiple selections
        sortField: { field: 'text', direction: 'asc' },
        onChange: function(values: string[]) {

          
          // Log the selected tag names for better debugging
          if (values && values.length > 0) {
            const selectedTagNames = values.map((id: string) => tagNameMap.get(id) || id).join(', ');

            
            // Log which questions have these tags

            
            // For each selected tag, show which questions have it
            values.forEach((tagId: string) => {
              const tagName = tagNameMap.get(tagId) || tagId;
              const questionsWithTag = tagToQuestionsMap?.get(tagId) || [];

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

        
        // Sort tags alphabetically by name for better UX
        const sortedTags = [...allTags].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        
        sortedTags.forEach((tag: Layer) => {
          // Handle optional _id property in Layer interface
          const tagId = tag._id || tag.id || '';
          if (tag && tagId) {
            ts.addOption({
              value: tagId,
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
    // Always update the parent component with the current selection
    onSelectQuestions(selectedIds, sectionId);
    
    // Only close if we're not in the middle of creating a question
    if (!questionSaved) {
      handleClose();
    } else {
      // If a question was just created, reset the state but keep the panel open
      setQuestionSaved(false);
    }
  };
  
  // Handle smooth closing of the panel
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match this with the animation duration in CSS
  };
  
  // Handle when a new question is created
  const handleQuestionCreated = (questionId: string) => {
    // Add the new question to the selected IDs
    setNewQuestionId(questionId);
    setSelectedIds(prev => [...prev, questionId]);
    setQuestionSaved(true);
    
    // Refresh the questions list to include the new question
    if (onQuestionsRefresh) {
      onQuestionsRefresh();
    }
  };

  return (
    <div
      className={isOpen ? `right-panel-overlay${isClosing ? ' closing' : ''}` : ""}
      style={{
        display: isOpen ? 'flex' : 'none',
      }}
      onClick={(e) => {
        // Only close if the backdrop itself is clicked, not its children
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          // Only close the panel if we're not in the middle of creating a question
          if (!questionSaved) {
        }
      }}
    >
      <div className="right-panel-container" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <style>{`
          .form-label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 15px;
            color:#334155;
          }
          .btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .btn-primary {
            background-color: #4a2d4e;
            color: white;
            border: none;
          }
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
          }
          
          .toggle-switch input {
          }
          
          input:checked + .slider {
            background-color: #4a2d4e;
          }
          
          input:focus + .slider {
            box-shadow: 0 0 1px #4a2d4e;
          }
          
          input:checked + .slider:before {
            transform: translateX(26px);
          }
          
          .slider.round {
            border-radius: 34px;
          }
          
          .slider.round:before {
            border-radius: 50%;
          }
          .format-btn {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .format-btn:hover {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
          }
          .tag-builder {
            position: relative;
            z-index: 1000;
          }
          .image-dropzone {
            border: 2px dashed #e2e8f0;
            border-radius: 10px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f8fafc;
            cursor: pointer;
            min-height: 180px;
            transition: all 0.2s ease;
          }
          .image-dropzone:hover {
            border-color: #4a2d4e;
            background-color: #f1f5f9;
          }
          .react-tabs__tab--selected {
            color: #4a2d4e !important;
            border-bottom: 3px solid #4a2d4e !important;
            font-weight: 600 !important;
          }
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(85, 42, 71, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(85, 42, 71, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(85, 42, 71, 0);
            }
          }
          `
        }</style>
        
        
        <div className="right-panel-content" style={{ 
          overflowX: 'hidden', 
          overflowY: 'auto', 
          padding: 0, 
          margin: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '0 0 10px 10px'
        }}>
          <Tabs 
            selectedIndex={activeTab} 
            onSelect={index => setActiveTab(index)} 
            className="question-selector-tabs"
            style={{ overflowX: 'hidden', padding: 0, margin: 0, position: 'relative' }}
          >
            {/* Header */}
            <div className="right-panel-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              width: '96%',
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              overflowX: 'hidden',
              margin: '0 auto',
              boxSizing: 'border-box',
              borderRadius: '8px 8px 0 0'
              }}>
              <TabList style={{
                display: 'flex',
                margin: '0',
                padding: '0',
                listStyle: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                maxWidth: '550px',
                gap: '8px'
              }}>
                <Tab style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 0 ? 'rgba(74, 45, 78, 0.05)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 0 ? '3px solid #4a2d4e' : '3px solid transparent',
                  fontWeight: activeTab === 0 ? 600 : 500,
                  fontSize: '15px',
                  color: activeTab === 0 ? '#4a2d4e' : '#64748b',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  borderRadius: '6px 6px 0 0'
                }}>Select Existing Questions</Tab>
                <Tab 
                  className="create-tab"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 1 ? 'rgba(74, 45, 78, 0.05)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 1 ? '3px solid #4a2d4e' : '3px solid transparent',
                    fontWeight: activeTab === 1 ? 600 : 500,
                    fontSize: '15px',
                    color: activeTab === 1 ? '#4a2d4e' : '#64748b',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                    borderRadius: '6px 6px 0 0'
                  }}
                >
                  <span className="icon-wrapper" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}><FiPlus size={16} /></span> Create New Question
                </Tab>
              </TabList>
              <button
                className="close-button"
                style={{
                  background: 'rgba(100, 116, 139, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s ease',
                  marginLeft: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                aria-label="Close panel"
                onClick={(e) => {
                  // Only close if we're not in the middle of creating a question
                  if (!questionSaved) {
                    handleClose();
                  } else {
                    // If a question was just created, reset the state but keep the panel open
                    setQuestionSaved(false);
                  }
                }}
              >
                <FiX size={20} />
              </button>
            </div>
            {/* Tab Panel 1: Select Existing Questions */}
            <TabPanel>
              {/* Filters and Search in one row */}
              <div className="filter-container" style={{
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                {/* Search Bar */}
                <div className="search-container" style={{
                  flex: '1 1 250px'
                }}>
                  <label className="filter-label">Search</label>
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#552a47';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(85, 42, 71, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      }}
                      aria-label="Search questions"
                    />
                  </div>
                </div>
                
                {/* Type Filter */}
                <div className="filter-group" style={{
                  flex: '1 1 180px'
                }}>
                  <label className="filter-label">Question Type</label>
                  <select 
                    className="filter-select"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
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
                
                {/* Tag Filter with Tom Select */}
                <div className="filter-group" style={{
                  flex: '1 1 180px'
                }}>
                  <label className="filter-label">Tags</label>
                  {loading ? (
                    <div style={{ fontSize: '14px', color: '#64748b', padding: '12px 0' }}>Loading tags...</div>
                  ) : (
                    <select 
                      ref={tagSelectRef} 
                      multiple
                      className="filter-select"
                      aria-label="Filter by tags"
                    />
                  )}
                </div>
              </div>
          
          {/* Check All Option */}
          <div className="check-all-container" style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            width: '96%',
            margin: '0 auto'
          }}>
            {areAllFilteredQuestionsSelected() ? (
              <div 
                className="custom-checkbox checkbox-checked"
                onClick={() => handleToggleAll(false)}
                role="checkbox"
                aria-checked="true"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleAll(false);
                  }
                }}
              >
                <FiCheck size={16} color="white" />
              </div>
            ) : (
              <div 
                className="custom-checkbox checkbox-unchecked"
                onClick={() => handleToggleAll(true)}
                role="checkbox"
                aria-checked="false"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleAll(true);
                  }
                }}
              />
            )}
            <span 
              className="checkbox-label"
              onClick={() => handleToggleAll(!areAllFilteredQuestionsSelected())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleAll(!areAllFilteredQuestionsSelected());
                }
              }}
              tabIndex={0}
              role="button"
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Select All Questions ({filteredQuestions.length})
            </span>
          </div>
          
          {/* Question List */}
          <div className="question-list-container" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0',
            backgroundColor: '#ffffff',
            width: '96%',
            margin: '0 auto'
          }}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <div
                  key={question.id}
                  onClick={() => handleToggleQuestion(question.id)}
                  className={`question-item ${selectedIds.includes(question.id) ? 'selected' : ''}`}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: selectedIds.includes(question.id) ? 'rgba(74, 45, 78, 0.05)' : 'transparent',
                    ':hover': {
                      backgroundColor: 'rgba(74, 45, 78, 0.02)'
                    }
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
                      {questionsWithTags.get(question.id || '')?.map((tagId: string) => {
                        const tagObj = allTags.find((tag: Layer) => tag && tag._id === tagId);
                        const tagName = tagObj ? tagObj.name : 'Unknown';
                        
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
                      })}
                    </div>
                    </div>
                  </div>
                // </div>
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
          </TabPanel>
            
          {/* Tab Panel 2: Create New Question */}
          <TabPanel>
              <div className="question-builder-container">
                {/* Enhanced Question Builder Form */}
                <div className="embedded-question-builder" style={{ padding: '20px' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Use React state values instead of DOM elements
                    const questionText = formData.questionText;
                    const questionDescription = formData.questionDescription;
                    const questionType = formData.questionType;
                    const isRequired = formData.isRequired;
                    
                    // Get options from state
                    let options: string[] = [];
                    if (['radio', 'checkbox', 'dropdown', 'likert'].includes(questionType)) {
                      options = formData.answerOptions.map(option => option.text).filter(Boolean);
                    }
                    
                    // Get tags from state
                    const tags = formData.questionTags;
                    
                    // Get image from state
                    const imageFile = formData.questionImage;
                    let imageUrl = '';
                    
                    // Create question version object
                    const questionVersion = {
                      questionText,
                      description: questionDescription,
                      responseType: questionType,
                      options,
                      required: isRequired,
                      categoryTags: tags,
                      surveyThemes: [],
                      adminNotes: '',
                      language: 'en',
                      published: false,
                      updatedBy: Meteor.userId() || '',
                      imageUrl: imageUrl // Will be updated if image is uploaded
                    };
                    
                    // Show saving indicator
                    const saveButton = document.getElementById('saveQuestionButton');
                    if (saveButton) {
                      saveButton.textContent = 'Saving...';
                      saveButton.setAttribute('disabled', 'true');
                    }
                    
                    // Function to save the question
                    const saveQuestion = () => {
                      Meteor.call('questions.insert', questionVersion, (error: Error | null, result: string) => {
                      // Hide saving indicator
                      if (saveButton) {
                        saveButton.textContent = 'Save Question';
                        saveButton.removeAttribute('disabled');
                      }
                      
                      if (error) {
                        alert(`Error creating question: ${error.message}`);
                      } else {
                        // Call the handleQuestionCreated function with the new question ID
                        handleQuestionCreated(result);
                        
                        // Reset the form state
                        setFormData({
                          questionText: '',
                          questionDescription: '',
                          questionType: 'likert',
                          questionImage: null,
                          questionImagePreview: '',
                          questionTags: [],
                          isRequired: false,
                          branchingEnabled: false,
                          answerOptions: [],
                          customFields: []
                        });
                      }
                    });
                    };
                    
                    // If there's an image file, upload it first, then save the question
                    if (imageFile) {
                      // Create a FileReader to read the image file
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        // Use the base64 string as the image URL (for demo purposes)
                        // In a real app, you would upload this to a server or storage service
                        if (e.target?.result) {
                          questionVersion.imageUrl = e.target.result as string;
                        }
                        saveQuestion();
                      };
                      reader.readAsDataURL(imageFile);
                      // No image, just save the question
                      saveQuestion();
                    }
                  }}>
                    {/* Question Builder Tabs */ }
                    <Tabs 
                      className="question-builder-tabs" 
                      style={{ marginBottom: '20px' }}
                      selectedIndex={tabIndex}
                      onSelect={(index) => {
                        // Prevent navigation to other tabs if Question Text is empty
                        if (index > 0 && (!formData.questionText || formData.questionText.trim() === '')) {
                          // Show validation error for question text
                          setValidationErrors(prev => ({
                            ...prev,
                            questionText: 'Question Text is required'
                          }));
                          // Stay on the first tab
                          return;
                        }
                        // Clear validation errors when changing tabs
                        setValidationErrors({});
                        // Use safe tab switching
                        safeSetTabIndex(index);
                      }}
                    >
                      <TabList style={{ 
                        display: 'flex', 
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        borderBottom: '1px solid #e2e8f0', 
                        marginBottom: '20px',
                        gap: '2px',
                        paddingBottom: '2px',
                        whiteSpace: 'nowrap'
                      }}>
                        <Tab style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '3px solid transparent',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}>Basic Information</Tab>
                        <Tab style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '3px solid transparent',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}>Answer Options</Tab>
                        <Tab style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '3px solid transparent',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}>Custom Fields</Tab>
                        <Tab style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '3px solid transparent',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}>Branching Logic</Tab>
                        <Tab style={{ 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '3px solid transparent',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}>Settings</Tab>

                      </TabList>
                      
                      {/* Tab Panel 1: Basic Information */}
                      <TabPanel>
                        {/* Question Text */}
                        <div className="form-group">
                          <label htmlFor="questionText" className="form-label">Question Text <span style={{ color: '#e11d48' }}>*</span></label>
                          <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                            <button 
                              type="button" 
                              className="format-btn"
                              onClick={() => applyFormatting('questionText', 'bold')}
                              title="Bold"
                            >
                              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>B</span>
                            </button>
                            <button 
                              type="button" 
                              className="format-btn"
                              onClick={() => applyFormatting('questionText', 'italic')}
                              title="Italic"
                            >
                              <span style={{ fontSize: '15px', fontStyle: 'italic' }}>I</span>
                            </button>
                            <button 
                              type="button" 
                              className="format-btn"
                              onClick={() => applyFormatting('questionText', 'underline')}
                              title="Underline"
                            >
                              <span style={{ fontSize: '15px', textDecoration: 'underline' }}>U</span>
                            </button>
                          </div>
                          <textarea
                            id="questionText"
                            name="questionText"
                            value={formData.questionText}
                            onChange={handleFormChange}
                            className="form-control"
                            placeholder="Enter your question here"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '6px',
                              border: validationErrors.questionText ? '1px solid #e11d48' : '1px solid #cbd5e1',
                              minHeight: '100px',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              fontSize: '15px'
                            }}
                          />
                          {validationErrors.questionText && (
                            <div style={{
                              color: '#e11d48',
                              fontSize: '14px',
                              marginTop: '4px',
                              fontWeight: 500
                            }}>
                              {validationErrors.questionText}
                            </div>
                          )}
                        </div>
                          
                          {/* Description */}
                          <div className="form-group">
                            <label htmlFor="questionDescription" className="form-label">Description</label>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                              <button 
                                type="button" 
                                className="format-btn"
                                onClick={() => applyFormatting('questionDescription', 'bold')}
                                title="Bold"
                              >
                                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>B</span>
                              </button>
                              <button 
                                type="button" 
                                className="format-btn"
                                onClick={() => applyFormatting('questionDescription', 'italic')}
                                title="Italic"
                              >
                                <span style={{ fontSize: '15px', fontStyle: 'italic' }}>I</span>
                              </button>
                              <button 
                                type="button" 
                                className="format-btn"
                                onClick={() => applyFormatting('questionDescription', 'underline')}
                                title="Underline"
                              >
                                <span style={{ fontSize: '15px', textDecoration: 'underline' }}>U</span>
                              </button>
                            </div>
                            <textarea
                              id="questionDescription"
                              name="questionDescription"
                              className="form-control"
                              placeholder="Enter a description or additional information about this question"
                              value={formData.questionDescription}
                              onChange={handleFormChange}
                              style={{
                                minHeight: '100px',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: '1.5'
                              }}
                            ></textarea>
                          </div>
                          
                          {/* Question Image */}
                          <div className="form-group">
                            <label htmlFor="questionImageLabel" className="form-label">Question Image</label>
                            <div 
                              id="imageDropzone"
                              className="image-dropzone"
                              onClick={() => {
                                // Trigger the file input when the dropzone is clicked
                                const fileInput = document.getElementById('questionImage');
                                if (fileInput) fileInput.click();
                              }}
                              onDragOver={(e: React.DragEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const dropzone = document.getElementById('imageDropzone');
                                if (dropzone) dropzone.classList.add('drag-over');
                              }}
                              onDragLeave={(e: React.DragEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const dropzone = document.getElementById('imageDropzone');
                                if (dropzone) dropzone.classList.remove('drag-over');
                              }}
                              onDrop={(e: React.DragEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                const dropzone = document.getElementById('imageDropzone');
                                if (dropzone) dropzone.classList.remove('drag-over');
                                
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  const file = e.dataTransfer.files[0];
                                  if (file.type.startsWith('image/')) {
                                    const fileInput = document.getElementById('questionImage') as HTMLInputElement;
                                    if (fileInput) {
                                      // Create a new FileList containing the dropped file
                                      const dataTransfer = new DataTransfer();
                                      dataTransfer.items.add(file);
                                      fileInput.files = dataTransfer.files;
                                      
                                      // Update state with the file and preview URL
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          questionImage: file,
                                          questionImagePreview: e.target?.result as string
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }
                                }
                              }}
                            >
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                {formData.questionImagePreview ? (
                                  <img 
                                    src={formData.questionImagePreview} 
                                    alt="Question image preview" 
                                    style={{ 
                                      maxWidth: '100%', 
                                      maxHeight: '200px',
                                      borderRadius: '4px'
                                    }} 
                                  />
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <FiUpload style={{ fontSize: '28px', color: '#64748b', marginBottom: '12px' }} />
                                    <div style={{ fontSize: '16px', color: '#475569', fontWeight: 500 }}>Click to upload an image</div>
                                    <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>or drag and drop</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '5px' }}>Supports: JPG, PNG, GIF</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <input 
                              type="file" 
                              id="questionImage" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  const file = files[0];
                                  // Update state with the file and preview URL
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      questionImage: file,
                                      questionImagePreview: e.target?.result as string
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        {/* </div> */}
                      {/* </div> */}
                      
                      {/* Tag Builder */}
                      <div className="form-group">
                        <label htmlFor="questionTags" style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#475569'
                        }}>Question Tags</label>
                        <div style={{ marginBottom: '5px', fontSize: '13px', color: '#64748b' }}>
                          Select tags to associate with this question. Tags help with filtering and organizing questions.
                        </div>
                        <div className="tag-builder" style={{ 
                          marginBottom: '20px',
                          position: 'relative'
                        }}>
                          <TagBuilder 
                            selectedTagIds={formData.questionTags || []} 
                            onTagChange={(tags: string[]) => {
                              setFormData(prev => ({
                                ...prev,
                                questionTags: tags
                              }));
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Question Type */}
                      <div className="form-group">
                        <label htmlFor="questionType" style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#475569'
                        }}>Question Type <span style={{ color: 'red' }}>*</span></label>
                        <select
                          id="questionType"
                          name="questionType"
                          required
                          value={formData.questionType}
                          onChange={(e) => {
                            // Update the question type in state
                            setFormData(prev => ({
                              ...prev,
                              questionType: e.target.value
                            }));
                            
                            // If it's a Likert scale, add default options
                            if (e.target.value === 'likert') {
                              const defaultOptions = [
                                'Strongly Disagree',
                                'Disagree',
                                'Neither Agree nor Disagree',
                                'Agree',
                                'Strongly Agree'
                              ];
                              
                              // Create answer options in state
                              const newOptions = defaultOptions.map((text, index) => ({
                                text,
                                value: `option_${index + 1}`
                              }));
                              
                              setFormData(prev => ({
                                ...prev,
                                answerOptions: newOptions
                              }));
                            }
                          }}
                          className="form-control"
                          style={{
                            backgroundColor: 'white',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px top 50%',
                            backgroundSize: '12px auto',
                            paddingRight: '40px'
                          }}
                        >
                          <option value="radio">Single Choice (Radio)</option>
                                <option value="checkbox">Multiple Choice (Checkbox)</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="text">Short Text</option>
                                <option value="textarea">Long Text</option>
                                <option value="rating">Rating Scale</option>
                                <option value="likert">Likert Scale</option>
                                <option value="ranking">Ranking</option>
                                <option value="date">Date</option>
                                <option value="file">File Upload</option>
                        </select>
                      </div>
                      
                      {/* Required Toggle */}
                      <div className="form-group">
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div>
                            <label htmlFor="isRequired" className="form-label" style={{ margin: 0 }}>Required Question</label>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Toggle on if this question must be answered</div>
                          </div>
                          <div className="toggle-switch">
                            <input 
                              type="checkbox" 
                              id="isRequired" 
                              checked={formData.isRequired}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  isRequired: e.target.checked
                                }));
                              }}
                            />
                            <span 
                              className="slider round"
                              style={{
                                backgroundColor: formData.isRequired ? '#4a2d4e' : '#ccc'
                              }}
                            ></span>
                          </div>
                        </div>
                      </div>
                      </TabPanel>
                      
                      {/* Tab Panel 2: Answer Options */}
                      <TabPanel>
                        {/* Options Section (for multiple choice, checkbox, dropdown, likert) */}
                        <div className="form-group" style={{ marginTop: '20px' }}>
                          <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#475569'
                          }}>Answer Options <span style={{ color: 'red' }}>*</span></label>
                          
                          {/* Display different option inputs based on question type */}
                          {['multiple_choice', 'checkbox', 'dropdown', 'likert', 'rating'].includes(formData.questionType) ? (
                            <div style={{ marginBottom: '15px' }}>
                              {/* Map through answer options from state */}
                              {formData.answerOptions.map((option, index) => (
                                <div key={index} className="option-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                  <input 
                                    type="text" 
                                    value={option.text}
                                    placeholder="Enter option"
                                    onChange={(e) => {
                                      // Update this specific option
                                      const updatedOptions = [...formData.answerOptions];
                                      updatedOptions[index].text = e.target.value;
                                      setFormData(prev => ({
                                        ...prev,
                                        answerOptions: updatedOptions
                                      }));
                                    }}
                                    style={{
                                      flex: '1',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      border: '1px solid #ddd'
                                    }}
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      // Remove this option
                                      const updatedOptions = formData.answerOptions.filter((_, i) => i !== index);
                                      setFormData(prev => ({
                                        ...prev,
                                        answerOptions: updatedOptions
                                      }));
                                    }}
                                    style={{
                                      marginLeft: '10px',
                                      padding: '6px 12px',
                                      backgroundColor: '#f3f4f6',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              
                              {/* If no options exist yet, show at least two empty ones */}
                              {formData.answerOptions.length === 0 && (
                                <>
                                  <div className="option-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <input 
                                      type="text" 
                                      placeholder="Enter option"
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          answerOptions: [{ text: e.target.value, value: 'option_1' }]
                                        }));
                                      }}
                                      style={{
                                        flex: '1',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                      }}
                                    />
                                  </div>
                                  <div className="option-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <input 
                                      type="text" 
                                      placeholder="Enter option"
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          answerOptions: [...(prev.answerOptions || []), { text: e.target.value, value: 'option_2' }]
                                        }));
                                      }}
                                      style={{
                                        flex: '1',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                              
                              {/* Add option button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newOption = {
                                    text: '',
                                    value: `option_${formData.answerOptions.length + 1}`
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    answerOptions: [...prev.answerOptions, newOption]
                                  }));
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '8px 12px',
                                  backgroundColor: '#f8fafc',
                                  border: '1px dashed #cbd5e1',
                                  borderRadius: '4px',
                                  color: '#64748b',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  width: '100%',
                                  justifyContent: 'center',
                                  marginTop: '10px'
                                }}
                              >
                                <span style={{ fontSize: '18px' }}>+</span> Add Option
                              </button>
                            </div>
                          ) : (
                            <div style={{ 
                              backgroundColor: '#f8f9fa', 
                              padding: '15px', 
                              borderRadius: '8px', 
                              textAlign: 'center',
                              color: '#64748b',
                              border: '1px solid #e2e8f0'
                            }}>
                              <p style={{ fontSize: '14px', margin: 0 }}>
                                {formData.questionType === 'text' && 'Text input field will be shown to respondents.'}
                                {formData.questionType === 'textarea' && 'Multi-line text area will be shown to respondents.'}
                                {formData.questionType === 'number' && 'Numeric input field will be shown to respondents.'}
                                {formData.questionType === 'date' && 'Date picker will be shown to respondents.'}
                                {formData.questionType === 'time' && 'Time picker will be shown to respondents.'}
                                {formData.questionType === 'email' && 'Email input field will be shown to respondents.'}
                                {formData.questionType === 'file' && 'File upload field will be shown to respondents.'}
                              </p>
                            </div>
                          )}
                            
                          
                        </div>
                      </TabPanel>
                      
                      {/* Tab Panel 4: Custom Fields */}
                      <TabPanel>
                        <div className="form-group">
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#4a2d4e',
                            marginBottom: '10px'
                          }}>Question Custom Fields</h3>
                          
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            marginBottom: '20px'
                          }}>Add custom fields to store additional information about this question.</p>
                          
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            minHeight: '100px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {formData.customFields.length === 0 ? (
                              <div style={{
                                color: '#94a3b8',
                                fontStyle: 'italic',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100px'
                              }}>
                                No custom fields added yet.
                              </div>
                            ) : (
                              <div style={{ width: '100%' }}>
                                {formData.customFields.map((field, index) => (
                                  <div key={index} style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    position: 'relative'
                                  }}>
                                    <div style={{
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      marginBottom: '5px'
                                    }}>
                                      {field.name}
                                    </div>
                                    <div style={{
                                      fontSize: '14px',
                                      color: '#64748b'
                                    }}>
                                      {field.value}
                                    </div>
                                    <button
                                      onClick={() => removeCustomField(index)}
                                      style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '10px',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '16px',
                                        color: '#ef4444',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Custom Field Form */}
                          <div style={{ marginBottom: '20px' }}>
                            {/* New Custom Field Form */}
                            <div style={{ 
                              backgroundColor: '#f8fafc', 
                              padding: '15px', 
                              borderRadius: '8px', 
                              marginBottom: '20px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ position: 'relative', marginBottom: '15px' }}>
                                <input
                                  type="text"
                                  placeholder="Field Name"
                                  value={newFieldName || ''}
                                  onChange={(e) => setNewFieldName(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '15px',
                                    marginBottom: '10px'
                                  }}
                                />
                              </div>
                              
                              <textarea
                                placeholder="Field Value"
                                value={newFieldValue || ''}
                                onChange={(e) => setNewFieldValue(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd',
                                  fontSize: '15px',
                                  minHeight: '100px',
                                  resize: 'vertical',
                                  marginBottom: '10px'
                                }}
                              ></textarea>
                              
                              <button
                                style={{
                                  backgroundColor: '#4a2d4e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                onClick={() => {
                                  if (newFieldName && newFieldValue) {
                                    // Add the custom field to the list
                                    addCustomField(newFieldName, newFieldValue);
                                    
                                    // Clear the form
                                    setNewFieldName('');
                                    setNewFieldValue('');
                                  }
                                }}
                              >Add Field</button>
                            </div>
                          </div>
                        </div>
                            {/* Navigation buttons moved to footer */}
                      </TabPanel>
                      
                      {/* Tab Panel 5: Branching Logic */}
                      <TabPanel>
                        <div className="form-group">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <input 
                              type="checkbox" 
                              id="branchingToggle"
                              checked={formData.branchingEnabled}
                              style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                cursor: 'pointer'
                              }}
                              onChange={(e) => {
                                // Update state with the new checkbox value
                                setFormData(prev => ({
                                  ...prev,
                                  branchingEnabled: e.target.checked
                                }));
                              }}
                            />
                            <span style={{ fontWeight: 600, fontSize: '15px', color: '#4a2d4e' }}>Enable Branching Logic</span>
                          </div>
                          
                          <div style={{ 
                            backgroundColor: '#e6f2ff', 
                            padding: '15px', 
                            borderRadius: '8px', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <span style={{ 
                              color: '#0066cc', 
                              fontSize: '16px', 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#cce5ff',
                              fontWeight: 'bold'
                            }}>i</span>
                            <p style={{ margin: 0, color: '#0066cc', fontSize: '14px' }}>Branching logic allows you to direct respondents to different questions based on their answers.</p>
                          </div>
                          
                          {formData.branchingEnabled ? (
                            <div style={{ 
                              marginBottom: '20px'
                            }}>
                              {/* Branching options will be shown here when enabled */}
                              <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#4a2d4e' }}>Branching Rules</h4>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 15px 0' }}>Define conditions that determine which question to show next.</p>
                                {/* Placeholder for branching rule builder interface */}
                                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                                  <p style={{ margin: '0', color: '#64748b' }}>Branching rule builder will be implemented here</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ 
                              backgroundColor: '#f8f9fa', 
                              padding: '30px', 
                              borderRadius: '8px', 
                              textAlign: 'center',
                              color: '#64748b',
                              border: '1px solid #e2e8f0'
                              }}>
                              <p style={{ fontSize: '15px', margin: '0 0 5px 0' }}>Branching logic is currently disabled. Enable it to create conditional paths</p>
                              <p style={{ fontSize: '15px', margin: 0 }}>based on answers to this question.</p>
                            </div>
                          )}
                        </div>
                        
                      
                      </TabPanel>
                      
                      {/* Tab Panel 6: Settings */}
                      <TabPanel>
                        <div className="form-group">
                          {/* Feedback Collection */}
                          <div style={{ marginBottom: '20px' }}>
                            <label style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#475569'
                            }}>Feedback Collection</label>
                            <select
                              id="feedbackCollection"
                              value={formData.feedbackCollection}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                feedbackCollection: e.target.value
                              }))}
                              className="tom-select"
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '15px',
                                marginBottom: '20px'
                              }}
                            >
                              <option value="none">No Feedback</option>
                              <option value="optional">Optional Feedback</option>
                              <option value="required">Required Feedback</option>
                              <option value="rating">Rating Feedback</option>
                              <option value="ratingWithComment">Rating with Comment</option>
                            </select>
                          </div>
                          
                          {/* Toggle Switches */}
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: '15px',
                              padding: '10px 0'
                            }}>
                              <label className="switch" style={{ 
                                position: 'relative', 
                                display: 'inline-block', 
                                width: '36px', 
                                height: '20px', 
                                marginRight: '15px' 
                              }}>
                                <input 
                                  type="checkbox" 
                                  id="reusableToggle"
                                  checked={formData.isReusable}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isReusable: e.target.checked
                                  }))}
                                  style={{ 
                                    opacity: 0, 
                                    width: 0, 
                                    height: 0 
                                  }}
                                />
                                <span className="slider" style={{
                                  position: 'absolute',
                                  cursor: 'pointer',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: formData.isReusable ? '#4a2d4e' : '#ccc',
                                  borderRadius: '34px',
                                  transition: '.4s'
                                }}></span>
                              </label>
                              <span style={{ fontSize: '14px' }}>Reusable Question (can be used in multiple surveys)</span>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: '15px',
                              padding: '10px 0',
                              borderTop: '1px solid #eee',
                              borderBottom: '1px solid #eee'
                            }}>
                              <label className="switch" style={{ 
                                position: 'relative', 
                                display: 'inline-block', 
                                width: '36px', 
                                height: '20px', 
                                marginRight: '15px' 
                              }}>
                                <input 
                                  type="checkbox" 
                                  id="activeToggle"
                                  checked={formData.isActive}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isActive: e.target.checked
                                  }))}
                                  style={{ 
                                    opacity: 0, 
                                    width: 0, 
                                    height: 0 
                                  }}
                                />
                                <span 
                                  className="slider round" 
                                  style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: formData.isActive ? '#4a2d4e' : '#ccc',
                                    borderRadius: '34px',
                                    transition: '.4s'
                                  }}
                                ></span>
                              </label>
                              <span style={{ fontSize: '14px' }}>Active Question</span>
                            </div>
                          </div>
                          
                          {/* Priority */}
                          <div style={{ marginBottom: '20px' }}>
                            <label style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#475569'
                            }}>Priority</label>
                            <select
                              id="priority"
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '15px'
                              }}
                            >
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                          
                          {/* Question Metadata - Hidden as requested */}
                          <div style={{ display: 'none', marginTop: '30px' }}>
                            <h4 style={{ 
                              fontSize: '15px', 
                              fontWeight: 600, 
                              marginTop: 0,
                              marginBottom: '15px',
                              color: '#4a2d4e'
                            }}>Question Metadata</h4>
                            
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#475569'
                              }}>Question ID</label>
                              <input
                                type="text"
                                id="questionId"
                                placeholder="Auto-generated"
                                disabled
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd',
                                  fontSize: '15px',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#475569'
                              }}>Created By</label>
                              <input
                                type="text"
                                id="createdBy"
                                placeholder="Current User"
                                disabled
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd',
                                  fontSize: '15px',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#475569'
                              }}>Created Date</label>
                              <input
                                type="text"
                                id="createdDate"
                                placeholder="Auto-generated"
                                disabled
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd',
                                  fontSize: '15px',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </TabPanel>
                    </Tabs>
                  </form>
                </div>
              </div>
              {/* Footer Navigation */}
              <div className="footer-navigation">
                <button 
                  type="button"
                  className="prev-button"
                  onClick={goToPrevTab}
                  disabled={tabIndex === 0}
                >
                  ← Previous
                </button>
                {tabIndex === 5 ? (
                  <button
                  type="button"
                  id="saveQuestionButton"
                  className="next-button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent any parent handlers from being triggered
                    if (e.nativeEvent) {
                      e.nativeEvent.stopImmediatePropagation();
                    }
                    
                    // Get the save button and show saving state
                    const saveButton = e.currentTarget;
                    saveButton.innerHTML = 'Saving...';
                    saveButton.disabled = true;
                    
                    // Use React state instead of DOM elements
                    const questionText = formData.questionText;
                    const questionDescription = formData.questionDescription;
                    const questionType = formData.questionType;
                    const isRequired = formData.isRequired;
                    
                    // Validate required fields
                    if (!questionText || questionText.trim() === '') {
                      // Reset save button first
                      saveButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Question';
                      saveButton.disabled = false;
                      
                      // Show a more helpful error message
                      alert('Question Text is required. Please go to the first tab to add question text.');
                      
                      // Automatically switch to the first tab where question text is entered
                      safeSetTabIndex(0);
                      return;
                    }
                    
                    // Get tags from React state
                    const tags = formData.questionTags || [];
                    
                    // Get options for multiple choice questions from React state
                    let options: string[] = [];
                    if (['radio', 'checkbox', 'dropdown', 'likert'].includes(questionType)) {
                      options = formData.answerOptions.map(option => option.text);
                    }
                    
                    // Create question object with all required fields
                    const questionData = {
                      questionText: questionText,
                      description: questionDescription,
                      responseType: questionType,
                      category: formData.primaryCategory?.[0] || '',
                      options: ['multiple_choice', 'checkbox', 'dropdown', 'likert', 'rating'].includes(questionType) 
                        ? formData.answerOptions.map(option => ({ 
                            text: option.text, 
                            value: option.value || option.text 
                          })) 
                        : [],
                      required: isRequired,
                      image: formData.questionImagePreview || '',
                      labels: [],
                      feedbackType: formData.feedbackCollection || 'none',
                      categoryTags: tags,
                      categoryId: formData.primaryCategory?.[0] || '',
                      categoryDetails: formData.primaryCategory?.[0] ? formData.primaryCategory[0] : '',
                      surveyThemes: formData.surveyThemes || [],
                      isReusable: formData.isReusable || false,
                      priority: 1,
                      isActive: formData.isActive || true,
                      keywords: [],
                      status: 'draft',
                      branchingLogic: {},
                      customFields: formData.customFields.map(field => ({
                        id: field.id || `field-${Date.now()}`,
                        name: field.name,
                        value: field.value
                      }))
                    };
                    
                    // Call Meteor method to save the question using applyAsync instead of apply
                    // This handles the async method properly
                      (async () => {
                        try {
                          // Prevent default behavior and stop propagation again to ensure modal stays open
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.nativeEvent) {
                            e.nativeEvent.stopImmediatePropagation();
                          }
                          
                          // Use callAsync to properly handle the async method
                          const newId = await Meteor.callAsync('questions.insert', questionData);
                          console.log('Result:', newId);
                          const questionId = newId; // The method returns the ID directly
                          console.log('Question created successfully:', questionId);
                          
                          // If onQuestionsRefresh callback is provided, call it to refresh the questions list
                          if (onQuestionsRefresh) {
                            onQuestionsRefresh();
                          }
                          
                          // Store the updated selection for later use when the modal is explicitly closed
                          // but don't call onSelectQuestions yet as it might close the modal
                          
                          // Only proceed if we have a valid questionId
                          if (questionId) {
                            // Mark that a question was successfully saved
                            setQuestionSaved(true);
                            
                            // Store the new question ID to ensure it's selected after tab switch
                            setNewQuestionId(questionId);
                            
                            // Update the internal selection state only
                            // Don't call onSelectQuestions as it might close the modal
                            setSelectedIds(prev => {
                              if (!prev.includes(questionId)) {
                                return [...prev, questionId];
                              }
                              return prev;
                            });
                            
                            // Then switch to the Select Existing Questions tab
                            setActiveTab(0);
                            console.log('Switched to Select Existing Questions tab---');
                            
                            // Show success message with a styled toast notification
                            const successElement = document.createElement('div');
                            successElement.id = 'questionSuccessMessage';
                            successElement.style.position = 'fixed';
                            successElement.style.top = '20px';
                            successElement.style.left = '50%';
                            successElement.style.transform = 'translateX(-50%)';
                            successElement.style.backgroundColor = '#10b981';
                            successElement.style.color = 'white';
                            successElement.style.padding = '12px 24px';
                            successElement.style.borderRadius = '8px';
                            successElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            successElement.style.zIndex = '9999';
                            successElement.style.display = 'flex';
                            successElement.style.alignItems = 'center';
                            successElement.style.gap = '10px';
                            successElement.style.fontSize = '16px';
                            successElement.style.fontWeight = '500';
                            successElement.style.opacity = '0';
                            successElement.style.transition = 'all 0.3s ease';
                            
                            // Add check icon
                            const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                            
                            successElement.innerHTML = iconSvg + ' Question created successfully!';
                            
                            // Add the success message to the body
                            document.body.appendChild(successElement);
                            
                            // Animate in
                            setTimeout(() => {
                              successElement.style.opacity = '1';
                            }, 10);
                            
                            // Remove the message after 3 seconds
                            setTimeout(() => {
                              successElement.style.opacity = '0';
                              successElement.style.transform = 'translateX(-50%) translateY(-20px)';
                              
                              setTimeout(() => {
                                if (successElement.parentNode) {
                                  successElement.parentNode.removeChild(successElement);
                                }
                              }, 300);
                            }, 3000);
                            
                          
                          } else {
                            console.error('Question created but no ID was returned');
                            // alert('Error: Question created but no ID was returned');
                          }
                          
                          // Reset save button
                          saveButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Question';
                          saveButton.disabled = false;
                          
                          // No need to close the modal - we're switching to the other tab
                          // onClose();
                        } catch (error: unknown) {
                          console.error('Error creating question:', error);
                          
                          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                          
                          // Show error using alert instead of DOM manipulation
                          alert(`Error creating question: ${errorMessage}`);
                          
                          // Reset save button
                          saveButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Question';
                          saveButton.disabled = false;
                        }
                      })(); // Immediately invoke the async function
                    }
                  }

                >
                  <FiCheck size={18} />
                  Create Question
                </button>
                ) : (
                  <button 
                    type="button"
                    className="next-button"
                    onClick={goToNextTab}
                  >
                    Next →
                  </button>
                )}
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
