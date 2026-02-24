import { faChevronRight, faEllipsisV, faExternalLinkAlt, faPen, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import pluralize from 'pluralize';
import { useState } from 'react';

import ColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/ColumnWidth/ColumnWidth';
import ExportCitation from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/ExportCitation';
import ExportToLatex from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/ExportToLatex';
import GeneratePdf from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/GeneratePdf';
import generateMatrix from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/helpers/generateMatrix';
import HistoryModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/HistoryModal/HistoryModal';
import useFullWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useFullWidth';
import useRdfExport from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useRdfExport';
import Publish from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Publish/Publish';
import QualityReportModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/QualityReportModal';
import WriteFeedbackModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/WriteFeedbackModal/WriteFeedbackModal';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import useComparisonExport from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Confirm from '@/components/Confirmation/Confirmation';
import Tooltip from '@/components/FloatingUI/Tooltip';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import ComparisonAuthorsModel from '@/components/TopAuthors/ComparisonAuthorsModel';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Dropdown from '@/components/Ui/Dropdown/Dropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';

const ComparisonHeader = () => {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isOpenViewDropdown, setIsOpenViewDropdown] = useState(false);
    const [isOpenLatexModal, setIsOpenLatexModal] = useState(false);
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenVersionsModal, setIsOpenVersionsModal] = useState(false);
    const [isOpenExportCitationsModal, setIsOpenExportCitationsModal] = useState(false);
    const [isOpenTopAuthorsModal, setIsOpenTopAuthorsModal] = useState(false);
    const [isOpenQualityReportModal, setIsOpenQualityReportModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [isOpenFeedbackModal, setIsOpenFeedbackModal] = useState(false);

    const { comparison, isPublished, selectedPathsFlattened } = useComparison();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { table, columns } = useComparisonExport();
    const { generateRdfDataVocabularyFile } = useRdfExport();
    const numberOfSources = comparison?.sources.length ?? 0;
    const { isFullWidth, toggleIsFullWidth } = useFullWidth({ sourceAmount: numberOfSources });
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleExportCsv = () => {
        setIsOpenDropdown((v) => !v);
        const matrixData = generateMatrix({ table, columns, predicates: selectedPathsFlattened });
        const csv = Papa.unparse(matrixData);
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvData);
        const link = document.createElement('a');
        link.href = csvUrl;
        link.setAttribute('download', comparison?.id ? `${comparison.id} - ORKG Comparison.csv` : 'ORKG Comparison.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                            <RequireAuthentication component={Button} color="secondary" onClick={handleEdit} size="sm" style={{ marginRight: 2 }}>
                                <FontAwesomeIcon icon={faPen} className="me-1" /> Edit
                            </RequireAuthentication>
                        ) : (
                            <>
                                <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenPublishModal((v) => !v)}>
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button active color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}

                        <Dropdown group isOpen={isOpenDropdown} toggle={() => setIsOpenDropdown((v) => !v)}>
                            <DropdownToggle color="secondary" size="sm" className="rounded-end">
                                <span className="me-2">Actions</span> <FontAwesomeIcon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end="true" style={{ zIndex: '1031' }}>
                                <Dropdown isOpen={isOpenViewDropdown} toggle={() => setIsOpenViewDropdown((v) => !v)} direction="start">
                                    <DropdownToggle className="dropdown-item pe-auto" tag="div" style={{ cursor: 'pointer' }}>
                                        View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={toggleIsFullWidth}>
                                            <span className="me-2">{isFullWidth ? 'Reduced width' : 'Full width'}</span>
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <ColumnWidth />
                                    </DropdownMenu>
                                </Dropdown>
                                <DropdownItem divider />
                                <DropdownItem header>Customize</DropdownItem>
                                <Tooltip content={publishedMessage} disabled={isEditMode}>
                                    <span>
                                        <DropdownItem onClick={handleOpenGridEditor} disabled={!isEditMode}>
                                            Open grid editor
                                        </DropdownItem>
                                    </span>
                                </Tooltip>

                                <DropdownItem divider />
                                <DropdownItem header>Export</DropdownItem>
                                <DropdownItem onClick={() => setIsOpenLatexModal((v) => !v)}>Export as LaTeX</DropdownItem>
                                <DropdownItem onClick={handleExportCsv}>Export as CSV</DropdownItem>
                                <GeneratePdf id="comparisonTable" />
                                <DropdownItem onClick={() => generateRdfDataVocabularyFile()}>Export as RDF</DropdownItem>
                                {comparison.identifiers.doi?.[0] && (
                                    <DropdownItem onClick={() => setIsOpenExportCitationsModal((v) => !v)}>Export citation</DropdownItem>
                                )}
                                <DropdownItem
                                    tag="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://mybinder.org/v2/gl/TIBHannover%2Forkg%2Forkg-notebook-boilerplate/HEAD?urlpath=notebooks%2FComparison.ipynb%3Fcomparison_id%3D%22${comparison.id}%22%26autorun%3Dtrue`}
                                >
                                    Jupyter Notebook <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Tools</DropdownItem>
                                <Tooltip
                                    disabled={comparison.versions.published.length > 0}
                                    content="There is no history available for this comparison"
                                >
                                    <span>
                                        <DropdownItem
                                            onClick={() => setIsOpenVersionsModal((v) => !v)}
                                            disabled={comparison.versions.published.length < 1}
                                        >
                                            <span className="me-2">History</span>
                                        </DropdownItem>
                                    </span>
                                </Tooltip>
                                <DropdownItem onClick={() => setIsOpenQualityReportModal(true)}>Quality report</DropdownItem>
                                <DropdownItem onClick={() => setIsOpenTopAuthorsModal(true)}>Top authors</DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                <DropdownItem tag={Link} href={`${reverse(ROUTES.RESOURCE, { id: comparison.id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </>
                }
                titleAddition={numberOfSources > 1 && <SubTitle>{pluralize('contribution', numberOfSources, true)}</SubTitle>}
            >
                Comparison
            </TitleBar>

            {isPublished && comparison.id !== comparison.versions.published[0]?.id && (
                <Alert color="warning" fade={false} className="container box-shadow">
                    Warning: a newer version of this comparison is available.{' '}
                    <Link href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.versions.published[0]?.id })}>View latest version</Link> or{' '}
                    <Link href={reverse(ROUTES.COMPARISON_DIFF, { oldId: comparison.id, newId: comparison.versions.published[0]?.id })}>
                        compare to latest version
                    </Link>
                    .
                </Alert>
            )}

            {!isEditMode && !isPublished && (
                <Alert color="warning" fade={false} className="container box-shadow border-0">
                    Warning: you are viewing an unpublished version of this comparison. The content can be changed by anyone.{' '}
                    <Button color="link" className="p-0" onClick={() => setIsOpenVersionsModal(true)}>
                        View publish history
                    </Button>
                </Alert>
            )}

            {searchParams.get('requestFeedback') && (
                <Alert color="info" className="container d-flex box-shadow align-items-center border-0">
                    <span>
                        You are requested to write a feedback about this comparison. Please have a look at the comparison and submit the feedback.
                    </span>
                    <RequireAuthentication component={Button} size="sm" color="primary" className="ms-2" onClick={() => setIsOpenFeedbackModal(true)}>
                        Submit feedback
                    </RequireAuthentication>
                </Alert>
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
        </>
    );
};

export default ComparisonHeader;
