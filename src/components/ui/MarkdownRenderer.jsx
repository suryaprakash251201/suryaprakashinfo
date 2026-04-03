import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { slugify } from '../../lib/blog';

const textFromChildren = (children) =>
    React.Children.toArray(children)
        .map((child) => {
            if (typeof child === 'string') return child;
            if (typeof child === 'number') return String(child);
            if (child?.props?.children) return textFromChildren(child.props.children);
            return '';
        })
        .join('');

const markdownVariants = {
    article: `
        prose prose-lg md:prose-xl dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-h1:text-4xl prose-h1:mb-8 prose-h1:leading-tight
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:leading-tight
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-tight
        prose-p:my-5 prose-p:text-gray-800 dark:prose-p:text-gray-300 prose-p:leading-[1.9]
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/60 dark:prose-blockquote:bg-orange-500/10 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:text-lg prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
        prose-img:my-8 prose-img:rounded-2xl prose-img:shadow-md
        prose-ul:my-6 prose-ol:my-6 prose-li:my-1.5 prose-li:text-gray-800 dark:prose-li:text-gray-300 prose-li:leading-[1.8]
        prose-hr:my-10 prose-hr:border-gray-200 dark:prose-hr:border-gray-800
        prose-table:block prose-table:w-full prose-table:overflow-x-auto
        prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700 prose-th:bg-gray-50 dark:prose-th:bg-gray-800/80 prose-th:px-4 prose-th:py-3 prose-th:text-left
        prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:px-4 prose-td:py-3
        prose-code:before:content-none prose-code:after:content-none
        break-words
    `,
    editor: `
        prose prose-base md:prose-lg dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-h1:text-4xl prose-h1:mb-7 prose-h1:leading-tight
        prose-h2:text-[1.9rem] prose-h2:mt-10 prose-h2:mb-4 prose-h2:leading-tight
        prose-h3:text-[1.45rem] prose-h3:mt-8 prose-h3:mb-3 prose-h3:leading-tight
        prose-p:my-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[1.85]
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:my-7 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/60 dark:prose-blockquote:bg-orange-500/10 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:text-base prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
        prose-img:my-7 prose-img:rounded-2xl prose-img:shadow-md
        prose-ul:my-5 prose-ol:my-5 prose-li:my-1 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-[1.75]
        prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-gray-800
        prose-table:block prose-table:w-full prose-table:overflow-x-auto
        prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700 prose-th:bg-gray-50 dark:prose-th:bg-gray-800/80 prose-th:px-4 prose-th:py-3 prose-th:text-left
        prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:px-4 prose-td:py-3
        prose-code:before:content-none prose-code:after:content-none
        break-words
    `
};

const CodeBlock = ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const isBlock = Boolean(match) || codeString.includes('\n');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    if (isBlock) {
        return (
            <div className="relative my-8 overflow-hidden rounded-2xl border border-gray-200 bg-[#111827] shadow-xl dark:border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    <span>{match?.[1] || 'code'}</span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-300 transition hover:bg-white/10 hover:text-white"
                    >
                        {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <pre className="overflow-x-auto px-5 py-5 text-[14px] leading-7 text-gray-100">
                    <code className={className} {...props}>
                        {codeString}
                    </code>
                </pre>
            </div>
        );
    }

    return (
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-orange-600 dark:bg-gray-800 dark:text-orange-400" {...props}>
            {children}
        </code>
    );
};

const markdownComponents = {
    code: CodeBlock,
    h1: ({ children, ...props }) => {
        const text = textFromChildren(children);
        return <h1 id={slugify(text)} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
        const text = textFromChildren(children);
        return <h2 id={slugify(text)} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
        const text = textFromChildren(children);
        return <h3 id={slugify(text)} {...props}>{children}</h3>;
    },
    a: ({ href, children, ...props }) => {
        const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);

        return (
            <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
                {...props}
            >
                {children}
            </a>
        );
    },
    img: ({ alt, ...props }) => (
        <img
            alt={alt || 'Blog image'}
            className="w-full rounded-2xl object-cover"
            {...props}
        />
    )
};

const MarkdownRenderer = ({ content = '', variant = 'article', className = '' }) => {
    const variantClasses = markdownVariants[variant] || markdownVariants.article;

    return (
        <div className={`${variantClasses} ${className}`.trim()}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
