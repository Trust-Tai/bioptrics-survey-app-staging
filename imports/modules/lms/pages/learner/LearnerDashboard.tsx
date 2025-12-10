import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { FileText, Zap, Download, ExternalLink, Folder } from 'lucide-react';
import { Courses } from '../../api/courses';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CourseImage = styled.div<{ bgImage?: string }>`
  height: 180px;
  background: ${props => props.bgImage ? `url(${props.bgImage})` : 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CourseContent = styled.div`
  padding: 20px;
`;

const CourseTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
  text-align: right;
`;

const NextLesson = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const ToolsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ToolsSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
`;

const ToolsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ToolItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ToolIcon = styled.div<{ color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || '#f3f4f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.color ? 'white' : '#6b7280'};
  }
`;

const ToolInfo = styled.div`
  flex: 1;
`;

const ToolName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const ToolDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const ToolAction = styled.button<{ variant?: 'download' | 'open' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: ${props => props.variant === 'download' ? '#f97316' : '#22c55e'};
  
  &:hover {
    background: ${props => props.variant === 'download' ? '#fff7ed' : '#f0fdf4'};
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 32px;
`;

const ToolCard = styled.div`
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #f97316;
    background: #fff7ed;
  }
`;

const ToolCardIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  
  svg {
    width: 48px;
    height: 48px;
    color: #f97316;
  }
`;

const ToolCardTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToolCardCount = styled.span`
  font-size: 13px;
  color: #f97316;
`;

// Sample course images
const courseImages = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop',
];

// Sample tools data
const recentTools = [
  { id: '1', name: 'Project Outline Template', description: 'Advanced React Hooks & Context', icon: FileText, action: 'download' },
  { id: '2', name: 'GraphQL Schema Generator', description: 'Next.js Performance Optimization', icon: Zap, action: 'open' },
  { id: '3', name: 'Auth Code Snippets (.zip)', description: 'Serverless Go Development', icon: Download, action: 'download' },
];

const toolsByCourse = [
  { id: '1', name: 'Introduction to...', count: 5 },
  { id: '2', name: 'Neuroplastici...', count: 8 },
  { id: '3', name: 'Public Speaki...', count: 3 },
  { id: '4', name: 'Accountability...', count: 2 },
];

export const LearnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch published courses
  const { courses, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('courses.published');
    
    return {
      courses: Courses.find({ status: 'published' }, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handle.ready(),
    };
  }, []);

  // Generate sample progress for demo
  const getProgress = (index: number) => {
    const progressValues = [75, 40, 10, 60, 25];
    return progressValues[index % progressValues.length];
  };

  const getNextLesson = (index: number) => {
    const lessons = [
      'Loops & Functions',
      'Meditation Techniques',
      'Crafting Your Message',
      'Building Relationships',
      'Goal Setting',
    ];
    return lessons[index % lessons.length];
  };

  const handleCourseClick = (courseId: string) => {
    // Navigate to course player/detail page
    navigate(`/admin/lms/learner/course/${courseId}`);
  };

  return (
    <PageContainer>
      <Section>
        <SectionTitle>My Courses</SectionTitle>
        <CoursesGrid>
          {isLoading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            // Show sample courses if no published courses
            <>
              {[
                { _id: '1', title: 'Introduction to Python Programming' },
                { _id: '2', title: "Neuroplasticity: Unlock Your Brain's Potential" },
                { _id: '3', title: 'Public Speaking Mastery' },
              ].map((course, index) => (
                <CourseCard key={course._id} onClick={() => handleCourseClick(course._id)}>
                  <CourseImage bgImage={courseImages[index % courseImages.length]} />
                  <CourseContent>
                    <CourseTitle>{course.title}</CourseTitle>
                    <ProgressContainer>
                      <ProgressBar>
                        <ProgressFill progress={getProgress(index)} />
                      </ProgressBar>
                      <ProgressText>{getProgress(index)}%</ProgressText>
                    </ProgressContainer>
                    <NextLesson>Next Lesson: {getNextLesson(index)}</NextLesson>
                  </CourseContent>
                </CourseCard>
              ))}
            </>
          ) : (
            courses.map((course, index) => (
              <CourseCard key={course._id} onClick={() => handleCourseClick(course._id)}>
                <CourseImage bgImage={courseImages[index % courseImages.length]} />
                <CourseContent>
                  <CourseTitle>{course.title}</CourseTitle>
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill progress={getProgress(index)} />
                    </ProgressBar>
                    <ProgressText>{getProgress(index)}%</ProgressText>
                  </ProgressContainer>
                  <NextLesson>Next Lesson: {getNextLesson(index)}</NextLesson>
                </CourseContent>
              </CourseCard>
            ))
          )}
        </CoursesGrid>
      </Section>

      <Section>
        <SectionTitle>Digital Tools & Resources</SectionTitle>
        <ToolsSection>
          <ToolsSectionTitle>Recently Used Tools</ToolsSectionTitle>
          <ToolsList>
            {recentTools.map(tool => (
              <ToolItem key={tool.id}>
                <ToolIcon color={tool.action === 'open' ? '#fbbf24' : undefined}>
                  <tool.icon />
                </ToolIcon>
                <ToolInfo>
                  <ToolName>{tool.name}</ToolName>
                  <ToolDescription>{tool.description}</ToolDescription>
                </ToolInfo>
                <ToolAction variant={tool.action as 'download' | 'open'}>
                  {tool.action === 'download' ? 'Download' : 'Open'}
                </ToolAction>
              </ToolItem>
            ))}
          </ToolsList>
        </ToolsSection>

        <ToolsSectionTitle style={{ marginTop: '32px' }}>Tools by Course</ToolsSectionTitle>
        <ToolsGrid>
          {toolsByCourse.map(tool => (
            <ToolCard key={tool.id}>
              <ToolCardIcon>
                <Folder />
              </ToolCardIcon>
              <ToolCardTitle>{tool.name}</ToolCardTitle>
              <ToolCardCount>{tool.count} Tools</ToolCardCount>
            </ToolCard>
          ))}
        </ToolsGrid>
      </Section>
    </PageContainer>
  );
};
