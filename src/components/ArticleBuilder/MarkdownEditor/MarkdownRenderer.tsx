import { sanitize } from 'isomorphic-dompurify';
import PropTypes from 'prop-types';
import { FC } from 'react';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';

import showdownVideoPlugin from '@/components/ArticleBuilder/MarkdownEditor/showdownVideoPlugin';
import { MarkdownContainer } from '@/components/ArticleBuilder/MarkdownEditor/styled';

type MarkdownRendererProps = {
    text?: string;
};

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer: FC<MarkdownRendererProps> = ({ text = '' }) => {
    const converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        extensions: [footnotes, showdownVideoPlugin],
        underline: true, // enabled for backward compatibility, option not visible in toolbar
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: converter.makeHtml(sanitize(text, { ADD_ATTR: ['target'] })) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string,
};

export default MarkdownRenderer;
