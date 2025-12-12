import React from 'react';
import styled from 'styled-components';
import type { FileDownloadBlock as FileDownloadBlockType } from '../../types/contentBlocks';

const FileDownloadContainer = styled.div`
  width: 100%;
`;

const FileDownloadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const FileIconWrapper = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.color}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FileIcon = styled.svg<{ color: string }>`
  width: 24px;
  height: 24px;
  color: ${props => props.color};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  line-height: 1.4;
`;

const FileMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DownloadButton = styled.a<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${props => props.variant === 'link' ? '0' : '10px 16px'};
  background: ${props => 
    props.variant === 'link' ? 'transparent' : 
    props.variant === 'card' ? '#ffffff' : 
    '#3b82f6'};
  color: ${props => 
    props.variant === 'link' ? '#3b82f6' : 
    props.variant === 'card' ? '#3b82f6' : 
    '#ffffff'};
  border: ${props => props.variant === 'card' ? '1px solid #3b82f6' : 'none'};
  border-radius: ${props => props.variant === 'link' ? '0' : '6px'};
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => 
      props.variant === 'link' ? 'transparent' : 
      props.variant === 'card' ? '#f9fafb' : 
      '#2563eb'};
    text-decoration: ${props => props.variant === 'link' ? 'underline' : 'none'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div<{ $clickable?: boolean }>`
  padding: 48px 24px;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s;
  
  ${props => props.$clickable && `
    &:hover {
      border-color: #3b82f6;
      background-color: #f0f9ff;
    }
  `}
`;

const EmptyIcon = styled.svg`
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin: 0 auto 16px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

const AnalyticsNote = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

interface FileDownloadBlockProps {
  block: FileDownloadBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
  onEdit?: () => void;
}

const getFileTypeColor = (fileType: string): string => {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '#ef4444';
  if (type.includes('doc') || type.includes('word')) return '#3b82f6';
  if (type.includes('xls') || type.includes('excel')) return '#10b981';
  if (type.includes('ppt') || type.includes('powerpoint')) return '#f59e0b';
  if (type.includes('zip') || type.includes('rar')) return '#8b5cf6';
  if (type.includes('image') || type.includes('jpg') || type.includes('png')) return '#ec4899';
  return '#6b7280';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const FileDownloadBlock: React.FC<FileDownloadBlockProps> = ({ block, isEditing, onEdit }) => {
  const { settings } = block;
  const files = settings?.files || [];
  const buttonStyle = settings?.buttonStyle || 'button';
  const showFileSize = settings?.showFileSize !== false;
  const showFileType = settings?.showFileType !== false;
  const showDescription = settings?.showDescription !== false;
  const trackDownloads = settings?.trackDownloads !== false;

  if (files.length === 0) {
    return (
      <FileDownloadContainer>
        <EmptyState 
          $clickable={isEditing && !!onEdit}
          onClick={isEditing && onEdit ? onEdit : undefined}
        >
          <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </EmptyIcon>
          <EmptyText>No files available</EmptyText>
          <EmptySubtext>
            {isEditing ? 'Click here to add downloadable files' : 'Click edit to add downloadable files'}
          </EmptySubtext>
        </EmptyState>
      </FileDownloadContainer>
    );
  }

  return (
    <FileDownloadContainer>
      <FileDownloadList>
        {files.map((file: any) => {
          const fileColor = getFileTypeColor(file.type || file.name);
          
          return (
            <FileItem key={file.id}>
              <FileIconWrapper color={fileColor}>
                <FileIcon color={fileColor} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </FileIcon>
              </FileIconWrapper>

              <FileInfo>
                <FileName>{file.displayName || file.name}</FileName>
                
                {showDescription && file.description && (
                  <FileDescription>{file.description}</FileDescription>
                )}

                <FileMetadata>
                  {showFileType && file.type && (
                    <MetadataItem>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        {file.type}
                      </span>
                    </MetadataItem>
                  )}
                  {showFileSize && file.size && (
                    <MetadataItem>
                      {typeof file.size === 'number' ? formatFileSize(file.size) : file.size}
                    </MetadataItem>
                  )}
                  {file.uploadDate && (
                    <MetadataItem>
                      Added {new Date(file.uploadDate).toLocaleDateString()}
                    </MetadataItem>
                  )}
                </FileMetadata>
              </FileInfo>

              <DownloadButton 
                variant={buttonStyle}
                href={file.url} 
                download={file.name}
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
                {buttonStyle === 'link' ? 'Download' : 'Download'}
              </DownloadButton>
            </FileItem>
          );
        })}
      </FileDownloadList>

      {trackDownloads && (
        <AnalyticsNote>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          Download analytics enabled for this block
        </AnalyticsNote>
      )}
    </FileDownloadContainer>
  );
};
