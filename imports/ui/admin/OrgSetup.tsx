import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';
import { OrganizationSettingsCollection, OrganizationSettings } from '../../features/organization/api/organizationSettings';
import { SketchPicker, ChromePicker, ColorResult } from 'react-color';

// Vertical Tab Button Component
const VerticalTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#fff' : 'transparent',
        border: 'none',
        borderLeft: active ? '4px solid #b0802b' : '4px solid transparent',
        padding: '14px 20px',
        fontSize: 15,
        fontWeight: active ? 600 : 500,
        color: active ? '#28211e' : '#6e5a67',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        width: '100%',
        borderRadius: active ? '0 8px 8px 0' : '0',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        marginBottom: 4
      }}
    >
      {children}
    </button>
  );
};

// Form Field Component
const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: 8,
        border: '1.5px solid #e5d6c7',
        color: '#28211e',
        fontWeight: 500,
        fontSize: 16,
        outline: 'none',
        background: '#fff',
        boxSizing: 'border-box'
      }}
    />
  </div>
);

// Checkbox Field Component
const CheckboxField: React.FC<{
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}> = ({ label, name, checked, onChange, description }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      style={{
        width: 20,
        height: 20,
        marginRight: 12,
        marginTop: 3,
        accentColor: '#b0802b'
      }}
    />
    <div>
      <label 
        htmlFor={name} 
        style={{ 
          display: 'block', 
          fontWeight: 600, 
          color: '#28211e', 
          cursor: 'pointer' 
        }}
      >
        {label}
      </label>
      {description && (
        <p style={{ margin: '4px 0 0', color: '#6e5a67', fontSize: 14 }}>
          {description}
        </p>
      )}
    </div>
  </div>
);

