// Generate a unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get current timestamp
export function getTimestamp() {
  return new Date().toISOString();
}

// Create a new contact
export function createContact(data) {
  return {
    id: generateId(),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    biography: data.biography || '',
    biographyAttachments: data.biographyAttachments || [],
    contactNotes: data.contactNotes || '',
    contactNotesUpdatedAt: data.contactNotesUpdatedAt || null,
    createdAt: getTimestamp(),
  };
}

// Get full name from contact
export function getFullName(contact) {
  return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown';
}

// Create a new project
export function createProject(name, color) {
  const defaultColors = ['#4a90d9', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#795548'];
  return {
    id: generateId(),
    name,
    color: color || defaultColors[Math.floor(Math.random() * defaultColors.length)],
    createdAt: getTimestamp(),
  };
}

// Create a new note
export function createNote(contactId, data) {
  return {
    id: generateId(),
    contactId,
    content: data.content || '',
    callDate: data.callDate || new Date().toISOString().split('T')[0],
    attachments: data.attachments || [],
    projectId: data.projectId || null,
    createdAt: getTimestamp(),
  };
}

// Create a new task
export function createTask(contactId, data) {
  return {
    id: generateId(),
    contactId,
    title: data.title || '',
    completed: false,
    dueDate: data.dueDate || '',
    priority: data.priority || 'low',
    attachments: data.attachments || [],
    projectId: data.projectId || null,
    createdAt: getTimestamp(),
  };
}
