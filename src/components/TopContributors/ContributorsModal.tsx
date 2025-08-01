import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, FC, SetStateAction } from 'react';
import { Table } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ContributorsDropdownFilter from '@/components/TopContributors/ContributorsDropdownFilter';
import useContributors from '@/components/TopContributors/hooks/useContributors';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import UserAvatar from '@/components/UserAvatar/UserAvatar';

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
    const { contributors, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useContributors({
        researchFieldId,
        pageSize: 50,
        initialSort,
        initialIncludeSubFields,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="xl">
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
                                        <tr key={`rp${contributor.id}`}>
                                            <td className="text-center align-middle">{index + 1}.</td>
                                            <td className="flex-grow-1">
                                                <UserAvatar userId={contributor.id} size={50} showDisplayName />
                                            </td>
                                            <td className="text-center align-middle">{contributor.contributions}</td>
                                            <td className="text-center align-middle">{contributor.comparisons}</td>
                                            <td className="text-center align-middle">{contributor.papers}</td>
                                            <td className="text-center align-middle">{contributor.visualizations}</td>
                                            <td className="text-center align-middle">{contributor.problems}</td>
                                            <td className="text-center align-middle">{contributor.total}</td>
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
