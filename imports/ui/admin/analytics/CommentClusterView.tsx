import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiTag, FiSearch } from 'react-icons/fi';

interface CommentCluster {
  theme: string;
  keywords: string[];
  comments: string[];
}

interface CommentClusterViewProps {
  clusters: CommentCluster[];
  isLoading: boolean;
  isBlurred: boolean;
}

const Container = styled.div<{ isBlurred: boolean }>`
  filter: ${props => props.isBlurred ? 'blur(4px)' : 'none'};
  transition: filter 0.3s ease;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 16px;
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #718096;
  }
  
  input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #b7a36a;
      box-shadow: 0 0 0 1px #b7a36a;
    }
  }
`;

const ClusterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ClusterCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ClusterHeader = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
`;

const ClusterTheme = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #b7a36a;
  }
`;

const KeywordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const Keyword = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f1f2f3;
  border-radius: 4px;
  font-size: 12px;
  color: #4a5568;
  
  svg {
    font-size: 10px;
    color: #718096;
  }
`;

const CommentsList = styled.div`
  padding: 16px;
  overflow-y: auto;
  max-height: 300px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #b7a36a;
    border-radius: 10px;
  }
`;

const Comment = styled.div`
  padding: 10px;
  border-radius: 6px;
  background: #f8f9fa;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: #edf2f7;
  }
`;

const CommentCount = styled.span`
  font-size: 12px;
  color: #718096;
  margin-left: 6px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #718096;
  text-align: center;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: rgba(255, 255, 255, 0.8);
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #b7a36a;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CommentClusterView: React.FC<CommentClusterViewProps> = ({ clusters, isLoading, isBlurred }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter clusters and comments based on search term
  const filteredClusters = searchTerm ? 
    clusters.map(cluster => ({
      ...cluster,
      comments: cluster.comments.filter(comment => 
        comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cluster => 
      cluster.theme.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cluster.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cluster.comments.length > 0
    ) : 
    clusters;
  
  return (
    <Container isBlurred={isBlurred}>
      <Title>Open-Text Comment Analysis</Title>
      
      <SearchInput>
        <FiSearch />
        <input
          type="text"
          placeholder="Search comments, themes, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchInput>
      
      {isLoading ? (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      ) : filteredClusters.length > 0 ? (
        <ClusterGrid>
          {filteredClusters.map((cluster, index) => (
            cluster.comments.length > 0 && (
              <ClusterCard key={index}>
                <ClusterHeader>
                  <ClusterTheme>
                    <FiMessageSquare />
                    {cluster.theme}
                    <CommentCount>({cluster.comments.length})</CommentCount>
                  </ClusterTheme>
                  <KeywordsList>
                    {cluster.keywords.map((keyword, kidx) => (
                      <Keyword key={kidx}>
                        <FiTag />
                        {keyword}
                      </Keyword>
                    ))}
                  </KeywordsList>
                </ClusterHeader>
                <CommentsList>
                  {cluster.comments.map((comment, cidx) => (
                    <Comment key={cidx}>
                      "{comment}"
                    </Comment>
                  ))}
                </CommentsList>
              </ClusterCard>
            )
          ))}
        </ClusterGrid>
      ) : (
        <EmptyState>
          <FiMessageSquare />
          <p>No comments found</p>
          <p>{searchTerm ? 'Try adjusting your search term' : 'There are no comments to display'}</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default CommentClusterView;
