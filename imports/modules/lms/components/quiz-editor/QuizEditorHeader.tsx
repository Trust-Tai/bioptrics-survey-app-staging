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
  StatusBadge,
} from '../../styles/quizEditor.styles';
import type { CourseDoc } from '../../api/courses';
import type { ModuleDoc } from '../../api/modules';
import type { QuizDoc } from '../../api/quizzes';

interface QuizEditorHeaderProps {
  course?: CourseDoc;
  module?: ModuleDoc;
  quiz?: QuizDoc;
  onBack: () => void;
  onPublish?: () => void;
}

export const QuizEditorHeader: React.FC<QuizEditorHeaderProps> = ({
  course,
  module,
  quiz,
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
            <BreadcrumbCurrent>
              Quiz: {quiz?.title}
            </BreadcrumbCurrent>
            {quiz && (
              <>
                <BreadcrumbSeparator>•</BreadcrumbSeparator>
                <StatusBadge status={quiz.status}>
                  {quiz.status === 'published' ? 'Published' : 'Draft'}
                </StatusBadge>
              </>
            )}
          </Breadcrumb>
        </HeaderLeft>
        
        {onPublish && quiz && (
          <Button 
            variant={quiz.status === 'published' ? 'secondary' : 'primary'} 
            onClick={onPublish}
          >
            {quiz.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        )}
      </HeaderContent>
    </Header>
  );
};
