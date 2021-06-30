import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { getVisualization } from 'services/similarity';
import Tippy from '@tippyjs/react';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';

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

    useEffect(() => {
        const loadThumbnail = () => {
            if (props.visualization) {
                getVisualization(props.visualization.id)
                    .then(visualization => {
                        setThumbnail(visualization);
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
            {thumbnail && (
                <Link to={reverse(ROUTES.VISUALIZATION, { id: props.visualization.id })}>
                    <Tippy content={props.visualization.label}>
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
    visualization: PropTypes.object
};

export default Thumbnail;
