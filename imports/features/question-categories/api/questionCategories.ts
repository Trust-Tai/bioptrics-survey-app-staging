import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export interface QuestionCategory {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date;
}

export const QuestionCategories = new Mongo.Collection<QuestionCategory>('questionCategories');

const QuestionCategorySchema = new SimpleSchema({
  name: { type: String },
  color: { type: String },
  description: { type: String },
  createdAt: { type: Date, optional: true },
});
