import styles from './NotesListView.module.css';
import { getFullName } from '../utils/storage';

export function NotesListView({ notes, contacts, onNoteClick, projects = [] }) {
  // Sort notes chronologically by callDate (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.callDate && b.callDate) return b.callDate.localeCompare(a.callDate);
    if (a.callDate) return -1;
    if (b.callDate) return 1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  // Group notes by date
  const groupedNotes = sortedNotes.reduce((groups, note) => {
    const date = note.callDate || 'No Date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
    return groups;
  }, {});

  const getContactName = (contactId) => {
    if (!contactId) return 'No Contact';
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? getFullName(contact) : 'Unknown';
  };

  const getProject = (projectId) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'No Date') return 'No Date';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (notes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No notes yet. Add notes from a contact's page.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {Object.entries(groupedNotes).map(([date, dateNotes]) => (
        <div key={date} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {formatDate(date)}
            <span className={styles.count}>({dateNotes.length})</span>
          </h3>
          <ul className={styles.list}>
            {dateNotes.map((note) => {
              const project = getProject(note.projectId);
              return (
                <li
                  key={note.id}
                  className={`${styles.item} ${note.contactId ? styles.clickable : ''}`}
                  onClick={() => note.contactId && onNoteClick && onNoteClick(note.contactId)}
                >
                  <div className={styles.content}>
                    <div className={styles.noteText}>
                      {note.content}
                      {project && (
                        <span className={styles.projectTag} style={{ backgroundColor: project.color }}>
                          {project.name}
                        </span>
                      )}
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.contact}>{getContactName(note.contactId)}</span>
                    </div>
                  </div>
                  {note.contactId && <span className={styles.arrow}>&rarr;</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
