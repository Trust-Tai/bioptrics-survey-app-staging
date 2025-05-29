import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export interface QuestionTag {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date;
}

export const QuestionTags = new Mongo.Collection<QuestionTag>('questionTags');

const QuestionTagSchema = new SimpleSchema({
  name: { type: String },
  color: { type: String },
  description: { type: String },
  createdAt: { type: Date, optional: true },
});
