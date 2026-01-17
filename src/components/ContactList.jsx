import styles from './ContactList.module.css';
import { getFullName } from '../utils/storage';

export function ContactList({ contacts, onSelect, onDelete }) {
  if (contacts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No contacts yet. Add your first contact!</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {contacts.map((contact) => (
        <li key={contact.id} className={styles.item}>
          <div className={styles.info} onClick={() => onSelect(contact)}>
            <strong className={styles.name}>{getFullName(contact)}</strong>
            {contact.company && (
              <span className={styles.company}>{contact.company}</span>
            )}
            {contact.email && (
              <span className={styles.email}>{contact.email}</span>
            )}
          </div>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(contact.id)}
            aria-label="Delete contact"
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
  );
}
