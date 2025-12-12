import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Enrollments, EnrollmentDoc, ModuleProgress, TopicProgress } from './enrollments';
import { Courses } from './courses';
import { Modules } from './modules';
import { Topics } from './topics';

Meteor.methods({
  // Enroll user in a course
  async 'enrollments.enroll'(courseId: string) {
    check(courseId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    // Check if already enrolled
    const existing = await Enrollments.findOneAsync({ userId, courseId });
    if (existing) {
      return existing._id;
    }

    // Get course modules and topics to initialize progress
    const modules = await Modules.find({ courseId }, { sort: { order: 1 } }).fetchAsync();
    const modulesProgress: ModuleProgress[] = [];
    
    for (const module of modules) {
      const topics = await Topics.find({ moduleId: module._id }, { sort: { order: 1 } }).fetchAsync();
      modulesProgress.push({
        moduleId: module._id,
        topicsProgress: topics.map(topic => ({
          topicId: topic._id,
          completed: false,
        })),
        completed: false,
      });
    }

    // Set first module and topic as current
    const firstModule = modules[0];
    const firstTopic = firstModule 
      ? await Topics.findOneAsync({ moduleId: firstModule._id }, { sort: { order: 1 } })
      : null;

    const enrollmentId = await Enrollments.insertAsync({
      userId,
      courseId,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      currentModuleId: firstModule?._id,
      currentTopicId: firstTopic?._id,
      modulesProgress,
      overallProgress: 0,
      completed: false,
    } as any);

    return enrollmentId;
  },

  // Mark topic as complete
  async 'enrollments.completeTopic'(courseId: string, topicId: string) {
    check(courseId, String);
    check(topicId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    console.log('completeTopic: userId =', userId, 'courseId =', courseId, 'topicId =', topicId);

    try {
      const enrollment = await Enrollments.findOneAsync({ userId, courseId });
      if (!enrollment) {
        console.log('completeTopic: Enrollment not found for userId =', userId);
        throw new Meteor.Error('not-found', 'Enrollment not found');
      }

      // Get topic to find its module
      const topic = await Topics.findOneAsync(topicId);
      if (!topic) {
        console.log('completeTopic: Topic not found:', topicId);
        throw new Meteor.Error('not-found', 'Topic not found');
      }

      console.log('completeTopic: Found topic in module:', topic.moduleId);

      // Initialize modulesProgress if empty (for legacy enrollments)
      let modulesProgress = [...(enrollment.modulesProgress || [])];
      
      // Check if module exists in progress, if not add it
      const moduleInProgress = modulesProgress.find(mp => mp.moduleId === topic.moduleId);
      if (!moduleInProgress) {
        console.log('completeTopic: Adding new module to progress:', topic.moduleId);
        // Get all topics for this module
        const moduleTopics = await Topics.find({ moduleId: topic.moduleId }, { sort: { order: 1 } }).fetchAsync();
        modulesProgress.push({
          moduleId: topic.moduleId,
          topicsProgress: moduleTopics.map(t => ({
            topicId: t._id,
            completed: t._id === topicId, // Mark current topic as complete
            completedAt: t._id === topicId ? new Date() : undefined,
          })),
          completed: moduleTopics.length === 1, // Complete if only one topic
          completedAt: moduleTopics.length === 1 ? new Date() : undefined,
        });
      } else {
        // Update existing module progress
        modulesProgress = modulesProgress.map(mp => {
          if (mp.moduleId === topic.moduleId) {
            // Check if topic exists in progress
            let topicsProgress = [...mp.topicsProgress];
            const topicInProgress = topicsProgress.find(tp => tp.topicId === topicId);
            
            if (!topicInProgress) {
              // Add the topic if it doesn't exist
              topicsProgress.push({
                topicId,
                completed: true,
                completedAt: new Date(),
              });
            } else {
              // Update existing topic
              topicsProgress = topicsProgress.map(tp => {
                if (tp.topicId === topicId && !tp.completed) {
                  return { ...tp, completed: true, completedAt: new Date() };
                }
                return tp;
              });
            }
            
            // Check if all topics in module are complete
            const allTopicsComplete = topicsProgress.every(tp => tp.completed);
            
            return {
              ...mp,
              topicsProgress,
              completed: allTopicsComplete,
              completedAt: allTopicsComplete ? new Date() : undefined,
            };
          }
          return mp;
        });
      }

      // Calculate overall progress
      let totalTopics = 0;
      let completedTopics = 0;
      modulesProgress.forEach(mp => {
        totalTopics += mp.topicsProgress.length;
        completedTopics += mp.topicsProgress.filter(tp => tp.completed).length;
      });
      const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Check if course is complete
      const allModulesComplete = modulesProgress.every(mp => mp.completed);

      console.log('completeTopic: Updating enrollment, progress =', overallProgress);

      await Enrollments.updateAsync(enrollment._id, {
        $set: {
          modulesProgress,
          overallProgress,
          completed: allModulesComplete,
          completedAt: allModulesComplete ? new Date() : undefined,
          lastAccessedAt: new Date(),
        },
      });

      console.log('completeTopic: Success!');
      return { overallProgress, completed: allModulesComplete };
    } catch (error: any) {
      console.error('completeTopic error:', error);
      if (error.error) {
        throw error; // Re-throw Meteor errors
      }
      throw new Meteor.Error('complete-failed', error.message || 'Failed to mark topic as complete');
    }
  },

  // Update current position in course
  async 'enrollments.updatePosition'(courseId: string, moduleId: string, topicId: string) {
    check(courseId, String);
    check(moduleId, String);
    check(topicId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    await Enrollments.updateAsync(
      { userId, courseId },
      {
        $set: {
          currentModuleId: moduleId,
          currentTopicId: topicId,
          lastAccessedAt: new Date(),
        },
      }
    );
  },

  // Get enrollment with progress
  async 'enrollments.getProgress'(courseId: string) {
    check(courseId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const enrollment = await Enrollments.findOneAsync({ userId, courseId });
    if (!enrollment) {
      return null;
    }

    // Get course details
    const course = await Courses.findOneAsync(courseId);
    const modules = await Modules.find({ courseId }, { sort: { order: 1 } }).fetchAsync();
    
    // Build detailed progress with module/topic info
    const modulesWithProgress = [];
    for (const module of modules) {
      const topics = await Topics.find({ moduleId: module._id }, { sort: { order: 1 } }).fetchAsync();
      const moduleProgress = enrollment.modulesProgress.find(mp => mp.moduleId === module._id);
      
      const topicsWithProgress = topics.map(topic => {
        const topicProgress = moduleProgress?.topicsProgress.find(tp => tp.topicId === topic._id);
        return {
          ...topic,
          completed: topicProgress?.completed || false,
          completedAt: topicProgress?.completedAt,
        };
      });

      const completedCount = topicsWithProgress.filter(t => t.completed).length;

      modulesWithProgress.push({
        ...module,
        topics: topicsWithProgress,
        completed: moduleProgress?.completed || false,
        completedCount,
        totalCount: topics.length,
      });
    }

    return {
      enrollment,
      course,
      modules: modulesWithProgress,
    };
  },

  // Get all enrollments for current user
  async 'enrollments.getMyEnrollments'() {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const enrollments = await Enrollments.find({ userId }, { sort: { lastAccessedAt: -1 } }).fetchAsync();
    
    // Enrich with course details
    const enrichedEnrollments = [];
    for (const enrollment of enrollments) {
      const course = await Courses.findOneAsync(enrollment.courseId);
      const modules = await Modules.find({ courseId: enrollment.courseId }, { sort: { order: 1 } }).fetchAsync();
      
      // Find next topic to continue
      let nextTopic = null;
      let nextModule = null;
      
      for (const mp of enrollment.modulesProgress) {
        const incompleteTopic = mp.topicsProgress.find(tp => !tp.completed);
        if (incompleteTopic) {
          nextTopic = await Topics.findOneAsync(incompleteTopic.topicId);
          nextModule = await Modules.findOneAsync(mp.moduleId);
          break;
        }
      }

      // Count total lessons
      let totalLessons = 0;
      let completedLessons = 0;
      enrollment.modulesProgress.forEach(mp => {
        totalLessons += mp.topicsProgress.length;
        completedLessons += mp.topicsProgress.filter(tp => tp.completed).length;
      });

      enrichedEnrollments.push({
        ...enrollment,
        course,
        modules,
        nextTopic,
        nextModule,
        totalLessons,
        completedLessons,
      });
    }
    
    return enrichedEnrollments;
  },

  // Auto-enroll in a course if not already enrolled
  async 'enrollments.autoEnroll'(courseId: string) {
    check(courseId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    console.log('Auto-enroll: userId =', userId, 'courseId =', courseId);

    try {
      const existing = await Enrollments.findOneAsync({ userId, courseId });
      if (existing) {
        console.log('Auto-enroll: Already enrolled, returning existing', existing._id);
        return existing;
      }

      // Direct enrollment instead of calling another method (preserves context)
      const modules = await Modules.find({ courseId }, { sort: { order: 1 } }).fetchAsync();
      console.log('Auto-enroll: Found', modules.length, 'modules');
      
      // Build modules progress with async topic fetching
      const modulesProgress: ModuleProgress[] = [];
      for (const module of modules) {
        const moduleTopics = await Topics.find({ moduleId: module._id }, { sort: { order: 1 } }).fetchAsync();
        modulesProgress.push({
          moduleId: module._id,
          topicsProgress: moduleTopics.map(topic => ({
            topicId: topic._id,
            completed: false,
          })),
          completed: false,
        });
      }

      // Set first module and topic as current
      const firstModule = modules[0];
      const firstTopic = firstModule 
        ? await Topics.findOneAsync({ moduleId: firstModule._id }, { sort: { order: 1 } })
        : null;

      const enrollmentId = await Enrollments.insertAsync({
        userId,
        courseId,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        currentModuleId: firstModule?._id,
        currentTopicId: firstTopic?._id,
        modulesProgress,
        overallProgress: 0,
        completed: false,
      } as any);

      console.log('Auto-enroll: Created enrollment', enrollmentId);
      return await Enrollments.findOneAsync(enrollmentId);
    } catch (error: any) {
      console.error('Auto-enroll error:', error);
      throw new Meteor.Error('enrollment-failed', error.message || 'Failed to enroll in course');
    }
  },
});
