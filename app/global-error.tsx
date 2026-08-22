'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-2xl font-bold mb-2">Critical Application Error</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          A critical system error occurred. Please reload the application.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
        >
          Reload Dayflow
        </button>
      </body>
    </html>
  );
}
