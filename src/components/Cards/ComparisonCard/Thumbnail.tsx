import { Tooltip } from '@heroui/react';
import { isEqual } from 'lodash';
import Link from 'next/link';
import { FC, memo } from 'react';
import useSWR from 'swr';

import { PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { reverse } from '@/lib/namedRoute';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Node } from '@/services/backend/types';
import { getThing, simCompServiceUrl } from '@/services/simcomp';

type ThumbnailModel = {
    src?: string;
    figureId?: string;
    [key: string]: unknown;
};

type ThumbnailProps = {
    id: string;
    figures?: Node[];
    visualizations?: Node[];
};

const visualizationFetcher = ([thingKey]: [string]) => getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey });

const figureFetcher = async ([subjectId]: [string]): Promise<ThumbnailModel | null> => {
    const figuresStatements = await getStatements({ subjectId, predicateId: PREDICATES.IMAGE, returnContent: true });
    if (figuresStatements.length === 0) {
        return null;
    }
    return { src: figuresStatements[0].object.label };
};

const Thumbnail: FC<ThumbnailProps> = ({ id, figures, visualizations }) => {
    const hasVisualization = !!visualizations && visualizations.length > 0;
    const hasFigure = !hasVisualization && !!figures && figures.length > 0;

    const { data: vizThumbnail, isLoading: isLoadingViz } = useSWR<ThumbnailModel | null>(
        hasVisualization && visualizations ? [visualizations[0].id, simCompServiceUrl, 'getThing-visualization'] : null,
        visualizationFetcher,
    );

    const { data: figureThumbnail, isLoading: isLoadingFigure } = useSWR<ThumbnailModel | null>(
        hasFigure && figures ? [figures[0].id, statementsUrl, 'getStatements-figure-image'] : null,
        figureFetcher,
    );

    const isLoading = isLoadingViz || isLoadingFigure;
    const thumbnail = vizThumbnail ?? figureThumbnail;

    if (isLoading) {
        return <div className="h-[50px] w-[160px]" />;
    }

    if (!thumbnail) {
        return null;
    }

    if (thumbnail.src && hasFigure && figures) {
        return (
            <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                    <Link href={`${reverse(ROUTES.COMPARISON, { comparisonId: id })}#${figures[0].id}`}>
                        <span className="block overflow-hidden rounded-md border border-default p-[3px] hover:border-accent">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumbnail.src} alt={figures[0].label} className="h-[50px] w-[160px] object-cover" />
                        </span>
                    </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>{figures[0].label}</Tooltip.Content>
            </Tooltip>
        );
    }

    if (!thumbnail.src && hasVisualization && visualizations) {
        return (
            <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                    <Link href={reverse(ROUTES.COMPARISON, { comparisonId: id })}>
                        <span className="block overflow-hidden rounded-md border border-default p-[3px] hover:border-accent">
                            <GDCVisualizationRenderer disableInteractivity height="50px" width="160px" model={thumbnail} />
                        </span>
                    </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>{visualizations[0].label}</Tooltip.Content>
            </Tooltip>
        );
    }

    return null;
};

export default memo(Thumbnail, isEqual);
