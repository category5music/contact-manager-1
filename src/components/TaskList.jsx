import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttachments } from '../hooks/useAttachments';
import { AttachmentList } from './AttachmentList';
import { AttachmentUpload } from './AttachmentUpload';
import styles from './TaskList.module.css';

const priorityStyles = {
  low: styles.priorityLow,
  high: styles.priorityHigh,
  urgent: styles.priorityUrgent,
};

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const { isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority || 'low',
  });

  const {
    uploading,
    error,
    clearError,
    handleFileUpload,
    handleAddLink,
    handleDelete: handleDeleteAttachment,
    canAttach,
  } = useAttachments('tasks', task.id, task.attachments || [], (newAttachments) =>
    onUpdate(task.id, { attachments: newAttachments })
  );

  const handleSave = () => {
    if (!editData.title.trim()) return;
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority || 'low',
    });
    setIsEditing(false);
  };

  const attachmentCount = task.attachments?.length || 0;

  if (isEditing) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
        <div className={styles.editForm}>
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            className={styles.editInput}
            autoFocus
          />
          <input
            type="date"
            value={editData.dueDate}
            onChange={(e) =>
              setEditData({ ...editData, dueDate: e.target.value })
            }
            className={styles.editDate}
          />
          <select
            value={editData.priority}
            onChange={(e) =>
              setEditData({ ...editData, priority: e.target.value })
            }
            className={styles.editPriority}
          >
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

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
            attachments={task.attachments}
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
    <li
      className={`${styles.item} ${task.completed ? styles.completed : ''} ${priorityStyles[task.priority] || ''}`}
    >
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className={styles.checkmark}></span>
      </label>
      <div className={styles.content}>
        <span className={styles.title}>{task.title}</span>
        {task.dueDate && (
          <span className={styles.dueDate}>Due: {task.dueDate}</span>
        )}

        {/* Attachment indicator/toggle */}
        {attachmentCount > 0 && (
          <button
            className={styles.attachmentToggle}
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachments(!showAttachments);
            }}
          >
            📎 {attachmentCount} attachment{attachmentCount !== 1 ? 's' : ''}
            {showAttachments ? ' ▲' : ' ▼'}
          </button>
        )}

        {/* Inline attachments display */}
        {showAttachments && (
          <AttachmentList
            attachments={task.attachments}
            onDelete={handleDeleteAttachment}
            canDelete={canAttach}
          />
        )}
      </div>
      <button
        className={styles.editBtn}
        onClick={() => setIsEditing(true)}
        aria-label="Edit task"
      >
        ✎
      </button>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        &times;
      </button>
    </li>
  );
}

export function TaskList({ tasks, onToggle, onDelete, onUpdate }) {
  if (tasks.length === 0) {
    return <p className={styles.empty}>No tasks yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
