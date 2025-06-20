import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { QuestionItem } from '../../types';
import RichTextRenderer from './RichTextRenderer';

interface QuestionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  selectedQuestionIds: string[];
  sectionId: string;
  onSelectQuestions: (questionIds: string[], sectionId: string) => void;
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  isOpen,
  onClose,
  questions,
  selectedQuestionIds,
  sectionId,
  onSelectQuestions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedQuestionIds);
  const [filters, setFilters] = useState({
    type: 'all',
  });
  
  // Reset selected IDs when the modal opens with new selectedQuestionIds
  useEffect(() => {
    setSelectedIds(selectedQuestionIds);
  }, [selectedQuestionIds, isOpen]);
  
  // Filter questions based on search query and filters
  const filteredQuestions = questions.filter(question => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      question.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by question type
    const matchesType = filters.type === 'all' || question.type === filters.type;
    
    return matchesSearch && matchesType;
  });
  
  // Toggle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedIds(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  // Handle filter change
  const handleFilterChange = (filterType: 'type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };
  
  // Handle saving selected questions
  const handleSave = () => {
    onSelectQuestions(selectedIds, sectionId);
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Get unique question types for filter options
  const questionTypes = Array.from(new Set(questions.map(q => q.type)));
  
  return (
    <div className="question-selector-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="question-selector-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="question-selector-header" style={{
          padding: '16px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#552a47',
          color: 'white',
          borderRadius: '8px 8px 8px 8px'
        }}>
          <h3 className="question-selector-title" style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: 'white'
          }}>Select Questions</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX />
          </button>
        </div>
        
        {/* Filters and Search in one row */}
        <div className="question-selector-filters-search" style={{
          padding: '12px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
          alignItems: 'center'
        }}>
          {/* Type Filter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'nowrap',
            minWidth: '200px'
          }}>
            <strong style={{ fontSize: '15px', color: '#444', whiteSpace: 'nowrap' }}>Type:</strong>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'nowrap',
              overflow: 'auto'
            }}>
              <button
                className={filters.type === 'all' ? 'active' : ''}
                onClick={() => handleFilterChange('type', 'all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: filters.type === 'all' ? '#552a47' : '#f5f5f5',
                  color: filters.type === 'all' ? 'white' : '#333',
                  fontSize: '14px',
                  fontWeight: filters.type === 'all' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                All
              </button>
              {questionTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('type', type)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: filters.type === type ? '#552a47' : '#f5f5f5',
                    color: filters.type === type ? 'white' : '#333',
                    fontSize: '14px',
                    fontWeight: filters.type === type ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Bar */}
          <div style={{ 
            position: 'relative', 
            flex: 1,
            minWidth: '200px'
          }}>
            <FiSearch style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#888',
              fontSize: '16px'
            }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%',
                padding: '8px 12px 8px 40px',
                fontSize: '15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#552a47';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(85, 42, 71, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        
        {/* Question List */}
        <div className="question-selector-list" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
          backgroundColor: '#fafafa'
        }}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                onClick={() => toggleQuestionSelection(question.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 24px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedIds.includes(question.id) ? 'rgba(85, 42, 71, 0.05)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!selectedIds.includes(question.id)) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!selectedIds.includes(question.id)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  marginTop: '2px'
                }}>
                  {selectedIds.includes(question.id) ? (
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: '#552a47',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <FiCheck size={14} />
                    </div>
                  ) : (
                    <div style={{
                      width: 20,
                      height: 20,
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      backgroundColor: 'white'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#333',
                    marginBottom: '4px',
                    lineHeight: 1.4
                  }}>
                    <RichTextRenderer content={question.text} />
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      backgroundColor: '#f0f0f0',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>{question.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiSearch size={24} />
              No questions found matching your filters.
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: 'white',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: '#f5f5f5',
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#eaeaea';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#552a47',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6a3459';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#552a47';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Add Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
