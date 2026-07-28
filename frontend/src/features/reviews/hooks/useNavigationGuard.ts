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
      // Modern browsers show a generic message. returnValue is deprecated but
      // still required by some older browsers for the prompt to appear.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      e.returnValue = recorderStrings.navigationWarning;
    };

    window.addEventListener('beforeunload', handler);
    return () => { window.removeEventListener('beforeunload', handler); };
  }, [isActive]);
}
