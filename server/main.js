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

Meteor.startup(async () => {
  // Ensure unique index on name
  WPSCategories.rawCollection().createIndex({ name: 1 }, { unique: true }).catch(err => {
    if (err.code !== 11000) { // ignore duplicate key error on index creation
      console.error('Error creating unique index on WPSCategories.name:', err);
    }
  });
  seedWPSCategories().catch(err => {
    console.error('WPS Categories seed error:', err);
  });

  // --- ADMIN USER CREATION ---
  const username = 'Tai';
  const password = 'Taishobajo';
  const email = 'tai@admin.local';

  let user = await Meteor.users.findOneAsync({ username });
  let userId;
  if (!user) {
    userId = Accounts.createUser({ username, password, email });
    console.log('Admin user Tai created.');
  } else {
    userId = user._id;
    console.log('Admin user Tai already exists.');
  }

  // Always assign admin role
  if (typeof Roles !== 'undefined' && userId) {
    Roles.addUsersToRoles(userId, ['admin']);
    console.log('Admin role assigned to Tai.');
  } else {
    console.log('Roles package not available or userId missing.');
  }

  // Debug: print roles
  if (typeof Roles !== 'undefined' && userId) {
    const roles = Roles.getRolesForUser(userId);
    console.log('Current roles for Tai:', roles);
  }
});
