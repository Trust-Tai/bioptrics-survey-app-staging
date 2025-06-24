import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from '../../survey-themes/api/surveyThemes';
import { WPSCategories } from '../../wps-framework/api/wpsCategories';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import DashboardBg from '../../../ui/admin/DashboardBg';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

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

function toTheme(theme: any): Theme {
  return {
    ...theme,
    createdAt:
      theme.createdAt instanceof Date
        ? theme.createdAt.toISOString()
        : theme.createdAt,
    assignableTo: theme.assignableTo || ['questions', 'surveys'],
    keywords: theme.keywords || [],
    priority: theme.priority || 0,
    isActive: theme.isActive !== false
  };
}

const SurveyTheme: React.FC = () => {
  // ...existing state...
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; name: string } | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 4000);
  }
  // State declarations...
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('#552a47');
  const [editColor, setEditColor] = useState('#552a47');
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [wpsCategoryId, setWpsCategoryId] = useState('');
  const [editWpsCategoryId, setEditWpsCategoryId] = useState('');
  const [assignableTo, setAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [editAssignableTo, setEditAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(0);
  const [editPriority, setEditPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);
  
  // New theme property states
  const [primaryColor, setPrimaryColor] = useState('#552a47');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#2c3e50');
  const [headingFont, setHeadingFont] = useState('Inter, sans-serif');
  const [bodyFont, setBodyFont] = useState('Inter, sans-serif');
  const [layout, setLayout] = useState('default');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [questionStyle, setQuestionStyle] = useState('card');
  const [headerStyle, setHeaderStyle] = useState('gradient');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [templateType, setTemplateType] = useState('standard');
  const [customCSS, setCustomCSS] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // Handler to add a new theme
  const handleAdd = () => {
    Meteor.call('surveyThemes.insert', {
      name,
      color,
      description,
      wpsCategoryId,
      assignableTo,
      keywords,
      priority,
      isActive,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      headingFont,
      bodyFont,
      layout,
      buttonStyle,
      questionStyle,
      headerStyle,
      backgroundImage,
      templateType,
      customCSS,
      previewImageUrl
    }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#552a47');
        setDescription('');
        setAssignableTo([]);
        setKeywords([]);
        setPriority(0);
        setIsActive(true);
        setPrimaryColor('#552a47');
        setSecondaryColor('#3b82f6');
        setAccentColor('#10b981');
        setBackgroundColor('#ffffff');
        setTextColor('#2c3e50');
        setHeadingFont('Inter, sans-serif');
        setBodyFont('Inter, sans-serif');
        setLayout('default');
        setButtonStyle('rounded');
        setQuestionStyle('card');
        setHeaderStyle('gradient');
        setBackgroundImage('');
        setTemplateType('standard');
        setCustomCSS('');
        setPreviewImageUrl('');
        showSuccess('Theme added successfully!');
        setShowModal(false);
      } else {
        showError('Failed to add theme: ' + err.reason);
      }
    });
  };

  // Handler to start editing a theme
  const startEdit = (theme: Theme) => {
    setEditId(theme._id || null);
    setEditName(theme.name);
    setEditColor(theme.color);
    setEditDescription(theme.description);
    setEditWpsCategoryId(theme.wpsCategoryId || '');
    setEditAssignableTo(theme.assignableTo || []);
    setEditKeywords(theme.keywords || []);
    setEditPriority(theme.priority || 0);
    setEditIsActive(theme.isActive !== false); // Default to true if not specified
    
    // Set new theme property states
    setPrimaryColor(theme.primaryColor || '#552a47');
    setSecondaryColor(theme.secondaryColor || '#3b82f6');
    setAccentColor(theme.accentColor || '#10b981');
    setBackgroundColor(theme.backgroundColor || '#ffffff');
    setTextColor(theme.textColor || '#2c3e50');
    setHeadingFont(theme.headingFont || 'Inter, sans-serif');
    setBodyFont(theme.bodyFont || 'Inter, sans-serif');
    setLayout(theme.layout || 'default');
    setButtonStyle(theme.buttonStyle || 'rounded');
    setQuestionStyle(theme.questionStyle || 'card');
    setHeaderStyle(theme.headerStyle || 'gradient');
    setBackgroundImage(theme.backgroundImage || '');
    setTemplateType(theme.templateType || 'standard');
    setCustomCSS(theme.customCSS || '');
    setPreviewImageUrl(theme.previewImageUrl || '');
  };

  // Handler to update a theme
  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim() || !editWpsCategoryId) return;
    Meteor.call('surveyThemes.update', editId, {
      name: editName,
      color: editColor,
      description: editDescription,
      wpsCategoryId: editWpsCategoryId,
      assignableTo: editAssignableTo,
      keywords: editKeywords,
      priority: editPriority,
      isActive: editIsActive,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      headingFont,
      bodyFont,
      layout,
      buttonStyle,
      questionStyle,
      headerStyle,
      backgroundImage,
      templateType,
      customCSS,
      previewImageUrl
    }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#552a47');
        setEditDescription('');
        setEditWpsCategoryId('');
        setEditAssignableTo([]);
        setEditKeywords([]);
        setEditPriority(0);
        setEditIsActive(true);
        setPrimaryColor('#552a47');
        setSecondaryColor('#3b82f6');
        setAccentColor('#10b981');
        setBackgroundColor('#ffffff');
        setTextColor('#2c3e50');
        setHeadingFont('Inter, sans-serif');
        setBodyFont('Inter, sans-serif');
        setLayout('default');
        setButtonStyle('rounded');
        setQuestionStyle('card');
        setHeaderStyle('gradient');
        setBackgroundImage('');
        setTemplateType('standard');
        setCustomCSS('');
        setPreviewImageUrl('');
        showSuccess('Theme updated successfully!');
      } else {
        showError('Failed to update theme: ' + err.reason);
      }
    });
  };

  // Handler to delete a theme
  const handleDelete = (id: string) => {
    const theme = themes.find((t) => t._id === id);
    if (theme) setConfirmDelete({ _id: id, name: theme.name });
  };

  // Handler to confirm delete theme
  function confirmDeleteTheme() {
    if (!confirmDelete) return;
    Meteor.call('surveyThemes.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete theme: ' + err.reason);
      else showSuccess('Theme deleted successfully!');
      setConfirmDelete(null);
    });
  }

  // Subscribe and fetch from MongoDB
  const subscription = useTracker(() => Meteor.subscribe('surveyThemes.all'), []);
  const wpsCategoriesSub = useTracker(() => Meteor.subscribe('wpsCategories'), []);
  const themes = useTracker(() => {
    return subscription.ready()
      ? SurveyThemes.find({}, { sort: { name: 1 } }).fetch()
      : [];
  }, [subscription]);
  const wpsCategories = useTracker(() => {
    return wpsCategoriesSub.ready()
      ? WPSCategories.find({}, { sort: { name: 1 } }).fetch()
      : [];
  }, [wpsCategoriesSub]);
  useEffect(() => {
    if (subscription.ready()) setLoading(false);
  }, [subscription]);

  // Handler to view a theme
  const handleViewTheme = (theme: Theme) => {
    setViewingTheme(theme);
    setViewModal(true);
  };

  // Handler to close view modal
  const closeViewModal = () => {
    setViewModal(false);
    setViewingTheme(null);
  };

  return (
    <AdminLayout>
      <DashboardBg>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto'}}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Survey Theme</h2>
        {/* Alert message */}
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
            boxShadow: '0 2px 12px #552a4733',
          }}>
            {alert.message}
          </div>
        )}
        {/* Search and Add Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
  <button
    onClick={() => { setShowModal(true); setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}
    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
  >
    <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
    Add
  </button>
  <input
    type="text"
    placeholder="Search themes..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    style={{ height: 44, fontSize: 16, padding: '0 16px', borderRadius: 8, border: '1.5px solid #e5d6c7', minWidth: 220, color: '#28211e', fontWeight: 500, outline: 'none' }}
  />
</div>
        {/* List, Edit, View, and Delete logic for Themes */}
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, width: 700, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Add Theme</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Theme Name
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Theme Name"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                      required
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>WPS Category
                    <select
                      value={wpsCategoryId}
                      onChange={e => setWpsCategoryId(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="">Select WPS Category</option>
                      {wpsCategories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Description of this theme"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }}
                      required
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                      required
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                      placeholder="#552a47"
                      required
                    />
                  </label>
                </div>
                
                {/* Theme Customization Section */}
                <div style={{ gridColumn: '1 / 3', marginTop: 10 }}>
                  <h4 style={{ margin: '0 0 10px 0', fontWeight: 700, color: '#552a47', fontSize: 18 }}>Theme Customization</h4>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Primary Color
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setPrimaryColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Secondary Color
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setSecondaryColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Accent Color
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setAccentColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Background Color
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setBackgroundColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Text Color
                    <input
                      type="color"
                      value={textColor}
                      onChange={e => setTextColor(e.target.value)}
                      style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setTextColor(val);
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Heading Font
                    <select
                      value={headingFont}
                      onChange={e => setHeadingFont(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Body Font
                    <select
                      value={bodyFont}
                      onChange={e => setBodyFont(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Layout Style
                    <select
                      value={layout}
                      onChange={e => setLayout(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="spacious">Spacious</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Button Style
                    <select
                      value={buttonStyle}
                      onChange={e => setButtonStyle(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="rounded">Rounded</option>
                      <option value="pill">Pill</option>
                      <option value="square">Square</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Question Style
                    <select
                      value={questionStyle}
                      onChange={e => setQuestionStyle(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="card">Card</option>
                      <option value="flat">Flat</option>
                      <option value="bordered">Bordered</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Header Style
                    <select
                      value={headerStyle}
                      onChange={e => setHeaderStyle(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="gradient">Gradient</option>
                      <option value="solid">Solid</option>
                      <option value="accent">Accent</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Background Image URL
                    <input
                      type="text"
                      value={backgroundImage}
                      onChange={e => setBackgroundImage(e.target.value)}
                      placeholder="URL to background image (optional)"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Template Type
                    <select
                      value={templateType}
                      onChange={e => setTemplateType(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    >
                      <option value="standard">Standard</option>
                      <option value="corporate">Corporate</option>
                      <option value="modern">Modern</option>
                      <option value="playful">Playful</option>
                      <option value="minimal">Minimal</option>
                      <option value="elegant">Elegant</option>
                    </select>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Custom CSS
                    <textarea
                      value={customCSS}
                      onChange={e => setCustomCSS(e.target.value)}
                      placeholder="Custom CSS rules (optional)"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 80, fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Priority
                    <input
                      type="number"
                      value={priority}
                      onChange={e => setPriority(parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Keywords (comma-separated)
                    <input
                      type="text"
                      value={keywords.join(', ')}
                      onChange={e => setKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                      placeholder="e.g. safety, engagement, leadership"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', marginBottom: 4, display: 'block' }}>Assignable To</label>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assignableTo.includes('questions')}
                        onChange={e => {
                          if (e.target.checked) {
                            setAssignableTo([...assignableTo.filter(a => a !== 'questions'), 'questions']);
                          } else {
                            setAssignableTo(assignableTo.filter(a => a !== 'questions'));
                          }
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      Questions
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assignableTo.includes('surveys')}
                        onChange={e => {
                          if (e.target.checked) {
                            setAssignableTo([...assignableTo.filter(a => a !== 'surveys'), 'surveys']);
                          } else {
                            setAssignableTo(assignableTo.filter(a => a !== 'surveys'));
                          }
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      Surveys
                    </label>
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Active
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Add</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {/* Edit Theme Modal */}
        {editId && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Edit Theme</h3>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Name
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                <input
                  type="text"
                  value={editColor}
                  onChange={e => {
                    const val = e.target.value;
                    setEditColor(val);
                  }}
                  maxLength={7}
                  style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                  placeholder="#552a47"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {/* View Theme Modal */}
        {viewingTheme && viewModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 600, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: viewingTheme.color, fontSize: 24 }}>{viewingTheme.name}</h3>
                <span style={{ 
                  backgroundColor: viewingTheme.isActive !== false ? '#d1e7dd' : '#f8d7da', 
                  color: viewingTheme.isActive !== false ? '#198754' : '#dc3545', 
                  padding: '4px 8px', 
                  borderRadius: 4, 
                  fontSize: 12, 
                  fontWeight: 600 
                }}>
                  {viewingTheme.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 8 }}>{viewingTheme.description || ''}</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 15, color: '#333' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>WPS Category</h4>
                  <div>{wpsCategories.find((cat: any) => cat._id === viewingTheme.wpsCategoryId)?.name || 'None'}</div>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Priority</h4>
                  <div>{viewingTheme.priority || 0}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Assignable To</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('questions') && (
                    <span style={{ backgroundColor: '#e3f2fd', color: '#0d6efd', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Questions</span>
                  )}
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('surveys') && (
                    <span style={{ backgroundColor: '#fff3cd', color: '#fd7e14', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Surveys</span>
                  )}
                  {(!viewingTheme.assignableTo || viewingTheme.assignableTo.length === 0) && (
                    <span style={{ color: '#6c757d' }}>Not specified</span>
                  )}
                </div>
              </div>
              
              {(viewingTheme.keywords && viewingTheme.keywords.length > 0) && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Keywords</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {viewingTheme.keywords.map((keyword, index) => (
                      <span key={index} style={{ backgroundColor: '#f8f9fa', color: '#6c757d', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ fontSize: 13, color: '#8a7a85', marginTop: 8 }}>Created: {new Date(viewingTheme.createdAt || '').toLocaleString()}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button onClick={closeViewModal} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }}>Close</button>
                <button onClick={() => { closeViewModal(); startEdit(viewingTheme); }} style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Edit</button>
              </div>
              
              <button type="button" onClick={closeViewModal} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', fontSize: 22, fontWeight: 700, color: '#28211e', cursor: 'pointer', opacity: 0.5, padding: 0, lineHeight: 1 }} aria-label="Close">×</button>
            </div>
          </div>
        )}
        
        {/* List of themes */}
        {themes.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No themes found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: '24px 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 20, background: '#fffef6', borderRadius: 16 }}>
            {themes.filter(theme => theme.name.toLowerCase().includes(search.toLowerCase())).map(themeData => {
              const theme = toTheme(themeData);
              return (
              <li key={theme._id} style={{ background: '#f9f4f7', borderRadius: 14, boxShadow: '0 2px 8px #f4ebf1', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'inline-block', width: 20, height: 20, background: theme.color, borderRadius: 4, marginRight: 10, border: '1px solid #d2c7b0' }} />
                      <span 
                        style={{ maxWidth: '320px', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-line', display: 'inline-block', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}
                        onClick={() => handleViewTheme(theme)}
                      >
                        {theme.name}
                      </span>
                      {theme.isActive === false && (
                        <span style={{ backgroundColor: '#f8d7da', color: '#dc3545', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Inactive</span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: 15 }}>{theme.description || ''}</p>
                  </div>
                  <div>
                    <button onClick={() => handleViewTheme(theme)} style={{ background: 'none', border: 'none', color: '#3776a8', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 10 }}>View</button>
                    <button onClick={() => startEdit(theme)} style={{ background: 'none', border: 'none', color: '#552a47', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 10 }}>Edit</button>
                    <button onClick={() => handleDelete(theme._id!)} style={{ background: 'none', border: 'none', color: '#c0392b', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Delete</button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 14, color: '#666' }}>
                  {theme.wpsCategoryId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>WPS Category:</span>
                      <span>{wpsCategories.find((cat: any) => cat._id === theme.wpsCategoryId)?.name}</span>
                    </div>
                  )}
                  
                  {theme.assignableTo && theme.assignableTo.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>Assignable to:</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {theme.assignableTo.includes('questions') && (
                          <span style={{ backgroundColor: '#e3f2fd', color: '#0d6efd', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Questions</span>
                        )}
                        {theme.assignableTo.includes('surveys') && (
                          <span style={{ backgroundColor: '#fff3cd', color: '#fd7e14', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Surveys</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {theme.priority !== undefined && theme.priority > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>Priority:</span>
                      <span>{theme.priority}</span>
                    </div>
                  )}
                </div>
                
                {theme.keywords && theme.keywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {theme.keywords.map((keyword, index) => (
                      <span key={index} style={{ backgroundColor: '#f8f9fa', color: '#6c757d', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{keyword}</span>
                    ))}
                  </div>
                )}
              </li>
              );
            })}
          </ul>
        )}
        {/* Delete Theme Modal */}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Delete Theme</h3>
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12, textAlign: 'center' }}>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>{confirmDelete.name}</span>?
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="button" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }} onClick={confirmDeleteTheme}>Confirm</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* View Theme Modal */}
        {viewingTheme && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 160, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Theme Details</h3>
              <div style={{ fontSize: 17, color: '#28211e', fontWeight: 700 }}>{viewingTheme.name}</div>
              <div style={{ fontSize: 15, color: '#28211e', marginBottom: 6 }}>{viewingTheme.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Color:</span>
                <span style={{ display: 'inline-block', width: 24, height: 24, background: viewingTheme.color, borderRadius: 6, border: '1px solid #d2c7b0' }} />
                <span style={{ fontWeight: 500, fontSize: 15, color: '#28211e' }}>{viewingTheme.color}</span>
              </div>
              {viewingTheme.wpsCategoryId && (
                <div style={{ fontSize: 15, color: '#6e395e', marginTop: 4 }}>
                  <span style={{ fontWeight: 600 }}>WPS Category:</span> {wpsCategories.find((cat: any) => cat._id === viewingTheme.wpsCategoryId)?.name || 'N/A'}
                </div>
              )}
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12 }}>{viewingTheme.description}</div>
              <div style={{ fontSize: 13, color: '#8a7a85' }}>Created: {viewingTheme.createdAt ? new Date(viewingTheme.createdAt).toLocaleString() : '-'}</div>
              <button onClick={() => setViewingTheme(null)} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer', marginTop: 14 }}>Close</button>
            </div>
          </div>
        )}
        {/* Edit Theme Modal */}
        {editId && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Edit Theme</h3>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Name
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                <input
                  type="text"
                  value={editColor}
                  onChange={e => {
                    const val = e.target.value;
                    setEditColor(val);
                  }}
                  maxLength={7}
                  style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                  placeholder="#552a47"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyTheme;
