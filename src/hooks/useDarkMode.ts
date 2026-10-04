import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('am_trinity_theme');
      if (saved) return saved === 'dark';
      return true; // Dark mode ca default
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('am_trinity_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('am_trinity_theme', 'light');
      }
    } catch {
      // Ignoră erorile de storage
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return { isDark, toggleDarkMode };
}
