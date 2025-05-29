import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { QuestionTags } from '../api/questionTags';
import DashboardBg from '/imports/ui/admin/DashboardBg';
// Removed AdminLayout import as it's now in the parent component

interface Tag {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date | string;
}

const QuestionTagsComponent: React.FC = () => {
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
  // State declarations
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('#552a47');
  const [editColor, setEditColor] = useState('#552a47');
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingTag, setViewingTag] = useState<Tag | null>(null);

  // Subscribe and fetch from MongoDB
  const tags = useTracker(() => {
    console.log('Subscribing to questionTags');
    const subscription = Meteor.subscribe('questionTags');
    console.log('Subscription status:', subscription.ready());
    if (subscription.ready()) {
      setLoading(false);
      const results = QuestionTags.find({}, { sort: { name: 1 } }).fetch();
      console.log('Found tags:', results.length);
      return results;
    }
    return [];
  }, []);

  // Seed initial tags if not present
  React.useEffect(() => {
    if (!loading && tags.length === 0) {
      const initialTags = [
        {
          name: 'Important',
          description: 'Questions that are critical for the survey.'
        },
        {
          name: 'Optional',
          description: 'Questions that can be skipped.'
        },
        {
          name: 'Technical',
          description: 'Questions related to technical aspects.'
        },
        {
          name: 'Management',
          description: 'Questions targeting management roles.'
        },
        {
          name: 'Entry Level',
          description: 'Questions suitable for entry-level employees.'
        },
        {
          name: 'Advanced',
          description: 'Advanced questions for experienced employees.'
        }
      ];
      // Helper to generate a random pastel color
      function randomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 60%, 80%)`;
      }
      initialTags.forEach(tag => {
        Meteor.call('questionTags.insert', {
          name: tag.name,
          color: randomColor(),
          description: tag.description
        });
      });
    }
  }, [loading, tags]);


  const handleAdd = () => {
    if (!name.trim() || !description.trim()) {
      showError('Please fill in all required fields.');
      return;
    }
    Meteor.call('questionTags.insert', { name, color, description }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#552a47');
        setDescription('');
        showSuccess('Tag added successfully!');
        setShowModal(false);
      } else {
        showError('Failed to add tag: ' + err.reason);
      }
    });
  };

  // Filter tags by search
  const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    const tag = tags.find(t => t._id === id);
    if (tag) setConfirmDelete({ _id: id, name: tag.name });
  };

  function confirmDeleteTag() {
    if (!confirmDelete) return;
    Meteor.call('questionTags.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete tag: ' + err.reason);
      else showSuccess('Tag deleted successfully!');
      setConfirmDelete(null);
    });
  }

  const startEdit = (tag: Tag) => {
    setEditId(tag._id!);
    setEditName(tag.name);
    setEditColor(tag.color || '#552a47');
    setEditDescription(tag.description || '');
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim()) return;
    Meteor.call('questionTags.update', editId, { name: editName, color: editColor, description: editDescription }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#552a47');
        setEditDescription('');
        showSuccess('Tag updated successfully!');
      } else {
        showError('Failed to update tag: ' + err.reason);
      }
    });
  };


  return (
    <div>
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
        }}>{alert.message}</div>
      )}
      <DashboardBg>
        <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>Question Tags</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => { setShowModal(true); setName(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
            Add
          </button>
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: 44, fontSize: 16, padding: '0 16px', borderRadius: 8, border: '1.5px solid #e5d6c7', minWidth: 220, color: '#28211e', fontWeight: 500, outline: 'none', background: '#fff' }}
          />
        </div>
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 170, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Add Tag</h3>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tag name"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                required
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tag description"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box', minHeight: 80, resize: 'vertical', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                required
              />
              <div style={{ marginTop: 4 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 15 }}>Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: '100%', height: 40, padding: 0, border: '1.5px solid #e5d6c7', borderRadius: 8, cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        )}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#e74c3c', fontSize: 22 }}>Confirm Delete</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Are you sure you want to delete the tag <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTag}
                  style={{ padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {viewingTag && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 500, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Tag Details</h3>
                <button
                  onClick={() => setViewingTag(null)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: viewingTag.color }} />
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{viewingTag.name}</h4>
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{viewingTag.description}</p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { startEdit(viewingTag); setViewingTag(null); }}
                  style={{ padding: '8px 16px', background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666' }}>Loading tags...</div>
          ) : filteredTags.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666' }}>
              {search ? `No tags found matching "${search}"` : 'No tags found. Create your first tag!'}
            </div>
          ) : (
            filteredTags.map(tag => (
              <div key={tag._id} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0e6d9' }}>
                {editId === tag._id ? (
                  // Edit mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                      required
                    />
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }}
                      required
                    />
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 15 }}>Color</label>
                      <input
                        type="color"
                        value={editColor}
                        onChange={e => setEditColor(e.target.value)}
                        style={{ width: '100%', height: 40, padding: 0, border: '1.5px solid #e5d6c7', borderRadius: 8, cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditId(null)}
                        style={{ padding: '6px 12px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        style={{ padding: '6px 12px', background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: tag.color }} />
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{tag.name}</h3>
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: '#555', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tag.description}
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setViewingTag(tag)}
                        style={{ padding: '6px 12px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => startEdit(tag)}
                        style={{ padding: '6px 12px', background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tag._id!)}
                        style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </DashboardBg>
    </div>
  );
};

export default QuestionTagsComponent;
