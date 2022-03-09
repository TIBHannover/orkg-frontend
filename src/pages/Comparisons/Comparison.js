import { useState, useEffect } from 'react';
import { Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faLightbulb, faHistory, faChartBar, faExternalLinkAlt, faFilter, faPlus } from '@fortawesome/free-solid-svg-icons';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/Comparison';
import ExportToLatex from 'components/Comparison/Export/ExportToLatex.js';
import GeneratePdf from 'components/Comparison/Export/GeneratePdf.js';
import SelectProperties from 'components/Comparison/SelectProperties';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import ProvenanceBox from 'components/Comparison/ProvenanceBox/ProvenanceBox';
import ObservatoryBox from 'components/Comparison/ProvenanceBox/ObservatoryBox';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import RelatedResources from 'components/Comparison/RelatedResources/RelatedResources';
import RelatedFigures from 'components/Comparison/RelatedResources/RelatedFigures';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import ComparisonMetaData from 'components/Comparison/ComparisonMetaData';
import MarkFeaturedUnlistedContainer from 'components/Comparison/MarkFeaturedUnlistedContainer';
import Share from 'components/Comparison/Share.js';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import NewerVersionWarning from 'components/Comparison/HistoryModal/NewerVersionWarning';
import Publish from 'components/Comparison/Publish/Publish';
import { ContainerAnimated, ComparisonTypeButton } from 'components/Comparison/styled';
import useComparison from 'components/Comparison/hooks/useComparison';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import { getResource } from 'services/backend/resources';
import moment from 'moment';
import ROUTES from 'constants/routes.js';
import { useHistory, Link, useParams } from 'react-router-dom';
import { openAuthDialog } from 'actions/auth';
import { CSVLink } from 'react-csv';
import { generateRdfDataVocabularyFile, areAllRulesEmpty } from 'utils';
import Tippy from '@tippyjs/react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import PropTypes from 'prop-types';
import ExactMatch from 'assets/img/comparison-exact-match.svg';
import IntelligentMerge from 'assets/img/comparison-intelligent-merge.svg';
import AddVisualizationModal from 'libs/selfVisModel/ComparisonComponents/AddVisualizationModal';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PreviewVisualizationComparison from 'libs/selfVisModel/ComparisonComponents/PreviewVisualizationComparison';
import { NavLink } from 'react-router-dom';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import { Helmet } from 'react-helmet';
import AppliedRule from 'components/Comparison/Filters/AppliedRule';
import TitleBar from 'components/TitleBar/TitleBar';
import SaveDraft from 'components/Comparison/SaveDraft/SaveDraft';
import Confirm from 'components/Confirmation/Confirmation';

