import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { GoogleGenAI } from '@google/genai';
import { portfolioContext } from '../../data/ragContext';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hi there! I'm Vyana, SURYAPRAKASH's AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize chat session
    useEffect(() => {
        try {
            if (import.meta.env.VITE_GEMINI_API_KEY) {
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: portfolioContext,
                        temperature: 0.7,
                    }
                });
            }
        } catch (error) {
            console.error("Failed to initialize Gemini chat:", error);
        }
    }, []);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            setMessages(prev => [
                ...prev, 
                { role: 'model', text: "System Error: Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in the .env file." }
            ]);
            setIsLoading(false);
            return;
        }

        try {
            if (!chatSessionRef.current) {
                 chatSessionRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: portfolioContext,
                        temperature: 0.7,
                    }
                });
            }

            const response = await chatSessionRef.current.sendMessage({ message: userText });
            const modelText = response.text || "Sorry, I couldn't generate a response.";
            
            setMessages(prev => [...prev, { role: 'model', text: modelText }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev, 
                { role: 'model', text: "Sorry, I encountered an error communicating with the server. Please try again later." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                        className="absolute bottom-16 md:bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100dvh-7rem)] bg-white/95 dark:bg-[#0b0c10]/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden border border-white/20 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-5 flex justify-between items-center shadow-md relative overflow-hidden">
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "16px 16px" }}></div>
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="relative">
                                    <img src="/vyana-logo.jpg" alt="Vyana" className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white/40" />
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-orange-500 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight text-white drop-shadow-sm">Vyana</h3>
                                    <p className="text-xs text-orange-100 font-medium tracking-wider uppercase mt-0.5">Online</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all hover:rotate-90 relative z-10"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-transparent">
                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] p-4 text-sm shadow-sm leading-relaxed ${
                                            msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm shadow-orange-500/20' 
                                                : 'bg-white dark:bg-[#1f2833] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-2xl rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-sm text-sm bg-white dark:bg-[#1f2833] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-3">
                                        <FiLoader className="animate-spin text-orange-500 w-4 h-4" />
                                        <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Vyana is typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white/90 dark:bg-[#0b0c10]/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 flex gap-3 items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message Vyana..."
                                className="flex-1 bg-gray-50 dark:bg-[#1f2833] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500/50 focus:bg-white dark:focus:bg-[#151b22] rounded-full px-5 py-3.5 focus:outline-none text-sm transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-12 h-12 flex-shrink-0 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-orange-500/30 touch-manipulation"
                            >
                                <FiSend className="w-5 h-5 ml-1" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={!isOpen ? { y: [0, -10, 0] } : { y: 0 }}
                transition={!isOpen ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : { duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-[#1f2833] hover:bg-gray-100 text-orange-500 rounded-full shadow-2xl flex items-center justify-center transition-colors border-2 border-orange-500 overflow-hidden p-0 z-50 relative"
            >
                {isOpen ? <FiX className="w-6 h-6 md:w-8 md:h-8" /> : <img src="/vyana-logo.jpg" alt="Vyana" className="w-full h-full object-cover" />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
