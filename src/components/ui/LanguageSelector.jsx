import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSelector = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
        >
            <span className={language === 'en' ? 'text-orange-500' : ''}>EN</span>
            <span>/</span>
            <span className={language === 'ta' ? 'text-orange-500' : ''}>TA</span>
        </button>
    );
};

export default LanguageSelector;
