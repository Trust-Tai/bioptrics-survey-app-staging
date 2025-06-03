import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Question } from '/imports/features/questions/api/questions.methods.client';

interface Template {
  _id: string;
  name: string;
  description?: string;
  questionData: Question;
}

interface QuestionTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: Template) => void;
}

const QuestionTemplatesModal: React.FC<QuestionTemplatesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Meteor.call('questionTemplates.list', (err: any, res: Template[]) => {
        setLoading(false);
        if (!err) setTemplates(res);
      });
    }
  }, [isOpen]);

  return isOpen ? (
    <div className="modal-bg">
      <div className="modal-card">
        <h3>Import Question Template</h3>
        <button className="close-btn" onClick={onClose}>×</button>
        {loading ? <div>Loading templates...</div> : (
          <ul style={{ maxHeight: 300, overflow: 'auto', margin: 0, padding: 0 }}>
            {templates.length === 0 && <li>No templates found.</li>}
            {templates.map(t => (
              <li key={t._id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', padding: 8 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                {t.description && <div style={{ fontSize: 13, color: '#666' }}>{t.description}</div>}
                <button style={{ marginTop: 6 }} onClick={() => onImport(t)}>Import</button>
              </li>
            ))}
          </ul>
        )}
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

export default QuestionTemplatesModal;
