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

  async 'modules.copy'(moduleId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(moduleId, String);

    const sourceModule = await Modules.findOneAsync(moduleId);
    if (!sourceModule) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Get the current max order for this course
    const maxOrderModule = await Modules.findOneAsync(
      { courseId: sourceModule.courseId },
      { sort: { order: -1 } }
    );
    const nextOrder = maxOrderModule ? maxOrderModule.order + 1 : 1;

    // Create a copy of the module
    const newModuleId = await Modules.insertAsync({
      courseId: sourceModule.courseId,
      title: `${sourceModule.title} (Copy)`,
      description: sourceModule.description || '',
      goals: sourceModule.goals || '',
      order: nextOrder,
      estimatedMinutes: sourceModule.estimatedMinutes || 60,
      learningObjectives: sourceModule.learningObjectives || [],
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Copy all topics in the module
    const sourceTopics = await Topics.find({ moduleId }).fetchAsync();
    for (const topic of sourceTopics) {
      const topicData = topic as any;
      await Topics.insertAsync({
        courseId: sourceModule.courseId,
        moduleId: newModuleId,
        title: topic.title,
        description: topic.description || '',
        content: topicData.content || '',
        order: topic.order,
        estimatedMinutes: topic.estimatedMinutes || 10,
        status: 'draft',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }

    // Copy all quizzes in the module
    const sourceQuizzes = await Quizzes.find({ moduleId }).fetchAsync();
    for (const quiz of sourceQuizzes) {
      const quizData = quiz as any;
      await Quizzes.insertAsync({
        courseId: sourceModule.courseId,
        moduleId: newModuleId,
        title: quiz.title,
        description: quiz.description || '',
        questions: quiz.questions || [],
        order: quiz.order,
        passingScore: quizData.passingScore || 70,
        timeLimit: quizData.timeLimit,
        status: 'draft',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }

    return newModuleId;
  },
});
