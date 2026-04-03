import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FiArrowLeft, FiArrowRight, FiCompass, FiList, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase';
import MarkdownRenderer from '../../components/ui/MarkdownRenderer';
import {
    extractFirstMarkdownImage,
    extractMarkdownHeadings,
    getRecommendedNextPost,
    getRelatedPosts,
    normalizePost,
    POST_STATUS,
    removeFirstMarkdownImage,
    resolvePostPath
} from '../../lib/blog';

const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
};

const coverImageClass = (fit) => (fit === 'contain' ? 'object-contain p-6 md:p-8' : 'object-cover');

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(postsQuery);
                const nextPosts = snapshot.docs.map((entry) => normalizePost(entry.data(), entry.id));
                setPosts(nextPosts.filter((post) => (post.status || POST_STATUS.published) === POST_STATUS.published));
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        window.scrollTo(0, 0);
    }, [slug]);

    const post = useMemo(
        () => posts.find((entry) => entry.slug === slug || entry.id === slug) || null,
        [posts, slug]
    );

    const headings = useMemo(() => extractMarkdownHeadings(post?.content || ''), [post?.content]);
    const relatedPosts = useMemo(() => (post ? getRelatedPosts(posts, post, 3) : []), [post, posts]);
    const recommendedNext = useMemo(() => (post ? getRecommendedNextPost(posts, post) : null), [post, posts]);
    const articleContent = useMemo(() => {
        if (!post) return '';
        const leadContentImage = extractFirstMarkdownImage(post.content);
        return (post.coverImageSource === 'content' || (leadContentImage && leadContentImage === post.imageUrl))
            ? removeFirstMarkdownImage(post.content, post.imageUrl)
            : post.content;
    }, [post]);

    useEffect(() => {
        if (loading) return;
        if (!post) {
            navigate('/blog');
            return;
        }

        const title = post.seoTitle || `${post.title} | Suryaprakash Blogs`;
        const description = post.seoDescription || post.excerpt || post.content.slice(0, 160);

        document.title = title;

        const descriptionTag = document.querySelector('meta[name="description"]');
        if (descriptionTag) {
            descriptionTag.setAttribute('content', description);
        }
    }, [loading, navigate, post]);

    const stripMarkdown = (value) =>
        String(value || '')
            .replace(/#+\s/g, '')
            .replace(/\*\*/g, '')
            .replace(/_/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/`/g, '');

    const toggleReadAloud = () => {
        if (!post) return;

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(stripMarkdown(`${post.title}. ${post.content}`));
        const preferredVoices = [
            'Microsoft Aria',
            'Microsoft Jenny',
            'Google UK English Female',
            'Google US English',
            'Samantha',
            'Karen',
            'Tessa',
            'Victoria',
            'Microsoft Zira'
        ];

        let selectedVoice = null;
        for (const name of preferredVoices) {
            selectedVoice = voices.find((voice) => voice.name.includes(name));
            if (selectedVoice) break;
        }

        if (!selectedVoice) {
            selectedVoice = voices.find((voice) =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('woman')
            );
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.2;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

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

    const MotionDiv = motion.div;
    const MotionArticle = motion.article;

    return (
        <div className="pt-28 pb-28 min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_28%),linear-gradient(180deg,_#0b0c10_0%,_#12161f_100%)] transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-7xl">
                <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
                    <Link to="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group">
                        <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to blog
                    </Link>
                </MotionDiv>

                <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
                    <MotionArticle initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/5 dark:bg-[#11151d]/90 md:p-12">
                        {(post.category || post.topic || post.difficulty || post.featured) && (
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                {post.topic && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-white/10 dark:text-slate-200">{post.topic}</span>}
                                {post.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-white/10 dark:text-slate-200">{post.category}</span>}
                                {post.difficulty && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">{levelLabels[post.difficulty] || post.difficulty}</span>}
                                {post.featured && <span className="text-orange-500 text-xs font-bold uppercase tracking-[0.18em]">Featured</span>}
                            </div>
                        )}

                        <h1 className="text-4xl md:text-[3.8rem] font-bold text-gray-900 dark:text-white mb-6 leading-[0.98] tracking-[-0.05em]">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300 mb-8">
                                {post.excerpt}
                            </p>
                        )}

                        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-5 dark:border-white/10">
                            <div className="flex items-center">
                                <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0">
                                    <img src="/hero-image.png" alt="Suryaprakash Pichaiya" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Suryaprakash Pichaiya</h3>
                                    <div className="flex flex-wrap items-center text-[15px] text-gray-500 dark:text-gray-400 gap-2 mt-0.5">
                                        <span>{post.readingTime} min read</span>
                                        <span aria-hidden="true">&middot;</span>
                                        <span>{post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={toggleReadAloud}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${isPlaying ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#1a202c] dark:text-slate-300 dark:hover:bg-[#2d3748]'}`}
                                title={isPlaying ? 'Stop Reading' : 'Read Aloud'}
                            >
                                {isPlaying ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                                <span>{isPlaying ? 'Stop Listening' : 'Read Aloud'}</span>
                            </button>
                        </div>

                        {post.imageUrl && (
                            <MotionDiv initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="mb-12 overflow-hidden rounded-[28px] border border-gray-100 bg-[linear-gradient(135deg,_rgba(255,237,213,0.82),_rgba(224,231,255,0.78))] shadow-lg dark:border-white/5 dark:bg-[linear-gradient(135deg,_rgba(249,115,22,0.12),_rgba(15,23,42,0.72))]">
                                <div className="flex w-full items-center justify-center aspect-video md:aspect-[21/9]">
                                    <img src={post.imageUrl} alt={post.title} className={`h-full w-full ${coverImageClass(post.coverImageFit)}`} />
                                </div>
                            </MotionDiv>
                        )}

                        {headings.length > 0 && (
                            <div className="mb-10 rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03] xl:hidden">
                                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <FiList /> On this page
                                </div>
                                <div className="mt-4 space-y-2">
                                    {headings.map((heading) => (
                                        <a key={heading.id} href={`#${heading.id}`} className={`block text-sm leading-6 text-slate-600 transition hover:text-orange-500 dark:text-slate-300 ${heading.level === 3 ? 'pl-4' : ''}`}>
                                            {heading.text}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <MarkdownRenderer content={articleContent} variant="article" />

                        {(recommendedNext || relatedPosts.length > 0) && (
                            <div className="mt-16 border-t border-slate-200 pt-10 dark:border-white/10">
                                {recommendedNext && (
                                    <div className="mb-10 rounded-[28px] border border-orange-200 bg-orange-50/70 p-6 dark:border-orange-500/20 dark:bg-orange-500/10">
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                                            <FiCompass /> Recommended next
                                        </div>
                                        <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{recommendedNext.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                            {recommendedNext.excerpt || recommendedNext.content.slice(0, 140)}
                                        </p>
                                        <Link to={resolvePostPath(recommendedNext)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-500">
                                            Continue learning <FiArrowRight />
                                        </Link>
                                    </div>
                                )}

                                {relatedPosts.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-4">Related articles</h3>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {relatedPosts.map((relatedPost) => (
                                                <Link key={relatedPost.id} to={resolvePostPath(relatedPost)} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                                                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-500">{relatedPost.topic || relatedPost.category || 'Article'}</p>
                                                    <h4 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{relatedPost.title}</h4>
                                                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{relatedPost.excerpt || relatedPost.content.slice(0, 110)}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </MotionArticle>

                    <aside className="hidden xl:block">
                        <div className="sticky top-28 space-y-6">
                            {headings.length > 0 && (
                                <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-lg dark:border-white/5 dark:bg-[#11151d]/90">
                                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        <FiList /> On this page
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {headings.map((heading) => (
                                            <a key={heading.id} href={`#${heading.id}`} className={`block text-sm leading-6 text-slate-600 transition hover:text-orange-500 dark:text-slate-300 ${heading.level === 3 ? 'pl-4' : ''}`}>
                                                {heading.text}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {recommendedNext && (
                                <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-lg dark:border-white/5 dark:bg-[#11151d]/90">
                                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        <FiCompass /> Keep learning
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{recommendedNext.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{recommendedNext.excerpt || `${recommendedNext.readingTime} min read`}</p>
                                    <Link to={resolvePostPath(recommendedNext)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-500">
                                        Open next guide <FiArrowRight />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
