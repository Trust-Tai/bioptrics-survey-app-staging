import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiUsers, 
  FiPlus, 
  FiTrash2, 
  FiMail, 
  FiUpload, 
  FiDownload,
  FiSearch,
  FiCheck,
  FiInfo
} from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

interface ParticipantsStepProps {
  participants: string[];
  onParticipantsChange: (participants: string[]) => void;
  surveyId?: string;
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoBox = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const InfoIcon = styled.div`
  color: #b7a36a;
  font-size: 20px;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #4a5568;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  
  background: ${props => props.primary ? '#b7a36a' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  
  &:hover {
    background: ${props => props.primary ? '#a08e54' : '#f7fafc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ParticipantsTable = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 120px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #4a5568;
  
  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 120px;
  }
`;

const TableRow = styled.div<{ selected?: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 120px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  background: ${props => props.selected ? '#fffcf5' : 'white'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 40px 1fr 120px;
  }
`;

const TableCell = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: white;
  border: 1px solid ${props => props.danger ? '#e53e3e' : '#e2e8f0'};
  color: ${props => props.danger ? '#e53e3e' : '#718096'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.danger ? '#fff5f5' : '#f7fafc'};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #718096;
`;

const AddParticipantModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #718096;
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: #4a5568;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1c1c1c;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const UserSelectList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-top: 8px;
`;

const UserOption = styled.div<{ selected?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.selected ? '#fffcf5' : 'white'};
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #2f855a;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s forwards;
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }
`;

interface Participant {
  _id: string;
  email: string;
  name: string;
  department?: string;
  site?: string;
}

const ParticipantsStep: React.FC<ParticipantsStepProps> = ({ 
  participants, 
  onParticipantsChange,
  surveyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Fake data for participants - in a real app, this would come from a database
  const allParticipants: Participant[] = [
    { _id: '1', email: 'john.doe@bioptrics.com', name: 'John Doe', department: 'Operations', site: 'Rainy River' },
    { _id: '2', email: 'jane.smith@bioptrics.com', name: 'Jane Smith', department: 'HR', site: 'New Afton' },
    { _id: '3', email: 'bob.johnson@bioptrics.com', name: 'Bob Johnson', department: 'Finance', site: 'Corporate' },
    { _id: '4', email: 'alice.williams@bioptrics.com', name: 'Alice Williams', department: 'Operations', site: 'Rainy River' },
    { _id: '5', email: 'charlie.brown@bioptrics.com', name: 'Charlie Brown', department: 'IT', site: 'Corporate' },
  ];
  
  // Filter participants based on search term
  const filteredParticipants = allParticipants.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Get current participants details
  const currentParticipants = allParticipants.filter(p => participants.includes(p._id));
  
  // Toggle participant selection
  const toggleSelection = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };
  
  // Select all participants
  const selectAll = () => {
    if (selectedParticipants.length === currentParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(currentParticipants.map(p => p._id));
    }
  };
  
  // Add a single participant
  const addParticipant = () => {
    // In a real app, this would create a new user or add an existing one
    const newParticipant = {
      _id: `new-${Date.now()}`,
      email: newEmail,
      name: newName,
    };
    
    onParticipantsChange([...participants, newParticipant._id]);
    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    
    showToastMessage('Participant added successfully');
  };
  
  // Add participant from the list
  const addExistingParticipant = (id: string) => {
    if (!participants.includes(id)) {
      onParticipantsChange([...participants, id]);
      showToastMessage('Participant added successfully');
    }
  };
  
  // Remove selected participants
  const removeSelectedParticipants = () => {
    onParticipantsChange(participants.filter(id => !selectedParticipants.includes(id)));
    setSelectedParticipants([]);
    showToastMessage('Participants removed successfully');
  };
  
  // Add bulk participants
  const addBulkParticipants = () => {
    const emails = bulkEmails.split('\n').map(email => email.trim()).filter(email => email);
    
    // In a real app, this would validate and process emails
    // For now, just add them as new participants
    const newIds = emails.map((email, index) => `bulk-${Date.now()}-${index}`);
    
    onParticipantsChange([...participants, ...newIds]);
    setShowBulkModal(false);
    setBulkEmails('');
    
    showToastMessage(`${emails.length} participants added successfully`);
  };
  
  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Send invites to selected participants
  const sendInvites = () => {
    const targetIds = selectedParticipants.length > 0 ? selectedParticipants : participants;
    
    // In a real app, this would send actual emails
    showToastMessage(`Invites sent to ${targetIds.length} participants`);
    setSelectedParticipants([]);
  };
  
  // Export participants list
  const exportParticipants = () => {
    // In a real app, this would generate a CSV or Excel file
    showToastMessage('Participants list exported');
  };
  
  return (
    <Container>
      <InfoBox>
        <InfoIcon>
          <FiInfo />
        </InfoIcon>
        <InfoContent>
          <InfoTitle>Managing Participants</InfoTitle>
          <InfoText>
            Add participants to your survey by email. You can add them individually, upload a list, 
            or select from existing users. Once added, you can send them invitations to complete the survey.
          </InfoText>
        </InfoContent>
      </InfoBox>
      
      <SearchContainer>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput 
          type="text"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      
      <ButtonRow>
        <Button primary onClick={() => setShowAddModal(true)}>
          <FiPlus />
          Add Participant
        </Button>
        <Button onClick={() => setShowBulkModal(true)}>
          <FiUpload />
          Bulk Add
        </Button>
        <Button 
          onClick={sendInvites}
          disabled={participants.length === 0}
        >
          <FiMail />
          Send Invites
        </Button>
        <Button 
          onClick={removeSelectedParticipants}
          disabled={selectedParticipants.length === 0}
        >
          <FiTrash2 />
          Remove Selected
        </Button>
        <Button 
          onClick={exportParticipants}
          disabled={participants.length === 0}
        >
          <FiDownload />
          Export
        </Button>
      </ButtonRow>
      
      <ParticipantsTable>
        <TableHeader>
          <Checkbox 
            type="checkbox"
            checked={selectedParticipants.length === currentParticipants.length && currentParticipants.length > 0}
            onChange={selectAll}
          />
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell></TableCell>
        </TableHeader>
        
        {currentParticipants.length > 0 ? (
          currentParticipants.map(participant => (
            <TableRow 
              key={participant._id}
              selected={selectedParticipants.includes(participant._id)}
            >
              <Checkbox 
                type="checkbox"
                checked={selectedParticipants.includes(participant._id)}
                onChange={() => toggleSelection(participant._id)}
              />
              <TableCell>{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <ActionCell>
                <ActionButton danger onClick={() => onParticipantsChange(participants.filter(id => id !== participant._id))}>
                  <FiTrash2 />
                </ActionButton>
              </ActionCell>
            </TableRow>
          ))
        ) : (
          <EmptyState>
            <FiUsers size={48} style={{ color: '#e2e8f0', marginBottom: '16px' }} />
            <div>No participants added yet.</div>
            <div style={{ marginTop: '8px' }}>Click "Add Participant" to get started.</div>
          </EmptyState>
        )}
      </ParticipantsTable>
      
      {/* Add Participant Modal */}
      {showAddModal && (
        <AddParticipantModal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Participant</ModalTitle>
              <CloseButton onClick={() => setShowAddModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="participant-email">Email</Label>
                <Input 
                  id="participant-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="participant-name">Name</Label>
                <Input 
                  id="participant-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter name"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Or select from existing users:</Label>
                <SearchInput 
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <UserSelectList>
                  {filteredParticipants.map(user => (
                    <UserOption 
                      key={user._id}
                      selected={participants.includes(user._id)}
                      onClick={() => addExistingParticipant(user._id)}
                    >
                      {participants.includes(user._id) && (
                        <FiCheck style={{ color: '#48bb78' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>{user.email}</div>
                      </div>
                    </UserOption>
                  ))}
                </UserSelectList>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button 
                primary 
                onClick={addParticipant}
                disabled={!newEmail || !newName}
              >
                Add Participant
              </Button>
            </ModalFooter>
          </ModalContent>
        </AddParticipantModal>
      )}
      
      {/* Bulk Add Modal */}
      {showBulkModal && (
        <AddParticipantModal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Bulk Add Participants</ModalTitle>
              <CloseButton onClick={() => setShowBulkModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="bulk-emails">Email Addresses</Label>
                <InfoText style={{ marginBottom: '8px' }}>
                  Enter one email address per line. Names will be extracted from email addresses if possible.
                </InfoText>
                <Textarea 
                  id="bulk-emails"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="john.doe@example.com&#10;jane.smith@example.com&#10;..."
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowBulkModal(false)}>Cancel</Button>
              <Button 
                primary 
                onClick={addBulkParticipants}
                disabled={!bulkEmails}
              >
                Add Participants
              </Button>
            </ModalFooter>
          </ModalContent>
        </AddParticipantModal>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <Toast>{toastMessage}</Toast>
      )}
    </Container>
  );
};

export default ParticipantsStep;
