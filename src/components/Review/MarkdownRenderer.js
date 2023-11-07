import { createReference, setUsedReferences as setUsedReferencesAction } from 'slices/reviewSlice';
import { sanitize } from 'dompurify';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Showdown from 'showdown';
import footnotes from 'showdown-footnotes';
import REGEX from 'constants/regex';
import { Cite } from '@citation-js/core';
import showdownVideoPlugin from 'components/ArticleBuilder/MarkdownEditor/showdownVideoPlugin';
import { MarkdownContainer } from 'components/ArticleBuilder/MarkdownEditor/styled';

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */
/* TODO: secure ADD_ATTR */
const MarkdownRenderer = ({ text = null, id }) => {
    const contributionId = useSelector(state => state.review.contributionId);
    const references = useSelector(state => state.review.references);
    const [fetchedDois, setFetchedDois] = useState([]);
    const referenceRegex = useMemo(() => /\[@(.*?)\]/gi, []);
    const dispatch = useDispatch();

    const formatReferenceKey = useCallback(key => key.slice(0, -1).slice(2, key.length), []);

    const getReferenceByKey = useCallback(
        key => {
            // citation-js formats reference keys by formating punctuation and other 'unsafe' characters.
            // copied the code from the repo
            // https://github.com/citation-js/citation-js/blob/7f41e3080ba6b9b57158fd6a8ce3b5110e042a1e/packages/plugin-bibtex/src/mapping/shared.js#L11
            const unsafeChars = /(?:<\/?.*?>|[\u0020-\u002F\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007F])+/g;
            return references.find(
                reference => reference?.parsedReference?.id === key || reference?.parsedReference?.id === key.toString().replace(unsafeChars, ''),
            );
        },
        [references],
    );

    const inlineReferences = {
        type: 'lang',
        regex: referenceRegex,
        replace: reference => {
            const keyFormatted = formatReferenceKey(reference);
            const matchingReference = getReferenceByKey(keyFormatted);
            if (matchingReference) {
                return `([${matchingReference?.parsedReference?.author?.[0]?.family ?? 'Unknown'}, ${
                    matchingReference?.parsedReference?.issued?.['date-parts']?.[0]?.[0] ?? ''
                }](#reference${keyFormatted}))`;
            }
            return '<strong>[?]</strong>';
        },
    };

    useEffect(() => {
        if (!text) {
            return;
        }
        const _usedReferences = {};
        const matches = text.match(referenceRegex);

        if (matches && matches.length) {
            matches.map(async key => {
                const keyFormatted = formatReferenceKey(key);
                const reference = getReferenceByKey(keyFormatted);

                if (reference) {
                    _usedReferences[reference.parsedReference.id] = reference;
                } else if (REGEX.DOI_ID.test(keyFormatted) && !fetchedDois.includes(keyFormatted)) {
                    setFetchedDois(v => [...v, keyFormatted]);
                    try {
                        const data = await Cite.async(keyFormatted);
                        const parsedReference = data?.data?.[0];

                        if (!parsedReference) {
                            return null;
                        }

                        parsedReference.id = keyFormatted;
                        const bibtex = data.format('bibtex');
                        parsedReference['citation-label'] = keyFormatted;
                        dispatch(createReference({ contributionId, bibtex, parsedReference }));
                    } catch (e) {
                        console.log(e);
                    }
                }
                return null;
            });
        }
        dispatch(setUsedReferencesAction({ references: _usedReferences, sectionId: id }));
    }, [text, references, referenceRegex, getReferenceByKey, dispatch, id, formatReferenceKey, fetchedDois, contributionId]);

    const converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        extensions: [footnotes, inlineReferences, showdownVideoPlugin],
        underline: true,
    });
    converter.setFlavor('github');

    return <MarkdownContainer dangerouslySetInnerHTML={{ __html: converter.makeHtml(sanitize(text, { ADD_ATTR: ['target'] })) }} />;
};

MarkdownRenderer.propTypes = {
    text: PropTypes.string,
    id: PropTypes.string,
};

export default MarkdownRenderer;
