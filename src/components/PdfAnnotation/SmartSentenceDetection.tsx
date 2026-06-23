/* eslint-disable no-console */
import { Spinner, Switch, toast, Tooltip } from '@heroui/react';
import { isString } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setShowHighlights as setShowHighlightsAction, setSummaryFetched as setSummaryFetchedAction } from '@/slices/pdfAnnotationSlice';

// The `@/services/annotation` summarizer service was removed. This stub keeps the
// component compiling (it's not currently mounted anywhere — see Help.tsx for the
// commented-out tour step) until the feature is re-introduced.
const summarizeText = async (..._args: [{ text: string; ratio: number }]): Promise<{ summary: string }> => ({ summary: '' });
import { RootStore } from '@/slices/types';

const ANNOTATION_RATIO = 0.08;
const PROCESSING_SECONDS_PER_PAGE = 10;

type PdfViewerLike = {
    pagesCount: number;
    pdfDocument: { getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> };
    findController: { executeCommand: (cmd: string, args: Record<string, unknown>) => void };
    container?: HTMLElement;
};

type SmartSentenceDetectionProps = {
    pdfViewer?: PdfViewerLike | null;
};

const SmartSentenceDetection = ({ pdfViewer }: SmartSentenceDetectionProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);
    const showHighlights = useSelector((state: RootStore) => state.pdfAnnotation.showHighlights);
    const summaryFetched = useSelector((state: RootStore) => state.pdfAnnotation.summaryFetched);
    const pdf = useSelector((state: RootStore) => state.pdfAnnotation.pdf);
    const dispatch = useDispatch();
    const setShowHighlights = useCallback((show: boolean) => dispatch(setShowHighlightsAction(show)), [dispatch]);

    const selectText = useCallback((beginNode: Node | null, endNode: Node | null) => {
        const sel = window.getSelection();
        const range = document.createRange();
        const endOffset = endNode && endNode.childNodes ? endNode.childNodes.length : 0;

        if (!beginNode || !endNode || !sel) {
            return;
        }
        range.setStart(beginNode, 0);
        range.setEnd(endNode, endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    }, []);

    const getFullSentences = useCallback(() => {
        const highlights = document.getElementsByClassName('highlight');
        const sentences: { begin: Element; middle?: Element[]; end?: Element }[] = [];
        let sentenceIndex = -1;

        for (const highlight of highlights) {
            if (highlight.classList.contains('begin')) {
                sentences.push({ begin: highlight });
                sentenceIndex++;
            } else if (highlight.classList.contains('middle')) {
                if (!sentences[sentenceIndex].middle) {
                    sentences[sentenceIndex].middle = [];
                }
                sentences[sentenceIndex].middle!.push(highlight);
            } else if (highlight.classList.contains('end')) {
                sentences[sentenceIndex].end = highlight;
            }
        }
        return sentences;
    }, []);

    const handleContainerClick = useCallback(
        (e: Event) => {
            const target = e.target as Element | null;
            if (!target?.classList.contains('highlight')) {
                return;
            }
            const sentences = getFullSentences();

            let beginNode: Element | null = null;
            let endNode: Element | null = null;
            for (const sentence of sentences) {
                if (sentence.begin === target || sentence.end === target || (sentence.middle && sentence.middle.includes(target))) {
                    beginNode = sentence.begin;
                    endNode = sentence.end ?? null;

                    if (!endNode) {
                        const lastMiddleItem = sentence.middle && sentence.middle.length > 0 ? sentence.middle.slice(-1)[0] : null;
                        endNode = lastMiddleItem || beginNode;
                    }
                    break;
                }
            }
            selectText(beginNode, endNode);
        },
        [getFullSentences, selectText],
    );

    useEffect(() => {
        if (pdfViewer && pdfViewer.container) {
            pdfViewer.container.removeEventListener('click', handleContainerClick);
            if (showHighlights) {
                pdfViewer.container.addEventListener('click', handleContainerClick);
            }
        }
    }, [pdfViewer, showHighlights, handleContainerClick]);

    useEffect(() => {
        if (summaryFetched || !pdfViewer || isLoading || !pdf) {
            return;
        }

        const tokenizeSentence = (text: string): string[] => {
            try {
                let sentenceSplitterRegex: RegExp;
                try {
                    // prettier-ignore
                    sentenceSplitterRegex = new RegExp("(?<=\\s+|^)[\\\"\\'\\‘\\“\\'\\\"\\[\\(\\{\\⟨](.*?[.?!])(\\s[.?!])*[\\\"\\'\\’\\”\\'\\\"\\]\\)\\}\\⟩](?=\\s+|$)|(?<=\\s+|^)\\S(.*?[.?!])(\\s[.?!])*(?=\\s+|$)", 'g');
                } catch {
                    // eslint-disable-next-line no-useless-escape
                    sentenceSplitterRegex = /([\"\'\‘\“\'\"\[\(\{\⟨][^\.\?\!]+[\.\?\!][\"\'\’\”\'\"\]\)\}\⟩]|[^\.\?\!]+[\.\?\!\s]*)/g;
                }
                const tokens = text.match(sentenceSplitterRegex);
                if (!tokens) return [text];
                return tokens.map((s) => s.trim());
            } catch {
                return [text];
            }
        };

        const setSummaryFetched = (fetched: boolean) => dispatch(setSummaryFetchedAction(fetched));

        const getAllText = () => {
            const maxPages = pdfViewer.pagesCount;
            const countPromises: Promise<string>[] = [];
            for (let j = 1; j <= maxPages; j++) {
                const page = pdfViewer.pdfDocument.getPage(j);
                countPromises.push(
                    page.then((p) => {
                        const textContent = p.getTextContent();
                        return textContent.then((text) => text.items.map((s) => s.str).join(''));
                    }),
                );
            }
            return Promise.all(countPromises).then((texts) => texts.join(''));
        };

        const highlightText = () => {
            setIsLoading(true);
            setShowHighlights(true);
            setFetchFailed(false);

            getAllText()
                .then(async (text) => {
                    const summary = await summarizeText({ text, ratio: ANNOTATION_RATIO });
                    return { summary: summary.summary, fullText: text };
                })
                .then(({ summary, fullText }) => {
                    let summarySentences = tokenizeSentence(summary);

                    if (
                        summarySentences.length > 0 &&
                        isString(summarySentences[0]) &&
                        isString(fullText) &&
                        summarySentences[0].substring(0, 20) === fullText.substring(0, 20)
                    ) {
                        summarySentences.shift();
                    }
                    summarySentences = summarySentences.filter((item) => item.length);

                    pdfViewer.findController.executeCommand('find', {
                        query: summarySentences,
                        caseSensitive: false,
                        highlightAll: true,
                        findPrevious: true,
                        phraseSearch: true,
                    });

                    setSummaryFetched(true);
                    setIsLoading(false);
                    setFetchFailed(false);
                })
                .catch((e) => {
                    toast.danger('Smart sentence detection could not be performed and is therefore disabled');
                    setFetchFailed(true);
                    setSummaryFetched(true);
                    setIsLoading(false);
                    console.log(e);
                });
        };

        highlightText();
    }, [pdfViewer, showHighlights, summaryFetched, isLoading, pdf, setShowHighlights, dispatch]);

    // Toggle the global cursor/background style for `.highlight` elements via a
    // data attribute on the pdf viewer container; rules live in globals.css.
    useEffect(() => {
        const container = pdfViewer?.container;
        if (!container) return;
        // eslint-disable-next-line react-hooks/immutability
        container.dataset.showHighlights = showHighlights ? 'true' : 'false';
    }, [pdfViewer, showHighlights]);

    const estimatedLoadingTime = pdfViewer && pdfViewer.pagesCount ? PROCESSING_SECONDS_PER_PAGE * pdfViewer.pagesCount : PROCESSING_SECONDS_PER_PAGE;

    return (
        <div
            className="relative mb-12 z-[1] overflow-hidden rounded bg-smart text-white px-2.5 py-2.5 flex justify-between items-center"
            id="smart-sentence-detection"
        >
            <div
                aria-hidden
                className="absolute inset-y-0 left-0 -z-[1] rounded-l bg-smart-darker transition-[width]"
                style={{
                    width: isLoading ? '100%' : '0',
                    visibility: isLoading ? 'visible' : 'hidden',
                    transitionDuration: `${estimatedLoadingTime}s`,
                }}
            />
            <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                    <span>Smart sentence detection</span>
                </Tooltip.Trigger>
                <Tooltip.Content className="max-w-[300px]" placement="bottom">
                    Automatically highlight sentences that are potentially useful for annotation
                </Tooltip.Content>
            </Tooltip>
            {!isLoading ? (
                <Switch
                    size="sm"
                    aria-label="Smart sentence detection"
                    isSelected={showHighlights && !fetchFailed}
                    isDisabled={!pdf || fetchFailed}
                    onChange={(checked) => setShowHighlights(checked)}
                >
                    <Switch.Content>
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch.Content>
                </Switch>
            ) : (
                <Spinner size="sm" color="current" />
            )}
        </div>
    );
};

export default SmartSentenceDetection;
