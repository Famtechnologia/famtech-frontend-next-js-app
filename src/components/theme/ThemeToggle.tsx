'use client';

import { useThemeStore } from '@/lib/store/themeStore';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-xl
        transition-all duration-200
        bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900
        dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:text-[#8b949e] dark:hover:text-[#e6edf3]
        ${className}
      `}
    >
      {isDark ? (
        <Sun size={17} className="transition-transform duration-200 rotate-0" />
      ) : (
        <Moon size={17} className="transition-transform duration-200 rotate-0" />
      )}
    </button>
  );
}
