import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Modules } from './modules';
import { Topics } from './topics';
import { Quizzes } from './quizzes';

Meteor.methods({
  async 'modules.create'(courseId: string, moduleData: {
    title: string;
    description?: string;
    goals?: string;
    estimatedMinutes?: number;
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);
    check(moduleData, {
      title: String,
      description: Match.Optional(String),
      goals: Match.Optional(String),
      estimatedMinutes: Match.Optional(Number),
    });

    // Get the current max order for this course
    const maxOrderModule = await Modules.findOneAsync(
      { courseId },
      { sort: { order: -1 } }
    );
    const nextOrder = maxOrderModule ? maxOrderModule.order + 1 : 1;

    const moduleId = await Modules.insertAsync({
      courseId,
      title: moduleData.title,
      description: moduleData.description || '',
      goals: moduleData.goals || '',
      order: nextOrder,
      estimatedMinutes: moduleData.estimatedMinutes || 60,
      learningObjectives: [],
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return moduleId;
  },

  async 'modules.update'(moduleId: string, updates: {
    title?: string;
    description?: string;
    goals?: string;
    estimatedMinutes?: number;
    learningObjectives?: any[];
    status?: 'draft' | 'published';
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(moduleId, String);
    check(updates, Object);

    const module = await Modules.findOneAsync(moduleId);
    if (!module) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Allow edits for admin users (JWT auth) or module creator
    if (this.userId && module.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own modules');
    }

    await Modules.updateAsync(moduleId, {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return moduleId;
  },

  async 'modules.delete'(moduleId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(moduleId, String);

    const module = await Modules.findOneAsync(moduleId);
    if (!module) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Allow deletion for admin users (JWT auth) or module creator
    if (this.userId && module.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own modules');
    }

    // Delete all topics and quizzes in this module
    await Topics.removeAsync({ moduleId });
    await Quizzes.removeAsync({ moduleId });

    // Delete the module
    await Modules.removeAsync(moduleId);

    return true;
  },

  async 'modules.reorder'(courseId: string, moduleIds: string[]) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);
    check(moduleIds, [String]);

    // Update order for each module
    for (let i = 0; i < moduleIds.length; i++) {
      await Modules.updateAsync(moduleIds[i], {
        $set: {
          order: i + 1,
          updatedAt: new Date(),
        },
      });
    }

    return true;
  },
});
