import { useState } from 'react';
import styles from './NoteList.module.css';

function NoteItem({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    content: note.content,
    callDate: note.callDate,
  });

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

  if (isEditing) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
        <div className={styles.editForm}>
          <input
            type="date"
            value={editData.callDate}
            onChange={(e) => setEditData({ ...editData, callDate: e.target.value })}
            className={styles.editDate}
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            className={styles.editTextarea}
            rows={3}
            autoFocus
          />
          <div className={styles.editButtons}>
            <button onClick={handleSave} className={styles.saveBtn}>Save</button>
            <button onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
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
