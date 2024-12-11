import Tippy from '@tippyjs/react';
import Link from 'next/link';
import { PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { isEqual } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import { getStatements } from 'services/backend/statements';
import { getThing } from 'services/simcomp';
import styled from 'styled-components';

const ResourceItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding: 3px;

    &:hover {
        border: 1px solid ${(props) => props.theme.primary};
    }
`;

const ThumbnailImg = styled.img`
    height: 50px;
    width: 160px;
    object-fit: cover;
`;

const Thumbnail = (props) => {
    const [thumbnail, setThumbnail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { id, figures, visualizations } = props;

    useEffect(() => {
        const loadThumbnail = () => {
            if (visualizations?.length > 0) {
                setIsLoading(true);
                getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: visualizations[0].id })
                    .then((visualization) => {
                        setThumbnail(visualization);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            } else if (figures?.length > 0) {
                setIsLoading(true);
                getStatements({ subjectId: figures[0].id, predicate: PREDICATES.IMAGE, returnContent: true })
                    .then((figuresStatements) => {
                        if (figuresStatements.length > 0) {
                            setThumbnail({
                                src: figuresStatements[0].object.label,
                            });
                        }
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        };
        loadThumbnail();
    }, [figures, visualizations]);

    return (
        <>
            {!isLoading && thumbnail && thumbnail.src && (
                <Link href={`${reverse(ROUTES.COMPARISON, { comparisonId: id })}#${figures[0].id}`}>
                    <Tippy content={figures[0].label}>
                        <ResourceItem key={figures[0].id}>
                            <ThumbnailImg src={thumbnail.src} alt={figures[0].label} />
                        </ResourceItem>
                    </Tippy>
                </Link>
            )}
            {!isLoading && thumbnail && !thumbnail.src && (
                <Link href={reverse(ROUTES.COMPARISON, { comparisonId: id })}>
                    <Tippy content={visualizations[0].label}>
                        <ResourceItem key={thumbnail.figureId}>
                            <GDCVisualizationRenderer disableInteractivity height="50px" width="160px" model={thumbnail} />
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
    figures: PropTypes.array,
};

export default memo(Thumbnail, isEqual);
