'use client';

import 'react-pdf-highlighter/dist/style.css';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import AnnotationTooltipExisting from '@/components/PdfTextAnnotation/AnnotationTooltipExisting';
import AnnotationTooltipNew from '@/components/PdfTextAnnotation/AnnotationTooltipNew';
import DragUpload from '@/components/PdfTextAnnotation/DragUpload';
import Highlight from '@/components/PdfTextAnnotation/Highlight';
import useDeleteAnnotation from '@/components/PdfTextAnnotation/hooks/useDeleteAnnotation';
import Sidebar from '@/components/PdfTextAnnotation/SideBar';
import { createAnnotation, setIsLoadedPdfViewer } from '@/slices/pdfTextAnnotationSlice';

const PdfHighlighter = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.PdfHighlighter), { ssr: false });
const PdfLoader = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.PdfLoader), { ssr: false });
const AreaHighlight = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.AreaHighlight), { ssr: false });
const Popup = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.Popup), { ssr: false });

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

const PdfTextAnnotation = () => {
    const [pdfViewer, setPdfViewer] = useState(null); // TODO: the state contains data that might be changed by the browser, change this mechanism
    const annotations = useSelector((state) => state.pdfTextAnnotation.annotations);
    const pdf = useSelector((state) => state.pdfTextAnnotation.pdf);
    const zoom = useSelector((state) => state.pdfTextAnnotation.zoom);
    const { deleteAnnotation } = useDeleteAnnotation();
    const dispatch = useDispatch();
    const PdfHighlighterRef = useRef();

    const handleAnnotate = ({ content, position, type }) => {
        dispatch(createAnnotation({ content, position, type }));
    };

    const parseIdFromHash = () => document?.location?.hash?.slice('#annotation-'.length) ?? null;

    const resetHash = () => {
        if (!document?.location?.hash) {
            return;
        }
        document.location.hash = '';
    };

    const handleSelectionFinished = (position, content, hideTipAndSelection, transformSelection) => (
        <AnnotationTooltipNew
            position={position}
            content={content}
            hideTipAndSelection={hideTipAndSelection}
            transformSelection={transformSelection}
            handleAnnotate={handleAnnotate}
        />
    );

    const handleHighlightTransform = (highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
        const isTextHighlight = !(highlight.content && highlight.content.image);

        const component = isTextHighlight ? (
            <Highlight isScrolledTo={isScrolledTo} position={highlight.position} type={highlight.type} />
        ) : (
            <AreaHighlight
                highlight={highlight}
                onChange={(boundingRect) => {
                    this.updateHighlight(highlight.id, { boundingRect: viewportToScaled(boundingRect) }, { image: screenshot(boundingRect) });
                }}
            />
        );

        return (
            // the package doesn't support the onBlur and onFocus events, so disable this rule
            // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
            <Popup
                popupContent={<AnnotationTooltipExisting {...highlight} deleteAnnotation={deleteAnnotation} />}
                onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                onMouseOut={hideTip}
                key={index}
            >
                {component}
            </Popup>
        );
    };

    useEffect(() => {
        const scrollToHighlightFromHash = () => {
            const id = parseIdFromHash();
            const highlight = annotations.find((annotation) => annotation.id === id);

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
            <Sidebar pdfViewer={pdfViewer} />
            {/* pdf && <ZoomBar /> */}

            <Main>
                {pdf ? (
                    <PdfLoader url={pdf} beforeLoad={<FontAwesomeIcon icon={faSpinner} />}>
                        {(pdfDocument) => (
                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                scrollRef={() => {}} // if this is not present, the component will break
                                ref={PdfHighlighterRef}
                                onDocumentReady={(_pdfViewer) => {
                                    setPdfViewer(_pdfViewer);
                                    dispatch(setIsLoadedPdfViewer(true));
                                }}
                                onSelectionFinished={handleSelectionFinished}
                                zoom={zoom}
                                highlightTransform={handleHighlightTransform}
                                highlights={annotations}
                            />
                        )}
                    </PdfLoader>
                ) : (
                    <DragUpload />
                )}
            </Main>
        </Wrapper>
    );
};

export default PdfTextAnnotation;
