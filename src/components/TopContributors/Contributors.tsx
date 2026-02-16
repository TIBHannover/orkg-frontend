import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import { FC, useState } from 'react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import { ContributorsAvatars, StyledDotGravatar } from '@/components/styled';
import ContributorsDropdownFilter from '@/components/TopContributors/ContributorsDropdownFilter';
import ContributorsModal from '@/components/TopContributors/ContributorsModal';
import CardTitle from '@/components/Ui/Card/CardTitle';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { contributorStatisticsUrl, getContributorStatisticsByResearchFieldId } from '@/services/backend/contributor-statistics';

type ContributorsProps = {
    researchFieldId: string;
};

const Contributors: FC<ContributorsProps> = ({ researchFieldId }) => {
    const [sort, setSort] = useState('all');
    const [includeSubFields, setIncludeSubFields] = useState(true);
    const { data: contributors, isLoading } = usePaginate({
        fetchFunction: getContributorStatisticsByResearchFieldId,
        fetchUrl: contributorStatisticsUrl,
        fetchFunctionName: 'getContributorStatisticsByResearchFieldId',
        prefixParams: 'contributorStatisticsBox_',
        fetchExtraParams: {
            id: researchFieldId,
            includeSubfields: true,
            sort: ['total_count,desc'],
            after: sort === 'top' ? dayjs().startOf('day').subtract(30, 'day').toISOString() : undefined,
        },
        defaultPageSize: 19,
    });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div>
            <div className="d-flex mb-2">
                <CardTitle tag="h5" className="flex-grow-1">
                    Contributors
                </CardTitle>
                <div className="align-self-center">
                    <ContributorsDropdownFilter
                        sort={sort}
                        isLoading={isLoading}
                        includeSubFields={includeSubFields}
                        setSort={setSort}
                        setIncludeSubFields={setIncludeSubFields}
                        researchFieldId={researchFieldId}
                    />
                </div>
            </div>
            {!isLoading && contributors && contributors?.length > 0 && (
                <ContributorsAvatars>
                    {contributors?.slice(0, 18).map((contributor) => (
                        <div key={`contributor${contributor.contributorId}`}>
                            <UserAvatar
                                userId={contributor.contributorId}
                                size={48}
                                showDisplayName={false}
                                appendToTooltip={
                                    <div className="p-2">
                                        <ul className="p-0 ps-3 mb-0 mt-2">
                                            <li>{pluralize('paper', contributor.paperCount, true)}</li>
                                            <li>{pluralize('contribution', contributor.contributionCount, true)}</li>
                                            <li>{pluralize('comparison', contributor.comparisonCount, true)}</li>
                                            <li>{pluralize('visualization', contributor.visualizationCount, true)}</li>
                                            <li>{pluralize('research problem', contributor.researchProblemCount, true)}</li>
                                        </ul>

                                        <hr className="mb-1 mt-1" style={{ background: '#fff' }} />
                                        <ul className="p-0 ps-3 mb-0 mt-2">
                                            <li>
                                                <i>
                                                    <b>{contributor.totalCount} </b>
                                                    {pluralize('total contribution', contributor.totalCount, false)}
                                                </i>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            />
                        </div>
                    ))}
                    {contributors?.length > 18 && (
                        <Tooltip key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tooltip>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && contributors?.length === 0 && (
                <div className="mt-4 mb-4">
                    {sort === 'top' ? 'No contributors in the last 30 days yet.' : 'No contributors in this research field yet.'}
                    <i> Be the first contributor!</i>
                </div>
            )}
            {contributors && contributors?.length > 18 && openModal && (
                <ContributorsModal
                    initialSort={sort}
                    initialIncludeSubFields={includeSubFields}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    researchFieldId={researchFieldId}
                />
            )}
            {isLoading && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 4" style={{ width: '100% !important' }}>
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="7" cy="2" r="2" />
                        <circle cx="12" cy="2" r="2" />
                        <circle cx="17" cy="2" r="2" />
                        <circle cx="22" cy="2" r="2" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

export default Contributors;