function Comparison(props) {
    const {
        metaData,
        contributions,
        properties,
        data,
        filterControlData,
        matrixData,
        errors,
        transpose,
        comparisonType,
        responseHash,
        contributionsList,
        predicatesList,
        publicURL,
        comparisonURLConfig,
        shortLink,
        isLoadingMetaData,
        isFailedLoadingMetaData,
        isLoadingComparisonResult,
        isFailedLoadingComparisonResult,
        createdBy,
        provenance,
        researchField,
        setMetaData,
        setComparisonType,
        setPredicatesList,
        toggleProperty,
        onSortPropertiesEnd,
        toggleTranspose,
        removeContribution,
        addContributions,
        updateRulesOfProperty,
        removeRule,
        generateUrl,
        setResponseHash,
        setUrlNeedsToUpdate,
        setShortLink,
        loadCreatedBy,
        loadProvenanceInfos,
        loadVisualizations,
        handleEditContributions,
        fetchLiveData
    } = useComparison({});

    const params = useParams();
    const { versions, isLoadingVersions, hasNextVersion, loadVersions } = useComparisonVersions({ comparisonId: params.comparisonId });

    useEffect(() => {
        if (params.comparisonId) {
            loadVersions(params.comparisonId);
        }
    }, [params.comparisonId, loadVersions]);

    useEffect(() => {
        if (metaData?.title) {
            document.title = `${metaData.title} - Comparison - ORKG`;
        }
    }, [metaData]);

    /** adding some additional state for meta data **/

    const [cookies, setCookie] = useCookies();
    const history = useHistory();

    const [fullWidth, setFullWidth] = useState(cookies.useFullWidthForComparisonTable === 'true' ? cookies.useFullWidthForComparisonTable : false);
    const [hideScrollHint, setHideScrollHint] = useState(cookies.seenShiftMouseWheelScroll ? cookies.seenShiftMouseWheelScroll : false);

    const [viewDensity, setViewDensity] = useState(cookies.viewDensityComparisonTable ? cookies.viewDensityComparisonTable : 'spacious');
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

    const [showVisualizationModal, setShowVisualizationModal] = useState(false);
    const [applyReconstruction, setUseReconstructedData] = useState(false);
    /**
     * Is case of an error the user can go to the previous link in history
     */
    const handleGoBack = () => {
        history.goBack();
    };

    const closeOnExport = () => {
        setShowVisualizationModal(false);
    };

    const onDismissShiftMouseWheelScroll = () => {
        // dismiss function for the alert thingy!;
        setCookie('seenShiftMouseWheelScroll', true, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setHideScrollHint(true);
    };

    const handleFullWidth = () => {
        setFullWidth(v => {
            setCookie('useFullWidthForComparisonTable', !v, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
            return !v;
        });
        setDropdownOpen(false);
    };

    const handleViewDensity = density => {
        setCookie('viewDensityComparisonTable', density, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setViewDensity(density);
        setDropdownOpen(false);
    };

    const handleTranspose = () => {
        toggleTranspose(v => !v);
        setDropdownOpen(false);
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 100px)' } : {};

    const handleChangeType = type => {
        setUrlNeedsToUpdate(true);
        setResponseHash(null);
        setPredicatesList([]);
        setComparisonType(type);
        setDropdownMethodOpen(false);
    };

    /**
     * Expand a preview of a visualization
     *
     * @param {Boolean} val weather to use reconstructed data
     */
    const expandVisualization = val => {
        setUseReconstructedData(val);
        if (val === false) {
            const model = new SelfVisDataModel();
            model.resetCustomizationModel();
        }
        setShowVisualizationModal(true);
    };

    const integrateData = initData => {
        const model = new SelfVisDataModel();
        model.integrateInputData(initData);

        return true;
    };

    const getObservatoryInfo = async () => {
        const resourceId = metaData.id;
        const comparisonResource = await getResource(resourceId);
        await loadCreatedBy(comparisonResource.created_by);
        loadProvenanceInfos(comparisonResource.observatory_id, comparisonResource.organization_id);
    };

    const removeRuleFactory = ({ propertyId, type, value }) => () => removeRule({ propertyId, type, value });

    const displayRules = () => {
        return []
            .concat(...filterControlData.map(item => item.rules))
            .map(({ propertyId, propertyName, type, value }) => (
                <AppliedRule
                    key={`${propertyId}#${type}`}
                    data={{ propertyId, propertyName, type: type, value, removeRule: removeRuleFactory({ propertyId, type, value }) }}
                />
            ));
    };

    const isPublished = metaData?.id || responseHash ? true : false;
    const publishedMessage = "Published comparisons cannot be edited, click 'Fetch live data' to reload the live comparison data";

    const ldJson = {
        mainEntity: {
            headline: metaData?.title,
            description: metaData?.description,
            ...(metaData?.doi ? { sameAs: `https://doi.org/${metaData.doi}` } : {}),
            author: metaData.authors?.map(author => ({
                name: author.label,
                ...(author.orcid ? { url: `http://orcid.org/${author.orcid}` } : {}),
                '@type': 'Person'
            })),
            datePublished: metaData.createdAt ? moment(metaData.createdAt).format('DD MMMM YYYY') : '',
            about: researchField?.label,
            '@type': 'ScholarlyArticle'
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage'
    };

    const handleAddContribution = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published comparison',
                message: `The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again`,
                cancelColor: 'light',
                proceedLabel: 'Fetch live data'
            });

            if (isConfirmed) {
                fetchLiveData();
            }
            return;
        }
        setShowAddContribution(v => !v);
    };

    return (
        <div>
            <Breadcrumbs researchFieldId={metaData?.subject ? metaData?.subject.id : researchField ? researchField.id : null} />

            <Helmet>
                <title>{`${metaData?.title ?? 'Unpublished'} - Comparison - ORKG`}</title>
                <meta property="og:title" content={`${metaData?.title ?? 'Unpublished'} - Comparison - ORKG`} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={metaData?.description} />
                <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
            </Helmet>
            <TitleBar
                buttonGroup={
                    (contributionsList.length > 1 || (areAllRulesEmpty(filterControlData) && contributionsList.length > 0)) &&
                    !isLoadingComparisonResult &&
                    !isFailedLoadingComparisonResult && (
                        <>
                            <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={handleAddContribution}>
                                <Icon icon={faPlus} className="me-1" /> Add contribution
                            </Button>
                            {!!metaData.id ? (
                                <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setUseReconstructedData(false);
                                        setShowVisualizationModal(!showVisualizationModal);
                                    }}
                                    style={{ marginRight: 2 }}
                                >
                                    <Icon icon={faChartBar} className="me-1" /> Visualize
                                </Button>
                            ) : (
                                <Tippy
                                    hideOnClick={false}
                                    content="Cannot use self-visualization-service for unpublished comparison. You must publish the comparison first to use this functionality."
                                >
                                    <span style={{ marginRight: 2 }} className="btn btn-secondary btn-sm disabled">
                                        <Icon icon={faChartBar} className="me-1" /> Visualize
                                    </span>
                                </Tippy>
                            )}
                            <Dropdown group isOpen={dropdownOpen} toggle={() => setDropdownOpen(v => !v)}>
                                <DropdownToggle color="secondary" size="sm" className="rounded-end">
                                    <span className="me-2">Actions</span> <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end style={{ zIndex: '1031' }}>
                                    <Dropdown isOpen={dropdownDensityOpen} toggle={() => setDropdownDensityOpen(v => !v)} direction="left">
                                        <DropdownToggle className="dropdown-item pe-auto" tag="div" style={{ cursor: 'pointer' }}>
                                            View
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
                                        </DropdownMenu>
                                    </Dropdown>
                                    <DropdownItem divider />
                                    <DropdownItem header>Customize</DropdownItem>
                                    <Tippy disabled={isPublished} content="The comparison uses live data already">
                                        <span>
                                            <DropdownItem onClick={fetchLiveData} disabled={!isPublished}>
                                                Fetch live data
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <Tippy disabled={!isPublished} content={publishedMessage}>
                                        <span>
                                            <DropdownItem onClick={() => setShowPropertiesDialog(v => !v)} disabled={isPublished}>
                                                Select properties
                                            </DropdownItem>
                                        </span>
                                    </Tippy>
                                    <Tippy disabled={!isPublished} content={publishedMessage}>
                                        <span>
                                            <Dropdown isOpen={dropdownMethodOpen} toggle={() => setDropdownMethodOpen(v => !v)} direction="left">
                                                <DropdownToggle
                                                    tag="div"
                                                    className={`dropdown-item ${isPublished ? 'disabled' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    disabled={isPublished}
                                                >
                                                    Comparison method
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <div className="d-flex px-2">
                                                        <ComparisonTypeButton
                                                            color="link"
                                                            className="p-0 m-1"
                                                            onClick={() => handleChangeType('merge')}
                                                            active={comparisonType !== 'path'}
                                                        >
                                                            <img src={IntelligentMerge} alt="Intelligent merge example" />
                                                        </ComparisonTypeButton>

                                                        <ComparisonTypeButton
                                                            color="link"
                                                            className="p-0 m-1"
                                                            onClick={() => handleChangeType('path')}
                                                            active={comparisonType === 'path'}
                                                        >
                                                            <img src={ExactMatch} alt="Exact match example" />
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
                                    <DropdownItem onClick={() => setShowLatexDialog(v => !v)}>Export as LaTeX</DropdownItem>
                                    {matrixData ? (
                                        <CSVLink
                                            data={matrixData}
                                            filename="ORKG Contribution Comparison.csv"
                                            className="dropdown-item"
                                            target="_blank"
                                            onClick={() => setDropdownOpen(v => !v)}
                                        >
                                            Export as CSV
                                        </CSVLink>
                                    ) : (
                                        ''
                                    )}
                                    <GeneratePdf id="comparisonTable" />
                                    <DropdownItem
                                        onClick={() =>
                                            generateRdfDataVocabularyFile(
                                                data,
                                                contributions,
                                                properties,
                                                metaData.id
                                                    ? {
                                                          title: metaData.title,
                                                          description: metaData.description,
                                                          creator: metaData.createdBy,
                                                          date: metaData.createdAt
                                                      }
                                                    : { title: '', description: '', creator: '', date: '' }
                                            )
                                        }
                                    >
                                        Export as RDF
                                    </DropdownItem>
                                    {metaData?.id && metaData?.doi && (
                                        <DropdownItem onClick={() => setShowExportCitationsDialog(v => !v)}>Export Citation</DropdownItem>
                                    )}
                                    {metaData?.id && (
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`https://mybinder.org/v2/gl/TIBHannover%2Forkg%2Forkg-notebook-boilerplate/HEAD?urlpath=notebooks%2FComparison.ipynb%3Fcomparison_id%3D%22${metaData.id}%22%26autorun%3Dtrue`}
                                        >
                                            Jupyter Notebook <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                    )}
                                    <DropdownItem divider />
                                    <DropdownItem onClick={() => setShowShareDialog(v => !v)}>Share link</DropdownItem>
                                    <DropdownItem
                                        onClick={e => {
                                            if (!props.user) {
                                                props.openAuthDialog({ action: 'signin', signInRequired: true });
                                            } else {
                                                setShowPublishDialog(v => !v);
                                            }
                                        }}
                                    >
                                        Publish
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => {
                                            if (!props.user) {
                                                props.openAuthDialog({ action: 'signin', signInRequired: true });
                                            } else {
                                                setShowSaveDraftDialog(true);
                                            }
                                        }}
                                    >
                                        Save as draft
                                    </DropdownItem>
                                    {!isLoadingVersions && versions?.length > 1 && (
                                        <>
                                            <DropdownItem divider />
                                            <DropdownItem onClick={() => setShowComparisonVersions(v => !v)}>
                                                <Icon icon={faHistory} /> <span className="me-2">History</span>
                                            </DropdownItem>
                                        </>
                                    )}
                                    {metaData?.id && (
                                        <>
                                            <DropdownItem divider />
                                            <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: metaData.id })}>
                                                View resource
                                            </DropdownItem>
                                        </>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    )
                }
            >
                Comparison{' '}
                {!isFailedLoadingMetaData && contributionsList.length > 1 && (
                    <Tippy content="The amount of compared contributions">
                        <span>
                            <Badge color="secondary" pill style={{ fontSize: '65%' }}>
                                {contributionsList.length}
                            </Badge>
                        </span>
                    </Tippy>
                )}
            </TitleBar>

            {!isLoadingVersions && hasNextVersion && (
                <NewerVersionWarning versions={versions} comparisonId={metaData?.id || metaData?.hasPreviousVersion?.id} />
            )}

            <ContainerAnimated className="box rounded pt-4 pb-4 ps-5 pe-5 clearfix position-relative" style={containerStyle}>
                <ShareLinkMarker typeOfLink="comparison" title={metaData?.title} />
                {!isLoadingMetaData && (isFailedLoadingComparisonResult || isFailedLoadingMetaData) && (
                    <div>
                        {isFailedLoadingComparisonResult && contributionsList.length < 2 ? (
                            <>
                                <div className="clearfix" />
                                <Alert color="info">Please select a minimum of two research contributions to compare on.</Alert>
                            </>
                        ) : (
                            <Alert color="danger">
                                {errors ? (
                                    <>{errors}</>
                                ) : (
                                    <>
                                        <strong>Error.</strong> The comparison service is unreachable. Please come back later and try again.{' '}
                                        <span
                                            className="btn-link"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleGoBack}
                                            onKeyDown={e => (e.keyCode === 13 ? handleGoBack : undefined)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            Go back
                                        </span>{' '}
                                        or <Link to={ROUTES.HOME}>go to the homepage</Link>.
                                    </>
                                )}
                            </Alert>
                        )}
                    </div>
                )}

                <>
                    {!isFailedLoadingMetaData && !isFailedLoadingComparisonResult && (
                        <div className="p-0 d-flex align-items-start">
                            <div className="flex-grow-1">
                                <h2 className="h4 mb-4 mt-4">
                                    {metaData.title ? metaData.title : 'Compare'}{' '}
                                    {metaData.id && (
                                        <MarkFeaturedUnlistedContainer
                                            size="xs"
                                            id={metaData?.id}
                                            featured={metaData?.featured}
                                            unlisted={metaData?.unlisted}
                                        />
                                    )}
                                </h2>
                                {!isFailedLoadingMetaData && provenance && <ComparisonMetaData metaData={metaData} provenance={provenance} />}
                            </div>

                            {metaData.id && provenance && <ObservatoryBox provenance={provenance} />}
                        </div>
                    )}
                    {!isFailedLoadingMetaData && !isFailedLoadingComparisonResult && (
                        <>
                            {contributionsList.length > 3 && (
                                <Alert className="mt-3" color="info" isOpen={!hideScrollHint} toggle={onDismissShiftMouseWheelScroll}>
                                    <Icon icon={faLightbulb} /> Use{' '}
                                    <b>
                                        <i>Shift</i>
                                    </b>{' '}
                                    +{' '}
                                    <b>
                                        <i>Mouse Wheel</i>
                                    </b>{' '}
                                    for horizontal scrolling in the table.
                                </Alert>
                            )}
                            {areAllRulesEmpty(filterControlData) && (
                                <div className="mt-3 d-flex" style={{ flexDirection: 'column' }}>
                                    <h6 className="text-secondary">
                                        <Icon className="me-1" size="sm" icon={faFilter} />
                                        <b>Applied Filters:</b>
                                    </h6>
                                    <div className="d-flex flex-wrap">{displayRules()}</div>
                                </div>
                            )}
                            {!isLoadingComparisonResult ? (
                                contributionsList.length > 1 || (areAllRulesEmpty(filterControlData) && contributionsList.length > 0) ? (
                                    <div className="mt-1">
                                        {integrateData({
                                            metaData,
                                            contributions,
                                            properties,
                                            data,
                                            contributionsList,
                                            predicatesList
                                        }) && (
                                            <PreviewVisualizationComparison
                                                comparisonId={metaData.id}
                                                expandVisualization={expandVisualization}
                                                visualizations={metaData.visualizations}
                                            />
                                        )}

                                        <ComparisonTable
                                            data={data}
                                            properties={properties}
                                            contributions={contributions}
                                            removeContribution={removeContribution}
                                            transpose={transpose}
                                            viewDensity={viewDensity}
                                            filterControlData={filterControlData}
                                            updateRulesOfProperty={updateRulesOfProperty}
                                            comparisonType={comparisonType}
                                        />
                                    </div>
                                ) : (
                                    <Alert className="mt-3 text-center" color="danger">
                                        Sorry, this comparison doesn't have the minimum amount of research contributions to compare on
                                    </Alert>
                                )
                            ) : (
                                <ComparisonLoadingComponent />
                            )}
                        </>
                    )}
                </>

                <div className="mt-3 clearfix">
                    {contributionsList.length > 1 && !isLoadingComparisonResult && (
                        <>
                            <RelatedResources resourcesStatements={metaData.resources ? metaData.resources : []} />
                            <RelatedFigures figureStatements={metaData.figures ? metaData.figures : []} />
                        </>
                    )}
                    {!isFailedLoadingMetaData && metaData.references && metaData.references.length > 0 && (
                        <div style={{ lineHeight: 1.5 }}>
                            <h3 className="mt-5 h5">Data sources</h3>
                            <ul>
                                {metaData.references.map((reference, index) => (
                                    <li key={`ref${index}`}>
                                        <small>
                                            <i>
                                                <ValuePlugins type="literal">{reference.label}</ValuePlugins>
                                            </i>
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ContainerAnimated>

            {metaData.id && (
                <ProvenanceBox
                    creator={metaData?.anonymized ? '' : createdBy}
                    provenance={provenance}
                    changeObservatory={getObservatoryInfo}
                    resourceId={metaData.id}
                />
            )}
            <SelectProperties
                properties={properties}
                showPropertiesDialog={showPropertiesDialog}
                togglePropertiesDialog={() => setShowPropertiesDialog(v => !v)}
                generateUrl={generateUrl}
                toggleProperty={toggleProperty}
                onSortEnd={onSortPropertiesEnd}
            />
            <Share
                showDialog={showShareDialog}
                toggle={() => setShowShareDialog(v => !v)}
                publicURL={publicURL}
                comparisonURLConfig={comparisonURLConfig}
                contributionsList={contributionsList}
                comparisonType={comparisonType}
                comparisonId={metaData?.id}
                responseHash={responseHash ?? ''}
                setResponseHash={setResponseHash}
                shortLink={shortLink}
                setShortLink={setShortLink}
                subject={!metaData?.subject && researchField ? researchField : metaData?.subject}
            />
            {!isLoadingVersions && versions?.length > 1 && showComparisonVersions && (
                <HistoryModal
                    comparisonId={metaData?.id || metaData?.hasPreviousVersion?.id}
                    toggle={() => setShowComparisonVersions(v => !v)}
                    showDialog={showComparisonVersions}
                />
            )}
            <Publish
                showDialog={showPublishDialog}
                toggle={() => setShowPublishDialog(v => !v)}
                comparisonId={metaData?.id}
                doi={metaData?.doi}
                metaData={!metaData?.subject && researchField ? { ...metaData, subject: researchField } : metaData}
                publicURL={publicURL}
                setMetaData={setMetaData}
                contributionsList={contributionsList}
                predicatesList={predicatesList}
                comparisonType={comparisonType}
                responseHash={responseHash ?? ''}
                comparisonURLConfig={comparisonURLConfig}
                authors={metaData?.authors}
                loadCreatedBy={loadCreatedBy}
                loadProvenanceInfos={loadProvenanceInfos}
                data={data}
                nextVersions={!isLoadingVersions && hasNextVersion ? versions : []}
                anonymized={metaData?.anonymized}
            />

            {showSaveDraftDialog && (
                <SaveDraft isOpen={showSaveDraftDialog} toggle={() => setShowSaveDraftDialog(v => !v)} comparisonUrl={comparisonURLConfig} />
            )}

            <AddContribution onAddContributions={addContributions} showDialog={showAddContribution} toggle={() => setShowAddContribution(v => !v)} />

            <ExportToLatex
                data={matrixData}
                contributions={contributions.filter(c => c.active)}
                properties={properties}
                showDialog={showLatexDialog}
                toggle={() => setShowLatexDialog(v => !v)}
                transpose={transpose}
                publicURL={publicURL}
                comparisonURLConfig={comparisonURLConfig}
                contributionsList={contributionsList}
                comparisonType={comparisonType}
                responseHash={responseHash ?? ''}
                setResponseHash={setResponseHash}
                title={metaData?.title}
                description={metaData?.description}
                comparisonId={metaData?.id}
                shortLink={shortLink}
                setShortLink={setShortLink}
            />
            <ExportCitation
                showDialog={showExportCitationsDialog}
                toggle={() => setShowExportCitationsDialog(v => !v)}
                DOI={metaData?.doi}
                comparisonId={metaData?.id}
            />

            <AddVisualizationModal
                toggle={() => setShowVisualizationModal(v => !v)}
                showDialog={showVisualizationModal}
                // Some data we track as input for the new data model TODO Check what we need
                initialData={{
                    metaData,
                    contributions,
                    properties,
                    data,
                    contributionsList,
                    predicatesList
                }}
                closeOnExport={closeOnExport}
                updatePreviewComponent={() => {
                    loadVisualizations(metaData.id);
                }}
                useReconstructedData={applyReconstruction}
            />
        </div>
    );
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload))
});

Comparison.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Comparison);
