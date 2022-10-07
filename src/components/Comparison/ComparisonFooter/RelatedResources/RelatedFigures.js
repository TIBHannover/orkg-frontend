import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { Card, CardImg, CardColumns } from 'reactstrap';
import { useSelector } from 'react-redux';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import styled, { createGlobalStyle } from 'styled-components';
import { isString } from 'lodash';
import { getRelatedFiguresData } from 'utils';
import { useLocation } from 'react-router-dom';

const CardStyled = styled(Card)`
    cursor: pointer;
    overflow: hidden;
    .blink-figure {
        color: #fff;
        padding: 5px;
        display: inline-block;
        border-radius: 5px;
        animation: blinkingBackground 5s infinite;
    }
    @keyframes blinkingBackground {
        from {
            background-color: #e86161;
        }
        50% {
            background-color: #fff;
        }
        to {
            background-color: #e86161;
        }
    }
`;

const GlobalStyle = createGlobalStyle`
    .ril__image.ril-image-current:not(.ril-not-loaded) {
        background: #fff;
    }
`;

const RelatedFigures = () => {
    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const figures = useSelector(state => state.comparison.comparisonResource.figures);

    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [relatedFigures, setRelatedFigures] = useState([]);
    const location = useLocation();

    const openLightBox = (index = 0) => {
        setIsOpen(!isOpen);
        setPhotoIndex(index);
    };

    useEffect(() => {
        const loadFigures = () => {
            if (figures.length === 0) {
                return;
            }
            // Fetch the data of each figure
            getStatementsBySubjects({
                ids: figures.map(r => r.id),
            })
                .then(figuresStatements => {
                    setRelatedFigures(getRelatedFiguresData(figuresStatements));
                })
                .catch(() => {
                    setRelatedFigures([]);
                });
        };

        loadFigures();
    }, [figures]);

    const scrollTo = useCallback(
        header => {
            const { hash } = location;
            const id = isString(hash) ? hash.replace('#', '') : null;
            if (!header || header.id !== id) {
                return;
            }
            window.scrollTo({
                behavior: 'smooth',
                top: header.offsetTop - 90,
            });
        },
        [location.hash],
    );

    if (!isLoadingMetadata && !isFailedLoadingMetadata && figures?.length > 0) {
        return (
            <>
                <GlobalStyle />
                <h5 className="mt-5">Related figures</h5>
                <CardColumns className="d-flex row">
                    {relatedFigures.map((figure, index) => (
                        <div className="col-sm-3" key={`figure${figure.figureId}`} ref={scrollTo} id={figure.figureId}>
                            <CardStyled onClick={() => openLightBox(index)}>
                                <CardImg
                                    id={figure.figureId}
                                    top
                                    width="100%"
                                    src={figure.src}
                                    alt={`figure #${figure.figureId}`}
                                    className={location.hash === `#${figure.figureId}` ? 'blink-figure' : ''}
                                />
                            </CardStyled>
                        </div>
                    ))}
                </CardColumns>
                {isOpen && (
                    <Lightbox
                        mainSrc={relatedFigures[photoIndex].src}
                        imageTitle={relatedFigures[photoIndex].title}
                        imageCaption={relatedFigures[photoIndex].description}
                        nextSrc={relatedFigures[(photoIndex + 1) % relatedFigures.length].src}
                        prevSrc={relatedFigures[(photoIndex + relatedFigures.length - 1) % relatedFigures.length].src}
                        onCloseRequest={() => setIsOpen(false)}
                        onMovePrevRequest={() => setPhotoIndex((photoIndex + relatedFigures.length - 1) % relatedFigures.length)}
                        onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % relatedFigures.length)}
                        reactModalStyle={{ overlay: { zIndex: 1050 } }}
                    />
                )}
            </>
        );
    }

    return null;
};

export default RelatedFigures;
