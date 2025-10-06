import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface DocumentViewerProps {
  document: string; // Document URL or base64 data
  documentName: string; // Document filename
  documentType: string; // Document MIME type
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  documentName,
  documentType
}) => {
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);
  const [viewerError, setViewerError] = useState<boolean>(false);
  
  // Check if we're on localhost
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);
  
  // Handle viewer error
  const handleViewerError = () => {
    setViewerError(true);
  };

  // For PDF documents
  if (documentType === 'application/pdf') {
    return (
      <DocumentContainer>
        <DocumentTitle>
          <DocumentIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#E44D26"/>
              <path d="M14 2V8H20L14 2Z" fill="#F16529"/>
            </svg>
          </DocumentIcon>
          <DocumentName>{documentName}</DocumentName>
        </DocumentTitle>
        
        {/* Simple PDF embedding */}
        <PdfContainer>
          <embed 
            src={document} 
            type="application/pdf" 
            width="100%" 
            height="600px" 
          />
        </PdfContainer>
      </DocumentContainer>
    );
  }
  
  // For Word documents
  if (documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      documentType === 'application/msword') {
    
    // Check if it's a base64 data URL
    const isBase64 = document.startsWith('data:');
    
    // For localhost or base64 data, show download option
    if (isLocalhost || isBase64 || viewerError) {
      return (
        <DocumentContainer>
          <DocumentTitle>
            <DocumentIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#2B579A"/>
                <path d="M14 2V8H20L14 2Z" fill="#4285F4"/>
              </svg>
            </DocumentIcon>
            <DocumentName>{documentName}</DocumentName>
          </DocumentTitle>
          
          <MessageContainer>
            <InfoMessage>
              {isBase64 ? 
                "Word document preview is not available for directly embedded files." : 
                "Microsoft Office Online viewer doesn't work with localhost URLs."}
            </InfoMessage>
            
            <DownloadButton 
              href={document} 
              download={documentName} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '1.1rem', padding: '1rem 1.5rem' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
              </svg>
              Download
            </DownloadButton>
          </MessageContainer>
        </DocumentContainer>
      );
    }
    
    // For non-localhost with regular URLs, use Microsoft Office Online viewer
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document)}`;
    
    return (
      <DocumentContainer>
        <DocumentTitle>
          <DocumentIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#2B579A"/>
              <path d="M14 2V8H20L14 2Z" fill="#4285F4"/>
            </svg>
          </DocumentIcon>
          <DocumentName>{documentName}</DocumentName>
        </DocumentTitle>
        
        <DocumentFrame 
          src={officeViewerUrl} 
          title={documentName}
          onError={handleViewerError}
        />
      </DocumentContainer>
    );
  }
  
  // For other document types, just show document name
  return (
    <DocumentContainer>
      <DocumentTitle>
        <DocumentIcon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#607D8B"/>
            <path d="M14 2V8H20L14 2Z" fill="#90A4AE"/>
          </svg>
        </DocumentIcon>
        <DocumentName>{documentName}</DocumentName>
      </DocumentTitle>
      
      <DownloadButton 
        href={document} 
        download={documentName} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ fontSize: '1.1rem', padding: '1rem 1.5rem' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
        </svg>
        Download
      </DownloadButton>
    </DocumentContainer>
  );
};

// Styled components
const DocumentContainer = styled.div`
  margin: 2rem 0 2.5rem 0;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PdfContainer = styled.div`
  width: 100%;
  height: 600px;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  embed {
    border: none;
    border-radius: 8px;
  }
`;

const DocumentFrame = styled.iframe`
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DocumentTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const DocumentIcon = styled.div`
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DocumentName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  word-break: break-all;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`;

const InfoMessage = styled.div`
  background-color: #e8f4fd;
  color: #0c63e4;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  border-left: 4px solid #0c63e4;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background-color: var(--primary-color, #552A47);
  color: #fff !important;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--primary-color-dark, #3d1e33);
  }
`;


export default DocumentViewer;
