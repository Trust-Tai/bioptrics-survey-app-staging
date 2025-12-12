import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Notes, NoteDoc } from './notes';
import { Courses } from './courses';
import { Topics } from './topics';

Meteor.methods({
  // Create a new note
  async 'notes.create'(data: { courseId: string; topicId?: string; moduleId?: string; title?: string; content: string }) {
    check(data.courseId, String);
    check(data.content, String);
    check(data.topicId, Match.Maybe(String));
    check(data.moduleId, Match.Maybe(String));
    check(data.title, Match.Maybe(String));

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const noteId = await Notes.insertAsync({
      userId,
      courseId: data.courseId,
      moduleId: data.moduleId,
      topicId: data.topicId,
      title: data.title || '',
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return noteId;
  },

  // Update a note
  async 'notes.update'(noteId: string, data: { title?: string; content: string }) {
    check(noteId, String);
    check(data.content, String);
    check(data.title, Match.Maybe(String));

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const note = await Notes.findOneAsync(noteId);
    if (!note) {
      throw new Meteor.Error('not-found', 'Note not found');
    }
    // Allow updates for admin users (JWT auth) or note owner
    if (this.userId && note.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own notes');
    }

    await Notes.updateAsync(noteId, {
      $set: {
        title: data.title || '',
        content: data.content,
        updatedAt: new Date(),
      },
    });

    return noteId;
  },

  // Delete a note
  async 'notes.delete'(noteId: string) {
    check(noteId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const note = await Notes.findOneAsync(noteId);
    if (!note) {
      throw new Meteor.Error('not-found', 'Note not found');
    }
    // Allow deletion for admin users (JWT auth) or note owner
    if (this.userId && note.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own notes');
    }

    await Notes.removeAsync(noteId);
    return true;
  },

  // Get all notes for current user
  'notes.getMyNotes'() {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const notes = Notes.find({ userId }, { sort: { updatedAt: -1 } }).fetch();

    // Enrich with course and topic info
    return notes.map(note => {
      const course = Courses.findOne(note.courseId);
      const topic = note.topicId ? Topics.findOne(note.topicId) : null;
      
      return {
        ...note,
        courseName: course?.title || 'Unknown Course',
        topicName: topic?.title || '',
      };
    });
  },

  // Get notes by course
  'notes.getByCourse'(courseId: string) {
    check(courseId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const notes = Notes.find({ userId, courseId }, { sort: { updatedAt: -1 } }).fetch();

    return notes.map(note => {
      const topic = note.topicId ? Topics.findOne(note.topicId) : null;
      
      return {
        ...note,
        topicName: topic?.title || '',
      };
    });
  },

  // Get notes by topic
  'notes.getByTopic'(topicId: string) {
    check(topicId, String);

    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    return Notes.find({ userId, topicId }, { sort: { updatedAt: -1 } }).fetch();
  },

  // Get notes statistics
  'notes.getStats'() {
    // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
    const userId = this.userId || 'admin'; // Fallback for JWT auth

    const notes = Notes.find({ userId }).fetch();
    const courseIds = [...new Set(notes.map(n => n.courseId))];
    
    // Count notes updated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const updatedToday = notes.filter(n => n.updatedAt >= today).length;

    // Group notes by course
    const notesByCourse = courseIds.map(courseId => {
      const course = Courses.findOne(courseId);
      const courseNotes = notes.filter(n => n.courseId === courseId);
      const latestUpdate = courseNotes.reduce((latest, note) => 
        note.updatedAt > latest ? note.updatedAt : latest, 
        new Date(0)
      );
      
      return {
        courseId,
        courseName: course?.title || 'Unknown Course',
        noteCount: courseNotes.length,
        lastUpdated: latestUpdate,
      };
    });

    return {
      totalNotes: notes.length,
      coursesWithNotes: courseIds.length,
      updatedToday,
      notesByCourse,
    };
  },
});
