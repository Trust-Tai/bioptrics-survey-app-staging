import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { BookOpen, Award, Clock, TrendingUp, Play, ChevronRight } from 'lucide-react';
import { Courses } from '../../api/courses';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Welcome Section
const WelcomeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const WelcomeTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

// Stats Section
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div<{ bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

// Continue Learning Section
const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ViewAllLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #111827;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContinueCourseCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CourseThumb = styled.div<{ bgImage?: string }>`
  width: 140px;
  height: 90px;
  border-radius: 8px;
  background: ${props => props.bgImage ? `url(${props.bgImage})` : 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)'};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const CourseNextLesson = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  
  span {
    color: #3b82f6;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const ProgressBarWrapper = styled.div`
  flex: 1;
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: 5px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  min-width: 40px;
`;

const ResumeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ea580c;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Recent Activity Section
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityNumber = styled.div<{ bgColor: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
`;

const ActivitySubtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const ActivityTime = styled.span`
  font-size: 13px;
  color: #9ca3af;
`;

// Sample data
const sampleCourse = {
  title: 'Introduction to Python Programming',
  nextLesson: 'Loops & Functions',
  progress: 75,
  image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
};

const recentActivity = [
  { id: 1, title: 'Introduction to Python Programming', lesson: 'Loops & Functions', time: 'Today', color: '#f97316' },
  { id: 2, title: "Neuroplasticity: Unlock Your Brain's Potential", lesson: 'Meditation Techniques', time: 'Yesterday', color: '#3b82f6' },
  { id: 3, title: 'Public Speaking Mastery', lesson: 'Crafting Your Message', time: '3 days ago', color: '#8b5cf6' },
];

export const LearnerHome: React.FC = () => {
  const navigate = useNavigate();

  // Fetch courses for stats
  const { courses, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('courses.published');
    
    return {
      courses: Courses.find({ status: 'published' }).fetch(),
      isLoading: !handle.ready(),
    };
  }, []);

  // Calculate stats (using sample data for now)
  const enrolledCount = 3;
  const completedCount = 0;
  const inProgressCount = 3;
  const avgProgress = 42;

  const handleResume = () => {
    // Navigate to course player
    navigate('/admin/lms/learner/courses');
  };

  const handleViewAll = () => {
    navigate('/admin/lms/learner/courses');
  };

  return (
    <PageContainer>
      {/* Welcome Section */}
      <WelcomeCard>
        <WelcomeTitle>Welcome back, Learner!</WelcomeTitle>
        <WelcomeSubtitle>Continue your learning journey. You're making great progress!</WelcomeSubtitle>
      </WelcomeCard>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#f97316">
            <BookOpen />
          </StatIcon>
          <StatContent>
            <StatValue>{enrolledCount}</StatValue>
            <StatLabel>Enrolled Courses</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#22c55e">
            <Award />
          </StatIcon>
          <StatContent>
            <StatValue>{completedCount}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#06b6d4">
            <Clock />
          </StatIcon>
          <StatContent>
            <StatValue>{inProgressCount}</StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#8b5cf6">
            <TrendingUp />
          </StatIcon>
          <StatContent>
            <StatValue>{avgProgress}%</StatValue>
            <StatLabel>Avg. Progress</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Continue Learning Section */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Continue Learning</SectionTitle>
          <ViewAllLink onClick={handleViewAll}>
            View All <ChevronRight />
          </ViewAllLink>
        </SectionHeader>

        <ContinueCourseCard>
          <CourseThumb bgImage={sampleCourse.image} />
          <CourseInfo>
            <CourseTitle>{sampleCourse.title}</CourseTitle>
            <CourseNextLesson>
              Next: <span>{sampleCourse.nextLesson}</span>
            </CourseNextLesson>
            <ProgressContainer>
              <ProgressBarWrapper>
                <ProgressBarFill progress={sampleCourse.progress} />
              </ProgressBarWrapper>
              <ProgressText>{sampleCourse.progress}%</ProgressText>
            </ProgressContainer>
          </CourseInfo>
          <ResumeButton onClick={handleResume}>
            <Play /> Resume
          </ResumeButton>
        </ContinueCourseCard>
      </SectionCard>

      {/* Recent Activity Section */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Recent Activity</SectionTitle>
        </SectionHeader>

        <ActivityList>
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id}>
              <ActivityNumber bgColor={activity.color}>
                {activity.id}
              </ActivityNumber>
              <ActivityContent>
                <ActivityTitle>{activity.title}</ActivityTitle>
                <ActivitySubtitle>Started lesson: {activity.lesson}</ActivitySubtitle>
              </ActivityContent>
              <ActivityTime>{activity.time}</ActivityTime>
            </ActivityItem>
          ))}
        </ActivityList>
      </SectionCard>
    </PageContainer>
  );
};
