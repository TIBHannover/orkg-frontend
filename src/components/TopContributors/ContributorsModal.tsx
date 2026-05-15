import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Skeleton } from '@heroui/react';
import dayjs from 'dayjs';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import ContributorsDropdownFilter from '@/components/TopContributors/ContributorsDropdownFilter';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { contributorStatisticsUrl, getContributorStatisticsByResearchFieldId } from '@/services/backend/contributor-statistics';

type ContributorsModalProps = {
    researchFieldId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    initialSort?: string;
    initialIncludeSubFields?: boolean;
};

const ContributorsModal: FC<ContributorsModalProps> = ({
    researchFieldId,
    openModal,
    setOpenModal,
    initialSort = 'top',
    initialIncludeSubFields = true,
}) => {
    const [sort, setSort] = useState(initialSort);
    const [includeSubFields, setIncludeSubFields] = useState(initialIncludeSubFields);

    const after = sort === 'top' ? dayjs().startOf('day').subtract(30, 'day').toISOString() : undefined;
    const {
        data: contributors,
        isLoading,
        totalElements,
        page,
        setPage,
        totalPages,
        pageSize,
        setPageSize,
        hasNextPage,
    } = usePaginate({
        fetchFunction: getContributorStatisticsByResearchFieldId,
        fetchUrl: contributorStatisticsUrl,
        fetchFunctionName: 'getContributorStatisticsByResearchFieldId',
        prefixParams: 'contributorStatistics_',
        fetchExtraParams: {
            id: researchFieldId,
            includeSubfields: includeSubFields,
            sort: ['total_count,desc'],
            after,
        },
        defaultPageSize: 50,
    });

    return (
        <Modal.Backdrop
            isOpen={openModal}
            onOpenChange={(open) => {
                if (!open) {
                    setOpenModal(false);
                    setPage(0);
                    setPageSize(50);
                }
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-6xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>
                            <FontAwesomeIcon icon={faAward} className="text-accent mr-2" /> Top contributors
                            <div className="inline-block ml-5">
                                <ContributorsDropdownFilter
                                    sort={sort}
                                    isLoading={isLoading}
                                    includeSubFields={includeSubFields}
                                    setSort={setSort}
                                    researchFieldId={researchFieldId}
                                    setIncludeSubFields={setIncludeSubFields}
                                />
                            </div>
                        </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="pl-4 pr-4">
                            {!isLoading && (
                                <div className="overflow-x-auto">
                                    <table className="w-full rounded border border-border [&_th]:border [&_th]:border-border [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_tbody_tr:nth-child(odd)]:bg-default/50 [&_tbody_tr:hover]:bg-default">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th className="w-1/2">Contributor</th>
                                                <th className="text-center">Contributions</th>
                                                <th className="text-center">Comparisons</th>
                                                <th className="text-center">Papers</th>
                                                <th className="text-center">Visualizations</th>
                                                <th className="text-center">Problems</th>
                                                <th className="text-center">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contributors &&
                                                contributors.map((contributor, index) => (
                                                    <tr key={`rp${contributor.contributorId}`}>
                                                        <td className="text-center align-middle">{page * pageSize + index + 1}.</td>
                                                        <td className="grow">
                                                            <UserAvatar userId={contributor.contributorId} size={50} showDisplayName />
                                                        </td>
                                                        <td className="text-center align-middle">{contributor.contributionCount}</td>
                                                        <td className="text-center align-middle">{contributor.comparisonCount}</td>
                                                        <td className="text-center align-middle">{contributor.paperCount}</td>
                                                        <td className="text-center align-middle">{contributor.visualizationCount}</td>
                                                        <td className="text-center align-middle">{contributor.researchProblemCount}</td>
                                                        <td className="text-center align-middle">{contributor.totalCount}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!isLoading && contributors?.length === 0 && (
                                <div className="mt-6 mb-6">
                                    No contributors yet.
                                    <i> Be the first contributor!</i>
                                </div>
                            )}
                            {!isLoading && (
                                <PaginationControl
                                    prefixParams="contributorStatistics_"
                                    page={page}
                                    setPage={setPage}
                                    totalPages={totalPages ?? 0}
                                    pageSize={pageSize}
                                    setPageSize={setPageSize}
                                    isLoading={isLoading}
                                    hasNextPage={hasNextPage}
                                    totalElements={totalElements ?? 0}
                                    boxShadow={false}
                                />
                            )}
                            {isLoading && (
                                <div className="mt-6 mb-6 flex">
                                    <div className="w-0.5 bg-gray-200 mr-4 shrink-0" />
                                    <div className="flex flex-col gap-4 grow">
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-3/4 h-2 rounded" />
                                            <Skeleton className="w-1/2 h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-3/4 h-2 rounded" />
                                            <Skeleton className="w-3/4 h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-1/2 h-2 rounded" />
                                            <Skeleton className="w-3/4 h-1.5 rounded" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ContributorsModal;
