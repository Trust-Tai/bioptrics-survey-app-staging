import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  // To prevent initial state from being added to history
  const initialRender = useRef(true);

  // Set a new value without adding to history
  const set = useCallback((newPresent: T) => {
    setState(prevState => ({
      ...prevState,
      present: newPresent
    }));
  }, []);

  // Update state and add to history
  const update = useCallback((newPresent: T) => {
    setState(prevState => {
      // Skip adding to history on initial render
      if (initialRender.current) {
        initialRender.current = false;
        return {
          ...prevState,
          present: newPresent
        };
      }

      return {
        past: [...prevState.past, prevState.present],
        present: newPresent,
        future: []
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.past.length === 0) return prevState;

      const previous = prevState.past[prevState.past.length - 1];
      const newPast = prevState.past.slice(0, prevState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prevState.present, ...prevState.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.future.length === 0) return prevState;

      const next = prevState.future[0];
      const newFuture = prevState.future.slice(1);

      return {
        past: [...prevState.past, prevState.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    update,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

export default useUndoRedo;
