import styles from './TasksListView.module.css';
import { getFullName } from '../utils/storage';

const priorityOrder = { urgent: 0, high: 1, low: 2 };
const priorityLabels = { urgent: 'Urgent', high: 'High Priority', low: 'Low Priority' };
const priorityColors = { urgent: '#f44336', high: '#ff9800', low: '#4caf50' };

export function TasksListView({ tasks, contacts, onTaskClick }) {
  // Sort tasks by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] ?? 2;
    const priorityB = priorityOrder[b.priority] ?? 2;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Secondary sort by due date
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  // Group tasks by priority
  const groupedTasks = {
    urgent: sortedTasks.filter((t) => t.priority === 'urgent'),
    high: sortedTasks.filter((t) => t.priority === 'high'),
    low: sortedTasks.filter((t) => t.priority === 'low' || !t.priority),
  };

  const getContactName = (contactId) => {
    if (!contactId) return 'No Contact';
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? getFullName(contact) : 'Unknown';
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tasks yet. Add a task above or from a contact's page.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {['urgent', 'high', 'low'].map((priority) => {
        const priorityTasks = groupedTasks[priority];
        if (priorityTasks.length === 0) return null;

        return (
          <div key={priority} className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span
                className={styles.priorityDot}
                style={{ backgroundColor: priorityColors[priority] }}
              />
              {priorityLabels[priority]} ({priorityTasks.length})
            </h3>
            <ul className={styles.list}>
              {priorityTasks.map((task) => (
                <li
                  key={task.id}
                  className={`${styles.item} ${task.completed ? styles.completed : ''} ${task.contactId ? styles.clickable : ''}`}
                  onClick={() => task.contactId && onTaskClick(task.contactId)}
                >
                  <div
                    className={styles.priorityBar}
                    style={{ backgroundColor: priorityColors[priority] }}
                  />
                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <span className={styles.title}>{task.title}</span>
                      {task.completed && <span className={styles.badge}>Done</span>}
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.contact}>{getContactName(task.contactId)}</span>
                      {task.dueDate && (
                        <span className={styles.dueDate}>Due: {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                  <span className={styles.arrow}>&rarr;</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
