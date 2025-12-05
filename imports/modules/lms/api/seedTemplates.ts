import { Meteor } from 'meteor/meteor';
import { CourseTemplates } from './courseTemplates';

const SAMPLE_TEMPLATES = [
  {
    title: 'Defining Business Ethics',
    description: 'Foundational understanding of ethics in business',
    duration: '15-20 min',
    category: 'Business Ethics',
    includes: ['Introduction', 'Core Concepts', 'Case Studies', 'Quiz'],
    template: {
      sections: [
        { title: 'Introduction', blocks: [] },
        { title: 'Core Concepts', blocks: [] },
        { title: 'Case Studies', blocks: [] },
        { title: 'Assessment', blocks: [] },
      ],
    },
    isActive: true,
  },
  {
    title: 'Workplace Integrity',
    description: 'Maintaining ethical standards at work',
    duration: '20-25 min',
    category: 'Business Ethics',
    includes: ['Overview', 'Scenarios', 'Best Practices', 'Assessment'],
    template: {
      sections: [
        { title: 'Overview', blocks: [] },
        { title: 'Scenarios', blocks: [] },
        { title: 'Best Practices', blocks: [] },
        { title: 'Assessment', blocks: [] },
      ],
    },
    isActive: true,
  },
  {
    title: 'Resolving Ethical Dilemmas',
    description: 'Framework for ethical decision-making',
    duration: '25-30 min',
    category: 'Business Ethics',
    includes: ['Problem Identification', 'Analysis', 'Solutions', 'Practice'],
    template: {
      sections: [
        { title: 'Problem Identification', blocks: [] },
        { title: 'Analysis', blocks: [] },
        { title: 'Solutions', blocks: [] },
        { title: 'Practice', blocks: [] },
      ],
    },
    isActive: true,
  },
  {
    title: 'Effective Communication Skills',
    description: 'Master the art of workplace communication',
    duration: '30-35 min',
    category: 'Communication',
    includes: ['Fundamentals', 'Active Listening', 'Feedback', 'Exercises'],
    template: {
      sections: [
        { title: 'Fundamentals', blocks: [] },
        { title: 'Active Listening', blocks: [] },
        { title: 'Giving Feedback', blocks: [] },
        { title: 'Practice Exercises', blocks: [] },
      ],
    },
    isActive: true,
  },
  {
    title: 'Change Management Essentials',
    description: 'Navigate organizational change successfully',
    duration: '25-30 min',
    category: 'Change Management',
    includes: ['Understanding Change', 'Resistance', 'Strategies', 'Application'],
    template: {
      sections: [
        { title: 'Understanding Change', blocks: [] },
        { title: 'Managing Resistance', blocks: [] },
        { title: 'Change Strategies', blocks: [] },
        { title: 'Application', blocks: [] },
      ],
    },
    isActive: true,
  },
  {
    title: 'Compliance Training Basics',
    description: 'Essential compliance requirements and best practices',
    duration: '20-25 min',
    category: 'Compliance',
    includes: ['Regulations', 'Requirements', 'Procedures', 'Certification'],
    template: {
      sections: [
        { title: 'Regulations Overview', blocks: [] },
        { title: 'Requirements', blocks: [] },
        { title: 'Procedures', blocks: [] },
        { title: 'Certification Quiz', blocks: [] },
      ],
    },
    isActive: true,
  },
];

export async function seedCourseTemplates() {
  if (Meteor.isServer) {
    try {
      const count = await CourseTemplates.find().countAsync();

      if (count === 0) {
        console.log('Seeding course templates...');

        for (const template of SAMPLE_TEMPLATES) {
          await CourseTemplates.insertAsync({
            ...template,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);
        }

        console.log(`✅ Seeded ${SAMPLE_TEMPLATES.length} course templates`);
      } else {
        console.log(`Course templates already exist (${count} templates)`);
      }
    } catch (error) {
      console.error('Error seeding course templates:', error);
    }
  }
}
