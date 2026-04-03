import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiLayers, FiSearch, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase';
import {
    DIFFICULTY_OPTIONS,
    POST_STATUS,
    matchesPostQuery,
    normalizePost,
    resolvePostPath,
    sortPostsByFeatured,
    sortPostsByRecency
} from '../../lib/blog';

const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
};

const coverImageClass = (fit) => (fit === 'contain' ? 'object-contain p-5' : 'object-cover');

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [sortBy, setSortBy] = useState('featured');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(postsQuery);
                const nextPosts = querySnapshot.docs.map((entry) => normalizePost(entry.data(), entry.id));
                setPosts(nextPosts);
            } catch (error) {
                console.error('Error fetching posts: ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const publishedPosts = useMemo(
        () => posts.filter((post) => (post.status || POST_STATUS.published) === POST_STATUS.published),
        [posts]
    );

    const categories = useMemo(() => {
        const uniqueCategories = new Set();
        publishedPosts.forEach((post) => {
            if (post.category) uniqueCategories.add(post.category);
        });
        return ['All', ...Array.from(uniqueCategories)];
    }, [publishedPosts]);

    const topics = useMemo(() => {
        const uniqueTopics = new Set();
        publishedPosts.forEach((post) => {
            if (post.topic) uniqueTopics.add(post.topic);
        });
        return ['All', ...Array.from(uniqueTopics)];
    }, [publishedPosts]);

    const filteredPosts = useMemo(() => {
        return publishedPosts.filter((post) => {
            const matchesSearch = matchesPostQuery(post, searchQuery);
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            const matchesTopic = selectedTopic === 'All' || post.topic === selectedTopic;
            const matchesDifficulty = selectedDifficulty === 'All' || post.difficulty === selectedDifficulty;

            return matchesSearch && matchesCategory && matchesTopic && matchesDifficulty;
        });
    }, [publishedPosts, searchQuery, selectedCategory, selectedTopic, selectedDifficulty]);

    const featuredPost = useMemo(
        () => sortPostsByFeatured(filteredPosts).find((post) => post.featured) || null,
        [filteredPosts]
    );

    const sortedPosts = useMemo(() => {
        const base = sortBy === 'newest' ? sortPostsByRecency(filteredPosts) : sortPostsByFeatured(filteredPosts);
        return base.filter((post) => post.id !== featuredPost?.id);
    }, [featuredPost?.id, filteredPosts, sortBy]);

    const linuxPosts = useMemo(
        () => publishedPosts.filter((post) => post.topic === 'linux' || post.category?.toLowerCase().includes('linux') || post.tags.includes('linux')),
        [publishedPosts]
    );

    const linuxLevels = useMemo(() => {
        return DIFFICULTY_OPTIONS.map((level) => ({
            level,
            posts: linuxPosts.filter((post) => post.difficulty === level).slice(0, 3)
        })).filter((entry) => entry.posts.length > 0);
    }, [linuxPosts]);

    const topicCount = useMemo(() => new Set(publishedPosts.map((post) => post.topic).filter(Boolean)).size, [publishedPosts]);
    const MotionDiv = motion.div;

    return (
        <div className="pt-28 pb-24 min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_28%),linear-gradient(180deg,_#0b0c10_0%,_#12161f_100%)] transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-7xl">
                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_320px] items-start mb-12">
                    <div className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/5 dark:bg-[#11151d]/85 md:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                            <FiBookOpen /> Technical Learning Hub
                        </span>
                        <h1 className="mt-6 max-w-3xl font-sans text-4xl font-bold leading-[0.95] tracking-[-0.05em] text-slate-950 dark:text-white md:text-6xl">
                            Learn from practical articles, guided Linux content, and real project notes.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                            This blog is designed like an educational library: technical explainers, basics-to-advanced Linux articles, and hands-on guides you can actually apply.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Published articles</p>
                                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{publishedPosts.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active topics</p>
                                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{topicCount}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Linux guides</p>
                                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{linuxPosts.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-white/10 dark:bg-[#11151d]/90">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <FiTrendingUp className="text-orange-500" />
                            <h2 className="text-lg font-bold">Start with Linux</h2>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Follow the Linux path from basics to advanced usage through curated articles published inside this blog.
                        </p>
                        <div className="mt-5 space-y-3">
                            {linuxLevels.length > 0 ? linuxLevels.map(({ level, posts: levelPosts }) => (
                                <div key={level} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">{levelLabels[level]}</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{levelPosts.length} article{levelPosts.length > 1 ? 's' : ''}</p>
                                </div>
                            )) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm leading-7 text-slate-500 dark:border-white/10 dark:text-slate-400">
                                    Linux guides will appear here as soon as you add topic and difficulty metadata from the admin panel.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/5 dark:bg-[#11151d]/85 md:p-8">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
                        <label className="relative block">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search title, topic, tags, or content..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white dark:border-white/10 dark:bg-[#0f1319] dark:text-white dark:focus:bg-[#141a22]"
                            />
                        </label>

                        <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319] dark:text-white">
                            {topics.map((topic) => <option key={topic} value={topic}>{topic === 'All' ? 'All topics' : topic}</option>)}
                        </select>
                        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319] dark:text-white">
                            {categories.map((category) => <option key={category} value={category}>{category === 'All' ? 'All categories' : category}</option>)}
                        </select>
                        <select value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319] dark:text-white">
                            <option value="All">All levels</option>
                            {DIFFICULTY_OPTIONS.map((level) => <option key={level} value={level}>{levelLabels[level]}</option>)}
                        </select>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319] dark:text-white">
                            <option value="featured">Featured first</option>
                            <option value="newest">Newest first</option>
                        </select>
                    </div>
                </section>

                {linuxLevels.length > 0 && (
                    <section className="mt-12">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-500">Linux learning path</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Start with Linux</h2>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white dark:bg-white dark:text-slate-900">
                                <FiLayers /> W3Schools-style flow
                            </span>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-3">
                            {linuxLevels.map(({ level, posts: levelPosts }) => (
                                <div key={level} className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-white/10 dark:bg-[#11151d]/90">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">{levelLabels[level]}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                                        {level === 'beginner' ? 'Build fundamentals' : level === 'intermediate' ? 'Strengthen command line skills' : 'Master real workflows'}
                                    </h3>
                                    <div className="mt-5 space-y-4">
                                        {levelPosts.map((post) => (
                                            <Link key={post.id} to={resolvePostPath(post)} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                                                <p className="text-sm font-semibold text-slate-950 dark:text-white">{post.title}</p>
                                                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{post.excerpt || `${post.readingTime} min read`}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mt-12">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20 rounded-[32px] border border-white/70 bg-white/85 shadow-lg dark:border-white/5 dark:bg-[#11151d]/85">
                            <p className="text-xl text-slate-500 dark:text-slate-400 mb-4">No articles found with the current filters.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All');
                                    setSelectedTopic('All');
                                    setSelectedDifficulty('All');
                                    setSortBy('featured');
                                }}
                                className="text-orange-500 font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {featuredPost && (
                                <div>
                                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span> Featured article
                                    </div>
                                    <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[36px] border border-orange-200 bg-white shadow-[0_24px_90px_rgba(249,115,22,0.16)] dark:border-orange-500/20 dark:bg-[#11151d] lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                                        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                {featuredPost.topic && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-white/10 dark:text-white">{featuredPost.topic}</span>}
                                                {featuredPost.difficulty && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">{levelLabels[featuredPost.difficulty] || featuredPost.difficulty}</span>}
                                                <span>{featuredPost.readingTime} min read</span>
                                            </div>
                                            <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-[0.98] text-slate-950 dark:text-white">
                                                <Link to={resolvePostPath(featuredPost)}>{featuredPost.title}</Link>
                                            </h2>
                                            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                                                {featuredPost.excerpt || featuredPost.content.slice(0, 180)}
                                            </p>
                                            <div className="mt-8 flex flex-wrap gap-3">
                                                <Link to={resolvePostPath(featuredPost)} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                                                    Read featured guide <FiArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="min-h-[280px] lg:min-h-full bg-[linear-gradient(135deg,_rgba(255,237,213,0.82),_rgba(224,231,255,0.72))] dark:bg-[linear-gradient(135deg,_rgba(249,115,22,0.12),_rgba(15,23,42,0.72))]">
                                            {featuredPost.imageUrl ? (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <img src={featuredPost.imageUrl} alt={featuredPost.title} className={`h-full w-full ${coverImageClass(featuredPost.coverImageFit)}`} />
                                                </div>
                                            ) : (
                                                <div className="flex h-full items-center justify-center p-10 text-center text-slate-500 dark:text-slate-400">
                                                    Featured technical article
                                                </div>
                                            )}
                                        </div>
                                    </MotionDiv>
                                </div>
                            )}

                            <div>
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Latest articles</p>
                                        <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Technical guides and notes</h2>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{sortedPosts.length} result{sortedPosts.length !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {sortedPosts.map((post, index) => (
                                        <MotionDiv key={post.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                                            <Link to={resolvePostPath(post)} className="group block h-full overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-lg transition hover:-translate-y-1 hover:border-orange-300 dark:border-white/5 dark:bg-[#11151d]/90">
                                                <div className="aspect-[16/10] bg-[linear-gradient(135deg,_rgba(255,237,213,0.82),_rgba(224,231,255,0.72))] dark:bg-[linear-gradient(135deg,_rgba(249,115,22,0.12),_rgba(15,23,42,0.72))]">
                                                    {post.imageUrl ? (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <img src={post.imageUrl} alt={post.title} className={`h-full w-full transition duration-700 ${post.coverImageFit === 'contain' ? 'object-contain p-4 group-hover:scale-[1.02]' : 'object-cover group-hover:scale-105'}`} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">No cover image</div>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                                                        {post.topic && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">{post.topic}</span>}
                                                        {post.difficulty && <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">{levelLabels[post.difficulty] || post.difficulty}</span>}
                                                    </div>
                                                    <h3 className="mt-4 text-2xl font-bold leading-tight text-slate-950 transition group-hover:text-orange-500 dark:text-white">
                                                        {post.title}
                                                    </h3>
                                                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                        {post.excerpt || post.content.slice(0, 150)}
                                                    </p>
                                                    <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                                        <span>{post.readingTime} min read</span>
                                                        <span className="inline-flex items-center gap-2 font-medium text-orange-500">
                                                            Read article <FiArrowRight />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </MotionDiv>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default BlogList;
