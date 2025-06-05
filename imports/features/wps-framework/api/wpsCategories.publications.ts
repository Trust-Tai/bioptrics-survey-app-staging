import { Meteor } from 'meteor/meteor';
import { WPSCategories } from './wpsCategories';

// Publish all WPS categories
Meteor.publish('wpsCategories.all', function() {
  return WPSCategories.find({});
});

// Publish specific WPS categories by IDs
Meteor.publish('wpsCategories.byIds', function(categoryIds: string[]) {
  if (!Array.isArray(categoryIds)) {
    console.error('wpsCategories.byIds called with invalid categoryIds:', categoryIds);
    return this.ready();
  }
  
  return WPSCategories.find({ _id: { $in: categoryIds } });
});
