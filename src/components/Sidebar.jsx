import { useState } from 'react';
import { UserMenu } from './auth/UserMenu';
import styles from './Sidebar.module.css';

export function Sidebar({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  collapsed,
  onToggleCollapse,
  projects = [],
  onAddProject,
  onDeleteProject,
  selectedProjectId,
  onSelectProject,
}) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const navItems = [
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ];

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim());
    setNewProjectName('');
    setShowProjectForm(false);
  };

  const projectColors = ['#4a90d9', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#795548'];
  const getProjectColor = (index) => projectColors[index % projectColors.length];

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <button
        className={styles.collapseToggle}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      />
      <div className={styles.logo}>Contact Manager</div>
      <div className={styles.userSection}>
        <UserMenu />
      </div>
      <ul className={styles.nav}>
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.navItem} ${currentView === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Projects Section */}
      <div className={styles.projectsSection}>
        <div className={styles.projectsHeader}>
          <span>Projects</span>
          <button
            className={styles.addProjectBtn}
            onClick={() => setShowProjectForm(!showProjectForm)}
            title="Add project"
          >
            +
          </button>
        </div>

        {showProjectForm && !collapsed && (
          <form className={styles.projectForm} onSubmit={handleAddProject}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className={styles.projectInput}
              autoFocus
              onBlur={() => {
                if (!newProjectName.trim()) {
                  setShowProjectForm(false);
                }
              }}
            />
          </form>
        )}

        <ul className={styles.projectsList}>
          {projects.map((project, index) => (
            <li
              key={project.id}
              className={`${styles.projectItem} ${selectedProjectId === project.id ? styles.projectItemActive : ''}`}
              title={collapsed ? project.name : undefined}
              onClick={() => onSelectProject && onSelectProject(project.id)}
            >
              <span
                className={styles.projectDot}
                style={{ backgroundColor: project.color || getProjectColor(index) }}
              />
              <span className={styles.projectName}>{project.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.themeToggle}>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          <span className={styles.themeIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className={styles.themeLabel}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </nav>
  );
}
