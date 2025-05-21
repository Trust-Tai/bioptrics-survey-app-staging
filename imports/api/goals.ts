import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface GoalDoc {
  _id?: string;
  title: string;
  description: string;
  color: string;
  createdAt: Date;
}

export const Goals = new Mongo.Collection<GoalDoc>('goals');

const DEFAULT_GOALS: Omit<GoalDoc, '_id' | 'createdAt'>[] = [
  { title: 'Engagement', description: 'Increase employee engagement', color: '#6a5acd' },
  { title: 'Leadership', description: 'Develop leadership skills and culture', color: '#2e8b57' },
  { title: 'Accountability', description: 'Promote accountability at all levels', color: '#552a47' },
  { title: 'Wellness', description: 'Support wellness and well-being', color: '#ff7f50' },
  { title: 'Communication', description: 'Enhance communication and transparency', color: '#3776a8' },
  { title: 'Safety', description: 'Ensure workplace safety', color: '#e74c3c' },
  { title: 'Recognition', description: 'Recognize and reward contributions', color: '#e67e22' },
  { title: 'Pride', description: 'Foster pride in the organization', color: '#8e44ad' },
];

if (Meteor.isServer) {
  Meteor.publish('goals.all', function () {
    return Goals.find();
  });

  Meteor.startup(async () => {
    for (const goal of DEFAULT_GOALS) {
      const exists = await Goals.findOneAsync({ title: goal.title });
      if (!exists) {
        await Goals.insertAsync({ ...goal, createdAt: new Date() });
      }
    }
  });
}
