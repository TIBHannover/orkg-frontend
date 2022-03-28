import { useEffect } from 'react';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import useImportBulkData from 'components/ConfirmBulkImport/useImportBulkData';
import PaperList from 'components/ConfirmBulkImport/PaperList';

const ConfirmBulkImport = props => {
    const { data, isOpen, toggle, onFinish } = props;
    const { papers, existingPaperIds, idToLabel, isLoading, createdContributions, makePaperList, handleImport, validationErrors } = useImportBulkData(
        {
            data,
            onFinish
        }
    );

    useEffect(() => {
        makePaperList();
    }, [data, makePaperList]);

    const comparisonUrl = createdContributions
        ? reverse(ROUTES.CONTRIBUTION_EDITOR) + '?contributions=' + createdContributions.map(entry => entry.contributionId)
        : null;

    const progressPercentage =
        createdContributions.length > 0 && papers.length > 0 ? Math.round((createdContributions.length / papers.length) * 100) : 0;

    const isFinished = createdContributions.length > 0 && createdContributions.length === papers.length;

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" backdrop="static">
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
                            <Icon icon={faSpinner} spin />
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
                        <Button tag={Link} to={comparisonUrl} target="_blank" color="primary" className="mt-3">
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

ConfirmBulkImport.propTypes = {
    data: PropTypes.array.isRequired,
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onFinish: PropTypes.func
};

ConfirmBulkImport.defaultProps = {
    onFinish: () => {}
};

export default ConfirmBulkImport;
