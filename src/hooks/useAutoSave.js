import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave(initialData, onSave, debounceDelay = 1000) {
  const [editData, setEditData] = useState(initialData);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const timeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);
  const hasChangedRef = useRef(false);

  // Track if data has changed from initial
  useEffect(() => {
    const hasChanged = JSON.stringify(editData) !== JSON.stringify(initialDataRef.current);
    hasChangedRef.current = hasChanged;
  }, [editData]);

  // Debounced save effect
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't save if data hasn't changed from initial
    if (!hasChangedRef.current) {
      return;
    }

    setSaveStatus('saving');

    timeoutRef.current = setTimeout(() => {
      onSave(editData);
      setSaveStatus('saved');
      initialDataRef.current = editData;
      hasChangedRef.current = false;

      // Reset to idle after showing "Saved" briefly
      setTimeout(() => {
        setSaveStatus('idle');
      }, 1500);
    }, debounceDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [editData, onSave, debounceDelay]);

  // Reset when initialData changes (e.g., switching between items)
  const reset = useCallback((newData) => {
    setEditData(newData);
    initialDataRef.current = newData;
    hasChangedRef.current = false;
    setSaveStatus('idle');
  }, []);

  return {
    editData,
    setEditData,
    saveStatus,
    reset,
  };
}
