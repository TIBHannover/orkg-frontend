import { faCheckCircle, faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HotTableRef } from '@handsontable/react-wrapper';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CSVImport from '@/app/csv-import/CSVImport';
import CopyId from '@/components/CopyId/CopyId';
import ExtractReferencesModal from '@/components/PdfAnnotation/ExtractReferencesModal';
import useExtractionModal from '@/components/PdfAnnotation/hooks/useExtractionModal';
import { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import ImportedPapers from '@/components/PdfAnnotation/ImportedPapers';
import SaveTableResourceModal from '@/components/PdfAnnotation/SaveTableResourceModal';
import TableEditor from '@/components/PdfAnnotation/TableEditor';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import ROUTES from '@/constants/routes';
import { setAnnotationImportedPapers, setAnnotationView, setTableData, updateAnnotationIsExtractionModalOpen } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

type ExtractionModalProps = {
    id: string;
};

const ExtractionModal: FC<ExtractionModalProps> = ({ id }) => {
    const annotation = useSelector((state: RootStore) => state.pdfAnnotation.annotations.find((an) => an.id === id));
    const tableData = useSelector((state: RootStore) => state.pdfAnnotation.tableData[id]);
    const dispatch = useDispatch();
    const hotTableComponentRef = useRef<HotTableRef>(null!);
    const { isLoading, extractionSuccessful, handleCsvDownload } = useExtractionModal({ id, hotTableComponentRef });
    const [saveTableResourceModalOpen, setSaveTableResourceModalOpen] = useState(false);
    const [extractReferencesModalOpen, setExtractReferencesModalOpen] = useState(false);
    const toggleExtractReferencesModal = () => {
        setExtractReferencesModalOpen(!extractReferencesModalOpen);
    };

    const toggle = () => {
        dispatch(updateAnnotationIsExtractionModalOpen({ id, isExtractionModalOpen: !annotation?.isExtractionModalOpen }));
    };

    const csvInitialData = tableData ? tableData.map((row) => row.map((cell) => cell ?? '')) : [];

    return (
        <>
            <Modal isOpen={annotation?.isExtractionModalOpen} toggle={toggle} size="xl" style={{ maxWidth: '80%' }}>
                <ModalHeader toggle={toggle}>
                    Table extraction{' '}
                    {annotation?.type === SURVEY_TABLES_IRI && (
                        <a
                            href="https://www.orkg.org/help-center/article/7/Extracting_and_importing_tables_from_survey_articles"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: 18, lineHeight: 1 }} className="p-0" />
                        </a>
                    )}
                </ModalHeader>

                {isLoading && (
                    <ModalBody>
                        <div className="text-center" style={{ fontSize: 40 }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    </ModalBody>
                )}

                {!isLoading && (
                    <>
                        <ModalBody style={{ padding: '0' }}>
                            {annotation?.view === 'extraction' && extractionSuccessful && (
                                <div>
                                    <div className="tw:p-2 tw:w-full">
                                        {tableData && (
                                            <TableEditor
                                                hotTableComponentRef={hotTableComponentRef}
                                                id={id}
                                                tableData={tableData}
                                                toggleExtractReferencesModal={toggleExtractReferencesModal}
                                                handleCsvDownload={handleCsvDownload}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                            {annotation?.view === 'extraction' && !extractionSuccessful && (
                                <Alert color="danger" fade={false}>
                                    No table found in the specified region. Please select a different region
                                </Alert>
                            )}
                            {annotation?.view === 'validation' && (
                                <div>
                                    <div className="tw:p-2 tw:w-full">
                                        <CSVImport
                                            showUploadForm={false}
                                            data={csvInitialData}
                                            setData={(newData) => dispatch(setTableData({ id, tableData: newData }))}
                                            onFinish={(papers, contributions) => {
                                                dispatch(setAnnotationImportedPapers({ id, papers, contributions }));
                                                dispatch(setAnnotationView({ id, view: 'done' }));
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {annotation?.view === 'done' && (
                                <div className="tw:p-5 tw:w-full">
                                    {annotation?.type === SURVEY_TABLES_IRI && (
                                        <>
                                            <h4>
                                                <FontAwesomeIcon icon={faCheckCircle} color="green" /> Imported papers
                                            </h4>
                                            <ImportedPapers annotationId={id} />
                                        </>
                                    )}
                                    {annotation?.type !== SURVEY_TABLES_IRI && annotation?.tableId && (
                                        <>
                                            <h4>
                                                <FontAwesomeIcon icon={faCheckCircle} color="green" /> Imported table
                                            </h4>

                                            {annotation?.tableLabel && <p>{`Label: ${annotation?.tableLabel}`}</p>}
                                            <div className="tw:w-2/5 tw:my-5">
                                                <CopyId id={annotation?.tableId ?? ''} text="Table ID" size="lg" />
                                            </div>
                                            <Button
                                                size="sm"
                                                tag={Link}
                                                href={reverse(ROUTES.RESOURCE_TABS, { id: annotation?.tableId, activeTab: 'preview' })}
                                                target="_blank"
                                                color="primary"
                                                className="mt-3"
                                            >
                                                View table
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                            <SaveTableResourceModal
                                isOpen={saveTableResourceModalOpen}
                                toggle={() => setSaveTableResourceModalOpen(!saveTableResourceModalOpen)}
                                id={id}
                            />
                        </ModalBody>

                        {extractionSuccessful && (
                            <ModalFooter>
                                <Button color="secondary" onClick={toggle}>
                                    Close
                                </Button>
                                {annotation?.type === SURVEY_TABLES_IRI && annotation?.view === 'extraction' && (
                                    <Button color="primary" onClick={() => dispatch(setAnnotationView({ id, view: 'validation' }))}>
                                        Validate table
                                    </Button>
                                )}
                                {annotation?.type === CSVW_TABLE_IRI && annotation?.view === 'extraction' && (
                                    <Button color="primary" onClick={() => setSaveTableResourceModalOpen(true)}>
                                        Save as resource
                                    </Button>
                                )}
                                {annotation?.view === 'validation' && (
                                    <Button color="secondary" onClick={() => dispatch(setAnnotationView({ id, view: 'extraction' }))}>
                                        Back to extracted table
                                    </Button>
                                )}
                            </ModalFooter>
                        )}
                    </>
                )}
            </Modal>
            <ExtractReferencesModal isOpen={extractReferencesModalOpen} toggle={toggleExtractReferencesModal} id={id} />
        </>
    );
};

export default ExtractionModal;
