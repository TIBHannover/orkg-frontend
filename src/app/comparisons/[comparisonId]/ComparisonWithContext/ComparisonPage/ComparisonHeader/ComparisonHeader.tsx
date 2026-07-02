import { faChevronRight, faEllipsisV, faExternalLinkAlt, faPen, faPlus, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Dropdown, Header, Label, Modal, Separator, toast } from '@heroui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import pluralize from 'pluralize';
import { useMemo, useState } from 'react';

import ColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/ColumnWidth/ColumnWidth';
import ExportCitation from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/ExportCitation';
import ExportToLatex from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/ExportToLatex';
import generatePdf from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/generatepdf';
import HistoryModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/HistoryModal/HistoryModal';
import useFullWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useFullWidth';
import useRdfExport from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useRdfExport';
import Publish from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Publish/Publish';
import QualityReportModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/QualityReportModal';
import WriteFeedbackModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/WriteFeedbackModal/WriteFeedbackModal';
import SelectEntities from '@/app/grid-editor/components/SelectEntities/SelectEntities';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Confirm from '@/components/Confirmation/Confirmation';
import Tooltip from '@/components/FloatingUI/Tooltip';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import AddPaperModal from '@/components/PaperForm/AddPaperModal';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ShareLinkMarker from '@/components/ShareLinkMarker/ShareLinkMarker';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import ComparisonAuthorsModel from '@/components/TopAuthors/ComparisonAuthorsModel';
import Container from '@/components/Ui/Structure/Container';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getComparisonTableCsv } from '@/services/backend/comparisons';

