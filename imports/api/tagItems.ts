import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Layers } from './layers';

// Define the TagItemField interface
export interface TagItemField {
  fieldId: string;
  value: string | boolean | number | string[];
}

// Define the TagItem interface
export interface TagItem {
  _id?: string;
  tagId: string;
  name: string;
  fields: TagItemField[];
  active: boolean;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

// Create the TagItems collection
export const TagItems = new Mongo.Collection<TagItem>('tagItems');

// Define publications
// Using Meteor.isServer to ensure these only run on the server
if (Meteor.isServer) {
  console.log('Registering tagItems publications...');
  // Publish all tag items
  Meteor.publish('tagItems.all', function () {
    return TagItems.find();
  });
  
  // Publish tag items by tag ID
  Meteor.publish('tagItems.byTag', function (tagId) {
    check(tagId, String);
    return TagItems.find({ tagId });
  });
  
  // Publish a single tag item by ID
  Meteor.publish('tagItems.single', function (itemId) {
    check(itemId, String);
    return TagItems.find({ _id: itemId });
  });
}

// Define methods
Meteor.methods({
  // Create a new tag item
  async 'tagItems.create'(itemData: Partial<TagItem>) {
    try {
      console.log('[tagItems.create] called with:', JSON.stringify(itemData, null, 2));
      
      // Validate required fields
      if (!itemData.tagId) {
        throw new Meteor.Error('validation-error', 'Tag ID is required');
      }
      
      if (!itemData.name) {
        throw new Meteor.Error('validation-error', 'Name is required');
      }
      
      // Check if the tag exists - use findOneAsync instead of findOne
      const tag = await Layers.findOneAsync({ _id: itemData.tagId });
      if (!tag) {
        throw new Meteor.Error('not-found', 'Tag not found');
      }
      
      // Use a more flexible validation approach
      // Don't use check() for the entire object as it's too strict with arrays
      check(itemData.tagId, String);
      check(itemData.name, String);
      
      // Ensure fields is an array
      const fields = Array.isArray(itemData.fields) ? itemData.fields : [];
      
      // Create the new tag item with minimal required fields
      const tagItem = {
        tagId: itemData.tagId,
        name: itemData.name,
        fields: fields,
        active: itemData.active !== undefined ? itemData.active : true,
        createdAt: new Date(),
        createdBy: this.userId || 'system',
      };
      
      console.log('[tagItems.create] Prepared tag item for insertion:', JSON.stringify(tagItem, null, 2));
      
      // Insert the tag item - use insertAsync instead of insert
      const itemId = await TagItems.insertAsync(tagItem);
      console.log('[tagItems.create] Successfully inserted tag item with ID:', itemId);
      return itemId;
    } catch (error: any) {
      console.error('[tagItems.create] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to create tag item');
    }
  },
  
  // Update an existing tag item
  async 'tagItems.update'(itemId: string, itemData: Partial<TagItem>) {
    try {
      console.log('[tagItems.update] called with itemId:', itemId, 'data:', JSON.stringify(itemData, null, 2));
      
      check(itemId, String);
      check(itemData, Object);
      
      // Check if the tag item exists - use findOneAsync instead of findOne
      const tagItem = await TagItems.findOneAsync({ _id: itemId });
      if (!tagItem) {
        throw new Meteor.Error('not-found', 'Tag item not found');
      }
      
      // Create update document
      const updateDoc = {
        ...itemData,
        updatedAt: new Date(),
        updatedBy: this.userId || 'system'
      };
      
      console.log('[tagItems.update] Updating tag item with data:', JSON.stringify(updateDoc, null, 2));
      
      // Update the tag item - use updateAsync instead of update
      const result = await TagItems.updateAsync(
        { _id: itemId },
        { $set: updateDoc }
      );
      
      console.log('[tagItems.update] Successfully updated tag item, result:', result);
      return result;
    } catch (error: any) {
      console.error('[tagItems.update] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to update tag item');
    }
  },
  
  // Update tag item status (active/inactive)
  async 'tagItems.updateStatus'(itemId: string, active: boolean) {
    try {
      console.log('[tagItems.updateStatus] called with itemId:', itemId, 'active:', active);
      
      check(itemId, String);
      check(active, Boolean);
      
      // Check if the tag item exists - use findOneAsync instead of findOne
      const tagItem = await TagItems.findOneAsync({ _id: itemId });
      if (!tagItem) {
        throw new Meteor.Error('not-found', 'Tag item not found');
      }
      
      // Update the tag item status - use updateAsync instead of update
      const result = await TagItems.updateAsync(
        { _id: itemId },
        {
          $set: {
            active,
            updatedAt: new Date(),
            updatedBy: this.userId || 'system'
          }
        }
      );
      
      console.log('[tagItems.updateStatus] Successfully updated tag item status, result:', result);
      return result;
    } catch (error: any) {
      console.error('[tagItems.updateStatus] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to update tag item status');
    }
  },
  
  // Remove a tag item
  async 'tagItems.remove'(itemId: string) {
    try {
      console.log('[tagItems.remove] called with itemId:', itemId);
      
      check(itemId, String);
      
      // Check if the tag item exists - use findOneAsync instead of findOne
      const tagItem = await TagItems.findOneAsync({ _id: itemId });
      if (!tagItem) {
        throw new Meteor.Error('not-found', 'Tag item not found');
      }
      
      // Remove the tag item - use removeAsync instead of remove
      const result = await TagItems.removeAsync({ _id: itemId });
      console.log('[tagItems.remove] Successfully removed tag item, result:', result);
      return result;
    } catch (error: any) {
      console.error('[tagItems.remove] Error:', error);
      throw new Meteor.Error('server-error', error.message || 'Failed to remove tag item');
    }
  }
});
