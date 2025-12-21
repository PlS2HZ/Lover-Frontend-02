import React, { useState, useEffect } from 'react';
import { THEMES, ThemeContext } from './ThemeConstants'; // ✅ ดึงมาจากไฟล์ด้านบน

export const ThemeProvider = ({ children }) => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
    const saved = localStorage.getItem('app_theme_index');
    return saved !== null ? parseInt(saved) : 0;
  });

  const currentTheme = THEMES[currentThemeIndex];

  const nextTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % THEMES.length;
    setCurrentThemeIndex(nextIndex);
  };

  const prevTheme = () => {
    const prevIndex = (currentThemeIndex - 1 + THEMES.length) % THEMES.length;
    setCurrentThemeIndex(prevIndex);
  };

  useEffect(() => {
    localStorage.setItem('app_theme_index', currentThemeIndex);
  }, [currentThemeIndex]);

  return (
    <ThemeContext.Provider value={{ currentTheme, nextTheme, prevTheme, THEMES }}>
      <div className={`theme-${currentTheme.id} transition-all duration-1000 min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// ❌ ไม่ต้อง export useTheme จากไฟล์นี้แล้ว