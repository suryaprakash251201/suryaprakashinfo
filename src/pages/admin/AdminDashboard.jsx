import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2, FiPlus, FiList, FiBarChart2, FiStar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, write, manage
    
    // Form State
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [content, setContent] = useState('');
    const [featured, setFeatured] = useState(false);
    
    // App State
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isPublishing, setIsPublishing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
        if (password === adminPass) {
            setIsAuthenticated(true);
            fetchArticles();
        } else {
            setStatus({ type: 'error', message: 'Incorrect password' });
        }
    };

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(postsQuery);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticles(postsData);
        } catch (error) {
            console.error("Error fetching documents: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setExcerpt('');
        setImageUrl('');
        setContent('');
        setFeatured(false);
        setShowPreview(false);
    };

    const handleEditClick = (article) => {
        setEditingId(article.id);
        setTitle(article.title || '');
        setExcerpt(article.excerpt || '');
        setImageUrl(article.imageUrl || '');
        setContent(article.content || '');
        setFeatured(article.featured || false);
        setActiveTab('write');
        window.scrollTo(0, 0);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this article? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'posts', id));
                setStatus({ type: 'success', message: 'Article deleted.' });
                fetchArticles();
            } catch (error) {
                console.error("Error deleting document: ", error);
                setStatus({ type: 'error', message: 'Failed to delete article.' });
            }
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            setStatus({ type: 'error', message: 'Title and Content are required.' });
            return;
        }

        setIsPublishing(true);
        setStatus({ type: '', message: '' });

        try {
            if (editingId) {
                const docRef = doc(db, 'posts', editingId);
                await updateDoc(docRef, {
                    title,
                    excerpt,
                    imageUrl,
                    content,
                    featured
                });
                setStatus({ type: 'success', message: 'Article updated successfully!' });
            } else {
                await addDoc(collection(db, 'posts'), {
                    title,
                    excerpt,
                    imageUrl,
                    content,
                    featured,
                    createdAt: serverTimestamp()
                });
                setStatus({ type: 'success', message: 'Article published successfully!' });
            }
            
            resetForm();
            fetchArticles();
            setActiveTab('manage');
        } catch (error) {
            console.error("Error saving document: ", error);
            setStatus({ type: 'error', message: `Firebase Error: ${error.message || error}` });
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-28 bg-slate-50 dark:bg-[#0b0c10] flex justify-center items-center px-6 transition-colors duration-300">
                <div className="bg-white dark:bg-[#1f2833] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-white/5">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Access Required</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passcode</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {status.type === 'error' && <p className="text-red-500 text-sm">{status.message}</p>}
                        <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors">
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-[#0b0c10] transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-6xl">
                
                {/* Header & Tabs */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="text-orange-500 font-semibold uppercase tracking-wider">Dashboard</span>
                        <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">CMS Console</h1>
                    </div>
                    
                    <div className="flex bg-white dark:bg-[#1f2833] p-1.5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'overview' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <FiBarChart2 /> Overview
                        </button>
                        <button 
                            onClick={() => { resetForm(); setActiveTab('write'); }}
                            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'write' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <FiPlus /> Write
                        </button>
                        <button 
                            onClick={() => setActiveTab('manage')}
                            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${activeTab === 'manage' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <FiList /> Manage
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {status.message && (
                    <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {status.message}
                    </div>
                )}

                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#1f2833] p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                                <FiList />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Articles</h3>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{articles.length}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1f2833] p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                                <FiStar />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Featured Articles</h3>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{articles.filter(a => a.featured).length}</p>
                        </div>
                        <button 
                            onClick={() => { resetForm(); setActiveTab('write'); }}
                            className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl shadow-lg border border-orange-400 flex flex-col items-center justify-center text-center hover:shadow-orange-500/30 transition-all hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center mb-4 text-2xl">
                                <FiPlus />
                            </div>
                            <h3 className="text-white/90 font-medium">Create New</h3>
                            <p className="text-2xl font-bold text-white mt-1">Write Article</p>
                        </button>
                    </div>
                )}

                {/* TAB: MANAGE */}
                {activeTab === 'manage' && (
                    <div className="bg-white dark:bg-[#1f2833] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-10 text-center text-gray-500">Loading articles...</div>
                        ) : articles.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No articles found. Start writing!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#0b0c10] text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-gray-800">Title</th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-gray-800">Date</th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-gray-800">Status</th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-gray-800 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {articles.map((article) => (
                                            <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-[#151b22] transition-colors">
                                                <td className="p-4 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">
                                                    {article.title}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                                    {article.createdAt ? new Date(article.createdAt.seconds * 1000).toLocaleDateString() : 'Draft / Recent'}
                                                </td>
                                                <td className="p-4">
                                                    {article.featured ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                                                            <FiStar className="w-3 h-3" /> Featured
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            Published
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right space-x-3">
                                                    <button onClick={() => handleEditClick(article)} className="text-blue-500 hover:text-blue-600 transition-colors" title="Edit">
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(article.id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: WRITE / EDIT */}
                {activeTab === 'write' && (
                    <div className="bg-white dark:bg-[#1f2833] p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
                        
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? "Edit Article" : "Write New Article"}
                            </h2>
                            <button 
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="px-4 py-1.5 border border-orange-500 text-orange-500 text-sm rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                            >
                                {showPreview ? "Back to Editor" : "Markdown Preview"}
                            </button>
                        </div>

                        {showPreview ? (
                            <div className="min-h-[500px]">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{title || "Untitled Article"}</h1>
                                {imageUrl && <img src={imageUrl} alt="preview" className="w-full max-h-96 object-cover rounded-xl mb-8" />}
                                <div className="prose prose-lg dark:prose-invert prose-orange max-w-none">
                                    <ReactMarkdown>{content || "*Write some markdown to see preview...*"}</ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handlePublish} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Article Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white text-lg font-medium"
                                        placeholder="E.g., Getting Started with Cybersecurity"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                    <input 
                                        type="checkbox" 
                                        id="featuredCheck"
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                        className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                    />
                                    <label htmlFor="featuredCheck" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                                        <FiStar className={featured ? "text-orange-500 fill-orange-500" : "text-gray-400"} />
                                        Mark as Featured Article (Shows at top of Blog feed)
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Excerpt (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white"
                                        placeholder="A brief summary for the blog feed..."
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white"
                                        placeholder="https://example.com/image.png"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                                        <span>Article Content (Markdown Supported)</span>
                                        <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-600 text-xs">Markdown Guide</a>
                                    </label>
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white font-mono text-sm min-h-[400px] resize-y leading-relaxed"
                                        placeholder="## Introduction&#10;&#10;Start writing your blog post here..."
                                        required
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            onClick={resetForm}
                                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={isPublishing}
                                        className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
                                    >
                                        {isPublishing ? "Saving..." : (editingId ? "Update Article" : "Publish Article")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
