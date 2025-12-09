import { faChartBar, faCodeBranch, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
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
        <Tooltip
            onTrigger={() => setIsActive(true)}
            content={
                <>
                    {version.label}
                    <div className="d-flex mt-1">
                        {!isLoading && data && (
                            <div className="flex-grow-1">
                                {data?.contributions?.length && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faFile} className="me-1" /> {data?.contributions?.length} Contributions
                                    </>
                                )}
                                {data.visualizations && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faChartBar} className="ms-2 me-1" /> {data.visualizations?.length}{' '}
                                        Visualizations
                                    </>
                                )}
                            </div>
                        )}
                        {isLoading && <div className="flex-grow-1">Loading...</div>}
                        <div>
                            <UserAvatar userId={version.created_by} />
                        </div>
                    </div>
                </>
            }
        >
            <span>
                <Link href={reverse(ROUTES.COMPARISON, { comparisonId: version.id })}>Version {dayjs(version.created_at).format('DD-MM-YYYY')}</Link>
            </span>
        </Tooltip>
    );
};

type VersionsProps = {
    versions: ComparisonVersion[];
};

const Versions = ({ versions }: VersionsProps) => {
    const [showMore, setShowMore] = useState(false);
    const _versions = !showMore && versions?.length > 0 ? versions.slice(1, 3) : versions.slice(1);

    return (
        <small>
            <FontAwesomeIcon size="sm" icon={faCodeBranch} className="me-1" /> Versions:{' '}
            {_versions.map((version, index) => (
                <span key={version.id}>
                    <VersionTooltip version={version} />
                    {(index < _versions.length - 1 || versions.length > 3) && ' • '}
                </span>
            ))}
            {versions.length > 3 && (
                <Button
                    style={{ verticalAlign: 'baseline' }}
                    className="p-0 text-decoration-none"
                    size="sm"
                    onClick={() => setShowMore((v) => !v)}
                    color="link"
                >
                    {showMore ? 'Show less' : 'Show more'}
                </Button>
            )}
        </small>
    );
};

export default Versions;
