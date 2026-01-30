import { useState } from 'react';
import { AutocompleteInput } from './AutocompleteInput';
import { useGoogleContacts } from '../hooks/useGoogleContacts';
import styles from './ContactForm.module.css';

export function ContactForm({ contact, onSave, onCancel }) {
  const { contacts: googleContacts, isAvailable } = useGoogleContacts();

  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    biography: contact?.biography || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFirstNameChange = (value) => {
    setFormData((prev) => ({ ...prev, firstName: value }));
  };

  const handleGoogleContactSelect = (googleContact) => {
    // Auto-fill all fields from the selected Google contact
    setFormData({
      firstName: googleContact.firstName || formData.firstName,
      lastName: googleContact.lastName || formData.lastName,
      email: googleContact.email || formData.email,
      phone: googleContact.phone || formData.phone,
      company: googleContact.company || formData.company,
      biography: googleContact.biography || formData.biography,
    });
  };

  // Show autocomplete only for new contacts when Google Contacts is available
  const showAutocomplete = isAvailable && !contact;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      alert('First name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {showAutocomplete && (
        <div className={styles.googleHint}>
          Start typing to search your Google Contacts
        </div>
      )}
      <div className={styles.nameRow}>
        <div className={styles.field}>
          <label htmlFor="firstName">First Name *</label>
          {showAutocomplete ? (
            <AutocompleteInput
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleFirstNameChange}
              suggestions={googleContacts}
              onSelect={handleGoogleContactSelect}
              placeholder="John"
              autoFocus
            />
          ) : (
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              autoFocus
            />
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="555-1234"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Acme Inc"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="biography">About / Biography</label>
        <textarea
          id="biography"
          name="biography"
          value={formData.biography}
          onChange={handleChange}
          placeholder="Add notes about this contact..."
          rows={4}
          className={styles.textarea}
        />
      </div>

      <div className={styles.buttons}>
        <button type="submit" className={styles.saveBtn}>
          {contact ? 'Update' : 'Add'} Contact
        </button>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
