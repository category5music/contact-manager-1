import { useState, useEffect } from 'react';
import { useSyncedStorage } from './hooks/useSyncedStorage';
import { createContact, createNote, createTask, createProject, getFullName } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Layout } from './components/Layout';
import { ContactList } from './components/ContactList';
import { ContactForm } from './components/ContactForm';
import { ContactDetail } from './components/ContactDetail';
import { Calendar } from './components/Calendar';
import { TasksListView } from './components/TasksListView';
import { TaskForm } from './components/TaskForm';
import { NotesListView } from './components/NotesListView';

// Main navigation: 'contacts' | 'tasks' | 'notes'
// Contact views: 'list' | 'add' | 'edit' | 'detail'
function App() {
  const [contacts, setContacts] = useSyncedStorage('contacts', []);
  const [notes, setNotes] = useSyncedStorage('notes', []);
  const [tasks, setTasks] = useSyncedStorage('tasks', []);
  const [archivedTasks, setArchivedTasks] = useSyncedStorage('archivedTasks', []);
  const [theme, setTheme] = useSyncedStorage('theme', 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useSyncedStorage('sidebarCollapsed', false);
  const [projects, setProjects] = useSyncedStorage('projects', []);

  const [mainView, setMainView] = useState('contacts');
  const [contactView, setContactView] = useState('list');
  const [tasksViewMode, setTasksViewMode] = useState('list'); // 'calendar' | 'list'
  const [notesViewMode, setNotesViewMode] = useState('list'); // 'calendar' | 'list'
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSortBy, setContactSortBy] = useState('firstName'); // 'firstName' | 'lastName' | 'dateAdded'
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Project handlers
  const handleAddProject = (name, color) => {
    const newProject = createProject(name, color);
    setProjects([...projects, newProject]);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
    // Unassign project from notes and tasks
    setNotes(notes.map((n) => (n.projectId === id ? { ...n, projectId: null } : n)));
    setTasks(tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)));
  };

  // Handle sidebar navigation
  const handleNavigate = (view) => {
    setMainView(view);
    setSelectedProjectId(null); // Clear project selection when navigating
    if (view === 'contacts') {
      setContactView('list');
      setSelectedContact(null);
    }
  };

  // Handle project selection
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setMainView('project');
  };

  // Contact handlers
  const handleAddContact = (data) => {
    const newContact = createContact(data);
    setContacts([...contacts, newContact]);
    setContactView('list');
  };

  const handleUpdateContact = (data) => {
    setContacts(
      contacts.map((c) =>
        c.id === selectedContact.id ? { ...c, ...data } : c
      )
    );
    setSelectedContact({ ...selectedContact, ...data });
    setContactView('detail');
  };

  // Partial update for contact (used by attachments, stays on same view)
  const handleUpdateContactPartial = (updates) => {
    if (!selectedContact) return;
    const updatedContact = { ...selectedContact, ...updates };
    setContacts(
      contacts.map((c) => (c.id === selectedContact.id ? updatedContact : c))
    );
    setSelectedContact(updatedContact);
  };

  const handleDeleteContact = (id) => {
    if (!confirm('Delete this contact and all their notes/tasks?')) return;
    setContacts(contacts.filter((c) => c.id !== id));
    setNotes(notes.filter((n) => n.contactId !== id));
    setTasks(tasks.filter((t) => t.contactId !== id));
    if (selectedContact?.id === id) {
      setSelectedContact(null);
      setContactView('list');
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setContactView('detail');
  };

  // Note handlers
  const handleAddNote = (data) => {
    const newNote = createNote(selectedContact.id, data);
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleUpdateNote = (id, data) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, ...data } : n))
    );
  };

  // Task handlers
  const handleAddTask = (data) => {
    const newTask = createTask(selectedContact.id, data);
    setTasks([newTask, ...tasks]);
  };

  const handleAddStandaloneTask = (data) => {
    const newTask = createTask(null, data);
    setTasks([newTask, ...tasks]);
    setShowTaskForm(false);
  };

  const handleToggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      // Mark as completed and move to archive
      const completedTask = { ...task, completed: true, archivedAt: new Date().toISOString() };
      setArchivedTasks([completedTask, ...archivedTasks]);
      setTasks(tasks.filter((t) => t.id !== id));
    } else {
      // Toggle back (shouldn't happen often but handle it)
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleRestoreTask = (id) => {
    const task = archivedTasks.find((t) => t.id === id);
    if (task) {
      const restoredTask = { ...task, completed: false, archivedAt: undefined };
      setTasks([restoredTask, ...tasks]);
      setArchivedTasks(archivedTasks.filter((t) => t.id !== id));
    }
  };

  const handleDeleteArchivedTask = (id) => {
    setArchivedTasks(archivedTasks.filter((t) => t.id !== id));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleUpdateTask = (id, data) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  // Navigate to contact from calendar
  const handleCalendarItemClick = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setMainView('contacts');
      setContactView('detail');
    }
  };

  // Get notes/tasks for selected contact
  const contactNotes = selectedContact
    ? notes.filter((n) => n.contactId === selectedContact.id)
    : [];
  const contactTasks = selectedContact
    ? tasks.filter((t) => t.contactId === selectedContact.id)
    : [];

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      (contact.firstName || '').toLowerCase().includes(query) ||
      (contact.lastName || '').toLowerCase().includes(query) ||
      (contact.email || '').toLowerCase().includes(query) ||
      (contact.company || '').toLowerCase().includes(query) ||
      (contact.phone || '').includes(query)
    );
  });

  // Sort filtered contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (contactSortBy === 'firstName') {
      return (a.firstName || '').localeCompare(b.firstName || '');
    } else if (contactSortBy === 'lastName') {
      return (a.lastName || '').localeCompare(b.lastName || '');
    } else if (contactSortBy === 'dateAdded') {
      return (b.createdAt || '').localeCompare(a.createdAt || ''); // newest first
    }
    return 0;
  });

  // Filter tasks by search query
  const filteredTasks = tasks.filter((task) => {
    if (!taskSearchQuery) return true;
    const query = taskSearchQuery.toLowerCase();
    const contact = contacts.find((c) => c.id === task.contactId);
    const contactName = contact ? getFullName(contact).toLowerCase() : '';
    return (
      (task.title || '').toLowerCase().includes(query) ||
      contactName.includes(query)
    );
  });

  // Filter notes by search query
  const filteredNotes = notes.filter((note) => {
    if (!noteSearchQuery) return true;
    const query = noteSearchQuery.toLowerCase();
    const contact = contacts.find((c) => c.id === note.contactId);
    const contactName = contact ? getFullName(contact).toLowerCase() : '';
    return (
      (note.content || '').toLowerCase().includes(query) ||
      contactName.includes(query)
    );
  });

  // Render content based on main view
  const renderContent = () => {
    // Project view - shows all notes and tasks for a specific project
    if (mainView === 'project' && selectedProjectId) {
      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      if (!selectedProject) {
        setMainView('contacts');
        setSelectedProjectId(null);
        return null;
      }

      const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
      const projectNotes = notes.filter((n) => n.projectId === selectedProjectId);

      return (
        <Layout
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: selectedProject.color,
                  display: 'inline-block',
                }}
              />
              {selectedProject.name}
            </span>
          }
          action={
            <button
              onClick={() => {
                if (confirm('Delete this project? Notes and tasks will be untagged but not deleted.')) {
                  handleDeleteProject(selectedProjectId);
                  setMainView('contacts');
                  setSelectedProjectId(null);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Delete Project
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Tasks Section */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                Tasks ({projectTasks.length})
              </h3>
              {projectTasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No tasks in this project yet.
                </p>
              ) : (
                <TasksListView
                  tasks={projectTasks}
                  contacts={contacts}
                  onTaskClick={handleCalendarItemClick}
                  onToggleTask={handleToggleTask}
                  projects={projects}
                />
              )}
            </div>

            {/* Notes Section */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                Notes ({projectNotes.length})
              </h3>
              {projectNotes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No notes in this project yet.
                </p>
              ) : (
                <NotesListView
                  notes={projectNotes}
                  contacts={contacts}
                  onNoteClick={handleCalendarItemClick}
                  projects={projects}
                />
              )}
            </div>
          </div>
        </Layout>
      );
    }

    // Calendar views for tasks and notes
    if (mainView === 'tasks') {
      return (
        <Layout
          title={showArchive ? "Archived Tasks" : "Tasks"}
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!showArchive && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4a90d9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {showTaskForm ? 'Cancel' : '+ Add Task'}
                </button>
              )}
              <button
                onClick={() => setShowArchive(!showArchive)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showArchive ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: showArchive ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Archive ({archivedTasks.length})
              </button>
              {!showArchive && (
                <>
                  <button
                    onClick={() => setTasksViewMode('list')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: tasksViewMode === 'list' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                      color: tasksViewMode === 'list' ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setTasksViewMode('calendar')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: tasksViewMode === 'calendar' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                      color: tasksViewMode === 'calendar' ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Calendar
                  </button>
                </>
              )}
            </div>
          }
        >
          {showArchive ? (
            <div>
              {archivedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>No archived tasks yet. Completed tasks will appear here.</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {archivedTasks.map((task) => {
                    const contact = task.contactId ? contacts.find((c) => c.id === task.contactId) : null;
                    const contactName = contact ? getFullName(contact) : (task.contactId ? 'Unknown' : 'No Contact');
                    return (
                      <li
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {contactName}
                            {task.archivedAt && (
                              <span style={{ marginLeft: '1rem' }}>
                                Completed: {new Date(task.archivedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestoreTask(task.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '0.85rem',
                          }}
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Permanently delete this task?')) {
                              handleDeleteArchivedTask(task.id);
                            }
                          }}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <>
              {showTaskForm && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>New Task</h4>
                  <TaskForm onSave={handleAddStandaloneTask} projects={projects} />
                </div>
              )}
              <input
                type="text"
                placeholder="Search tasks by title or contact name..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              {tasksViewMode === 'list' ? (
                <TasksListView
                  tasks={filteredTasks}
                  contacts={contacts}
                  onTaskClick={handleCalendarItemClick}
                  onToggleTask={handleToggleTask}
                  projects={projects}
                />
              ) : (
                <Calendar
                  tasks={filteredTasks}
                  notes={notes}
                  contacts={contacts}
                  filter="tasks"
                  onItemClick={handleCalendarItemClick}
                />
              )}
            </>
          )}
        </Layout>
      );
    }

    if (mainView === 'notes') {
      return (
        <Layout
          title="Notes"
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setNotesViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: notesViewMode === 'list' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: notesViewMode === 'list' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                List
              </button>
              <button
                onClick={() => setNotesViewMode('calendar')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: notesViewMode === 'calendar' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: notesViewMode === 'calendar' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Calendar
              </button>
            </div>
          }
        >
          <input
            type="text"
            placeholder="Search notes by content or contact name..."
            value={noteSearchQuery}
            onChange={(e) => setNoteSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
          {notesViewMode === 'list' ? (
            <NotesListView
              notes={filteredNotes}
              contacts={contacts}
              onNoteClick={handleCalendarItemClick}
              projects={projects}
            />
          ) : (
            <Calendar
              tasks={tasks}
              notes={filteredNotes}
              contacts={contacts}
              filter="notes"
              onItemClick={handleCalendarItemClick}
            />
          )}
        </Layout>
      );
    }

    // Contact views
    if (contactView === 'add') {
      return (
        <Layout title="Add Contact">
          <ContactForm
            onSave={handleAddContact}
            onCancel={() => setContactView('list')}
          />
        </Layout>
      );
    }

    if (contactView === 'edit' && selectedContact) {
      return (
        <Layout title="Edit Contact">
          <ContactForm
            contact={selectedContact}
            onSave={handleUpdateContact}
            onCancel={() => setContactView('detail')}
          />
        </Layout>
      );
    }

    if (contactView === 'detail' && selectedContact) {
      return (
        <Layout title="Contact">
          <ContactDetail
            contact={selectedContact}
            notes={contactNotes}
            tasks={contactTasks}
            onBack={() => {
              setSelectedContact(null);
              setContactView('list');
            }}
            onEdit={() => setContactView('edit')}
            onUpdateContact={handleUpdateContactPartial}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            projects={projects}
          />
        </Layout>
      );
    }

    // Default: contact list
    return (
      <Layout
        title="Contacts"
        action={
          <button
            onClick={() => setContactView('add')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4a90d9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Add
          </button>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <select
            value={contactSortBy}
            onChange={(e) => setContactSortBy(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="firstName">Sort by First Name</option>
            <option value="lastName">Sort by Last Name</option>
            <option value="dateAdded">Sort by Date Added</option>
          </select>
        </div>
        <ContactList
          contacts={sortedContacts}
          onSelect={handleSelectContact}
          onDelete={handleDeleteContact}
        />
      </Layout>
    );
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        currentView={mainView}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        projects={projects}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
      />
      <main style={{ marginLeft: sidebarCollapsed ? '60px' : '200px', flex: 1, minHeight: '100vh', transition: 'margin-left 0.3s ease' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
