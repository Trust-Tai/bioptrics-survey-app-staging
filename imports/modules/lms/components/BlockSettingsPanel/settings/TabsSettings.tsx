import React from 'react';
import { Plus, Trash2, Image, Upload } from 'lucide-react';
import type { TabsBlock, TabItem } from '../../../types/contentBlocks';
import { MiniRichTextEditor } from '../shared/MiniRichTextEditor';
import {
  SettingGroup,
  Label,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  FileListContainer,
  FileItemCard,
  FileItemHeader,
  FileItemTitle,
  DeleteFileButton,
  AddFileButton,
  SmallInput,
} from '../shared/StyledComponents';

interface TabsSettingsProps {
  block: TabsBlock;
  onUpdate: (settings: any) => void;
}

export const TabsSettings: React.FC<TabsSettingsProps> = ({ block, onUpdate }) => {
  const tabs = block.settings?.tabs || [];
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAddTab = () => {
    const newTab: TabItem = {
      id: `tab-${Date.now()}`,
      label: 'New Tab',
      content: '<p>Add your content here...</p>',
      imageUrl: '',
      imageAlt: '',
      imagePosition: 'top',
    };
    onUpdate({ tabs: [...tabs, newTab] });
  };

  const handleRemoveTab = (tabId: string) => {
    onUpdate({ tabs: tabs.filter((t: TabItem) => t.id !== tabId) });
    if (block.settings?.defaultTab === tabId) {
      onUpdate({ defaultTab: tabs.length > 1 ? tabs.find((t: TabItem) => t.id !== tabId)?.id : '' });
    }
  };

  const handleUpdateTab = (tabId: string, updates: Partial<TabItem>) => {
    onUpdate({
      tabs: tabs.map((t: TabItem) => 
        t.id === tabId ? { ...t, ...updates } : t
      ),
    });
  };

  const handleImageUpload = (tabId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateTab(tabId, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <SettingGroup>
        <Label>Tabs</Label>
        <FileListContainer>
          {tabs.map((tab: TabItem, index: number) => (
            <FileItemCard key={tab.id}>
              <FileItemHeader>
                <FileItemTitle>Tab {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveTab(tab.id)}
                  title="Remove tab"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Tab Label</Label>
                <SmallInput
                  type="text"
                  value={tab.label}
                  onChange={(e) => handleUpdateTab(tab.id, { label: e.target.value })}
                  placeholder="Tab name"
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Tab Content</Label>
                <MiniRichTextEditor
                  value={tab.content}
                  onChange={(content) => handleUpdateTab(tab.id, { content })}
                  placeholder="Add your content here..."
                />
              </div>

              {/* Image Section */}
              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <Image size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Tab Image (Optional)
                </Label>
                
                {tab.imageUrl ? (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ 
                      position: 'relative', 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <img 
                        src={tab.imageUrl} 
                        alt={tab.imageAlt || 'Tab image'} 
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <button
                        onClick={() => handleUpdateTab(tab.id, { imageUrl: '', imageAlt: '' })}
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
                      value={tab.imageAlt || ''}
                      onChange={(e) => handleUpdateTab(tab.id, { imageAlt: e.target.value })}
                      placeholder="Image alt text"
                      style={{ marginBottom: '8px' }}
                    />
                    <Select
                      value={tab.imagePosition || 'top'}
                      onChange={(e) => handleUpdateTab(tab.id, { imagePosition: e.target.value as 'top' | 'bottom' })}
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
                      ref={(el) => { fileInputRefs.current[tab.id] = el; }}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(tab.id, file);
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[tab.id]?.click()}
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
                      value={tab.imageUrl || ''}
                      onChange={(e) => handleUpdateTab(tab.id, { imageUrl: e.target.value })}
                      placeholder="Or paste image URL..."
                      style={{ marginTop: '8px', fontSize: '11px' }}
                    />
                  </div>
                )}
              </div>

              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id={`default-${tab.id}`}
                  checked={block.settings?.defaultTab === tab.id}
                  onChange={(e) => onUpdate({ defaultTab: e.target.checked ? tab.id : '' })}
                />
                <CheckboxLabel htmlFor={`default-${tab.id}`}>
                  Set as default tab
                </CheckboxLabel>
              </CheckboxWrapper>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddTab}>
          <Plus size={16} />
          Add Tab
        </AddFileButton>
      </SettingGroup>
    </>
  );
};

export default TabsSettings;
