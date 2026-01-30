import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';
import { generateId } from '../utils/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export class StorageError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(
      `File size exceeds 10 MB limit. File is ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      'file-too-large'
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new StorageError(
      `File type "${file.type || 'unknown'}" is not supported. Allowed: PDF, Word, JPEG, PNG, GIF, WebP`,
      'invalid-type'
    );
  }

  return true;
}

/**
 * Upload a file to Firebase Storage
 * @param {string} userId - Current user ID
 * @param {string} parentType - 'notes' | 'tasks' | 'contacts'
 * @param {string} parentId - ID of the note/task/contact
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Attachment metadata
 */
export async function uploadFile(userId, parentType, parentId, file) {
  validateFile(file);

  const attachmentId = generateId();
  const storagePath = `users/${userId}/attachments/${parentType}/${parentId}/${attachmentId}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  // Upload the file
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedBy: userId,
    },
  });

  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    id: attachmentId,
    type: 'file',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    storagePath,
    downloadUrl,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete a file from Firebase Storage
 * @param {string} storagePath - Path to the file in storage
 */
export async function deleteFile(storagePath) {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Create a link attachment (no storage needed)
 * @param {string} url - The URL
 * @param {string} title - Optional display title
 * @returns {Object} Attachment metadata
 */
export function createLinkAttachment(url, title = '') {
  // Basic URL validation
  try {
    new URL(url);
  } catch {
    throw new StorageError('Invalid URL format', 'invalid-url');
  }

  return {
    id: generateId(),
    type: 'link',
    url,
    title: title || url,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get icon name based on MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} Icon identifier
 */
export function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.includes('word')) return 'word';
  return 'file';
}
