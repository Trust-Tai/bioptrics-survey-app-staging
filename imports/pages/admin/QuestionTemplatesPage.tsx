import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import styled from 'styled-components';
import AdminLayout from '../../ui/admin/AdminLayout';
import { QuestionTemplate } from '../../features/questions/api/questionTemplates';

// Styled components for the page
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #552a47;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #552a47;
  font-size: 18px;
`;

const TemplateDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const TemplateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
  margin-bottom: 16px;
`;

const TemplateActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #552a47;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const Button = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #6d3a5d;
  }
`;

const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #552a47;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const DeleteButton = styled.button`
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    background: #b71c1c;
  }
`;

const QuestionTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    setLoading(true);
    Meteor.call('questionTemplates.list', (err: any, res: QuestionTemplate[]) => {
      setLoading(false);
      if (err) {
        console.error('Error fetching templates:', err);
      } else {
        setTemplates(res);
      }
    });
  };

  const handleDeleteTemplate = (id: string) => {
    Meteor.call('questionTemplates.remove', id, (err: any) => {
      if (err) {
        console.error('Error deleting template:', err);
        alert('Failed to delete template');
      } else {
        fetchTemplates();
      }
      setDeleteId(null);
    });
  };

  const handleUseTemplate = (template: QuestionTemplate) => {
    // Navigate to question builder with template data
    navigate('/admin/questions/builder', { 
      state: { 
        templateData: template.questionData 
      } 
    });
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div>
        <PageHeader>
          <Title>Question Templates</Title>
          <SearchContainer>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Search templates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </PageHeader>

        {loading ? (
          <div>Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState>
            <p>No templates found. Create a template by saving a question as a template.</p>
            <Button onClick={() => navigate('/admin/questions/builder')}>
              <FaPlus /> Create New Question
            </Button>
          </EmptyState>
        ) : (
          <TemplatesGrid>
            {filteredTemplates.map(template => (
              <TemplateCard key={template._id}>
                <TemplateTitle>{template.name}</TemplateTitle>
                <TemplateDescription>
                  {template.description || 'No description provided'}
                </TemplateDescription>
                <TemplateInfo>
                  <span>Created: {formatDate(template.createdAt)}</span>
                </TemplateInfo>
                <TemplateActions>
                  <ActionButton 
                    title="Use Template" 
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use
                  </ActionButton>
                  <ActionButton 
                    title="Delete Template" 
                    onClick={() => setDeleteId(template._id || '')}
                  >
                    <FaTrash />
                  </ActionButton>
                </TemplateActions>
              </TemplateCard>
            ))}
          </TemplatesGrid>
        )}

        {deleteId && (
          <DeleteConfirmModal>
            <ModalContent>
              <ModalTitle>Delete Template</ModalTitle>
              <p>Are you sure you want to delete this template? This action cannot be undone.</p>
              <ModalActions>
                <CancelButton onClick={() => setDeleteId(null)}>Cancel</CancelButton>
                <DeleteButton onClick={() => handleDeleteTemplate(deleteId)}>Delete</DeleteButton>
              </ModalActions>
            </ModalContent>
          </DeleteConfirmModal>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuestionTemplatesPage;
