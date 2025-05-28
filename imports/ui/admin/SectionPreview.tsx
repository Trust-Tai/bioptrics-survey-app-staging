import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiChevronLeft, FiChevronRight, FiCheck, FiClock, FiBarChart2, FiUsers, FiActivity, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { SurveySectionItem } from './SurveySections';

// Styled components for the section preview
const PreviewContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 32px;
`;

const PreviewHeader = styled.div<{ bgColor?: string, textColor?: string }>`
  background: ${props => props.bgColor || '#f9f4f8'};
  color: ${props => props.textColor || '#333'};
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
`;

const PreviewTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const PreviewBody = styled.div<{ bgColor?: string, textColor?: string }>`
  padding: 24px;
  background: ${props => props.bgColor || '#fff'};
  color: ${props => props.textColor || '#333'};
  min-height: 300px;
`;

const PreviewInstructions = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  font-style: italic;
`;

const PreviewFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
`;

const PreviewButton = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#552a47' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#6a3659' : '#f5f5f5'};
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number, accentColor?: string }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.accentColor || '#552a47'};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const TimeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const PlaceholderQuestion = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
  margin-bottom: 16px;
  border: 1px dashed #ddd;
`;

const QuestionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AnswerOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Radio = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 50%;
`;

interface SectionPreviewProps {
  section: SurveySectionItem;
  totalSections: number;
  currentSectionIndex: number;
  onNext?: () => void;
  onPrevious?: () => void;
  analytics?: {
    avgCompletionTime?: number; // in seconds
    responseRate?: number; // percentage
    dropoffRate?: number; // percentage
    avgRating?: number; // 1-5
  };
}

const SectionPreview: React.FC<SectionPreviewProps> = ({
  section,
  totalSections,
  currentSectionIndex,
  onNext,
  onPrevious,
  analytics
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Start timer when component mounts
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format elapsed time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate progress percentage
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;
  
  // Get theme colors or use defaults
  const backgroundColor = section.theme?.backgroundColor || '#ffffff';
  const textColor = section.theme?.textColor || '#333333';
  const accentColor = section.theme?.accentColor || '#552a47';
  
  return (
    <PreviewContainer>
      <PreviewHeader bgColor={accentColor} textColor="#fff">
        <div>
          <PreviewTitle>{section.name}</PreviewTitle>
          {section.description && (
            <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
              {section.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {section.timeLimit && (
            <TimeIndicator>
              <FiClock size={16} />
              {formatTime(elapsedTime)} / {Math.floor(section.timeLimit / 60)}:00
            </TimeIndicator>
          )}
          {analytics && (
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <FiBarChart2 size={16} />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          )}
        </div>
      </PreviewHeader>
      
      <PreviewBody bgColor={backgroundColor} textColor={textColor}>
        {section.progressIndicator && (
          <>
            <ProgressBar>
              <ProgressFill progress={progress} accentColor={accentColor} />
            </ProgressBar>
            <div style={{ textAlign: 'right', fontSize: '14px', marginBottom: '16px' }}>
              Section {currentSectionIndex + 1} of {totalSections}
            </div>
          </>
        )}
        
        {section.instructions && (
          <PreviewInstructions>
            {section.instructions}
          </PreviewInstructions>
        )}
        
        {showAnalytics && analytics && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            border: '1px solid #eee'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
              Section Analytics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                  <FiClock size={16} />
                  <span>Avg. Completion Time</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                  {analytics.avgCompletionTime ? formatTime(analytics.avgCompletionTime) : 'N/A'}
                </div>
              </div>
              
              <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                  <FiUsers size={16} />
                  <span>Response Rate</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                  {analytics.responseRate ? `${analytics.responseRate}%` : 'N/A'}
                </div>
              </div>
              
              <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                  <FiActivity size={16} />
                  <span>Dropoff Rate</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                  {analytics.dropoffRate ? `${analytics.dropoffRate}%` : 'N/A'}
                </div>
              </div>
              
              {analytics.avgRating && (
                <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#666' }}>
                    <FiThumbsUp size={16} />
                    <span>Avg. Rating</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>
                    {analytics.avgRating.toFixed(1)} / 5
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Placeholder questions - in a real implementation, these would be the actual questions */}
        <PlaceholderQuestion>
          <QuestionTitle>Sample Question 1</QuestionTitle>
          <AnswerOptions>
            <AnswerOption>
              <Radio />
              <span>Option 1</span>
            </AnswerOption>
            <AnswerOption>
              <Radio />
              <span>Option 2</span>
            </AnswerOption>
            <AnswerOption>
              <Radio />
              <span>Option 3</span>
            </AnswerOption>
          </AnswerOptions>
        </PlaceholderQuestion>
        
        <PlaceholderQuestion>
          <QuestionTitle>Sample Question 2</QuestionTitle>
          <AnswerOptions>
            <AnswerOption>
              <Radio />
              <span>Option 1</span>
            </AnswerOption>
            <AnswerOption>
              <Radio />
              <span>Option 2</span>
            </AnswerOption>
          </AnswerOptions>
        </PlaceholderQuestion>
        
        {section.feedback?.enabled && (
          <PlaceholderQuestion>
            <QuestionTitle>{section.feedback.prompt || 'How would you rate this section?'}</QuestionTitle>
            {section.feedback.type === 'rating' || section.feedback.type === 'both' ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <div 
                    key={rating} 
                    onClick={() => setSelectedRating(rating)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: `1px solid ${selectedRating === rating ? accentColor : '#ddd'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: selectedRating === rating ? `${accentColor}20` : 'transparent',
                      color: selectedRating === rating ? accentColor : 'inherit',
                      fontWeight: selectedRating === rating ? 600 : 400,
                      transition: 'all 0.2s'
                    }}
                  >
                    {rating}
                  </div>
                ))}
              </div>
            ) : null}
            
            {section.feedback.type === 'thumbs' && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <button 
                  onClick={() => setSelectedRating(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: `1px solid ${selectedRating === 1 ? '#e74c3c' : '#ddd'}`,
                    borderRadius: '4px',
                    background: selectedRating === 1 ? '#e74c3c10' : 'transparent',
                    color: selectedRating === 1 ? '#e74c3c' : 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <FiThumbsDown size={18} />
                  Not Helpful
                </button>
                <button 
                  onClick={() => setSelectedRating(5)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: `1px solid ${selectedRating === 5 ? '#2ecc71' : '#ddd'}`,
                    borderRadius: '4px',
                    background: selectedRating === 5 ? '#2ecc7110' : 'transparent',
                    color: selectedRating === 5 ? '#2ecc71' : 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <FiThumbsUp size={18} />
                  Helpful
                </button>
              </div>
            )}
            
            {section.feedback.type === 'text' || section.feedback.type === 'both' ? (
              <textarea 
                placeholder="Additional comments..." 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minHeight: '80px'
                }} 
              />
            ) : null}
          </PlaceholderQuestion>
        )}
      </PreviewBody>
      
      <PreviewFooter>
        <PreviewButton onClick={onPrevious} disabled={currentSectionIndex === 0}>
          <FiChevronLeft size={16} />
          Previous
        </PreviewButton>
        
        <PreviewButton primary onClick={onNext}>
          {currentSectionIndex === totalSections - 1 ? (
            <>
              <FiCheck size={16} />
              Complete
            </>
          ) : (
            <>
              Next
              <FiChevronRight size={16} />
            </>
          )}
        </PreviewButton>
      </PreviewFooter>
    </PreviewContainer>
  );
};

export default SectionPreview;
