import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import { Card, CardImg, CardColumns } from 'reactstrap';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import styled from 'styled-components';
import { loadFiguresResources } from 'utils';

const CardStyled = styled(Card)`
    cursor: pointer;
    overflow: hidden;
    .blink-figure {
        color: #fff;
        padding: 5px;
        display: inline-block;
        border-radius: 5px;
        animation: blinkingBackground 5s 1;
    }
    @keyframes blinkingBackground {
        0% {
            background-color: #e86161;
        }
    }
`;

const RelatedFigures = props => {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [figures, setFigures] = useState([]);

    const openLightBox = (index = 0) => {
        setIsOpen(!isOpen);
        setPhotoIndex(index);
    };

    useEffect(() => {
        const loadResources = () => {
            if (props.figureStatements.length === 0) {
                return;
            }
            // Fetch the data of each figure
            getStatementsBySubjects({
                ids: props.figureStatements.map(resource => resource.id)
            })
                .then(figuresStatements => {
                    const response = loadFiguresResources(figuresStatements);
                    setFigures(response);
                })
                .catch(err => {
                    console.log(err);
                    setFigures([]);
                });
        };

        loadResources();
    }, [props.figureStatements]);

    if (props.figureStatements.length > 0) {
        return (
            <>
                <h3 className="mt-5 h5">Related figures</h3>{' '}
                <CardColumns>
                    {figures.map((url, index) => (
                        <CardStyled key={`figure${index}`} onClick={() => openLightBox(index)}>
                            <CardImg
                                id={url.id}
                                top
                                width="100%"
                                src={url.src}
                                alt={`figure #${url.id}`}
                                className={props.highlightedFigure === '#' + url.id ? 'blink-figure' : ''}
                            />
                        </CardStyled>
                    ))}
                </CardColumns>
                {isOpen && (
                    <Lightbox
                        mainSrc={figures[photoIndex].src}
                        imageTitle={figures[photoIndex].title}
                        imageCaption={figures[photoIndex].description}
                        nextSrc={figures[(photoIndex + 1) % figures.length].src}
                        prevSrc={figures[(photoIndex + figures.length - 1) % figures.length].src}
                        onCloseRequest={() => setIsOpen(false)}
                        onMovePrevRequest={() => setPhotoIndex((photoIndex + figures.length - 1) % figures.length)}
                        onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % figures.length)}
                        reactModalStyle={{ overlay: { zIndex: 1050 } }}
                    />
                )}
            </>
        );
    }

    return null;
};

RelatedFigures.propTypes = {
    figureStatements: PropTypes.array.isRequired,
    highlightedFigure: PropTypes.string
};

RelatedFigures.defaultProps = {
    figureStatements: []
};

export default RelatedFigures;
