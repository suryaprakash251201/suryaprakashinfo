import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
});

beforeEach(() => {
    window.scrollTo = vi.fn();
    window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);

    Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        writable: true,
        value: {
            getVoices: vi.fn(() => []),
            speak: vi.fn(),
            cancel: vi.fn(),
            onvoiceschanged: undefined
        }
    });

    Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        writable: true,
        value: {
            writeText: vi.fn().mockResolvedValue(undefined)
        }
    });

    if (!document.querySelector('meta[name="description"]')) {
        const tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
    }
});
