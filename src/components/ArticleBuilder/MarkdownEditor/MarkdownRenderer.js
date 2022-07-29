import showdownVideoPlugin from 'components/ArticleBuilder/MarkdownEditor/showdownVideoPlugin';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import { MarkdownContainer } from 'components/ArticleBuilder/MarkdownEditor/styled';

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
        underline: true,
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: converter.makeHtml(sanitize(text, { ADD_ATTR: ['target'] })) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string,
};

export default MarkdownRenderer;
