import { useState } from 'react';
import { ContactNotes } from './ContactNotes';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { AttachmentList } from './AttachmentList';
import { AttachmentUpload } from './AttachmentUpload';
import { useAuth } from '../contexts/AuthContext';
import { useAttachments } from '../hooks/useAttachments';
import { getFullName } from '../utils/storage';
import styles from './ContactDetail.module.css';

export function ContactDetail({
  contact,
  tasks,
  onBack,
  onEdit,
  onUpdateContact,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  projects = [],
}) {
  const { isGuest } = useAuth();
  const [showBioAttachments, setShowBioAttachments] = useState(false);

  const {
    uploading,
    error,
    clearError,
    handleFileUpload,
    handleAddLink,
    handleDelete: handleDeleteAttachment,
    canAttach,
  } = useAttachments(
    'contacts',
    contact.id,
    contact.biographyAttachments || [],
    (newAttachments) => onUpdateContact({ biographyAttachments: newAttachments })
  );

  const bioAttachmentCount = contact.biographyAttachments?.length || 0;

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
        {contact.biography && (
          <div className={styles.biographySection}>
            <h4 className={styles.biographyTitle}>About</h4>
            <p className={styles.biography}>{contact.biography}</p>

            {/* Biography Attachments */}
            {bioAttachmentCount > 0 && (
              <button
                className={styles.attachmentToggle}
                onClick={() => setShowBioAttachments(!showBioAttachments)}
              >
                📎 {bioAttachmentCount} attachment
                {bioAttachmentCount !== 1 ? 's' : ''}
                {showBioAttachments ? ' ▲' : ' ▼'}
              </button>
            )}

            {showBioAttachments && (
              <AttachmentList
                attachments={contact.biographyAttachments}
                onDelete={handleDeleteAttachment}
                canDelete={canAttach}
              />
            )}

            {canAttach && (
              <div className={styles.bioAttachmentUpload}>
                <AttachmentUpload
                  onFileSelect={handleFileUpload}
                  onAddLink={handleAddLink}
                  uploading={uploading}
                  error={error}
                  onClearError={clearError}
                  disabled={!canAttach}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Contact Notes</h3>
        <ContactNotes contact={contact} onUpdate={onUpdateContact} />
      </div>

      <div className={styles.section}>
        <h3>Tasks</h3>
        <TaskForm onSave={onAddTask} projects={projects} />
        <TaskList
          tasks={tasks}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          projects={projects}
        />
      </div>
    </div>
  );
}
