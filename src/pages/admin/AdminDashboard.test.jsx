import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';

const firestoreMocks = vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(() => 'posts-collection'),
    deleteDoc: vi.fn(),
    doc: vi.fn((...parts) => parts.slice(1).join('/')),
    getDocs: vi.fn(),
    orderBy: vi.fn(() => 'order'),
    query: vi.fn(() => 'query'),
    serverTimestamp: vi.fn(() => ({ seconds: 999 })),
    updateDoc: vi.fn()
}));

vi.mock('firebase/firestore', () => firestoreMocks);
vi.mock('../../config/firebase', () => ({ db: {} }));

const makeSnapshot = (posts) => ({
    docs: posts.map((post) => ({
        id: post.id,
        data: () => post
    }))
});

const existingPosts = [
    {
        id: 'draft-linux',
        title: 'Linux Draft',
        slug: 'linux-draft',
        excerpt: 'Draft post',
        imageUrl: '',
        content: '## Draft intro\nInitial content',
        category: 'Linux',
        topic: 'linux',
        difficulty: 'beginner',
        tags: ['linux'],
        status: 'draft',
        featured: false,
        readingTime: 1,
        createdAt: { seconds: 100 }
    },
    {
        id: 'firebase-post',
        title: 'Firebase Tips',
        slug: 'firebase-tips',
        excerpt: 'Firebase article',
        imageUrl: '',
        content: 'Firebase content',
        category: 'Backend',
        topic: 'firebase',
        difficulty: 'intermediate',
        tags: ['firebase'],
        status: 'published',
        featured: true,
        featuredRank: 1,
        readingTime: 2,
        createdAt: { seconds: 200 },
        publishedAt: { seconds: 200 }
    }
];

describe('AdminDashboard', () => {
    it('opens edit mode safely with a legacy autosaved draft missing cover fit metadata', async () => {
        window.localStorage.clear();
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(existingPosts));

        window.localStorage.setItem(
            'sp-admin-draft:draft-linux',
            JSON.stringify({
                form: {
                    title: 'Legacy Draft Copy',
                    slug: 'linux-draft',
                    excerpt: 'Draft post',
                    imageUrl: 'https://example.com/linux.png',
                    content: '## Draft intro\nInitial content'
                },
                slugTouched: true,
                savedAt: Date.now()
            })
        );

        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/enter admin password/i), { target: { value: 'admin123' } });
        await user.click(screen.getByRole('button', { name: /access dashboard/i }));
        expect(await screen.findByText(/blog cms console/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /manage/i }));
        await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);

        expect(await screen.findByDisplayValue(/legacy draft copy/i)).toBeInTheDocument();
        expect(screen.getByText(/using custom cover image in fill frame mode/i)).toBeInTheDocument();
        window.localStorage.clear();
    });

    it('creates and publishes a new article with live preview updates', async () => {
        window.localStorage.clear();
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(existingPosts));
        firestoreMocks.addDoc.mockResolvedValue({ id: 'new-post' });

        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/enter admin password/i), { target: { value: 'admin123' } });
        await user.click(screen.getByRole('button', { name: /access dashboard/i }));
        expect(await screen.findByText(/blog cms console/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /write/i }));
        fireEvent.change(screen.getByPlaceholderText(/write a technical article title/i), { target: { value: 'Linux Learning Path' } });
        fireEvent.change(screen.getByPlaceholderText(/start with the problem/i), { target: { value: '## Introduction\nLinux is powerful.' } });
        await user.click(screen.getByRole('button', { name: /publishing settings/i }));
        expect(await screen.findByRole('button', { name: /close settings/i })).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText(/^excerpt$/i), { target: { value: 'A beginner-first Linux roadmap.' } });
        fireEvent.change(screen.getByPlaceholderText(/^topic$/i), { target: { value: 'linux' } });
        fireEvent.change(screen.getByPlaceholderText(/create new category/i), { target: { value: 'Linux Tutorials' } });
        await user.click(screen.getByRole('button', { name: /add category/i }));
        await user.selectOptions(screen.getByDisplayValue(/difficulty/i), 'beginner');
        await user.click(screen.getByRole('button', { name: /fit entire image/i }));
        fireEvent.change(screen.getByPlaceholderText(/tags:/i), { target: { value: 'linux, tutorial' } });
        await user.click(screen.getByRole('button', { name: /close settings/i }));

        expect(screen.getAllByText(/introduction/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/linux is powerful\./i).length).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: /^publish$/i }));
        expect(await screen.findByRole('button', { name: /close settings/i })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /publish article/i }));

        await waitFor(() => {
            expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(1);
        });

        const [, payload] = firestoreMocks.addDoc.mock.calls[0];
        expect(payload).toMatchObject({
            title: 'Linux Learning Path',
            slug: 'linux-learning-path',
            excerpt: 'A beginner-first Linux roadmap.',
            topic: 'linux',
            category: 'Linux Tutorials',
            difficulty: 'beginner',
            coverImageFit: 'contain',
            tags: ['linux', 'tutorial'],
            status: 'published',
            readingTime: 1
        });
    });

    it('filters drafts in manage view and updates an existing article', async () => {
        window.localStorage.clear();
        firestoreMocks.getDocs.mockResolvedValue(makeSnapshot(existingPosts));
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/enter admin password/i), { target: { value: 'admin123' } });
        await user.click(screen.getByRole('button', { name: /access dashboard/i }));
        expect(await screen.findByText(/blog cms console/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /manage/i }));
        fireEvent.change(screen.getByPlaceholderText(/search title, slug, topic, or tags/i), { target: { value: 'linux' } });
        await user.selectOptions(screen.getByDisplayValue(/all statuses/i), 'draft');

        expect(await screen.findByText(/linux draft/i)).toBeInTheDocument();
        expect(screen.queryByText(/firebase tips/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /edit/i }));
        expect(await screen.findByRole('button', { name: /close settings/i })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /close settings/i }));
        fireEvent.change(screen.getByPlaceholderText(/write a technical article title/i), { target: { value: 'Linux Draft Updated' } });
        await user.click(screen.getByRole('button', { name: /publishing settings/i }));
        fireEvent.change(screen.getByPlaceholderText(/^slug$/i), { target: { value: 'linux-draft-updated' } });
        expect(await screen.findByRole('button', { name: /close settings/i })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /update article/i }));

        await waitFor(() => {
            expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
        });

        expect(firestoreMocks.updateDoc.mock.calls[0][0]).toBe('posts/draft-linux');
        expect(firestoreMocks.updateDoc.mock.calls[0][1]).toMatchObject({
            title: 'Linux Draft Updated',
            slug: 'linux-draft-updated',
            status: 'published'
        });
    });
});
