import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { QuestionTags, QuestionTag } from './questionTags';

Meteor.methods({
  async 'questionTags.insert'(tag: QuestionTag) {
    try {
      console.log('[questionTags.insert] called with:', tag);
      check(tag, {
        name: String,
        color: String,
        description: String,
      });
      console.log('[questionTags.insert] passed check');
      return await QuestionTags.insertAsync({
        name: tag.name,
        color: tag.color,
        description: tag.description,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('[questionTags.insert] Error:', err);
      throw err;
    }
  },

  async 'questionTags.update'(tagId: string, updates: Partial<QuestionTag>) {
    check(tagId, String);
    check(updates, Object);
    return await QuestionTags.updateAsync(tagId, { $set: updates });
  },

  async 'questionTags.remove'(tagId: string) {
    check(tagId, String);
    return await QuestionTags.removeAsync(tagId);
  },
});

// Publication moved to publications.js to avoid duplicates
