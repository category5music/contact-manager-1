import { useState } from 'react';
import styles from './Calendar.module.css';
import { getFullName } from '../utils/storage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const priorityColors = {
  low: '#4caf50',
  high: '#ff9800',
  urgent: '#f44336',
};

export function Calendar({ tasks, contacts, onItemClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get items for a specific date
  const getItemsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const items = [];

    tasks.forEach((task) => {
      if (task.dueDate === dateStr) {
        const contact = task.contactId ? contacts.find((c) => c.id === task.contactId) : null;
        items.push({
          type: 'task',
          title: task.title,
          priority: task.priority,
          contactId: task.contactId,
          contactName: contact ? getFullName(contact) : (task.contactId ? 'Unknown' : 'No Contact'),
          completed: task.completed,
        });
      }
    });

    return items;
  };

  // Build calendar grid
  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const items = getItemsForDate(day);
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === month &&
      new Date().getFullYear() === year;

    calendarDays.push(
      <div
        key={day}
        className={`${styles.day} ${isToday ? styles.today : ''}`}
      >
        <span className={styles.dayNumber}>{day}</span>
        <div className={styles.items}>
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className={`${styles.item} ${item.contactId ? styles.clickable : ''} ${styles.taskItem}`}
              style={{ borderLeftColor: priorityColors[item.priority] || priorityColors.low }}
              title={`${item.contactName}: ${item.title}${item.contactId ? ' (Click to view contact)' : ''}`}
              onClick={() => item.contactId && onItemClick && onItemClick(item.contactId)}
            >
              <span className={item.completed ? styles.completed : ''}>
                {item.title}
              </span>
            </div>
          ))}
          {items.length > 3 && (
            <div className={styles.more}>+{items.length - 3} more</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth}>
          &larr;
        </button>
        <h2 className={styles.monthYear}>
          {MONTHS[month]} {year}
        </h2>
        <button className={styles.navBtn} onClick={nextMonth}>
          &rarr;
        </button>
      </div>

      <div className={styles.weekdays}>
        {DAYS.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid}>{calendarDays}</div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#4caf50' }}></span>
          Low Priority
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#ff9800' }}></span>
          High Priority
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#f44336' }}></span>
          Urgent
        </span>
      </div>
    </div>
  );
}
