import React, { useEffect, useState } from 'react';

export default function PreviewSafe() {
  const [info, setInfo] = useState({ base: '/', path: '/', host: '' });
  useEffect(() => {
    try {
      setInfo({
        base: document?.documentElement?.dataset?.routerBase || '/',
        path: window.location.pathname + window.location.search,
        host: window.location.host,
      });
      // eslint-disable-next-line no-console
      console.info('[PreviewSafe] rendering', { info: { ...info } });
    } catch {}
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-xl w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Preview Safe Mode</h1>
        <p className="text-sm text-muted-foreground">
          This lightweight page confirms routing/rendering in the preview environment.
        </p>

        <div className="grid grid-cols-1 gap-2 text-left text-sm">
          <div className="rounded-md border p-3 bg-card">
            <div className="font-medium">Router base</div>
            <div className="text-muted-foreground">{info.base}</div>
          </div>
          <div className="rounded-md border p-3 bg-card">
            <div className="font-medium">Path</div>
            <div className="text-muted-foreground">{info.path}</div>
          </div>
          <div className="rounded-md border p-3 bg-card">
            <div className="font-medium">Host</div>
            <div className="text-muted-foreground">{info.host}</div>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-4 text-sm">
          <a className="underline underline-offset-4" href="/health">/health</a>
          <a className="underline underline-offset-4" href="/command-center">/command-center</a>
          <a className="underline underline-offset-4" href="/">/</a>
        </nav>
      </section>
    </main>
  );
}
