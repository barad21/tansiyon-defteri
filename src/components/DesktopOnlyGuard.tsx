import type { ReactNode } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { appStrings } from '../i18n/appStrings';
import styles from '../styles/desktopOnly.module.css';

interface DesktopOnlyGuardProps {
  children: ReactNode;
}

export function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  if (!isTauri()) {
    return (
      <div className={styles.container}>
        <img src="/logo.png" alt="" className={styles.logo} />
        <h1 className={styles.title}>{appStrings.desktopOnlyTitle}</h1>
        <p className={styles.message}>{appStrings.desktopOnlyMessage}</p>
        <code className={styles.command}>npm run tauri dev</code>
        <p className={styles.hint}>{appStrings.desktopOnlyHint}</p>
      </div>
    );
  }

  return <>{children}</>;
}
