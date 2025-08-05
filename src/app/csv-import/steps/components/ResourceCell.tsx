import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import useSWR from 'swr';

import { findTypeByIdOrName, parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Badge from '@/components/Ui/Badge/Badge';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResource } from '@/services/backend/resources';

type ResourceCellProps = {
    data: string;
    columnDataType: string;
};

const ResourceCell: FC<ResourceCellProps> = ({ data, columnDataType }) => {
    const { data: resource, isLoading } = useSWR(data && data.startsWith('orkg:') ? [data.replace('orkg:', ''), 'getResource'] : null, ([params]) =>
        getResource(params),
    );

    const { label, typeStr, hasTypeInfo } = parseCellString(data);

    if (isLoading) return <Skeleton />;
    if (!resource) {
        return (
            <div>
                {label.startsWith('resource:') ? (
                    <Tooltip content="This resource will be created during the import process">
                        <span>
                            {label.replace('resource:', '')}{' '}
                            <Badge color="light" className="ms-1">
                                resource
                            </Badge>
                        </span>
                    </Tooltip>
                ) : (
                    <ValuePlugins type={ENTITIES.LITERAL} datatype={columnDataType}>
                        {label}
                    </ValuePlugins>
                )}
                {hasTypeInfo && typeStr && (
                    <small>
                        <Badge color="light" className="ms-1">
                            {findTypeByIdOrName(typeStr)?.name ?? typeStr}
                        </Badge>
                    </small>
                )}
            </div>
        );
    }
    return (
        <div>
            <DescriptionTooltip id={resource.id} _class={ENTITIES.RESOURCE}>
                <Link href={reverse(ROUTES.RESOURCE, { id: resource.id })} target="_blank">
                    {resource.label}
                </Link>
            </DescriptionTooltip>
        </div>
    );
};
export default ResourceCell;
