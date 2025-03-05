import { faChevronRight, faEllipsisV, faExternalLinkAlt, faPen, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ExactMatch from 'assets/img/comparison-exact-match.svg';
import IntelligentMerge from 'assets/img/comparison-intelligent-merge.svg';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ColumnWidth from 'components/Comparison/ComparisonHeader/ColumnWidth';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import ExportToLatex from 'components/Comparison/Export/ExportToLatex';
import GeneratePdf from 'components/Comparison/Export/GeneratePdf';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import Publish from 'components/Comparison/Publish/Publish';
import QualityReportModal from 'components/Comparison/QualityReportModal/QualityReportModal';
import WriteFeedbackModal from 'components/Comparison/QualityReportModal/WriteFeedbackModal/WriteFeedbackModal';
import SelectProperties from 'components/Comparison/SelectProperties';
import { activatedContributionsToList, generateRdfDataVocabularyFile } from 'components/Comparison/hooks/helpers';
import useComparison from 'components/Comparison/hooks/useComparison';
import { ComparisonTypeButton } from 'components/Comparison/styled';
import Confirm from 'components/Confirmation/Confirmation';
import GraphViewModal from 'components/GraphView/GraphViewModal';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import ComparisonAuthorsModel from 'components/TopAuthors/ComparisonAuthorsModel';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { SubTitle } from 'components/styled';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import pluralize from 'pluralize';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { CSVLink } from 'react-csv';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { getMatrixOfComparison, setConfigurationAttribute, setIsOpenFeedbackModal } from 'slices/comparisonSlice';

const ComparisonHeaderMenu = () => {
    const dispatch = useDispatch();
    const { comparison, isPublished, updateComparison } = useComparison();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const data = useSelector((state) => state.comparison.data);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const matrixData = useSelector((state) => getMatrixOfComparison(state.comparison));
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const contributions = useSelector((state) => state.comparison.contributions.filter((c) => c.active));
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const properties = useSelector((state) => state.comparison.properties.filter((c) => c.active));
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const isFailedLoadingMetadata = useSelector((state) => state.comparison.isFailedLoadingMetadata);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const isOpenFeedbackModal = useSelector((state) => state.comparison.isOpenFeedbackModal);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const viewDensity = useSelector((state) => state.comparison.configuration.viewDensity);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const comparisonType = useSelector((state) => state.comparison.configuration.comparisonType);
    // const responseHash = useSelector((state) => state.comparison.configuration.responseHash);
    // @ts-expect-error awaiting refactoring where data is moved out of redux store
    const contributionsList = useSelector((state) => activatedContributionsToList(state.comparison.contributions));

    const [cookies, setCookie] = useCookies();
    const fullWidth = cookies.useFullWidthForComparisonTable ?? contributionsList.length > 3;

    const router = useRouter();
    const searchParams = useSearchParams();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownDensityOpen, setDropdownDensityOpen] = useState(false);
    const [dropdownMethodOpen, setDropdownMethodOpen] = useState(false);

    const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
    const [showLatexDialog, setShowLatexDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [isVisibleVersionsModal, setIsVisibleVersionsModal] = useState(false);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [isOpenTopAuthorsModal, setIsOpenTopAuthorsModal] = useState(false);
    const [isOpenQualityReportModal, setIsOpenQualityReportModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);

    const handleFullWidth = () => {
        setCookie('useFullWidthForComparisonTable', !fullWidth, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
    };

    const handleTranspose = () => {
        if (!isEditMode) {
            dispatch(setConfigurationAttribute({ attribute: 'transpose', value: !transpose }));
            return;
        }
        if (!comparison) {
            return;
        }
        updateComparison({
            config: {
                ...comparison.config,
                transpose: !comparison?.config.transpose,
            },
        });
    };

    const handleViewDensity = (density: 'spacious' | 'normal' | 'compact') => {
        setCookie('viewDensityComparisonTable', density, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        dispatch(setConfigurationAttribute({ attribute: 'viewDensity', value: density }));
    };

    const handleEditContributions = async () => {
        const isConfirmed = await Confirm({
            title: 'Edit contribution data',
            message:
                'You are about the edit the contributions displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG',
        });

        if (isConfirmed) {
            router.push(
                `${reverse(ROUTES.CONTRIBUTION_EDITOR)}?contributions=${contributionsList.join(',')}${
                    comparison?.id ? `&comparisonId=${comparison?.id}` : ''
                }`,
            );
        }
    };

    const handleChangeType = (type: 'MERGE' | 'PATH') => {
        setDropdownMethodOpen(false);
        if (!comparison) {
            return;
        }
        updateComparison({
            config: {
                ...comparison.config,
                type,
            },
        });
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
                                <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setShowPublishDialog((v) => !v)}>
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button active color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}

                        <Dropdown group isOpen={dropdownOpen} toggle={() => setDropdownOpen((v) => !v)}>
                            <DropdownToggle color="secondary" size="sm" className="rounded-end">
                                <span className="me-2">Actions</span> <FontAwesomeIcon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end="true" style={{ zIndex: '1031' }}>
                                <Dropdown isOpen={dropdownDensityOpen} toggle={() => setDropdownDensityOpen((v) => !v)} direction="start">
                                    <DropdownToggle className="dropdown-item pe-auto" tag="div" style={{ cursor: 'pointer' }}>
                                        View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={handleFullWidth}>
                                            <span className="me-2">{fullWidth ? 'Reduced width' : 'Full width'}</span>
                                        </DropdownItem>
                                        <DropdownItem onClick={handleTranspose}>Transpose table</DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem header>View density</DropdownItem>
                                        <DropdownItem active={viewDensity === 'spacious'} onClick={() => handleViewDensity('spacious')}>
                                            Spacious
                                        </DropdownItem>
                                        <DropdownItem active={viewDensity === 'normal'} onClick={() => handleViewDensity('normal')}>
                                            Normal
                                        </DropdownItem>
                                        <DropdownItem active={viewDensity === 'compact'} onClick={() => handleViewDensity('compact')}>
                                            Compact
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <ColumnWidth />
                                    </DropdownMenu>
                                </Dropdown>
                                <DropdownItem divider />
                                <DropdownItem header>Customize</DropdownItem>
                                <Tippy disabled={isEditMode} content={publishedMessage}>
                                    <span>
                                        <DropdownItem onClick={() => setShowPropertiesDialog((v) => !v)} disabled={!isEditMode}>
                                            Select properties
                                        </DropdownItem>
                                    </span>
                                </Tippy>
                                <Tippy disabled={isEditMode} content={publishedMessage}>
                                    <span>
                                        <Dropdown isOpen={dropdownMethodOpen} toggle={() => setDropdownMethodOpen((v) => !v)} direction="end">
                                            <DropdownToggle
                                                tag="div"
                                                className={`dropdown-item d-flex ${!isEditMode ? 'disabled' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                disabled={!isEditMode}
                                            >
                                                Comparison method <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <div className="d-flex px-2">
                                                    <ComparisonTypeButton
                                                        color="link"
                                                        className="p-0 m-1"
                                                        onClick={() => handleChangeType('MERGE')}
                                                        active={comparisonType !== 'PATH'}
                                                    >
                                                        <Image src={IntelligentMerge} alt="Intelligent merge example" />
                                                    </ComparisonTypeButton>

                                                    <ComparisonTypeButton
                                                        color="link"
                                                        className="p-0 m-1"
                                                        onClick={() => handleChangeType('PATH')}
                                                        active={comparisonType === 'PATH'}
                                                    >
                                                        <Image src={ExactMatch} alt="Exact match example" />
                                                    </ComparisonTypeButton>
                                                </div>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </span>
                                </Tippy>

                                <Tippy disabled={isEditMode} content={publishedMessage}>
                                    <span>
                                        <DropdownItem onClick={handleEditContributions} disabled={!isEditMode}>
                                            Edit contributions
                                        </DropdownItem>
                                    </span>
                                </Tippy>

                                <DropdownItem divider />
                                <DropdownItem header>Export</DropdownItem>
                                <DropdownItem onClick={() => setShowLatexDialog((v) => !v)}>Export as LaTeX</DropdownItem>
                                {matrixData && (
                                    <CSVLink
                                        data={matrixData}
                                        filename="ORKG Contribution Comparison.csv"
                                        className="dropdown-item"
                                        target="_blank"
                                        onClick={() => setDropdownOpen((v) => !v)}
                                    >
                                        Export as CSV
                                    </CSVLink>
                                )}
                                <GeneratePdf id="comparisonTable" />
                                <DropdownItem
                                    onClick={() =>
                                        generateRdfDataVocabularyFile(
                                            data,
                                            contributions,
                                            properties,
                                            comparison.id
                                                ? {
                                                      title: comparison.title,
                                                      description: comparison.description,
                                                      creator: comparison.created_by,
                                                      date: comparison.created_at,
                                                  }
                                                : { title: '', description: '', creator: '', date: '' },
                                        )
                                    }
                                >
                                    Export as RDF
                                </DropdownItem>
                                {comparison.identifiers.doi?.[0] && (
                                    <DropdownItem onClick={() => setShowExportCitationsDialog((v) => !v)}>Export citation</DropdownItem>
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
                                <Tippy
                                    disabled={comparison.versions.published.length > 0}
                                    content="There is no history available for this comparison"
                                >
                                    <span>
                                        <DropdownItem
                                            onClick={() => setIsVisibleVersionsModal((v) => !v)}
                                            disabled={comparison.versions.published.length < 1}
                                        >
                                            <span className="me-2">History</span>
                                        </DropdownItem>
                                    </span>
                                </Tippy>
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
                titleAddition={
                    !isFailedLoadingMetadata &&
                    contributionsList.length > 1 && <SubTitle>{pluralize('contribution', contributionsList.length, true)}</SubTitle>
                }
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
                    <Button color="link" className="p-0" onClick={() => setIsVisibleVersionsModal(true)}>
                        View publish history
                    </Button>
                </Alert>
            )}

            {searchParams.get('requestFeedback') && (
                <Alert color="info" className="container d-flex box-shadow align-items-center border-0">
                    <span>
                        You are requested to write a feedback about this comparison. Please have a look at the comparison and submit the feedback.
                    </span>
                    <RequireAuthentication
                        component={Button}
                        size="sm"
                        color="primary"
                        className="ms-2"
                        onClick={() => dispatch(setIsOpenFeedbackModal(true))}
                    >
                        Submit feedback
                    </RequireAuthentication>
                </Alert>
            )}
            {isVisibleVersionsModal && <HistoryModal comparisonId={comparison.id} toggle={() => setIsVisibleVersionsModal((v) => !v)} />}
            {showPublishDialog && <Publish toggle={() => setShowPublishDialog((v) => !v)} />}

            {showLatexDialog && <ExportToLatex toggle={() => setShowLatexDialog((v) => !v)} />}
            {showExportCitationsDialog && (
                <ExportCitation toggle={() => setShowExportCitationsDialog((v) => !v)} DOI={comparison?.identifiers?.doi?.[0] ?? ''} />
            )}
            {showPropertiesDialog && <SelectProperties togglePropertiesDialog={() => setShowPropertiesDialog((v) => !v)} />}
            {isOpenTopAuthorsModal && <ComparisonAuthorsModel comparisonId={comparison.id} toggle={() => setIsOpenTopAuthorsModal((v) => !v)} />}
            {isOpenQualityReportModal && <QualityReportModal toggle={() => setIsOpenQualityReportModal((v) => !v)} />}
            {isOpenFeedbackModal && <WriteFeedbackModal toggle={() => dispatch(setIsOpenFeedbackModal(!isOpenFeedbackModal))} />}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={comparison?.id} />}
        </>
    );
};

export default ComparisonHeaderMenu;
