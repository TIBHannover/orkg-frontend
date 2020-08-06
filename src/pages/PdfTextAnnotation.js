import React, { useEffect, useRef } from 'react';
import { Button, Container, Input } from 'reactstrap';
import { PdfLoader, PdfHighlighter, Tip, Popup, AreaHighlight } from 'react-pdf-highlighter';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Sidebar from 'components/PdfTextAnnotation/SideBar';
import AnnotationTooltip from 'components/PdfTextAnnotation/AnnotationTooltip';
import { useDispatch, useSelector } from 'react-redux';
import { createAnnotation } from 'actions/pdfTextAnnotation';
import Highlight from 'components/PdfTextAnnotation/Highlight';

const HighlightPopup = ({ comment }) => null;
/*
    comment.text ? (
        <div className="Highlight__popup">
            {comment.emoji} {comment.text}
        </div>
    ) : null;*/

const Wrapper = styled.div`
    margin-top: -30px;
    margin-bottom: -80px;
    display: flex;
`;

const PdfTextAnnotation = props => {
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const dispatch = useDispatch();
    const PdfHighlighterRef = useRef();

    const handleAnnotate = ({ content, position, type }) => {
        dispatch(createAnnotation({ content, position, type }));
    };

    const parseIdFromHash = () => document.location.hash.slice('#annotation-'.length);

    const resetHash = () => {
        document.location.hash = '';
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
            <div
                style={{
                    height: 'calc(100vh - 73px)',
                    width: 'calc(100% - 380px)',
                    //overflowY: 'scroll',
                    position: 'relative'
                }}
            >
                <PdfLoader url="https://arxiv.org/pdf/1901.10816.pdf" beforeLoad={<Icon icon={faSpinner} />}>
                    {pdfDocument => (
                        <PdfHighlighter
                            pdfDocument={pdfDocument}
                            enableAreaSelection={event => event.altKey}
                            onScrollChange={resetHash}
                            scrollRef={() => {}} // if this is not present, the component will break
                            ref={PdfHighlighterRef}
                            onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
                                <AnnotationTooltip
                                    position={position}
                                    content={content}
                                    hideTipAndSelection={hideTipAndSelection}
                                    transformSelection={transformSelection}
                                    handleAnnotate={handleAnnotate}
                                />
                            )}
                            highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                                const isTextHighlight = !Boolean(highlight.content && highlight.content.image);

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
                                        popupContent={<HighlightPopup {...highlight} />}
                                        onMouseOver={popupContent => setTip(highlight, highlight => popupContent)}
                                        onMouseOut={hideTip}
                                        key={index}
                                        children={component}
                                    />
                                );
                            }}
                            highlights={annotations}
                        />
                    )}
                </PdfLoader>
            </div>
        </Wrapper>
    );
};

export default PdfTextAnnotation;
