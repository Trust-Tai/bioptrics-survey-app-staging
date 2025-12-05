import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Star, MoreVertical, Edit, Eye, Copy, Trash2 } from 'lucide-react';
import { Meteor } from 'meteor/meteor';
import { Badge } from '../../../ui/components/shared/Badge';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';
import type { CourseDoc } from '../api/courses';

interface CourseCardProps {
  course: CourseDoc;
  onEdit: (courseId: string) => void;
}

const CardWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MenuButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 20px;
  top: 60px;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 4px 0;
  z-index: 10;
`;

const MenuItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: ${props => props.danger ? '#dc2626' : '#374151'};
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  
  &:hover {
    background: ${props => props.danger ? '#fef2f2' : '#f9fafb'};
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const Divider = styled.div`
  border-top: 1px solid #e5e7eb;
  margin: 4px 0;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.4;
`;

const Description = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Stat = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  span {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
`;

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: string) => {
    setShowMenu(false);

    switch (action) {
      case 'edit':
        onEdit(course._id);
        break;
      case 'preview':
        console.log('Preview course:', course._id);
        // TODO: Implement preview
        break;
      case 'duplicate':
        Meteor.call('courses.duplicate', course._id, (error: any) => {
          if (error) {
            console.error('Error duplicating course:', error);
            alert('Failed to duplicate course');
          } else {
            alert('Course duplicated successfully!');
          }
        });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
          Meteor.call('courses.delete', course._id, (error: any) => {
            if (error) {
              console.error('Error deleting course:', error);
              alert('Failed to delete course');
            }
          });
        }
        break;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <CardWrapper>
      <CardHeader>
        <Badge variant={course.status === 'published' ? 'success' : 'default'}>
          {course.status}
        </Badge>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <MenuButton onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={18} />
          </MenuButton>
          {showMenu && (
            <DropdownMenu>
              <MenuItem onClick={() => handleAction('edit')}>
                <Edit size={16} />
                <span>Edit</span>
              </MenuItem>
              <MenuItem onClick={() => handleAction('preview')}>
                <Eye size={16} />
                <span>Preview</span>
              </MenuItem>
              <MenuItem onClick={() => handleAction('duplicate')}>
                <Copy size={16} />
                <span>Duplicate</span>
              </MenuItem>
              <Divider />
              <MenuItem danger onClick={() => handleAction('delete')}>
                <Trash2 size={16} />
                <span>Delete</span>
              </MenuItem>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <Title>{course.title}</Title>
      <Description>{course.description}</Description>

      <InfoRow>
        <span>{course.blocks} blocks</span>
        <span>Edited {formatDate(course.updatedAt)}</span>
      </InfoRow>

      <Footer>
        <Stats>
          <Stat>{course.purchases} purchases</Stat>
          {course.rating > 0 && (
            <Rating>
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <span>{course.rating.toFixed(1)}</span>
            </Rating>
          )}
        </Stats>
        <Button variant="outline" size="small" onClick={() => onEdit(course._id)}>
          Edit Course
        </Button>
      </Footer>
    </CardWrapper>
  );
};
