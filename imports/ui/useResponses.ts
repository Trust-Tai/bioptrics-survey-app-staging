import { useTracker } from 'meteor/react-meteor-data';
import { Responses, ResponseDoc } from '/imports/api/responses';
import { Meteor } from 'meteor/meteor';

export function useResponses() {
  const responses = useTracker(() => {
    Meteor.subscribe('responses.all');
    return Responses.find().fetch() as ResponseDoc[];
  }, []);
  return responses;
}
