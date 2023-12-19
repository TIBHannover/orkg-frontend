import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddToComparison from 'components/Cards/PaperCard/AddToComparison';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import Tabs from 'components/Tabs/Tabs';
import ContributionComparisons from 'components/ViewPaper/ContributionComparisons/ContributionComparisons';
import useContributions from 'components/ViewPaper/Contributions/hooks/useContributions';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import SmartSuggestions from 'components/ViewPaper/SmartSuggestions/SmartSuggestions';
import useFetchAbstract from 'components/ViewPaper/hooks/useFetchAbstract';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import ContentLoader from 'react-content-loader';
import { useSelector } from 'react-redux';
import useParams from 'components/NextJsMigration/useParams';
import { Alert, Col, FormGroup, Row } from 'reactstrap';
import AutomaticContributionWarning from 'components/ViewPaper/Contributions/AutomaticContributionWarning';
import { EXTRACTION_METHODS } from 'constants/misc';

const Contributions = props => {
    const { resourceId, contributionId } = useParams();

    const {
        isLoading,
        isLoadingContributionFailed,
        selectedContributionId,
        contributions,
        paperTitle,
        handleAutomaticContributionVerification,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        router,
    } = useContributions({
        paperId: resourceId,
        contributionId,
    });

    const isAddingContribution = useSelector(state => state.viewPaper.isAddingContribution);

    const onTabChange = key => {
        router.push(
            `${reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                resourceId,
                contributionId: key,
            })}${props.enableEdit ? `?isEditMode=${props.enableEdit}` : ''}`,
        );
    };

    const { fetchAbstract, isLoading: isLoadingAbstract, abstract } = useFetchAbstract();

    useEffect(() => {
        if (props.enableEdit && !abstract) {
            fetchAbstract();
        }
    }, [props.enableEdit, abstract, fetchAbstract]);

    return (
        <div>
            <Row>
                <Col md="9">
                    {isLoading && (
                        <div>
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 6"
                                style={{ width: '100% !important' }}
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="1" ry="1" width={20} height="5" />
                                <rect x="21" y="0" rx="1" ry="1" width={20} height="5" />
                                <rect x="42" y="0" rx="1" ry="1" width={20} height="5" />
                            </ContentLoader>
                        </div>
                    )}

                    <Tabs
                        tabBarExtraContent={
                            props.enableEdit ? (
                                <AddContributionButton disabled={isAddingContribution} onClick={() => handleCreateContribution()} />
                            ) : null
                        }
                        moreIcon={<Icon size="lg" icon={faAngleDown} />}
                        activeKey={selectedContributionId}
                        destroyInactiveTabPane={true}
                        onChange={onTabChange}
                        items={contributions?.map(contribution => ({
                            label: (
                                <ContributionTab
                                    handleChangeContributionLabel={handleChangeContributionLabel}
                                    isSelected={contribution.id === selectedContributionId}
                                    canDelete={contributions.length !== 1}
                                    contribution={contribution}
                                    key={contribution.id}
                                    toggleDeleteContribution={toggleDeleteContribution}
                                    enableEdit={props.enableEdit}
                                />
                            ),
                            key: contribution.id,
                            children: (
                                <div
                                    className="p-4"
                                    style={{ backgroundColor: contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC ? '#ecf6f8' : '' }}
                                >
                                    {contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC && (
                                        <AutomaticContributionWarning
                                            contribution={contribution}
                                            onVerifyHandler={handleAutomaticContributionVerification}
                                            enableEdit={props.enableEdit}
                                        />
                                    )}
                                    {!isLoadingContributionFailed && (
                                        <div>
                                            <FormGroup>
                                                <StatementBrowser
                                                    enableEdit={props.enableEdit}
                                                    syncBackend={props.enableEdit}
                                                    openExistingResourcesInDialog={false}
                                                    initOnLocationChange={false}
                                                    keyToKeepStateOnLocationChange={contributionId ?? resourceId}
                                                    renderTemplateBox={true}
                                                />
                                            </FormGroup>

                                            {/* selectedContribution && <SimilarContributions contributionId={selectedContribution} /> */}

                                            {contribution.id && <ContributionComparisons contributionId={contribution.id} />}
                                        </div>
                                    )}
                                    {isLoadingContributionFailed && (
                                        <>
                                            <Alert className="mt-4 mb-5" color="danger">
                                                {contributions.length === 0 && 'This paper has no contributions yet'}
                                                {contributions.length !== 0 && "Contribution doesn't exist"}
                                            </Alert>
                                        </>
                                    )}
                                </div>
                            ),
                        }))}
                    />

                    {!isLoading && contributions?.length === 0 && (
                        <Alert className="mt-1 mb-0 rounded" color="warning">
                            This paper has no contributions yet
                            <br />
                            {props.enableEdit ? (
                                <span style={{ fontSize: '0.875rem' }}>Start by adding a contribution using the top right (+) button</span>
                            ) : (
                                <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
                            )}
                            <br />
                        </Alert>
                    )}
                </Col>

                <div className="col-md-3">
                    {contributions?.length > 0 && (
                        <div className="d-flex mb-3 rounded px-3 py-2" style={{ border: '1px solid rgb(219,221,229)' }}>
                            <AddToComparison showLabel={true} paper={{ id: resourceId, label: paperTitle, contributions }} />
                        </div>
                    )}

                    {props.enableEdit && (
                        <div className="mb-3">
                            <SmartSuggestions isLoadingAbstract={isLoadingAbstract} title={paperTitle} abstract={abstract} />
                        </div>
                    )}

                    <ProvenanceBox />
                </div>
            </Row>
        </div>
    );
};

Contributions.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
};

export default Contributions;
