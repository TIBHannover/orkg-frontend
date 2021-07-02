import { useState, useEffect, memo } from 'react';
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
import { isEqual } from 'lodash';

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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadThumbnail = () => {
            if (props.visualizations?.length > 0) {
                setIsLoading(true);
                getVisualization(props.visualizations[0].id)
                    .then(visualization => {
                        setThumbnail(visualization);
                        setIsLoading(false);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else if (props.figures?.length > 0) {
                setIsLoading(true);
                getStatementsBySubject({
                    id: props.figures[0].id
                })
                    .then(figuresStatements => {
                        const img = filterObjectOfStatementsByPredicateAndClass(figuresStatements, PREDICATES.IMAGE, true);
                        setThumbnail({
                            src: img ? img.label : ''
                        });
                        setIsLoading(false);
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
            {!isLoading && thumbnail && thumbnail.src && (
                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.id }) + '#' + props.figures[0].id}>
                    <Tippy content={props.figures[0].label}>
                        <ResourceItem key={props.figures[0].id}>
                            <ThumbnailImg src={thumbnail.src} alt={props.figures[0].label} />
                        </ResourceItem>
                    </Tippy>
                </Link>
            )}
            {!isLoading && thumbnail && !thumbnail.src && (
                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.id })}>
                    <Tippy content={props.visualizations[0].label}>
                        <ResourceItem key={thumbnail.figureId}>
                            <GDCVisualizationRenderer disableInteractivity={true} height="50px" width="160px" model={thumbnail} />
                        </ResourceItem>
                    </Tippy>
                </Link>
            )}
            {isLoading && <div style={{ height: '50px', width: '160px' }} />}
        </>
    );
};

Thumbnail.propTypes = {
    id: PropTypes.string.isRequired,
    visualizations: PropTypes.array,
    figures: PropTypes.array
};

export default memo(Thumbnail, isEqual);
