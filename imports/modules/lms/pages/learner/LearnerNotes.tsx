import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { 
  StickyNote, Folder, Edit3, Plus, ArrowLeft, 
  Search, Trash2, Edit2, Save, X, BookOpen
} from 'lucide-react';
import { Courses } from '../../api/courses';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div``;

const BackLink = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  
  &:hover {
    color: #1e3a5f;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
`;

const PageSubtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
`;

const NoteCount = styled.span`
  font-size: 15px;
  color: #9ca3af;
`;

const NewNoteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: #ea580c;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$color};
  }
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CourseCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const CourseIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: #f97316;
  }
`;

const CourseInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CourseName = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CourseNoteCount = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 4px 0;
`;

const CourseLastUpdate = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const NoteBadge = styled.span`
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
`;

// Course Notes View
const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoteCard = styled.div<{ $editing?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: ${props => props.$editing ? '2px solid #f97316' : '1px solid transparent'};
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const NoteInfo = styled.div`
  flex: 1;
`;

const NoteTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const NoteMeta = styled.p`
  font-size: 13px;
  color: #f97316;
  margin: 0;
  
  span {
    color: #9ca3af;
    margin-left: 8px;
  }
`;

const NoteActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$danger ? '#fef2f2' : '#f9fafb'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.$danger ? '#ef4444' : '#6b7280'};
  transition: all 0.15s;
  
  &:hover {
    background: ${props => props.$danger ? '#fee2e2' : '#f3f4f6'};
    color: ${props => props.$danger ? '#dc2626' : '#374151'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const NoteContent = styled.div<{ $editing?: boolean }>`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-wrap;
  
  ${props => props.$editing && `
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px;
  `}
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;

const EditButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$primary ? '#f97316' : 'white'};
  color: ${props => props.$primary ? 'white' : '#374151'};
  border: 1px solid ${props => props.$primary ? '#f97316' : '#e5e7eb'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.$primary ? '#ea580c' : '#f9fafb'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 12px;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 32px;
    height: 32px;
    color: #9ca3af;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  font-size: 16px;
  color: #6b7280;
`;

// New Note Modal
const ModalOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.2s;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalClose = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
`;

export const LearnerNotes: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  
  const [stats, setStats] = useState<any>(null);
  const [courseNotes, setCourseNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', courseId: '' });

  // Fetch published courses for the dropdown
  const { availableCourses } = useTracker(() => {
    Meteor.subscribe('courses.published');
    
    return {
      availableCourses: Courses.find({ status: 'published' }, { sort: { title: 1 } }).fetch(),
    };
  }, []);

  // Fetch notes data
  useEffect(() => {
    setIsLoading(true);
    
    if (courseId) {
      // Fetch notes for specific course
      Meteor.call('notes.getByCourse', courseId, (error: any, result: any) => {
        if (!error) {
          setCourseNotes(result);
        }
        setIsLoading(false);
      });
    } else {
      // Fetch overall stats
      Meteor.call('notes.getStats', (error: any, result: any) => {
        if (!error) {
          setStats(result);
        }
        setIsLoading(false);
      });
    }
  }, [courseId]);

  const handleEditNote = (note: any) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (noteId: string) => {
    Meteor.call('notes.update', noteId, { content: editContent }, (error: any) => {
      if (!error) {
        setCourseNotes(prev => prev.map(n => 
          n._id === noteId ? { ...n, content: editContent, updatedAt: new Date() } : n
        ));
        setEditingNoteId(null);
        setEditContent('');
      }
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      Meteor.call('notes.delete', noteId, (error: any) => {
        if (!error) {
          setCourseNotes(prev => prev.filter(n => n._id !== noteId));
        }
      });
    }
  };

  const handleCreateNote = () => {
    if (!newNote.content.trim() || !newNote.courseId) return;

    Meteor.call('notes.create', {
      courseId: newNote.courseId,
      title: newNote.title,
      content: newNote.content,
    }, (error: any) => {
      if (!error) {
        setShowNewNoteModal(false);
        setNewNote({ title: '', content: '', courseId: '' });
        // Refresh stats or notes
        if (courseId) {
          Meteor.call('notes.getByCourse', courseId, (err: any, result: any) => {
            if (!err) setCourseNotes(result);
          });
        } else {
          Meteor.call('notes.getStats', (err: any, result: any) => {
            if (!err) setStats(result);
          });
        }
      }
    });
  };

  // Filter notes by search query
  const filteredNotes = courseNotes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.topicName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current course info
  const currentCourse = stats?.notesByCourse.find((c: any) => c.courseId === courseId);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState>Loading notes...</LoadingState>
      </PageContainer>
    );
  }

  // Course Notes View
  if (courseId) {
    return (
      <PageContainer>
        <PageHeader>
          <HeaderLeft>
            <BackLink onClick={() => navigate('/admin/lms/learner/notes')}>
              <ArrowLeft size={16} />
              Back to Notes
            </BackLink>
            <PageTitle>{currentCourse?.courseName || 'Course Notes'}</PageTitle>
            <NoteCount>{filteredNotes.length} notes</NoteCount>
          </HeaderLeft>
          <NewNoteButton onClick={() => {
            setNewNote(prev => ({ ...prev, courseId }));
            setShowNewNoteModal(true);
          }}>
            <Plus />
            New Note
          </NewNoteButton>
        </PageHeader>

        {filteredNotes.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <StickyNote />
            </EmptyIcon>
            <EmptyText>No notes for this course yet</EmptyText>
          </EmptyState>
        ) : (
          <NotesList>
            {filteredNotes.map(note => (
              <NoteCard key={note._id} $editing={editingNoteId === note._id}>
                <NoteHeader>
                  <NoteInfo>
                    <NoteTitle>{note.title || 'Untitled Note'}</NoteTitle>
                    <NoteMeta>
                      {note.topicName || 'General'}
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                    </NoteMeta>
                  </NoteInfo>
                  <NoteActions>
                    {editingNoteId === note._id ? (
                      <ActionButton onClick={() => handleSaveEdit(note._id)}>
                        <Save />
                      </ActionButton>
                    ) : (
                      <ActionButton onClick={() => handleEditNote(note)}>
                        <Edit2 />
                      </ActionButton>
                    )}
                    <ActionButton $danger onClick={() => handleDeleteNote(note._id)}>
                      <Trash2 />
                    </ActionButton>
                  </NoteActions>
                </NoteHeader>
                
                {editingNoteId === note._id ? (
                  <>
                    <EditTextarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <EditActions>
                      <EditButton onClick={() => {
                        setEditingNoteId(null);
                        setEditContent('');
                      }}>
                        <X size={16} />
                        Cancel
                      </EditButton>
                      <EditButton $primary onClick={() => handleSaveEdit(note._id)}>
                        <Save size={16} />
                        Save
                      </EditButton>
                    </EditActions>
                  </>
                ) : (
                  <NoteContent>{note.content}</NoteContent>
                )}
              </NoteCard>
            ))}
          </NotesList>
        )}

        {/* New Note Modal */}
        <ModalOverlay $visible={showNewNoteModal} onClick={() => setShowNewNoteModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>New Note</ModalTitle>
              <ModalClose onClick={() => setShowNewNoteModal(false)}>
                <X size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalContent>
              <FormGroup>
                <Label>Title (optional)</Label>
                <Input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Note title"
                />
              </FormGroup>
              <FormGroup>
                <Label>Note Content</Label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your note..."
                />
              </FormGroup>
            </ModalContent>
            <ModalFooter>
              <EditButton onClick={() => setShowNewNoteModal(false)}>Cancel</EditButton>
              <EditButton $primary onClick={handleCreateNote} disabled={!newNote.content.trim()}>
                <Save size={16} />
                Save Note
              </EditButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      </PageContainer>
    );
  }

  // Main Notes Overview
  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>My Notes</PageTitle>
          <PageSubtitle>Quick access to all your course notes</PageSubtitle>
        </HeaderLeft>
        <NewNoteButton onClick={() => setShowNewNoteModal(true)}>
          <Plus />
          New Note
        </NewNoteButton>
      </PageHeader>

      <SearchBar>
        <SearchIcon>
          <Search />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBar>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#f97316">
            <StickyNote />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.totalNotes || 0}</StatValue>
            <StatLabel>Total Notes</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#22c55e">
            <Folder />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.coursesWithNotes || 0}</StatValue>
            <StatLabel>Courses with Notes</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3b82f6">
            <Edit3 />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.updatedToday || 0}</StatValue>
            <StatLabel>Updated Today</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Notes by Course</SectionTitle>
        {stats?.notesByCourse?.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <StickyNote />
            </EmptyIcon>
            <EmptyText>No notes yet. Start taking notes while learning!</EmptyText>
          </EmptyState>
        ) : (
          <CoursesGrid>
            {stats?.notesByCourse
              ?.filter((course: any) => 
                course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((course: any) => (
                <CourseCard
                  key={course.courseId}
                  onClick={() => navigate(`/admin/lms/learner/notes/${course.courseId}`)}
                >
                  <CourseCardHeader>
                    <CourseIcon>
                      <BookOpen />
                    </CourseIcon>
                    <CourseInfo>
                      <CourseName>{course.courseName}</CourseName>
                      <CourseNoteCount>{course.noteCount} note{course.noteCount !== 1 ? 's' : ''}</CourseNoteCount>
                      <CourseLastUpdate>
                        Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                      </CourseLastUpdate>
                    </CourseInfo>
                    <NoteBadge>{course.noteCount}</NoteBadge>
                  </CourseCardHeader>
                </CourseCard>
              ))}
          </CoursesGrid>
        )}
      </Section>

      {/* New Note Modal */}
      <ModalOverlay $visible={showNewNoteModal} onClick={() => setShowNewNoteModal(false)}>
        <Modal onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>New Note</ModalTitle>
            <ModalClose onClick={() => setShowNewNoteModal(false)}>
              <X size={20} />
            </ModalClose>
          </ModalHeader>
          <ModalContent>
            <FormGroup>
              <Label>Course</Label>
              <Select
                value={newNote.courseId}
                onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
              >
                <option value="">Select a course</option>
                {availableCourses.map((course: any) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Title (optional)</Label>
              <Input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title"
              />
            </FormGroup>
            <FormGroup>
              <Label>Note Content</Label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your note..."
              />
            </FormGroup>
          </ModalContent>
          <ModalFooter>
            <EditButton onClick={() => setShowNewNoteModal(false)}>Cancel</EditButton>
            <EditButton 
              $primary 
              onClick={handleCreateNote}
              disabled={!newNote.content.trim() || !newNote.courseId}
            >
              <Save size={16} />
              Save Note
            </EditButton>
          </ModalFooter>
        </Modal>
      </ModalOverlay>
    </PageContainer>
  );
};

export default LearnerNotes;
