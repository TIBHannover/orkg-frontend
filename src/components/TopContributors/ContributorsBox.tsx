import { Button, Skeleton } from '@heroui/react';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import { FC, useState } from 'react';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ContributorsModal from '@/components/TopContributors/ContributorsModal';
import { contributorStatisticsUrl, getContributorStatisticsByResearchFieldId } from '@/services/backend/contributor-statistics';

type ContributorsBoxProps = {
    researchFieldId: string;
};

const ContributorsBox: FC<ContributorsBoxProps> = ({ researchFieldId }) => {
    const { data: contributors, isLoading } = usePaginate({
        fetchFunction: getContributorStatisticsByResearchFieldId,
        fetchUrl: contributorStatisticsUrl,
        fetchFunctionName: 'getContributorStatisticsByResearchFieldId',
        prefixParams: 'contributorStatisticsBox_',
        fetchExtraParams: {
            id: researchFieldId,
            includeSubfields: true,
            sort: ['total_count,desc'],
            after: dayjs().startOf('day').subtract(30, 'day').toISOString(),
        },
        defaultPageSize: 5,
    });

    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-lg p-4 flex flex-col">
            <h2 className="text-xl mb-0">Top contributors</h2>
            <hr className="mt-2" />
            <div className="grow">
                {!isLoading && contributors && contributors?.length > 0 && (
                    <div className="mt-2">
                        {contributors?.slice(0, 4).map((contributor, index) => (
                            <div className="pt-1 pl-2 pr-2" key={`rp${contributor.contributorId}`}>
                                <ContributorCard
                                    id={contributor.contributorId}
                                    subTitle={`${pluralize('contribution', contributor.totalCount, true)}`}
                                />
                                {contributors.slice(0, 4).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && contributors && contributors?.length === 0 && (
                    <div className="mt-6 mb-6">
                        No contributors in this research field yet.
                        <br />
                        <i> Be the first contributor!</i>
                    </div>
                )}
                {!isLoading && contributors && contributors?.length > 4 && (
                    <div className="text-center mt-4">
                        <Button size="sm" onClick={() => setOpenModal((v) => !v)} variant="tertiary">
                            View more
                        </Button>
                        {openModal && <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />}
                    </div>
                )}
                {isLoading && (
                    <div className="mt-6 mb-6 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-full shrink-0" />
                            <div className="flex flex-col gap-2 grow">
                                <Skeleton className="w-3/4 h-2 rounded" />
                                <Skeleton className="w-full h-1.5 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-full shrink-0" />
                            <div className="flex flex-col gap-2 grow">
                                <Skeleton className="w-3/4 h-2 rounded" />
                                <Skeleton className="w-full h-1.5 rounded" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContributorsBox;
