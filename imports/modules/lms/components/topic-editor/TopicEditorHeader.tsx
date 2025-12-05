import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../ui/admin/dashboard/components/shared/Button';
import {
  Header,
  HeaderContent,
  HeaderLeft,
  BackButton,
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbCurrent,
} from '../../styles/topicEditor.styles';
import type { CourseDoc } from '../../api/courses';
import type { ModuleDoc } from '../../api/modules';
import type { TopicDoc } from '../../api/topics';

interface TopicEditorHeaderProps {
  course?: CourseDoc;
  module?: ModuleDoc;
  topic?: TopicDoc;
  onBack: () => void;
  onPublish?: () => void;
}

export const TopicEditorHeader: React.FC<TopicEditorHeaderProps> = ({
  course,
  module,
  topic,
  onBack,
  onPublish,
}) => {
  return (
    <Header>
      <HeaderContent>
        <HeaderLeft>
          <BackButton onClick={onBack} title="Back to Course Builder">
            <ArrowLeft size={20} />
          </BackButton>
          
          <Breadcrumb>
            <BreadcrumbLink onClick={onBack}>
              {course?.title || 'Course'}
            </BreadcrumbLink>
            <BreadcrumbSeparator>→</BreadcrumbSeparator>
            <BreadcrumbLink onClick={onBack}>
              Module #{module?.order}: {module?.title}
            </BreadcrumbLink>
            <BreadcrumbSeparator>→</BreadcrumbSeparator>
            <BreadcrumbCurrent>{topic?.title}</BreadcrumbCurrent>
          </Breadcrumb>
        </HeaderLeft>
        
        {onPublish && (
          <Button variant="primary" onClick={onPublish}>
            Publish
          </Button>
        )}
      </HeaderContent>
    </Header>
  );
};
