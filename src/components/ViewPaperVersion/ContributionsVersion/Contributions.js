import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import Tabs from 'components/Tabs/Tabs';
import useParams from 'components/useParams/useParams';
import ProvenanceBox from 'components/ViewPaper/ProvenanceBox/ProvenanceBox';
import useContributions from 'components/ViewPaperVersion/ContributionsVersion/hooks/useContributions';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Alert, Col, FormGroup, Row } from 'reactstrap';

const Contributions = (props) => {
    const { resourceId, contributionId } = useParams();
    const { contributions, paperStatements } = props;
    const { isLoading, isLoadingContributionFailed, selectedContribution } = useContributions({
        paperId: resourceId,
        contributionId,
        contributions,
        paperStatements,
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
                        moreIcon={<FontAwesomeIcon size="lg" icon={faAngleDown} />}
                        activeKey={selectedContribution}
                        destroyInactiveTabPane
                        onChange={onTabChange}
                        items={contributions.map((contribution) => ({
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
                                                <DataBrowser isEditMode={false} id={contribution.id} statementsSnapshot={paperStatements} />
                                            </FormGroup>
                                        </div>
                                    )}
                                    {isLoadingContributionFailed && (
                                        <Alert className="mt-4 mb-5" color="danger">
                                            {contributions.length === 0 && 'This paper has no contributions yet!'}
                                            {contributions.length !== 0 && "Contribution doesn't exist."}
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
