import { Tooltip } from '@heroui/react';
import { isEqual } from 'lodash';
import Link from 'next/link';
import { FC, memo } from 'react';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { reverse } from '@/lib/namedRoute';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { Visualization } from '@/services/backend/types';
import { getThing, simCompServiceUrl } from '@/services/simcomp';

type ThumbnailModel = {
    src?: string;
    figureId?: string;
    [key: string]: unknown;
};

type ThumbnailProps = {
    visualization?: Visualization;
};

const Thumbnail: FC<ThumbnailProps> = ({ visualization }) => {
    const { data: thumbnail, isLoading } = useSWR<ThumbnailModel | null>(
        visualization ? [visualization.id, simCompServiceUrl, 'getThing-visualization'] : null,
        ([thingKey]) => getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey }),
    );

    if (isLoading) {
        return <div className="h-[50px] w-[160px]" />;
    }

    if (!thumbnail || !visualization) {
        return null;
    }

    return (
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">
                <Link href={reverse(ROUTES.VISUALIZATION, { id: visualization.id })}>
                    <span className="block overflow-hidden rounded-md border border-default p-[3px] hover:border-accent">
                        <GDCVisualizationRenderer disableInteractivity height="50px" width="160px" model={thumbnail} />
                    </span>
                </Link>
            </Tooltip.Trigger>
            <Tooltip.Content>{visualization.title}</Tooltip.Content>
        </Tooltip>
    );
};

export default memo(Thumbnail, isEqual);
