import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';

// Import from features
import { Goals, GoalDoc } from '../../api/goals';

// Import from layouts
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

// Import from shared components
import { DashboardBg } from '/imports/shared/components';

// Extend the GoalDoc interface with additional fields for the survey goals feature
interface SurveyGoal extends Omit<GoalDoc, 'createdAt'> {
  createdAt: string;
  targetValue?: number;
  currentValue?: number;
  startDate?: string;
  endDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  metrics?: string[];
  relatedSurveys?: string[];
  department?: string;
  site?: string;
}

const DEFAULT_GOALS: Omit<SurveyGoal, '_id' | 'createdAt'>[] = [
  { 
    title: 'Engagement', 
    description: 'Increase employee engagement', 
    color: '#6a5acd',
    targetValue: 85,
    currentValue: 72,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Survey Participation Rate', 'Engagement Score'],
    relatedSurveys: ['Quarterly Pulse', 'Annual Engagement'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Leadership', 
    description: 'Develop leadership skills and culture', 
    color: '#2e8b57',
    targetValue: 80,
    currentValue: 65,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Leadership Effectiveness Score', 'Manager Feedback Rating'],
    relatedSurveys: ['Leadership Assessment', 'Manager Feedback'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Wellbeing', 
    description: 'Improve employee wellbeing and work-life balance', 
    color: '#ff7f50',
    targetValue: 75,
    currentValue: 60,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Wellbeing Score', 'Work-Life Balance Rating'],
    relatedSurveys: ['Wellbeing Survey', 'Work-Life Balance Assessment'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Communication', 
    description: 'Enhance internal communication', 
    color: '#4682b4',
    targetValue: 90,
    currentValue: 68,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Communication Effectiveness', 'Information Flow Rating'],
    relatedSurveys: ['Communication Survey', 'Quarterly Pulse'],
    department: 'All',
    site: 'All'
  }
];

// Styled components
const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.primary ? '#4a6cf7' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#4a6cf7' : '#ddd'};
  
  &:hover {
    background-color: ${props => props.primary ? '#3a5ce5' : '#f5f5f5'};
  }
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const GoalCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const GoalHeader = styled.div<{ color: string }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #333;
    position: relative;
    padding-left: 16px;
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${props => props.color};
    }
  }
`;

const GoalDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const GoalMeta = styled.div`
  margin-top: 16px;
  font-size: 13px;
  color: #777;
`;

const MetaItem = styled.div`
  display: flex;
  margin-bottom: 8px;
  
  strong {
    min-width: 100px;
    font-weight: 500;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Tag = styled.span`
  background: #f0f0f0;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  color: #555;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a6cf7;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a6cf7;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a6cf7;
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ColorOption = styled.div<{ color: string; selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#333' : 'transparent'};
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 80px;
`;

const TagInputItem = styled.div`
  background: #f0f0f0;
  border-radius: 12px;
  padding: 4px 24px 4px 10px;
  font-size: 12px;
  color: #555;
  position: relative;
  
  button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 12px;
    color: #999;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    
    &:hover {
      color: #555;
    }
  }
`;

const TagInputField = styled.input`
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
`;

// Progress bar component for goal tracking
const GoalProgressBar: React.FC<{ currentValue?: number; targetValue?: number; color: string }> = ({ 
  currentValue = 0, 
  targetValue = 100,
  color 
}) => {
  const percentage = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
  
  return (
    <ProgressContainer>
      <ProgressBar style={{ width: `${percentage}%`, backgroundColor: color }} />
      <ProgressText>
        {currentValue} / {targetValue} ({percentage.toFixed(0)}%)
      </ProgressText>
    </ProgressContainer>
  );
};

const ProgressContainer = styled.div`
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  margin: 10px 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #333;
`;

// Status badge component
const StatusBadge: React.FC<{ status?: 'not_started' | 'in_progress' | 'completed' | 'overdue' }> = ({ 
  status = 'not_started' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'not_started': return '#6c757d';
      case 'in_progress': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };
  
  return (
    <Badge style={{ backgroundColor: getStatusColor() }}>
      {getStatusText()}
    </Badge>
  );
};

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
`;

const SurveyGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<SurveyGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SurveyGoal | null>(null);
  const [formData, setFormData] = useState<Omit<SurveyGoal, '_id' | 'createdAt'>>({
    title: '',
    description: '',
    color: '#4a6cf7',
    targetValue: 100,
    currentValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'not_started',
    metrics: [],
    relatedSurveys: [],
    department: 'All',
    site: 'All'
  });
  const [newMetric, setNewMetric] = useState('');
  const [newSurvey, setNewSurvey] = useState('');
  
  // Color options for goals
  const colorOptions = [
    '#4a6cf7', // Blue
    '#6a5acd', // Purple
    '#2e8b57', // Green
    '#ff7f50', // Coral
    '#4682b4', // Steel Blue
    '#d63384', // Pink
    '#fd7e14', // Orange
    '#6f42c1', // Indigo
    '#20c997', // Teal
    '#dc3545'  // Red
  ];
  
  // Fetch goals from database
  const { isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('goals');
    const loading = !subscription.ready();
    
    if (!loading) {
      const fetchedGoals = Goals.find({}, { sort: { createdAt: -1 } }).fetch();
      // Convert Date objects to strings for the UI
      const formattedGoals = fetchedGoals.map(goal => ({
        ...goal,
        createdAt: goal.createdAt.toISOString()
      }));
      setGoals(formattedGoals);
    }
    
    return { isLoading: loading };
  }, []);
  
  // Initialize with default goals if none exist
  useEffect(() => {
    if (!isLoading && goals.length === 0) {
      // Check if we should add default goals
      Meteor.call('goals.countAll', (error: Error, count: number) => {
        if (!error && count === 0) {
          // Add default goals
          DEFAULT_GOALS.forEach(goal => {
            Meteor.call('goals.insert', {
              ...goal,
              createdAt: new Date().toISOString()
            });
          });
        }
      });
    }
  }, [isLoading, goals]);
  
  const handleOpenModal = (goal: SurveyGoal | null = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        color: goal.color,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        startDate: goal.startDate,
        endDate: goal.endDate,
        status: goal.status,
        metrics: goal.metrics || [],
        relatedSurveys: goal.relatedSurveys || [],
        department: goal.department,
        site: goal.site
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        color: '#4a6cf7',
        targetValue: 100,
        currentValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'not_started',
        metrics: [],
        relatedSurveys: [],
        department: 'All',
        site: 'All'
      });
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };
  
  const handleAddMetric = () => {
    if (newMetric.trim() && !formData.metrics?.includes(newMetric.trim())) {
      setFormData(prev => ({
        ...prev,
        metrics: [...(prev.metrics || []), newMetric.trim()]
      }));
      setNewMetric('');
    }
  };
  
  const handleRemoveMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics?.filter(m => m !== metric)
    }));
  };
  
  const handleAddSurvey = () => {
    if (newSurvey.trim() && !formData.relatedSurveys?.includes(newSurvey.trim())) {
      setFormData(prev => ({
        ...prev,
        relatedSurveys: [...(prev.relatedSurveys || []), newSurvey.trim()]
      }));
      setNewSurvey('');
    }
  };
  
  const handleRemoveSurvey = (survey: string) => {
    setFormData(prev => ({
      ...prev,
      relatedSurveys: prev.relatedSurveys?.filter(s => s !== survey)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal?._id) {
      // Update existing goal
      Meteor.call('goals.update', editingGoal._id, {
        ...formData
      }, (error: Error) => {
        if (error) {
          console.error('Error updating goal:', error);
          alert('Error updating goal. Please try again.');
        } else {
          handleCloseModal();
        }
      });
    } else {
      // Create new goal
      Meteor.call('goals.insert', {
        ...formData,
        createdAt: new Date().toISOString()
      }, (error: Error) => {
        if (error) {
          console.error('Error creating goal:', error);
          alert('Error creating goal. Please try again.');
        } else {
          handleCloseModal();
        }
      });
    }
  };
  
  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      Meteor.call('goals.remove', goalId, (error: Error) => {
        if (error) {
          console.error('Error deleting goal:', error);
          alert('Error deleting goal. Please try again.');
        }
      });
    }
  };
  
  return (
    <AdminLayout>
      <DashboardBg />
      <Container>
        <Header>
          <Title>Survey Goals</Title>
          <ButtonGroup>
            <Button onClick={() => handleOpenModal()}>Add New Goal</Button>
          </ButtonGroup>
        </Header>
        
        {isLoading ? (
          <div>Loading goals...</div>
        ) : (
          <GoalsGrid>
            {goals.map(goal => (
              <GoalCard key={goal._id}>
                <GoalHeader color={goal.color}>
                  <h3>{goal.title}</h3>
                  <StatusBadge status={goal.status} />
                </GoalHeader>
                <GoalDescription>{goal.description}</GoalDescription>
                
                {goal.targetValue && (
                  <GoalProgressBar 
                    currentValue={goal.currentValue} 
                    targetValue={goal.targetValue} 
                    color={goal.color} 
                  />
                )}
                
                <GoalMeta>
                  {goal.startDate && goal.endDate && (
                    <MetaItem>
                      <strong>Timeline:</strong> 
                      <span>{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</span>
                    </MetaItem>
                  )}
                  
                  {goal.department && (
                    <MetaItem>
                      <strong>Department:</strong> 
                      <span>{goal.department}</span>
                    </MetaItem>
                  )}
                  
                  {goal.site && (
                    <MetaItem>
                      <strong>Site:</strong> 
                      <span>{goal.site}</span>
                    </MetaItem>
                  )}
                </GoalMeta>
                
                {goal.metrics && goal.metrics.length > 0 && (
                  <>
                    <strong>Metrics:</strong>
                    <TagsContainer>
                      {goal.metrics.map((metric, index) => (
                        <Tag key={index}>{metric}</Tag>
                      ))}
                    </TagsContainer>
                  </>
                )}
                
                {goal.relatedSurveys && goal.relatedSurveys.length > 0 && (
                  <>
                    <strong>Related Surveys:</strong>
                    <TagsContainer>
                      {goal.relatedSurveys.map((survey, index) => (
                        <Tag key={index}>{survey}</Tag>
                      ))}
                    </TagsContainer>
                  </>
                )}
                
                <ButtonGroup style={{ marginTop: '16px' }}>
                  <Button onClick={() => handleOpenModal(goal)}>Edit</Button>
                  <Button onClick={() => goal._id && handleDeleteGoal(goal._id)}>Delete</Button>
                </ButtonGroup>
              </GoalCard>
            ))}
          </GoalsGrid>
        )}
        
        {/* Goal Form Modal */}
        {showModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h2>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
                <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
              </ModalHeader>
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="description">Description</Label>
                  <TextArea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Color</Label>
                  <ColorPicker>
                    {colorOptions.map(color => (
                      <ColorOption 
                        key={color} 
                        color={color} 
                        selected={formData.color === color} 
                        onClick={() => handleColorSelect(color)} 
                      />
                    ))}
                  </ColorPicker>
                </FormGroup>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input 
                      type="number" 
                      id="targetValue" 
                      name="targetValue" 
                      value={formData.targetValue} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input 
                      type="number" 
                      id="currentValue" 
                      name="currentValue" 
                      value={formData.currentValue} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input 
                      type="date" 
                      id="startDate" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      type="date" 
                      id="endDate" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                </div>
                
                <FormGroup>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    id="status" 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </FormGroup>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      type="text" 
                      id="department" 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="site">Site</Label>
                    <Input 
                      type="text" 
                      id="site" 
                      name="site" 
                      value={formData.site} 
                      onChange={handleInputChange} 
                    />
                  </FormGroup>
                </div>
                
                <FormGroup>
                  <Label>Metrics</Label>
                  <TagInput>
                    {formData.metrics?.map((metric, index) => (
                      <TagInputItem key={index}>
                        {metric}
                        <button type="button" onClick={() => handleRemoveMetric(metric)}>×</button>
                      </TagInputItem>
                    ))}
                    <TagInputField 
                      type="text" 
                      value={newMetric} 
                      onChange={e => setNewMetric(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMetric())} 
                      placeholder="Add metric..." 
                    />
                  </TagInput>
                </FormGroup>
                
                <FormGroup>
                  <Label>Related Surveys</Label>
                  <TagInput>
                    {formData.relatedSurveys?.map((survey, index) => (
                      <TagInputItem key={index}>
                        {survey}
                        <button type="button" onClick={() => handleRemoveSurvey(survey)}>×</button>
                      </TagInputItem>
                    ))}
                    <TagInputField 
                      type="text" 
                      value={newSurvey} 
                      onChange={e => setNewSurvey(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSurvey())} 
                      placeholder="Add survey..." 
                    />
                  </TagInput>
                </FormGroup>
                
                <ButtonGroup style={{ marginTop: '16px' }}>
                  <Button type="submit" primary>{editingGoal ? 'Update Goal' : 'Create Goal'}</Button>
                  <Button type="button" onClick={handleCloseModal}>Cancel</Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

export default SurveyGoalsPage;
