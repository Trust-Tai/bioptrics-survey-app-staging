import React from 'react';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

const QuestionTags: React.FC = () => {
  return (
    <AdminLayout>
      <div style={{ padding: '40px', background: '#fff8ee', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px', color: '#28211e' }}>Question Tags</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: '#552a47', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 700, 
              padding: '0 22px', 
              fontSize: '16px', 
              height: '44px', 
              cursor: 'pointer' 
            }}
          >
            <span style={{ fontSize: '20px', marginRight: '2px' }}>+</span>
            Add
          </button>
          <input
            type="text"
            placeholder="Search tags..."
            style={{ 
              height: '44px', 
              fontSize: '16px', 
              padding: '0 16px', 
              borderRadius: '8px', 
              border: '1.5px solid #e5d6c7', 
              minWidth: '220px', 
              color: '#28211e', 
              fontWeight: 500, 
              outline: 'none', 
              background: '#fff' 
            }}
          />
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px'
        }}>
          {/* Sample tag cards */}
          {['Important', 'Technical', 'Management', 'Entry Level', 'Advanced', 'Optional'].map(tag => (
            <div key={tag} style={{ 
              background: '#fff', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
              border: '1px solid #f0e6d9' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: tag === 'Important' ? '#e74c3c' : 
                              tag === 'Technical' ? '#3498db' : 
                              tag === 'Management' ? '#2ecc71' : 
                              tag === 'Entry Level' ? '#f39c12' : 
                              tag === 'Advanced' ? '#9b59b6' : '#95a5a6'
                }} />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{tag}</h3>
              </div>
              <p style={{ 
                margin: '0 0 16px', 
                fontSize: 15, 
                lineHeight: 1.5, 
                color: '#555'
              }}>
                {tag === 'Important' ? 'Questions that are critical for the survey.' :
                 tag === 'Technical' ? 'Questions related to technical aspects.' :
                 tag === 'Management' ? 'Questions targeting management roles.' :
                 tag === 'Entry Level' ? 'Questions suitable for entry-level employees.' :
                 tag === 'Advanced' ? 'Advanced questions for experienced employees.' :
                 'Questions that can be skipped.'}
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button style={{ 
                  padding: '6px 12px', 
                  background: '#f5f5f5', 
                  color: '#333', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  fontSize: 14 
                }}>
                  View
                </button>
                <button style={{ 
                  padding: '6px 12px', 
                  background: '#552a47', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  fontSize: 14 
                }}>
                  Edit
                </button>
                <button style={{ 
                  padding: '6px 12px', 
                  background: '#e74c3c', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  fontSize: 14 
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuestionTags;
