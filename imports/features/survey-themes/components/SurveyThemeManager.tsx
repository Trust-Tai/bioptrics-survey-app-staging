import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from '../api/surveyThemes';
import { WPSCategories } from '../../wps-framework/api/wpsCategories';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';
import { FaCheck, FaEye, FaSearch } from 'react-icons/fa';

// Import the Theme interface from SurveyTheme component
interface Theme {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date | string;
  wpsCategoryId?: string;
  assignableTo?: string[];
  keywords?: string[];
  priority?: number;
  isActive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  layout?: string;
  buttonStyle?: string;
  questionStyle?: string;
  headerStyle?: string;
  backgroundImage?: string;
  customCSS?: string;
  previewImageUrl?: string;
  templateType?: string;
}

const SurveyThemeManager = () => {
  // State for selected survey ID and theme ID
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get all themes and WPS categories
  const { themes, wpsCategories, loading } = useTracker(() => {
    const themesHandle = Meteor.subscribe('surveyThemes.all');
    const categoriesHandle = Meteor.subscribe('wpsCategories.all');
    
    // Fetch themes and deduplicate them
    const allThemes = SurveyThemes.find({}, { sort: { priority: -1, name: 1 } }).fetch();
    
    // First pass: deduplicate by _id
    const themeMap = new Map();
    allThemes.forEach(theme => {
      if (theme._id && !themeMap.has(theme._id)) {
        themeMap.set(theme._id, theme);
      }
    });
    
    // Second pass: deduplicate by name
    const nameMap = new Map();
    Array.from(themeMap.values()).forEach(theme => {
      if (!nameMap.has(theme.name.toLowerCase())) {
        nameMap.set(theme.name.toLowerCase(), theme);
      }
    });
    
    // Convert back to array
    const uniqueThemes = Array.from(nameMap.values());
    
    // Sort by priority and name
    uniqueThemes.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      if (priorityB !== priorityA) {
        return priorityB - priorityA; // Higher priority first
      }
      return a.name.localeCompare(b.name); // Then alphabetically
    });
    
    console.log(`Found ${allThemes.length} themes, deduplicated to ${uniqueThemes.length}`);
    
    return {
      loading: !themesHandle.ready() || !categoriesHandle.ready(),
      themes: uniqueThemes,
      wpsCategories: WPSCategories.find({}).fetch(),
    };
  }, []);

  // Filter themes based on search query
  const filteredThemes = themes.filter((theme: Theme) => {
    const matchesSearch = searchQuery === '' || 
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (theme.keywords && theme.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesSearch;
  });

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Show error message
  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  // Handle theme selection
  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    showSuccess('Theme selected successfully!');
  };

  // Preview a theme
  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    setShowPreview(true);
  };

  // Close preview modal
  const closePreview = () => {
    setShowPreview(false);
    setPreviewTheme(null);
  };

  // Theme preview component
  const ThemePreview = ({ theme }: { theme: Theme }) => {
    if (!theme) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: theme.backgroundColor || '#ffffff',
          borderRadius: 12,
          padding: 20,
          width: '80%',
          maxWidth: 800,
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button 
            onClick={closePreview}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: theme.textColor || '#333'
            }}
          >
            ×
          </button>
          
          <div style={{
            backgroundColor: theme.primaryColor || '#552a47',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#fff',
              margin: 0,
              fontFamily: theme.headingFont || 'Inter, sans-serif'
            }}>
              {theme.name} Theme Preview
            </h2>
          </div>
          
          <div style={{
            fontFamily: theme.bodyFont || 'Inter, sans-serif',
            color: theme.textColor || '#333'
          }}>
            <h3 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Heading</h3>
            <p>This is how text will appear in your survey. The body font is {theme.bodyFont || 'default'} and the heading font is {theme.headingFont || 'default'}.</p>
            
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Sample Question</h4>
              <div style={{
                backgroundColor: theme.questionStyle === 'card' ? '#f9f9f9' : 'transparent',
                border: theme.questionStyle === 'bordered' ? `1px solid ${theme.accentColor || '#ddd'}` : 'none',
                padding: 15,
                borderRadius: 8,
                marginBottom: 15
              }}>
                <p>How would you rate your experience?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button key={num} style={{
                      backgroundColor: num === 3 ? theme.accentColor : 'transparent',
                      color: num === 3 ? '#fff' : theme.textColor || '#333',
                      border: `1px solid ${theme.accentColor || '#ddd'}`,
                      borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button style={{
                backgroundColor: 'transparent',
                color: theme.primaryColor || '#552a47',
                border: `1px solid ${theme.primaryColor || '#552a47'}`,
                borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
              }}>
                Previous
              </button>
              
              <button style={{
                backgroundColor: theme.primaryColor || '#552a47',
                color: '#fff',
                border: 'none',
                borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'rounded' ? '8px' : '0',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
              }}>
                Next
              </button>
            </div>
            
            <div style={{ marginTop: 30, borderTop: `1px solid ${theme.accentColor || '#ddd'}`, paddingTop: 20 }}>
              <h4 style={{ fontFamily: theme.headingFont || 'Inter, sans-serif' }}>Theme Properties</h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10
              }}>
                <li>
                  <strong>Primary Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.primaryColor || '#552a47', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Secondary Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.secondaryColor || '#8e44ad', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Accent Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.accentColor || '#9b59b6', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Background Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.backgroundColor || '#ffffff', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li>
                  <strong>Text Color:</strong> 
                  <div style={{ 
                    display: 'inline-block', 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: theme.textColor || '#2c3e50', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                    border: '1px solid #ddd'
                  }}></div>
                </li>
                <li><strong>Heading Font:</strong> {theme.headingFont || 'Default'}</li>
                <li><strong>Body Font:</strong> {theme.bodyFont || 'Default'}</li>
                <li><strong>Layout:</strong> {theme.layout || 'Default'}</li>
                <li><strong>Button Style:</strong> {theme.buttonStyle || 'Default'}</li>
                <li><strong>Question Style:</strong> {theme.questionStyle || 'Default'}</li>
                <li><strong>Header Style:</strong> {theme.headerStyle || 'Default'}</li>
                <li><strong>Template Type:</strong> {theme.templateType || 'Default'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <DashboardBg>
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#28211e', marginBottom: 20 }}>Survey Theme Gallery</h1>
          
          {/* Success and error messages */}
          {successMessage && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              {errorMessage}
            </div>
          )}
          
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px 10px 40px', 
                    borderRadius: 8, 
                    border: '1.5px solid #e5d6c7', 
                    fontSize: 16 
                  }}
                />
                <FaSearch style={{ position: 'absolute', left: 12, top: 13, color: '#8b8685' }} />
              </div>
            </div>
          </div>
          
          {/* Theme gallery */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading themes...</div>
          ) : filteredThemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8b8685' }}>
              No themes found matching your criteria
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 24 
            }}>
              {filteredThemes.map((theme: Theme) => (
                <div key={theme._id} style={{ 
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: theme._id === selectedThemeId ? '2px solid #10b981' : '1px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {theme._id === selectedThemeId && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: '#10b981',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <FaCheck size={12} />
                    </div>
                  )}
                  
                  {/* Theme preview header */}
                  <div style={{ 
                    height: 100, 
                    background: theme.previewImageUrl 
                      ? `url(${theme.previewImageUrl}) center/cover` 
                      : theme.primaryColor 
                        ? (theme.headerStyle === 'gradient' && theme.secondaryColor)
                          ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                          : theme.primaryColor
                        : theme.color
                  }} />
                  
                  {/* Theme info */}
                  <div style={{ padding: 16 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 18, 
                      fontWeight: 600, 
                      color: theme.textColor || '#28211e',
                      fontFamily: theme.headingFont || 'inherit'
                    }}>
                      {theme.name}
                    </h3>
                    
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: 14, 
                      color: '#6b7280',
                      height: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {theme.description}
                    </p>
                    
                    {/* Theme properties preview */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 8, 
                      marginBottom: 16 
                    }}>
                      {theme.primaryColor && (
                        <div style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          backgroundColor: theme.primaryColor,
                          border: '1px solid #e5e7eb'
                        }} title="Primary Color" />
                      )}
                      {theme.secondaryColor && (
                        <div style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          backgroundColor: theme.secondaryColor,
                          border: '1px solid #e5e7eb'
                        }} title="Secondary Color" />
                      )}
                      {theme.accentColor && (
                        <div style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          backgroundColor: theme.accentColor,
                          border: '1px solid #e5e7eb'
                        }} title="Accent Color" />
                      )}
                      
                      <div style={{ 
                        fontSize: 12, 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 8px', 
                        borderRadius: 4,
                        color: '#4b5563'
                      }}>
                        {theme.templateType || 'Standard'}
                      </div>
                      
                      <div style={{ 
                        fontSize: 12, 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 8px', 
                        borderRadius: 4,
                        color: '#4b5563'
                      }}>
                        {theme.buttonStyle || 'Default'}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handlePreview(theme)}
                        style={{ 
                          flex: 1,
                          padding: '8px 12px', 
                          backgroundColor: 'transparent', 
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          color: '#4b5563',
                          fontSize: 14
                        }}
                      >
                        <FaEye size={14} /> Preview
                      </button>
                      
                      <button 
                        onClick={() => handleSelectTheme(theme._id || '')}

                        style={{ 
                          flex: 1,
                          padding: '8px 12px', 
                          backgroundColor: theme.primaryColor || '#552a47',
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                      >
                        Use Theme
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyThemeManager;
