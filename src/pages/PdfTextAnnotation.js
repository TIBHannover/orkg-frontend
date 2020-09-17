import React, { useEffect, useRef, useState } from 'react';
import { PdfLoader, PdfHighlighter, Popup, AreaHighlight } from 'react-pdf-highlighter';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Sidebar from 'components/PdfTextAnnotation/SideBar';
import AnnotationTooltipNew from 'components/PdfTextAnnotation/AnnotationTooltipNew';
import AnnotationTooltipExisting from 'components/PdfTextAnnotation/AnnotationTooltipExisting';
import { useDispatch, useSelector } from 'react-redux';
import { createAnnotation } from 'actions/pdfTextAnnotation';
import Highlight from 'components/PdfTextAnnotation/Highlight';
import useDeleteAnnotation from 'components/PdfTextAnnotation/hooks/useDeleteAnnotation';
import DragUpload from 'components/PdfTextAnnotation/DragUpload';
import ZoomBar from 'components/PdfTextAnnotation/ZoomBar';
import { submitPostRequest } from 'network';
import { SentenceTokenizer } from 'natural';

const Wrapper = styled.div`
    margin-top: -30px;
    margin-bottom: -80px;
    display: flex;
`;

const Main = styled.div`
    height: calc(100vh - 73px);
    width: calc(100% - 380px);
    position: relative;
`;

