import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToCollection,
  saveDocument,
  deleteDocument,
  batchUpload,
  fetchCollection,
} from '../firebase/firestore';

export function useSyncedStorage(key, initialValue) {
  const { user, isGuest } = useAuth();

  // Initialize from localStorage
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const unsubscribeRef = useRef(null);
  const hasMigratedRef = useRef(false);
  const previousUserRef = useRef(null);

  // Always persist to localStorage (offline-first for guests)
  useEffect(() => {
    // Only save to localStorage when in guest mode
    if (isGuest) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [key, value, isGuest]);

  // Handle user authentication changes
  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user) {
      // User logged out - reset migration flag for next login
      hasMigratedRef.current = false;
      previousUserRef.current = null;
      return;
    }

    // Check if this is a new user login (not just a re-render)
    const isNewLogin = previousUserRef.current !== user.uid;
    previousUserRef.current = user.uid;

    const setupFirestoreSync = async () => {
      // Migrate localStorage data on first sign-in
      if (isNewLogin && !hasMigratedRef.current) {
        hasMigratedRef.current = true;

        try {
          // Check if user has existing data in Firestore
          const existingData = await fetchCollection(user.uid, key);

          if (existingData.length === 0) {
            // No cloud data - upload localStorage data
            const localData = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(localData) && localData.length > 0) {
              await batchUpload(user.uid, key, localData);
            }
          }
          // If user has cloud data, we'll receive it through the subscription
        } catch (error) {
          console.error('Migration error:', error);
        }
      }

      // Subscribe to real-time updates
      unsubscribeRef.current = subscribeToCollection(user.uid, key, (data) => {
        setValue(data);
      });
    };

    setupFirestoreSync();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, key]);

  // Create a wrapper that syncs changes to Firestore when authenticated
  const setValueWithSync = useCallback(
    (newValueOrUpdater) => {
      setValue((prev) => {
        const newValue =
          typeof newValueOrUpdater === 'function'
            ? newValueOrUpdater(prev)
            : newValueOrUpdater;

        // If authenticated, sync individual changes to Firestore
        if (user && Array.isArray(newValue) && Array.isArray(prev)) {
          // Find added/updated items
          const prevIds = new Set(prev.map((item) => item.id));
          const newIds = new Set(newValue.map((item) => item.id));

          // Items added or updated
          newValue.forEach((item) => {
            const prevItem = prev.find((p) => p.id === item.id);
            if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
              saveDocument(user.uid, key, item.id, item).catch(console.error);
            }
          });

          // Items deleted
          prev.forEach((item) => {
            if (!newIds.has(item.id)) {
              deleteDocument(user.uid, key, item.id).catch(console.error);
            }
          });
        }

        return newValue;
      });
    },
    [user, key]
  );

  return [value, setValueWithSync];
}
