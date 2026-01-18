import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { user, isGuest, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isGuest) {
    return (
      <>
        <button className={styles.signInBtn} onClick={() => setShowAuthModal(true)}>
          Sign In to Sync
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <div className={styles.userMenu} ref={dropdownRef}>
      <button
        className={styles.avatar}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User menu"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarLetter}>
            {(user.email?.[0] || 'U').toUpperCase()}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
            <span className={styles.syncBadge}>Synced</span>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
