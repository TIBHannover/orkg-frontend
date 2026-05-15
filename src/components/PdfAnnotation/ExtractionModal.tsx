import { faCheckCircle, faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HotTableRef } from '@handsontable/react-wrapper';
import { Alert, Button, Modal, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { AnchorHTMLAttributes, FC, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CSVImport from '@/app/csv-import/CSVImport';
import CopyId from '@/components/CopyId/CopyId';
import ExtractReferencesModal from '@/components/PdfAnnotation/ExtractReferencesModal';
import useExtractionModal from '@/components/PdfAnnotation/hooks/useExtractionModal';
import { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import ImportedPapers from '@/components/PdfAnnotation/ImportedPapers';
import SaveTableResourceModal from '@/components/PdfAnnotation/SaveTableResourceModal';
import TableEditor from '@/components/PdfAnnotation/TableEditor';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
            <Modal.Backdrop
                isOpen={!!annotation?.isExtractionModalOpen}
                onOpenChange={(open) => {
                    if (!open) toggle();
                }}
                isDismissable
            >
                <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                    <Modal.Dialog className="max-w-[80%]">
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading className="flex items-center gap-2">
                                Table extraction{' '}
                                {annotation?.type === SURVEY_TABLES_IRI && (
                                    <Tooltip>
                                        <Tooltip.Trigger className="inline-flex">
                                            <a
                                                href="https://www.orkg.org/help-center/article/7/Extracting_and_importing_tables_from_survey_articles"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Help: extracting tables from survey articles"
                                            >
                                                <FontAwesomeIcon icon={faQuestionCircle} className="text-[18px] leading-none" />
                                            </a>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>
                                            Help: extracting and importing tables from survey articles (opens in a new tab)
                                        </Tooltip.Content>
                                    </Tooltip>
                                )}
                            </Modal.Heading>
                        </Modal.Header>

                        {isLoading && (
                            <Modal.Body>
                                <div className="text-center text-[40px]">
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                </div>
                            </Modal.Body>
                        )}

                        {!isLoading && (
                            <>
                                <Modal.Body className="p-0">
                                    {annotation?.view === 'extraction' && extractionSuccessful && (
                                        <div className="p-2 w-full">
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
                                    )}
                                    {annotation?.view === 'extraction' && !extractionSuccessful && (
                                        <div className="p-4">
                                            <Alert className="bg-danger/10 text-danger">
                                                <Alert.Indicator />
                                                <Alert.Content>
                                                    <Alert.Description>
                                                        No table found in the specified region. Please select a different region
                                                    </Alert.Description>
                                                </Alert.Content>
                                            </Alert>
                                        </div>
                                    )}
                                    {annotation?.view === 'validation' && (
                                        <div className="p-2 w-full">
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
                                    )}
                                    {annotation?.view === 'done' && (
                                        <div className="p-5 w-full">
                                            {annotation?.type === SURVEY_TABLES_IRI && (
                                                <>
                                                    <h4 className="text-base font-semibold">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-success" /> Imported papers
                                                    </h4>
                                                    <ImportedPapers annotationId={id} />
                                                </>
                                            )}
                                            {annotation?.type !== SURVEY_TABLES_IRI && annotation?.tableId && (
                                                <>
                                                    <h4 className="text-base font-semibold">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-success" /> Imported table
                                                    </h4>

                                                    {annotation?.tableLabel && <p>{`Label: ${annotation?.tableLabel}`}</p>}
                                                    <div className="w-2/5 my-5">
                                                        <CopyId id={annotation?.tableId ?? ''} text="Table ID" size="lg" />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        className="mt-4"
                                                        render={(props) => (
                                                            <Link
                                                                {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                                                href={reverse(ROUTES.RESOURCE_TABS, {
                                                                    id: annotation?.tableId,
                                                                    activeTab: 'preview',
                                                                })}
                                                                target="_blank"
                                                            />
                                                        )}
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
                                </Modal.Body>

                                {extractionSuccessful && (
                                    <Modal.Footer>
                                        <Button variant="secondary" onPress={toggle}>
                                            Close
                                        </Button>
                                        {annotation?.type === SURVEY_TABLES_IRI && annotation?.view === 'extraction' && (
                                            <Button variant="primary" onPress={() => dispatch(setAnnotationView({ id, view: 'validation' }))}>
                                                Validate table
                                            </Button>
                                        )}
                                        {annotation?.type === CSVW_TABLE_IRI && annotation?.view === 'extraction' && (
                                            <Button variant="primary" onPress={() => setSaveTableResourceModalOpen(true)}>
                                                Save as resource
                                            </Button>
                                        )}
                                        {annotation?.view === 'validation' && (
                                            <Button variant="secondary" onPress={() => dispatch(setAnnotationView({ id, view: 'extraction' }))}>
                                                Back to extracted table
                                            </Button>
                                        )}
                                    </Modal.Footer>
                                )}
                            </>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
            <ExtractReferencesModal isOpen={extractReferencesModalOpen} toggle={toggleExtractReferencesModal} id={id} />
        </>
    );
};

export default ExtractionModal;
