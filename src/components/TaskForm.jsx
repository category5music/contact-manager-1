import { useState } from 'react';
import styles from './TaskForm.module.css';

export function TaskForm({ onSave, projects = [] }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('low');
  const [projectId, setProjectId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), dueDate, priority, projectId: projectId || null });
    setTitle('');
    setDueDate('');
    setPriority('low');
    setProjectId('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className={styles.input}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.dateInput}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className={styles.prioritySelect}
      >
        <option value="low">Low Priority</option>
        <option value="high">High Priority</option>
        <option value="urgent">Urgent</option>
      </select>
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
        Add
      </button>
    </form>
  );
}
