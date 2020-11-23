import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import { Card, CardImg, CardColumns } from 'reactstrap';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { find, isString } from 'lodash';
import styled from 'styled-components';
import { PREDICATES } from 'constants/graphSettings';
import { useLocation } from 'react-router';

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

const RelatedFigures = props => {
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [figures, setFigures] = useState([]);
    const location = useLocation();

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
                    const _figures = figuresStatements.map(figureStatements => {
                        const figureTitle = find(props.figureStatements, { id: figureStatements.id });
                        const imageStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
                        const descriptionStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);
                        return {
                            src: imageStatement ? imageStatement.object.label : '',
                            title: figureTitle.label,
                            description: descriptionStatement ? descriptionStatement.object.label : '',
                            id: figureStatements.id
                        };
                    });
                    setFigures(_figures);
                })
                .catch(err => {
                    console.log(err);
                    setFigures([]);
                });
        };

        loadResources();
    }, [props.figureStatements]);

    const scrollTo = useCallback(
        header => {
            const hash = location.hash;
            const id = isString(hash) ? hash.replace('#', '') : null;
            if (!header || header.id !== id) {
                return;
            }
            window.scrollTo({
                behavior: 'smooth',
                top: header.offsetTop - 90
            });
        },
        [location.hash]
    );

    if (props.figureStatements.length > 0) {
        return (
            <>
                <h3 className="mt-5 h5">Related figures</h3>{' '}
                <CardColumns>
                    {figures.map((url, index) => (
                        <span key={`figure${index}`} ref={scrollTo} id={url.id}>
                            <CardStyled onClick={() => openLightBox(index)}>
                                <CardImg
                                    id={url.id}
                                    top
                                    width="100%"
                                    src={url.src}
                                    alt={`figure #${url.id}`}
                                    className={location.hash === '#' + url.id ? 'blink-figure' : ''}
                                />
                            </CardStyled>
                        </span>
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
    figureStatements: PropTypes.array.isRequired
};

RelatedFigures.defaultProps = {
    figureStatements: []
};

export default RelatedFigures;
