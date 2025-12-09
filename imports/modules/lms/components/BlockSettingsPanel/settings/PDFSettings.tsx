import React from 'react';
import type { PDFBlock } from '../../../types/contentBlocks';
import { MiniRichTextEditor } from '../shared/MiniRichTextEditor';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  HelpText,
  RangeWrapper,
  RangeInput,
  RangeValue,
} from '../shared/StyledComponents';

interface PDFSettingsProps {
  block: PDFBlock;
  onUpdate: (settings: any) => void;
}

export const PDFSettings: React.FC<PDFSettingsProps> = ({ block, onUpdate }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const pdfUrl = URL.createObjectURL(file);
      onUpdate({ 
        pdfUrl,
        fileName: file.name 
      });
    } else {
      alert('Please select a valid PDF file');
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>PDF Document</Label>
        <Input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
        />
        {block.settings.fileName && (
          <HelpText>Current file: {block.settings.fileName}</HelpText>
        )}
      </SettingGroup>

      <SettingGroup>
        <Label>File Name (Display)</Label>
        <Input
          type="text"
          value={block.settings.fileName || ''}
          onChange={e => onUpdate({ fileName: e.target.value })}
          placeholder="document.pdf"
        />
        <HelpText>Name shown to users</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>PDF URL (Alternative)</Label>
        <Input
          type="url"
          value={block.settings.pdfUrl || ''}
          onChange={e => onUpdate({ pdfUrl: e.target.value })}
          placeholder="https://example.com/document.pdf"
        />
        <HelpText>Or paste a direct link to a PDF file</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Display Height</Label>
        <Select
          value={block.settings.displayHeight || '600px'}
          onChange={e => onUpdate({ displayHeight: e.target.value })}
        >
          <option value="400px">Small (400px)</option>
          <option value="600px">Medium (600px)</option>
          <option value="800px">Large (800px)</option>
          <option value="100vh">Full Screen</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Download Options</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowDownload"
            checked={block.settings.allowDownload !== false}
            onChange={e => onUpdate({ allowDownload: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowDownload">Allow users to download PDF</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Additional Content (Optional)</Label>
        <MiniRichTextEditor
          value={block.settings.content || ''}
          onChange={(content) => onUpdate({ content })}
          placeholder="Add description or instructions for this PDF..."
        />
        <HelpText>Add text content to display alongside the PDF</HelpText>
      </SettingGroup>

      {block.settings.content && (
        <>
          <SettingGroup>
            <Label>Content Position</Label>
            <Select
              value={block.settings.contentPosition || 'top'}
              onChange={e => onUpdate({ contentPosition: e.target.value })}
            >
              <option value="top">Top - Above PDF</option>
              <option value="bottom">Bottom - Below PDF</option>
              <option value="left">Left - Side by side</option>
              <option value="right">Right - Side by side</option>
            </Select>
          </SettingGroup>

          {(block.settings.contentPosition === 'left' || block.settings.contentPosition === 'right') && (
            <SettingGroup>
              <Label>Content Width ({block.settings.contentWidth || 40}%)</Label>
              <RangeWrapper>
                <RangeInput
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={block.settings.contentWidth || 40}
                  onChange={e => onUpdate({ contentWidth: parseInt(e.target.value) })}
                />
                <RangeValue>{block.settings.contentWidth || 40}%</RangeValue>
              </RangeWrapper>
              <HelpText>PDF takes remaining {100 - (block.settings.contentWidth || 40)}%</HelpText>
            </SettingGroup>
          )}
        </>
      )}
    </>
  );
};

export default PDFSettings;
