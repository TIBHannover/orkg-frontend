import { faChartBar, faCodeBranch, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, useState } from 'react';
import useSWR from 'swr';

import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { comparisonUrl, getComparison } from '@/services/backend/comparisons';
import { ComparisonVersion } from '@/services/backend/types';

type VersionTooltipProps = {
    version: ComparisonVersion;
};

const VersionTooltip: FC<VersionTooltipProps> = ({ version }) => {
    const [isActive, setIsActive] = useState(false);

    const { data, isLoading } = useSWR(isActive && version.id ? [version.id, comparisonUrl, 'getComparison'] : null, ([params]) =>
        getComparison(params),
    );

    return (
        <span onMouseEnter={() => setIsActive(true)} onFocus={() => setIsActive(true)}>
            <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                    <Link href={reverse(ROUTES.COMPARISON, { comparisonId: version.id })}>
                        Version {dayjs(version.created_at).format('DD-MM-YYYY')}
                    </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {version.label}
                    <div className="mt-1 flex">
                        {!isLoading && data && (
                            <div className="grow pr-2">
                                {data?.sources?.length && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faFile} className="mr-1 text-muted" /> {data?.sources?.length} Sources
                                    </>
                                )}
                                {data.visualizations && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faChartBar} className="ml-2 mr-1 text-muted" /> {data.visualizations?.length}{' '}
                                        Visualizations
                                    </>
                                )}
                            </div>
                        )}
                        {isLoading && <div className="grow">Loading...</div>}
                        <div>
                            <UserAvatar userId={version.created_by} />
                        </div>
                    </div>
                </Tooltip.Content>
            </Tooltip>
        </span>
    );
};

type VersionsProps = {
    versions: ComparisonVersion[];
};

const Versions = ({ versions }: VersionsProps) => {
    const [showMore, setShowMore] = useState(false);
    const _versions = !showMore && versions?.length > 0 ? versions.slice(1, 3) : versions.slice(1);

    return (
        <small className="mt-2 block">
            <FontAwesomeIcon size="sm" icon={faCodeBranch} className="mr-1 text-muted" />
            Versions:{' '}
            {_versions.map((version, index) => (
                <span key={version.id}>
                    <VersionTooltip version={version} />
                    {(index < _versions.length - 1 || versions.length > 3) && ' • '}
                </span>
            ))}
            {versions.length > 3 && (
                <button
                    type="button"
                    className="inline align-baseline border-0 bg-transparent p-0 text-sm text-accent hover:text-accent-darker cursor-pointer transition-colors"
                    onClick={() => setShowMore((v) => !v)}
                >
                    {showMore ? 'Show less' : 'Show more'}
                </button>
            )}
        </small>
    );
};

export default Versions;
