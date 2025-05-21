import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import 'meteor/accounts-password';
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
  const adminEmail = 'tayeshobajo@gmail.com';
  const adminPassword = '9v5Ss6sd85DUE5F9';
  const firstName = 'Tai';
  const lastName = 'Shobajo';

  // Use asynchronous Meteor API for user lookup
  let user = await Meteor.users.findOneAsync({ 'emails.address': adminEmail });

  if (!user) {
    const userId = Accounts.createUser({
      email: adminEmail,
      password: adminPassword,
      profile: {
        firstName,
        lastName,
        admin: true,
      },
    });
    console.log('Admin user created:', adminEmail);
  } else {
    // Ensure admin flag and names are set
    await Meteor.users.updateAsync(user._id, {
      $set: {
        'profile.admin': true,
        'profile.firstName': firstName,
        'profile.lastName': lastName,
      }
    });
    // Ensure password is correct
    try {
      await Accounts.setPasswordAsync(user._id, adminPassword, { logout: false });
      console.log('Admin password set/reset for:', adminEmail);
    } catch (err) {
      console.error('Error setting admin password:', err);
    }
  }
});
