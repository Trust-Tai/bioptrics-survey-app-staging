import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';

// Ensure this file is imported on the server
if (Meteor.isServer) {
  console.log('Registering users methods');
}

// Helper function to check if user is admin
async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const user = await Meteor.users.findOneAsync(userId);
    return !!user?.profile?.admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

Meteor.methods({
  'users.getAll': async function() {
    // Check if the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to access this information');
    }
    
    // Check if user is admin
    const admin = await isAdmin(this.userId);
    if (!admin) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to access this information');
    }
    
    // Return all users with relevant fields
    return Meteor.users.find({}, {
      fields: {
        emails: 1,
        profile: 1,
        createdAt: 1
      }
    }).fetch();
  },
  
  'users.create': async function(userData) {
    // Validate input
    check(userData, {
      email: String,
      password: String,
      name: Match.Maybe(String),
      role: Match.Maybe(String),
      organization: Match.Maybe(String),
      isAdmin: Match.Maybe(Boolean)
    });
    
    // Check if the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create users');
    }
    
    // Check if user is admin
    const admin = await isAdmin(this.userId);
    if (!admin) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to create users');
    }
    
    try {
      // Create the user
      const userId = Accounts.createUser({
        email: userData.email,
        password: userData.password,
        profile: {
          name: userData.name || '',
          role: userData.role || 'user',
          organization: userData.organization || '',
          admin: !!userData.isAdmin,
          onboardingComplete: true // Set onboarding as complete for admin-created users
        }
      });
      
      return userId;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Meteor.Error('create-failed', error.message || 'Failed to create user');
    }
  },
  
  'users.update': async function(userId, userData, newPassword) {
    // Validate input
    check(userId, String);
    check(userData, {
      name: Match.Maybe(String),
      role: Match.Maybe(String),
      organization: Match.Maybe(String),
      isAdmin: Match.Maybe(Boolean)
    });
    check(newPassword, Match.Maybe(String));
    
    // Check if the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update users');
    }
    
    // Check if user is admin
    const admin = await isAdmin(this.userId);
    if (!admin) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to update users');
    }
    
    try {
      // Update user profile
      await Meteor.users.updateAsync(userId, {
        $set: {
          'profile.name': userData.name,
          'profile.role': userData.role,
          'profile.organization': userData.organization,
          'profile.admin': !!userData.isAdmin
        }
      });
      
      // Update password if provided
      if (newPassword) {
        Accounts.setPassword(userId, newPassword, { logout: false });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Meteor.Error('update-failed', error.message || 'Failed to update user');
    }
  },
  
  'users.remove': async function(userId) {
    // Validate input
    check(userId, String);
    
    // Check if the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete users');
    }
    
    // Check if user is admin
    const admin = await isAdmin(this.userId);
    if (!admin) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to delete users');
    }
    
    // Prevent deleting yourself
    if (userId === this.userId) {
      throw new Meteor.Error('invalid-operation', 'You cannot delete your own account');
    }
    
    try {
      // Delete the user
      await Meteor.users.removeAsync(userId);
      return true;
    } catch (error: any) {
      console.error('Error removing user:', error);
      throw new Meteor.Error('remove-failed', error.message || 'Failed to delete user');
    }
  },
  'users.changePassword': async function(currentPassword, newPassword) {
    // Validate input
    check(currentPassword, String);
    check(newPassword, String);
    
    // Check if the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to change your password');
    }
    
    try {
      // Verify current password
      const user = Meteor.user();
      if (!user) {
        throw new Meteor.Error('not-found', 'User not found');
      }
      
      const result = Accounts._checkPassword(user, currentPassword);
      if (result.error) {
        throw new Meteor.Error('invalid-password', 'Current password is incorrect');
      }
      
      // Change the password
      Accounts.setPassword(this.userId, newPassword, { logout: false });
      
      return true;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Meteor.Error('password-change-failed', error.message || 'Failed to change password');
    }
  }
});
