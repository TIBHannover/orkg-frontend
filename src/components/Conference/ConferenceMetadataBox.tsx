import { faExternalLinkAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import { CONFERENCE_REVIEW_TYPE, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';

type ConferenceMetadataBoxProps = {
    url: string;
    metadata: {
        start_date: string;
        review_process: string;
    };
    organizationId: string;
};

const ConferenceMetadataBox: FC<ConferenceMetadataBoxProps> = ({ url, metadata, organizationId }) => {
    const { data: organization, isLoading: isLoadingOrganization } = useSWR(
        organizationId ? [organizationId, organizationsUrl, 'getOrganization'] : null,
        ([params]) => getOrganization(params),
        { shouldRetryOnError: false },
    );

    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.id === organization?.type)?.label;

    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            <h5>Conference information</h5>
            <div className="mt-3 flex flex-col gap-4 text-sm">
                {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="break-all hover:underline">
                        <FontAwesomeIcon size="sm" icon={faGlobe} className="mr-2" />
                        {url}
                        <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} className="ml-1" />
                    </a>
                )}
                {metadata?.start_date && (
                    <div>
                        <b>Conference date</b>: {dayjs(metadata.start_date).format('DD MMMM YYYY')}
                    </div>
                )}
                {metadata?.review_process && (
                    <div>
                        <b>Review process</b>:{' '}
                        {CONFERENCE_REVIEW_TYPE.find((t) => t.id === metadata.review_process)?.label ?? metadata.review_process}
                    </div>
                )}
                {(isLoadingOrganization || organization) && (
                    <div>
                        <b>Conference series</b>: {isLoadingOrganization && <Skeleton className="inline-block h-4 w-32 rounded align-middle" />}
                        {organization &&
                            (organizationType ? (
                                <Link href={reverse(ROUTES.ORGANIZATION, { type: organizationType, id: organization.displayId })}>
                                    {organization.name}
                                </Link>
                            ) : (
                                organization.name
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConferenceMetadataBox;
