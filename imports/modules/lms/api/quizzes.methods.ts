import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Quizzes } from './quizzes';
import { Modules } from './modules';

Meteor.methods({
  async 'quizzes.create'(courseId: string, moduleId: string, quizData: {
    title: string;
    description?: string;
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);
    check(moduleId, String);
    check(quizData, {
      title: String,
      description: Match.Optional(String),
    });

    // Verify module exists
    const module = await Modules.findOneAsync(moduleId);
    if (!module) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Get the current max order for this module
    const maxOrderQuiz = await Quizzes.findOneAsync(
      { moduleId },
      { sort: { order: -1 } }
    );
    const nextOrder = maxOrderQuiz ? maxOrderQuiz.order + 1 : 1;

    // Default quiz settings
    const defaultSettings = {
      timeLimit: 30,
      passingScore: 80,
      maxAttempts: 3,
      allowRetakes: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      requireCompletion: false,
    };

    const quizId = await Quizzes.insertAsync({
      moduleId,
      courseId,
      title: quizData.title,
      description: quizData.description || '',
      order: nextOrder,
      questions: [],
      settings: defaultSettings,
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return quizId;
  },

  async 'quizzes.update'(quizId: string, updates: {
    title?: string;
    description?: string;
    questions?: any[];
    settings?: any;
    status?: 'draft' | 'published';
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(quizId, String);
    check(updates, Object);

    const quiz = await Quizzes.findOneAsync(quizId);
    if (!quiz) {
      throw new Meteor.Error('not-found', 'Quiz not found');
    }

    // Allow edits for admin users (JWT auth) or quiz creator
    if (this.userId && quiz.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own quizzes');
    }

    await Quizzes.updateAsync(quizId, {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return quizId;
  },

  async 'quizzes.delete'(quizId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(quizId, String);

    const quiz = await Quizzes.findOneAsync(quizId);
    if (!quiz) {
      throw new Meteor.Error('not-found', 'Quiz not found');
    }

    // Allow deletion for admin users (JWT auth) or quiz creator
    if (this.userId && quiz.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own quizzes');
    }

    await Quizzes.removeAsync(quizId);

    return true;
  },

  async 'quizzes.reorder'(moduleId: string, quizIds: string[]) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(moduleId, String);
    check(quizIds, [String]);

    // Update order for each quiz
    for (let i = 0; i < quizIds.length; i++) {
      await Quizzes.updateAsync(quizIds[i], {
        $set: {
          order: i + 1,
          updatedAt: new Date(),
        },
      });
    }

    return true;
  },
});
