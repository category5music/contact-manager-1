import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttachments } from '../hooks/useAttachments';
import { useAutoSave } from '../hooks/useAutoSave';
import { AttachmentList } from './AttachmentList';
import { AttachmentUpload } from './AttachmentUpload';
import styles from './NoteList.module.css';

function NoteItem({ note, onDelete, onUpdate, projects = [] }) {
  const { isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSave = useCallback(
    (data) => {
      onUpdate(note.id, data);
    },
    [note.id, onUpdate]
  );

  const { editData, setEditData, saveStatus, reset } = useAutoSave(
    {
      content: note.content,
      callDate: note.callDate,
      projectId: note.projectId || '',
    },
    handleSave
  );

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

  const handleStartEdit = () => {
    reset({
      content: note.content,
      callDate: note.callDate,
      projectId: note.projectId || '',
    });
    setIsEditing(true);
  };

  const handleDone = () => {
    if (!editData.content.trim()) return;
    setIsEditing(false);
  };

  const attachmentCount = note.attachments?.length || 0;
  const project = note.projectId ? projects.find((p) => p.id === note.projectId) : null;

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

          {/* Project Selector */}
          {projects.length > 0 && (
            <select
              value={editData.projectId}
              onChange={(e) =>
                setEditData({ ...editData, projectId: e.target.value || null })
              }
              className={styles.editProject}
            >
              <option value="">No Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

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
            <button onClick={handleDone} className={styles.doneBtn}>
              Done
            </button>
            <span className={styles.saveStatus}>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
            </span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <div className={styles.content}>
        <span className={styles.date}>{note.callDate}</span>
        {project && (
          <span className={styles.projectTag} style={{ backgroundColor: project.color }}>
            {project.name}
          </span>
        )}
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
        onClick={handleStartEdit}
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

export function NoteList({ notes, onDelete, onUpdate, projects = [] }) {
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
          projects={projects}
        />
      ))}
    </ul>
  );
}
