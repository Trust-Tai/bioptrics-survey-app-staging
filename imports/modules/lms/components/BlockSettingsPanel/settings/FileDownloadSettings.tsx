import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FileDownloadBlock, FileItem } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  HelpText,
  FileListContainer,
  FileItemCard,
  FileItemHeader,
  FileItemTitle,
  DeleteFileButton,
  AddFileButton,
  SmallInput,
} from '../shared/StyledComponents';

interface FileDownloadSettingsProps {
  block: FileDownloadBlock;
  onUpdate: (settings: any) => void;
}

export const FileDownloadSettings: React.FC<FileDownloadSettingsProps> = ({ block, onUpdate }) => {
  const files = block.settings?.files || [];

  const handleAddFile = () => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: 'New File',
      displayName: '',
      description: '',
      url: '',
      type: '',
      size: '',
    };
    onUpdate({ files: [...files, newFile] });
  };

  const handleRemoveFile = (fileId: string) => {
    onUpdate({ files: files.filter((f: FileItem) => f.id !== fileId) });
  };

  const handleUpdateFile = (fileId: string, updates: Partial<FileItem>) => {
    onUpdate({
      files: files.map((f: FileItem) => 
        f.id === fileId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleFileUpload = (fileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      handleUpdateFile(fileId, {
        url: fileUrl,
        name: file.name,
        displayName: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        size: file.size,
      });
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Files</Label>
        <FileListContainer>
          {files.map((file: FileItem, index: number) => (
            <FileItemCard key={file.id}>
              <FileItemHeader>
                <FileItemTitle>File {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveFile(file.id)}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Upload File</Label>
                <Input
                  type="file"
                  onChange={(e) => handleFileUpload(file.id, e)}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
                {file.name && (
                  <HelpText>Current: {file.name}</HelpText>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Display Name</Label>
                <SmallInput
                  type="text"
                  value={file.displayName || ''}
                  onChange={(e) => handleUpdateFile(file.id, { displayName: e.target.value })}
                  placeholder="File name to display"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File URL (Alternative)</Label>
                <SmallInput
                  type="url"
                  value={file.url}
                  onChange={(e) => handleUpdateFile(file.id, { url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Description</Label>
                <Textarea
                  value={file.description || ''}
                  onChange={(e) => handleUpdateFile(file.id, { description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File Type</Label>
                  <SmallInput
                    type="text"
                    value={file.type || ''}
                    onChange={(e) => handleUpdateFile(file.id, { type: e.target.value })}
                    placeholder="PDF"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File Size</Label>
                  <SmallInput
                    type="text"
                    value={file.size || ''}
                    onChange={(e) => handleUpdateFile(file.id, { size: e.target.value })}
                    placeholder="2.5 MB"
                  />
                </div>
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddFile}>
          <Plus size={16} />
          Add File
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonStyle || 'button'}
          onChange={(e) => onUpdate({ buttonStyle: e.target.value })}
        >
          <option value="button">Button</option>
          <option value="card">Card Style</option>
          <option value="link">Text Link</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Display Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showFileSize"
            checked={block.settings?.showFileSize !== false}
            onChange={(e) => onUpdate({ showFileSize: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showFileSize">Show file size</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showFileType"
            checked={block.settings?.showFileType !== false}
            onChange={(e) => onUpdate({ showFileType: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showFileType">Show file type</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showDescription"
            checked={block.settings?.showDescription !== false}
            onChange={(e) => onUpdate({ showDescription: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showDescription">Show descriptions</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Analytics & Security</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="trackDownloads"
            checked={block.settings?.trackDownloads !== false}
            onChange={(e) => onUpdate({ trackDownloads: e.target.checked })}
          />
          <CheckboxLabel htmlFor="trackDownloads">Track download analytics</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="requireLogin"
            checked={block.settings?.requireLogin || false}
            onChange={(e) => onUpdate({ requireLogin: e.target.checked })}
          />
          <CheckboxLabel htmlFor="requireLogin">Require login to download</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

export default FileDownloadSettings;
