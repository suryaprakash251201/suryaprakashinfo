import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Typewriter } from 'react-simple-typewriter';
import { useLanguage } from '../../context/LanguageContext';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section id="home" className="min-h-screen flex items-center pt-28 pb-12 relative overflow-hidden bg-slate-50 dark:bg-[#0b0c10] transition-colors duration-300">
            {/* Improved Background Animation */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="order-2 md:order-1 relative z-10"
                >
                    <span className="text-orange-500 font-semibold tracking-wider uppercase mb-4 block">
                        {t.hero.welcome}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white transition-colors">
                        {t.hero.welcome === "Welcome to my world" ? "Hi, I'm" : "வணக்கம், நான்"} <br />
                        <span className="text-orange-500">SURYAPRAKASH</span>
                    </h1>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-600 dark:text-gray-400 mb-6 min-h-[80px] md:min-h-[44px] transition-colors">
                        <span>{t.hero.role_prefix} </span>
                        <span className="gradient-text">
                            <Typewriter
                                words={['Cybersecurity Researcher', 'Full Stack Developer', 'System Architect', 'Bug Hunter']}
                                loop={0}
                                cursor
                                cursorStyle='_'
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1000}
                            />
                        </span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-lg leading-relaxed transition-colors">
                        {t.about.description.substring(0, 120)}...
                    </p>

                    <div className="flex gap-4">
                        <a href="#contact" className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium transition-all shadow-lg shadow-orange-500/25">
                            {t.hero.contact}
                        </a>
                        <a href="#portfolio" className="px-8 py-3 border border-gray-400 dark:border-gray-600 hover:border-orange-500 hover:text-orange-500 text-gray-800 dark:text-white rounded-full font-medium transition-all">
                            {t.hero.view_work}
                        </a>
                    </div>

                    <div className="flex gap-6 mt-10 text-gray-500 dark:text-gray-400">
                        <a href="https://github.com/suryaprakash251201" target="_blank" rel="noreferrer" className="hover:text-orange-500 dark:hover:text-white transition-colors text-2xl"><FaGithub /></a>
                        <a href="https://www.linkedin.com/in/suryaprakash-pichaiya-8260861b0/" target="_blank" rel="noreferrer" className="hover:text-orange-500 dark:hover:text-white transition-colors text-2xl"><FaLinkedin /></a>
                        <a href="https://x.com/suryaprakash2k" className="hover:text-orange-500 dark:hover:text-white transition-colors text-2xl"><FaTwitter /></a>
                        <a href="https://www.instagram.com/suryaprakash_heart_catcher" className="hover:text-orange-500 dark:hover:text-white transition-colors text-2xl"><FaInstagram /></a>
                    </div>
                </motion.div>

                {/* Improved Hero Visual - Reinstated Profile Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 flex justify-center order-1 md:order-2"
                >
                    <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center">
                        {/* Animation Wave Effect */}
                        <div className="absolute w-full h-full border-2 border-orange-500/50 rounded-full animate-wave" />
                        <div className="absolute w-full h-full border-2 border-orange-500/30 rounded-full animate-wave" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute w-full h-full border-2 border-orange-500/10 rounded-full animate-wave" style={{ animationDelay: '1s' }} />

                        {/* Decorative Rotating Circle */}
                        <div className="absolute inset-0 border-2 border-orange-500/20 rounded-full animate-spin-slow" />
                        <div className="absolute inset-4 border border-gray-400/20 dark:border-white/10 rounded-full" />

                        {/* Image Container */}
                        <div className="absolute inset-8 rounded-full overflow-hidden border-4 border-white dark:border-[#0b0c10] shadow-2xl z-10">
                            <img
                                src="/hero-image.png"
                                alt="Suryaprakash"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-4 right-4 z-20 glass dark:bg-white/5 bg-white/60 px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-orange-500">2+</div>
                                <div className="text-sm text-gray-800 dark:text-gray-300 font-medium">Years of <br />Experience</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
