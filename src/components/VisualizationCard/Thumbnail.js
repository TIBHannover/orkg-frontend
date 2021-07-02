import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getVisualization } from 'services/similarity';
import Tippy from '@tippyjs/react';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
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

const Thumbnail = props => {
    const [thumbnail, setThumbnail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadThumbnail = () => {
            if (props.visualization) {
                setIsLoading(true);
                getVisualization(props.visualization.id)
                    .then(visualization => {
                        setThumbnail(visualization);
                        setIsLoading(false);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };
        loadThumbnail();
    }, [props.visualization]);

    return (
        <>
            {!isLoading && thumbnail && (
                <Link to={reverse(ROUTES.VISUALIZATION, { id: props.visualization.id })}>
                    <Tippy content={props.visualization.label}>
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
    visualization: PropTypes.object
};

export default memo(Thumbnail, isEqual);
