import { faChartBar, faChevronRight, faEllipsisV, faExternalLinkAlt, faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ExactMatch from 'assets/img/comparison-exact-match.svg';
import IntelligentMerge from 'assets/img/comparison-intelligent-merge.svg';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import ExportToLatex from 'components/Comparison/Export/ExportToLatex';
import GeneratePdf from 'components/Comparison/Export/GeneratePdf';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import NewerVersionWarning from 'components/Comparison/HistoryModal/NewerVersionWarning';
import Publish from 'components/Comparison/Publish/Publish';
import QualityReportModal from 'components/Comparison/QualityReportModal/QualityReportModal';
import WriteFeedback from 'components/Comparison/QualityReportModal/WriteFeedback';
import SaveDraft from 'components/Comparison/SaveDraft/SaveDraft';
import SelectProperties from 'components/Comparison/SelectProperties';
import { activatedContributionsToList, generateRdfDataVocabularyFile } from 'components/Comparison/hooks/helpers';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import { ComparisonTypeButton } from 'components/Comparison/styled';
import Confirm from 'components/Confirmation/Confirmation';
import GraphViewModal from 'components/GraphView/GraphViewModal';
import Image from 'next/image';
import Link from 'next/link';
import { env } from 'next-runtime-env';
import { useRouter, useSearchParams } from 'next/navigation';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import ComparisonAuthorsModel from 'components/TopAuthors/ComparisonAuthorsModel';
import { SubTitle } from 'components/styled';
import ROUTES from 'constants/routes';
import AddVisualizationModal from 'libs/selfVisModel/ComparisonComponents/AddVisualizationModal';
import { uniq, without } from 'lodash';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { CSVLink } from 'react-csv';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { openAuthDialog } from 'slices/authSlice';
import {
    getMatrixOfComparison,
    setConfigurationAttribute,
    setIsEditing,
    setIsOpenFeedbackModal,
    setIsOpenVisualizationModal,
    setUseReconstructedDataInVisualization,
} from 'slices/comparisonSlice';
import ColumnWidth from 'components/Comparison/ComparisonHeader/ColumnWidth';

const ComparisonHeaderMenu = (props) => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.comparison.data);
    const matrixData = useSelector((state) => getMatrixOfComparison(state.comparison));
    const contributions = useSelector((state) => state.comparison.contributions.filter((c) => c.active));
    const properties = useSelector((state) => state.comparison.properties.filter((c) => c.active));
    const comparisonResource = useSelector((state) => state.comparison.comparisonResource);
    const isFailedLoadingMetadata = useSelector((state) => state.comparison.isFailedLoadingMetadata);
    const isLoadingResult = useSelector((state) => state.comparison.isLoadingResult);
    const isFailedLoadingResult = useSelector((state) => state.comparison.isFailedLoadingResult);
    const isOpenVisualizationModal = useSelector((state) => state.comparison.isOpenVisualizationModal);
    const isOpenFeedbackModal = useSelector((state) => state.comparison.isOpenFeedbackModal);
    const fullWidth = useSelector((state) => state.comparison.configuration.fullWidth);
    const viewDensity = useSelector((state) => state.comparison.configuration.viewDensity);
    const comparisonType = useSelector((state) => state.comparison.configuration.comparisonType);
    const responseHash = useSelector((state) => state.comparison.configuration.responseHash);
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const isEditing = useSelector((state) => state.comparison.isEditing);
    const contributionsList = useSelector((state) => activatedContributionsToList(state.comparison.contributions));

    const [, setCookie] = useCookies();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownDensityOpen, setDropdownDensityOpen] = useState(false);
    const [dropdownMethodOpen, setDropdownMethodOpen] = useState(false);

    const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
    const [showLatexDialog, setShowLatexDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
    const [showAddContribution, setShowAddContribution] = useState(false);
    const [showComparisonVersions, setShowComparisonVersions] = useState(false);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [isOpenTopAuthorsModal, setIsOpenTopAuthorsModal] = useState(false);
    const [isOpenQualityReportModal, setIsOpenQualityReportModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);

    const user = useSelector((state) => state.auth.user);

    const handleFullWidth = () => {
        setCookie('useFullWidthForComparisonTable', !fullWidth, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        dispatch(setConfigurationAttribute({ attribute: 'fullWidth', value: !fullWidth }));
    };

    /**
     * Toggle transpose option
     *
     */
    const handleTranspose = () => {
        dispatch(setConfigurationAttribute({ attribute: 'transpose', value: !transpose }));
    };

    const handleViewDensity = (density) => {
        setCookie('viewDensityComparisonTable', density, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        dispatch(setConfigurationAttribute({ attribute: 'viewDensity', value: density }));
    };

    const showConfirmDialog = () =>
        Confirm({
            title: 'This is a published comparison',
            message:
                'The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again',
            cancelColor: 'light',
            confirmText: 'Fetch live data',
        });

    const handleEditContributions = async () => {
        const isConfirmed = await Confirm({
            title: 'Edit contribution data',
            message:
                'You are about the edit the contributions displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG',
            cancelColor: 'light',
            confirmText: 'Continue',
        });

        if (isConfirmed) {
            router.push(
                `${reverse(ROUTES.CONTRIBUTION_EDITOR)}?contributions=${contributionsList.join(',')}${
                    comparisonResource?.hasPreviousVersion ? `&hasPreviousVersion=${comparisonResource?.hasPreviousVersion.id}` : ''
                }`,
            );
        }
    };

    const handleChangeType = (type) => {
        setDropdownMethodOpen(false);
        props.navigateToNewURL({ _comparisonType: type });
    };

    const { versions, isLoadingVersions, hasNextVersion, loadVersions } = useComparisonVersions({ comparisonId: comparisonResource.id });

    /**
     * Add contributions
     *
     * @param {Array[String]} newContributionIds Contribution ids to add
     */
    const addContributions = (newContributionIds) => {
        const contributionsIDs = without(uniq(contributionsList.concat(newContributionIds)), undefined, null, '') ?? [];
        props.navigateToNewURL({ _contributionsList: contributionsIDs });
    };

    useEffect(() => {
        if (comparisonResource.id) {
            loadVersions(comparisonResource.id);
        }
    }, [comparisonResource.id, loadVersions]);

    const isPublished = !!comparisonResource?.id || searchParams.get('noResource');
    const publishedMessage = "Published comparisons cannot be edited, click 'Fetch live data' to reload the live comparison data";

    const handleAddContribution = async () => {
        if (isPublished) {
            if (await showConfirmDialog()) {
                props.navigateToNewURL({});
            }
            return;
        }
        setShowAddContribution((v) => !v);
    };

    const handleEdit = async (shouldEdit) => {
        if (shouldEdit && isPublished) {
            if (await showConfirmDialog()) {
                props.navigateToNewURL({});
            }
            return;
        }
        dispatch(setIsEditing(shouldEdit));
    };

    return (
        <>
            <Breadcrumbs researchFieldId={comparisonResource?.researchField ? comparisonResource?.researchField.id : null} />
            <TitleBar
                buttonGroup={
                    contributionsList.length > 1 &&
                    !isLoadingResult &&
                    !isFailedLoadingResult && (
                        <>
                            {!isEditing ? (
                                <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => handleEdit(true)}>
                                    <FontAwesomeIcon icon={faPen} className="me-1" /> Edit
                                </Button>
                            ) : (
                                <Button active color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => handleEdit(false)}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            )}
                            <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={handleAddContribution}>
                                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add contribution
                            </Button>
                            {comparisonResource.id ? (
                                <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => {
                                        dispatch(setUseReconstructedDataInVisualization(false));
                                        dispatch(setIsOpenVisualizationModal(!isOpenVisualizationModal));
                                    }}
                                    style={{ marginRight: 2 }}
                                >
                                    <FontAwesomeIcon icon={faChartBar} className="me-1" /> Visualize
                                </Button>
                            ) : (
                                <Tippy
                                    hideOnClick={false}
                                    content="Cannot use self-visualization-service for unpublished comparison. You must publish the comparison first to use this functionality"
                                >
                                    <span className="btn-group">
                                        {/* To trigger the tippy even the button is disabled */}
                                        <span style={{ marginRight: 2 }} className="btn btn-secondary btn-sm disabled">
                                            <FontAwesomeIcon icon={faChartBar} className="me-1" /> Visualize
                                        </span>
                                    </span>
                                </Tippy>
                            )}
                            <Dropdown group isOpen={dropdownOpen} toggle={() => setDropdownOpen((v) => !v)}>
                                <DropdownToggle color="secondary" size="sm" className="rounded-end">
                                    <span className="me-2">Actions</span> <FontAwesomeIcon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end style={{ zIndex: '1031' }}>
                                    <Dropdown isOpen={dropdownDensityOpen} toggle={() => setDropdownDensityOpen((v) => !v)} direction="left">
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
                                    <Tippy disabled={isPublished} content="The comparison uses live data already">
                                        <span>
                                            <DropdownItem onClick={() => props.navigateToNewURL({})} disabled={!isPublished}>
                                                Fetch live data
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <Tippy disabled={!isPublished} content={publishedMessage}>
                                        <span>
                                            <DropdownItem onClick={() => setShowPropertiesDialog((v) => !v)} disabled={isPublished}>
                                                Select properties
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <Tippy disabled={!isPublished} content={publishedMessage}>
                                        <span>
                                            <Dropdown isOpen={dropdownMethodOpen} toggle={() => setDropdownMethodOpen((v) => !v)} direction="left">
                                                <DropdownToggle
                                                    tag="div"
                                                    className={`dropdown-item d-flex ${isPublished ? 'disabled' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    disabled={isPublished}
                                                >
                                                    Comparison method{' '}
                                                    <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronRight} pull="right" />
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

                                    <Tippy disabled={!isPublished} content={publishedMessage}>
                                        <span>
                                            <DropdownItem onClick={handleEditContributions} disabled={isPublished}>
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
                                                comparisonResource.id
                                                    ? {
                                                          title: comparisonResource.label,
                                                          description: comparisonResource.description,
                                                          creator: comparisonResource.createdBy,
                                                          date: comparisonResource.createdAt,
                                                      }
                                                    : { title: '', description: '', creator: '', date: '' },
                                            )
                                        }
                                    >
                                        Export as RDF
                                    </DropdownItem>
                                    {comparisonResource?.id && comparisonResource?.doi && (
                                        <DropdownItem onClick={() => setShowExportCitationsDialog((v) => !v)}>Export Citation</DropdownItem>
                                    )}
                                    {comparisonResource?.id && (
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`https://mybinder.org/v2/gl/TIBHannover%2Forkg%2Forkg-notebook-boilerplate/HEAD?urlpath=notebooks%2FComparison.ipynb%3Fcomparison_id%3D%22${comparisonResource.id}%22%26autorun%3Dtrue`}
                                        >
                                            Jupyter Notebook <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                    )}
                                    <DropdownItem divider />
                                    <DropdownItem header>Tools</DropdownItem>
                                    <Tippy disabled={versions?.length > 1} content="There is no history available for this comparison">
                                        <span>
                                            <DropdownItem onClick={() => setShowComparisonVersions((v) => !v)} disabled={versions?.length < 2}>
                                                <span className="me-2">History</span>
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <DropdownItem onClick={() => setIsOpenQualityReportModal(true)}>Quality report</DropdownItem>
                                    <Tippy disabled={isPublished} content="This feature only works for published comparisons">
                                        <span>
                                            <DropdownItem onClick={() => setIsOpenTopAuthorsModal(true)} disabled={!isPublished}>
                                                Top authors
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <DropdownItem divider />
                                    <Tippy disabled={!isPublished} content="A published comparison cannot be saved as draft">
                                        <span>
                                            <DropdownItem
                                                onClick={() => {
                                                    if (!user) {
                                                        dispatch(openAuthDialog({ action: 'signin', signInRequired: true }));
                                                    } else {
                                                        setShowSaveDraftDialog(true);
                                                    }
                                                }}
                                                disabled={isPublished}
                                            >
                                                Save as draft
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <DropdownItem
                                        onClick={() => {
                                            if (!user) {
                                                dispatch(openAuthDialog({ action: 'signin', signInRequired: true }));
                                            } else {
                                                setShowPublishDialog((v) => !v);
                                            }
                                        }}
                                    >
                                        Publish
                                    </DropdownItem>
                                    {comparisonResource?.id && (
                                        <>
                                            <DropdownItem divider />
                                            <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                            <DropdownItem tag={Link} href={`${reverse(ROUTES.RESOURCE, { id: comparisonResource.id })}?noRedirect`}>
                                                View resource
                                            </DropdownItem>
                                        </>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    )
                }
                titleAddition={
                    !isFailedLoadingMetadata &&
                    contributionsList.length > 1 && <SubTitle>{pluralize('contribution', contributionsList.length, true)}</SubTitle>
                }
            >
                Comparison
            </TitleBar>
            {!isLoadingVersions && hasNextVersion && (
                <NewerVersionWarning versions={versions} comparisonId={comparisonResource?.id || comparisonResource?.hasPreviousVersion?.id} />
            )}
            {searchParams.get('requestFeedback') && (
                <Alert color="info" className="container d-flex box align-items-center">
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
            {!isLoadingVersions && versions?.length > 1 && showComparisonVersions && (
                <HistoryModal
                    comparisonId={comparisonResource?.id || comparisonResource?.hasPreviousVersion?.id}
                    toggle={() => setShowComparisonVersions((v) => !v)}
                    showDialog={showComparisonVersions}
                />
            )}
            {showPublishDialog && (
                <Publish toggle={() => setShowPublishDialog((v) => !v)} nextVersions={!isLoadingVersions && hasNextVersion ? versions : []} />
            )}
            <AddContribution
                onAddContributions={addContributions}
                showDialog={showAddContribution}
                toggle={() => setShowAddContribution((v) => !v)}
            />
            <ExportToLatex showDialog={showLatexDialog} toggle={() => setShowLatexDialog((v) => !v)} s />
            <ExportCitation
                showDialog={showExportCitationsDialog}
                toggle={() => setShowExportCitationsDialog((v) => !v)}
                DOI={comparisonResource?.doi}
                comparisonId={comparisonResource?.id}
            />
            {showSaveDraftDialog && <SaveDraft isOpen={showSaveDraftDialog} toggle={() => setShowSaveDraftDialog((v) => !v)} comparisonUrl="" />}
            <AddVisualizationModal />
            <SelectProperties showPropertiesDialog={showPropertiesDialog} togglePropertiesDialog={() => setShowPropertiesDialog((v) => !v)} />
            {isOpenTopAuthorsModal && (
                <ComparisonAuthorsModel comparisonId={comparisonResource?.id} toggle={() => setIsOpenTopAuthorsModal((v) => !v)} />
            )}
            {isOpenQualityReportModal && <QualityReportModal toggle={() => setIsOpenQualityReportModal((v) => !v)} />}
            {isOpenFeedbackModal && (
                <WriteFeedback comparisonId={comparisonResource?.id} toggle={() => dispatch(setIsOpenFeedbackModal(!isOpenFeedbackModal))} />
            )}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={comparisonResource?.id} />}
        </>
    );
};

ComparisonHeaderMenu.propTypes = {
    navigateToNewURL: PropTypes.func.isRequired,
};

export default ComparisonHeaderMenu;
