import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { WPSCategories } from '/imports/api/wpsCategories';
import AdminLayout from './AdminLayout';

interface Category {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: string;
}

const WPSFramework: React.FC = () => {
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
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('#b0802b');
  const [editColor, setEditColor] = useState('#b0802b');
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Subscribe and fetch from MongoDB
  const categories = useTracker(() => {
    const subscription = Meteor.subscribe('wpsCategories');
    if (subscription.ready()) {
      setLoading(false);
      return WPSCategories.find({}, { sort: { name: 1 } }).fetch();
    }
    return [];
  }, []);

  // Seed initial WPS Framework categories if not present
  React.useEffect(() => {
    if (!loading && categories.length === 0) {
      const frameworks = [
        {
          name: 'Behavior Safety',
          description: 'Promotes safe actions and habits in the workplace.'
        },
        {
          name: 'Workplace Safety',
          description: 'Ensures a secure and hazard-free work environment.'
        },
        {
          name: 'Knowledge Equity',
          description: 'Fosters equal access to knowledge and learning.'
        },
        {
          name: 'Well-Being Safety',
          description: 'Supports physical, mental, and emotional well-being.'
        },
        {
          name: 'Built Environment Safety',
          description: 'Focuses on safety in the physical and built environment.'
        },
        {
          name: 'Inclusion Safety',
          description: 'Encourages a culture of belonging and respect for all.'
        }
      ];
      // Helper to generate a random pastel color
      function randomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 60%, 80%)`;
      }
      frameworks.forEach(fw => {
        Meteor.call('wpsCategories.insert', {
          name: fw.name,
          color: randomColor(),
          description: fw.description
        });
      });
    }
  }, [loading, categories]);


  const handleAdd = () => {
    if (!name.trim() || !description.trim()) {
      showError('Please fill in all required fields.');
      return;
    }
    Meteor.call('wpsCategories.insert', { name, color, description }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#b0802b');
        setDescription('');
        showSuccess('Category added successfully!');
        setShowModal(false);
      } else {
        showError('Failed to add category: ' + err.reason);
      }
    });
  };

  // Filter categories by search
  const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    const cat = categories.find(c => c._id === id);
    if (cat) setConfirmDelete({ _id: id, name: cat.name });
  };

  function confirmDeleteCategory() {
    if (!confirmDelete) return;
    Meteor.call('wpsCategories.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete category: ' + err.reason);
      else showSuccess('Category deleted successfully!');
      setConfirmDelete(null);
    });
  }

  const startEdit = (cat: Category) => {
    setEditId(cat._id!);
    setEditName(cat.name);
    setEditColor(cat.color || '#b0802b');
    setEditDescription(cat.description || '');
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim()) return;
    Meteor.call('wpsCategories.update', editId, { name: editName, color: editColor, description: editDescription }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#b0802b');
        setEditDescription('');
        showSuccess('Category updated successfully!');
      } else {
        showError('Failed to update category: ' + err.reason);
      }
    });
  };


  return (
    <AdminLayout>
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
        }}>{alert.message}</div>
      )}
      <div style={{ width: '100%', padding: '32px 32px 32px 32px', background: '#fff8ee', borderRadius: 0, minHeight: '100vh', boxSizing: 'border-box' }}>
        <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>WPS Framework</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => { setShowModal(true); setName(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
            Add
          </button>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: 44, fontSize: 16, padding: '0 16px', borderRadius: 8, border: '1.5px solid #e5d6c7', minWidth: 220, color: '#28211e', fontWeight: 500, outline: 'none', background: '#fff' }}
          />
        </div>
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 170, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Add Category</h3>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Category name"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                required
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                required
              />
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
                  placeholder="#b0802b"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Add</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )} 
        {filteredCategories.length === 0 ? (
          <div style={{ color: '#b3a08a', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No categories found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: '24px 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 20, background: '#fffef6', borderRadius: 16 }}>
            {filteredCategories.map(cat => (
              <li key={cat._id} style={{ background: '#fffbe9', borderRadius: 14, boxShadow: '0 2px 8px #f4e6c1', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ flex: 1, fontSize: 17, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, maxWidth: '100%' }}>
                    <span style={{ display: 'inline-block', width: 20, height: 20, background: cat.color, borderRadius: 4, marginRight: 10, border: '1px solid #d2c7b0' }} />
                    <span style={{
                      maxWidth: '320px',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line',
                      display: 'inline-block',
                    }}>{cat.name}</span>
                  </span>
                </span>
                <button onClick={() => setViewingCategory(cat)} style={{ marginLeft: 8, background: '#3776a8', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15, padding: '6px 14px', cursor: 'pointer' }}>View</button>
                <button onClick={() => startEdit(cat)} style={{ marginLeft: 8, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15, padding: '6px 14px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(cat._id!)}
                style={{ marginLeft: 8, background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15, padding: '6px 14px', cursor: 'pointer' }}>
                  Delete
                </button>  
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* View Category Modal */}
      {/* Delete Category Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Delete Category</h3>
            <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12, textAlign: 'center' }}>
              Are you sure you want to delete <span style={{ fontWeight: 700 }}>{confirmDelete.name}</span>?
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              <button type="button" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }} onClick={confirmDeleteCategory}>Confirm</button>
              <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {viewingCategory && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: viewingCategory.color, fontSize: 22 }}>{viewingCategory.name}</h3>
            <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12 }}>{viewingCategory.description}</div>
            <div style={{ fontSize: 13, color: '#b3a08a' }}>Created: {viewingCategory.createdAt ? new Date(viewingCategory.createdAt).toLocaleString() : '-'}</div>
            <button onClick={() => setViewingCategory(null)} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer', marginTop: 14 }}>Close</button>
          </div>
        </div>
      )}
      {/* Edit Category Modal */}
      {editId && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Edit Category</h3>
            <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Name
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }} required />
            </label>
            <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }} required />
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
                placeholder="#b0802b"
                required
              />
            </label>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              <button type="submit" style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
              <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#b0802b'); setEditDescription(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
  </AdminLayout>
);
};

export default WPSFramework;
