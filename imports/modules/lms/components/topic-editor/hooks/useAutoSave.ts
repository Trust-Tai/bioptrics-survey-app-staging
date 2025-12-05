import { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import type { ContentBlock } from '../../../types/contentBlocks';

export const useAutoSave = (topicId: string | undefined, contentBlocks: ContentBlock[], delay: number = 2000) => {
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't auto-save if no topicId or no blocks
    if (!topicId || contentBlocks.length === 0) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      Meteor.call('topics.update', topicId, { contentBlocks }, (error: any) => {
        if (!error) {
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        } else {
          console.error('Auto-save error:', error);
        }
      });
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [topicId, contentBlocks, delay]);

  return { showSaved };
};
