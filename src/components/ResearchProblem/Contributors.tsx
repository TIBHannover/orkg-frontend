import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import pluralize from 'pluralize';
import { useState } from 'react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ContributorsModal from '@/components/ResearchProblem/ContributorsModal';
import { ContributorsAvatars, StyledDotGravatar } from '@/components/styled';
import CardTitle from '@/components/Ui/Card/CardTitle';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { getContributorsByResearchProblemId, researchProblemsUrl } from '@/services/backend/research-problems';

type ContributorsProps = {
    researchProblemId: string;
};

const Contributors = ({ researchProblemId }: ContributorsProps) => {
    const {
        data: contributors,
        isLoading,
        totalElements,
        error,
    } = usePaginate({
        fetchFunction: getContributorsByResearchProblemId,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getContributorsByResearchProblemId',
        prefixParams: 'contributorsBox_',
        fetchExtraParams: {
            id: researchProblemId,
            sort: ['total_count,desc'],
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
            </div>
            {!isLoading && !error && contributors && contributors.length > 0 && (
                <ContributorsAvatars>
                    {contributors.slice(0, 18).map((contributor /* 18 perfect for the container width */) => (
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
                                    </div>
                                }
                            />
                        </div>
                    ))}
                    {contributors.length > 18 && (
                        <Tooltip key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tooltip>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && !error && contributors?.length === 0 && (
                <div className="mt-2 mb-2">
                    No contributors in this research field yet.
                    <i> Be the first contributor!</i>
                </div>
            )}
            {!isLoading && error && (
                <div className="mt-2 mb-2 text-danger">Something went wrong while loading contributors of this research field.</div>
            )}
            {!isLoading && !error && contributors && contributors.length > 18 && openModal && (
                <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />
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
