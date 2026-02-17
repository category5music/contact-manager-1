import { useState, useCallback } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import styles from './ContactNotes.module.css';

export function ContactNotes({ contact, onUpdate }) {
  const handleSave = useCallback(
    (data) => {
      onUpdate({
        contactNotes: data.contactNotes,
        contactNotesUpdatedAt: new Date().toISOString(),
      });
    },
    [onUpdate]
  );

  const { editData, setEditData, saveStatus } = useAutoSave(
    { contactNotes: contact.contactNotes || '' },
    handleSave
  );

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <textarea
        value={editData.contactNotes}
        onChange={(e) => setEditData({ contactNotes: e.target.value })}
        placeholder="Add notes about this contact..."
        className={styles.textarea}
        rows={6}
      />
      <div className={styles.footer}>
        <span className={styles.lastUpdated}>
          {contact.contactNotesUpdatedAt && (
            <>Last updated: {formatLastUpdated(contact.contactNotesUpdatedAt)}</>
          )}
        </span>
        <span className={styles.saveStatus}>
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
        </span>
      </div>
    </div>
  );
}
