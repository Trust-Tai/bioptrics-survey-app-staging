import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import Select, { MultiValue, ActionMeta } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { FaPlus, FaTags, FaInfoCircle, FaLayerGroup } from 'react-icons/fa';
import './QuestionClassification.css';
import 'react-tabs/style/react-tabs.css';
import { QuestionCategory } from '/imports/features/question-categories/api/questionCategories';

// Generic interface that can accommodate all tag-like objects
interface Tag {
  _id: string | undefined;
  name: string;
  description?: string;
  color?: string;
  category?: string;
}

interface QuestionClassificationProps {
  selectedCategoryIds: string[];
  selectedThemeIds: string[];
  selectedTagIds: string[];
  keywords: string[];
  selectedCategoryId?: string;
  categoryDetails?: string;
  onCategoryChange: (categoryIds: string[]) => void;
  onThemeChange: (themeIds: string[]) => void;
  onTagChange: (tagIds: string[]) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onSingleCategoryChange?: (categoryId: string) => void;
  onCategoryDetailsChange?: (details: string) => void;
}

const QuestionClassification: React.FC<QuestionClassificationProps> = ({
  selectedCategoryIds,
  selectedThemeIds,
  selectedTagIds,
  keywords,
  selectedCategoryId,
  categoryDetails = '',
  onCategoryChange,
  onThemeChange,
  onTagChange,
  onKeywordsChange,
  onSingleCategoryChange,
  onCategoryDetailsChange,
}) => {
  const [categories, setCategories] = useState<Tag[]>([]);
  const [themes, setThemes] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagCategory, setNewTagCategory] = useState('');

  // Fetch categories, themes, tags, and question categories using useTracker
  useEffect(() => {
    let isMounted = true;
    let subscriptionTimeout: number;
    
    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        // Import collections directly to avoid potential issues with dynamic imports
        const { WPSCategories } = await import('/imports/features/wps-framework/api/wpsCategories');
        const { SurveyThemes } = await import('/imports/features/survey-themes/api/surveyThemes');
        const { QuestionTags } = await import('/imports/features/question-tags/api/questionTags');
        const { QuestionCategories } = await import('/imports/features/question-categories/api/questionCategories');
        const { Surveys } = await import('/imports/features/surveys/api/surveys');
        
        if (!isMounted) return;
        
        // Subscribe to collections with callbacks
        Meteor.subscribe('surveys.all', {
          onReady: () => {
            if (isMounted) {
              // Find the most recently updated survey to get its WPS categories
              const latestSurvey = Surveys.findOne({}, { sort: { updatedAt: -1 } });
              
              if (latestSurvey && latestSurvey.defaultSettings && Array.isArray(latestSurvey.defaultSettings.categories) && latestSurvey.defaultSettings.categories.length > 0) {
                // If the survey has categories defined, use those
                const categoryIds = latestSurvey.defaultSettings.categories;
                Meteor.subscribe('wpsCategories.byIds', categoryIds, {
                  onReady: () => {
                    if (isMounted) {
                      // Fetch only the categories from the survey
                      const surveyCategories = WPSCategories.find(
                        { _id: { $in: categoryIds } }
                      ).fetch() as unknown as Tag[];
                      setCategories(surveyCategories);
                      checkAllDataLoaded();
                    }
                  },
                  onError: (error: Meteor.Error) => {
                    console.error('Error subscribing to survey categories:', error);
                    if (isMounted) setLoading(false);
                  }
                });
              } else {
                // Fallback to all WPS categories if no survey categories are found
                Meteor.subscribe('wpsCategories.all', {
                  onReady: () => {
                    if (isMounted) {
                      setCategories(WPSCategories.find({}).fetch() as unknown as Tag[]);
                      checkAllDataLoaded();
                    }
                  },
                  onError: (error: Meteor.Error) => {
                    console.error('Error subscribing to categories:', error);
                    if (isMounted) setLoading(false);
                  }
                });
              }
            }
          },
          onError: (error: Meteor.Error) => {
            console.error('Error subscribing to surveys:', error);
            // Fallback to all WPS categories if survey subscription fails
            Meteor.subscribe('wpsCategories.all', {
              onReady: () => {
                if (isMounted) {
                  setCategories(WPSCategories.find({}).fetch() as unknown as Tag[]);
                  checkAllDataLoaded();
                }
              },
              onError: (error: Meteor.Error) => {
                console.error('Error subscribing to categories:', error);
                if (isMounted) setLoading(false);
              }
            });
          }
        });
        
        Meteor.subscribe('surveyThemes.all', {
          onReady: () => {
            if (isMounted) {
              setThemes(SurveyThemes.find({}).fetch() as unknown as Tag[]);
              checkAllDataLoaded();
            }
          },
          onError: (error: Meteor.Error) => {
            console.error('Error subscribing to themes:', error);
            if (isMounted) setLoading(false);
          }
        });
        
        Meteor.subscribe('questionTags.all', {
          onReady: () => {
            if (isMounted) {
              setTags(QuestionTags.find({}).fetch() as unknown as Tag[]);
              checkAllDataLoaded();
            }
          },
          onError: (error: Meteor.Error) => {
            console.error('Error subscribing to tags:', error);
            if (isMounted) setLoading(false);
          }
        });
        
        Meteor.subscribe('questionCategories', {
          onReady: () => {
            if (isMounted) {
              setQuestionCategories(QuestionCategories.find({}).fetch());
              checkAllDataLoaded();
            }
          },
          onError: (error: Meteor.Error) => {
            console.error('Error subscribing to question categories:', error);
            if (isMounted) setLoading(false);
          }
        });
        
        // Set a timeout to ensure we don't wait forever
        if (subscriptionTimeout) window.clearTimeout(subscriptionTimeout);
        subscriptionTimeout = window.setTimeout(() => {
          if (isMounted && loading) {
            console.warn('Subscription timeout - loading data anyway');
            loadFallbackData();
          }
        }, 5000);
        
      } catch (error: unknown) {
        console.error('Error setting up subscriptions:', error);
        if (isMounted) {
          setLoading(false);
          // Add some default data so UI isn't completely empty
          loadFallbackData();
        }
      }
    };
    
    // Function to check if all data is loaded
    const checkAllDataLoaded = () => {
      // Only update loading state if we have at least some data and component is still mounted
      if (isMounted && 
          (categories.length > 0 || themes.length > 0 || 
           tags.length > 0 || questionCategories.length > 0)) {
        setLoading(false);
        if (subscriptionTimeout) window.clearTimeout(subscriptionTimeout);
      }
    };
    
    // Fallback function to load at least some data if subscriptions fail
    const loadFallbackData = async () => {
      try {
        const { WPSCategories } = await import('/imports/features/wps-framework/api/wpsCategories');
        const { SurveyThemes } = await import('/imports/features/survey-themes/api/surveyThemes');
        const { QuestionTags } = await import('/imports/features/question-tags/api/questionTags');
        const { QuestionCategories } = await import('/imports/features/question-categories/api/questionCategories');
        
        if (!isMounted) return;
        
        // Batch state updates to prevent multiple re-renders
        const updates: { [key: string]: any } = {};
        
        // Only update states that don't have data yet
        if (categories.length === 0) {
          updates.categories = WPSCategories.find({}).fetch() as unknown as Tag[];
        }
        if (themes.length === 0) {
          updates.themes = SurveyThemes.find({}).fetch() as unknown as Tag[];
        }
        if (tags.length === 0) {
          updates.tags = QuestionTags.find({}).fetch() as unknown as Tag[];
        }
        if (questionCategories.length === 0) {
          updates.questionCategories = QuestionCategories.find({}).fetch();
        }
        
        // Apply all updates at once
        if (updates.categories) setCategories(updates.categories);
        if (updates.themes) setThemes(updates.themes);
        if (updates.tags) setTags(updates.tags);
        if (updates.questionCategories) setQuestionCategories(updates.questionCategories);
        
        // Only set loading to false once
        if (isMounted) setLoading(false);
      } catch (error: unknown) {
        console.error('Error loading fallback data:', error);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (subscriptionTimeout) window.clearTimeout(subscriptionTimeout);
    };
  }, []);

  // Handle category selection
  const handleCategoryChange = (selected: MultiValue<{ value: string; label: string }>, _actionMeta: ActionMeta<unknown>) => {
    const selectedIds = selected.map(option => option.value);
    onCategoryChange(selectedIds);
  };
  
  // Handle single category selection
  const handleSingleCategoryChange = (selected: { value: string; label: string } | null, _actionMeta: ActionMeta<unknown>) => {
    if (onSingleCategoryChange) {
      onSingleCategoryChange(selected?.value || '');
    }
  };
  
  // Handle category details change
  const handleCategoryDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCategoryDetailsChange) {
      onCategoryDetailsChange(e.target.value);
    }
  };

  // Handle theme selection
  const handleThemeChange = (selected: MultiValue<{ value: string; label: string }>, _actionMeta: ActionMeta<unknown>) => {
    const selectedIds = selected.map(option => option.value);
    onThemeChange(selectedIds);
  };

  // Handle tag selection
  const handleTagChange = (selected: MultiValue<{ value: string; label: string }>, _actionMeta: ActionMeta<unknown>) => {
    const selectedIds = selected.map(option => option.value);
    onTagChange(selectedIds);
  };

  // Handle keywords input
  const handleKeywordsChange = (selected: MultiValue<{ value: string; label: string }>, _actionMeta: ActionMeta<unknown>) => {
    const keywordValues = selected.map(option => option.value);
    onKeywordsChange(keywordValues);
  };

  // Create a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const tagId = await Meteor.callAsync('questionTags.insert', {
        name: newTagName.trim(),
        category: newTagCategory,
        color: generateRandomColor(),
      });
      
      // Add the new tag to the list and select it
      const newTag = {
        _id: tagId,
        name: newTagName.trim(),
        category: newTagCategory,
      };
      
      setTags([...tags, newTag]);
      onTagChange([...selectedTagIds, tagId]);
      
      // Reset form
      setNewTagName('');
      setNewTagCategory('');
      setShowNewTagForm(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Generate a random color for new tags
  const generateRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#98D8C8',
      '#F9C74F', '#90BE6D', '#43AA8B', '#577590', '#F94144'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Format options for react-select
  const categoryOptions = categories.map(cat => ({
    value: cat._id || '', // Add fallback for undefined _id
    label: cat.name || '',
    description: cat.description,
  }));
  
  // Format question category options for react-select
  const questionCategoryOptions = questionCategories.map(cat => ({
    value: cat._id || '', // Add fallback for undefined _id
    label: cat.name || '',
    color: cat.color,
    description: cat.description,
  }));

  const themeOptions = themes.map(theme => ({
    value: theme._id || '',
    label: theme.name || '',
    description: theme.description,
  }));

  const tagOptions = tags.map(tag => ({
    value: tag._id || '',
    label: tag.name || '',
    color: tag.color,
    category: tag.category,
  }));

  // Group tags by category
  const groupedTagOptions = tagOptions.reduce((groups: any, tag) => {
    const category = tag.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tag);
    return groups;
  }, {});

  const groupedOptions = Object.keys(groupedTagOptions).map(category => ({
    label: category,
    options: groupedTagOptions[category],
  }));

  // Custom styles for react-select
  const customStyles = {
    multiValue: (provided: any, state: any) => {
      const tag = tags.find(t => t._id === state.data.value);
      return {
        ...provided,
        backgroundColor: tag?.color || '#f0f7ff',
      };
    },
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#333',
    }),
  };

  // Format keywords for react-select
  const keywordOptions = keywords.map(keyword => ({
    value: keyword,
    label: keyword,
  }));

  return (
    <div className="question-classification">
      <div className="classification-section">
        <h3>Question Category *</h3>
        <div className="helper-text">
          <FaLayerGroup /> Select a primary category for this question
        </div>
        <Select
          options={questionCategoryOptions}
          value={questionCategoryOptions.find(option => option.value === selectedCategoryId)}
          onChange={handleSingleCategoryChange}
          placeholder="Select a category..."
          isLoading={loading}
          className="classification-select"
          styles={{
            option: (provided, state) => ({
              ...provided,
              borderLeft: `4px solid ${state.data.color || '#ccc'}`,
            }),
            singleValue: (provided, state) => ({
              ...provided,
              color: '#333',
              fontWeight: 500,
              paddingLeft: '4px',
              borderLeft: `4px solid ${state.data.color || '#ccc'}`,
            }),
          }}
        />
        
        {selectedCategoryId && (
          <div className="category-details-container">
            <label htmlFor="categoryDetails" className="category-details-label">
              Category Details
            </label>
            <textarea
              id="categoryDetails"
              className="category-details-textarea"
              value={categoryDetails}
              onChange={handleCategoryDetailsChange}
              placeholder="Add details about why this category was selected..."
              rows={4}
            />
          </div>
        )}
      </div>
      
      <div className="classification-section">
        <h3>WPS Categories</h3>
        <div className="helper-text">
          <FaInfoCircle /> Assign workplace safety framework categories to organize questions
        </div>
        <Select
          isMulti
          options={categoryOptions}
          value={categoryOptions.filter(option => selectedCategoryIds.includes(option.value))}
          onChange={handleCategoryChange}
          placeholder="Select categories..."
          isLoading={loading}
          className="classification-select"
        />
      </div>

      <div className="classification-section">
        <h3>Survey Themes</h3>
        <div className="helper-text">
          <FaInfoCircle /> Group related questions by assigning survey themes
        </div>
        <Select
          isMulti
          options={themeOptions}
          value={themeOptions.filter(option => selectedThemeIds.includes(option.value))}
          onChange={handleThemeChange}
          placeholder="Select themes..."
          isLoading={loading}
          className="classification-select"
        />
      </div>

      <div className="classification-section">
        <div className="section-header-with-action">
          <h3>Question Tags</h3>
          <button 
            className="add-tag-button"
            onClick={() => setShowNewTagForm(!showNewTagForm)}
            title="Add new tag"
          >
            <FaPlus /> New Tag
          </button>
        </div>
        <div className="helper-text">
          <FaTags /> Add specific tags to help with question organization and filtering
        </div>
        
        {showNewTagForm && (
          <div className="new-tag-form">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="tag-input"
            />
            <input
              type="text"
              value={newTagCategory}
              onChange={(e) => setNewTagCategory(e.target.value)}
              placeholder="Category"
              className="tag-input"
            />
            <div className="tag-form-actions">
              <button 
                className="cancel-tag-button"
                onClick={() => setShowNewTagForm(false)}
              >
                Cancel
              </button>
              <button 
                className="create-tag-button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                Create Tag
              </button>
            </div>
          </div>
        )}
        
        <Select
          isMulti
          options={groupedOptions}
          value={tagOptions.filter(option => selectedTagIds.includes(option.value))}
          onChange={handleTagChange}
          placeholder="Select or create tags..."
          isLoading={loading}
          styles={customStyles}
          className="classification-select"
        />
      </div>

      <div className="classification-section">
        <h3>Keywords</h3>
        <div className="helper-text">
          <FaInfoCircle /> Add keywords to make this question easier to find in searches
        </div>
        <CreatableSelect
          isMulti
          options={keywordOptions}
          value={keywords.map(keyword => ({ value: keyword, label: keyword }))}
          onChange={handleKeywordsChange}
          placeholder="Type keywords and press enter..."
          className="classification-select"
        />
      </div>
    </div>
  );
};

export default QuestionClassification;
