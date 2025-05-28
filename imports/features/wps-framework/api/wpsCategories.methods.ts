import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { WPSCategories, WPSCategory } from './wpsCategories';

Meteor.methods({
  async 'wpsCategories.insert'(category: WPSCategory) {
    try {
      console.log('[wpsCategories.insert] called with:', category);
      check(category, {
        name: String,
        color: String,
        description: String,
      });
      console.log('[wpsCategories.insert] passed check');
      return await WPSCategories.insertAsync({
        name: category.name,
        color: category.color,
        description: category.description,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('[wpsCategories.insert] Error:', err);
      throw err;
    }
  },

  async 'wpsCategories.update'(categoryId: string, updates: Partial<WPSCategory>) {
    check(categoryId, String);
    check(updates, Object);
    return await WPSCategories.updateAsync(categoryId, { $set: updates });
  },

  async 'wpsCategories.remove'(categoryId: string) {
    check(categoryId, String);
    return await WPSCategories.removeAsync(categoryId);
  },
});
