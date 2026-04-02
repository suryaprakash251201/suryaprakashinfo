import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ReactMarkdown from 'react-markdown';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [readTime, setReadTime] = useState(1);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const docRef = doc(db, 'posts', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPost({ id: docSnap.id, ...data });
                    
                    // Calculate Read Time (assume 200 words per minute)
                    if (data.content) {
                        const words = data.content.split(/\s+/).length;
                        setReadTime(Math.max(1, Math.ceil(words / 200)));
                    }
                } else {
                    console.error("No such document!");
                    navigate('/blog');
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white dark:bg-[#0b0c10] transition-colors duration-500">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!post) return null;

    // Animation Variants
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="pt-28 pb-32 min-h-screen bg-white dark:bg-[#0b0c10] transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Link to="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mb-10 transition-colors group">
                        <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to blog
                    </Link>
                </motion.div>

                <article>
                    <motion.header 
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="mb-10"
                    >
                        {/* Title - Huge & Clean */}
                        <h1 className="text-4xl md:text-[3.2rem] font-bold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>

                        {/* Author Meta Block */}
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4">
                                S
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Suryaprakash Pichaiya</h3>
                                <div className="flex items-center text-[15px] text-gray-500 dark:text-gray-400 gap-2 mt-0.5">
                                    <span>{readTime} min read</span>
                                    <span>·</span>
                                    <span>{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                                    {post.featured && (
                                        <>
                                            <span>·</span>
                                            <span className="text-orange-500 font-medium flex items-center gap-1">Featured</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </motion.header>

                    {/* Cover Image */}
                    {post.imageUrl && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5 mb-14"
                        >
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </motion.div>
                    )}

                    {/* Content Body - Premium Typography */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="
                            prose prose-xl 
                            dark:prose-invert 
                            max-w-none 
                            
                            /* Custom typography rules for Medium-vibe */
                            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:text-gray-800 dark:prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:tracking-normal prose-p:mb-8
                            prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-gray-900 dark:prose-blockquote:border-white prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:text-lg prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                            prose-img:rounded-2xl prose-img:shadow-md
                            prose-li:text-gray-800 dark:prose-li:text-gray-300 prose-li:leading-[1.8]
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-orange-500 prose-code:before:content-none prose-code:after:content-none
                        "
                    >
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </motion.div>

                </article>
            </div>
        </div>
    );
};

export default BlogPost;
