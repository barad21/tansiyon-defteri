import { appStrings } from '../i18n/appStrings';
import styles from '../styles/appHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <img src="/logo.png" alt="" className={styles.logo} />
      <h1 className={styles.title}>{appStrings.appTitle}</h1>
    </header>
  );
}
