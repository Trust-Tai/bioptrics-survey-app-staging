import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaSlidersH, FaTrash, FaSpinner, FaFilePdf, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { Meteor } from 'meteor/meteor';
import { generateQuestionReportPDF } from '../../services/QuestionReportPDF';

interface EditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDoNotRemindAgain: () => void;
  responseCount: number;
  questionId: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 8px;
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    padding: 16px;
    margin: 8px 0;
    max-height: calc(100vh - 16px);
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text, #333);
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const WarningSection = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid var(--color-primary, #542A46);
  color: var(--color-text, #333);
  font-size: 14px;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 13px;
    margin-bottom: 12px;
  }
`;

const ExportLink = styled.a`
  color: var(--color-primary, #542A46);
  text-decoration: none;
  display: inline-block;
  margin-top: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  &.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .spinner {
    display: inline-block;
    margin-right: 5px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const NotificationOverlay = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  max-width: 300px;
  animation: slideIn 0.3s ease-out forwards;
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const SuccessNotification = styled(NotificationOverlay)`
  border-left: 4px solid #4caf50;
`;

const NotificationContent = styled.div`
  flex: 1;
  margin: 0 10px;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: #666;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
  }
`;

const OptionSection = styled.div<{ highlighted?: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 6px;
  background-color: ${props => props.highlighted ? '#fff8e1' : '#f8f9fa'};
  border-left: ${props => props.highlighted ? '4px solid #ffc107' : '4px solid transparent'};
  
  @media (max-width: 480px) {
    padding: 10px;
    margin-bottom: 12px;
  }
`;

const OptionIcon = styled.div`
  margin-right: 12px;
  color: var(--color-primary, #542A46);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--color-text, #333);
`;

const OptionDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    margin-top: 16px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    flex: 1;
    font-size: 14px;
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 1px solid #ddd;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ContinueButton = styled(Button)`
  background: var(--color-primary, #542A46);
  color: white;
  border: none;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary, #542A46) 85%, black);
  }
`;

const EditWarningModal: React.FC<EditWarningModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onDoNotRemindAgain,
  responseCount,
  questionId
}) => {
  const [doNotRemind, setDoNotRemind] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ 
    show: false, 
    message: '' 
  });
  
  if (!isOpen) return null;
  
  const handleContinue = () => {
    if (doNotRemind) {
      onDoNotRemindAgain();
    }
    onContinue();
  };
  
  const handleExportResults = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (exporting || !questionId) return;
    
    try {
      setExporting(true);
      
      // Call the server method to get question response data
      const data = await Meteor.callAsync('questions.exportResponseData', questionId);
      
      // Generate PDF report using the data
      console.log('Exporting data for question:', questionId);
      
      // Generate and download the PDF directly
      const success = await generateQuestionReportPDF(data);
      
      if (success) {
        // Show success message using styled notification
        setNotification({
          show: true,
          message: 'Question response data exported successfully!'
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '' });
        }, 5000);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting question results:', error);
      alert('Failed to export results. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <>
      {notification.show && (
        <SuccessNotification>
          <FaCheckCircle size={20} color="#4caf50" />
          <NotificationContent>
            <NotificationTitle>Success</NotificationTitle>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationContent>
          <CloseButton onClick={() => setNotification({ show: false, message: '' })}>
            <FaTimes size={16} />
          </CloseButton>
        </SuccessNotification>
      )}
      <ModalOverlay>
        <ModalContainer>
        <ModalHeader>Edit</ModalHeader>
        
        <ModalBody>
          <WarningSection>
            Editing may affect the results because you have collected responses already ({responseCount} {responseCount === 1 ? 'response' : 'responses'}).
            Before editing, you can export results.
            <div>
              <ExportLink 
                href="#" 
                onClick={handleExportResults}
                className={exporting ? 'loading' : ''}
              >
                {exporting ? (
                  <>
                    <span className="spinner"><FaSpinner size={12} /></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaFilePdf style={{ marginRight: '5px' }} />
                    Export as PDF
                  </>
                )}
              </ExportLink>
            </div>
          </WarningSection>
          
          <OptionSection>
            <OptionIcon>
              <FaEdit />
            </OptionIcon>
            <OptionContent>
              <OptionTitle>Edit text:</OptionTitle>
              <OptionDescription>
                Fixing typos won't affect the results.
              </OptionDescription>
            </OptionContent>
          </OptionSection>
          
          <OptionSection highlighted>
            <OptionIcon>
              <FaPlus />
            </OptionIcon>
            <OptionContent>
              <OptionTitle>Add choice:</OptionTitle>
              <OptionDescription>
                Results can be inaccurate because there is no collected response to your
                newly added choice.
              </OptionDescription>
            </OptionContent>
          </OptionSection>
          
          <OptionSection highlighted>
            <OptionIcon>
              <FaSlidersH />
            </OptionIcon>
            <OptionContent>
              <OptionTitle>Change score range of a rating scale:</OptionTitle>
              <OptionDescription>
                Extending a score range can lead to inaccurate results because there
                aren't collected responses to the extended scores. Narrowing it down will
                delete relevant results of the narrowed scores.
              </OptionDescription>
            </OptionContent>
          </OptionSection>
          
          <OptionSection highlighted>
            <OptionIcon>
              <FaTrash />
            </OptionIcon>
            <OptionContent>
              <OptionTitle>Delete questions or options:</OptionTitle>
              <OptionDescription>
                You will also delete relevant results to these questions/options.
              </OptionDescription>
            </OptionContent>
          </OptionSection>
        </ModalBody>
        
        <ModalFooter>
          <CheckboxLabel>
            <input 
              type="checkbox" 
              checked={doNotRemind} 
              onChange={() => setDoNotRemind(!doNotRemind)}
              style={{ marginRight: '8px' }}
            />
            Do not remind me again
          </CheckboxLabel>
          
          <ButtonGroup>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <ContinueButton onClick={handleContinue}>Continue</ContinueButton>
          </ButtonGroup>
        </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </>
  );
};

export default EditWarningModal;
