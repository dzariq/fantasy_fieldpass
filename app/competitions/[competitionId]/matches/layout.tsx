'use client';

import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Push fake history entry so back triggers popstate first
    history.pushState({ locked: true }, '', window.location.href);

    const handlePopState = () => {
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return <main className="content">{children}</main>;
}
