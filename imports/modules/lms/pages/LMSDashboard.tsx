import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { Courses } from '../api/courses';
import { CourseTemplates } from '../api/courseTemplates';
import { Button } from '../../../ui/admin/dashboard/components/shared/Button';
import { SearchBar } from '../components/SearchBar';
import { CourseCard } from '../components/CourseCard';
import { CreateCourseModal } from '../components/CreateCourseModal';
import { TemplateModal } from '../components/TemplateModal';

const PageContainer = styled.div`
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f9fafb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }

  p {
    font-size: 16px;
    color: #6b7280;
  }
`;

const SearchWrapper = styled.div`
  max-width: 400px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 24px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 16px;
`;

const LMSDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Fetch courses from MongoDB
  const { courses, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('courses.all');
    const coursesData = Courses.find({}, { sort: { updatedAt: -1 } }).fetch();

    return {
      courses: coursesData,
      isLoading: !handle.ready(),
    };
  }, []);

  // Fetch templates
  const { templates } = useTracker(() => {
    const handle = Meteor.subscribe('courseTemplates.all');
    const templatesData = CourseTemplates.find({ isActive: true }).fetch();

    return {
      templates: templatesData,
    };
  }, []);

  // Filter courses by search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCourse = (courseId: string) => {
    navigate(`/admin/lms/builder/${courseId}`);
  };

  const handleStartFromScratch = () => {
    setShowCreateModal(false);
    navigate('/admin/lms/builder/new');
  };

  const handleUseTemplate = () => {
    setShowCreateModal(false);
    setShowTemplateModal(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    setShowTemplateModal(false);
    navigate(`/admin/lms/builder/new?template=${templateId}`);
  };

  const handleBackToCreate = () => {
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState>Loading courses...</LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <h1>Content Library</h1>
          <p>Create and manage courses for the marketplace</p>
        </HeaderContent>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Create Course
        </Button>
      </Header>

      <SearchWrapper>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search courses..."
        />
      </SearchWrapper>

      {filteredCourses.length > 0 ? (
        <CourseGrid>
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} onEdit={handleEditCourse} />
          ))}
        </CourseGrid>
      ) : (
        <EmptyState>
          <h3>
            {searchTerm ? 'No courses found' : 'No courses yet'}
          </h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first course'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Course
            </Button>
          )}
        </EmptyState>
      )}

      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStartFromScratch={handleStartFromScratch}
        onUseTemplate={handleUseTemplate}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onBack={handleBackToCreate}
      />
    </PageContainer>
  );
};

export default LMSDashboard;
