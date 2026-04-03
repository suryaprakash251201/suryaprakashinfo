export const POST_STATUS = {
    draft: 'draft',
    published: 'published',
    archived: 'archived'
};

export const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

export const TOPIC_OPTIONS = ['linux', 'devops', 'web', 'firebase', 'security', 'career'];

export const COVER_IMAGE_FIT_OPTIONS = ['cover', 'contain'];

export const PRESET_CATEGORY_OPTIONS = [
    'Linux Basics',
    'Linux Commands',
    'Shell Scripting',
    'System Administration',
    'DevOps',
    'Firebase',
    'Web Development',
    'Security',
    'Career'
];

export const slugify = (value = '') =>
    value
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

export const estimateReadingTime = (content = '') => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};

export const parseTags = (value) => {
    if (Array.isArray(value)) {
        return value.map((tag) => String(tag).trim()).filter(Boolean);
    }

    return String(value || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

export const extractFirstMarkdownImage = (content = '') => {
    const match = /!\[[^\]]*]\((https?:\/\/[^)\s]+(?:\s+"[^"]*")?)\)/i.exec(String(content || ''));
    return match ? match[1].trim().replace(/\s+"[^"]*"$/, '') : '';
};

export const stripMarkdownToText = (content = '') =>
    String(content || '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[([^\]]*)]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
        .replace(/^>\s?/gm, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/[*_~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

export const buildExcerpt = (rawExcerpt = '', content = '', maxLength = 170) => {
    const source = String(rawExcerpt || '').trim() || stripMarkdownToText(content);
    if (source.length <= maxLength) return source;

    const trimmed = source.slice(0, maxLength).trim();
    const safeEdge = trimmed.lastIndexOf(' ');
    return `${(safeEdge > 80 ? trimmed.slice(0, safeEdge) : trimmed).trim()}...`;
};

export const removeFirstMarkdownImage = (content = '', targetUrl = '') => {
    const source = String(content || '');
    if (!source.trim()) return source;

    const pattern = /!\[[^\]]*]\((https?:\/\/[^)\s]+(?:\s+"[^"]*")?)\)\s*/i;
    const match = pattern.exec(source);
    if (!match) return source;

    const matchedUrl = match[1].trim().replace(/\s+"[^"]*"$/, '');
    if (targetUrl && matchedUrl !== targetUrl) return source;

    return `${source.slice(0, match.index)}${source.slice(match.index + match[0].length)}`.trimStart();
};

const textIncludes = (value, query) => String(value || '').toLowerCase().includes(query);

const deriveTopic = (raw = {}, id = '') => {
    if (raw.topic) return raw.topic;

    const pool = [raw.category, ...(raw.tags || []), raw.title, raw.excerpt, raw.content, id]
        .map((entry) => String(entry || '').toLowerCase())
        .join(' ');

    if (pool.includes('linux')) return 'linux';
    if (pool.includes('firebase')) return 'firebase';
    if (pool.includes('devops')) return 'devops';
    if (pool.includes('security') || pool.includes('cyber')) return 'security';
    if (pool.includes('web')) return 'web';

    return '';
};

export const normalizePost = (raw = {}, id = '') => {
    const title = raw.title || 'Untitled article';
    const slug = raw.slug || '';
    const content = raw.content || '';
    const tags = parseTags(raw.tags);
    const topic = deriveTopic(raw, id);
    const status = raw.status || POST_STATUS.published;
    const difficulty = raw.difficulty || '';
    const featuredRank = Number.isFinite(Number(raw.featuredRank)) ? Number(raw.featuredRank) : null;
    const explicitImageUrl = raw.imageUrl || '';
    const imageUrl = explicitImageUrl || extractFirstMarkdownImage(content);
    const excerpt = buildExcerpt(raw.excerpt, content);
    const coverImageFit = raw.coverImageFit === 'contain' ? 'contain' : 'cover';

    return {
        id,
        title,
        excerpt,
        imageUrl,
        coverImageFit,
        coverImageSource: explicitImageUrl ? 'explicit' : imageUrl ? 'content' : 'none',
        content,
        featured: Boolean(raw.featured),
        featuredRank,
        category: raw.category || '',
        topic,
        difficulty,
        tags,
        slug,
        status,
        seoTitle: raw.seoTitle || '',
        seoDescription: raw.seoDescription || '',
        createdAt: raw.createdAt || null,
        updatedAt: raw.updatedAt || null,
        publishedAt: raw.publishedAt || null,
        readingTime: raw.readingTime || estimateReadingTime(content)
    };
};

export const sortPostsByRecency = (posts = []) =>
    [...posts].sort((left, right) => {
        const leftSeconds = left.createdAt?.seconds || 0;
        const rightSeconds = right.createdAt?.seconds || 0;
        return rightSeconds - leftSeconds;
    });

export const sortPostsByFeatured = (posts = []) =>
    [...posts].sort((left, right) => {
        const rankDelta = (left.featuredRank ?? Number.MAX_SAFE_INTEGER) - (right.featuredRank ?? Number.MAX_SAFE_INTEGER);
        if (rankDelta !== 0) return rankDelta;
        if (left.featured !== right.featured) return Number(right.featured) - Number(left.featured);
        return (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0);
    });

export const resolvePostPath = (post) => `/blog/${post.slug || post.id}`;

export const matchesPostQuery = (post, rawQuery) => {
    const query = String(rawQuery || '').trim().toLowerCase();
    if (!query) return true;

    return [
        post.title,
        post.excerpt,
        post.content,
        post.category,
        post.topic,
        post.difficulty,
        ...(post.tags || [])
    ].some((value) => textIncludes(value, query));
};

export const extractMarkdownHeadings = (content = '') => {
    const headings = [];
    const lines = String(content || '').split('\n');
    let inCodeFence = false;

    lines.forEach((line) => {
        if (line.trim().startsWith('```')) {
            inCodeFence = !inCodeFence;
            return;
        }

        if (inCodeFence) return;

        const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
        if (!match) return;

        const level = match[1].length;
        const text = match[2].replace(/[*_`#[\]]/g, '').trim();

        if (!text) return;

        headings.push({
            level,
            text,
            id: slugify(text)
        });
    });

    return headings;
};

export const scoreRelatedPost = (currentPost, candidate) => {
    if (!candidate || candidate.id === currentPost.id) return -1;

    let score = 0;
    if (currentPost.topic && candidate.topic === currentPost.topic) score += 5;
    if (currentPost.category && candidate.category === currentPost.category) score += 3;
    if (currentPost.difficulty && candidate.difficulty === currentPost.difficulty) score += 2;
    if (candidate.featured) score += 1;

    const sharedTags = candidate.tags.filter((tag) => currentPost.tags.includes(tag)).length;
    score += sharedTags * 2;

    return score;
};

export const getRelatedPosts = (posts, currentPost, limit = 3) =>
    posts
        .map((post) => ({ post, score: scoreRelatedPost(currentPost, post) }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            return (right.post.createdAt?.seconds || 0) - (left.post.createdAt?.seconds || 0);
        })
        .slice(0, limit)
        .map((entry) => entry.post);

export const getRecommendedNextPost = (posts, currentPost) =>
    getRelatedPosts(posts, currentPost, 1)[0] || null;
