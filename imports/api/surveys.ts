import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

// Extend the User type to include roles
declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      roles?: string[];
    }
  }
}

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

export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  answers: { [questionId: string]: any };
  submittedAt: Date;
}

export const Surveys = new Mongo.Collection<SurveyDoc>('surveys');

export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  answers: { [questionId: string]: any };
  submittedAt: Date;
}

export const SurveyResponses = new Mongo.Collection<SurveyResponseDoc>('survey_responses');

if (Meteor.isServer) {
  Meteor.publish('surveys.all', function () {
    return Surveys.find();
  });
  Meteor.publish('surveys.public', function (shareToken: string) {
    return Surveys.find({ shareToken, published: true });
  });

  // Preview: allow owner or admin to view the latest draft (published or not)
  Meteor.publish('surveys.preview', function (shareToken: string) {
    check(shareToken, String);
    // Use find().fetch()[0] for synchronous access
    const surveyDoc = Surveys.find({ shareToken }).fetch()[0];
    if (!surveyDoc) return this.ready();
    if (surveyDoc.createdBy === this.userId || (this.userId && Meteor.users.findOne(this.userId)?.roles?.includes('admin'))) {
      return Surveys.find({ shareToken });
    }
    return this.ready();
  });
  
  // Publication for survey responses - only accessible to admin users
  Meteor.publish('survey_responses.all', function () {
    if (!this.userId) {
      return this.ready();
    }
    
    // Check if user is admin
    const user = Meteor.users.findOne(this.userId);
    if (user?.roles?.includes('admin')) {
      return SurveyResponses.find({});
    }
    
    return this.ready();
  });
  
  // Publication for responses to a specific survey
  Meteor.publish('survey_responses.bySurvey', function (surveyId) {
    check(surveyId, String);
    
    if (!this.userId) {
      return this.ready();
    }
    
    // Check if user is admin or survey creator
    const user = Meteor.users.findOne(this.userId);
    const survey = Surveys.findOne(surveyId);
    
    if (user?.roles?.includes('admin') || (survey && survey.createdBy === this.userId)) {
      return SurveyResponses.find({ surveyId });
    }
    
    return this.ready();
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
          title: survey.title || '',
          description: survey.description || '',
          logo: survey.logo,
          image: survey.image,
          color: survey.color,
          selectedQuestions: survey.selectedQuestions || {},
          siteTextQuestions: survey.siteTextQuestions || [],
          siteTextQForm: survey.siteTextQForm || {},
          selectedDemographics: survey.selectedDemographics || [],
          published: false,
          updatedAt: now,
        },
      });
    } else {
      // Insert new
      const doc = {
        title: survey.title || '',
        description: survey.description || '',
        logo: survey.logo,
        image: survey.image,
        color: survey.color,
        selectedQuestions: survey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || [],
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

    // Fetch the existing survey from the DB
    const existingRaw = survey._id && await Surveys.findOneAsync(survey._id);
    const existing: SurveyDoc | undefined = (typeof existingRaw === 'object' && existingRaw !== null ? existingRaw as SurveyDoc : undefined);

    // If already published and has a shareToken, just return it
    if (existing && existing.published && existing.shareToken) {
      return { _id: existing._id, shareToken: existing.shareToken };
    }

    // If not, generate a new token if needed
    const shareToken = existing?.shareToken || Random.id(12);

    if (survey._id) {
      await Surveys.updateAsync(survey._id, {
        $set: {
          title: survey.title || (existing ? existing.title : ''),
          description: survey.description || (existing ? existing.description : ''),
          logo: survey.logo ?? (existing ? existing.logo : undefined),
          image: survey.image ?? (existing ? existing.image : undefined),
          color: survey.color ?? (existing ? existing.color : undefined),
          selectedQuestions: survey.selectedQuestions || (existing ? existing.selectedQuestions : {}),
          siteTextQuestions: survey.siteTextQuestions || (existing ? existing.siteTextQuestions : []),
          siteTextQForm: survey.siteTextQForm || (existing ? existing.siteTextQForm : {}),
          selectedDemographics: survey.selectedDemographics || (existing ? existing.selectedDemographics : []),
          published: true,
          shareToken,
          updatedAt: now,
        },
      });
      return { _id: survey._id, shareToken };
    } else {
      const doc = {
        title: survey.title || '',
        description: survey.description || '',
        logo: survey.logo,
        image: survey.image,
        color: survey.color,
        selectedQuestions: survey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || [],
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
  },
});
