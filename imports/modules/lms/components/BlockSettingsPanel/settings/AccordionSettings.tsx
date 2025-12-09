import React from 'react';
import { Plus, Trash2, Image, Upload } from 'lucide-react';
import type { AccordionBlock, AccordionPanel } from '../../../types/contentBlocks';
import { MiniRichTextEditor } from '../shared/MiniRichTextEditor';
import {
  SettingGroup,
  Label,
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

interface AccordionSettingsProps {
  block: AccordionBlock;
  onUpdate: (settings: any) => void;
}

export const AccordionSettings: React.FC<AccordionSettingsProps> = ({ block, onUpdate }) => {
  const panels = block.settings?.panels || [];
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAddPanel = () => {
    const newPanel: AccordionPanel = {
      id: `panel-${Date.now()}`,
      title: 'New Section',
      content: '<p>Add your content here...</p>',
      imageUrl: '',
      imageAlt: '',
      imagePosition: 'top',
    };
    onUpdate({ panels: [...panels, newPanel] });
  };

  const handleRemovePanel = (panelId: string) => {
    onUpdate({ panels: panels.filter((p: AccordionPanel) => p.id !== panelId) });
  };

  const handleUpdatePanel = (panelId: string, updates: Partial<AccordionPanel>) => {
    onUpdate({
      panels: panels.map((p: AccordionPanel) => 
        p.id === panelId ? { ...p, ...updates } : p
      ),
    });
  };

  const toggleDefaultExpanded = (panelId: string) => {
    const defaultExpanded = block.settings?.defaultExpanded || [];
    const isExpanded = defaultExpanded.includes(panelId);
    
    if (isExpanded) {
      onUpdate({ defaultExpanded: defaultExpanded.filter((id: string) => id !== panelId) });
    } else {
      onUpdate({ defaultExpanded: [...defaultExpanded, panelId] });
    }
  };

  const handleImageUpload = (panelId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdatePanel(panelId, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <SettingGroup>
        <Label>Accordion Panels</Label>
        <FileListContainer>
          {panels.map((panel: AccordionPanel, index: number) => (
            <FileItemCard key={panel.id}>
              <FileItemHeader>
                <FileItemTitle>Section {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemovePanel(panel.id)}
                  title="Remove panel"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Section Title</Label>
                <SmallInput
                  type="text"
                  value={panel.title}
                  onChange={(e) => handleUpdatePanel(panel.id, { title: e.target.value })}
                  placeholder="Section title"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Content</Label>
                <MiniRichTextEditor
                  value={panel.content}
                  onChange={(content) => handleUpdatePanel(panel.id, { content })}
                  placeholder="Add your content here..."
                />
              </div>

              {/* Image Section */}
              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <Image size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Panel Image (Optional)
                </Label>
                
                {panel.imageUrl ? (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ 
                      position: 'relative', 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <img 
                        src={panel.imageUrl} 
                        alt={panel.imageAlt || 'Panel image'} 
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <button
                        onClick={() => handleUpdatePanel(panel.id, { imageUrl: '', imageAlt: '' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <SmallInput
                      type="text"
                      value={panel.imageAlt || ''}
                      onChange={(e) => handleUpdatePanel(panel.id, { imageAlt: e.target.value })}
                      placeholder="Image alt text"
                      style={{ marginBottom: '8px' }}
                    />
                    <Select
                      value={panel.imagePosition || 'top'}
                      onChange={(e) => handleUpdatePanel(panel.id, { imagePosition: e.target.value as 'top' | 'bottom' })}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="top">Image at top</option>
                      <option value="bottom">Image at bottom</option>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => { fileInputRefs.current[panel.id] = el; }}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(panel.id, file);
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[panel.id]?.click()}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#f3f4f6',
                          border: '1px dashed #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={14} />
                        Upload Image
                      </button>
                    </div>
                    <SmallInput
                      type="text"
                      value={panel.imageUrl || ''}
                      onChange={(e) => handleUpdatePanel(panel.id, { imageUrl: e.target.value })}
                      placeholder="Or paste image URL..."
                      style={{ marginTop: '8px', fontSize: '11px' }}
                    />
                  </div>
                )}
              </div>

              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id={`expanded-${panel.id}`}
                  checked={(block.settings?.defaultExpanded || []).includes(panel.id)}
                  onChange={() => toggleDefaultExpanded(panel.id)}
                />
                <CheckboxLabel htmlFor={`expanded-${panel.id}`}>
                  Open by default
                </CheckboxLabel>
              </CheckboxWrapper>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddPanel}>
          <Plus size={16} />
          Add Panel
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Behavior</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowMultipleOpen"
            checked={block.settings?.allowMultipleOpen || false}
            onChange={(e) => onUpdate({ allowMultipleOpen: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowMultipleOpen">
            Allow multiple sections open
          </CheckboxLabel>
        </CheckboxWrapper>
        <HelpText>If disabled, opening a section will close others</HelpText>
      </SettingGroup>
    </>
  );
};

export default AccordionSettings;
