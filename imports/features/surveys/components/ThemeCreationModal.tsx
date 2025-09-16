import React from 'react';
import { Meteor } from 'meteor/meteor';

interface ThemeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newThemeName: string;
  setNewThemeName: (v: string) => void;
  newThemeColor: string;
  setNewThemeColor: (v: string) => void;
  newThemeSecondaryColor: string;
  setNewThemeSecondaryColor: (v: string) => void;
  newThemeAccentColor: string;
  setNewThemeAccentColor: (v: string) => void;
  newThemeDescription: string;
  setNewThemeDescription: (v: string) => void;
  newThemeIsActive: boolean;
  setNewThemeIsActive: (v: boolean) => void;
  newThemeTemplateType: string;
  setNewThemeTemplateType: (v: string) => void;
  newThemeHeadingFont: string;
  setNewThemeHeadingFont: (v: string) => void;
  newThemeBodyFont: string;
  setNewThemeBodyFont: (v: string) => void;
  newThemeButtonStyle: string;
  setNewThemeButtonStyle: (v: string) => void;
  newThemeQuestionStyle: string;
  setNewThemeQuestionStyle: (v: string) => void;
  newThemeHeaderStyle: string;
  setNewThemeHeaderStyle: (v: string) => void;
  setAlert: (v: { type: 'success' | 'error'; message: string } | null) => void;
  setHasUnsavedChanges: (v: boolean) => void;
  triggerAutoSave: () => void;
}

