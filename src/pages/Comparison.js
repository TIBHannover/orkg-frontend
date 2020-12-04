import React, { useState } from 'react';
import { Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, ButtonGroup, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus, faLightbulb, faBezierCurve, faHistory, faWindowMaximize, faChartBar } from '@fortawesome/free-solid-svg-icons';
import ComparisonLoadingComponent from 'components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from 'components/Comparison/ComparisonTable.js';
import ExportToLatex from 'components/Comparison/ExportToLatex.js';
import GeneratePdf from 'components/Comparison/GeneratePdf.js';
import SelectProperties from 'components/Comparison/SelectProperties';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import ProvenanceBox from 'components/Comparison/ProvenanceBox/ProvenanceBox';
import RelatedResources from 'components/Comparison/RelatedResources';
import RelatedFigures from 'components/Comparison/RelatedFigures';
import ExportCitation from 'components/Comparison/ExportCitation';
import ComparisonMetaData from 'components/Comparison/ComparisonMetaData';
import Share from 'components/Comparison/Share.js';
import ComparisonVersions from 'components/Comparison/ComparisonVersions.js';
import Publish from 'components/Comparison/Publish.js';
import { ContainerAnimated, ComparisonTypeButton } from 'components/Comparison/styled';
import useComparison from 'components/Comparison/hooks/useComparison';
import { getResource } from 'services/backend/resources';
import ROUTES from 'constants/routes.js';
import { useHistory, Link } from 'react-router-dom';
import { openAuthDialog } from 'actions/auth';
import { CSVLink } from 'react-csv';
import { isObject } from 'lodash';
import { generateRdfDataVocabularyFile } from 'utils';
import Tippy from '@tippy.js/react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import PropTypes from 'prop-types';
import ExactMatch from 'assets/img/comparison-exact-match.svg';
import IntelligentMerge from 'assets/img/comparison-intelligent-merge.svg';
import AddVisualizationModal from '../libs/selfVisModel/ComparisonComponents/AddVisualizationModal';
import { NavLink } from 'react-router-dom';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import SelfVisDataModel from '../libs/selfVisModel/SelfVisDataModel';
import PreviewComponent from 'libs/selfVisModel/ComparisonComponents/PreviewComponent';

