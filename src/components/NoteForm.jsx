import { useState } from 'react';
import styles from './NoteForm.module.css';

export function NoteForm({ onSave }) {
  const [content, setContent] = useState('');
  const [callDate, setCallDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ content: content.trim(), callDate });
    setContent('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="date"
        value={callDate}
        onChange={(e) => setCallDate(e.target.value)}
        className={styles.dateInput}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a call note..."
        className={styles.textarea}
        rows={2}
      />
      <button type="submit" className={styles.addBtn}>
        Add Note
      </button>
    </form>
  );
}
