import React from 'react';
import styled from 'styled-components';
import type { PDFBlock as PDFBlockType } from '../../types/contentBlocks';

const PDFContainer = styled.div`
  width: 100%;
`;

const PDFEmptyState = styled.div`
  width: 100%;
  height: 400px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PDFIcon = styled.svg`
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin-bottom: 8px;
`;

const PDFEmptyText = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const PDFEmptySubtext = styled.p`
  color: #9ca3af;
  font-size: 12px;
  margin: 4px 0 0 0;
`;

const PDFViewer = styled.div<{ height: string }>`
  width: 100%;
  height: ${props => props.height};
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
`;

const PDFEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const PDFInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PDFFileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
`;

const PDFFileIcon = styled.svg`
  width: 20px;
  height: 20px;
  color: #8b5cf6;
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #8b5cf6;
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #7c3aed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface PDFBlockProps {
  block: PDFBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const PDFBlock: React.FC<PDFBlockProps> = ({ block }) => {
  const { settings } = block;
  const pdfUrl = settings?.pdfUrl;
  const fileName = settings?.fileName || 'document.pdf';
  const allowDownload = settings?.allowDownload !== false;
  const displayHeight = settings?.displayHeight || '600px';

  if (!pdfUrl) {
    return (
      <PDFContainer>
        <PDFEmptyState>
          <PDFIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6" 
            />
          </PDFIcon>
          <PDFEmptyText>No PDF uploaded</PDFEmptyText>
          <PDFEmptySubtext>Click edit to upload a PDF document</PDFEmptySubtext>
        </PDFEmptyState>
      </PDFContainer>
    );
  }

  return (
    <PDFContainer>
      <PDFViewer height={displayHeight}>
        <PDFEmbed
          src={`${pdfUrl}#toolbar=${allowDownload ? 1 : 0}`}
          title={fileName}
          allow="fullscreen"
        />
      </PDFViewer>
      
      {(fileName || allowDownload) && (
        <PDFInfo>
          <PDFFileName>
            <PDFFileIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </PDFFileIcon>
            {fileName}
          </PDFFileName>
          
          {allowDownload && (
            <DownloadButton 
              href={pdfUrl} 
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Download
            </DownloadButton>
          )}
        </PDFInfo>
      )}
    </PDFContainer>
  );
};
