import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend, FiLoader } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import emailjs from '@emailjs/browser';

const Contact = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        // EmailJS Configuration
        const SERVICE_ID = 'service_94dkmx9';
        const TEMPLATE_ID = 'template_zhpch0k';
        const PUBLIC_KEY = 'VnTqR2E8LtoBoijfm';

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            reply_to: formData.email,
            title: formData.subject,
            message: `${formData.message}\n\n----------------\nSender Email: ${formData.email}`,
            name: formData.name,   // Match {{name}} in template
            email: formData.email, // Match {{email}} in template
        };

        try {
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            setStatus({
                type: 'success',
                message: 'Message sent successfully! I will get back to you soon.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('EmailJS Error:', error);
            setStatus({
                type: 'error',
                message: 'Failed to send message. Please try again or email directly.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-gray-50 dark:bg-[#0b0c10] transition-colors duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 w-1/3 h-1/2 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-orange-500 font-semibold uppercase tracking-wider">{t.contact.title}</span>
                    <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white transition-colors">{t.contact.subtitle}</h2>
                    <div className="h-1 w-20 bg-orange-500 mx-auto mt-6 rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Contact Information</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                            I'm always open to discussing product design work or partnership opportunities. Feel free to reach out to me directly.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-[#1f2833] rounded-full flex items-center justify-center text-orange-500 shadow-sm dark:shadow-none">
                                    <FiMail size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Email Me</p>
                                    <a href="mailto:suryaprakash251201@gmail.com" className="text-gray-900 dark:text-white hover:text-orange-500 transition-colors">suryaprakash251201@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-[#1f2833] rounded-full flex items-center justify-center text-orange-500 shadow-sm dark:shadow-none">
                                    <FiPhone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Call Me</p>
                                    <p className="text-gray-900 dark:text-white">+91 9488209842</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-[#1f2833] rounded-full flex items-center justify-center text-orange-500 shadow-sm dark:shadow-none">
                                    <FiMapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Location</p>
                                    <p className="text-gray-900 dark:text-white">Coimbatore, India</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-[#1f2833]/30 p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none transition-colors"
                    >
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-400">{t.contact.form.name}</label>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#0b0c10] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-400">{t.contact.form.email}</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#0b0c10] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm text-gray-600 dark:text-gray-400">{t.contact.form.subject}</label>
                                <input type="text" id="subject" value={formData.subject} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#0b0c10] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors" placeholder="Project Inquiry" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm text-gray-600 dark:text-gray-400">{t.contact.form.message}</label>
                                <textarea id="message" rows="4" value={formData.message} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#0b0c10] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors" placeholder="..." required></textarea>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend />
                                        {t.contact.form.send}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
