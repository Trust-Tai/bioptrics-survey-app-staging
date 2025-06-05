import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { QuestionCategories, QuestionCategory } from './questionCategories';

Meteor.methods({
  async 'questionCategories.insert'(category: QuestionCategory) {
    try {
      console.log('[questionCategories.insert] called with:', category);
      check(category, {
        name: String,
        color: String,
        description: String,
      });
      console.log('[questionCategories.insert] passed check');
      return await QuestionCategories.insertAsync({
        name: category.name,
        color: category.color,
        description: category.description,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('[questionCategories.insert] Error:', err);
      throw err;
    }
  },

  async 'questionCategories.update'(categoryId: string, updates: Partial<QuestionCategory>) {
    check(categoryId, String);
    check(updates, Object);
    return await QuestionCategories.updateAsync(categoryId, { $set: updates });
  },

  async 'questionCategories.remove'(categoryId: string) {
    check(categoryId, String);
    return await QuestionCategories.removeAsync(categoryId);
  },
});

// Add publication
if (Meteor.isServer) {
  Meteor.publish('questionCategories', function () {
    return QuestionCategories.find({});
  });
}
