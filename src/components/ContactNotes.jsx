import { useCallback, useRef, useEffect, useState } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import styles from './ContactNotes.module.css';

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#e53935' },
  { name: 'Orange', value: '#fb8c00' },
  { name: 'Green', value: '#43a047' },
  { name: 'Blue', value: '#1e88e5' },
  { name: 'Purple', value: '#8e24aa' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fff176' },
  { name: 'Green', value: '#a5d6a7' },
  { name: 'Blue', value: '#90caf9' },
  { name: 'Pink', value: '#f48fb1' },
  { name: 'Orange', value: '#ffcc80' },
];

const FONT_SIZES = [
  { name: 'Small', value: '1' },
  { name: 'Normal', value: '3' },
  { name: 'Large', value: '5' },
  { name: 'Huge', value: '7' },
];

export function ContactNotes({ contact, onUpdate }) {
  const editorRef = useRef(null);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

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

  // Set initial content and auto-resize
  useEffect(() => {
    if (editorRef.current && contact.contactNotes !== undefined) {
      if (editorRef.current.innerHTML !== contact.contactNotes) {
        editorRef.current.innerHTML = contact.contactNotes || '';
      }
      adjustHeight();
    }
  }, [contact.id]);

  const adjustHeight = () => {
    if (editorRef.current) {
      // Reset height to auto to get the correct scrollHeight
      editorRef.current.style.height = 'auto';
      // Calculate new height based on content, with min and max constraints
      const scrollHeight = editorRef.current.scrollHeight;
      const minHeight = 150;
      const maxHeight = 500;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      editorRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setEditData({ contactNotes: editorRef.current.innerHTML });
      adjustHeight();
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBold = () => execCommand('bold');
  const handleUnderline = () => execCommand('underline');
  const handleTextColor = (color) => {
    execCommand('foreColor', color);
    setShowTextColor(false);
  };
  const handleHighlight = (color) => {
    execCommand('hiliteColor', color);
    setShowHighlight(false);
  };
  const handleFontSize = (size) => {
    execCommand('fontSize', size);
    setShowFontSize(false);
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.toolbar}`)) {
        setShowTextColor(false);
        setShowHighlight(false);
        setShowFontSize(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        {/* Font Size */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => {
              setShowFontSize(!showFontSize);
              setShowTextColor(false);
              setShowHighlight(false);
            }}
            title="Font Size"
          >
            A<span className={styles.dropdownArrow}>▾</span>
          </button>
          {showFontSize && (
            <div className={styles.dropdown}>
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => handleFontSize(size.value)}
                  style={{ fontSize: `${12 + parseInt(size.value) * 2}px` }}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Bold */}
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleBold}
          title="Bold"
        >
          <strong>B</strong>
        </button>

        {/* Underline */}
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleUnderline}
          title="Underline"
        >
          <u>U</u>
        </button>

        <div className={styles.divider} />

        {/* Text Color */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => {
              setShowTextColor(!showTextColor);
              setShowHighlight(false);
              setShowFontSize(false);
            }}
            title="Text Color"
          >
            <span style={{ borderBottom: '3px solid #e53935' }}>A</span>
          </button>
          {showTextColor && (
            <div className={styles.dropdown}>
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={styles.colorItem}
                  onClick={() => handleTextColor(color.value)}
                  title={color.name}
                >
                  <span
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className={styles.dropdownContainer}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => {
              setShowHighlight(!showHighlight);
              setShowTextColor(false);
              setShowFontSize(false);
            }}
            title="Highlight"
          >
            <span style={{ backgroundColor: '#fff176', padding: '0 4px' }}>H</span>
          </button>
          {showHighlight && (
            <div className={styles.dropdown}>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={styles.colorItem}
                  onClick={() => handleHighlight(color.value)}
                  title={color.name}
                >
                  <span
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        data-placeholder="Add notes about this contact..."
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
