'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'light');
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem('eltype-theme', next);
    setTheme(next);
  }

  const isDark = theme === 'dark';
  return <button className="themeToggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'night'} mode`} title={`Switch to ${isDark ? 'light' : 'night'} mode`}>
    <span className="themeTrack" aria-hidden="true"><i>{isDark ? '☾' : '☀'}</i></span>
    <b>{isDark ? 'Night' : 'Light'}</b>
  </button>;
}
