import { createReference, setUsedReferences as setUsedReferencesAction } from 'actions/smartReview';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import styled from 'styled-components';
import REGEX from 'constants/regex';
import Cite from 'citation-js';
import showdownVideoPlugin from 'components/ArticleBuilder/MarkdownEditor/showdownVideoPlugin';

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
    img {
        max-width: 100%;
    }
`;

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer = ({ text, id }) => {
    const contributionId = useSelector(state => state.smartReview.contributionId);
    const references = useSelector(state => state.smartReview.references);
    const [fetchedDois, setFetchedDois] = useState([]);
    const referenceRegex = useMemo(() => /\[@(.*?)\]/gi, []);
    const dispatch = useDispatch();

    const inlineReferences = {
        type: 'lang',
        regex: referenceRegex,
        replace: reference => {
            const keyFormatted = formatReferenceKey(reference);
            const matchingReference = getReferenceByKey(keyFormatted);
            if (matchingReference) {
                return `([${matchingReference?.parsedReference?.author?.[0]?.family ?? 'Unknown'}, ${matchingReference?.parsedReference?.issued?.[
                    'date-parts'
                ]?.[0]?.[0] ?? ''}](#reference${keyFormatted}))`;
            }
            return '<strong>[?]</strong>';
        }
    };

    const formatReferenceKey = useCallback(key => key.slice(0, -1).slice(2, key.length), []);

    const getReferenceByKey = useCallback(
        key => {
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
            matches.map(async key => {
                const keyFormatted = formatReferenceKey(key);
                const reference = getReferenceByKey(keyFormatted);

                if (reference) {
                    _usedReferences[reference.parsedReference.id] = reference;
                } else if (REGEX.DOI.test(keyFormatted) && !fetchedDois.includes(keyFormatted)) {
                    setFetchedDois(v => [...v, keyFormatted]);
                    try {
                        const data = await Cite.async(keyFormatted);
                        const parsedReference = data?.data?.[0];

                        if (!parsedReference) {
                            return null;
                        }

                        parsedReference['citation-label'] = 'KEY_PLACEHOLDER'; // citation-js doesn't accept citation keys with dots in them, so use a placeholder which is later replaced
                        parsedReference.id = keyFormatted;
                        const bibtex = data.format('bibtex').replace('KEY_PLACEHOLDER', keyFormatted);
                        parsedReference['citation-label'] = keyFormatted;

                        dispatch(createReference({ contributionId, bibtex, parsedReference }));
                    } catch (e) {
                        console.log(e);
                    }
                }
                return null;
            });
        dispatch(setUsedReferencesAction({ references: _usedReferences, sectionId: id }));
    }, [text, references, referenceRegex, getReferenceByKey, dispatch, id, formatReferenceKey, fetchedDois, contributionId]);

    const converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        extensions: [footnotes, inlineReferences, showdownVideoPlugin],
        underline: true
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: converter.makeHtml(sanitize(text, { ADD_ATTR: ['target'] })) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string,
    id: PropTypes.string
};

MarkdownRenderer.defaultProps = {
    text: null
};

export default MarkdownRenderer;
