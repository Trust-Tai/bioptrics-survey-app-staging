import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaCheckSquare, FaList, FaFont, FaStar, FaThList, FaSlidersH, FaChartLine } from 'react-icons/fa';
import AdminRichTextRenderer from './AdminRichTextRenderer';

interface QuestionListViewProps {
  questions: any[];
  onPreview: (question: any) => void;
  onAnalytics: (question: any) => void;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  layerMap?: Record<string, string>; // Map of layer IDs to layer names
}

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
  width: 100%;
`;

const QuestionRow = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 10px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
    border-color: #e6e6e6;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(to bottom, #552a47, #7e3d6b);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const CategoryLabel = styled.div`
  background: #f0f7ff;
  color: #2c6ecb;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  display: none; /* Hide the category label as requested */
`;

const AnswerTypeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 10px;
  background: linear-gradient(135deg, #a0cf4e,rgb(164, 229, 51));
  padding: 6px;
  border-radius: 5px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(44, 110, 203, 0.2);
  letter-spacing: 0.3px;
`;

const QuestionContent = styled.div`
  flex: 1;
  min-width: 0; /* Prevents flex item from overflowing */
`;

const QuestionTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.5;
  letter-spacing: -0.2px;
  position: relative;
  padding-left: 8px;
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #666;
  margin-top: 5px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Tag = styled.span`
  background: #f7f7f7;
  color: #555;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
  border: 1px solid #eeeeee;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    border-color: #e0e0e0;
  }
`;

const UsageCount = styled.div`
  font-size: 12px;
  color: #777;
  margin-left: auto;
  display: flex;
  align-items: center;
  background: #fafafa;
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 16px;
`;

const ActionButton = styled.button`
  background: #f9f9f9;
  border: 1px solid #eeeeee;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  }
  
  &.preview {
    color: #552a47;
    &:hover {
      background-color: #f5eef2;
      border-color: #d8c5d0;
      color: #552a47;
    }
  }
  
  &.analytics {
    color: #4a2748;
    &:hover {
      background-color: #f0e6ef;
      border-color: #d4c2d3;
      color: #4a2748;
    }
  }
  
  &.edit {
    color: #2c6ecb;
    &:hover {
      background-color: #eef4fc;
      border-color: #c5d8f0;
      color: #2c6ecb;
    }
  }
  
  &.delete {
    color: #e53935;
    &:hover {
      background-color: #feeeee;
      border-color: #f0c5c5;
      color: #e53935;
    }
  }
`;

const QuestionFooter = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
`;

const StatusIndicator = styled.span<{ active: boolean }>`
  width: 8px;
  height: 8px;
`;

const QuestionListView: React.FC<QuestionListViewProps> = ({ 
  questions, 
  onPreview, 
  onAnalytics,
  onEdit, 
  onDelete,
  layerMap = {}
}) => {
  // Helper function to get tag name from ID
  const getTagName = (tagId: string) => {
    if (!tagId) return '';
    return layerMap[tagId] || tagId;
  };
  
  // Helper function to strip HTML tags and decode HTML entities
  const stripHtml = (html: string) => {
    if (!html) return '';
    // First remove HTML tags
    const textWithoutTags = html.replace(/<[^>]*>/g, '');
    // Then decode HTML entities using a temporary DOM element
    const textarea = document.createElement('textarea');
    textarea.innerHTML = textWithoutTags;
    return textarea.value;
  };

  // Helper function to get answer type icon
  const getAnswerTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkbox':
        return <FaCheckSquare size={14} />;
      case 'radio':
      case 'select':
        return <FaList size={14} />;
      case 'text':
      case 'textarea':
        return <FaFont size={14} />;
      case 'slider':
        return <FaSlidersH size={14} />;
      default:
        return <FaFont size={14} />;
    }
  };

  // Helper function to get answer type label
  const getAnswerTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkbox':
        return 'Checkbox';
      case 'radio':
        return 'Multiple Choice';
      case 'select':
        return 'Dropdown';
      case 'text':
        return 'Text';
      case 'textarea':
        return 'Long Text';
      case 'slider':
        return 'Slider';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Helper function to get latest version of a question
  const getLatestVersion = (question: any) => {
    if (!question.versions || !question.versions.length) return null;
    return question.versions.reduce((latest: any, current: any) => {
      return (!latest || current.version > latest.version) ? current : latest;
    }, null);
  };
  
  return (
    <ListContainer>
      {questions.map((question) => {
        const latestVersion = getLatestVersion(question);
        if (!latestVersion) return null;
        
        const questionText = stripHtml(latestVersion.questionText);
        const usageCount = latestVersion.usageCount || 0;
        
        return (
          <QuestionRow key={question._id}>
            <QuestionHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <AnswerTypeDisplay>
                  {getAnswerTypeIcon(latestVersion.responseType || 'text')}
                  {getAnswerTypeLabel(latestVersion.responseType || 'text')}
                </AnswerTypeDisplay>
                
                {/* Tags moved here from below */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {latestVersion.labels && latestVersion.labels.length > 0 && (
                    <>
                      {latestVersion.labels.slice(0, 3).map((tag: string, index: number) => (
                        <Tag key={index}>{getTagName(tag)}</Tag>
                      ))}
                      {latestVersion.labels.length > 3 && (
                        <Tag>+{latestVersion.labels.length - 3}</Tag>
                      )}
                    </>
                  )}
                  {(!latestVersion.labels || latestVersion.labels.length === 0) && latestVersion.categoryTags && latestVersion.categoryTags.length > 0 && (
                    <>
                      {latestVersion.categoryTags.slice(0, 3).map((tag: string, index: number) => (
                        <Tag key={index}>{getTagName(tag)}</Tag>
                      ))}
                      {latestVersion.categoryTags.length > 3 && (
                        <Tag>+{latestVersion.categoryTags.length - 3}</Tag>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <ActionButtons>
                <ActionButton 
                  className="preview" 
                  onClick={() => onPreview(question)}
                  title="Preview"
                >
                  <FaEye size={16} />
                </ActionButton>
                
                <ActionButton 
                  className="analytics" 
                  onClick={() => onAnalytics(question)}
                  title="Analytics"
                >
                  <FaChartLine size={16} />
                </ActionButton>
                
                <ActionButton 
                  className="edit" 
                  onClick={() => onEdit(question._id)}
                  title="Edit"
                >
                  <FaEdit size={16} />
                </ActionButton>
                
                <ActionButton 
                  className="delete" 
                  onClick={() => onDelete(question._id)}
                  title="Delete"
                >
                  <FaTrash size={16} />
                </ActionButton>

              </ActionButtons>
            </QuestionHeader>
            
            <QuestionTitle>
              {questionText}
            </QuestionTitle>
            
            {/* QuestionMeta removed from here as tags were moved to the header */}
            
            <QuestionFooter>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {latestVersion.isActive !== false && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontSize: '12px',
                    color: '#4caf50',
                    background: '#f1f8e9',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: '1px solid #dcedc8'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4caf50' 
                    }} />
                    Active
                  </div>
                )}
                <UsageCount>
                  Used {usageCount} {usageCount === 1 ? 'time' : 'times'}
                </UsageCount>
              </div>
            </QuestionFooter>
          </QuestionRow>
        );
      })}
      
      {questions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
          No questions found matching your criteria.
        </div>
      )}
    </ListContainer>
  );
};

export default QuestionListView;
