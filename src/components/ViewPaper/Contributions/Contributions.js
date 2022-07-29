import { Alert, Col, Container, FormGroup, Row } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ContributionComparisons from 'components/ViewPaper/ContirbutionComparisons/ContributionComparisons';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import { reverse } from 'named-urls';
import AddToComparison from 'components/PaperCard/AddToComparison';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import { useSelector } from 'react-redux';
import { StyledContributionTabs, GlobalStyle } from 'components/ContributionTabs/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import Tabs, { TabPane } from 'rc-tabs';
import SimilarContributions from '../SimilarContributions';
import useContributions from './hooks/useContributions';

const Contributions = props => {
    const { resourceId, contributionId } = useParams();

    const {
        isLoading,
        isLoadingContributionFailed,
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
        selectedContribution,
        contributions,
        paperTitle,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        navigate,
    } = useContributions({
        paperId: resourceId,
        contributionId,
    });
    const isAddingContribution = useSelector(state => state.viewPaper.isAddingContribution);

    const onTabChange = key => {
        navigate(
            reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                resourceId,
                contributionId: key,
            }),
        );
    };

    return (
        <div>
            <GlobalStyle />
            <Container>
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
                        <StyledContributionTabs>
                            <Tabs
                                tabBarExtraContent={
                                    props.enableEdit ? (
                                        <AddContributionButton disabled={isAddingContribution} onClick={() => handleCreateContribution()} />
                                    ) : null
                                }
                                moreIcon={<Icon size="lg" icon={faAngleDown} />}
                                activeKey={selectedContribution}
                                destroyInactiveTabPane={true}
                                onChange={onTabChange}
                            >
                                {contributions.map(contribution => (
                                    <TabPane
                                        tab={
                                            <ContributionTab
                                                handleChangeContributionLabel={handleChangeContributionLabel}
                                                isSelected={contribution.id === selectedContribution}
                                                canDelete={contributions.length !== 1}
                                                contribution={contribution}
                                                key={contribution.id}
                                                toggleDeleteContribution={toggleDeleteContribution}
                                                enableEdit={props.enableEdit}
                                            />
                                        }
                                        key={contribution.id}
                                    >
                                        {!isLoadingContributionFailed && (
                                            <div>
                                                <FormGroup>
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
                                                                <rect x="0" y="0" rx="1" ry="1" width="90" height="6" />
                                                            </ContentLoader>
                                                        </div>
                                                    )}
                                                    {!isLoading && (
                                                        <StatementBrowser
                                                            enableEdit={props.enableEdit}
                                                            syncBackend={props.enableEdit}
                                                            openExistingResourcesInDialog={false}
                                                            initOnLocationChange={false}
                                                            keyToKeepStateOnLocationChange={resourceId}
                                                            renderTemplateBox={true}
                                                        />
                                                    )}
                                                </FormGroup>

                                                <SimilarContributions
                                                    similarContributions={similarContributions.slice(0, 3)}
                                                    isLoading={isSimilarContributionsLoading}
                                                    isFailed={isSimilarContributionsFailedLoading}
                                                    contributionId={contribution.id}
                                                />

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
                                    </TabPane>
                                ))}
                            </Tabs>
                        </StyledContributionTabs>
                    </Col>

                    <div className="col-md-3">
                        <div className="d-flex mb-3 rounded px-3 py-2" style={{ border: '1px solid rgb(219,221,229)' }}>
                            <AddToComparison showLabel={true} paper={{ id: resourceId, label: paperTitle, contributions }} />
                        </div>
                        <ProvenanceBox />
                    </div>
                </Row>
            </Container>
        </div>
    );
};

Contributions.propTypes = {
    toggleEditMode: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired,
};

export default Contributions;
