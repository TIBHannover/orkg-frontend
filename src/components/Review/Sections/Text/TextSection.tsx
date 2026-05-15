import { FC, useCallback, useContext, useEffect, useMemo } from 'react';

import MarkdownRenderer from '@/components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import { reviewContext } from '@/components/Review/context/ReviewContext';
import useReview from '@/components/Review/hooks/useReview';

/**
 *
 * Markdown renderer, takes care of sanitation to prevent XSS injections
 * and configures the markdown to HTML parser
 */

type TextSectionProps = {
    text: string | null;
    sectionId: string;
};

const TextSection: FC<TextSectionProps> = ({ text = null, sectionId }) => {
    const { parsedReferences } = useReview();
    const { setUsedReferences } = useContext(reviewContext);

    const referenceRegex = useMemo(() => /\[@(.*?)\]/gi, []);

    const formatReferenceKey = useCallback((key: string) => {
        const content = key.slice(0, -1).slice(2); // strip [@ and ]
        const idMatch = content.match(/id="([^"]+)"/);
        return idMatch ? idMatch[1] : content.trim();
    }, []);

    const getReferenceByKey = useCallback(
        (key: string) => {
            // citation-js formats reference keys by formating punctuation and other 'unsafe' characters.
            // copied the code from the repo
            // https://github.com/citation-js/citation-js/blob/7f41e3080ba6b9b57158fd6a8ce3b5110e042a1e/packages/plugin-bibtex/src/mapping/shared.js#L11
            const unsafeChars = /(?:<\/?.*?>|[\u0020-\u002F\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007F])+/g;
            return parsedReferences.find(
                (reference) => reference?.parsedReference?.id === key || reference?.parsedReference?.id === key.toString().replace(unsafeChars, ''),
            );
        },
        [parsedReferences],
    );

    const replaceInlineReferences = useCallback(
        (content: string) =>
            content.replace(referenceRegex, (referenceKey) => {
                const keyFormatted = formatReferenceKey(referenceKey);
                const matchingReference = getReferenceByKey(keyFormatted);
                if (matchingReference) {
                    return `([${matchingReference?.parsedReference?.author?.[0]?.family ?? 'Unknown'}, ${
                        matchingReference?.parsedReference?.issued?.['date-parts']?.[0]?.[0] ?? ''
                    }](#reference${keyFormatted}))`;
                }
                return '<strong>[?]</strong>';
            }),
        [formatReferenceKey, getReferenceByKey, referenceRegex],
    );

    useEffect(() => {
        if (!text) {
            return;
        }
        const _usedReferences: string[] = [];
        const matches = text.match(referenceRegex);

        if (matches && matches.length) {
            matches.map(async (key) => {
                const keyFormatted = formatReferenceKey(key);
                const reference = getReferenceByKey(keyFormatted);

                if (reference?.rawReference) {
                    _usedReferences.push(reference.rawReference);
                }
            });
        }
        setUsedReferences((prev) => ({
            ...prev,
            [sectionId]: _usedReferences,
        }));
    }, [formatReferenceKey, getReferenceByKey, referenceRegex, sectionId, setUsedReferences, text]);

    return <MarkdownRenderer text={replaceInlineReferences(text ?? '')} />;
};

export default TextSection;
