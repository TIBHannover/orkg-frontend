import { Skeleton } from '@heroui/react';
import useSWR from 'swr';

import { parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { getThing, thingsUrl } from '@/services/backend/things';

type RendererProps = {
    value?: string;
};

const RendererComponent = ({ value }: RendererProps) => {
    const { label, entityId, isExistingResource } = parseCellString(value || '');
    const { data: entity, isLoading } = useSWR(isExistingResource && entityId ? [entityId, thingsUrl, 'getThing'] : null, ([params]) =>
        getThing(params),
    );
    if (isLoading) return <Skeleton className="w-full h-4 rounded" />;
    if (!entity && value === 'title') return <b>{label}</b>;
    if (!entity) return <div>{label}</div>;
    return (
        <div>
            <DescriptionTooltip id={entity.id} _class={entity._class} showURL>
                <span className="text-sm text-accent">{entity.label}</span>
            </DescriptionTooltip>
        </div>
    );
};

export default RendererComponent;
