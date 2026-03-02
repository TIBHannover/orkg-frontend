import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { env } from 'next-runtime-env';

import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import { StyledActivity } from '@/components/ViewPaper/ProvenanceBox/styled';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Contributor, Paper, Resource } from '@/services/backend/types';

type TimelineProps = {
    versions: { created_at: string; created_by: Contributor; publishedResource?: Resource }[];
    paperResource: Paper;
    createdBy?: Contributor;
    isLoadingContributors: boolean;
    hasNextPageContributors: boolean;
    handleLoadMoreContributors: () => void;
};

const Timeline = ({
    versions,
    createdBy,
    paperResource,
    isLoadingContributors,
    hasNextPageContributors,
    handleLoadMoreContributors,
}: TimelineProps) => (
    <div>
        <small>
            <Alert className="rounded-0 mb-1" color="info">
                The timeline is built based on the creation time of each resource and statement linked to the paper.
            </Alert>
        </small>
        <div className="pt-3 pb-3 ps-3 pe-3">
            {versions?.length > 0 &&
                versions.map((version, index) => (
                    <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                        <div className="time">{dayjs(version.created_at).format('DD MMM YYYY HH:mm')}</div>
                        <div>
                            {paperResource.created_by && (
                                <>
                                    {version.publishedResource && 'Published by '}
                                    {!version.publishedResource &&
                                    !isLoadingContributors &&
                                    !hasNextPageContributors &&
                                    dayjs(version.created_at).format('DD MMM YYYY HH:mm') ===
                                        dayjs(paperResource.created_at).format('DD MMM YYYY HH:mm') &&
                                    version.created_by.id === (createdBy?.id ?? MISC.UNKNOWN_ID)
                                        ? 'Added by '
                                        : 'Updated by '}
                                    {version.created_by?.id !== MISC.UNKNOWN_ID ? (
                                        <>
                                            <Link
                                                href={reverse(ROUTES.USER_PROFILE, {
                                                    userId: version.created_by.id,
                                                })}
                                            >
                                                <b>{version.created_by.displayName}</b>
                                            </Link>
                                            {version.publishedResource && (
                                                <>
                                                    <br />
                                                    <small>
                                                        DOI:{' '}
                                                        <a
                                                            href={`https://doi.org/${env('NEXT_PUBLIC_DATACITE_DOI_PREFIX')}/${
                                                                version.publishedResource.id
                                                            }`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            https://doi.org/{env('NEXT_PUBLIC_DATACITE_DOI_PREFIX')}/{version.publishedResource.id}
                                                        </a>
                                                    </small>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <b>{version.created_by?.displayName}</b>
                                    )}
                                </>
                            )}
                        </div>
                    </StyledActivity>
                ))}
            {!isLoadingContributors && hasNextPageContributors && (
                <StyledActivity className="ps-3 pb-3">
                    <div className="time">
                        <Button color="light-darker" size="sm" onClick={!isLoadingContributors ? handleLoadMoreContributors : undefined}>
                            Load more
                        </Button>
                    </div>
                </StyledActivity>
            )}

            {!isLoadingContributors && hasNextPageContributors && (
                <StyledActivity className="ps-3 pb-3">
                    <div className="time">{dayjs(paperResource.created_at).format('DD MMM YYYY HH:mm')}</div>
                    <>
                        Added by{' '}
                        {createdBy ? (
                            <Link
                                href={reverse(ROUTES.USER_PROFILE, {
                                    userId: createdBy.id,
                                })}
                            >
                                <b>{createdBy.displayName}</b>
                            </Link>
                        ) : (
                            'Unknown'
                        )}
                    </>
                </StyledActivity>
            )}

            {isLoadingContributors && (
                <StyledActivity>
                    <div className="time">Loading ...</div>
                </StyledActivity>
            )}
        </div>
    </div>
);

export default Timeline;
