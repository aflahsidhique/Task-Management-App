'use client';

import { useEffect } from 'react';

// Catches errors thrown by the root layout itself (app/error.tsx can't,
// since it renders inside that layout) — must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          <h1>Something went wrong</h1>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
