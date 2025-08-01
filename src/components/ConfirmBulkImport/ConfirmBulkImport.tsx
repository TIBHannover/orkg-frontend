import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Progress } from 'reactstrap';

import PaperList from '@/components/ConfirmBulkImport/PaperList';
import useImportBulkData from '@/components/ConfirmBulkImport/useImportBulkData';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import ROUTES from '@/constants/routes';

type ConfirmBulkImportProps = {
    data: string[][];
    isOpen: boolean;
    toggle: () => void;
    onFinish: () => void;
};

const ConfirmBulkImport = ({ data, isOpen, toggle, onFinish: onFinishParent = () => {} }: ConfirmBulkImportProps) => {
    const [isFinished, setIsFinished] = useState(false);

    const onFinish = () => {
        setIsFinished(true);
        onFinishParent();
    };
    const { papers, existingPaperIds, idToLabel, isLoading, createdContributions, makePaperList, handleImport, validationErrors } = useImportBulkData(
        {
            data,
            onFinish,
        },
    );

    useEffect(() => {
        makePaperList();
    }, [data, makePaperList]);

    const comparisonUrl = createdContributions
        ? `${reverse(ROUTES.CONTRIBUTION_EDITOR)}?contributions=${createdContributions.map((entry) => entry.contributionId)}`
        : null;

    const progressPercentage =
        createdContributions.length > 0 && papers.length > 0 ? Math.round((createdContributions.length / papers.length) * 100) : 0;

    return (
        <Modal isOpen={isOpen} size="lg" backdrop="static">
            <ModalHeader toggle={toggle}>Review import</ModalHeader>
            <ModalBody>
                {!isLoading && createdContributions.length === 0 && (
                    <>
                        <Alert color="info" fade={false}>
                            The following contributions will be imported, please review the content carefully
                        </Alert>
                        <PaperList papers={papers} existingPaperIds={existingPaperIds} idToLabel={idToLabel} validationErrors={validationErrors} />
                    </>
                )}
                {isLoading && (
                    <div className="text-center text-primary">
                        <span style={{ fontSize: 80 }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </span>
                        {createdContributions.length > 0 && (
                            <div className="w-100 text-dark d-flex align-items-center flex-column mb-4">
                                <Progress value={progressPercentage} className="w-50" />
                                <div className="mt-1">
                                    Importing paper {createdContributions.length}/{papers.length}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {isFinished && (
                    <>
                        <Alert color="success">Import successful, {createdContributions.length} papers are imported</Alert>
                        The imported papers can be viewed in the contribution editor <br />
                        <Button tag={Link} href={comparisonUrl} target="_blank" color="primary" className="mt-3">
                            Contribution editor
                        </Button>
                    </>
                )}
            </ModalBody>
            {createdContributions.length === 0 && !isLoading && (
                <ModalFooter>
                    <Button color="primary" onClick={handleImport}>
                        Import
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    );
};

export default ConfirmBulkImport;
