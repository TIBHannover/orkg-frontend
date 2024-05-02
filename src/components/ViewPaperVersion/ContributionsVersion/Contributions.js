import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import useParams from 'components/NextJsMigration/useParams';
import useRouter from 'components/NextJsMigration/useRouter';
import { PropertyStyle, StatementsGroupStyle, StyledStatementItem, ValuesStyle } from 'components/StatementBrowser/styled';
import Tabs from 'components/Tabs/Tabs';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import Breadcrumbs from 'components/ViewPaperVersion/BreadCrumbs';
import CSVWTable from 'components/ViewPaperVersion/CSVWTable/CSVWTable';
import useContributions from 'components/ViewPaperVersion/ContributionsVersion/hooks/useContributions';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { Alert, Button, Col, FormGroup, ListGroup, Row } from 'reactstrap';

const Contributions = (props) => {
    const { resourceId, contributionId } = useParams();
    const {
        isLoading,
        isLoadingContributionFailed,
        selectedContribution,
        contributionData,
        handleResourceClick,
        resourceHistory,
        handleBackClick,
        activeTableId,
    } = useContributions({
        paperId: resourceId,
        contributionId,
        contributions: props.contributions,
        paperStatements: props.paperStatements,
    });
    const router = useRouter();

    const onTabChange = (key) => {
        router.push(
            reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                resourceId,
                contributionId: key,
            }),
        );
    };

    return (
        <div>
            <Row>
                <Col md="9">
                    {isLoading && (
                        <div>
                            <ContentLoader height="100%" width="100%" viewBox="0 0 100 6" style={{ width: '100% !important' }} speed={2}>
                                <rect x="0" y="0" rx="1" ry="1" width={20} height="5" />
                                <rect x="21" y="0" rx="1" ry="1" width={20} height="5" />
                                <rect x="42" y="0" rx="1" ry="1" width={20} height="5" />
                            </ContentLoader>
                        </div>
                    )}

                    <Tabs
                        moreIcon={<Icon size="lg" icon={faAngleDown} />}
                        activeKey={selectedContribution}
                        destroyInactiveTabPane
                        onChange={onTabChange}
                        items={props.contributions.map((contribution) => ({
                            label: (
                                <ContributionTab
                                    handleChangeContributionLabel={() => {}}
                                    isSelected={contribution.id === selectedContribution}
                                    canDelete={false}
                                    contribution={contribution}
                                    key={contribution.id}
                                    toggleDeleteContribution={() => {}}
                                    enableEdit={false}
                                />
                            ),
                            key: contribution.id,
                            children: (
                                <div className="p-4">
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
                                                        >
                                                            <rect x="0" y="0" rx="1" ry="1" width="90" height="6" />
                                                        </ContentLoader>
                                                    </div>
                                                )}
                                                {resourceHistory.length > 0 && (
                                                    <Breadcrumbs resourceHistory={resourceHistory} handleBackClick={handleBackClick} />
                                                )}
                                                {!isLoading && activeTableId && (
                                                    // When activeTableId is set, display the CSVWTable for that ID.
                                                    <CSVWTable id={activeTableId} paperStatements={props.paperStatements} />
                                                )}
                                                {!isLoading && !activeTableId && Object.keys(contributionData).length > 0 && (
                                                    <>
                                                        {Object.keys(contributionData).map((cd, i) => (
                                                            <StatementsGroupStyle className="noTemplate list-group-item" key={`st${i}`}>
                                                                <div className="row gx-0">
                                                                    <PropertyStyle className="col-4" tabIndex="0" key={`p${i}`}>
                                                                        <div>
                                                                            <div className="propertyLabel">
                                                                                <DescriptionTooltip id={cd} _class={ENTITIES.PREDICATE}>
                                                                                    {contributionData[cd][0].predicate.label}
                                                                                </DescriptionTooltip>
                                                                            </div>
                                                                        </div>
                                                                    </PropertyStyle>
                                                                    <ValuesStyle className="col-8 valuesList" key={`v${i}`}>
                                                                        {contributionData[cd].map((s, index) => (
                                                                            <ListGroup flush className="px-3 mt-2" key={`pv${index}`}>
                                                                                {s.object._class === ENTITIES.RESOURCE && (
                                                                                    <Button
                                                                                        className="p-0 text-start objectLabel"
                                                                                        color="link"
                                                                                        onClick={() => handleResourceClick(s)}
                                                                                    >
                                                                                        {s.object.label || <i>No label</i>}
                                                                                    </Button>
                                                                                )}
                                                                                {s.object._class !== ENTITIES.RESOURCE && s.object.label && (
                                                                                    <ValuePlugins type={ENTITIES.LITERAL}>
                                                                                        {s.object.label || <i>No label</i>}
                                                                                    </ValuePlugins>
                                                                                )}
                                                                                {s.object._class !== ENTITIES.RESOURCE && !s.object.label && (
                                                                                    <i>No label</i>
                                                                                )}
                                                                            </ListGroup>
                                                                        ))}
                                                                    </ValuesStyle>
                                                                </div>
                                                            </StatementsGroupStyle>
                                                        ))}
                                                    </>
                                                )}
                                                {!isLoading && !activeTableId && Object.keys(contributionData).length === 0 && (
                                                    <ListGroup tag="div" className="listGroupEnlarge">
                                                        <StyledStatementItem className="mb-0 rounded">No data</StyledStatementItem>
                                                    </ListGroup>
                                                )}
                                            </FormGroup>
                                        </div>
                                    )}
                                    {isLoadingContributionFailed && (
                                        <Alert className="mt-4 mb-5" color="danger">
                                            {props.contributions.length === 0 && 'This paper has no contributions yet!'}
                                            {props.contributions.length !== 0 && "Contribution doesn't exist."}
                                        </Alert>
                                    )}
                                </div>
                            ),
                        }))}
                    />
                </Col>

                <div className="col-md-3">
                    <ProvenanceBox />
                </div>
            </Row>
        </div>
    );
};

Contributions.propTypes = {
    contributions: PropTypes.array,
    paperStatements: PropTypes.array,
};

export default Contributions;
