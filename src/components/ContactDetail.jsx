import { NoteList } from './NoteList';
import { NoteForm } from './NoteForm';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { getFullName } from '../utils/storage';
import styles from './ContactDetail.module.css';

export function ContactDetail({
  contact,
  notes,
  tasks,
  onBack,
  onEdit,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          &larr; Back
        </button>
        <button className={styles.editBtn} onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className={styles.info}>
        <h2 className={styles.name}>{getFullName(contact)}</h2>
        {contact.company && <p className={styles.company}>{contact.company}</p>}
        {contact.email && (
          <p className={styles.detail}>
            <strong>Email:</strong> {contact.email}
          </p>
        )}
        {contact.phone && (
          <p className={styles.detail}>
            <strong>Phone:</strong> {contact.phone}
          </p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Call Notes</h3>
        <NoteForm onSave={onAddNote} />
        <NoteList notes={notes} onDelete={onDeleteNote} onUpdate={onUpdateNote} />
      </div>

      <div className={styles.section}>
        <h3>Tasks</h3>
        <TaskForm onSave={onAddTask} />
        <TaskList tasks={tasks} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
      </div>
    </div>
  );
}
