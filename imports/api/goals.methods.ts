import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Goals } from './goals';

Meteor.methods({
  async 'goals.insert'(goal: { title: string; description: string; color: string }) {
    check(goal, {
      title: String,
      description: String,
      color: String,
    });
    if (!goal.title.trim()) throw new Meteor.Error('Title required');
    if (await Goals.findOneAsync({ title: { $regex: `^${goal.title}$`, $options: 'i' } })) {
      throw new Meteor.Error('Duplicate goal');
    }
    return await Goals.insertAsync({ ...goal, createdAt: new Date() });
  },
  async 'goals.update'(_id: string, updates: { title: string; description: string; color: string }) {
    check(_id, String);
    check(updates, {
      title: String,
      description: String,
      color: String,
    });
    return await Goals.updateAsync(_id, { $set: { ...updates } });
  },
  async 'goals.remove'(_id: string) {
    check(_id, String);
    return await Goals.removeAsync(_id);
  },
});
