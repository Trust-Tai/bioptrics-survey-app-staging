import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Question } from '/imports/features/questions/api/questions.methods.client';
import { QuestionTemplates } from '/imports/features/questions/api/questionTemplates';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSuccess: () => void;
}

const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({ isOpen, onClose, question, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Subscribe to question templates
  useEffect(() => {
    if (isOpen) {
      const subscription = Meteor.subscribe('questionTemplates.all', {
        onReady: () => setIsSubscribed(true),
        onError: (error: Meteor.Error) => {
          console.error('Error subscribing to question templates:', error);
          setError('Failed to load templates');
        }
      });
      
      return () => {
        subscription.stop();
        setIsSubscribed(false);
      };
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }
    setSaving(true);
    Meteor.call('questionTemplates.insert', {
      name,
      description,
      questionData: question,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
    }, (err: any) => {
      setSaving(false);
      if (err) setError(err.reason || 'Failed to save template');
      else {
        setName('');
        setDescription('');
        setError(null);
        onSuccess();
        onClose();
      }
    });
  };

  return isOpen ? (
    <div className="modal-bg">
      <div className="modal-card">
        <h3>Save as Template</h3>
        <button className="close-btn" onClick={onClose}>×</button>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Template Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 6, marginTop: 4, marginBottom: 8 }} />
          <label style={{ display: 'block', fontWeight: 600 }}>Description <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 6, marginTop: 4, minHeight: 48 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button onClick={handleSave} disabled={saving} style={{ background: '#552a47', color: '#fff', padding: '7px 18px', border: 'none', borderRadius: 4, fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
      <style>{`
        .modal-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: #fff; padding: 24px 28px; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); min-width: 320px; max-width: 400px; position: relative; }
        .close-btn { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: #552a47; }
        .close-btn:hover { color: #a85e8e; }
      `}</style>
    </div>
  ) : null;
};

export default SaveAsTemplateModal;