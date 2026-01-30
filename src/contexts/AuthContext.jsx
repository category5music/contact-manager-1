import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return sessionStorage.getItem('googleAccessToken');
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Clear token if user signs out
      if (!firebaseUser) {
        sessionStorage.removeItem('googleAccessToken');
        setGoogleAccessToken(null);
      }
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Request access to read Google Contacts
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    const result = await signInWithPopup(auth, provider);

    // Extract and store the OAuth access token for Google API calls
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (accessToken) {
      sessionStorage.setItem('googleAccessToken', accessToken);
      setGoogleAccessToken(accessToken);
    }

    return result;
  };

  const signOut = async () => {
    sessionStorage.removeItem('googleAccessToken');
    setGoogleAccessToken(null);
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    isGuest: !user,
    googleAccessToken,
    hasGoogleToken: !!googleAccessToken,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
