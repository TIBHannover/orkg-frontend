import { Alert, Col, Container, FormGroup, Row } from 'reactstrap';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ContentLoader from 'react-content-loader';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import SimilarContributions from '../SimilarContributions';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import ContributionItemList from 'components/AddPaper/Contributions/ContributionItemList';
import ContributionComparisons from 'components/ViewPaper/ContirbutionComparisons/ContributionComparisons';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import { reverse } from 'named-urls';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import AddToComparison from 'components/PaperCard/AddToComparison';
import { useSelector } from 'react-redux';
import { StyledHorizontalContributionsList, StyledHorizontalContribution, AddContribution } from 'components/AddPaper/Contributions/styled';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useContributions from './hooks/useContributions';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

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
        toggleDeleteContribution
    } = useContributions({
        paperId: resourceId,
        contributionId
    });
    const isAddingContribution = useSelector(state => state.viewPaper.isAddingContribution);

    return (
        <div>
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
                        {!isLoading && (
                            <StyledHorizontalContributionsList className={!props.enableEdit && 'noEdit'}>
                                {contributions.map(contribution => {
                                    return (
                                        <ContributionItemList
                                            paperId={resourceId}
                                            handleChangeContributionLabel={handleChangeContributionLabel}
                                            isSelected={contribution.id === selectedContribution}
                                            canDelete={contributions.length !== 1}
                                            selectedContributionId={selectedContribution}
                                            contribution={contribution}
                                            key={contribution.id}
                                            toggleDeleteContribution={toggleDeleteContribution}
                                            enableEdit={props.enableEdit}
                                        />
                                    );
                                })}
                                {props.enableEdit && (
                                    <li>
                                        <AddContribution disabled={isAddingContribution} color="link" onClick={() => handleCreateContribution()}>
                                            <Tippy content="Add contribution">
                                                <span>
                                                    <Icon size="xs" icon={!isAddingContribution ? faPlus : faSpinner} spin={isAddingContribution} />
                                                </span>
                                            </Tippy>
                                        </AddContribution>
                                    </li>
                                )}
                            </StyledHorizontalContributionsList>
                        )}
                    </Col>

                    <TransitionGroup className="col-md-9" exit={false}>
                        <AnimationContainer key={selectedContribution} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                            <StyledHorizontalContribution>
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

                                        <div>
                                            <Title>Similar contributions</Title>
                                            {isSimilarContributionsLoading && (
                                                <div>
                                                    <ContentLoader
                                                        height="100%"
                                                        width="100%"
                                                        viewBox="0 0 100 10"
                                                        style={{ width: '100% !important' }}
                                                        speed={2}
                                                        backgroundColor="#f3f3f3"
                                                        foregroundColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="33" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="66" y="0" rx="2" ry="2" width="32" height="10" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!isSimilarContributionsLoading && (
                                                <>
                                                    {!isSimilarContributionsFailedLoading ? (
                                                        <SimilarContributions similarContributions={similarContributions.slice(0, 3)} />
                                                    ) : (
                                                        <Alert color="light">
                                                            Failed to connect to the similarity service, please try again later
                                                        </Alert>
                                                    )}
                                                </>
                                            )}
                                            {similarContributions.length > 0 && (
                                                <Link
                                                    className="clearfix"
                                                    to={`${reverse(ROUTES.COMPARISON)}?contributions=${selectedContribution},${similarContributions
                                                        .slice(0, 3)
                                                        .map(s => s.contributionId)
                                                        .join(',')}`}
                                                >
                                                    {/* TODO: use constants for URL */}
                                                    <span
                                                        style={{ margin: '7px 5px 0 0', fontSize: '95%' }}
                                                        className="float-right btn btn-link p-0 border-0 align-baseline"
                                                    >
                                                        Compare these contributions
                                                    </span>
                                                </Link>
                                            )}
                                        </div>

                                        {selectedContribution && <ContributionComparisons contributionId={selectedContribution} />}
                                    </div>
                                )}
                                {isLoadingContributionFailed && (
                                    <>
                                        <Alert className="mt-4 mb-5" color="danger">
                                            {contributions.length === 0 && 'This paper has no contributions yet!'}
                                            {contributions.length !== 0 && "Contribution doesn't exist."}
                                        </Alert>
                                    </>
                                )}
                            </StyledHorizontalContribution>
                        </AnimationContainer>
                    </TransitionGroup>
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
    enableEdit: PropTypes.bool.isRequired
};

export default Contributions;
