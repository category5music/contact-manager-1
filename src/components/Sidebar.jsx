import styles from './Sidebar.module.css';

export function Sidebar({ currentView, onNavigate, theme, onToggleTheme }) {
  const navItems = [
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ];

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>Contact Manager</div>
      <ul className={styles.nav}>
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.navItem} ${currentView === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.themeToggle}>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          <span className={styles.themeIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className={styles.themeLabel}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </nav>
  );
}