const ThemeCreationModal: React.FC<ThemeCreationModalProps> = ({
  isOpen,
  onClose,
  newThemeName,
  setNewThemeName,
  newThemeColor,
  setNewThemeColor,
  newThemeSecondaryColor,
  setNewThemeSecondaryColor,
  newThemeAccentColor,
  setNewThemeAccentColor,
  newThemeDescription,
  setNewThemeDescription,
  newThemeIsActive,
  setNewThemeIsActive,
  newThemeTemplateType,
  setNewThemeTemplateType,
  newThemeHeadingFont,
  setNewThemeHeadingFont,
  newThemeBodyFont,
  setNewThemeBodyFont,
  newThemeButtonStyle,
  setNewThemeButtonStyle,
  newThemeQuestionStyle,
  setNewThemeQuestionStyle,
  newThemeHeaderStyle,
  setNewThemeHeaderStyle,
  setAlert,
  setHasUnsavedChanges,
  triggerAutoSave,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.35)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!newThemeName) {
            setAlert({ type: 'error', message: 'Theme name is required' });
            return;
          }
          Meteor.call('surveyThemes.insert', {
            name: newThemeName,
            color: newThemeColor,
            secondaryColor: newThemeSecondaryColor,
            accentColor: newThemeAccentColor,
            description: newThemeDescription,
            isActive: newThemeIsActive,
            templateType: newThemeTemplateType,
            headingFont: newThemeHeadingFont,
            bodyFont: newThemeBodyFont,
            buttonStyle: newThemeButtonStyle,
            questionStyle: newThemeQuestionStyle,
            headerStyle: newThemeHeaderStyle
          }, (error: Error | null) => {
            if (error) {
              setAlert({ type: 'error', message: error.message });
            } else {
              setAlert({ type: 'success', message: 'Theme created successfully' });
              setNewThemeName('');
              setNewThemeColor('#552a47');
              setNewThemeSecondaryColor('#8e44ad');
              setNewThemeAccentColor('#9b59b6');
              setNewThemeDescription('');
              setNewThemeIsActive(true);
              setNewThemeTemplateType('Custom');
              setNewThemeHeadingFont('Inter');
              setNewThemeBodyFont('Inter');
              setNewThemeButtonStyle('Rounded');
              setNewThemeQuestionStyle('Card');
              setNewThemeHeaderStyle('Solid');
              onClose();
            }
          });
        }}
        style={{ background: '#fff', borderRadius: 24, padding: 32, width: 800, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(85,42,71,0.2)', display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', border: '1px solid rgba(85,42,71,0.08)', animation: 'slideUp 0.3s ease-out' }}
      >
        <button 
          type="button" 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#28211e', opacity: 0.5, padding: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#28211e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#28211e', margin: 0, marginBottom: 8 }}>Create New Theme</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 20 }}>
          <div>
            <label htmlFor="themeName" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Theme Name*</label>
            <input
              id="themeName"
              type="text"
              value={newThemeName}
              onChange={(e) => {
                setNewThemeName(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              placeholder="Enter theme name"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
              required
            />
          </div>
          <div>
            <label htmlFor="themeColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Primary Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="themeColor"
                type="color"
                value={newThemeColor}
                onChange={(e) => {
                  setNewThemeColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={newThemeColor}
                onChange={(e) => {
                  setNewThemeColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                placeholder="#552a47"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="themeSecondaryColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Secondary Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="themeSecondaryColor"
                type="color"
                value={newThemeSecondaryColor}
                onChange={(e) => {
                  setNewThemeSecondaryColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={newThemeSecondaryColor}
                onChange={(e) => {
                  setNewThemeSecondaryColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                placeholder="#8e44ad"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="themeAccentColor" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="themeAccentColor"
                type="color"
                value={newThemeAccentColor}
                onChange={(e) => {
                  setNewThemeAccentColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                style={{ width: 42, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={newThemeAccentColor}
                onChange={(e) => {
                  setNewThemeAccentColor(e.target.value);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
                placeholder="#9b59b6"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="themeDescription" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Description</label>
            <textarea
              id="themeDescription"
              value={newThemeDescription}
              onChange={(e) => {
                setNewThemeDescription(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              placeholder="Enter theme description"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, minHeight: 80, resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="themeTemplateType" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Template Type</label>
            <select
              id="themeTemplateType"
              value={newThemeTemplateType}
              onChange={(e) => {
                setNewThemeTemplateType(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Custom">Custom</option>
              <option value="Standard">Standard</option>
              <option value="Modern">Modern</option>
            </select>
          </div>
          <div>
            <label htmlFor="themeHeadingFont" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Heading Font</label>
            <select
              id="themeHeadingFont"
              value={newThemeHeadingFont}
              onChange={(e) => {
                setNewThemeHeadingFont(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
          <div>
            <label htmlFor="themeBodyFont" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Body Font</label>
            <select
              id="themeBodyFont"
              value={newThemeBodyFont}
              onChange={(e) => {
                setNewThemeBodyFont(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
            </select>
          </div>
          <div>
            <label htmlFor="themeButtonStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Button Style</label>
            <select
              id="themeButtonStyle"
              value={newThemeButtonStyle}
              onChange={(e) => {
                setNewThemeButtonStyle(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Rounded">Rounded</option>
              <option value="Square">Square</option>
              <option value="Pill">Pill</option>
            </select>
          </div>
          <div>
            <label htmlFor="themeQuestionStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Question Style</label>
            <select
              id="themeQuestionStyle"
              value={newThemeQuestionStyle}
              onChange={(e) => {
                setNewThemeQuestionStyle(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Card">Card</option>
              <option value="Minimal">Minimal</option>
              <option value="Outlined">Outlined</option>
            </select>
          </div>
          <div>
            <label htmlFor="themeHeaderStyle" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#475569' }}>Header Style</label>
            <select
              id="themeHeaderStyle"
              value={newThemeHeaderStyle}
              onChange={(e) => {
                setNewThemeHeaderStyle(e.target.value);
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, backgroundColor: '#fff' }}
            >
              <option value="Solid">Solid</option>
              <option value="Gradient">Gradient</option>
              <option value="Transparent">Transparent</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#552a47', color: '#fff', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}
          >
            Create Theme
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeCreationModal;




