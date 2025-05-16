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
  'admin.login'(password: string) {
    // For demo: hardcode admin email/password or check a user field
    const adminPassword = 'admin123';
    if (password !== adminPassword) {
      throw new Meteor.Error('Unauthorized', 'Invalid admin credentials');
    }
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' });
    return { token };
  },
});
