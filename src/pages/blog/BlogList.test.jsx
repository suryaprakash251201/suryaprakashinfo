import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BlogList from './BlogList';

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
        content: 'Intro to Linux',
        imageUrl: 'https://example.com/linux-basics.png',
        coverImageFit: 'contain',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'beginner',
        tags: ['linux', 'terminal'],
        featured: true,
        featuredRank: 1,
        status: 'published',
        readingTime: 3,
        createdAt: { seconds: 300 }
    },
    {
        id: 'linux-advanced',
        title: 'Linux Advanced',
        slug: 'linux-advanced',
        excerpt: 'Processes and performance',
        content: 'Advanced shell scripting',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'advanced',
        tags: ['linux', 'automation'],
        featured: false,
        status: 'published',
        readingTime: 5,
        createdAt: { seconds: 200 }
    },
    {
        id: 'firebase-guide',
        title: 'Firebase Guide',
        slug: 'firebase-guide',
        excerpt: 'Deploy apps with Firebase',
        content: 'Firestore rules and hosting',
        category: 'Backend',
        topic: 'firebase',
        difficulty: 'intermediate',
        tags: ['firebase'],
        featured: false,
        status: 'published',
        readingTime: 4,
        createdAt: { seconds: 250 }
    },
    {
        id: 'draft-linux',
        title: 'Draft Linux Notes',
        slug: 'draft-linux',
        excerpt: 'Should stay hidden',
        content: 'Draft content',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'beginner',
        tags: ['linux'],
        featured: false,
        status: 'draft',
        readingTime: 2,
        createdAt: { seconds: 150 }
    }
];

describe('BlogList', () => {
    it('renders published posts, filters by topic and difficulty, and keeps slug links', async () => {
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(posts));
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <BlogList />
            </MemoryRouter>
        );

        expect(await screen.findByText(/technical learning hub/i)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /linux basics/i })[0]).toHaveAttribute('href', '/blog/linux-basics');
        expect(screen.getByAltText(/linux basics/i)).toHaveClass('object-contain');
        expect(screen.queryByText(/draft linux notes/i)).not.toBeInTheDocument();

        const combos = screen.getAllByRole('combobox');
        await user.selectOptions(combos[0], 'linux');
        await user.selectOptions(combos[2], 'advanced');

        await waitFor(() => {
            expect(screen.getAllByText(/linux advanced/i).length).toBeGreaterThan(0);
            expect(screen.queryByText(/firebase guide/i)).not.toBeInTheDocument();
        });
    });

    it('supports text search and clearing no-result filters', async () => {
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(posts));
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <BlogList />
            </MemoryRouter>
        );

        await screen.findAllByText(/linux basics/i);
        await user.type(screen.getByPlaceholderText(/search title, topic, tags, or content/i), 'no match');

        expect(await screen.findByText(/no articles found with the current filters/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /clear filters/i }));

        await waitFor(() => {
            expect(screen.getByText(/firebase guide/i)).toBeInTheDocument();
        });
    });
});
