import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import jwt from 'jsonwebtoken';

const JWT_SECRET = Meteor.settings?.private?.jwtSecret || 'dev_secret_key';

Meteor.methods({
  'auth.checkEmail': async function(email: string) {
    if (!email) throw new Meteor.Error('Missing email');
    const user = await Accounts.findUserByEmail(email);
    console.log('[auth.checkEmail] email:', email, '| user:', user);
    return { exists: !!user };
  },
  'auth.register'(email: string, password: string, marketingConsent: boolean) {
    if (!email || !password) throw new Meteor.Error('Missing fields');
    const userId = Accounts.createUser({ email, password, profile: { marketingConsent, onboardingComplete: false } });
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
    return { token };
  },
  'auth.setOnboardingComplete': async function() {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    await Meteor.users.updateAsync(this.userId, { $set: { 'profile.onboardingComplete': true } });
    return { success: true };
  },
  'auth.getOnboardingStatus': async function() {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const user = await Meteor.users.findOneAsync(this.userId, { fields: { 'profile.onboardingComplete': 1 } });
    return { onboardingComplete: !!(user && user.profile && user.profile.onboardingComplete) };
  },
  'auth.login': async function(email: string, password: string) {
    // This method is used only to get the JWT after Meteor.loginWithPassword on the client
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) throw new Meteor.Error('User not found');
    const token = jwt.sign({ userId: this.userId, email: user.emails?.[0]?.address }, JWT_SECRET, { expiresIn: '7d' });
    return { token };
  },
  'admin.login': async function(emailOrUsername: string, password: string) {
    try {
      if (!emailOrUsername || !password) {
        console.error('[admin.login] Missing credentials');
        throw new Meteor.Error('Missing credentials', 'Email/username and password are required');
      }
      // Try to find user by email or username
      let user = await Accounts.findUserByEmail(emailOrUsername);
      if (!user) {
        user = await Meteor.users.findOneAsync({ username: emailOrUsername });
      }
      if (!user) {
        console.error('[admin.login] User not found for:', emailOrUsername);
        throw new Meteor.Error('Unauthorized', 'User not found');
      }
      // Check if user is admin (assuming a profile field 'isAdmin' is set)
      if (!user.profile || !user.profile.isAdmin !== true) {
        console.error('[admin.login] User is not admin:', user._id, user.profile);
        throw new Meteor.Error('Unauthorized', 'Not an admin user');
      }
      // Verify password
      try {
        // Meteor's Accounts package only exposes password check on server
        // @ts-ignore
        const result = Accounts._checkPassword(user, password);
        if (result.error) {
          console.error('[admin.login] Invalid password for:', user._id);
          throw new Meteor.Error('Unauthorized', 'Invalid password');
        }
      } catch (err) {
        console.error('[admin.login] Password check error:', err);
        throw new Meteor.Error('Unauthorized', 'Invalid password');
      }
      const token = jwt.sign({ admin: true, userId: user._id, email: user.emails?.[0]?.address }, JWT_SECRET, { expiresIn: '7d' });
      return { token };
    } catch (err) {
      console.error('[admin.login] Internal server error:', err);
      throw new Meteor.Error('internal-server-error', err.message || 'Unknown error');
    }
  },
});
