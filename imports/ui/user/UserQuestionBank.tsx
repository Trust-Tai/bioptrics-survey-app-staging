import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

// Data model for a question
interface Question {
  id: string;
  text: string;
  theme: string;
  wpsCategory: string;
  type: 'scale' | 'multiple_choice' | 'open_text';
  choices?: string[];
  active?: boolean;
}

const THEMES = [
  'Engagement',
  'Leadership',
  'Teamwork',
  'Communication',
  'Empowerment',
  'Recognition',
  'Learning',
  'Wellbeing',
];

const WPS_CATEGORIES = [
  'Behavioral Safety',
  'Workplace',
  'Other',
];

const QUESTION_TYPES = [
  { value: 'scale', label: 'Scale (1-5)' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'open_text', label: 'Open Text' },
];

const initialQuestions: Question[] = [
  {
    id: '1',
    text: 'How supported do you feel by your manager?',
    theme: 'Leadership',
    wpsCategory: 'Behavioral Safety',
    type: 'scale',
    active: true,
  },
  {
    id: '2',
    text: 'What improvements would you like to see in your workplace?',
    theme: 'Wellbeing',
    wpsCategory: 'Workplace',
    type: 'open_text',
    active: false,
  },
];

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [wpsFilter, setWpsFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<Question>>({});

  // Filtered questions
  const filtered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesTheme = !themeFilter || q.theme === themeFilter;
    const matchesWps = !wpsFilter || q.wpsCategory === wpsFilter;
    return matchesSearch && matchesTheme && matchesWps;
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({ type: 'scale' });
    setShowModal(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditing(q);
    setForm(q);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(qs => qs.filter(q => q.id !== id));
    }
  };

  const handleFormChange = (field: keyof Question, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (!form.text || !form.theme || !form.wpsCategory || !form.type) {
      alert('Please fill in all required fields.');
      return;
    }
    if (form.type === 'multiple_choice' && (!form.choices || form.choices.length < 2)) {
      alert('Multiple choice questions need at least two choices.');
      return;
    }
    if (editing) {
      setQuestions(qs => qs.map(q => q.id === editing.id ? { ...editing, ...form, id: editing.id } as Question : q));
    } else {
      setQuestions(qs => [
        ...qs,
        { ...form, id: Date.now().toString() } as Question,
      ]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({});
  };

  // For MC choices editing
  const handleChoiceChange = (idx: number, value: string) => {
    setForm(f => ({
      ...f,
      choices: (f.choices || []).map((c, i) => (i === idx ? value : c)),
    }));
  };
  const handleAddChoice = () => {
    setForm(f => ({ ...f, choices: [...(f.choices || []), ''] }));
  };
  const handleRemoveChoice = (idx: number) => {
    setForm(f => ({ ...f, choices: (f.choices || []).filter((_, i) => i !== idx) }));
  };

  return (
    <Container>
      <Header>
        <Title>Question Bank</Title>
        <AddButton onClick={handleOpenAdd}><FaPlus /> Add Question</AddButton>
      </Header>
      <FilterRow>
        <SearchWrapper>
          <FaSearch />
          <SearchInput
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchWrapper>
        <Select value={themeFilter} onChange={e => setThemeFilter(e.target.value)}>
          <option value="">All Themes</option>
          {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
        </Select>
        <Select value={wpsFilter} onChange={e => setWpsFilter(e.target.value)}>
          <option value="">All WPS</option>
          {WPS_CATEGORIES.map(wps => <option key={wps} value={wps}>{wps}</option>)}
        </Select>
      </FilterRow>
      <List>
        {filtered.length === 0 && <Empty>No questions found.</Empty>}
        {filtered.map(q => (
          <Card key={q.id}>
            <CardMain>
              <QuestionText>{q.text.length > 120 ? q.text.slice(0, 120) + '\u2026' : q.text}</QuestionText>
              <TagRow>
                <Tag>{q.theme}</Tag>
                <Tag secondary>{q.wpsCategory}</Tag>
                {q.active && <ActiveTag>Active</ActiveTag>}
              </TagRow>
            </CardMain>
            <CardActions>
              <ActionIcon onClick={() => handleOpenEdit(q)} title="Edit"><FaEdit /></ActionIcon>
              <ActionIcon onClick={() => handleDelete(q.id)} title="Delete"><FaTrash /></ActionIcon>
            </CardActions>
          </Card>
        ))}
      </List>
      {showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{editing ? 'Edit Question' : 'Add Question'}</ModalTitle>
            <ModalForm>
              <Label>Question Text</Label>
              <TextArea
                value={form.text || ''}
                onChange={e => handleFormChange('text', e.target.value)}
                rows={3}
                placeholder="Type the survey question here..."
                required
              />
              <Label>Theme</Label>
              <Select
                value={form.theme || ''}
                onChange={e => handleFormChange('theme', e.target.value)}
                required
              >
                <option value="">Select theme</option>
                {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
              </Select>
              <Label>WPS Category</Label>
              <Select
                value={form.wpsCategory || ''}
                onChange={e => handleFormChange('wpsCategory', e.target.value)}
                required
              >
                <option value="">Select WPS category</option>
                {WPS_CATEGORIES.map(wps => <option key={wps} value={wps}>{wps}</option>)}
              </Select>
              <Label>Question Type</Label>
              <Select
                value={form.type || ''}
                onChange={e => handleFormChange('type', e.target.value)}
                required
              >
                <option value="">Select type</option>
                {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
              {form.type === 'multiple_choice' && (
                <>
                  <Label>Choices</Label>
                  {(form.choices || []).map((choice, idx) => (
                    <ChoiceRow key={idx}>
                      <ChoiceInput
                        value={choice}
                        onChange={e => handleChoiceChange(idx, e.target.value)}
                        placeholder={`Choice ${idx + 1}`}
                        required
                      />
                      <RemoveChoiceBtn type="button" onClick={() => handleRemoveChoice(idx)}>&times;</RemoveChoiceBtn>
                    </ChoiceRow>
                  ))}
                  <AddChoiceBtn type="button" onClick={handleAddChoice}>+ Add Choice</AddChoiceBtn>
                </>
              )}
              <SaveBtn type="button" onClick={handleSave}>Save</SaveBtn>
            </ModalForm>
          </Modal>
        </ModalBackdrop>
      )}
    </Container>
  );
};

// Styled Components (copy from original file as needed)

export default QuestionBank;

