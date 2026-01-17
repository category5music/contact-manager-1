import styles from './Layout.module.css';

export function Layout({ children, title, action }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {action}
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
