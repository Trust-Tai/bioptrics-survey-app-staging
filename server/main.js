import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '../imports/api/links';
import '../imports/api/auth';
import '../imports/api/questions';
import '../imports/api/goals';
import '../imports/api/goals.methods';
import { WPSCategories } from '../imports/api/wpsCategories';
import '../imports/api/wpsCategories.methods';
import { seedWPSCategories } from '../imports/api/wpsCategories.seed';
import '../imports/api/surveyThemes';
import '../imports/api/surveys';

Meteor.publish('wpsCategories', function () {
  return WPSCategories.find();
});

Meteor.startup(() => {
  // Ensure unique index on name
  WPSCategories.rawCollection().createIndex({ name: 1 }, { unique: true }).catch(err => {
    if (err.code !== 11000) { // ignore duplicate key error on index creation
      console.error('Error creating unique index on WPSCategories.name:', err);
    }
  });
  seedWPSCategories().catch(err => {
    console.error('WPS Categories seed error:', err);
  });
});
