import { isEqual } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getThing } from '@/services/simcomp';

const ResourceItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding: 3px;

    &:hover {
        border: 1px solid ${(props) => props.theme.primary};
    }
`;

const Thumbnail = (props) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadThumbnail = () => {
            if (props.visualization) {
                setIsLoading(true);
                getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: props.visualization.id })
                    .then((visualization) => {
                        setThumbnail(visualization);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        };
        loadThumbnail();
    }, [props.visualization]);

    return (
        <>
            {!isLoading && thumbnail && (
                <Link href={reverse(ROUTES.VISUALIZATION, { id: props.visualization.id })}>
                    <Tooltip content={props.visualization.title}>
                        <ResourceItem key={thumbnail.figureId}>
                            <GDCVisualizationRenderer disableInteractivity height="50px" width="160px" model={thumbnail} />
                        </ResourceItem>
                    </Tooltip>
                </Link>
            )}
            {isLoading && <div style={{ height: '50px', width: '160px' }} />}
        </>
    );
};

Thumbnail.propTypes = {
    visualization: PropTypes.object,
};

export default memo(Thumbnail, isEqual);
