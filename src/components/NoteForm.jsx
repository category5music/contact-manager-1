import { useState } from 'react';
import styles from './NoteForm.module.css';

export function NoteForm({ onSave, projects = [] }) {
  const [content, setContent] = useState('');
  const [callDate, setCallDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [projectId, setProjectId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ content: content.trim(), callDate, projectId: projectId || null });
    setContent('');
    setProjectId('');
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
      {projects.length > 0 && (
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={styles.projectSelect}
        >
          <option value="">No Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className={styles.addBtn}>
        Add Note
      </button>
    </form>
  );
}
