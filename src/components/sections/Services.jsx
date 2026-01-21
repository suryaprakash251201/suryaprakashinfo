import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiServer, FiCode, FiCloud } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Services = () => {
    const { t } = useLanguage();

    // In a full implementation, service descriptions would also be in the translation object.
    // For this demo, I'll localize the titles based on the requirement context.
    const services = [
        {
            icon: <FiShield className="w-8 h-8 text-orange-500" />,
            title: 'Penetration Testing',
            description: 'Identifying and exploiting vulnerabilities to secure systems against potential threats.',
        },
        {
            icon: <FiServer className="w-8 h-8 text-orange-500" />,
            title: 'Network Security',
            description: 'Protecting networks from data breaches and attacks with robust security protocols.',
        },
        {
            icon: <FiCode className="w-8 h-8 text-orange-500" />,
            title: 'Secure Coding',
            description: 'Writing clean, efficient, and secure code, specializing in Python & C++ development.',
        },
        {
            icon: <FiCloud className="w-8 h-8 text-orange-500" />,
            title: 'Cloud Security',
            description: 'Securing cloud environments and infrastructure, ensuring high availability and safety.',
        },
    ];

    return (
        <section id="services" className="py-20 bg-gray-50 dark:bg-[#0b0c10] transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-orange-500 font-semibold uppercase tracking-wider">{t.services.title}</span>
                    <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white transition-colors">{t.services.subtitle}</h2>
                    <div className="h-1 w-20 bg-orange-500 mx-auto mt-6 rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-[#1f2833]/30 p-8 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-[#1f2833]/60 transition-all group shadow-sm dark:shadow-none"
                        >
                            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">{service.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm transition-colors">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
