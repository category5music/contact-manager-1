import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

// Get user's collection reference
const getUserCollection = (userId, collectionName) =>
  collection(db, 'users', userId, collectionName);

// Fetch all documents from a collection
export async function fetchCollection(userId, collectionName) {
  const ref = getUserCollection(userId, collectionName);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Subscribe to real-time updates
export function subscribeToCollection(userId, collectionName, callback) {
  const ref = getUserCollection(userId, collectionName);
  const q = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}

// Save a single document
export async function saveDocument(userId, collectionName, docId, data) {
  const ref = doc(db, 'users', userId, collectionName, docId);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

// Delete a single document
export async function deleteDocument(userId, collectionName, docId) {
  const ref = doc(db, 'users', userId, collectionName, docId);
  await deleteDoc(ref);
}

// Batch upload (for initial sync from localStorage)
export async function batchUpload(userId, collectionName, items) {
  if (!items || items.length === 0) return;

  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(db, 'users', userId, collectionName, item.id);
    batch.set(ref, { ...item, updatedAt: new Date().toISOString() });
  });
  await batch.commit();
}

// Delete multiple documents
export async function batchDelete(userId, collectionName, docIds) {
  if (!docIds || docIds.length === 0) return;

  const batch = writeBatch(db);
  docIds.forEach((id) => {
    const ref = doc(db, 'users', userId, collectionName, id);
    batch.delete(ref);
  });
  await batch.commit();
}
