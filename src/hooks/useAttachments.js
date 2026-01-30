import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  uploadFile,
  deleteFile,
  createLinkAttachment,
  StorageError,
} from '../firebase/storage';

/**
 * Hook for managing attachments on a single item
 * @param {string} parentType - 'notes' | 'tasks' | 'contacts'
 * @param {string} parentId - ID of parent item
 * @param {Array} initialAttachments - Existing attachments
 * @param {Function} onUpdate - Callback when attachments change
 */
export function useAttachments(parentType, parentId, initialAttachments = [], onUpdate) {
  const { user, isGuest } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = useCallback(
    async (file) => {
      if (isGuest) {
        setError('Sign in to upload attachments');
        return null;
      }

      setUploading(true);
      setError(null);

      try {
        const attachment = await uploadFile(user.uid, parentType, parentId, file);
        const newAttachments = [...initialAttachments, attachment];
        onUpdate(newAttachments);
        return attachment;
      } catch (err) {
        const message =
          err instanceof StorageError
            ? err.message
            : 'Upload failed. Please try again.';
        setError(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [user, isGuest, parentType, parentId, initialAttachments, onUpdate]
  );

  const handleAddLink = useCallback(
    (url, title) => {
      if (isGuest) {
        setError('Sign in to add links');
        return null;
      }

      setError(null);

      try {
        const attachment = createLinkAttachment(url, title);
        const newAttachments = [...initialAttachments, attachment];
        onUpdate(newAttachments);
        return attachment;
      } catch (err) {
        const message =
          err instanceof StorageError
            ? err.message
            : 'Invalid link. Please check the URL.';
        setError(message);
        return null;
      }
    },
    [isGuest, initialAttachments, onUpdate]
  );

  const handleDelete = useCallback(
    async (attachmentId) => {
      const attachment = initialAttachments.find((a) => a.id === attachmentId);
      if (!attachment) return;

      setError(null);

      try {
        // Delete from storage if it's a file
        if (attachment.type === 'file' && attachment.storagePath) {
          await deleteFile(attachment.storagePath);
        }

        const newAttachments = initialAttachments.filter(
          (a) => a.id !== attachmentId
        );
        onUpdate(newAttachments);
      } catch (err) {
        setError('Failed to delete attachment');
      }
    },
    [initialAttachments, onUpdate]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    uploading,
    error,
    clearError,
    handleFileUpload,
    handleAddLink,
    handleDelete,
    canAttach: !isGuest,
  };
}
