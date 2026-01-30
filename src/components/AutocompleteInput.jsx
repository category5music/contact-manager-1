import { useState, useRef, useEffect } from 'react';
import styles from './AutocompleteInput.module.css';

/**
 * Autocomplete input component
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Called with new value
 * @param {Array} props.suggestions - Array of suggestion objects
 * @param {function} props.onSelect - Called when a suggestion is selected
 * @param {function} props.filterFn - Custom filter function (item, query) => boolean
 * @param {function} props.renderSuggestion - Custom render for suggestions
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.disabled - Disable input
 */
export function AutocompleteInput({
  value,
  onChange,
  suggestions = [],
  onSelect,
  filterFn,
  renderSuggestion,
  placeholder,
  disabled,
  ...inputProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((item) => {
    if (!value || value.length < 2) return false;
    if (filterFn) return filterFn(item, value);
    // Default: match firstName, lastName, or email
    const query = value.toLowerCase();
    return (
      item.firstName?.toLowerCase().includes(query) ||
      item.lastName?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query)
    );
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when there are matches
  useEffect(() => {
    setIsOpen(filteredSuggestions.length > 0 && value.length >= 2);
    setHighlightIndex(-1);
  }, [filteredSuggestions.length, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex];
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < Math.min(filteredSuggestions.length, 10) - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0) {
          handleSelect(filteredSuggestions[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const defaultRenderSuggestion = (item) => (
    <>
      <span className={styles.suggestionName}>
        {item.firstName} {item.lastName}
      </span>
      {item.email && (
        <span className={styles.suggestionEmail}>{item.email}</span>
      )}
    </>
  );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => filteredSuggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        {...inputProps}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul ref={listRef} className={styles.dropdown} role="listbox">
          {filteredSuggestions.slice(0, 10).map((item, index) => (
            <li
              key={item.googleResourceName || index}
              className={`${styles.suggestion} ${
                index === highlightIndex ? styles.highlighted : ''
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightIndex(index)}
              role="option"
              aria-selected={index === highlightIndex}
            >
              {renderSuggestion
                ? renderSuggestion(item)
                : defaultRenderSuggestion(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
