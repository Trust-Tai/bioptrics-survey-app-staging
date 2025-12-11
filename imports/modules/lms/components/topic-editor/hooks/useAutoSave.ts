import { useState, useEffect, useRef, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import type { ContentBlock } from '../../../types/contentBlocks';

export const useAutoSave = (
  topicId: string | undefined, 
  contentBlocks: ContentBlock[], 
  delay: number = 2000,
  onSaveComplete?: () => void
) => {
  const [showSaved, setShowSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedIndicatorRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedIndicatorRef.current) clearTimeout(savedIndicatorRef.current);
    };
  }, []);

  // Serialize content for comparison (ignoring order changes that don't matter)
  const serializeContent = useCallback((blocks: ContentBlock[]): string => {
    try {
      return JSON.stringify(blocks);
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    // Don't auto-save if no topicId
    if (!topicId) {
      return;
    }

    const currentContent = serializeContent(contentBlocks);

    // On initial load, just store the content without saving
    if (isInitialLoadRef.current) {
      lastSavedContentRef.current = currentContent;
      isInitialLoadRef.current = false;
      return;
    }

    // Check if content actually changed
    if (currentContent === lastSavedContentRef.current) {
      setIsDirty(false);
      return;
    }

    // Content has changed
    setIsDirty(true);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      Meteor.call('topics.update', topicId, { contentBlocks }, (error: any) => {
        if (!error) {
          lastSavedContentRef.current = currentContent;
          setIsDirty(false);
          setShowSaved(true);
          // Notify that save is complete (allows server sync to resume)
          if (onSaveComplete) {
            onSaveComplete();
          }
          // Clear previous indicator timeout
          if (savedIndicatorRef.current) {
            clearTimeout(savedIndicatorRef.current);
          }
          savedIndicatorRef.current = setTimeout(() => setShowSaved(false), 2000);
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
  }, [topicId, contentBlocks, delay, serializeContent, onSaveComplete]);

  // Reset initial load flag when topicId changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    lastSavedContentRef.current = '';
  }, [topicId]);

  return { showSaved, isDirty };
};
