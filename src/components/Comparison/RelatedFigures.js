import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubject } from 'network';
import { Card, CardImg, CardColumns } from 'reactstrap';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import styled from 'styled-components';

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
        const loadResources = async () => {
            if (props.figureStatements.length === 0) {
                return;
            }
            const _figures = [];

            for (const resource of props.figureStatements) {
                await getStatementsBySubject({ id: resource.object.id }).then(statements => {
                    const imageStatement = statements.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_IMAGE);
                    const descriptionStatement = statements.find(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_DESCRIPTION
                    );

                    _figures.push({
                        src: imageStatement ? imageStatement.object.label : '',
                        title: resource.object.label,
                        description: descriptionStatement ? descriptionStatement.object.label : ''
                    });
                });
            }

            setFigures(_figures);
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
