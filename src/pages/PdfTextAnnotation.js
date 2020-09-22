import React, { useEffect, useRef } from 'react';
import { PdfLoader, PdfHighlighter, Popup, AreaHighlight } from 'react-pdf-highlighter';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Sidebar from 'components/PdfTextAnnotation/SideBar';
import AnnotationTooltipNew from 'components/PdfTextAnnotation/AnnotationTooltipNew';
import AnnotationTooltipExisting from 'components/PdfTextAnnotation/AnnotationTooltipExisting';
import { useDispatch, useSelector } from 'react-redux';
import { createAnnotation, setPdfViewer as setPdfViewerAction } from 'actions/pdfTextAnnotation';
import Highlight from 'components/PdfTextAnnotation/Highlight';
import useDeleteAnnotation from 'components/PdfTextAnnotation/hooks/useDeleteAnnotation';
import DragUpload from 'components/PdfTextAnnotation/DragUpload';
import ZoomBar from 'components/PdfTextAnnotation/ZoomBar';

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
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const encodedPdf = useSelector(state => state.pdfTextAnnotation.encodedPdf);
    const pdfViewer = useSelector(state => state.pdfTextAnnotation.pdfViewer);
    const zoom = useSelector(state => state.pdfTextAnnotation.zoom);
    const { deleteAnnotation } = useDeleteAnnotation();
    const dispatch = useDispatch();
    const PdfHighlighterRef = useRef();

    const setPdfViewer = _pdfViewer => dispatch(setPdfViewerAction(_pdfViewer));

    const handleAnnotate = ({ content, position, type }) => {
        dispatch(createAnnotation({ content, position, type }));
    };

    const parseIdFromHash = () => document.location.hash.slice('#annotation-'.length);

    const resetHash = () => {
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
        const isTextHighlight = !Boolean(highlight.content && highlight.content.image);

        const component = isTextHighlight ? (
            <Highlight isScrolledTo={isScrolledTo} position={highlight.position} type={highlight.type} />
        ) : (
            <AreaHighlight
                highlight={highlight}
                onChange={boundingRect => {
                    this.updateHighlight(highlight.id, { boundingRect: viewportToScaled(boundingRect) }, { image: screenshot(boundingRect) });
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
            <Sidebar pdfViewer={pdfViewer} />
            {encodedPdf && <ZoomBar />}

            <Main>
                {encodedPdf ? (
                    <PdfLoader url={encodedPdf} beforeLoad={<Icon icon={faSpinner} />}>
                        {pdfDocument => (
                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                enableAreaSelection={event => event.altKey}
                                onScrollChange={resetHash}
                                scrollRef={() => {}} // if this is not present, the component will break
                                ref={PdfHighlighterRef}
                                onDocumentReady={_pdfViewer => {
                                    setPdfViewer(_pdfViewer);
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
