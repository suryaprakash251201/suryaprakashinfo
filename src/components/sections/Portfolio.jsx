import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Portfolio = () => {
    const { t } = useLanguage();

    const projects = [
        {
            title: 'CyTrokSys',
            category: 'Cybersecurity',
            description: 'Advanced Cybersecurity Toolkit for penetration testing and security auditing. Comprehensive vulnerability scanner and reporting tool.',
            tech: ['Python', 'Security', 'Automation'],
            link: '#',
            github: '#'
        },
        {
            title: 'CloudPe',
            category: 'Cloud Infrastructure',
            description: 'Scalable cloud infrastructure designed for high availability using automated deployment networking pipelines.',
            tech: ['Cloud', 'DevOps', 'Networking'],
            link: '#',
            github: '#'
        },
        {
            title: 'Security Dash',
            category: 'Web App',
            description: 'Real-time security monitoring and threat detection system with an interactive UI and alert management.',
            tech: ['React', 'Node.js', 'Socket.io'],
            link: '#',
            github: '#'
        },
        {
            title: 'Security Dash',
            category: 'Web App',
            description: 'Real-time security monitoring and threat detection system with an interactive UI and alert management.',
            tech: ['React', 'Node.js', 'Socket.io'],
            link: '#',
            github: '#'
        },
    ];

    return (
        <section id="portfolio" className="py-20 bg-white dark:bg-[#0b0c10] transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                    <div>
                        <span className="text-orange-500 font-semibold uppercase tracking-wider">{t.portfolio.title}</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white transition-colors">{t.portfolio.subtitle}</h2>
                    </div>
                    <a href="#" className="hidden md:inline-block text-orange-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                        {t.portfolio.view_all} →
                    </a>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#1f2833]/30 border border-gray-200 dark:border-white/5 hover:border-orange-500/50 transition-all shadow-sm dark:shadow-none"
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full">{project.category}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-500 transition-colors">{project.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow transition-colors">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {project.tech.map((t, i) => (
                                        <span key={i} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded">{t}</span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 mt-auto">
                                    <a href={project.github} className="text-gray-700 dark:text-white hover:text-orange-500 transition-colors"><FiGithub size={20} /></a>
                                    <a href={project.link} className="text-gray-700 dark:text-white hover:text-orange-500 transition-colors"><FiExternalLink size={20} /></a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <a href="#" className="text-orange-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">{t.portfolio.view_all} →</a>
                </div>

            </div>
        </section>
    );
};

export default Portfolio;
