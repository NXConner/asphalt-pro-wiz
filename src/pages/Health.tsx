import React from 'react';

export default function Health() {
  const now = new Date().toISOString();
  const href = typeof window !== 'undefined' ? window.location.href : '';
  return (
    <main className="min-h-screen flex items-center justify-center">
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Health: OK</h1>
        <p className="text-sm text-muted-foreground">{now}</p>
        <p className="text-xs text-muted-foreground">{href}</p>
      </section>
    </main>
  );
}
