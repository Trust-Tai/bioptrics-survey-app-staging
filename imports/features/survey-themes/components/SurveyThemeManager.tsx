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
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [themesPerPage] = useState(12);
  
  // New theme state
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    name: '',
    color: '#552a47',
    description: '',
    primaryColor: '#552a47',
    secondaryColor: '#8e44ad',
    accentColor: '#9b59b6',
    backgroundColor: '#ffffff',
    textColor: '#2c3e50',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    buttonStyle: 'rounded',
    questionStyle: 'card',
    headerStyle: 'solid',
    templateType: 'custom',
    isActive: true
  });

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
  
  // Calculate pagination
  const indexOfLastTheme = currentPage * themesPerPage;
  const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
  const currentThemes = filteredThemes.slice(indexOfFirstTheme, indexOfLastTheme);
  const totalPages = Math.ceil(filteredThemes.length / themesPerPage);
  
  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of theme gallery
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

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
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #d1d5db',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: 20,
              cursor: 'pointer',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#28211e', marginBottom: 20 }}>Survey Theme</h1>
          
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
          

          {/* Search bar and Add button */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '300px' }}>
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
            
            <button 
              onClick={() => setShowAddThemeModal(true)}
              style={{
                backgroundColor: '#552a47', /* Updated to purple color */
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span style={{ fontSize: 20 }}>+</span> Add Theme
            </button>
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
              {currentThemes.map((theme: Theme) => (
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
          
          {/* Pagination Controls */}
          {filteredThemes.length > themesPerPage && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              margin: '32px 0',
              gap: 8 
            }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5d6c7',
                  backgroundColor: currentPage === 1 ? '#f5f5f4' : '#fff',
                  color: currentPage === 1 ? '#a8a29e' : '#28211e',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 14
                }}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  // Show current page, first and last pages, and pages around current page
                  return pageNum === 1 || 
                         pageNum === totalPages || 
                         (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                })
                .map((pageNum, index, array) => {
                  // Add ellipsis if there are gaps
                  const showEllipsisBefore = index > 0 && pageNum > array[index - 1] + 1;
                  const showEllipsisAfter = index < array.length - 1 && pageNum < array[index + 1] - 1;
                  
                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsisBefore && (
                        <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: '1px solid #e5d6c7',
                          backgroundColor: currentPage === pageNum ? '#552a47' : '#fff',
                          color: currentPage === pageNum ? '#fff' : '#28211e',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: currentPage === pageNum ? 600 : 400
                        }}
                      >
                        {pageNum}
                      </button>
                      
                      {showEllipsisAfter && (
                        <span style={{ margin: '0 4px', color: '#a8a29e' }}>...</span>
                      )}
                    </React.Fragment>
                  );
                })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5d6c7',
                  backgroundColor: currentPage === totalPages ? '#f5f5f4' : '#fff',
                  color: currentPage === totalPages ? '#a8a29e' : '#28211e',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 14
                }}
              >
                Next
              </button>
            </div>
          )}
          
          {/* Theme count info */}
          <div style={{ 
            textAlign: 'center', 
            color: '#78716c', 
            fontSize: 14, 
            marginBottom: 20 
          }}>
            Showing {indexOfFirstTheme + 1}-{Math.min(indexOfLastTheme, filteredThemes.length)} of {filteredThemes.length} themes
          </div>
        </div>
        
        {/* Theme preview modal */}
        {showPreview && previewTheme && <ThemePreview theme={previewTheme} />}
        
        {/* Add Theme Modal */}
        {showAddThemeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 24,
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Create New Theme</h2>
                <button 
                  onClick={() => setShowAddThemeModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Basic Info */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Theme Name*</label>
                  <input 
                    type="text" 
                    value={newTheme.name} 
                    onChange={e => setNewTheme({...newTheme, name: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                    placeholder="Enter theme name"
                    required
                  />
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                  <textarea 
                    value={newTheme.description} 
                    onChange={e => setNewTheme({...newTheme, description: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      height: 100,
                      resize: 'vertical',
                      marginBottom: 16
                    }}
                    placeholder="Enter theme description"
                  />
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Template Type</label>
                  <select
                    value={newTheme.templateType}
                    onChange={e => setNewTheme({...newTheme, templateType: e.target.value as any})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="custom">Custom</option>
                    <option value="corporate">Corporate</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
                
                {/* Colors */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Primary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ 
                      position: 'relative',
                      width: 40,
                      height: 40,
                      marginRight: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid #d1d5db'
                    }}>
                      <input 
                        type="color" 
                        value={newTheme.primaryColor || '#552a47'} 
                        onChange={e => setNewTheme({...newTheme, primaryColor: e.target.value})}
                        style={{ 
                          position: 'absolute',
                          top: -5,
                          left: -5,
                          width: 50, 
                          height: 50, 
                          padding: 0, 
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <input 
                      type="text" 
                      value={newTheme.primaryColor || '#552a47'} 
                      onChange={e => setNewTheme({...newTheme, primaryColor: e.target.value})}
                      style={{ 
                        flex: 1, 
                        padding: '10px 12px', 
                        borderRadius: 8, 
                        border: '1px solid #d1d5db', 
                        fontSize: 16
                      }}
                    />
                  </div>
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Secondary Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ 
                      position: 'relative',
                      width: 40,
                      height: 40,
                      marginRight: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid #d1d5db'
                    }}>
                      <input 
                        type="color" 
                        value={newTheme.secondaryColor || '#8e44ad'} 
                        onChange={e => setNewTheme({...newTheme, secondaryColor: e.target.value})}
                        style={{ 
                          position: 'absolute',
                          top: -5,
                          left: -5,
                          width: 50, 
                          height: 50, 
                          padding: 0, 
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <input 
                      type="text" 
                      value={newTheme.secondaryColor || '#8e44ad'} 
                      onChange={e => setNewTheme({...newTheme, secondaryColor: e.target.value})}
                      style={{ 
                        flex: 1, 
                        padding: '10px 12px', 
                        borderRadius: 8, 
                        border: '1px solid #d1d5db', 
                        fontSize: 16
                      }}
                    />
                  </div>
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ 
                      position: 'relative',
                      width: 40,
                      height: 40,
                      marginRight: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid #d1d5db'
                    }}>
                      <input 
                        type="color" 
                        value={newTheme.accentColor || '#9b59b6'} 
                        onChange={e => setNewTheme({...newTheme, accentColor: e.target.value})}
                        style={{ 
                          position: 'absolute',
                          top: -5,
                          left: -5,
                          width: 50, 
                          height: 50, 
                          padding: 0, 
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <input 
                      type="text" 
                      value={newTheme.accentColor || '#9b59b6'} 
                      onChange={e => setNewTheme({...newTheme, accentColor: e.target.value})}
                      style={{ 
                        flex: 1, 
                        padding: '10px 12px', 
                        borderRadius: 8, 
                        border: '1px solid #d1d5db', 
                        fontSize: 16
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                {/* Fonts and Styles */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Heading Font</label>
                  <select
                    value={newTheme.headingFont}
                    onChange={e => setNewTheme({...newTheme, headingFont: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                  </select>
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Body Font</label>
                  <select
                    value={newTheme.bodyFont}
                    onChange={e => setNewTheme({...newTheme, bodyFont: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                  </select>
                </div>
                
                {/* Layout Options */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Button Style</label>
                  <select
                    value={newTheme.buttonStyle}
                    onChange={e => setNewTheme({...newTheme, buttonStyle: e.target.value as any})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill</option>
                    <option value="square">Square</option>
                  </select>
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Question Style</label>
                  <select
                    value={newTheme.questionStyle}
                    onChange={e => setNewTheme({...newTheme, questionStyle: e.target.value as any})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="card">Card</option>
                    <option value="bordered">Bordered</option>
                    <option value="minimal">Minimal</option>
                  </select>
                  
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Header Style</label>
                  <select
                    value={newTheme.headerStyle}
                    onChange={e => setNewTheme({...newTheme, headerStyle: e.target.value as any})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #d1d5db', 
                      fontSize: 16,
                      marginBottom: 16
                    }}
                  >
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient</option>
                    <option value="accent">Accent</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <button 
                  onClick={() => setShowAddThemeModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: '1px solid #8b5a2b',
                    backgroundColor: '#ffffff',
                    color: '#8b5a2b',
                    fontSize: 16,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Cancel
                </button>
                
                <button 
                  onClick={() => {
                    if (!newTheme.name) {
                      setErrorMessage('Theme name is required');
                      return;
                    }
                    
                    // Set color to match primaryColor if not specified
                    if (!newTheme.color) {
                      newTheme.color = newTheme.primaryColor || '#552a47';
                    }
                    
                    // Insert the new theme
                    Meteor.call('surveyThemes.insert', newTheme, (err: any) => {
                      if (err) {
                        setErrorMessage('Failed to create theme: ' + err.reason);
                      } else {
                        setSuccessMessage('Theme created successfully!');
                        setShowAddThemeModal(false);
                        // Reset the form
                        setNewTheme({
                          name: '',
                          color: '#552a47',
                          description: '',
                          primaryColor: '#552a47',
                          secondaryColor: '#8e44ad',
                          accentColor: '#9b59b6',
                          backgroundColor: '#ffffff',
                          textColor: '#2c3e50',
                          headingFont: 'Inter, sans-serif',
                          bodyFont: 'Inter, sans-serif',
                          buttonStyle: 'rounded',
                          questionStyle: 'card',
                          headerStyle: 'solid',
                          templateType: 'custom',
                          isActive: true
                        });
                      }
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#552a47',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyThemeManager;
