import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import ContributorsDropdownFilter from '@/components/TopContributors/ContributorsDropdownFilter';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Table from '@/components/Ui/Table/Table';
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
        <Modal
            isOpen={openModal}
            toggle={() => setOpenModal((v) => !v)}
            size="xl"
            onExit={() => {
                setPage(0);
                setPageSize(50);
            }}
        >
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <FontAwesomeIcon icon={faAward} className="text-primary" /> Top contributors
                <div style={{ display: 'inline-block', marginLeft: '20px' }}>
                    <ContributorsDropdownFilter
                        sort={sort}
                        isLoading={isLoading}
                        includeSubFields={includeSubFields}
                        setSort={setSort}
                        researchFieldId={researchFieldId}
                        setIncludeSubFields={setIncludeSubFields}
                    />
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {!isLoading && (
                        <Table striped bordered hover className="rounded" responsive>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th className="w-50">Contributor</th>
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
                                            <td className="flex-grow-1">
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
                        </Table>
                    )}
                    {!isLoading && contributors?.length === 0 && (
                        <div className="mt-4 mb-4">
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
                        <div className="mt-4 mb-4">
                            <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                                <rect x="30" y="5" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="150" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="150" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

export default ContributorsModal;
