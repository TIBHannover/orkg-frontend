'use client';

import 'react-pdf-highlighter/dist/style.css';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef } from 'react';
import { Content, IHighlight, LTWH, LTWHP, Position, Scaled, ScaledPosition } from 'react-pdf-highlighter';
import { useDispatch, useSelector } from 'react-redux';

import AnnotationTooltipExisting from '@/components/PdfAnnotation/AnnotationTooltipExisting';
import AnnotationTooltipNew from '@/components/PdfAnnotation/AnnotationTooltipNew';
import { CustomAreaHighlight } from '@/components/PdfAnnotation/CustomAreaHighlight';
import DragUpload from '@/components/PdfAnnotation/DragUpload';
import Highlight from '@/components/PdfAnnotation/Highlight';
import useDeleteAnnotation from '@/components/PdfAnnotation/hooks/useDeleteAnnotation';
import requireAuthentication from '@/requireAuthentication';
import { createAnnotation, setIsLoadedPdfViewer } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

const PdfHighlighter = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.PdfHighlighter), { ssr: false });
const PdfLoader = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.PdfLoader), { ssr: false });
const Popup = dynamic(() => import('react-pdf-highlighter').then((mod) => mod.Popup), { ssr: false });
const Sidebar = dynamic(() => import('@/components/PdfAnnotation/SideBar').then((mod) => mod.default), { ssr: false });

const PdfAnnotation = () => {
    const annotations = useSelector((state: RootStore) => state.pdfAnnotation.annotations);
    const pdf = useSelector((state: RootStore) => state.pdfAnnotation.pdf);
    const scale = useSelector((state: RootStore) => state.pdfAnnotation.scale);
    const { deleteAnnotation } = useDeleteAnnotation();
    const dispatch = useDispatch();
    const PdfHighlighterRef = useRef<{
        scrollTo: (highlight: IHighlight) => void;
        scaledPositionToViewport?: (position: ScaledPosition) => Position;
    }>({ scrollTo: () => {} });

    const handleAnnotate = ({
        content,
        position,
        type,
        view,
    }: {
        content: Content;
        position: ScaledPosition;
        type: string;
        view?: 'extraction' | 'validation';
    }) => {
        const isHighlightImage = content.image;
        dispatch(createAnnotation({ content, position, type, ...(isHighlightImage ? { isExtractionModalOpen: true, view } : {}) }));
    };

    const parseIdFromHash = () => document?.location?.hash?.slice('#annotation-'.length) ?? null;

    const resetHash = () => {
        if (!document?.location?.hash) {
            return;
        }
        document.location.hash = '';
    };

    const handleSelectionFinished = (position: ScaledPosition, content: Content, hideTipAndSelection: () => void, transformSelection: () => void) => {
        return (
            <AnnotationTooltipNew
                position={position}
                content={content}
                hideTipAndSelection={hideTipAndSelection}
                transformSelection={transformSelection}
                handleAnnotate={handleAnnotate}
            />
        );
    };

    const handleHighlightTransform = (
        highlight: IHighlight & { position: Position } & { type?: string | null },
        index: number,
        setTip: (
            vpHighlightArg: IHighlight & { position: Position } & { type?: string | null },
            callback: (vh: IHighlight & { position: Position } & { type?: string | null }) => React.ReactElement,
        ) => void,
        hideTip: () => void,
        viewportToScaled: (rect: LTWHP) => Scaled,
        screenshot: (rect: LTWH) => string,
        isScrolledTo: boolean,
    ) => {
        const isTextHighlight = !highlight.content?.image;

        const component = isTextHighlight ? (
            <Highlight isScrolledTo={isScrolledTo} position={highlight.position} type={highlight.type ?? null} />
        ) : (
            <CustomAreaHighlight highlight={highlight} />
        );

        return (
            <Popup
                key={index}
                popupContent={<AnnotationTooltipExisting id={highlight.id ?? ''} type={highlight.type ?? ''} deleteAnnotation={deleteAnnotation} />}
                onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
                onMouseOut={hideTip}
            >
                {component}
            </Popup>
        );
    };

    const scrollToHighlightFromHash = useCallback(() => {
        const id = parseIdFromHash();
        const highlight = annotations.find((annotation) => annotation.id === id);

        if (highlight) {
            PdfHighlighterRef.current.scrollTo(highlight);
        }
    }, [annotations]);

    useEffect(() => {
        window.addEventListener('hashchange', scrollToHighlightFromHash, false);
        return () => {
            window.removeEventListener('hashchange', scrollToHighlightFromHash);
        };
    }, [scrollToHighlightFromHash]);

    return (
        <div className="-mt-[30px] -mb-20 flex">
            <Sidebar />
            <div className="h-[calc(100vh-73px)] w-[calc(100%-380px)] relative overflow-y-auto">
                {!pdf && <DragUpload pdf={pdf} />}
                {pdf && (
                    // @ts-expect-error - PdfLoader types are not compatible with Next.js dynamic imports
                    <PdfLoader url={pdf} beforeLoad={<FontAwesomeIcon icon={faSpinner} />}>
                        {(pdfDocument) => (
                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                pdfScaleValue={scale.toString()}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                scrollRef={(scrollTo: (highlight: IHighlight) => void) => {
                                    PdfHighlighterRef.current = { scrollTo };
                                    scrollToHighlightFromHash();
                                    dispatch(setIsLoadedPdfViewer(true));
                                }}
                                onSelectionFinished={handleSelectionFinished}
                                highlightTransform={handleHighlightTransform}
                                highlights={annotations}
                            />
                        )}
                    </PdfLoader>
                )}
            </div>
        </div>
    );
};

export default requireAuthentication(PdfAnnotation);
