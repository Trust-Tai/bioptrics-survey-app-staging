import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { QuestionItem } from '../../types';

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
    status: 'all',
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
    
    // Filter by question status
    const matchesStatus = filters.status === 'all' || question.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
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
    <div className="question-selector-modal">
      <div className="question-selector-content">
        <div className="question-selector-header">
          <h3 className="question-selector-title">Select Questions</h3>
          <button 
            className="btn btn-icon btn-secondary"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>
        
        <div className="question-selector-search">
          <div style={{ position: 'relative', width: '100%' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#888' }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>
        
        <div className="question-selector-filters">
          <div>
            <strong>Type:</strong>
            <div className="question-selector-filters">
              <button
                className={`question-selector-filter ${filters.type === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'all')}
              >
                All
              </button>
              {questionTypes.map(type => (
                <button
                  key={type}
                  className={`question-selector-filter ${filters.type === type ? 'active' : ''}`}
                  onClick={() => handleFilterChange('type', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <strong>Status:</strong>
            <div className="question-selector-filters">
              <button
                className={`question-selector-filter ${filters.status === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'all')}
              >
                All
              </button>
              <button
                className={`question-selector-filter ${filters.status === 'published' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'published')}
              >
                Published
              </button>
              <button
                className={`question-selector-filter ${filters.status === 'draft' ? 'active' : ''}`}
                onClick={() => handleFilterChange('status', 'draft')}
              >
                Draft
              </button>
            </div>
          </div>
        </div>
        
        <div className="question-selector-list">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(question => (
              <div
                key={question.id}
                className={`question-selector-item ${selectedIds.includes(question.id) ? 'selected' : ''}`}
                onClick={() => toggleQuestionSelection(question.id)}
              >
                <div className="question-selector-checkbox">
                  {selectedIds.includes(question.id) ? (
                    <FiCheck style={{ color: '#552a47' }} />
                  ) : (
                    <div style={{ width: 16, height: 16, border: '1px solid #ccc', borderRadius: 4 }} />
                  )}
                </div>
                <div className="question-selector-info">
                  <div className="question-selector-title">
                    {question.text.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, '')}
                  </div>
                  <div className="question-selector-type">
                    {question.type} • {question.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              No questions found matching your filters.
            </div>
          )}
        </div>
        
        <div className="question-selector-actions">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
          >
            Add Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
