import { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getFullName } from '../utils/storage';
import styles from './TasksListView.module.css';

const priorityOrder = { urgent: 0, high: 1, low: 2 };
const priorityLabels = { urgent: 'Urgent', high: 'High Priority', low: 'Low Priority' };
const priorityColors = { urgent: '#f44336', high: '#ff9800', low: '#4caf50' };

export function TasksListView({ tasks, contacts, onTaskClick, projects = [] }) {
  // Persist sort preference in localStorage
  const [sortConfig, setSortConfig] = useLocalStorage('taskSortPreference', {
    sortBy: 'priority',
    sortDirection: 'asc',
  });

  // Sort tasks based on current configuration
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks];

    if (sortConfig.sortBy === 'priority') {
      sorted.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] ?? 2;
        const priorityB = priorityOrder[b.priority] ?? 2;
        const primaryCompare =
          sortConfig.sortDirection === 'asc'
            ? priorityA - priorityB
            : priorityB - priorityA;

        if (primaryCompare !== 0) return primaryCompare;

        // Secondary sort by due date
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });
    } else if (sortConfig.sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        // Tasks without due dates go to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        const compare = a.dueDate.localeCompare(b.dueDate);
        return sortConfig.sortDirection === 'asc' ? compare : -compare;
      });
    }

    return sorted;
  }, [tasks, sortConfig]);

  // Group tasks by priority (only when sorting by priority)
  const groupedTasks = useMemo(() => {
    if (sortConfig.sortBy !== 'priority') {
      return null;
    }
    return {
      urgent: sortedTasks.filter((t) => t.priority === 'urgent'),
      high: sortedTasks.filter((t) => t.priority === 'high'),
      low: sortedTasks.filter((t) => t.priority === 'low' || !t.priority),
    };
  }, [sortedTasks, sortConfig.sortBy]);

  const handleSortChange = (sortBy) => {
    if (sortConfig.sortBy === sortBy) {
      // Toggle direction if same sort field
      setSortConfig({
        ...sortConfig,
        sortDirection: sortConfig.sortDirection === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // New sort field, default to ascending
      setSortConfig({ sortBy, sortDirection: 'asc' });
    }
  };

  const getContactName = (contactId) => {
    if (!contactId) return 'No Contact';
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? getFullName(contact) : 'Unknown';
  };

  const getSortIcon = (field) => {
    if (sortConfig.sortBy !== field) return '';
    return sortConfig.sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getProject = (projectId) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  // Render task item (extracted for reuse)
  const renderTaskItem = (task) => {
    const project = getProject(task.projectId);
    return (
    <li
      key={task.id}
      className={`${styles.item} ${task.completed ? styles.completed : ''} ${task.contactId ? styles.clickable : ''}`}
      onClick={() => task.contactId && onTaskClick(task.contactId)}
    >
      <div
        className={styles.priorityBar}
        style={{ backgroundColor: priorityColors[task.priority] || priorityColors.low }}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{task.title}</span>
          {project && (
            <span className={styles.projectTag} style={{ backgroundColor: project.color }}>
              {project.name}
            </span>
          )}
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
  );
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
      {/* Sort Controls */}
      <div className={styles.sortControls}>
        <span className={styles.sortLabel}>Sort by:</span>
        <button
          className={`${styles.sortBtn} ${sortConfig.sortBy === 'priority' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSortChange('priority')}
        >
          Priority{getSortIcon('priority')}
        </button>
        <button
          className={`${styles.sortBtn} ${sortConfig.sortBy === 'dueDate' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSortChange('dueDate')}
        >
          Due Date{getSortIcon('dueDate')}
        </button>
      </div>

      {/* Render based on sort mode */}
      {sortConfig.sortBy === 'priority' && groupedTasks ? (
        // Grouped by priority
        ['urgent', 'high', 'low'].map((priority) => {
          const priorityTasks = groupedTasks[priority];
          if (!priorityTasks || priorityTasks.length === 0) return null;

          return (
            <div key={priority} className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span
                  className={styles.priorityDot}
                  style={{ backgroundColor: priorityColors[priority] }}
                />
                {priorityLabels[priority]} ({priorityTasks.length})
              </h3>
              <ul className={styles.list}>{priorityTasks.map(renderTaskItem)}</ul>
            </div>
          );
        })
      ) : (
        // Flat list sorted by due date
        <ul className={styles.list}>{sortedTasks.map(renderTaskItem)}</ul>
      )}
    </div>
  );
}
