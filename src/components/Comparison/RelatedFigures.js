import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'network';
import { Card, CardImg, CardColumns } from 'reactstrap';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import { find } from 'lodash';
import styled from 'styled-components';
import { PREDICATES } from 'constants/graphSettings';

const CardStyled = styled(Card)`
    cursor: pointer;
    overflow: hidden;
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
                    const _figures = figuresStatements.map(figureStatements => {
                        const figureTitle = find(props.figureStatements, { id: figureStatements.id });
                        const imageStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
                        const descriptionStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);
                        return {
                            src: imageStatement ? imageStatement.object.label : '',
                            title: figureTitle.label,
                            description: descriptionStatement ? descriptionStatement.object.label : ''
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

    if (props.figureStatements.length > 0) {
        return (
            <>
                <h3 className="mt-5 h5">Related figures</h3>{' '}
                <CardColumns>
                    {figures.map((url, index) => (
                        <CardStyled key={`figure${index}`} onClick={() => openLightBox(index)}>
                            <CardImg top width="100%" src={url.src} alt="Card image cap" />
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
    figureStatements: PropTypes.array.isRequired
};

RelatedFigures.defaultProps = {
    figureStatements: []
};

export default RelatedFigures;
