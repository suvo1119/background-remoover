import { useState, useCallback } from 'react';

const useImageHistory = (initialState = null) => {
  const [history, setHistory] = useState(initialState ? [initialState] : []);
  const [currentIndex, setCurrentIndex] = useState(initialState ? 0 : -1);

  const addToHistory = useCallback((newState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory(initialState ? [initialState] : []);
    setCurrentIndex(initialState ? 0 : -1);
  }, [initialState]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex] || null;

  return {
    currentState,
    addToHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex
  };
};

export default useImageHistory;