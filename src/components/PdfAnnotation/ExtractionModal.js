import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import ExtractReferencesModal from './ExtractReferencesModal';
import { Link } from 'react-router-dom';
import useExtractionModal from './hooks/useExtractionModal';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import useTableEditor from './hooks/useTableEditor';

const ExtractionModal = props => {
    const [
        loading,
        importedData,
        extractionSuccessful,
        editorRef,
        transposeTable,
        handleCsvDownload,
        handleImportData,
        importError,
        clearImportError
    ] = useExtractionModal(props);

    const [extractReferencesModalOpen, setExtractReferencesModalOpen] = useState(false);
    const toggleExtractReferencesModal = () => {
        setExtractReferencesModalOpen(!extractReferencesModalOpen);
    };
    const { removeEmptyRows } = useTableEditor(props.id, editorRef);

    const comparisonUrl = importedData
        ? reverse(ROUTES.COMPARISON_NOT_PUBLISHED) + '?contributions=' + importedData.map(entry => entry.contributionId)
        : null;

    return (
        <>
            <Modal isOpen={props.isOpen} toggle={props.toggle} style={{ maxWidth: '95%' }}>
                <ModalHeader toggle={props.toggle}>
                    Table extraction{' '}
                    <a
                        href="https://www.orkg.org/orkg/help-center/article/7/Extracting_and_importing_tables_from_survey_articles"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icon icon={faQuestionCircle} style={{ fontSize: 18, lineHeight: 1 }} className="p-0" />
                    </a>
                </ModalHeader>

                {loading && (
                    <ModalBody>
                        <div className="text-center" style={{ fontSize: 40 }}>
                            <Icon icon={faSpinner} spin />
                        </div>
                    </ModalBody>
                )}

                {!loading && !importedData && (
                    <>
                        <ModalBody>
                            {importError && (
                                <Alert className="mt-2 mb-3" color="danger">
                                    {importError}
                                </Alert>
                            )}

                            {extractionSuccessful && (
                                <>
                                    <TableEditor setRef={editorRef} id={props.id} />
                                    <div className="mt-3">
                                        <Button size="sm" color="secondary" onClick={toggleExtractReferencesModal}>
                                            Extract references
                                        </Button>{' '}
                                        <Button size="sm" color="secondary" onClick={handleCsvDownload}>
                                            Download CSV
                                        </Button>{' '}
                                        <Button size="sm" color="secondary" onClick={transposeTable}>
                                            Transpose
                                        </Button>{' '}
                                        <Button size="sm" color="secondary" onClick={removeEmptyRows}>
                                            Remove empty rows
                                        </Button>
                                    </div>
                                </>
                            )}

                            {!extractionSuccessful && (
                                <Alert color="danger" fade={false}>
                                    No table found in the specified region. Please select a different region
                                </Alert>
                            )}
                        </ModalBody>

                        {extractionSuccessful && (
                            <ModalFooter>
                                <Button color="primary" onClick={handleImportData}>
                                    Import data
                                </Button>
                            </ModalFooter>
                        )}
                    </>
                )}

                {importedData && (
                    <ModalBody>
                        The imported papers can be viewed in the following comparison: <br />
                        <Link to={comparisonUrl}>{comparisonUrl}</Link>
                    </ModalBody>
                )}
            </Modal>

            <ExtractReferencesModal
                clearImportError={clearImportError}
                isOpen={extractReferencesModalOpen}
                toggle={toggleExtractReferencesModal}
                id={props.id}
            />
        </>
    );
};

ExtractionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    pageNumber: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    region: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired
    })
};

export default ExtractionModal;
