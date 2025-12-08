import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Courses } from './courses';

Meteor.methods({
  async 'courses.insert'(courseData: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
    learningObjectives?: string[];
    learnerAudience?: string;
  }) {
    try {
      console.log('[courses.insert] Called with data:', courseData);
      console.log('[courses.insert] this.userId:', this.userId);
      
      // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
      // For now, allow course creation without userId check
      const userId = this.userId || 'admin'; // Fallback for JWT auth
      console.log('[courses.insert] Using userId:', userId);

      check(courseData, {
        title: String,
        description: String,
        category: Match.Optional(String),
        tags: Match.Optional([String]),
        learningObjectives: Match.Optional([String]),
        learnerAudience: Match.Optional(String),
      });

      const courseId = await Courses.insertAsync({
        ...courseData,
        status: 'draft',
        blocks: 0,
        purchases: 0,
        rating: 0,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      console.log('[courses.insert] Course created successfully:', courseId);
      return courseId;
    } catch (error) {
      console.error('[courses.insert] ERROR:', error);
      throw error;
    }
  },

  async 'courses.update'(courseId: string, updates: {
    title?: string;
    description?: string;
    status?: 'draft' | 'published';
    content?: any[];
    category?: string;
    tags?: string[];
    thumbnail?: string;
    learningObjectives?: string[];
    learnerAudience?: string;
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);
    check(updates, Object);

    const course = await Courses.findOneAsync(courseId);
    
    if (!course) {
      throw new Meteor.Error('not-found', 'Course not found');
    }

    // Allow updates for admin users (JWT auth) or course creator
    if (this.userId && course.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own courses');
    }

    // Count blocks if content is updated
    let blockCount = course.blocks;
    if (updates.content) {
      blockCount = updates.content.length;
    }

    await Courses.updateAsync(courseId, {
      $set: {
        ...updates,
        blocks: blockCount,
        updatedAt: new Date(),
      },
    });

    return courseId;
  },

  async 'courses.delete'(courseId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);

    const course = await Courses.findOneAsync(courseId);
    
    if (!course) {
      throw new Meteor.Error('not-found', 'Course not found');
    }

    // Allow deletion for admin users (JWT auth) or course creator
    if (this.userId && course.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own courses');
    }

    await Courses.removeAsync(courseId);
    
    return true;
  },

  async 'courses.duplicate'(courseId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);

    const course = await Courses.findOneAsync(courseId);
    
    if (!course) {
      throw new Meteor.Error('not-found', 'Course not found');
    }

    const newCourseId = await Courses.insertAsync({
      ...course,
      _id: undefined as any,
      title: `${course.title} (Copy)`,
      status: 'draft',
      purchases: 0,
      rating: 0,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return newCourseId;
  },
});
