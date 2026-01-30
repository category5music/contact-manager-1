import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchGoogleContacts,
  GoogleContactsError,
} from '../services/googleContactsApi';

const CACHE_KEY = 'googleContactsCache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Hook for fetching and caching Google contacts
 * @returns {Object} { contacts, loading, error, refetch, isAvailable }
 */
export function useGoogleContacts() {
  const { googleAccessToken, hasGoogleToken, user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if Google Contacts feature is available
  const isAvailable = hasGoogleToken && !!user;

  // Load from cache on mount or when user changes
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    const cached = loadFromCache(user.uid);
    if (cached) {
      setContacts(cached);
    }
  }, [user]);

  const fetchContacts = useCallback(async () => {
    if (!googleAccessToken) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchGoogleContacts(googleAccessToken);
      setContacts(data);
      saveToCache(user.uid, data);
    } catch (err) {
      if (err instanceof GoogleContactsError) {
        if (err.status === 401) {
          // Token expired - clear it
          sessionStorage.removeItem('googleAccessToken');
          setError(
            'Google session expired. Please sign in again to use contacts import.'
          );
        } else if (err.status === 403) {
          setError(
            'Contacts permission was denied. Please grant access to import contacts.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load Google contacts');
      }
      console.error('Google Contacts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [googleAccessToken, user?.uid]);

  // Fetch contacts when token is available and cache is stale
  useEffect(() => {
    if (!isAvailable) return;

    const cached = loadFromCache(user.uid);
    if (cached && !isCacheStale(user.uid)) {
      // Cache is fresh, no need to fetch
      return;
    }

    // Fetch fresh data
    fetchContacts();
  }, [isAvailable, user?.uid, fetchContacts]);

  const refetch = useCallback(() => {
    clearCache(user?.uid);
    return fetchContacts();
  }, [fetchContacts, user?.uid]);

  return {
    contacts,
    loading,
    error,
    refetch,
    isAvailable,
  };
}

// Cache helpers
function loadFromCache(userId) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!cached) return null;
    const { data } = JSON.parse(cached);
    return data;
  } catch {
    return null;
  }
}

function saveToCache(userId, data) {
  try {
    localStorage.setItem(
      `${CACHE_KEY}_${userId}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (err) {
    console.warn('Failed to cache Google contacts:', err);
  }
}

function isCacheStale(userId) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!cached) return true;
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp > CACHE_TTL;
  } catch {
    return true;
  }
}

function clearCache(userId) {
  if (userId) {
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
  }
}
