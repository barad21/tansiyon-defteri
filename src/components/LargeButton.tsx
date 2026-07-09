import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from '../styles/largeButton.module.css';

interface LargeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function LargeButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: LargeButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
