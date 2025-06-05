import { useEffect, useRef, useState } from 'react';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  interval = 30000, // Default 30 seconds
  debounceMs = 2000, // Default 2 seconds
  enabled = true
}: AutosaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(data);

  // Update the ref whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Function to perform the save
  const performSave = async () => {
    if (!enabled) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await onSave(dataRef.current);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error during autosave'));
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save on data change
  useEffect(() => {
    if (!enabled) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled]);

  // Periodic save on interval
  useEffect(() => {
    if (!enabled) return;
    
    // Set interval for periodic saves
    intervalRef.current = setInterval(() => {
      performSave();
    }, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);

  // Manual save function
  const save = async () => {
    await performSave();
  };

  return {
    lastSaved,
    isSaving,
    error,
    save
  };
}

export default useAutosave;
