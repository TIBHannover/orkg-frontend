import { setUsedReferences as setUsedReferencesAction } from 'actions/smartReview';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import styled from 'styled-components';

const MarkdownContainer = styled.p`
    blockquote {
        color: rgba(0, 0, 0, 0.5);
        padding-left: 1.5em;
        border-left: 5px solid rgba(0, 0, 0, 0.1);
    }
`;

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer = ({ text, id }) => {
    const references = useSelector(state => state.smartReview.references);
    const referenceRegex = useMemo(() => /\[\@(.*?)\]/gi, []);
    const dispatch = useDispatch();

    const inlineReferences = {
        type: 'lang',
        regex: referenceRegex,
        replace: reference => {
            const matchingReference = getReferenceByKey(reference);
            if (matchingReference) {
                return `(${matchingReference?.parsedReference?.author?.[0]?.family ?? 'Unknown'}, ${matchingReference?.parsedReference?.issued?.[
                    'date-parts'
                ]?.[0] ?? ''})`;
            }
            return '<strong>[?]</strong>';
        }
    };

    const getReferenceByKey = useCallback(
        referenceText => {
            const key = referenceText.slice(0, -1).slice(2, referenceText.length);
            return references.find(reference => reference?.parsedReference?.id === key);
        },
        [references]
    );

    useEffect(() => {
        if (!text) {
            return;
        }
        const _usedReferences = {};
        const matches = text.match(referenceRegex);
        matches &&
            matches.length &&
            matches.map(key => {
                const reference = getReferenceByKey(key);
                if (reference) {
                    _usedReferences[reference.parsedReference.id] = reference;
                }
                return null;
            });
        dispatch(setUsedReferencesAction({ references: _usedReferences, sectionId: id }));
    }, [text, references, referenceRegex, getReferenceByKey, dispatch, id]);

    const converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        extensions: [footnotes, inlineReferences],
        underline: true
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: sanitize(converter.makeHtml(text), { ADD_ATTR: ['target'] }) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string,
    id: PropTypes.string
};

MarkdownRenderer.defaultProps = {
    text: null
};

export default MarkdownRenderer;
