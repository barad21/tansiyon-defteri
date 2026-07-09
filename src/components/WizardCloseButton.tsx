import { appStrings } from '../i18n/appStrings';
import styles from '../styles/wizard.module.css';

interface WizardCloseButtonProps {
  onClose: () => void;
}

export function WizardCloseButton({ onClose }: WizardCloseButtonProps) {
  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={onClose}
      aria-label={appStrings.close}
    >
      ×
    </button>
  );
}
