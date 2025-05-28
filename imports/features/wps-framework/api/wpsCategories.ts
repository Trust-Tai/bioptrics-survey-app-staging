import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export interface WPSCategory {
  _id?: string;
  name: string;
  color: string;
  description: string;
}

export const WPSCategories = new Mongo.Collection<WPSCategory>('wpsCategories');

const WPSCategorySchema = new SimpleSchema({
  name: { type: String },
  color: { type: String },
  description: { type: String },
});

