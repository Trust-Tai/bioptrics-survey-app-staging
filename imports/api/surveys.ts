import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
<<<<<<< HEAD
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
=======
>>>>>>> main

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
<<<<<<< HEAD
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
=======
  createdAt: Date;
  questions: string[]; // Array of question IDs or question texts
>>>>>>> main
}

export const Surveys = new Mongo.Collection<SurveyDoc>('surveys');

<<<<<<< HEAD
=======
export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  answers: { [questionId: string]: any };
  submittedAt: Date;
}

export const SurveyResponses = new Mongo.Collection<SurveyResponseDoc>('survey_responses');

>>>>>>> main
if (Meteor.isServer) {
  Meteor.publish('surveys.all', function () {
    return Surveys.find();
  });
<<<<<<< HEAD
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
=======
}

Meteor.methods({
  'surveys.insert'(survey: Omit<SurveyDoc, '_id'|'createdAt'>) {
    console.log('surveys.insert called with:', survey);
    if (!survey.title) {
      throw new Meteor.Error('missing-title', 'Survey title is required');
    }
    if (!survey.questions || !Array.isArray(survey.questions) || !survey.questions.length) {
      throw new Meteor.Error('missing-questions', 'At least one question is required');
    }
    return Surveys.insertAsync({ ...survey, createdAt: new Date() });
  },
  'surveys.remove'(surveyId: string) {
    return Surveys.remove(surveyId);
  },
  // Public method to fetch survey by ID
  'surveys.get'(surveyId: string) {
    check(surveyId, String);
    return Surveys.findOne({ _id: surveyId });
  },
  // Allow anonymous submission of survey responses
  'surveys.submitResponse'(surveyId: string, answers: { [questionId: string]: any }) {
    check(surveyId, String);
    check(answers, Object);
    // Optionally, validate that the survey exists
    if (!Surveys.findOne({ _id: surveyId })) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    return SurveyResponses.insert({ surveyId, answers, submittedAt: new Date() });
>>>>>>> main
  },
});
