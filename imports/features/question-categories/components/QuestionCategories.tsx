import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { QuestionCategories } from '../api/questionCategories';
import DashboardBg from '/imports/ui/admin/DashboardBg';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface Category {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date | string;
}

const QuestionCategoriesComponent: React.FC = () => {
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
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Subscribe and fetch from MongoDB
  const categories = useTracker(() => {
    console.log('Subscribing to questionCategories');
    const subscription = Meteor.subscribe('questionCategories');
    console.log('Subscription status:', subscription.ready());
    if (subscription.ready()) {
      setLoading(false);
      const results = QuestionCategories.find({}, { sort: { name: 1 } }).fetch();
      console.log('Found categories:', results.length);
      return results;
    }
    return [];
  }, []);

  // Seed initial categories if not present
  React.useEffect(() => {
    if (!loading && categories.length === 0) {
      const initialCategories = [
        {
          name: 'Technical',
          description: 'Questions related to technical skills and knowledge.'
        },
        {
          name: 'Soft Skills',
          description: 'Questions about communication, teamwork, and interpersonal skills.'
        },
        {
          name: 'Leadership',
          description: 'Questions targeting leadership abilities and experience.'
        },
        {
          name: 'Industry Knowledge',
          description: 'Questions about industry-specific knowledge and trends.'
        },
        {
          name: 'Problem Solving',
          description: 'Questions that assess problem-solving abilities.'
        },
        {
          name: 'Cultural Fit',
          description: 'Questions to evaluate cultural alignment with the organization.'
        }
      ];
      // Helper to generate a random pastel color
      function randomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 60%, 80%)`;
      }
      initialCategories.forEach(category => {
        Meteor.call('questionCategories.insert', {
          name: category.name,
          color: randomColor(),
          description: category.description
        });
      });
    }
  }, [loading, categories]);


  const handleAdd = () => {
    if (!name.trim() || !description.trim()) {
      showError('Please fill in all required fields.');
      return;
    }
    Meteor.call('questionCategories.insert', { name, color, description }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#552a47');
        setDescription('');
        showSuccess('Category added successfully!');
        setShowModal(false);
      } else {
        showError('Failed to add category: ' + err.reason);
      }
    });
  };

  // Filter categories by search
  const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    const category = categories.find(c => c._id === id);
    if (category) setConfirmDelete({ _id: id, name: category.name });
  };

  function confirmDeleteCategory() {
    if (!confirmDelete) return;
    Meteor.call('questionCategories.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete category: ' + err.reason);
      else showSuccess('Category deleted successfully!');
      setConfirmDelete(null);
    });
  }

  const startEdit = (category: Category) => {
    setEditId(category._id!);
    setEditName(category.name);
    setEditColor(category.color || '#552a47');
    setEditDescription(category.description || '');
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim()) return;
    Meteor.call('questionCategories.update', editId, { name: editName, color: editColor, description: editDescription }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#552a47');
        setEditDescription('');
        showSuccess('Category updated successfully!');
      } else {
        showError('Failed to update category: ' + err.reason);
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
        <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>Question Categories</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => { setShowModal(true); setName(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
          >
            <FaPlus style={{ fontSize: 16 }} />
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
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 170, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Add Category</h3>
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
                placeholder="Category description"
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
                  Add Category
                </button>
              </div>
            </form>
          </div>
        )}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#e74c3c', fontSize: 22 }}>Confirm Delete</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Are you sure you want to delete the category <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{ padding: '8px 16px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  style={{ padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {viewingCategory && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 500, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Category Details</h3>
                <button
                  onClick={() => setViewingCategory(null)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}
                >
                  <FaTimes />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: viewingCategory.color }} />
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{viewingCategory.name}</h4>
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{viewingCategory.description}</p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { startEdit(viewingCategory); setViewingCategory(null); }}
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
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666' }}>Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666' }}>
              {search ? `No categories found matching "${search}"` : 'No categories found. Create your first category!'}
            </div>
          ) : (
            filteredCategories.map(category => (
              <div key={category._id} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0e6d9' }}>
                {editId === category._id ? (
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
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: category.color }} />
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{category.name}</h3>
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: '#555', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {category.description}
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setViewingCategory(category)}
                        style={{ padding: '6px 12px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => startEdit(category)}
                        style={{ padding: '6px 12px', background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id!)}
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

export default QuestionCategoriesComponent;
