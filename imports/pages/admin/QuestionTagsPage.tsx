import React from 'react';
import QuestionTagsComponent from '../../features/question-tags/components/QuestionTags';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

const QuestionTagsPage: React.FC = () => {
  console.log('Rendering QuestionTagsPage');
  
  return (
    <AdminLayout>
      <QuestionTagsComponent />
    </AdminLayout>
  );
};

export default QuestionTagsPage;
