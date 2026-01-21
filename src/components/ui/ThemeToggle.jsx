import React from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-orange-500"
            aria-label="Toggle Theme"
        >
            {isDark ? <HiSun size={24} /> : <HiMoon size={24} />}
        </button>
    );
};

export default ThemeToggle;