// Organization Setup Component
const OrgSetup: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState<Partial<OrganizationSettings>>({
    name: '',
    primaryColor: '#b0802b',
    secondaryColor: '#402C00',
    terminology: {
      surveyLabel: 'Survey',
      questionLabel: 'Question',
      categoryLabel: 'Category',
      tagLabel: 'Tag',
      participantLabel: 'Participant',
      departmentLabel: 'Department',
      siteLabel: 'Site'
    },
    questionCategories: [],
    questionTags: [],
    defaultSettings: {
      enableDemographics: true,
      requireComments: false,
      anonymousResponses: true,
      allowMultipleSubmissions: false
    },
    contactEmail: ''
  });

  // State for UI
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'terminology' | 'branding' | 'defaults' | 'categories' | 'tags'>('terminology');
  const [showColorPicker, setShowColorPicker] = useState<'primary' | 'secondary' | 'tag' | null>(null);
  
  // State for category management
  const [newCategory, setNewCategory] = useState<{ id: string; name: string; description: string; assignableTo: ('surveys' | 'questions')[] }>({ 
    id: '', 
    name: '', 
    description: '', 
    assignableTo: ['questions'] 
  });
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  
  // State for tag management
  const [newTag, setNewTag] = useState<{ id: string; name: string; color: string; description: string; assignableTo: ('surveys' | 'questions')[] }>({ 
    id: '', 
    name: '', 
    color: '#3498db', 
    description: '',
    assignableTo: ['questions']
  });
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [tagColorPickerOpen, setTagColorPickerOpen] = useState(false);

  // Get organization settings from database
  const { settings, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('organizationSettings');
    const settings = OrganizationSettingsCollection.findOne();
    return {
      settings,
      isLoading: !sub.ready()
    };
  }, []);

  // Add timeout to prevent infinite loading
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  useEffect(() => {
    // If loading takes more than 3 seconds, we'll show the form with default values
    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof OrganizationSettings] as Record<string, any> || {};
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [parent, child] = name.split('.');
    
    setFormData(prev => {
      const parentObj = prev[parent as keyof OrganizationSettings] as Record<string, any> || {};
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [child]: checked
        }
      };
    });
  };

  // Handle color changes
  const handleColorChange = (color: ColorResult, type: 'primary' | 'secondary') => {
    setFormData(prev => ({
      ...prev,
      [type === 'primary' ? 'primaryColor' : 'secondaryColor']: color.hex
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await Meteor.callAsync('organizationSettings.update', formData);
      setAlert({ type: 'success', message: 'Organization settings updated successfully!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.reason || 'Failed to update settings' });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (isLoading && !loadTimeout) {
    return (
      <AdminLayout>
        <DashboardBg>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ 
              border: '6px solid #f3e9d7',
              borderTop: '6px solid #b0802b',
              borderRadius: '50%',
              width: 56,
              height: 56,
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
          </div>
        </DashboardBg>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <DashboardBg>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px', width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#28211e' }}>
            Organization Setup
          </h1>
          
          {alert && (
            <div style={{
              position: 'fixed',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              zIndex: 2000,
              boxShadow: '0 2px 12px #b0802b33',
            }}>
              {alert.message}
            </div>
          )}
          
          {/* Main content area with vertical tabs */}
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Vertical Tabs */}
            <div style={{ 
              width: 220, 
              flexShrink: 0,
              background: '#f9f5f0',
              borderRadius: 12,
              padding: '16px 0',
              border: '1px solid #e5d6c7',
              height: 'fit-content'
            }}>
              <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e5d6c7', marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6e5a67', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Organization Settings
                </h3>
              </div>
              <VerticalTabButton 
                active={activeTab === 'terminology'} 
                onClick={() => setActiveTab('terminology')}
              >
                Terminology
              </VerticalTabButton>
              <VerticalTabButton 
                active={activeTab === 'branding'} 
                onClick={() => setActiveTab('branding')}
              >
                Branding
              </VerticalTabButton>
              <VerticalTabButton 
                active={activeTab === 'categories'} 
                onClick={() => setActiveTab('categories')}
              >
                Categories
              </VerticalTabButton>
              <VerticalTabButton 
                active={activeTab === 'tags'} 
                onClick={() => setActiveTab('tags')}
              >
                Tags
              </VerticalTabButton>
              <VerticalTabButton 
                active={activeTab === 'defaults'} 
                onClick={() => setActiveTab('defaults')}
              >
                Default Settings
              </VerticalTabButton>
            </div>
            
            {/* Content Area */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5d6c7' }}>
              <form onSubmit={handleSubmit}>
                {/* Terminology Tab */}
                {activeTab === 'terminology' && (
                  <div>
                    <p style={{ marginBottom: 24, color: '#6e5a67', fontSize: 16 }}>
                      Customize the terminology used throughout the application to match your organization's language.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, width: '100%', boxSizing: 'border-box' }}>
                      <FormField 
                        label="Survey Label"
                        name="terminology.surveyLabel"
                        value={formData.terminology?.surveyLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Survey, Assessment, Questionnaire"
                      />
                      
                      <FormField 
                        label="Question Label"
                        name="terminology.questionLabel"
                        value={formData.terminology?.questionLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Question, Item, Prompt"
                      />
                      
                      <FormField 
                        label="Category Label"
                        name="terminology.categoryLabel"
                        value={formData.terminology?.categoryLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Category, Group, Section"
                      />
                      
                      <FormField 
                        label="Tag Label"
                        name="terminology.tagLabel"
                        value={formData.terminology?.tagLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Tag, Label, Topic"
                      />
                      
                      <FormField 
                        label="Participant Label"
                        name="terminology.participantLabel"
                        value={formData.terminology?.participantLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Participant, Employee, Respondent"
                      />
                      
                      <FormField 
                        label="Department Label"
                        name="terminology.departmentLabel"
                        value={formData.terminology?.departmentLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Department, Team, Unit"
                      />
                      
                      <FormField 
                        label="Site Label"
                        name="terminology.siteLabel"
                        value={formData.terminology?.siteLabel || ''}
                        onChange={handleChange}
                        placeholder="e.g., Site, Location, Office"
                      />
                    </div>
                  </div>
                )}
                
                {/* Branding Tab */}
                {activeTab === 'branding' && (
                  <div>
                    <p style={{ marginBottom: 24, color: '#6e5a67', fontSize: 16 }}>
                      Customize your organization's branding elements.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, width: '100%', boxSizing: 'border-box' }}>
                      <FormField 
                        label="Organization Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="Your Organization Name"
                      />
                      
                      <FormField 
                        label="Contact Email"
                        name="contactEmail"
                        value={formData.contactEmail || ''}
                        onChange={handleChange}
                        placeholder="support@example.com"
                        type="email"
                      />
                      
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Primary Color
                        </label>
                        <div 
                          style={{ 
                            height: 44, 
                            borderRadius: 8, 
                            border: '1.5px solid #e5d6c7',
                            background: formData.primaryColor || '#b0802b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            color: '#fff',
                            fontWeight: 600
                          }}
                          onClick={() => setShowColorPicker(showColorPicker === 'primary' ? null : 'primary')}
                        >
                          {formData.primaryColor || '#b0802b'}
                        </div>
                        {showColorPicker === 'primary' && (
                          <div style={{ position: 'absolute', zIndex: 2, marginTop: 8 }}>
                            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setShowColorPicker(null)} />
                            <SketchPicker 
                              color={formData.primaryColor || '#b0802b'} 
                              onChange={(color: ColorResult) => handleColorChange(color, 'primary')} 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Secondary Color
                        </label>
                        <div 
                          style={{ 
                            height: 44, 
                            borderRadius: 8, 
                            border: '1.5px solid #e5d6c7',
                            background: formData.secondaryColor || '#402C00',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            color: '#fff',
                            fontWeight: 600
                          }}
                          onClick={() => setShowColorPicker(showColorPicker === 'secondary' ? null : 'secondary')}
                        >
                          {formData.secondaryColor || '#402C00'}
                        </div>
                        {showColorPicker === 'secondary' && (
                          <div style={{ position: 'absolute', zIndex: 2, marginTop: 8 }}>
                            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setShowColorPicker(null)} />
                            <SketchPicker 
                              color={formData.secondaryColor || '#402C00'} 
                              onChange={(color: ColorResult) => handleColorChange(color, 'secondary')} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Categories Tab */}
                {activeTab === 'categories' && (
                  <div>
                    <p style={{ marginBottom: 24, color: '#6e5a67', fontSize: 16 }}>
                      Manage categories that can be assigned to questions or surveys.
                    </p>
                    
                    {/* Add/Edit Category Form */}
                    <div style={{ 
                      background: '#f9f5f0', 
                      padding: 24, 
                      borderRadius: 8, 
                      marginBottom: 24,
                      border: '1px solid #e5d6c7'
                    }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#28211e' }}>
                        {editingCategoryIndex !== null ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, width: '100%', boxSizing: 'border-box' }}>
                        <FormField 
                          label="Category Name"
                          name="categoryName"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="e.g., Safety Behavior, Workplace Safety"
                        />
                        
                        <FormField 
                          label="Category ID"
                          name="categoryId"
                          value={newCategory.id}
                          onChange={(e) => setNewCategory({...newCategory, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          placeholder="e.g., safety-behavior"
                        />
                      </div>
                      
                      <div style={{ marginTop: 16, marginBottom: 16 }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Description
                        </label>
                        <textarea
                          value={newCategory.description || ''}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          placeholder="Describe the purpose of this category"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1.5px solid #e5d6c7',
                            color: '#28211e',
                            fontWeight: 500,
                            fontSize: 16,
                            outline: 'none',
                            background: '#fff',
                            boxSizing: 'border-box',
                            minHeight: 100,
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Assignable To
                        </label>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              id="assignToQuestions"
                              checked={newCategory.assignableTo.includes('questions')}
                              onChange={(e) => {
                                const assignableTo = [...newCategory.assignableTo];
                                if (e.target.checked) {
                                  if (!assignableTo.includes('questions')) {
                                    assignableTo.push('questions');
                                  }
                                } else {
                                  const index = assignableTo.indexOf('questions');
                                  if (index !== -1) {
                                    assignableTo.splice(index, 1);
                                  }
                                }
                                setNewCategory({...newCategory, assignableTo});
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                marginRight: 8,
                                accentColor: '#b0802b'
                              }}
                            />
                            <label htmlFor="assignToQuestions" style={{ cursor: 'pointer' }}>Questions</label>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              id="assignToSurveys"
                              checked={newCategory.assignableTo.includes('surveys')}
                              onChange={(e) => {
                                const assignableTo = [...newCategory.assignableTo];
                                if (e.target.checked) {
                                  if (!assignableTo.includes('surveys')) {
                                    assignableTo.push('surveys');
                                  }
                                } else {
                                  const index = assignableTo.indexOf('surveys');
                                  if (index !== -1) {
                                    assignableTo.splice(index, 1);
                                  }
                                }
                                setNewCategory({...newCategory, assignableTo});
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                marginRight: 8,
                                accentColor: '#b0802b'
                              }}
                            />
                            <label htmlFor="assignToSurveys" style={{ cursor: 'pointer' }}>Surveys</label>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategory.name.trim() === '' || newCategory.id.trim() === '') {
                              setAlert({ type: 'error', message: 'Category name and ID are required' });
                              setTimeout(() => setAlert(null), 3000);
                              return;
                            }
                            
                            if (newCategory.assignableTo.length === 0) {
                              setAlert({ type: 'error', message: 'Category must be assignable to at least one item type' });
                              setTimeout(() => setAlert(null), 3000);
                              return;
                            }
                            
                            const updatedCategories = [...(formData.questionCategories || [])];
                            
                            if (editingCategoryIndex !== null) {
                              // Update existing category
                              updatedCategories[editingCategoryIndex] = newCategory;
                            } else {
                              // Check for duplicate ID
                              if (updatedCategories.some(cat => cat.id === newCategory.id)) {
                                setAlert({ type: 'error', message: 'A category with this ID already exists' });
                                setTimeout(() => setAlert(null), 3000);
                                return;
                              }
                              
                              // Add new category
                              updatedCategories.push(newCategory);
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              questionCategories: updatedCategories
                            }));
                            
                            // Reset form
                            setNewCategory({ id: '', name: '', description: '', assignableTo: ['questions'] });
                            setEditingCategoryIndex(null);
                          }}
                          style={{
                            background: formData.primaryColor || '#b0802b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            padding: '0 24px',
                            fontSize: 15,
                            height: 40,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {editingCategoryIndex !== null ? 'Update Category' : 'Add Category'}
                        </button>
                        
                        {editingCategoryIndex !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCategory({ id: '', name: '', description: '', assignableTo: ['questions'] });
                              setEditingCategoryIndex(null);
                            }}
                            style={{
                              background: 'transparent',
                              color: '#6e5a67',
                              border: '1.5px solid #e5d6c7',
                              borderRadius: 8,
                              fontWeight: 600,
                              padding: '0 24px',
                              fontSize: 15,
                              height: 40,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Categories List */}
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#28211e' }}>
                        Existing Categories
                      </h3>
                      
                      {formData.questionCategories && formData.questionCategories.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {formData.questionCategories.map((category, index) => (
                            <div 
                              key={category.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                background: '#fff',
                                borderRadius: 8,
                                border: '1px solid #e5d6c7'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#28211e' }}>
                                    {category.name}
                                  </h4>
                                  <span style={{ 
                                    fontSize: 12, 
                                    color: '#6e5a67', 
                                    background: '#f9f5f0', 
                                    padding: '2px 8px', 
                                    borderRadius: 12 
                                  }}>
                                    {category.id}
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0 0', color: '#6e5a67', fontSize: 14 }}>
                                  {category.description || 'No description'}
                                </p>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                  {category.assignableTo.includes('questions') && (
                                    <span style={{ 
                                      fontSize: 12, 
                                      color: '#6e5a67', 
                                      background: '#f3e9d7', 
                                      padding: '2px 8px', 
                                      borderRadius: 12 
                                    }}>
                                      Questions
                                    </span>
                                  )}
                                  {category.assignableTo.includes('surveys') && (
                                    <span style={{ 
                                      fontSize: 12, 
                                      color: '#6e5a67', 
                                      background: '#f3e9d7', 
                                      padding: '2px 8px', 
                                      borderRadius: 12 
                                    }}>
                                      Surveys
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewCategory({
                              id: category.id,
                              name: category.name,
                              description: category.description || '',
                              assignableTo: [...category.assignableTo]
                            });
                                    setEditingCategoryIndex(index);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    color: '#6e5a67',
                                    border: '1.5px solid #e5d6c7',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    padding: '0 16px',
                                    fontSize: 14,
                                    height: 36,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedCategories = [...(formData.questionCategories || [])];
                                    updatedCategories.splice(index, 1);
                                    setFormData(prev => ({
                                      ...prev,
                                      questionCategories: updatedCategories
                                    }));
                                  }}
                                  style={{
                                    background: 'transparent',
                                    color: '#e74c3c',
                                    border: '1.5px solid #e74c3c',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    padding: '0 16px',
                                    fontSize: 14,
                                    height: 36,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          padding: 24, 
                          background: '#f9f5f0', 
                          borderRadius: 8, 
                          textAlign: 'center',
                          color: '#6e5a67'
                        }}>
                          No categories have been created yet. Add your first category above.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tags Tab */}
                {activeTab === 'tags' && (
                  <div>
                    <p style={{ marginBottom: 24, color: '#6e5a67', fontSize: 16 }}>
                      Manage tags that can be assigned to questions or surveys.
                    </p>
                    
                    {/* Add/Edit Tag Form */}
                    <div style={{ 
                      background: '#f9f5f0', 
                      padding: 24, 
                      borderRadius: 8, 
                      marginBottom: 24,
                      border: '1px solid #e5d6c7'
                    }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#28211e' }}>
                        {editingTagIndex !== null ? 'Edit Tag' : 'Add New Tag'}
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, width: '100%', boxSizing: 'border-box' }}>
                        <FormField 
                          label="Tag Name"
                          name="tagName"
                          value={newTag.name}
                          onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                          placeholder="e.g., High Priority, Compliance"
                        />
                        
                        <FormField 
                          label="Tag ID"
                          name="tagId"
                          value={newTag.id}
                          onChange={(e) => setNewTag({...newTag, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          placeholder="e.g., high-priority"
                        />
                        
                        <div style={{ position: 'relative' }}>
                          <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                            Tag Color
                          </label>
                          <div 
                            style={{ 
                              height: 44, 
                              borderRadius: 8, 
                              border: '1.5px solid #e5d6c7',
                              background: newTag.color || '#3498db',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 16px',
                              color: '#fff',
                              fontWeight: 600
                            }}
                            onClick={() => setShowColorPicker(showColorPicker === 'tag' ? null : 'tag')}
                          >
                            {newTag.color || '#3498db'}
                          </div>
                          {showColorPicker === 'tag' && (
                            <div style={{ position: 'absolute', zIndex: 2, marginTop: 8 }}>
                              <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setShowColorPicker(null)} />
                              <SketchPicker 
                                color={newTag.color || '#3498db'} 
                                onChange={(color: ColorResult) => setNewTag({...newTag, color: color.hex})} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 16, marginBottom: 16 }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Description
                        </label>
                        <textarea
                          value={newTag.description || ''}
                          onChange={(e) => setNewTag({...newTag, description: e.target.value})}
                          placeholder="Describe the purpose of this tag"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1.5px solid #e5d6c7',
                            color: '#28211e',
                            fontWeight: 500,
                            fontSize: 16,
                            outline: 'none',
                            background: '#fff',
                            boxSizing: 'border-box',
                            minHeight: 100,
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#28211e', marginBottom: 8 }}>
                          Assignable To
                        </label>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              id="tagAssignToQuestions"
                              checked={newTag.assignableTo.includes('questions')}
                              onChange={(e) => {
                                const assignableTo = [...newTag.assignableTo];
                                if (e.target.checked) {
                                  if (!assignableTo.includes('questions')) {
                                    assignableTo.push('questions');
                                  }
                                } else {
                                  const index = assignableTo.indexOf('questions');
                                  if (index !== -1) {
                                    assignableTo.splice(index, 1);
                                  }
                                }
                                setNewTag({...newTag, assignableTo});
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                marginRight: 8,
                                accentColor: '#b0802b'
                              }}
                            />
                            <label htmlFor="tagAssignToQuestions" style={{ cursor: 'pointer' }}>Questions</label>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              id="tagAssignToSurveys"
                              checked={newTag.assignableTo.includes('surveys')}
                              onChange={(e) => {
                                const assignableTo = [...newTag.assignableTo];
                                if (e.target.checked) {
                                  if (!assignableTo.includes('surveys')) {
                                    assignableTo.push('surveys');
                                  }
                                } else {
                                  const index = assignableTo.indexOf('surveys');
                                  if (index !== -1) {
                                    assignableTo.splice(index, 1);
                                  }
                                }
                                setNewTag({...newTag, assignableTo});
                              }}
                              style={{
                                width: 20,
                                height: 20,
                                marginRight: 8,
                                accentColor: '#b0802b'
                              }}
                            />
                            <label htmlFor="tagAssignToSurveys" style={{ cursor: 'pointer' }}>Surveys</label>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (newTag.name.trim() === '' || newTag.id.trim() === '') {
                              setAlert({ type: 'error', message: 'Tag name and ID are required' });
                              setTimeout(() => setAlert(null), 3000);
                              return;
                            }
                            
                            if (newTag.assignableTo.length === 0) {
                              setAlert({ type: 'error', message: 'Tag must be assignable to at least one item type' });
                              setTimeout(() => setAlert(null), 3000);
                              return;
                            }
                            
                            const updatedTags = [...(formData.questionTags || [])];
                            
                            if (editingTagIndex !== null) {
                              // Update existing tag
                              updatedTags[editingTagIndex] = newTag;
                            } else {
                              // Check for duplicate ID
                              if (updatedTags.some(tag => tag.id === newTag.id)) {
                                setAlert({ type: 'error', message: 'A tag with this ID already exists' });
                                setTimeout(() => setAlert(null), 3000);
                                return;
                              }
                              
                              // Add new tag
                              updatedTags.push(newTag);
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              questionTags: updatedTags
                            }));
                            
                            // Reset form
                            setNewTag({ id: '', name: '', color: '#3498db', description: '', assignableTo: ['questions'] });
                            setEditingTagIndex(null);
                          }}
                          style={{
                            background: formData.primaryColor || '#b0802b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            padding: '0 24px',
                            fontSize: 15,
                            height: 40,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {editingTagIndex !== null ? 'Update Tag' : 'Add Tag'}
                        </button>
                        
                        {editingTagIndex !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewTag({ id: '', name: '', color: '#3498db', description: '', assignableTo: ['questions'] });
                              setEditingTagIndex(null);
                            }}
                            style={{
                              background: 'transparent',
                              color: '#6e5a67',
                              border: '1.5px solid #e5d6c7',
                              borderRadius: 8,
                              fontWeight: 600,
                              padding: '0 24px',
                              fontSize: 15,
                              height: 40,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Tags List */}
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#28211e' }}>
                        Existing Tags
                      </h3>
                      
                      {formData.questionTags && formData.questionTags.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {formData.questionTags.map((tag, index) => (
                            <div 
                              key={tag.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                background: '#fff',
                                borderRadius: 8,
                                border: '1px solid #e5d6c7'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#28211e' }}>
                                    {tag.name}
                                  </h4>
                                  <span style={{ 
                                    fontSize: 12, 
                                    color: '#fff', 
                                    background: tag.color || '#3498db', 
                                    padding: '2px 8px', 
                                    borderRadius: 12 
                                  }}>
                                    {tag.id}
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0 0', color: '#6e5a67', fontSize: 14 }}>
                                  {tag.description || 'No description'}
                                </p>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                  {tag.assignableTo.includes('questions') && (
                                    <span style={{ 
                                      fontSize: 12, 
                                      color: '#6e5a67', 
                                      background: '#f3e9d7', 
                                      padding: '2px 8px', 
                                      borderRadius: 12 
                                    }}>
                                      Questions
                                    </span>
                                  )}
                                  {tag.assignableTo.includes('surveys') && (
                                    <span style={{ 
                                      fontSize: 12, 
                                      color: '#6e5a67', 
                                      background: '#f3e9d7', 
                                      padding: '2px 8px', 
                                      borderRadius: 12 
                                    }}>
                                      Surveys
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewTag({
                                      id: tag.id,
                                      name: tag.name,
                                      color: tag.color || '#3498db',
                                      description: tag.description || '',
                                      assignableTo: [...tag.assignableTo]
                                    });
                                    setEditingTagIndex(index);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    color: '#6e5a67',
                                    border: '1.5px solid #e5d6c7',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    padding: '0 16px',
                                    fontSize: 14,
                                    height: 36,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedTags = [...(formData.questionTags || [])];
                                    updatedTags.splice(index, 1);
                                    setFormData(prev => ({
                                      ...prev,
                                      questionTags: updatedTags
                                    }));
                                  }}
                                  style={{
                                    background: 'transparent',
                                    color: '#e74c3c',
                                    border: '1.5px solid #e74c3c',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    padding: '0 16px',
                                    fontSize: 14,
                                    height: 36,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          padding: 24, 
                          background: '#f9f5f0', 
                          borderRadius: 8, 
                          textAlign: 'center',
                          color: '#6e5a67'
                        }}>
                          No tags have been created yet. Add your first tag above.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Default Settings Tab */}
                {activeTab === 'defaults' && (
                  <div>
                    <p style={{ marginBottom: 24, color: '#6e5a67', fontSize: 16 }}>
                      Configure default settings for new surveys.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <CheckboxField
                        label="Enable Demographics by Default"
                        name="defaultSettings.enableDemographics"
                        checked={formData.defaultSettings?.enableDemographics || false}
                        onChange={handleCheckboxChange}
                        description="Include demographic questions in new surveys by default"
                      />
                      
                      <CheckboxField
                        label="Require Comments by Default"
                        name="defaultSettings.requireComments"
                        checked={formData.defaultSettings?.requireComments || false}
                        onChange={handleCheckboxChange}
                        description="Make comment fields required in new surveys by default"
                      />
                      
                      <CheckboxField
                        label="Anonymous Responses by Default"
                        name="defaultSettings.anonymousResponses"
                        checked={formData.defaultSettings?.anonymousResponses || false}
                        onChange={handleCheckboxChange}
                        description="Make survey responses anonymous by default"
                      />
                      
                      <CheckboxField
                        label="Allow Multiple Submissions by Default"
                        name="defaultSettings.allowMultipleSubmissions"
                        checked={formData.defaultSettings?.allowMultipleSubmissions || false}
                        onChange={handleCheckboxChange}
                        description="Allow participants to submit multiple responses by default"
                      />
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <div style={{ marginTop: 32 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: formData.primaryColor || '#b0802b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      padding: '0 32px',
                      fontSize: 16,
                      height: 48,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default OrgSetup;
