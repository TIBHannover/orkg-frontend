import showdownVideoPlugin from 'components/ArticleBuilder/MarkdownEditor/showdownVideoPlugin';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import styled from 'styled-components';

const MarkdownContainer = styled.p`
    blockquote {
        color: rgba(0, 0, 0, 0.5);
        padding-left: 1.5em;
        border-left: 5px solid rgba(0, 0, 0, 0.1);
    }
    table td,
    table th {
        border: 1px solid #c4c4c4;
        padding: 3px 5px;
    }
`;

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer = ({ text = null }) => {
    const converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        extensions: [footnotes, showdownVideoPlugin],
        underline: true
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: converter.makeHtml(sanitize(text, { ADD_ATTR: ['target'] })) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string
};

export default MarkdownRenderer;
