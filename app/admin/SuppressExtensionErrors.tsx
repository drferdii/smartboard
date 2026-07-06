'use client';

import { useEffect } from 'react';

/**
 * Suppresses benign browser extension errors that get logged as unhandled
 * promise rejections but don't affect app functionality.
 *
 * Specifically: Chrome's message channel errors caused by password manager
 * extensions (1Password, LastPass, Bitwarden) and React DevTools when they
 * try to inject scripts into dynamic pages.
 */
export function SuppressExtensionErrors() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = String(
        reason?.message ?? reason ?? ''
      );
      // Chrome message channel errors from extensions
      if (
        msg.includes('message channel closed') ||
        msg.includes('A listener indicated an asynchronous response') ||
        msg.includes('Extension context invalidated') ||
        msg.includes('Receiving end does not exist')
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof console !== 'undefined') {
          // Use debug to avoid spamming
          console.debug('[suppressed extension error]', msg);
        }
      }
    };

    const errorHandler = (event: ErrorEvent) => {
      const msg = String(event.message ?? '');
      if (
        msg.includes('message channel closed') ||
        msg.includes('A listener indicated an asynchronous response')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('unhandledrejection', handler);
    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('unhandledrejection', handler);
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return null;
}
