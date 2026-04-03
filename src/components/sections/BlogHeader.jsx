import React from 'react';
import { Link } from 'react-router-dom';
import { FiMoon, FiSun, FiHome } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const BlogHeader = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="absolute top-0 w-full z-50 py-5 transition-colors duration-300">
            <div className="container mx-auto px-6 h-12 flex items-center justify-between border-b border-gray-200/50 dark:border-white/10 pb-4">
                
                {/* Brand / Title */}
                <Link to="/blog" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                        S
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white tracking-widest uppercase text-sm group-hover:text-orange-500 transition-colors">
                        Suryaprakash Blogs
                    </span>
                </Link>

                {/* Right Controls */}
                <div className="flex items-center gap-4">
                    <Link to="/" title="Back to Portfolio" className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-white transition-colors bg-white hover:bg-gray-50 dark:bg-[#1a202c] dark:hover:bg-[#2d3748] p-2 rounded-full shadow-sm border border-gray-100 dark:border-white/10">
                        <FiHome size={18} />
                    </Link>
                    <button 
                        onClick={toggleTheme}
                        title="Toggle dark mode"
                        className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-white transition-colors bg-white hover:bg-gray-50 dark:bg-[#1a202c] dark:hover:bg-[#2d3748] p-2 rounded-full shadow-sm border border-gray-100 dark:border-white/10"
                    >
                        {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>
                </div>
                
            </div>
        </header>
    );
};

export default BlogHeader;
