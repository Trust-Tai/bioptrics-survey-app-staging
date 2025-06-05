import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { WPSCategories } from '../../../wps-framework/api/wpsCategories';
import { Surveys } from '../../../surveys/api/surveys';

interface WPSCategory {
  _id?: string;
  name: string;
  color: string;
  description: string;
}

const WPSCategoriesTest: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [surveyCategories, setSurveyCategories] = useState<WPSCategory[]>([]);
  const [allCategories, setAllCategories] = useState<WPSCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use useTracker to fetch data reactively
  const { latestSurvey, isLoading: surveyLoading } = useTracker(() => {
    const surveySub = Meteor.subscribe('surveys.all');
    return {
      latestSurvey: Surveys.findOne({}, { sort: { updatedAt: -1 } }),
      isLoading: !surveySub.ready()
    };
  }, []);

  useEffect(() => {
    if (!surveyLoading && latestSurvey) {
      if (latestSurvey.defaultSettings?.categories?.length > 0) {
        // Subscribe to WPS categories from the survey
        const categoriesSub = Meteor.subscribe('wpsCategories.byIds', latestSurvey.defaultSettings.categories, {
          onReady: () => {
            const categories = WPSCategories.find({ 
              _id: { $in: latestSurvey.defaultSettings.categories } 
            }).fetch();
            setSurveyCategories(categories);
            setLoading(false);
          },
          onError: (error) => {
            setError(`Error fetching survey categories: ${error.message}`);
            setLoading(false);
          }
        });

        return () => {
          categoriesSub.stop();
        };
      } else {
        setError('No categories found in the latest survey');
        setLoading(false);
      }
    }
  }, [surveyLoading, latestSurvey]);

  // Also fetch all WPS categories for comparison
  useEffect(() => {
    const allCategoriesSub = Meteor.subscribe('wpsCategories.all', {
      onReady: () => {
        const categories = WPSCategories.find({}).fetch();
        setAllCategories(categories);
      },
      onError: (error) => {
        console.error('Error fetching all categories:', error);
      }
    });

    return () => {
      allCategoriesSub.stop();
    };
  }, []);

  if (loading) {
    return <div>Loading WPS categories from survey...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <h3>All Available WPS Categories:</h3>
        <ul>
          {allCategories.map(category => (
            <li key={category._id} style={{ color: category.color }}>
              {category.name} - {category.description}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h2>WPS Categories from Latest Survey</h2>
      <p>Survey ID: {latestSurvey?._id}</p>
      <p>Survey Title: {latestSurvey?.title}</p>
      
      <h3>Categories ({surveyCategories.length}):</h3>
      <ul>
        {surveyCategories.map(category => (
          <li key={category._id} style={{ color: category.color }}>
            {category.name} - {category.description}
          </li>
        ))}
      </ul>
      
      <h3>All Available WPS Categories ({allCategories.length}):</h3>
      <ul>
        {allCategories.map(category => (
          <li key={category._id} style={{ color: category.color }}>
            {category.name} - {category.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WPSCategoriesTest;
