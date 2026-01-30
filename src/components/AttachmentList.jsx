import { formatFileSize, getFileIcon } from '../firebase/storage';
import styles from './AttachmentList.module.css';

const FILE_ICONS = {
  pdf: '📄',
  image: '🖼️',
  word: '📝',
  file: '📎',
  link: '🔗',
};

function AttachmentItem({ attachment, onDelete, canDelete }) {
  const isFile = attachment.type === 'file';
  const icon = isFile
    ? FILE_ICONS[getFileIcon(attachment.mimeType)]
    : FILE_ICONS.link;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFile) {
      window.open(attachment.downloadUrl, '_blank');
    } else {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${isFile ? attachment.fileName : attachment.title}"?`)) {
      onDelete(attachment.id);
    }
  };

  return (
    <div className={styles.attachmentItem}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.info} onClick={handleClick}>
        <span className={styles.name}>
          {isFile ? attachment.fileName : attachment.title}
        </span>
        {isFile && (
          <span className={styles.meta}>
            {formatFileSize(attachment.fileSize)} ·{' '}
            {new Date(attachment.uploadedAt).toLocaleDateString()}
          </span>
        )}
        {!isFile && <span className={styles.meta}>{attachment.url}</span>}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.viewBtn}
          onClick={handleClick}
          title={isFile ? 'Download' : 'Open link'}
        >
          {isFile ? '⬇️' : '↗️'}
        </button>
        {canDelete && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Delete"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export function AttachmentList({ attachments = [], onDelete, canDelete = true }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>📎</span>
        <span>Attachments ({attachments.length})</span>
      </div>
      <div className={styles.list}>
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDelete={onDelete}
            canDelete={canDelete}
          />
        ))}
      </div>
    </div>
  );
}
