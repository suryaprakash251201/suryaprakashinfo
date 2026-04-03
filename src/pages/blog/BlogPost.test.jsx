import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BlogPost from './BlogPost';

const firestoreMocks = vi.hoisted(() => ({
    getDocs: vi.fn(),
    collection: vi.fn(() => 'posts-collection'),
    orderBy: vi.fn(() => 'order'),
    query: vi.fn(() => 'query')
}));

vi.mock('firebase/firestore', () => firestoreMocks);
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('framer-motion', async () => {
    const ReactModule = await import('react');
    return {
        motion: new Proxy(
            {},
            {
                get: (_, tag) => ({ children, ...props }) => ReactModule.createElement(tag, props, children)
            }
        )
    };
});

const makeSnapshot = (posts) => ({
    docs: posts.map((post) => ({
        id: post.id,
        data: () => post
    }))
});

const posts = [
    {
        id: 'linux-basics',
        title: 'Linux Basics',
        slug: 'linux-basics',
        excerpt: 'Start your Linux journey',
        content: '![Cover](https://example.com/linux-basics.png)\n# Linux Basics\n## Install Linux\n### Next Step\nUse the shell every day.',
        imageUrl: 'https://example.com/linux-basics.png',
        coverImageFit: 'contain',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'beginner',
        tags: ['linux', 'terminal'],
        status: 'published',
        readingTime: 3,
        seoTitle: 'Linux Basics SEO',
        seoDescription: 'Linux basics description',
        createdAt: { seconds: 300 },
        publishedAt: { seconds: 300 }
    },
    {
        id: 'linux-shell',
        title: 'Linux Shell',
        slug: 'linux-shell',
        excerpt: 'Move into shell workflows',
        content: 'Shell tips',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'beginner',
        tags: ['linux', 'terminal'],
        featured: true,
        status: 'published',
        readingTime: 4,
        createdAt: { seconds: 280 },
        publishedAt: { seconds: 280 }
    },
    {
        id: 'legacy-post',
        title: 'Legacy Linux Post',
        slug: '',
        excerpt: 'Legacy route support',
        content: '## Legacy Heading\nLegacy body',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'intermediate',
        tags: ['linux'],
        status: 'published',
        readingTime: 4,
        createdAt: { seconds: 260 },
        publishedAt: { seconds: 260 }
    }
];

const renderPost = (initialEntry) =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/blog" element={<div>Blog hub</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('BlogPost', () => {
    it('renders a post by slug with toc and recommended next content', async () => {
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(posts));

        renderPost('/blog/linux-basics');

        expect((await screen.findAllByRole('heading', { name: /linux basics/i }))[0]).toBeInTheDocument();
        expect(screen.getAllByText(/on this page/i)[0]).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /continue learning/i })).toHaveAttribute('href', '/blog/linux-shell');
        expect(screen.getByAltText(/linux basics/i)).toHaveClass('object-contain');
        expect(document.title).toBe('Linux Basics SEO');
        expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Linux basics description');
    });

    it('supports legacy id-based routing when a slug is missing', async () => {
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(posts));

        renderPost('/blog/legacy-post');

        expect(await screen.findByText(/legacy linux post/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText(/legacy heading/i)[0]).toBeInTheDocument();
        });
    });
});
