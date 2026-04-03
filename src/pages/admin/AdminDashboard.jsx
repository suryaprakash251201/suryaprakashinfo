import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { FiAlertCircle, FiArchive, FiBarChart2, FiBold, FiCheckCircle, FiCode, FiEdit2, FiEye, FiFileText, FiImage, FiItalic, FiLink, FiList, FiPlus, FiSearch, FiSettings, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import MarkdownRenderer from '../../components/ui/MarkdownRenderer';
import { COVER_IMAGE_FIT_OPTIONS, DIFFICULTY_OPTIONS, POST_STATUS, PRESET_CATEGORY_OPTIONS, TOPIC_OPTIONS, estimateReadingTime, extractFirstMarkdownImage, normalizePost, parseTags, resolvePostPath, slugify } from '../../lib/blog';

const emptyForm = {
    title: '', slug: '', excerpt: '', imageUrl: '', content: '', category: '', topic: '', difficulty: '',
    tags: '', seoTitle: '', seoDescription: '', featured: false, featuredRank: '', status: POST_STATUS.draft, coverImageFit: 'cover'
};

const statusStyles = {
    [POST_STATUS.draft]: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    [POST_STATUS.published]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    [POST_STATUS.archived]: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'
};

const difficultyLabels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const coverFitLabels = { cover: 'Fill frame', contain: 'Fit entire image' };
const draftKey = (id) => `sp-admin-draft:${id || 'new'}`;
const normalizeEditorForm = (value = {}) => ({
    ...emptyForm,
    ...value,
    coverImageFit: value?.coverImageFit === 'contain' ? 'contain' : 'cover'
});

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [editingId, setEditingId] = useState(null);
    const [slugTouched, setSlugTouched] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [featuredFilter, setFeaturedFilter] = useState('all');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [customCategories, setCustomCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const contentRef = useRef(null);

    const editingArticle = useMemo(() => articles.find((article) => article.id === editingId) || null, [articles, editingId]);
    const currentDraftKey = draftKey(editingId);
    const firstContentImage = useMemo(() => extractFirstMarkdownImage(form.content), [form.content]);
    const previewImage = form.imageUrl || firstContentImage;
    const categoryOptions = useMemo(() => {
        const seen = new Set();
        return [...PRESET_CATEGORY_OPTIONS, ...customCategories, ...articles.map((article) => article.category).filter(Boolean)]
            .filter((category) => {
                const normalized = String(category || '').trim();
                if (!normalized) return false;
                const key = normalized.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .sort((left, right) => left.localeCompare(right));
    }, [articles, customCategories]);

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
            setArticles(snapshot.docs.map((entry) => normalizePost(entry.data(), entry.id)));
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to load articles.' });
        } finally {
            setIsLoading(false);
        }
    };

    const formFromArticle = (article) => ({
        title: article.title || '', slug: article.slug || '', excerpt: article.excerpt || '', imageUrl: article.imageUrl || '',
        content: article.content || '', category: article.category || '', topic: article.topic || '', difficulty: article.difficulty || '',
        tags: article.tags?.join(', ') || '', seoTitle: article.seoTitle || '', seoDescription: article.seoDescription || '',
        featured: article.featured || false, featuredRank: article.featuredRank ?? '', status: article.status || POST_STATUS.published,
        coverImageFit: article.coverImageFit || 'cover'
    });

    const readDraft = (id) => {
        try {
            const raw = localStorage.getItem(draftKey(id));
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };

    const openEditor = (article = null, options = {}) => {
        const saved = readDraft(article?.id);
        setEditingId(article?.id || null);
        setForm(saved?.form ? normalizeEditorForm(saved.form) : article ? normalizeEditorForm(formFromArticle(article)) : emptyForm);
        setSlugTouched(Boolean(saved?.slugTouched ?? article?.slug));
        setDraftSavedAt(saved?.savedAt ? new Date(saved.savedAt) : null);
        setIsSettingsOpen(Boolean(options.openSettings));
        setActiveTab('write');
        window.scrollTo(0, 0);
    };

    const resetEditor = () => {
        localStorage.removeItem(currentDraftKey);
        setEditingId(null);
        setIsSettingsOpen(false);
        setSlugTouched(false);
        setDraftSavedAt(null);
        setNewCategory('');
        setForm(emptyForm);
    };

    useEffect(() => {
        if (!isAuthenticated || activeTab !== 'write') return;
        const hasContent = Object.values(form).some((value) => Boolean(String(value ?? '').trim()));
        if (!hasContent) return;
        const timeoutId = window.setTimeout(() => {
            const savedAt = Date.now();
            localStorage.setItem(currentDraftKey, JSON.stringify({ form, slugTouched, savedAt }));
            setDraftSavedAt(new Date(savedAt));
        }, 250);
        return () => window.clearTimeout(timeoutId);
    }, [activeTab, currentDraftKey, form, isAuthenticated, slugTouched]);

    const handleLogin = async (event) => {
        event.preventDefault();
        if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123')) {
            setIsAuthenticated(true);
            await fetchArticles();
        } else {
            setStatus({ type: 'error', message: 'Incorrect password' });
        }
    };

    const changeField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const changeTitle = (value) => setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }));
    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);
    const addCategoryOption = () => {
        const trimmed = newCategory.trim();
        if (!trimmed) return;
        setCustomCategories((prev) => prev.some((entry) => entry.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed]);
        changeField('category', trimmed);
        setNewCategory('');
    };

    const insertMarkdown = (format) => {
        const textarea = contentRef.current;
        const start = textarea?.selectionStart ?? form.content.length;
        const end = textarea?.selectionEnd ?? form.content.length;
        const selected = form.content.slice(start, end);
        const apply = (snippet, offsetStart, offsetEnd) => {
            const next = `${form.content.slice(0, start)}${snippet}${form.content.slice(end)}`;
            changeField('content', next);
            requestAnimationFrame(() => {
                textarea?.focus();
                textarea?.setSelectionRange(start + offsetStart, start + offsetEnd);
            });
        };
        if (format === 'image') {
            const url = prompt('Enter Image URL:');
            if (url) {
                const alt = selected || 'Image Description';
                const snippet = `\n![${alt}](${url})\n`;
                const offset = snippet.indexOf(alt);
                apply(snippet, offset, offset + alt.length);
            }
        }
        if (format === 'link') {
            const url = prompt('Enter Link URL:');
            if (url) {
                const text = selected || 'Link Text';
                apply(`[${text}](${url})`, 1, 1 + text.length);
            }
        }
        if (format === 'bold') { const text = selected || 'Bold Text'; apply(`**${text}**`, 2, 2 + text.length); }
        if (format === 'italic') { const text = selected || 'Italic Text'; apply(`_${text}_`, 1, 1 + text.length); }
        if (format === 'code') { const text = selected || '// Your code here'; const snippet = `\n\`\`\`bash\n${text}\n\`\`\`\n`; const offset = snippet.indexOf(text); apply(snippet, offset, offset + text.length); }
    };

    const uniqueSlug = (base) => {
        const cleaned = slugify(base) || `article-${Date.now()}`;
        const taken = new Set(articles.filter((article) => article.id !== editingId).map((article) => article.slug).filter(Boolean));
        if (!taken.has(cleaned)) return cleaned;
        let counter = 2; let candidate = `${cleaned}-${counter}`;
        while (taken.has(candidate)) { counter += 1; candidate = `${cleaned}-${counter}`; }
        return candidate;
    };

    const saveArticle = async (nextStatus) => {
        const title = form.title.trim();
        const content = form.content.trim();
        if (!title) return setStatus({ type: 'error', message: 'Title is required.' });
        if (nextStatus === POST_STATUS.published && !content) return setStatus({ type: 'error', message: 'Content is required before publishing.' });
        setIsSaving(true);
        const payload = {
            title,
            slug: uniqueSlug(form.slug || title),
            excerpt: form.excerpt.trim(),
            imageUrl: form.imageUrl.trim(),
            coverImageFit: form.coverImageFit === 'contain' ? 'contain' : 'cover',
            content: form.content,
            category: form.category.trim(),
            topic: form.topic.trim().toLowerCase(),
            difficulty: form.difficulty,
            tags: parseTags(form.tags),
            seoTitle: form.seoTitle.trim(),
            seoDescription: form.seoDescription.trim(),
            featured: Boolean(form.featured),
            featuredRank: form.featured && form.featuredRank !== '' ? Number(form.featuredRank) : null,
            status: nextStatus,
            readingTime: estimateReadingTime(form.content),
            updatedAt: serverTimestamp(),
            publishedAt: nextStatus === POST_STATUS.published ? editingArticle?.publishedAt || serverTimestamp() : nextStatus === POST_STATUS.archived ? editingArticle?.publishedAt || null : null
        };
        try {
            if (editingId) await updateDoc(doc(db, 'posts', editingId), payload);
            else await addDoc(collection(db, 'posts'), { ...payload, createdAt: serverTimestamp() });
            localStorage.removeItem(currentDraftKey);
            setStatus({ type: 'success', message: nextStatus === POST_STATUS.published ? 'Article published.' : nextStatus === POST_STATUS.archived ? 'Article archived.' : 'Draft saved.' });
            await fetchArticles();
            resetEditor();
            setActiveTab('manage');
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: `Firebase Error: ${error.message || error}` });
        } finally {
            setIsSaving(false);
        }
    };

    const deleteArticle = async (id) => {
        if (!window.confirm('Delete this article permanently?')) return;
        await deleteDoc(doc(db, 'posts', id));
        localStorage.removeItem(draftKey(id));
        await fetchArticles();
        setStatus({ type: 'success', message: 'Article deleted.' });
    };

    const changeStatus = async (article, nextStatus) => {
        if (!window.confirm(`Move this article to ${nextStatus}?`)) return;
        await updateDoc(doc(db, 'posts', article.id), { status: nextStatus, updatedAt: serverTimestamp(), publishedAt: nextStatus === POST_STATUS.published ? article.publishedAt || serverTimestamp() : nextStatus === POST_STATUS.archived ? article.publishedAt || null : null });
        await fetchArticles();
        setStatus({ type: 'success', message: `Article moved to ${nextStatus}.` });
    };

    const filteredArticles = useMemo(() => articles.filter((article) => {
        const queryMatch = !search.trim() || [article.title, article.excerpt, article.slug, article.topic, article.category, article.difficulty, ...article.tags].some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase()));
        const statusMatch = statusFilter === 'all' || article.status === statusFilter;
        const featuredMatch = featuredFilter === 'all' || (featuredFilter === 'featured' ? article.featured : !article.featured);
        return queryMatch && statusMatch && featuredMatch;
    }), [articles, featuredFilter, search, statusFilter]);

    const stats = useMemo(() => ({
        total: articles.length,
        published: articles.filter((article) => article.status === POST_STATUS.published).length,
        drafts: articles.filter((article) => article.status === POST_STATUS.draft).length,
        linux: articles.filter((article) => article.topic === 'linux').length
    }), [articles]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] flex justify-center items-center px-6 py-8">
                <div className="bg-white dark:bg-[#1f2833] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-white/5">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Access Required</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:text-white" placeholder="Enter admin password" />
                        {status.type === 'error' && <p className="text-red-500 text-sm">{status.message}</p>}
                        <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium">Access Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    if (activeTab === 'write') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0b0c10] text-gray-900 dark:text-gray-100">
                <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-[#0b0c10]/90">
                    <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => { setActiveTab('overview'); resetEditor(); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><FiX size={24} /></button>
                            <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">SP Admin</p><h1 className="text-lg font-semibold">{editingId ? 'Edit Article' : 'New Article'}</h1></div>
                            <p className="hidden md:block text-sm text-slate-400">{draftSavedAt ? `Autosaved ${draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Editing locally'}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 font-sans">
                            {editingId && editingArticle?.status === POST_STATUS.published && <Link to={resolvePostPath({ id: editingId, slug: form.slug || editingArticle.slug })} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiEye /> View</Link>}
                            <button type="button" onClick={openSettings} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiSettings /> Publishing Settings</button>
                            <button type="button" onClick={() => saveArticle(POST_STATUS.draft)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiFileText /> Save Draft</button>
                            {editingId && <button type="button" onClick={() => saveArticle(POST_STATUS.archived)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiArchive /> Archive</button>}
                            <button type="button" onClick={openSettings} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white"><FiUploadCloud /> {editingId ? 'Update' : 'Publish'}</button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto grid max-w-[1450px] gap-10 px-6 pb-24 pt-10 xl:grid-cols-[minmax(0,1.5fr)_420px]">
                    <div>
                        <input type="text" value={form.title} onChange={(event) => changeTitle(event.target.value)} placeholder="Write a technical article title..." className="w-full bg-transparent text-[3.1rem] md:text-[4rem] font-bold leading-[0.95] tracking-[-0.04em] outline-none mb-5" />
                        <div className="mb-3 mt-2 flex flex-wrap items-center gap-2 text-gray-400 dark:text-gray-500">
                            <button type="button" onClick={() => insertMarkdown('bold')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FiBold size={18} /></button>
                            <button type="button" onClick={() => insertMarkdown('italic')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FiItalic size={18} /></button>
                            <button type="button" onClick={() => insertMarkdown('link')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FiLink size={18} /></button>
                            <button type="button" onClick={() => insertMarkdown('code')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FiCode size={18} /></button>
                            <button type="button" onClick={() => insertMarkdown('image')} className="inline-flex items-center gap-2 rounded border border-orange-200 px-3 py-2 text-sm font-medium text-orange-500 dark:border-orange-500/20"><FiImage size={16} /> Add Image</button>
                        </div>
                        <p className="mb-6 font-sans text-sm text-slate-400">Markdown preview and published article now share the same renderer.</p>
                        <textarea ref={contentRef} value={form.content} onChange={(event) => changeField('content', event.target.value)} spellCheck placeholder="Start with the problem, explain the concept, and add practical steps..." className="w-full min-h-[70vh] resize-none bg-transparent text-[1.05rem] leading-9 tracking-[0.01em] outline-none" />
                    </div>

                    <aside className="space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-[28px] border border-gray-200 bg-slate-50/70 p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
                                    <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Live Preview</p>
                                    <button type="button" onClick={openSettings} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:text-slate-300">
                                        Settings
                                    </button>
                                </div>
                                <h2 className="mb-4 text-4xl font-bold leading-[0.98] tracking-[-0.04em]">{form.title.trim() || 'Your title here'}</h2>
                                {previewImage && (
                                    <div className="mb-6 overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,237,213,0.72),_rgba(224,231,255,0.72))] dark:border-white/10 dark:bg-[linear-gradient(135deg,_rgba(249,115,22,0.12),_rgba(15,23,42,0.55))]">
                                        <div className="flex h-48 w-full items-center justify-center p-4">
                                            <img
                                                src={previewImage}
                                                alt={form.title || 'Preview cover'}
                                                className={`h-full w-full rounded-[18px] ${form.coverImageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                                            />
                                        </div>
                                        <div className="border-t border-white/70 bg-white/80 px-4 py-3 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-300">
                                            {form.imageUrl ? `Using custom cover image in ${(coverFitLabels[form.coverImageFit] || coverFitLabels.cover).toLowerCase()} mode.` : 'Using the first image from your article as the cover preview.'}
                                        </div>
                                    </div>
                                )}
                                {form.excerpt && <p className="mb-6 text-sm leading-7 text-slate-500 dark:text-slate-400">{form.excerpt}</p>}
                                {form.content.trim() ? <MarkdownRenderer content={form.content} variant="editor" /> : <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 font-sans text-sm leading-7 text-gray-400 dark:border-gray-700 dark:text-gray-500">Start writing to see the public article layout update live.</div>}
                            </div>
                        </div>
                    </aside>
                </div>

                {isSettingsOpen && (
                    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm" onClick={closeSettings}>
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#11151d]" onClick={(event) => event.stopPropagation()}>
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">Metadata</p>
                                    <h2 className="mt-1 text-2xl font-bold">Publishing Settings</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Update slug, cover image, category, topic, SEO, and publish options from this popup.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[form.status]}`}>{form.status}</span>
                                    <button type="button" aria-label="Close settings" onClick={closeSettings} className="rounded-full border border-slate-200 p-2 text-slate-500 dark:border-white/10 dark:text-slate-300"><FiX size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-4 font-sans">
                                <input value={form.slug} onChange={(event) => { setSlugTouched(true); changeField('slug', slugify(event.target.value)); }} placeholder="Slug" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                <textarea value={form.excerpt} onChange={(event) => changeField('excerpt', event.target.value)} rows={3} placeholder="Excerpt" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0f1319]">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <input value={form.imageUrl} onChange={(event) => changeField('imageUrl', event.target.value)} placeholder="Cover image URL" className="w-full flex-1 bg-transparent outline-none" />
                                        {firstContentImage && (
                                            <button
                                                type="button"
                                                onClick={() => changeField('imageUrl', firstContentImage)}
                                                className="rounded-full border border-orange-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-500 dark:border-orange-500/20"
                                            >
                                                Use first content image
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                        Leave this empty and the first markdown image in the article will be used automatically on blog cards and the post page.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0f1319]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Cover image fit</p>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {COVER_IMAGE_FIT_OPTIONS.map((fit) => (
                                            <button
                                                key={fit}
                                                type="button"
                                                onClick={() => changeField('coverImageFit', fit)}
                                                className={`rounded-2xl border px-4 py-3 text-left transition ${form.coverImageFit === fit ? 'border-orange-500 bg-orange-50 text-orange-600 dark:border-orange-400 dark:bg-orange-500/10 dark:text-orange-300' : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-[#121821] dark:text-slate-300'}`}
                                            >
                                                <p className="text-sm font-semibold">{coverFitLabels[fit]}</p>
                                                <p className="mt-1 text-xs leading-5 opacity-80">
                                                    {fit === 'contain' ? 'Show the full image inside a framed card.' : 'Fill the frame edge to edge for a bold hero look.'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input list="topics" value={form.topic} onChange={(event) => changeField('topic', event.target.value.toLowerCase())} placeholder="Topic" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                    <div className="space-y-3">
                                        <input list="categories" value={form.category} onChange={(event) => changeField('category', event.target.value)} placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                                            <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Create new category" className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#121821]" />
                                            <button type="button" onClick={addCategoryOption} className="rounded-2xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-500 dark:border-orange-500/20">
                                                Add category
                                            </button>
                                        </div>
                                        {categoryOptions.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {categoryOptions.slice(0, 8).map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => changeField('category', category)}
                                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${form.category === category ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <datalist id="topics">{TOPIC_OPTIONS.map((topic) => <option key={topic} value={topic} />)}</datalist>
                                <datalist id="categories">{categoryOptions.map((category) => <option key={category} value={category} />)}</datalist>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <select value={form.difficulty} onChange={(event) => changeField('difficulty', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]"><option value="">Difficulty</option>{DIFFICULTY_OPTIONS.map((level) => <option key={level} value={level}>{difficultyLabels[level]}</option>)}</select>
                                    <input type="number" min="1" value={form.featuredRank} onChange={(event) => changeField('featuredRank', event.target.value)} placeholder="Featured rank" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                </div>
                                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"><input type="checkbox" checked={form.featured} onChange={(event) => changeField('featured', event.target.checked)} className="mt-1 h-4 w-4 rounded text-orange-500 focus:ring-orange-500" /><span className="text-sm leading-6">Feature this article on the public blog hub.</span></label>
                                <input value={form.tags} onChange={(event) => changeField('tags', event.target.value)} placeholder="Tags: linux, terminal, tutorial" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                <input value={form.seoTitle} onChange={(event) => changeField('seoTitle', event.target.value)} placeholder="SEO title" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                                <textarea value={form.seoDescription} onChange={(event) => changeField('seoDescription', event.target.value)} rows={3} placeholder="SEO description" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" />
                            </div>

                            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
                                {editingId && editingArticle?.status === POST_STATUS.published && <Link to={resolvePostPath({ id: editingId, slug: form.slug || editingArticle.slug })} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiEye /> View</Link>}
                                <button type="button" onClick={() => saveArticle(POST_STATUS.draft)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiFileText /> Save Draft</button>
                                {editingId && <button type="button" onClick={() => saveArticle(POST_STATUS.archived)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiArchive /> Archive</button>}
                                <button type="button" onClick={() => saveArticle(POST_STATUS.published)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white"><FiUploadCloud /> {editingId ? 'Update Article' : 'Publish Article'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] px-6 pb-20 pt-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div><span className="font-semibold uppercase tracking-wider text-orange-500">Dashboard</span><h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">Blog CMS Console</h1><p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">Manage technical articles, Linux content, metadata, and publishing workflow.</p></div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setActiveTab('overview')} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-slate-600 dark:bg-[#1f2833] dark:border-white/10 dark:text-slate-300'}`}><FiBarChart2 /> Overview</button>
                        <button type="button" onClick={() => openEditor()} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-slate-600 border border-gray-200 dark:bg-[#1f2833] dark:border-white/10 dark:text-slate-300"><FiPlus /> Write</button>
                        <button type="button" onClick={() => setActiveTab('manage')} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium ${activeTab === 'manage' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-slate-600 dark:bg-[#1f2833] dark:border-white/10 dark:text-slate-300'}`}><FiList /> Manage</button>
                    </div>
                </div>

                {status.message && <div className={`mb-8 flex items-center gap-3 rounded-2xl border p-4 ${status.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}{status.message}</div>}

                {activeTab === 'overview' && <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{[['Total Articles', stats.total], ['Published', stats.published], ['Drafts', stats.drafts], ['Linux Articles', stats.linux]].map(([label, value]) => <div key={label} className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#1f2833]"><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">{value}</p></div>)}</div>}

                {activeTab === 'manage' && (
                    <div className="space-y-8">
                        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1f2833]">
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
                                <label className="relative block"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, slug, topic, or tags..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]" /></label>
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]"><option value="all">All statuses</option><option value={POST_STATUS.published}>Published</option><option value={POST_STATUS.draft}>Drafts</option><option value={POST_STATUS.archived}>Archived</option></select>
                                <select value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#0f1319]"><option value="all">All featured states</option><option value="featured">Featured only</option><option value="regular">Regular only</option></select>
                            </div>
                        </div>

                        {isLoading ? <div className="rounded-[28px] border border-gray-200 bg-white p-10 text-center dark:border-white/5 dark:bg-[#1f2833]">Loading articles...</div> : filteredArticles.length === 0 ? <div className="rounded-[28px] border border-gray-200 bg-white p-10 text-center dark:border-white/5 dark:bg-[#1f2833]">No articles found.</div> : <div className="grid gap-5 lg:grid-cols-2">{filteredArticles.map((article) => <div key={article.id} className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#1f2833]"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[article.status]}`}>{article.status}</span>{article.featured && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">Featured</span>}</div><h3 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">{article.title}</h3><p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{article.excerpt || article.content.slice(0, 140) || 'No excerpt yet.'}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">{article.topic && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">{article.topic}</span>}{article.category && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">{article.category}</span>}{article.difficulty && <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">{difficultyLabels[article.difficulty] || article.difficulty}</span>}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => openEditor(article, { openSettings: true })} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiEdit2 /> Edit</button><button type="button" onClick={() => openEditor(article, { openSettings: true })} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiSettings /> Settings</button>{article.status !== POST_STATUS.published && <button type="button" onClick={() => changeStatus(article, POST_STATUS.published)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiUploadCloud /> Publish</button>}{article.status !== POST_STATUS.draft && <button type="button" onClick={() => changeStatus(article, POST_STATUS.draft)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiFileText /> Draft</button>}{article.status !== POST_STATUS.archived && <button type="button" onClick={() => changeStatus(article, POST_STATUS.archived)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-white/10"><FiArchive /> Archive</button>}<button type="button" onClick={() => deleteArticle(article.id)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 dark:border-red-500/20"><FiTrash2 /> Delete</button></div><div className="mt-6 text-sm text-slate-500 dark:text-slate-400"><p>Slug: <span className="font-mono">{article.slug || article.id}</span></p><p className="mt-1">Reading time: {article.readingTime} min</p></div></div>)}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
