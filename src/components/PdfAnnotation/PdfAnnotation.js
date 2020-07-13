import React, { useState } from 'react';
import Toolbar from './Toolbar';
import TableSelect from './TableSelect';
import styled from 'styled-components';
import DragUpload from './DragUpload';
import { useSelector } from 'react-redux';

const PdfContainer = styled.div`
    display: flex;
    justify-content: center;
    max-height: 0;
`;

const ZoomContainer = styled.div`
    transform-origin: center top;
    transition: 0.2s;
`;

const PdfAnnotation = () => {
    const DEFAULT_PAGE_WIDTH = 968;
    const [zoom, setZoom] = useState(1);
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const pages = useSelector(state => state.pdfAnnotation.pages);
    const styles = useSelector(state => state.pdfAnnotation.styles);

    const handleZoomChange = zoom => {
        if (zoom) {
            const maxZoom = getFullPageScale();

            if (zoom > maxZoom) {
                zoom = maxZoom;
            } else if (zoom < 0) {
                zoom = 0.1;
            }

            setZoom(zoom);

            /* Could be helpful for zooming beyond full width
            () => {
                const container = this.pdfContainer.current;
                const difference = container.scrollWidth - container.clientWidth;
                console.log(difference);
            } */
        } else {
            setZoom(getFullPageScale());
        }
    };

    const getFullPageScale = () => {
        return window.innerWidth / (DEFAULT_PAGE_WIDTH + 20);
    };

    const zoomContainerStyle = { transform: 'scale(' + zoom + ')' };

    return (
        <div style={{ paddingTop: 20 }}>
            <Toolbar changeZoom={handleZoomChange} zoom={zoom} />

            {pages && (
                <PdfContainer>
                    <ZoomContainer style={zoomContainerStyle} id="zoom-container">
                        {pages.map((page, index) => (
                            <div style={{ position: 'relative' }} key={index}>
                                <TableSelect pageNumber={index + 1} pdf={pdf}>
                                    <div dangerouslySetInnerHTML={{ __html: page }} />
                                </TableSelect>
                            </div>
                        ))}
                    </ZoomContainer>

                    {styles.map((style, index) => (
                        <div dangerouslySetInnerHTML={{ __html: style }} key={index} />
                    ))}
                </PdfContainer>
            )}

            <DragUpload />
        </div>
    );
};

export default PdfAnnotation;
