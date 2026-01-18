import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import styles from './AuthModal.module.css';

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          &times;
        </button>
        {mode === 'login' ? (
          <LoginForm onSuccess={onClose} onSwitchToSignUp={() => setMode('signup')} />
        ) : (
          <SignUpForm onSuccess={onClose} onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}
