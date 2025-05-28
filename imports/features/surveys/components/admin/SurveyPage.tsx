import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

// Import from layouts
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

// Types
interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// For demo: use localStorage for persistence
function getAllSurveys(): Survey[] {
  try {
    const data = localStorage.getItem('surveys');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSurveys(surveys: Survey[]) {
  localStorage.setItem('surveys', JSON.stringify(surveys));
}

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 8px 16px;
  width: 300px;
  
  svg {
    color: #666;
    margin-right: 8px;
  }
  
  input {
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
    font-size: 14px;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background: #6d3a5d;
  }
`;

const SurveyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const SurveyCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const SurveyTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
`;

const SurveyDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  flex-grow: 1;
`;

const SurveyDate = styled.div`
  color: #999;
  font-size: 12px;
  margin-bottom: 16px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  
  svg {
    color: #666;
  }
  
  &:hover {
    background: #e5e5e5;
    
    svg {
      color: #333;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  width: 500px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #666;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  
  &:hover {
    background: #6d3a5d;
  }
`;

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => {
    setSurveys(getAllSurveys());
  }, []);

  const handleCreateSurvey = () => {
    setEditSurvey(null);
    setForm({ title: '', description: '' });
    setShowModal(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    setEditSurvey(survey);
    setForm({ title: survey.title, description: survey.description });
    setShowModal(true);
  };

  const handleDeleteSurvey = (id: string) => {
    const newSurveys = surveys.filter(survey => survey.id !== id);
    setSurveys(newSurveys);
    saveSurveys(newSurveys);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    let newSurveys: Survey[];
    
    if (editSurvey) {
      newSurveys = surveys.map(s => 
        s.id === editSurvey.id 
          ? { ...s, title: form.title, description: form.description }
          : s
      );
    } else {
      const newSurvey: Survey = {
        id: Date.now().toString(),
        title: form.title,
        description: form.description,
        createdAt: new Date().toISOString(),
      };
      newSurveys = [...surveys, newSurvey];
    }
    
    setSurveys(newSurveys);
    saveSurveys(newSurveys);
    setShowModal(false);
  };

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(search.toLowerCase()) ||
    survey.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>Surveys</Title>
        <div style={{ display: 'flex', gap: '16px' }}>
          <SearchBar>
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search surveys..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchBar>
          <CreateButton onClick={handleCreateSurvey}>
            <FiPlus />
            Create Survey
          </CreateButton>
        </div>
      </Header>
      
      <SurveyGrid>
        {filteredSurveys.map(survey => (
          <SurveyCard key={survey.id}>
            <SurveyTitle>{survey.title}</SurveyTitle>
            <SurveyDescription>{survey.description}</SurveyDescription>
            <SurveyDate>Created: {new Date(survey.createdAt).toLocaleDateString()}</SurveyDate>
            <CardActions>
              <ActionButton onClick={() => navigate(`/admin/surveys/builder/${survey.id}`)}>
                <FiEdit2 />
              </ActionButton>
              <ActionButton onClick={() => handleDeleteSurvey(survey.id)}>
                <FiTrash2 />
              </ActionButton>
            </CardActions>
          </SurveyCard>
        ))}
      </SurveyGrid>
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editSurvey ? 'Edit Survey' : 'Create Survey'}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label>Title</Label>
              <Input 
                type="text" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Enter survey title"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <TextArea 
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Enter survey description"
              />
            </FormGroup>
            
            <SubmitButton onClick={handleSubmit}>
              {editSurvey ? 'Update Survey' : 'Create Survey'}
            </SubmitButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SurveyPage;
