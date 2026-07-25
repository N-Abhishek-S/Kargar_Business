/**
 * useNavigationGuard — beforeunload + React Router guard
 *
 * Warns the user before leaving when a recording is in progress.
 */

import { useEffect } from 'react';
import { recorderStrings } from '../i18n/recorder.i18n';

export function useNavigationGuard(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers show a generic message, but we set returnValue for compat
      e.returnValue = recorderStrings.navigationWarning;
      return recorderStrings.navigationWarning;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isActive]);
}
