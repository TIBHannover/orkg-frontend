import { faCodeBranch, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { PublishedVersionRepresentation } from '@orkg/orkg-client';
import dayjs from 'dayjs';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC, useState } from 'react';
import useSWR from 'swr';

import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getPaper, papersUrl } from '@/services/backend/papers';

type VersionTooltipProps = {
    version: PublishedVersionRepresentation;
};

const VersionTooltip: FC<VersionTooltipProps> = ({ version }) => {
    const [isActive, setIsActive] = useState(false);

    const { data, isLoading } = useSWR(isActive && version.id ? [version.id, papersUrl, 'getPaper'] : null, ([params]) => getPaper(params));

    return (
        <span onMouseEnter={() => setIsActive(true)} onFocus={() => setIsActive(true)}>
            <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: version.id })}>Version {dayjs(version.createdAt).format('DD-MM-YYYY')}</Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {version.label}
                    {version.changelog && <div className="mt-1">{version.changelog}</div>}
                    <div className="mt-1 flex">
                        {!isLoading && data && (
                            <div className="grow pr-2">
                                <FontAwesomeIcon size="sm" icon={faFile} className="mr-1 text-muted" />{' '}
                                {pluralize('contribution', data.contributions?.length ?? 0, true)}
                            </div>
                        )}
                        {isLoading && <div className="grow">Loading...</div>}
                        <div>
                            <UserAvatar userId={version.createdBy} />
                        </div>
                    </div>
                </Tooltip.Content>
            </Tooltip>
        </span>
    );
};

type VersionsProps = {
    versions: PublishedVersionRepresentation[];
};

const Versions = ({ versions }: VersionsProps) => {
    const [showMore, setShowMore] = useState(false);
    // unlike ComparisonCard, the card shows the head version, so every published entry is listed
    const _versions = showMore ? versions : versions.slice(0, 2);

    return (
        <small className="mt-2 block">
            <FontAwesomeIcon size="sm" icon={faCodeBranch} className="mr-1 text-muted" />
            Published versions:{' '}
            {_versions.map((version, index) => (
                <span key={version.id}>
                    <VersionTooltip version={version} />
                    {(index < _versions.length - 1 || versions.length > 2) && ' • '}
                </span>
            ))}
            {versions.length > 2 && (
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
