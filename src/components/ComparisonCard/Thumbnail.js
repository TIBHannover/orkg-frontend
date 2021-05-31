import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { PREDICATES } from 'constants/graphSettings';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { getVisualization } from 'services/similarity';
import Tippy from '@tippyjs/react';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getStatementsBySubject } from 'services/backend/statements';

const ResourceItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding: 3px;

    &:hover {
        border: 1px solid ${props => props.theme.primary};
    }
`;

const ThumbnailImg = styled.img`
    height: 50px;
    width: 160px;
    object-fit: cover;
`;

const Thumbnail = props => {
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        const loadThumbnail = () => {
            if (props.visualizations?.length > 0) {
                getVisualization(props.visualizations[0].id)
                    .then(visualization => {
                        setThumbnail(visualization);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else if (props.figures?.length > 0) {
                getStatementsBySubject({
                    id: props.figures[0].id
                })
                    .then(figuresStatements => {
                        const img = filterObjectOfStatementsByPredicateAndClass(figuresStatements, PREDICATES.IMAGE, true);
                        setThumbnail({
                            src: img ? img.label : ''
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };
        loadThumbnail();
    }, [props.figures, props.visualizations]);

    return (
        <>
            {thumbnail && thumbnail.src && (
                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.id }) + '#' + props.figures[0].id}>
                    <Tippy content={props.figures[0].label}>
                        <ResourceItem key={props.figures[0].id}>
                            <ThumbnailImg src={thumbnail.src} alt={props.figures[0].label} />
                        </ResourceItem>
                    </Tippy>
                </Link>
            )}
            {thumbnail && !thumbnail.src && (
                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.id })}>
                    <Tippy content={props.visualizations[0].label}>
                        <ResourceItem key={thumbnail.figureId}>
                            <GDCVisualizationRenderer disableInteractivity={true} height="50px" width="160px" model={thumbnail} />
                        </ResourceItem>
                    </Tippy>
                </Link>
            )}
        </>
    );
};

Thumbnail.propTypes = {
    id: PropTypes.string.isRequired,
    visualizations: PropTypes.array,
    figures: PropTypes.array
};

export default Thumbnail;
