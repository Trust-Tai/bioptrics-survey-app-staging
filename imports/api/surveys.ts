import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
  selectedQuestions: Record<string, any>;
  siteTextQuestions: Array<any>;
  siteTextQForm: any;
  selectedDemographics: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  published: boolean;
  shareToken?: string;
}

export const Surveys = new Mongo.Collection<SurveyDoc>('surveys');

if (Meteor.isServer) {
  Meteor.publish('surveys.all', function () {
    return Surveys.find();
  });
  Meteor.publish('surveys.public', function (shareToken: string) {
    return Surveys.find({ shareToken, published: true });
  });
}

Meteor.methods({
  // Save or update as draft (not published)
  async 'surveys.saveDraft'(survey: Partial<SurveyDoc>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    if (survey._id) {
      // Update existing
      return await Surveys.updateAsync(survey._id, {
        $set: {
          ...survey,
          published: false,
          updatedAt: now,
        },
      });
    } else {
      // Insert new
      const doc = {
        ...survey,
        published: false,
        createdAt: now,
        updatedAt: now,
        createdBy: this.userId,
      };
      return await Surveys.insertAsync(doc);
    }
  },

  // Publish survey and generate shareable token
  async 'surveys.publish'(survey: Partial<SurveyDoc>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    let shareToken = survey.shareToken || Random.id(12);
    if (survey._id) {
      await Surveys.updateAsync(survey._id, {
        $set: {
          ...survey,
          published: true,
          shareToken,
          updatedAt: now,
        },
      });
      return { _id: survey._id, shareToken };
    } else {
      const doc = {
        ...survey,
        published: true,
        shareToken,
        createdAt: now,
        updatedAt: now,
        createdBy: this.userId,
      };
      const _id = await Surveys.insertAsync(doc);
      return { _id, shareToken };
    }
  },
});
