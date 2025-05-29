import { Meteor } from 'meteor/meteor';
import { QuestionTags } from './questionTags';

// Explicitly register the publication
Meteor.publish('questionTags', function () {
  console.log('[Publication] questionTags publication registered and called');
  return QuestionTags.find({});
});
