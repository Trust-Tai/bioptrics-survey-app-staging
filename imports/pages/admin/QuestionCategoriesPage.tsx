import React from 'react';
import QuestionCategoriesComponent from '../../features/question-categories/components/QuestionCategories';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';

const QuestionCategoriesPage: React.FC = () => {
  console.log('Rendering QuestionCategoriesPage');
  
  return (
    <AdminLayout>
      <QuestionCategoriesComponent />
    </AdminLayout>
  );
};

export default QuestionCategoriesPage;
