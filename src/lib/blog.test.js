import {
    buildExcerpt,
    extractMarkdownHeadings,
    extractFirstMarkdownImage,
    getRecommendedNextPost,
    getRelatedPosts,
    matchesPostQuery,
    normalizePost,
    removeFirstMarkdownImage,
    resolvePostPath,
    slugify
} from './blog';
import { describe, expect, it } from 'vitest';

const makePost = (overrides = {}) => ({
    id: 'post-1',
    title: 'Linux Basics',
    excerpt: 'Learn Linux from scratch',
    imageUrl: '',
    content: '## Intro\nLinux commands and shell basics',
    featured: false,
    featuredRank: null,
    category: 'Linux',
    topic: 'linux',
    difficulty: 'beginner',
    tags: ['linux', 'shell'],
    slug: 'linux-basics',
    status: 'published',
    seoTitle: '',
    seoDescription: '',
    createdAt: { seconds: 100 },
    updatedAt: null,
    publishedAt: null,
    readingTime: 2,
    ...overrides
});

describe('blog helpers', () => {
    it('slugifies titles and resolves slug-first paths', () => {
        expect(slugify(' Linux From Basic to Master! ')).toBe('linux-from-basic-to-master');
        expect(resolvePostPath({ id: 'abc123', slug: 'linux-basics' })).toBe('/blog/linux-basics');
        expect(resolvePostPath({ id: 'abc123', slug: '' })).toBe('/blog/abc123');
    });

    it('normalizes legacy posts with derived topic and reading time', () => {
        const post = normalizePost(
            {
                title: 'Terminal Commands',
                category: 'Linux',
                content: '![Cover](https://example.com/linux.png)\n## Intro\nlinux '.repeat(220),
                tags: 'cli, shell'
            },
            'legacy-post'
        );

        expect(post.topic).toBe('linux');
        expect(post.tags).toEqual(['cli', 'shell']);
        expect(post.readingTime).toBe(5);
        expect(post.status).toBe('published');
        expect(post.imageUrl).toBe('https://example.com/linux.png');
        expect(post.coverImageSource).toBe('content');
        expect(post.coverImageFit).toBe('cover');
        expect(post.excerpt).not.toMatch(/!\[/);
    });

    it('preserves an explicit cover image fit mode', () => {
        const post = normalizePost(
            {
                title: 'Linux Diagram',
                content: 'Body',
                imageUrl: 'https://example.com/diagram.png',
                coverImageFit: 'contain'
            },
            'diagram-post'
        );

        expect(post.coverImageFit).toBe('contain');
        expect(post.coverImageSource).toBe('explicit');
    });

    it('extracts a first markdown image and builds a clean fallback excerpt', () => {
        expect(
            extractFirstMarkdownImage('Text\n![Linux cover](https://example.com/cover.jpg "Linux")\nMore')
        ).toBe('https://example.com/cover.jpg');

        expect(
            buildExcerpt('', '## Linux Intro\n![Cover](https://example.com/cover.jpg)\nLearn **Linux** commands with [examples](https://example.com).')
        ).toBe('Linux Intro Learn Linux commands with examples.');

        expect(
            removeFirstMarkdownImage('![Cover](https://example.com/cover.jpg)\n## Intro\nBody', 'https://example.com/cover.jpg')
        ).toBe('## Intro\nBody');
    });

    it('matches queries and ignores headings inside fenced code blocks', () => {
        const post = makePost();
        expect(matchesPostQuery(post, 'shell')).toBe(true);
        expect(matchesPostQuery(post, 'firebase')).toBe(false);

        const headings = extractMarkdownHeadings(`
# Linux
Some text
\`\`\`md
## Ignore me
\`\`\`
## Install
### Next step
        `);

        expect(headings).toEqual([
            { level: 1, text: 'Linux', id: 'linux' },
            { level: 2, text: 'Install', id: 'install' },
            { level: 3, text: 'Next step', id: 'next-step' }
        ]);
    });

    it('returns the strongest related posts and next recommendation', () => {
        const current = makePost({ id: 'current' });
        const related = makePost({
            id: 'related-1',
            title: 'Linux Shell Guide',
            slug: 'linux-shell-guide',
            featured: true,
            createdAt: { seconds: 120 }
        });
        const mediumMatch = makePost({
            id: 'related-2',
            title: 'Linux Networking',
            slug: 'linux-networking',
            tags: ['linux'],
            difficulty: 'advanced',
            createdAt: { seconds: 110 }
        });
        const unrelated = makePost({
            id: 'other',
            title: 'Firebase Hosting',
            slug: 'firebase-hosting',
            topic: 'firebase',
            category: 'Firebase',
            tags: ['firebase'],
            difficulty: 'intermediate'
        });

        const results = getRelatedPosts([current, mediumMatch, related, unrelated], current, 2);

        expect(results.map((post) => post.id)).toEqual(['related-1', 'related-2']);
        expect(getRecommendedNextPost([current, mediumMatch, related, unrelated], current)?.id).toBe('related-1');
    });
});
