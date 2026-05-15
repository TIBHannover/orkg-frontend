import { FC } from 'react';

import { parseMarkdown } from '@/lib/markdown';

type MarkdownRendererProps = {
    text?: string;
};

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
const MarkdownRenderer: FC<MarkdownRendererProps> = ({ text = '' }) => {
    const html = parseMarkdown(text);
    return <div className="prose [&_img]:max-w-full [&_img]:h-auto" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownRenderer;
