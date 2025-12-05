import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Courses } from '../../../api/courses';
import { Modules } from '../../../api/modules';
import { Topics } from '../../../api/topics';

export const useTopicEditor = (
  courseId: string | undefined,
  moduleId: string | undefined,
  topicId: string | undefined
) => {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // Fetch data from Meteor
  const { topic, module, course, loading } = useTracker(() => {
    const topicSub = Meteor.subscribe('topics.single', topicId);
    const moduleSub = Meteor.subscribe('modules.single', moduleId);
    const courseSub = Meteor.subscribe('courses.single', courseId);
    const courseModulesSub = Meteor.subscribe('modules.byCourse', courseId);
    const courseTopicsSub = Meteor.subscribe('topics.byCourse', courseId);
    
    const topicDoc = Topics.findOne(topicId);
    const moduleDoc = Modules.findOne(moduleId);
    const courseDoc = Courses.findOne(courseId);
    
    // Fetch all modules for the course and populate with topics
    const courseModules = Modules.find({ courseId }, { sort: { order: 1 } }).fetch();
    const modulesWithTopics = courseModules.map(mod => ({
      ...mod,
      topics: Topics.find({ moduleId: mod._id }, { sort: { order: 1 } }).fetch(),
    }));
    
    // Add modules to course
    const courseWithModules = courseDoc ? {
      ...courseDoc,
      modules: modulesWithTopics,
    } : null;
    
    return {
      topic: topicDoc,
      module: {
        ...moduleDoc,
        topics: Topics.find({ moduleId }, { sort: { order: 1 } }).fetch(),
      },
      course: courseWithModules,
      loading: !topicSub.ready() || !moduleSub.ready() || !courseSub.ready() || !courseModulesSub.ready() || !courseTopicsSub.ready(),
    };
  }, [topicId, moduleId, courseId]);

  // Initialize edit title from topic
  useEffect(() => {
    if (topic?.title) {
      setEditTitle(topic.title);
    }
  }, [topic?.title]);

  const handleBackToCourseBuilder = () => {
    navigate(`/admin/lms/builder/${courseId}`);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && topicId) {
      Meteor.call('topics.update', topicId, { title: editTitle.trim() }, (error: any) => {
        if (!error) {
          setIsEditingTitle(false);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        } else {
          console.error('Title save error:', error);
        }
      });
    }
  };

  const handleCancelEditTitle = () => {
    setEditTitle(topic?.title || '');
    setIsEditingTitle(false);
  };

  return {
    topic,
    module,
    course,
    loading,
    isEditingTitle,
    setIsEditingTitle,
    editTitle,
    setEditTitle,
    showSaved,
    setShowSaved,
    handleBackToCourseBuilder,
    handleSaveTitle,
    handleCancelEditTitle,
  };
};
