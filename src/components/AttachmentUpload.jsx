import { useState, useRef } from 'react';
import styles from './AttachmentUpload.module.css';

export function AttachmentUpload({
  onFileSelect,
  onAddLink,
  uploading,
  error,
  onClearError,
  disabled,
}) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    onAddLink(linkUrl.trim(), linkTitle.trim());
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
  };

  const handleLinkKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  if (disabled) {
    return (
      <div className={styles.disabled}>Sign in to add attachments</div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={onClearError} className={styles.dismissError}>
            ×
          </button>
        </div>
      )}

      <div
        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
          className={styles.fileInput}
          disabled={uploading}
        />

        {uploading ? (
          <span className={styles.uploading}>Uploading...</span>
        ) : (
          <>
            <span className={styles.dropText}>
              Drop file here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.browseBtn}
              >
                browse
              </button>
            </span>
            <span className={styles.hint}>PDF, Word, or images up to 10 MB</span>
          </>
        )}
      </div>

      <div className={styles.linkSection}>
        {showLinkInput ? (
          <div className={styles.linkForm}>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="https://..."
              className={styles.linkInput}
              autoFocus
            />
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Title (optional)"
              className={styles.linkInput}
            />
            <div className={styles.linkButtons}>
              <button onClick={handleAddLink} className={styles.addLinkBtn}>
                Add
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                  setLinkTitle('');
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLinkInput(true)}
            className={styles.addLinkToggle}
          >
            🔗 Add link
          </button>
        )}
      </div>
    </div>
  );
}
