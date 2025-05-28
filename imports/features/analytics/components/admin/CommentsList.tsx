import React from 'react';
import styled from 'styled-components';
import { FiThumbsUp, FiThumbsDown, FiFlag } from 'react-icons/fi';

interface CommentsListProps {
  comments: Array<{
    id: string;
    text: string;
    department?: string;
    sentiment?: number;
    date: Date;
  }>;
}

const CommentsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const CommentCard = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CommentText = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CommentInfo = styled.div`
  font-size: 12px;
  color: #666;
  
  span {
    margin-right: 12px;
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  
  &:hover {
    color: #333;
  }
`;

const SentimentIndicator = styled.span<{ sentiment: number }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: ${props => {
    if (props.sentiment >= 4) return '#4caf50';
    if (props.sentiment >= 3) return '#ffeb3b';
    return '#f44336';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #999;
`;

const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (comments.length === 0) {
    return (
      <EmptyState>
        No comments available
      </EmptyState>
    );
  }
  
  return (
    <CommentsContainer>
      {comments.map(comment => (
        <CommentCard key={comment.id}>
          <CommentText>{comment.text}</CommentText>
          <CommentMeta>
            <CommentInfo>
              {comment.sentiment !== undefined && (
                <span>
                  <SentimentIndicator sentiment={comment.sentiment} />
                  Sentiment: {comment.sentiment}/5
                </span>
              )}
              {comment.department && (
                <span>Department: {comment.department}</span>
              )}
              <span>Date: {formatDate(comment.date)}</span>
            </CommentInfo>
            <CommentActions>
              <ActionButton>
                <FiThumbsUp size={14} /> Helpful
              </ActionButton>
              <ActionButton>
                <FiThumbsDown size={14} /> Not Helpful
              </ActionButton>
              <ActionButton>
                <FiFlag size={14} /> Flag
              </ActionButton>
            </CommentActions>
          </CommentMeta>
        </CommentCard>
      ))}
    </CommentsContainer>
  );
};

export default CommentsList;