const PdfTextAnnotation = props => {
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const encodedPdf = useSelector(state => state.pdfTextAnnotation.encodedPdf);
    const zoom = useSelector(state => state.pdfTextAnnotation.zoom);
    const dispatch = useDispatch();
    const PdfHighlighterRef = useRef();
    const [summaryFetched, setSummaryFetched] = useState(false);
    const { deleteAnnotation } = useDeleteAnnotation();

    const handleAnnotate = ({ content, position, type }) => {
        dispatch(createAnnotation({ content, position, type }));
    };

    const parseIdFromHash = () => document.location.hash.slice('#annotation-'.length);

    const resetHash = () => {
        document.location.hash = '';
    };

    const getAllText = pdfUrl => {
        const maxPages = window.PdfViewer.viewer.pagesCount;
        const countPromises = []; // collecting all page promises
        for (let j = 1; j <= maxPages; j++) {
            const page = window.PdfViewer.viewer.pdfDocument.getPage(j);

            countPromises.push(
                page.then(function(page) {
                    // add page promise
                    const textContent = page.getTextContent();
                    return textContent.then(function(text) {
                        // return content promise
                        return text.items
                            .map(function(s) {
                                return s.str;
                            })
                            .join(''); // value page text
                    });
                })
            );
        }
        // Wait for all pages and join text
        return Promise.all(countPromises).then(function(texts) {
            return texts.join('');
        });
    };

    const highlightSummary = () => {
        //console.log('window.PdfViewer', window.PdfViewer);
        if (summaryFetched) {
            return;
        }

        console.log('set listener');
        window.addEventListener(
            'updatetextlayermatches',
            () => {
                console.log('FIND IT!!!');
            },
            false
        );

        getAllText().then(async text => {
            const summary = await submitPostRequest(
                'http://localhost:5001/summarize?ratio=0.08',
                {
                    'Content-Type': 'text/plain'
                },
                text,
                false
            );

            const tokenizer = new SentenceTokenizer();
            const summarySentences = tokenizer.tokenize(summary.summary);

            window.PdfViewer.findController.executeCommand('find', {
                query: summarySentences,
                caseSensitive: false,
                highlightAll: true,
                findPrevious: true,
                phraseSearch: true
            });

            console.log(' window.PdfViewer.findController', window.PdfViewer.findController);
            setTimeout(() => {
                const anchors = document.getElementsByClassName('highlight');
                console.log(anchors);
                for (let j = 0; j < anchors.length; j++) {
                    const anchor = anchors[j];
                    anchor.onclick = function(e) {
                        function selectElementContents(el) {
                            if (window.getSelection && document.createRange) {
                                const sel = window.getSelection();
                                const range = document.createRange();
                                range.selectNodeContents(el);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            } else if (document.selection && document.body.createTextRange) {
                                const textRange = document.body.createTextRange();
                                textRange.moveToElementText(el);
                                textRange.select();
                            }
                        }
                        console.log('click highlight', e);
                        //selectElementContents(e.target);
                        console.log(e.target.closest('span .begin'));

                        const anchors = document.getElementsByClassName('highlight');
                        const sentences = [];
                        let sentenceIndex = 0;
                        for (let j = 0; j < anchors.length; j++) {
                            const element = anchors[j];
                            if (element.classList.contains('begin')) {
                                sentences.push({
                                    begin: element
                                });
                            }
                            if (element.classList.contains('middle')) {
                                if (!sentences[sentenceIndex].middle) {
                                    sentences[sentenceIndex].middle = [];
                                }
                                sentences[sentenceIndex].middle.push(element);
                            }
                            if (element.classList.contains('end')) {
                                sentences[sentenceIndex].end = element;
                                sentenceIndex++;
                            }
                        }
                        console.log('sentences', sentences);
                        let beginNode = null;
                        let endNode = null;
                        for (const sentence of sentences) {
                            console.log('sentence', sentence);
                            console.log('sentence.begin', sentence.begin);
                            if (sentence.begin === e.target || sentence.end === e.target || (sentence.middle && sentence.middle.includes(e.target))) {
                                beginNode = sentence.begin;
                                endNode = sentence.end;
                            }
                        }
                        console.log('beginNode', beginNode);
                        console.log('endNode', endNode);

                        const sel = window.getSelection();
                        const range = document.createRange();
                        range.setStart(beginNode, 0);
                        const endOffset = endNode.childNodes.length;
                        range.setEnd(endNode, endOffset);
                        //range.selectNodeContents(el);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    };
                }
            }, 5000);
            setSummaryFetched(true);
        });
        //console.log('GET TEXT', window.PdfViewer.viewer.pagesCount, window.PdfViewer);
        /*const find = window.PdfViewer.findController
            .executeCommand('find', {
                query: ''
            })
            .then(() => {
                console.log('THEN WORKDS!!!!!!!!!!');
            });*/

        /*
        let text = '';
        for (let i = 0; i < window.PdfViewer.viewer.pagesCount; i++) {
            //console.log('window.PdfViewer.viewer.getPageView(i).textLayer', window.PdfViewer.viewer.getPageView(i).textLayer);
            const textLayer = window.PdfViewer.viewer.getPageView(i).textLayer;
            console.log('textLayer', textLayer);
            if (textLayer && textLayer.textContentItemsStr) {
                //console.log('get for page: ', i);
                for (let item of textLayer.textContentItemsStr) text += item;

                if (window.PdfViewer.viewer.pagesCount === i + 1) {
                    const tokenizer = new SentenceTokenizer();
                    console.log('now you got it all');
                    const summary = await submitPostRequest(
                        'http://localhost:5001/summarize?ratio=0.08',
                        {
                            'Content-Type': 'text/plain'
                        },
                        text,
                        false
                    );
                    console.log('summary', summary.summary);
                    const summarySentences = tokenizer.tokenize(summary.summary);
                    console.log('summary tokenizer', summarySentences);

                    const find = window.PdfViewer.findController.executeCommand('find', {
                        query: summarySentences,
                        caseSensitive: false,
                        highlightAll: true,
                        findPrevious: true,
                        phraseSearch: true
                    });
                    console.log(' window.PdfViewer.findController', window.PdfViewer.findController);
                    setTimeout(() => {
                        const anchors = document.getElementsByClassName('highlight');
                        console.log(anchors);
                        for (let j = 0; j < anchors.length; j++) {
                            const anchor = anchors[j];
                            anchor.onclick = function(e) {
                                function selectElementContents(el) {
                                    if (window.getSelection && document.createRange) {
                                        var sel = window.getSelection();
                                        var range = document.createRange();
                                        range.selectNodeContents(el);
                                        sel.removeAllRanges();
                                        sel.addRange(range);
                                    } else if (document.selection && document.body.createTextRange) {
                                        var textRange = document.body.createTextRange();
                                        textRange.moveToElementText(el);
                                        textRange.select();
                                    }
                                }
                                console.log('click highlight', e);
                                //selectElementContents(e.target);
                                console.log(e.target.closest('span .begin'));

                                const anchors = document.getElementsByClassName('highlight');
                                let sentences = [];
                                let sentenceIndex = 0;
                                for (let j = 0; j < anchors.length; j++) {
                                    const element = anchors[j];
                                    if (element.classList.contains('begin')) {
                                        sentences.push({
                                            begin: element
                                        });
                                    }
                                    if (element.classList.contains('middle')) {
                                        if (!sentences[sentenceIndex].middle) {
                                            sentences[sentenceIndex].middle = [];
                                        }
                                        sentences[sentenceIndex].middle.push(element);
                                    }
                                    if (element.classList.contains('end')) {
                                        sentences[sentenceIndex].end = element;
                                        sentenceIndex++;
                                    }
                                }
                                console.log('sentences', sentences);
                                let beginNode = null;
                                let endNode = null;
                                for (let sentence of sentences) {
                                    console.log('sentence', sentence);
                                    console.log('sentence.begin', sentence.begin);
                                    if (
                                        sentence.begin === e.target ||
                                        sentence.end === e.target ||
                                        (sentence.middle && sentence.middle.includes(e.target))
                                    ) {
                                        beginNode = sentence.begin;
                                        endNode = sentence.end;
                                    }
                                }
                                console.log('beginNode', beginNode);
                                console.log('endNode', endNode);

                                let sel = window.getSelection();
                                let range = document.createRange();
                                range.setStart(beginNode, 0);
                                const endOffset = endNode.childNodes.length;
                                range.setEnd(endNode, endOffset);
                                //range.selectNodeContents(el);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            };
                        }
                    }, 5000);
                    setSummaryFetched(true);
                }
            }
        }*/
    };

    useEffect(() => {
        const scrollToHighlightFromHash = () => {
            const id = parseIdFromHash();
            const highlight = annotations.find(annotation => annotation.id === id);

            if (highlight) {
                PdfHighlighterRef.current.scrollTo(highlight);
            }
        };

        window.addEventListener('hashchange', scrollToHighlightFromHash, false);

        return () => {
            window.removeEventListener('hashchange', scrollToHighlightFromHash);
        };
    });

    return (
        <Wrapper>
            <Sidebar />
            {encodedPdf && <ZoomBar />}

            <Main>
                {encodedPdf ? (
                    <PdfLoader url={encodedPdf} beforeLoad={<Icon icon={faSpinner} />}>
                        {pdfDocument => {
                            console.log('pdfDocument', pdfDocument);
                            document.addEventListener('textlayerrendered', async () => {
                                console.log('DONE0');
                                /*let fullText = '';
                                console.log('text', window.PdfViewer.viewer.getPageView(0).textLayer);
                                for (const page of window.PdfViewer.viewer._pages) {
                                    console.log('page', page);
                                    console.log('page', page.textLayer);
                                    console.log('id', page.id);
                                    //fullText.push(page.textLayer.textContentItemsStr);
                                }*/
                                console.log('window.PdfViewer', window.PdfViewer);
                                window.PdfViewer.findController.executeCommand('find', {
                                    query: 'Instead,  current  systems  focus',
                                    caseSensitive: false,
                                    highlightAll: true,
                                    findPrevious: true,
                                    phraseSearch: true
                                });
                                /*window.PdfViewer.findController.executeCommand('find', {
                                    query: 'This  paper  examines  current',
                                    caseSensitive: false,
                                    highlightAll: true,
                                    findPrevious: true,
                                    phraseSearch: true
                                });*/
                                let text = '';

                                for (let i = 0; i < window.PdfViewer.viewer.pagesCount; i++) {
                                    //console.log('window.PdfViewer.viewer.getPageView(i).textLayer', window.PdfViewer.viewer.getPageView(i).textLayer);
                                    const textLayer = window.PdfViewer.viewer.getPageView(i).textLayer;
                                    //console.log('textLayer', textLayer);
                                    if (textLayer && textLayer.textContentItemsStr) {
                                        //console.log('get for page: ', i);
                                        for (const item of textLayer.textContentItemsStr) {
                                            text += item;
                                        }

                                        if (window.PdfViewer.viewer.pagesCount === i + 1) {
                                            const tokenizer = new SentenceTokenizer();
                                            console.log('now you got it all');
                                            const summary = await submitPostRequest(
                                                'http://localhost:5001/summarize?ratio=0.05',
                                                {
                                                    'Content-Type': 'text/plain'
                                                },
                                                text,
                                                false
                                            );
                                            console.log('summary', summary.summary);
                                            console.log('summary tokenizer', tokenizer.tokenize(summary.summary));

                                            window.PdfViewer.findController.executeCommand('find', {
                                                query: 'Instead,  current  systems  focus',
                                                caseSensitive: false,
                                                highlightAll: true,
                                                findPrevious: true,
                                                phraseSearch: true
                                            });
                                        }
                                    }
                                }
                                //console.log(text);
                                //console.log('fullText', fullText);
                            });
                            return (
                                <PdfHighlighter
                                    pdfDocument={pdfDocument}
                                    enableAreaSelection={event => event.altKey}
                                    onScrollChange={resetHash}
                                    scrollRef={() => {}} // if this is not present, the component will break
                                    ref={PdfHighlighterRef}
                                    onDocumentReady={() => {
                                        console.log('READY');
                                        //highlightSummary();
                                    }}
                                    onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
                                        <AnnotationTooltipNew
                                            position={position}
                                            content={content}
                                            hideTipAndSelection={hideTipAndSelection}
                                            transformSelection={transformSelection}
                                            handleAnnotate={handleAnnotate}
                                        />
                                    )}
                                    zoom={zoom}
                                    highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                                        const isTextHighlight = !Boolean(highlight.content && highlight.content.image);
                                        highlightSummary();

                                        const component = isTextHighlight ? (
                                            <Highlight isScrolledTo={isScrolledTo} position={highlight.position} type={highlight.type} />
                                        ) : (
                                            <AreaHighlight
                                                highlight={highlight}
                                                onChange={boundingRect => {
                                                    this.updateHighlight(
                                                        highlight.id,
                                                        { boundingRect: viewportToScaled(boundingRect) },
                                                        { image: screenshot(boundingRect) }
                                                    );
                                                }}
                                            />
                                        );

                                        return (
                                            <Popup
                                                popupContent={<AnnotationTooltipExisting {...highlight} deleteAnnotation={deleteAnnotation} />}
                                                onMouseOver={popupContent => setTip(highlight, highlight => popupContent)}
                                                onMouseOut={hideTip}
                                                key={index}
                                                children={component}
                                            />
                                        );
                                    }}
                                    highlights={annotations}
                                />
                            );
                        }}
                    </PdfLoader>
                ) : (
                    <DragUpload />
                )}
            </Main>
        </Wrapper>
    );
};

export default PdfTextAnnotation;
