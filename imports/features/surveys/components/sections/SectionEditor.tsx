import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { SurveySectionItem } from '../../types';

interface SectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  section?: SurveySectionItem;
  onSave: (section: SurveySectionItem) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<SurveySectionItem>>({
    name: '',
    description: '',
    isActive: true,
    isRequired: false,
    color: '#552a47',
    priority: 0,
  });
  
  // Reset form data when the modal opens with a new section
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || '',
        description: section.description || '',
        isActive: section.isActive ?? true,
        isRequired: section.isRequired ?? false,
        color: section.color || '#552a47',
        priority: section.priority || 0,
        instructions: section.instructions || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true,
        isRequired: false,
        color: '#552a47',
        priority: 0,
        instructions: '',
      });
    }
  }, [section, isOpen]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return;
    
    const sectionData: SurveySectionItem = {
      id: section?.id || `section_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: formData.name || '',
      description: formData.description || '',
      isActive: formData.isActive ?? true,
      isRequired: formData.isRequired ?? false,
      color: formData.color || '#552a47',
      priority: formData.priority ?? 0,
      instructions: formData.instructions || '',
    };
    
    onSave(sectionData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="question-selector-modal">
      <div className="question-selector-content" style={{ maxWidth: 600 }}>
        <div className="question-selector-header">
          <h3 className="question-selector-title">
            {section ? 'Edit Section' : 'Create New Section'}
          </h3>
          <button 
            className="btn btn-icon btn-secondary"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Section Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter section name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter section description"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Instructions for Respondents</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter instructions for survey respondents"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Section Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                style={{ width: 40, height: 40, padding: 0, border: 'none' }}
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="form-input"
                style={{ width: 120 }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ display: 'flex', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label htmlFor="isActive">Active</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="isRequired"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleInputChange}
              />
              <label htmlFor="isRequired">Required</label>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              style={{ width: 100 }}
            />
          </div>
          
          <div className="question-selector-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              Save Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionEditor;
