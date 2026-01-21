import React, { useState, useEffect } from 'react';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSelector from '../ui/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { t } = useLanguage();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    const menuItems = [
        { name: t.nav.home, href: '#home' },
        { name: t.nav.about, href: '#about' },
        { name: t.nav.services, href: '#services' },
        { name: t.nav.portfolio, href: '#portfolio' },
        { name: t.nav.contact, href: '#contact' },
    ];

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: -100 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed w-full z-50 glass dark:bg-[#0b0c10]/80 bg-white/80 border-b border-gray-200 dark:border-white/10"
        >
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <a href="#" className="text-2xl font-bold text-orange-500 tracking-tighter hover:text-gray-900 dark:hover:text-white transition-colors">
                    SURYA<span className="text-gray-900 dark:text-white">PRAKASH</span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {menuItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-500 font-medium transition-colors text-sm uppercase tracking-wide"
                        >
                            {item.name}
                        </a>
                    ))}

                    <div className="flex items-center gap-4 pl-4 border-l border-gray-300 dark:border-gray-700">
                        <ThemeToggle />
                        <LanguageSelector />
                    </div>

                    <a
                        href="#contact"
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-full transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20"
                    >
                        {t.nav.hire}
                    </a>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-900 dark:text-white focus:outline-none"
                    >
                        {isOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass dark:bg-[#0b0c10] bg-white border-t border-gray-200 dark:border-white/10"
                >
                    <div className="px-6 py-4 space-y-4">
                        {menuItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </a>
                        ))}
                        <div className="py-2">
                            <LanguageSelector />
                        </div>
                        <a
                            href="#contact"
                            className="block w-full text-center px-6 py-2 bg-orange-600 text-white rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            {t.nav.hire}
                        </a>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
