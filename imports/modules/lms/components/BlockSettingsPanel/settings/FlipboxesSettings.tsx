import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FlipboxesBlock, FlipboxItem } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  ColorInput,
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

interface FlipboxesSettingsProps {
  block: FlipboxesBlock;
  onUpdate: (settings: any) => void;
}

export const FlipboxesSettings: React.FC<FlipboxesSettingsProps> = ({ block, onUpdate }) => {
  const flipboxes = block.settings?.flipboxes || [];

  const handleAddFlipbox = () => {
    const newFlipbox: FlipboxItem = {
      id: `flipbox-${Date.now()}`,
      frontTitle: 'Front Title',
      frontDescription: 'Front description',
      frontIcon: '✨',
      backTitle: 'Back Title',
      backDescription: 'Back description',
      backIcon: '💡',
    };
    onUpdate({ flipboxes: [...flipboxes, newFlipbox] });
  };

  const handleRemoveFlipbox = (flipboxId: string) => {
    onUpdate({ flipboxes: flipboxes.filter((f: FlipboxItem) => f.id !== flipboxId) });
  };

  const handleUpdateFlipbox = (flipboxId: string, updates: Partial<FlipboxItem>) => {
    onUpdate({
      flipboxes: flipboxes.map((f: FlipboxItem) => 
        f.id === flipboxId ? { ...f, ...updates } : f
      ),
    });
  };

  return (
    <>
      <SettingGroup>
        <Label>Flipboxes</Label>
        <FileListContainer>
          {flipboxes.map((flipbox: FlipboxItem, index: number) => (
            <FileItemCard key={flipbox.id}>
              <FileItemHeader>
                <FileItemTitle>Flipbox {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveFlipbox(flipbox.id)}
                  title="Remove flipbox"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Front Side</Label>
                
                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Icon/Emoji</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.frontIcon || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontIcon: e.target.value })}
                    placeholder="✨"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.frontTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTitle: e.target.value })}
                    placeholder="Front title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.frontDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontDescription: e.target.value })}
                    placeholder="Front description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontBgColor || block.settings?.frontBgColor || '#3b82f6'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontTextColor || block.settings?.frontTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Back Side</Label>
                
                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Icon/Emoji</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.backIcon || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backIcon: e.target.value })}
                    placeholder="💡"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.backTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTitle: e.target.value })}
                    placeholder="Back title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.backDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backDescription: e.target.value })}
                    placeholder="Back description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backBgColor || block.settings?.backBgColor || '#1e40af'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backTextColor || block.settings?.backTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddFlipbox}>
          <Plus size={16} />
          Add Flipbox
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Grid Layout</Label>
        <Select
          value={block.settings?.columns || 3}
          onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
        >
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Flipbox Height</Label>
        <Input
          type="text"
          value={block.settings?.height || '300px'}
          onChange={(e) => onUpdate({ height: e.target.value })}
          placeholder="300px"
        />
        <HelpText>Enter size with unit (e.g., 300px, 20rem)</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Default Colors (Front)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontBgColor || '#3b82f6'}
              onChange={(e) => onUpdate({ frontBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ frontTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Default Colors (Back)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.backBgColor || '#1e40af'}
              onChange={(e) => onUpdate({ backBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.backTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ backTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>
    </>
  );
};

export default FlipboxesSettings;
