import { useTracker } from 'meteor/react-meteor-data';
import { Surveys } from '/imports/api/surveys';

export function useSurveys() {
  return useTracker(() => Surveys.find().fetch(), []);
}

export function useSurvey(surveyId: string) {
  return useTracker(() => Surveys.findOne(surveyId), [surveyId]);
}