const ComparisonHeader = () => {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isOpenLatexModal, setIsOpenLatexModal] = useState(false);
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenVersionsModal, setIsOpenVersionsModal] = useState(false);
    const [isOpenExportCitationsModal, setIsOpenExportCitationsModal] = useState(false);
    const [isOpenTopAuthorsModal, setIsOpenTopAuthorsModal] = useState(false);
    const [isOpenQualityReportModal, setIsOpenQualityReportModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [isOpenFeedbackModal, setIsOpenFeedbackModal] = useState(false);
    const [isOpenColumnWidthModal, setIsOpenColumnWidthModal] = useState(false);
    const [isOpenSelectEntities, setIsOpenSelectEntities] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);

    const { comparison, isPublished, updateComparison, mutateComparisonContents, comparisonContents } = useComparison();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { generateRdfDataVocabularyFile } = useRdfExport();
    const numberOfSources = comparison?.sources.length ?? 0;
    const selectEntitiesInitial = useMemo(
        () => comparisonContents?.titles.map((title, i) => comparisonContents.subtitles[i] ?? title),
        [comparisonContents],
    );
    const { isFullWidth, toggleIsFullWidth } = useFullWidth({ sourceAmount: numberOfSources });
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleAddSources = async (sourceIds: string[]) => {
        if (!comparison) {
            return;
        }
        await updateComparison({
            sources: sourceIds.map((id) => ({ id, type: 'THING' as const })),
        });
        mutateComparisonContents(undefined, { revalidate: true });
    };

    const handleCreatePaper = ({ contributionId }: { contributionId: string }) => {
        if (!comparison) {
            return;
        }
        handleAddSources([...comparison.sources.map((source) => source.id), contributionId]);
        setIsOpenCreatePaper(false);
    };

    const handleExportCsv = ({ transposed = false }: { transposed?: boolean } = {}) => {
        if (!comparison?.id) return;
        const download = async () => {
            const csv = await getComparisonTableCsv(comparison.id, { transposed });
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const link = Object.assign(document.createElement('a'), { href: url, download: `${comparison.id} - ORKG Comparison.csv` });
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };
        toast.promise(download(), {
            loading: 'Preparing CSV...',
            success: 'CSV downloaded',
            error: 'An error occurred while exporting the CSV',
        });
    };

    const handleExportPdf = () => {
        toast.promise(generatePdf('comparisonTable'), {
            loading: 'Generating PDF, this may take a moment...',
            success: 'PDF downloaded',
            error: 'An error occurred while exporting the PDF',
        });
    };

    const handleOpenGridEditor = async () => {
        const isConfirmed = await Confirm({
            title: 'Open grid editor',
            message:
                'You are about the edit the sources displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG',
        });

        if (isConfirmed) {
            router.push(
                `${reverse(ROUTES.GRID_EDITOR)}?entityIds=${comparison?.sources.map((source) => source.id).join(',')}${
                    comparison?.id ? `&comparisonId=${comparison?.id}` : ''
                }`,
            );
        }
    };

    const publishedMessage = "Published comparisons cannot be customized, click 'Edit' to start editing";

    const handleEdit = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published comparison',
                message:
                    'The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again',
                proceedLabel: 'Fetch live data',
            });

            if (isConfirmed) {
                router.push(reverse(ROUTES.COMPARISON, { comparisonId: comparison?.versions.head.id }));
            }
        } else {
            toggleIsEditMode();
        }
    };

    if (!comparison) {
        return null;
    }

    return (
        <>
            <Breadcrumbs researchFieldId={comparison.research_fields?.[0] ? comparison.research_fields?.[0]?.id : null} />
            <TitleBar
                buttonGroup={
                    <>
                        {!isEditMode ? (
                            <RequireAuthentication component={Button} className="button--orkg-secondary shrink-0" onClick={handleEdit} size="sm">
                                <FontAwesomeIcon icon={faPen} className="mr-1" /> Edit
                            </RequireAuthentication>
                        ) : (
                            <>
                                <Button variant="primary" className="shrink-0" size="sm" onPress={() => setIsOpenSelectEntities(true)}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add source
                                </Button>
                                <Button className="button--orkg-secondary shrink-0" size="sm" onPress={() => setIsOpenPublishModal((v) => !v)}>
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button className="button--orkg-secondary shrink-0" size="sm" onPress={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}

                        <ShareLinkMarker
                            typeOfLink="comparison"
                            title={comparison.title}
                            buttonProps={{ className: 'button--orkg-secondary shrink-0' }}
                        />

                        <Dropdown isOpen={isOpenDropdown} onOpenChange={setIsOpenDropdown}>
                            <Button className="button--orkg-secondary shrink-0" size="sm">
                                <span className="mr-2">Actions</span> <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end" style={{ zIndex: '1031' }}>
                                <Dropdown.Menu
                                    onAction={(key) => {
                                        switch (key) {
                                            case 'grid-editor':
                                                handleOpenGridEditor();
                                                break;
                                            case 'export-latex':
                                                setIsOpenLatexModal((v) => !v);
                                                break;
                                            case 'export-pdf':
                                                handleExportPdf();
                                                break;
                                            case 'export-rdf':
                                                generateRdfDataVocabularyFile();
                                                break;
                                            case 'export-citation':
                                                setIsOpenExportCitationsModal((v) => !v);
                                                break;
                                            case 'history':
                                                setIsOpenVersionsModal((v) => !v);
                                                break;
                                            case 'quality-report':
                                                setIsOpenQualityReportModal(true);
                                                break;
                                            case 'top-authors':
                                                setIsOpenTopAuthorsModal(true);
                                                break;
                                            case 'view-graph':
                                                setIsOpenGraphViewModal(true);
                                                break;
                                            default:
                                                break;
                                        }
                                    }}
                                    disabledKeys={[
                                        ...(!isEditMode ? ['grid-editor'] : []),
                                        ...(comparison.versions.published.length < 1 ? ['history'] : []),
                                    ]}
                                >
                                    <Dropdown.SubmenuTrigger>
                                        <Dropdown.Item id="view-submenu" textValue="View">
                                            <Label>View</Label>
                                            <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} className="ml-auto" />
                                        </Dropdown.Item>
                                        <Dropdown.Popover>
                                            <Dropdown.Menu
                                                onAction={(key) => {
                                                    switch (key) {
                                                        case 'toggle-width':
                                                            toggleIsFullWidth();
                                                            break;
                                                        case 'column-width':
                                                            setIsOpenColumnWidthModal(true);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }}
                                            >
                                                <Dropdown.Item id="toggle-width" textValue={isFullWidth ? 'Reduced width' : 'Full width'}>
                                                    <Label>{isFullWidth ? 'Reduced width' : 'Full width'}</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="column-width" textValue="Column minimum width">
                                                    <Label>Column minimum width...</Label>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown.SubmenuTrigger>

                                    <Separator />

                                    <Dropdown.Section>
                                        <Header>Customize</Header>
                                        <Dropdown.Item id="grid-editor" textValue="Open grid editor">
                                            <Tooltip content={publishedMessage} disabled={isEditMode}>
                                                <Label>Open grid editor</Label>
                                            </Tooltip>
                                        </Dropdown.Item>
                                    </Dropdown.Section>

                                    <Separator />

                                    <Dropdown.Section>
                                        <Header>Export</Header>
                                        <Dropdown.Item id="export-latex" textValue="Export as LaTeX">
                                            <Label>Export as LaTeX</Label>
                                        </Dropdown.Item>
                                        <Dropdown.SubmenuTrigger>
                                            <Dropdown.Item id="export-csv-submenu" textValue="Export as CSV">
                                                <Label>Export as CSV</Label>
                                                <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} className="ml-auto" />
                                            </Dropdown.Item>
                                            <Dropdown.Popover>
                                                <Dropdown.Menu
                                                    onAction={(key) => {
                                                        switch (key) {
                                                            case 'export-csv-default':
                                                                handleExportCsv();
                                                                break;
                                                            case 'export-csv-transposed':
                                                                handleExportCsv({ transposed: true });
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                    }}
                                                >
                                                    <Dropdown.Item id="export-csv-default" textValue="Default">
                                                        <Label>Default</Label>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item id="export-csv-transposed" textValue="Transposed">
                                                        <Label>Transposed</Label>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown.SubmenuTrigger>
                                        <Dropdown.Item id="export-pdf" textValue="Export as PDF">
                                            <Label>Export as PDF</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="export-rdf" textValue="Export as RDF">
                                            <Label>Export as RDF</Label>
                                        </Dropdown.Item>
                                        {comparison.identifiers.doi?.[0] && (
                                            <Dropdown.Item id="export-citation" textValue="Export citation">
                                                <Label>Export citation</Label>
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item
                                            id="jupyter"
                                            textValue="Jupyter Notebook"
                                            href={`https://mybinder.org/v2/gl/TIBHannover%2Forkg%2Forkg-notebook-boilerplate/HEAD?urlpath=notebooks%2FComparison.ipynb%3Fcomparison_id%3D%22${comparison.id}%22%26autorun%3Dtrue`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Label>
                                                Jupyter Notebook <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                                            </Label>
                                        </Dropdown.Item>
                                    </Dropdown.Section>

                                    <Separator />

                                    <Dropdown.Section>
                                        <Header>Tools</Header>
                                        <Dropdown.Item id="history" textValue="History">
                                            <Tooltip
                                                disabled={comparison.versions.published.length > 0}
                                                content="There is no history available for this comparison"
                                            >
                                                <Label>History</Label>
                                            </Tooltip>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="quality-report" textValue="Quality report">
                                            <Label>Quality report</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="top-authors" textValue="Top authors">
                                            <Label>Top authors</Label>
                                        </Dropdown.Item>
                                    </Dropdown.Section>

                                    <Separator />

                                    <Dropdown.Item id="view-graph" textValue="View graph">
                                        <Label>View graph</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        id="view-resource"
                                        textValue="View resource"
                                        href={`${reverse(ROUTES.RESOURCE, { id: comparison.id })}?noRedirect`}
                                    >
                                        <Label>View resource</Label>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </>
                }
                titleAddition={numberOfSources > 1 && <SubTitle>{pluralize('contribution', numberOfSources, true)}</SubTitle>}
            >
                Comparison
            </TitleBar>
            {isPublished && comparison.id !== comparison.versions.published[0]?.id && (
                <Container className="mb-2">
                    <Alert status="warning" className="shadow">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Newer version available</Alert.Title>
                            <Alert.Description>A newer published version of this comparison exists.</Alert.Description>
                        </Alert.Content>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                render={(props) => (
                                    <Link
                                        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.versions.published[0]?.id })}
                                    />
                                )}
                            >
                                View latest
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                render={(props) => (
                                    <Link
                                        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={reverse(ROUTES.COMPARISON_DIFF, {
                                            oldId: comparison.id,
                                            newId: comparison.versions.published[0]?.id,
                                        })}
                                    />
                                )}
                            >
                                Compare to latest
                            </Button>
                        </div>
                    </Alert>
                </Container>
            )}
            {!isEditMode && !isPublished && (
                <Container className="mb-4">
                    <Alert status="warning" className="shadow">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Unpublished version</Alert.Title>
                            <Alert.Description>
                                You are viewing an unpublished version of this comparison. The content can be changed by anyone.{' '}
                                <Button size="sm" variant="primary" onPress={() => setIsOpenVersionsModal(true)}>
                                    View publish history
                                </Button>
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                </Container>
            )}
            {searchParams.get('requestFeedback') && (
                <Container className="mb-4">
                    <Alert status="accent">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Feedback requested</Alert.Title>
                            <Alert.Description>
                                You are requested to write a feedback about this comparison. Please have a look at the comparison and submit the
                                feedback.
                            </Alert.Description>
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                variant="primary"
                                className="mt-2 sm:hidden"
                                onClick={() => setIsOpenFeedbackModal(true)}
                            >
                                Submit feedback
                            </RequireAuthentication>
                        </Alert.Content>
                        <RequireAuthentication
                            component={Button}
                            size="sm"
                            variant="primary"
                            className="hidden sm:block"
                            onClick={() => setIsOpenFeedbackModal(true)}
                        >
                            Submit feedback
                        </RequireAuthentication>
                    </Alert>
                </Container>
            )}
            {isOpenVersionsModal && <HistoryModal comparisonId={comparison.id} toggle={() => setIsOpenVersionsModal((v) => !v)} />}
            {isOpenPublishModal && <Publish toggle={() => setIsOpenPublishModal((v) => !v)} />}
            {isOpenLatexModal && <ExportToLatex toggle={() => setIsOpenLatexModal((v) => !v)} />}
            {isOpenExportCitationsModal && (
                <ExportCitation toggle={() => setIsOpenExportCitationsModal((v) => !v)} DOI={comparison?.identifiers?.doi?.[0] ?? ''} />
            )}
            {isOpenTopAuthorsModal && <ComparisonAuthorsModel comparisonId={comparison.id} toggle={() => setIsOpenTopAuthorsModal((v) => !v)} />}
            {isOpenQualityReportModal && (
                <QualityReportModal toggle={() => setIsOpenQualityReportModal((v) => !v)} setIsOpenFeedbackModal={setIsOpenFeedbackModal} />
            )}
            {isOpenFeedbackModal && <WriteFeedbackModal toggle={() => setIsOpenFeedbackModal((v) => !v)} />}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={comparison?.id} />}
            {isOpenSelectEntities && (
                <SelectEntities
                    allowCreate
                    showDialog
                    toggle={() => setIsOpenSelectEntities((v) => !v)}
                    onCreatePaper={() => setIsOpenCreatePaper(true)}
                    entities={selectEntitiesInitial}
                    setEntityIds={handleAddSources}
                />
            )}
            {isOpenCreatePaper && <AddPaperModal isOpen onCreatePaper={handleCreatePaper} toggle={() => setIsOpenCreatePaper((v) => !v)} />}
            <Modal.Backdrop isOpen={isOpenColumnWidthModal} onOpenChange={setIsOpenColumnWidthModal}>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-sm">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Column width</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <ColumnWidth onApply={() => setIsOpenColumnWidthModal(false)} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
};

export default ComparisonHeader;
