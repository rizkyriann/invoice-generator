interface HistoryEntry<T> {
  state: T;
  timestamp: number;
  label?: string;
}

interface UndoRedoState<T> {
  past: HistoryEntry<T>[];
  present: T;
  future: HistoryEntry<T>[];
}

export interface UndoRedoActions {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY_SIZE = 30;

/**
 * Undo/Redo middleware for Zustand stores
 */
export function undoRedoMiddleware<T extends object>(
  config: (set: any, get: any) => T,
  _options: { label?: string } = {}
) {
  return (set: any, get: any) => {
    const initialState = config(set, get);

    const history: UndoRedoState<T> = {
      past: [],
      present: initialState,
      future: [],
    };

    const wrappedSet = (partial: any, replace?: boolean, label?: string) => {
      const currentState = get();

      // Save current state to past
      history.past.push({
        state: JSON.parse(JSON.stringify(currentState)),
        timestamp: Date.now(),
        label,
      });

      // Limit history size
      if (history.past.length > MAX_HISTORY_SIZE) {
        history.past.shift();
      }

      // Clear future on new action
      history.future = [];

      // Apply the change
      set(partial, replace);
    };

    const undo = () => {
      if (history.past.length === 0) return;

      const currentState = get();
      const previous = history.past.pop();

      if (previous) {
        history.future.unshift({
          state: JSON.parse(JSON.stringify(currentState)),
          timestamp: Date.now(),
        });

        set(previous.state, true);
      }
    };

    const redo = () => {
      if (history.future.length === 0) return;

      const currentState = get();
      const next = history.future.shift();

      if (next) {
        history.past.push({
          state: JSON.parse(JSON.stringify(currentState)),
          timestamp: Date.now(),
        });

        set(next.state, true);
      }
    };

    const canUndo = () => history.past.length > 0;
    const canRedo = () => history.future.length > 0;

    return {
      ...config(wrappedSet, get),
      undo,
      redo,
      canUndo,
      canRedo,
    };
  };
}