function Comparison(props) {
    const [
        metaData,
        contributions,
        properties,
        data,
        matrixData,
        authors,
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
        hasNextVersions,
        createdBy,
        provenance,
        setMetaData,
        setComparisonType,
        toggleProperty,
        onSortPropertiesEnd,
        toggleTranspose,
        removeContribution,
        addContributions,
        generateUrl,
        setResponseHash,
        setUrlNeedsToUpdate,
        setShortLink,
        setAuthors,
        loadCreatedBy,
        loadProvenanceInfos
    ] = useComparison({});

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
    const [showAddContribution, setShowAddContribution] = useState(false);
    const [showComparisonVersions, setShowComparisonVersions] = useState(false);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [showVisualizationModal, setShowVisualizationModal] = useState(false);
    const [applyReconstruction, setUseReconstructedData] = useState(false);
    const [reloadingFlag, setReloadingFlag] = useState(false);
    const [reloadingSizeFlag, setReloadingSizeFlag] = useState(false);
    /**
     * Is case of an error the user can go to the previous link in history
     */
    const handleGoBack = () => {
        history.goBack();
    };

    const closeOnExport = () => {
        setShowVisualizationModal(false);
        setReloadingFlag(!reloadingFlag);
    };
    const onDismissShiftMouseWheelScroll = () => {
        // dismiss function for the alert thingy!;
        setCookie('seenShiftMouseWheelScroll', true, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setHideScrollHint(true);
    };

    const timedSizeValidation = () => {
        // Quick and Dirty, Todo: check when the expand animation is finished and then set tell the preview to update
        setTimeout(() => {
            setReloadingSizeFlag(!reloadingSizeFlag);
        }, 700);
    };

    const handleFullWidth = () => {
        setFullWidth(v => {
            setCookie('useFullWidthForComparisonTable', !v, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS

            // tell the previewComponent to check for its size
            timedSizeValidation();

            return !v;
        });
    };

    const handleViewDensity = density => {
        setCookie('viewDensityComparisonTable', density, { path: env('PUBLIC_URL'), maxAge: 315360000 }); // << TEN YEARS
        setViewDensity(density);
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};

    const handleChangeType = type => {
        setUrlNeedsToUpdate(true);
        setResponseHash(null);
        setComparisonType(type);
        setDropdownMethodOpen(false);
    };

    const propagateTheClick = val => {
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

    return (
        <div>
            <ContainerAnimated className="d-flex align-items-center">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">
                    Contribution comparison{' '}
                    {!isFailedLoadingMetaData && contributionsList.length > 1 && (
                        <Tippy content="The amount of compared contributions">
                            <span>
                                <Badge color="darkblue" pill style={{ fontSize: '65%' }}>
                                    {contributionsList.length}
                                </Badge>
                            </span>
                        </Tippy>
                    )}
                </h1>

                {contributionsList.length > 1 && !isLoadingComparisonResult && !isFailedLoadingComparisonResult && (
                    <div style={{ marginLeft: 'auto' }} className="flex-shrink-0 mt-4">
                        <ButtonGroup className="float-right mb-4 ml-1">
                            <Button
                                color="darkblue"
                                size="sm"
                                onClick={() => {
                                    setUseReconstructedData(false);
                                    setShowVisualizationModal(!showVisualizationModal);
                                }}
                                style={{ marginRight: 3 }}
                            >
                                <Icon icon={faChartBar} /> <span className="mr-2">Add Visualization</span>
                            </Button>
                            <Dropdown group isOpen={dropdownDensityOpen} toggle={() => setDropdownDensityOpen(v => !v)} style={{ marginRight: 3 }}>
                                <DropdownToggle color="darkblue" size="sm">
                                    <Icon icon={faWindowMaximize} className="mr-1" /> <span className="mr-1">View</span>
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={handleFullWidth}>
                                        <span className="mr-2">{fullWidth ? 'Reduced width' : 'Full width'}</span>
                                    </DropdownItem>
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
                            <Button
                                className="flex-shrink-0"
                                color="darkblue"
                                size="sm"
                                style={{ marginRight: 3 }}
                                onClick={() => setShowAddContribution(v => !v)}
                            >
                                <Icon icon={faPlus} style={{ margin: '2px 4px 0 0' }} /> Add contribution
                            </Button>
                            <Dropdown group isOpen={dropdownOpen} toggle={() => setDropdownOpen(v => !v)}>
                                <DropdownToggle color="darkblue" size="sm" className="rounded-right">
                                    <span className="mr-2">More</span> <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem header>Customize</DropdownItem>
                                    <DropdownItem onClick={() => setShowPropertiesDialog(v => !v)}>Select properties</DropdownItem>
                                    <DropdownItem onClick={() => toggleTranspose(v => !v)}>Transpose table</DropdownItem>
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
                                    <DropdownItem divider />
                                    <DropdownItem onClick={() => setShowShareDialog(v => !v)}>Share link</DropdownItem>
                                    <DropdownItem
                                        onClick={e => {
                                            if (!props.user) {
                                                props.openAuthDialog('signin', true);
                                            } else {
                                                setShowPublishDialog(v => !v);
                                            }
                                        }}
                                    >
                                        Publish
                                    </DropdownItem>
                                    {(metaData?.hasPreviousVersion || (hasNextVersions && hasNextVersions.length > 0)) && (
                                        <>
                                            {' '}
                                            <DropdownItem divider />
                                            <DropdownItem onClick={() => setShowComparisonVersions(v => !v)}>
                                                <Icon icon={faHistory} /> <span className="mr-2">History</span>
                                            </DropdownItem>
                                        </>
                                    )}
                                    <DropdownItem divider />
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: metaData?.id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </ButtonGroup>
                    </div>
                )}
            </ContainerAnimated>

            <ContainerAnimated className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix" style={containerStyle}>
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
                                        <span className="btn-link" style={{ cursor: 'pointer' }} onClick={() => handleGoBack}>
                                            Go back
                                        </span>{' '}
                                        or <Link to={ROUTES.HOME}>go to the homepage {contributionsList.length}</Link>.
                                    </>
                                )}
                            </Alert>
                        )}
                    </div>
                )}

                <>
                    {!isFailedLoadingMetaData && !isFailedLoadingComparisonResult && (
                        <div className="p-0 d-flex align-items-start">
                            <h2 className="h4 mb-4 mt-4 flex-grow-1">{metaData.title ? metaData.title : 'Compare'}</h2>

                            <ButtonGroup className=" mb-4 mt-4  flex-shrink-0">
                                <Dropdown group isOpen={dropdownMethodOpen} toggle={() => setDropdownMethodOpen(v => !v)}>
                                    <DropdownToggle color="lightblue" size="sm" className="rounded-right">
                                        <span className="mr-2">Method: {comparisonType === 'path' ? 'Exact match' : 'Intelligent merge'}</span>{' '}
                                        <Icon icon={faBezierCurve} />
                                    </DropdownToggle>
                                    <DropdownMenu right>
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
                            </ButtonGroup>
                        </div>
                    )}
                    {!isFailedLoadingMetaData && !isFailedLoadingComparisonResult && <ComparisonMetaData authors={authors} metaData={metaData} />}
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
                            {contributionsList.length > 1 && !isLoadingComparisonResult ? (
                                <div className="mt-1">
                                    {integrateData({
                                        metaData,
                                        contributions,
                                        properties,
                                        data,
                                        authors, // do we need this? maybe to add a new author who creates the comparison
                                        contributionsList,
                                        predicatesList
                                    }) && (
                                        <PreviewComponent
                                            comparisonId={metaData.id}
                                            propagateClick={propagateTheClick}
                                            reloadingFlag={reloadingFlag}
                                            reloadingSizeFlag={reloadingSizeFlag}
                                        />
                                    )}

                                    <ComparisonTable
                                        data={data}
                                        properties={properties}
                                        contributions={contributions}
                                        removeContribution={removeContribution}
                                        transpose={transpose}
                                        viewDensity={viewDensity}
                                    />
                                </div>
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
                                                <ValuePlugins type="literal">{reference}</ValuePlugins>
                                            </i>
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ContainerAnimated>

            {metaData.id && ((isObject(createdBy) && createdBy.id) || provenance) && (
                <ProvenanceBox creator={createdBy} provenance={provenance} changeObservatory={getObservatoryInfo} resourceId={metaData.id} />
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
            />

            {(metaData?.hasPreviousVersion || (hasNextVersions && hasNextVersions.length > 0)) && (
                <ComparisonVersions
                    showDialog={showComparisonVersions}
                    toggle={() => setShowComparisonVersions(v => !v)}
                    metaData={metaData}
                    hasNextVersions={hasNextVersions}
                />
            )}

            <Publish
                showDialog={showPublishDialog}
                toggle={() => setShowPublishDialog(v => !v)}
                comparisonId={metaData?.id}
                doi={metaData?.doi}
                metaData={metaData}
                publicURL={publicURL}
                setMetaData={setMetaData}
                contributionsList={contributionsList}
                predicatesList={predicatesList}
                comparisonType={comparisonType}
                comparisonURLConfig={comparisonURLConfig}
                authors={authors}
                setAuthors={setAuthors}
                loadCreatedBy={loadCreatedBy}
                loadProvenanceInfos={loadProvenanceInfos}
            />

            <AddContribution addContributions={addContributions} showDialog={showAddContribution} toggle={() => setShowAddContribution(v => !v)} />

            <ExportToLatex
                data={matrixData}
                contributions={contributions}
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
            {!isLoadingComparisonResult && !isFailedLoadingComparisonResult && (
                <AddVisualizationModal
                    toggle={() => setShowVisualizationModal(v => !v)}
                    showDialog={showVisualizationModal}
                    // Some data we track as input for the new data model TODO Check what we need
                    initialData={{
                        metaData,
                        contributions,
                        properties,
                        data,
                        authors, // do we need this? maybe to add a new author who creates the comparison
                        contributionsList,
                        predicatesList
                    }}
                    closeOnExport={closeOnExport}
                    updatePreviewComponent={() => setReloadingFlag(v => !v)}
                    useReconstructedData={applyReconstruction}
                />
            )}
        </div>
    );
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: (action, signInRequired) => dispatch(openAuthDialog(action, signInRequired))
});

Comparison.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Comparison);
