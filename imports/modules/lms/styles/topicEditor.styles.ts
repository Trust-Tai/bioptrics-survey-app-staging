import styled from 'styled-components';

// Page Layout
export const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
`;

export const MainLayout = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  align-items: flex-start;
`;

// Header Styles
export const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 73px;
  display: flex;
  align-items: center;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const BackButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

// Breadcrumb Styles
export const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
`;

export const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
`;

export const BreadcrumbSeparator = styled.span`
  color: #d1d5db;
`;

export const BreadcrumbCurrent = styled.span`
  color: #111827;
  font-weight: 500;
`;

// Canvas Styles
export const Canvas = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`;

export const CanvasInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export const ContentSection = styled.div`
  min-height: 400px;
`;

// Title Styles
export const TitleSection = styled.div`
  margin-bottom: 32px;
`;

export const TitleDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  flex: 1;
`;

export const EditButton = styled.button`
  padding: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #6366f1;
  }
`;

export const TitleInput = styled.input`
  width: 100%;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  background: transparent;
  border: none;
  border-bottom: 2px solid #6366f1;
  outline: none;
  padding: 4px 0;
  margin-bottom: 12px;
`;

export const TitleActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const SaveButton = styled.button`
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
  }
`;

export const CancelButton = styled.button`
  padding: 6px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4b5563;
  }
`;

// Block List Styles
export const BlocksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BlockWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: opacity 0.2s;
`;

export const BlockContainer = styled.div<{ color: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

export const BlockHeader = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.color}10;
  border-bottom: 1px solid #e5e7eb;
`;

export const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DragHandle = styled.div`
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #6b7280;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const BlockTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BlockActions = styled.div`
  display: flex;
  gap: 4px;
`;

export const IconButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #111827;
  }
`;

export const BlockContent = styled.div`
  padding: 20px;
`;

export const AddBlockButton = styled.button`
  width: 100%;
  padding: 20px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

// Empty State Styles
export const EmptyState = styled.div`
  text-align: center;
  padding: 64px 32px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
`;

export const EmptyStateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

export const EmptyStateText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
`;

// Delete Confirmation Styles
export const DeleteConfirmation = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const DeleteDialog = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

export const DeleteTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

export const DeleteText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
`;

export const DeleteActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

export const DeleteButton = styled.button`
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`;

// Save Indicator Styles
export const SaveIndicator = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.show ? 1 : 0};
  transform: translateY(${props => props.show ? 0 : '10px'});
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 100;
`;
