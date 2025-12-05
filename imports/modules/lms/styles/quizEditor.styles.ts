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

export const StatusBadge = styled.span<{ status: 'draft' | 'published' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'published' ? '#d1fae5' : '#e5e7eb'};
  color: ${props => props.status === 'published' ? '#065f46' : '#374151'};
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

export const DescriptionTextarea = styled.textarea`
  width: 100%;
  font-size: 14px;
  color: #6b7280;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  padding: 8px 12px;
  margin-top: 8px;
  min-height: 60px;
  resize: vertical;
  
  &:focus {
    border-color: #6366f1;
  }
`;

export const TitleActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
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

// Quiz Metadata
export const MetadataSection = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
`;

export const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  
  svg {
    color: #9ca3af;
  }
`;

// Questions List
export const QuestionsSection = styled.div`
  margin-top: 32px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AddQuestionButton = styled.button`
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
  margin-top: 12px;
  
  &:hover {
    background: #f9fafb;
    border-color: #f59e0b;
    color: #f59e0b;
  }
`;

// Empty State
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

// Save Indicator
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
