import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const About = () => {
    const { t } = useLanguage();

    const stats = [
        { number: '2+', label: 'Years Exp' }, // Could be moved to translation if needed, but keeping simple for now
        { number: '50+', label: 'Projects' },
        { number: '20+', label: 'Vuln Found' },
    ];

    return (
        <section id="about" className="py-20 bg-white dark:bg-[#0b0c10] transition-colors duration-300 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <span className="text-orange-500 font-semibold uppercase tracking-wider">{t.about.title}</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white transition-colors">{t.about.subtitle}</h2>
                        <div className="h-1 w-20 bg-orange-500 mx-auto mt-6 rounded-full" />
                    </div>

                    <div className="bg-gray-50 dark:bg-[#1f2833]/50 p-8 md:p-12 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-sm transition-colors duration-300">
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 transition-colors">
                            {t.about.description}
                        </p>

                        {/* Keeping the detailed English text as a secondary paragraph or just relying on the summary in description for now to keep translation simple. 
                In a real app, I'd move all this text to the translation object. */}

                        <div className="grid grid-cols-3 gap-8 border-t border-gray-200 dark:border-white/10 pt-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <h3 className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.number}</h3>
                                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 uppercase tracking-wide transition-colors">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
