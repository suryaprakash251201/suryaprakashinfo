import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(postsQuery);
                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-[#0b0c10] transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="mb-12">
                    <span className="text-orange-500 font-semibold uppercase tracking-wider">Insights & Articles</span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white">The Blog</h1>
                    <div className="h-1 w-20 bg-orange-500 mt-6 rounded-full" />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">No articles published yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {/* FEATURED ARTICLE */}
                        {posts.find(p => p.featured) && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Featured Article
                                </h3>
                                {(() => {
                                    const featured = posts.find(p => p.featured);
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-[#1f2833] rounded-3xl border-2 border-orange-500/20 shadow-xl overflow-hidden flex flex-col md:flex-row group"
                                        >
                                            {featured.imageUrl && (
                                                <div className="w-full md:w-1/2 aspect-video md:aspect-auto h-64 md:h-auto overflow-hidden">
                                                    <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
                                                    {featured.createdAt ? new Date(featured.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                                </div>
                                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 hover:text-orange-500 transition-colors">
                                                    <Link to={`/blog/${featured.id}`}>{featured.title}</Link>
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 text-lg">
                                                    {featured.excerpt || featured.content.substring(0, 150) + "..."}
                                                </p>
                                                <Link 
                                                    to={`/blog/${featured.id}`} 
                                                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors self-start shadow-md shadow-orange-500/20"
                                                >
                                                    Read Featured Article
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* REGULAR ARTICLES */}
                        <div className="grid gap-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-200 dark:border-gray-800 pb-4">Latest Posts</h3>
                            {posts.filter(p => !p.featured).map((post, index) => (
                                <motion.div 
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-[#1f2833]/50 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-orange-500/50 transition-all flex flex-col md:flex-row gap-6 items-center group cursor-pointer"
                                    onClick={() => window.location.href = `/blog/${post.id}`}
                                >
                                    {post.imageUrl && (
                                        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shadow-md">
                                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                                            {post.excerpt || post.content.substring(0, 150) + "..."}
                                        </p>
                                        <span className="inline-flex items-center text-orange-500 font-medium">
                                            Read Article →
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {posts.filter(p => !p.featured).length === 0 && posts.length > 0 && (
                                <p className="text-gray-500 italic">All posts are currently featured!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
