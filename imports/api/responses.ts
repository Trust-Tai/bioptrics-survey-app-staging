import { Mongo } from 'meteor/mongo';

export interface ResponseDoc {
  _id?: string;
  userId: string;
  site: string; // e.g., 'Rainy River', 'New Afton', 'Corporate', 'Other'
  completed: boolean;
  engagementScore: number; // e.g., 4.2
  createdAt: Date;
}

export const Responses = new Mongo.Collection<ResponseDoc>('responses');

if (Meteor.isServer) {
  Meteor.publish('responses.all', function () {
    return Responses.find();
  });
}
