import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Topics } from './topics';
import { Modules } from './modules';

Meteor.methods({
  async 'topics.create'(courseId: string, moduleId: string, topicData: {
    title: string;
    description?: string;
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(courseId, String);
    check(moduleId, String);
    check(topicData, {
      title: String,
      description: Match.Optional(String),
    });

    // Verify module exists
    const module = await Modules.findOneAsync(moduleId);
    if (!module) {
      throw new Meteor.Error('not-found', 'Module not found');
    }

    // Get the current max order for this module
    const maxOrderTopic = await Topics.findOneAsync(
      { moduleId },
      { sort: { order: -1 } }
    );
    const nextOrder = maxOrderTopic ? maxOrderTopic.order + 1 : 1;

    const topicId = await Topics.insertAsync({
      moduleId,
      courseId,
      title: topicData.title,
      description: topicData.description || '',
      order: nextOrder,
      contentBlocks: [],
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return topicId;
  },

  async 'topics.update'(topicId: string, updates: {
    title?: string;
    description?: string;
    contentBlocks?: any[];
    estimatedMinutes?: number;
    status?: 'draft' | 'published';
  }) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(topicId, String);
    check(updates, Object);

    const topic = await Topics.findOneAsync(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    // Allow edits for admin users (JWT auth) or topic creator
    if (this.userId && topic.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own topics');
    }

    await Topics.updateAsync(topicId, {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return topicId;
  },

  async 'topics.delete'(topicId: string) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(topicId, String);

    const topic = await Topics.findOneAsync(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    // Allow deletion for admin users (JWT auth) or topic creator
    if (this.userId && topic.createdBy !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own topics');
    }

    await Topics.removeAsync(topicId);

    return true;
  },

  async 'topics.reorder'(moduleId: string, topicIds: string[]) {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    check(moduleId, String);
    check(topicIds, [String]);

    // Update order for each topic
    for (let i = 0; i < topicIds.length; i++) {
      await Topics.updateAsync(topicIds[i], {
        $set: {
          order: i + 1,
          updatedAt: new Date(),
        },
      });
    }

    return true;
  },
});
