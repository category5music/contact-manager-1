import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttachments } from '../hooks/useAttachments';
import { AttachmentList } from './AttachmentList';
import { AttachmentUpload } from './AttachmentUpload';
import styles from './NoteList.module.css';

function NoteItem({ note, onDelete, onUpdate }) {
  const { isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [editData, setEditData] = useState({
    content: note.content,
    callDate: note.callDate,
  });

  const {
    uploading,
    error,
    clearError,
    handleFileUpload,
    handleAddLink,
    handleDelete: handleDeleteAttachment,
    canAttach,
  } = useAttachments('notes', note.id, note.attachments || [], (newAttachments) =>
    onUpdate(note.id, { attachments: newAttachments })
  );

  const handleSave = () => {
    if (!editData.content.trim()) return;
    onUpdate(note.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      content: note.content,
      callDate: note.callDate,
    });
    setIsEditing(false);
  };

  const attachmentCount = note.attachments?.length || 0;

  if (isEditing) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
        <div className={styles.editForm}>
          <input
            type="date"
            value={editData.callDate}
            onChange={(e) =>
              setEditData({ ...editData, callDate: e.target.value })
            }
            className={styles.editDate}
          />
          <textarea
            value={editData.content}
            onChange={(e) =>
              setEditData({ ...editData, content: e.target.value })
            }
            className={styles.editTextarea}
            rows={3}
            autoFocus
          />

          {/* Attachment Upload in Edit Mode */}
          <AttachmentUpload
            onFileSelect={handleFileUpload}
            onAddLink={handleAddLink}
            uploading={uploading}
            error={error}
            onClearError={clearError}
            disabled={!canAttach}
          />

          {/* Show existing attachments */}
          <AttachmentList
            attachments={note.attachments}
            onDelete={handleDeleteAttachment}
            canDelete={canAttach}
          />

          <div className={styles.editButtons}>
            <button onClick={handleSave} className={styles.saveBtn}>
              Save
            </button>
            <button onClick={handleCancel} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <div className={styles.content}>
        <span className={styles.date}>{note.callDate}</span>
        <p className={styles.text}>{note.content}</p>

        {/* Attachment indicator/toggle */}
        {attachmentCount > 0 && (
          <button
            className={styles.attachmentToggle}
            onClick={() => setShowAttachments(!showAttachments)}
          >
            📎 {attachmentCount} attachment{attachmentCount !== 1 ? 's' : ''}
            {showAttachments ? ' ▲' : ' ▼'}
          </button>
        )}

        {/* Inline attachments display */}
        {showAttachments && (
          <AttachmentList
            attachments={note.attachments}
            onDelete={handleDeleteAttachment}
            canDelete={canAttach}
          />
        )}
      </div>
      <button
        className={styles.editBtn}
        onClick={() => setIsEditing(true)}
        aria-label="Edit note"
      >
        ✎
      </button>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(note.id)}
        aria-label="Delete note"
      >
        &times;
      </button>
    </li>
  );
}

export function NoteList({ notes, onDelete, onUpdate }) {
  if (notes.length === 0) {
    return <p className={styles.empty}>No call notes yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
