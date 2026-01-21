import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#0b0c10] py-8 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Suryaprakash Pichaiya. All rights reserved.
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-gray-500 hover:text-orange-500 dark:hover:text-white text-sm transition-colors">Privacy Policy</a>
                    <a href="#" className="text-gray-500 hover:text-orange-500 dark:hover:text-white text-sm transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
