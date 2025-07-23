import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

export interface FolderDoc {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string | null; // null for root folders, string ID for nested folders
  organizationId?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isActive: boolean;
  order?: number; // For custom ordering of folders
}

// Extend the Collection type to include schema-related properties
interface ExtendedCollection<T extends object> extends Mongo.Collection<T> {
  schema?: any;
  attachSchema?: (schema: any) => void;
}

export const Folders = new Mongo.Collection<FolderDoc>('folders') as ExtendedCollection<FolderDoc>;

// Only attach schema if the method exists (TypeScript safety)
if (typeof Folders.attachSchema === 'function') {
  Folders.schema = new SimpleSchema({
    name: { type: String },
    description: { type: String, optional: true },
    parentId: { type: String, optional: true },
    organizationId: { type: String, optional: true },
    createdAt: { type: Date },
    createdBy: { type: String },
    updatedAt: { type: Date },
    updatedBy: { type: String },
    isActive: { type: Boolean },
    order: { type: SimpleSchema.Integer, optional: true },
  });
  Folders.attachSchema(Folders.schema);
}

if (Meteor.isServer) {
  // Publish all folders
  Meteor.publish('folders.all', function() {
    return Folders.find();
  });

  // Publish folders for a specific organization
  Meteor.publish('folders.byOrganization', function(organizationId) {
    check(organizationId, String);
    return Folders.find({ organizationId });
  });
}

Meteor.methods({
  'folders.getById': function(folderId: string) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to get folder details');
    }

    // Validate folder ID
    check(folderId, String);

    // Return folder
    return Folders.findOne(folderId);
  },

  'folders.insert': function(folder: Omit<FolderDoc, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'isActive'>) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create folders');
    }

    // Validate folder data
    check(folder.name, String);
    if (folder.description) check(folder.description, String);
    if (folder.parentId) check(folder.parentId, String);
    if (folder.organizationId) check(folder.organizationId, String);
    if (folder.order) check(folder.order, Number);

    // If parentId is provided, check if parent folder exists
    if (folder.parentId) {
      const parentFolder = Folders.findOne(folder.parentId);
      if (!parentFolder) {
        throw new Meteor.Error('parent-not-found', 'Parent folder not found');
      }
    }

    // Insert folder
    const folderId = Folders.insert({
      ...folder,
      createdAt: new Date(),
      createdBy: this.userId,
      updatedAt: new Date(),
      updatedBy: this.userId,
      isActive: true,
    });

    return folderId;
  },

  'folders.update': function(folderId: string, folder: Partial<FolderDoc>) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update folders');
    }

    // Validate folder ID
    check(folderId, String);

    // Validate folder data
    if (folder.name) check(folder.name, String);
    if (folder.description) check(folder.description, String);
    if (folder.parentId) check(folder.parentId, String);
    if (folder.organizationId) check(folder.organizationId, String);
    if (folder.order) check(folder.order, Number);

    // Check if folder exists
    const existingFolder = Folders.findOne(folderId);
    if (!existingFolder) {
      throw new Meteor.Error('folder-not-found', 'Folder not found');
    }

    // If parentId is provided, check if parent folder exists and prevent circular references
    if (folder.parentId) {
      // Prevent setting parent to self
      if (folder.parentId === folderId) {
        throw new Meteor.Error('invalid-parent', 'A folder cannot be its own parent');
      }

      // Check if parent exists
      const parentFolder = Folders.findOne(folder.parentId);
      if (!parentFolder) {
        throw new Meteor.Error('parent-not-found', 'Parent folder not found');
      }

      // Prevent circular references
      let currentParentId = parentFolder.parentId;
      while (currentParentId) {
        if (currentParentId === folderId) {
          throw new Meteor.Error('circular-reference', 'This would create a circular reference');
        }
        const currentParent = Folders.findOne(currentParentId);
        if (!currentParent) break;
        currentParentId = currentParent.parentId;
      }
    }

    // Update folder
    Folders.update(folderId, {
      $set: {
        ...folder,
        updatedAt: new Date(),
        updatedBy: this.userId,
      },
    });

    return folderId;
  },

  'folders.remove': function(folderId: string) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete folders');
    }

    // Validate folder ID
    check(folderId, String);

    // Check if folder exists
    const folder = Folders.findOne(folderId);
    if (!folder) {
      throw new Meteor.Error('folder-not-found', 'Folder not found');
    }

    // Check if folder has children
    const childFolders = Folders.find({ parentId: folderId }).count();
    if (childFolders > 0) {
      throw new Meteor.Error('folder-has-children', 'Cannot delete folder with child folders');
    }

    // Check if folder has questions
    const questionsInFolder = Meteor.call('questions.countByFolder', folderId);
    if (questionsInFolder > 0) {
      throw new Meteor.Error('folder-has-questions', 'Cannot delete folder with questions');
    }

    // Delete folder (soft delete by setting isActive to false)
    Folders.update(folderId, {
      $set: {
        isActive: false,
        updatedAt: new Date(),
        updatedBy: this.userId,
      },
    });

    return folderId;
  },

  'folders.getPath': function(folderId: string) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to get folder path');
    }

    // Validate folder ID
    check(folderId, String);

    // Check if folder exists
    const folder = Folders.findOne(folderId);
    if (!folder) {
      throw new Meteor.Error('folder-not-found', 'Folder not found');
    }

    // Build path
    const path = [];
    let currentFolder = folder;
    path.unshift({ _id: currentFolder._id, name: currentFolder.name });

    while (currentFolder.parentId) {
      const parentFolder = Folders.findOne(currentFolder.parentId);
      if (!parentFolder) break;
      currentFolder = parentFolder;
      path.unshift({ _id: currentFolder._id, name: currentFolder.name });
    }

    return path;
  }
});
