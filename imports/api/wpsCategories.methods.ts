import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { WPSCategories, WPSCategory } from './wpsCategories';

Meteor.methods({
  async 'wpsCategories.insert'(category: WPSCategory) {
    try {
      console.log('[wpsCategories.insert] called with:', category);
      
      // Check for duplicate name - use findOneAsync instead of findOne
      const existingCategory = await WPSCategories.findOneAsync({ name: category.name.trim() });
      if (existingCategory) {
        throw new Meteor.Error('duplicate-name', 'A category with this name already exists');
      }
      
      // Validate required fields
      if (!category.name || !category.description) {
        throw new Meteor.Error('validation-error', 'Name and description are required');
      }
      
      check(category, {
        name: String,
        color: String,
        description: String,
      });
      
      console.log('[wpsCategories.insert] passed check');
      
      // Create a document with all required fields
      const categoryDoc = {
        name: category.name.trim(),
        color: category.color || '#552a47',
        description: category.description.trim(),
        createdAt: new Date()
      };
      
      console.log('[wpsCategories.insert] Inserting category:', categoryDoc);
      
      // Use async insert instead of regular insert
      const categoryId = await WPSCategories.insertAsync(categoryDoc);
      console.log('[wpsCategories.insert] Successfully created category with ID:', categoryId);
      
      return categoryId;
    } catch (err) {
      console.error('[wpsCategories.insert] Error:', err);
      throw err;
    }
  },

  async 'wpsCategories.update'(categoryId: string, updates: Partial<WPSCategory>) {
    try {
      console.log('[wpsCategories.update] called with categoryId:', categoryId, 'updates:', updates);
      
      check(categoryId, String);
      check(updates, Object);
      
      // Check if category exists
      const category = await WPSCategories.findOneAsync({ _id: categoryId });
      if (!category) {
        throw new Meteor.Error('not-found', 'Category not found');
      }
      
      // If name is being updated, check for duplicates
      if (updates.name) {
        const existingCategory = await WPSCategories.findOneAsync({ 
          name: updates.name.trim(),
          _id: { $ne: categoryId } // Exclude current category
        });
        
        if (existingCategory) {
          throw new Meteor.Error('duplicate-name', 'A category with this name already exists');
        }
      }
      
      // Prepare update document
      const updateDoc: Record<string, any> = {};
      
      if (updates.name) updateDoc.name = updates.name.trim();
      if (updates.color) updateDoc.color = updates.color;
      if (updates.description) updateDoc.description = updates.description.trim();
      updateDoc.updatedAt = new Date();
      
      console.log('[wpsCategories.update] Updating category with data:', updateDoc);
      
      const result = await WPSCategories.updateAsync({ _id: categoryId }, { $set: updateDoc });
      console.log('[wpsCategories.update] Successfully updated category, result:', result);
      
      return result;
    } catch (error: any) {
      console.error('[wpsCategories.update] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to update category');
    }
  },

  async 'wpsCategories.remove'(categoryId: string) {
    try {
      console.log('[wpsCategories.remove] called with categoryId:', categoryId);
      
      check(categoryId, String);
      
      // Check if category exists
      const category = await WPSCategories.findOneAsync({ _id: categoryId });
      if (!category) {
        throw new Meteor.Error('not-found', 'Category not found');
      }
      
      const result = await WPSCategories.removeAsync({ _id: categoryId });
      console.log('[wpsCategories.remove] Successfully removed category, result:', result);
      
      return result;
    } catch (error: any) {
      console.error('[wpsCategories.remove] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to remove category');
    }
  },
});
