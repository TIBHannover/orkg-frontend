import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

import ContributionTab from '@/components/ContributionTabs/ContributionTab';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import Tabs from '@/components/Tabs/Tabs';
import Alert from '@/components/Ui/Alert/Alert';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import useParams from '@/components/useParams/useParams';
import ProvenanceBox from '@/components/ViewPaper/ProvenanceBox/ProvenanceBox';
import useContributions from '@/components/ViewPaperVersion/ContributionsVersion/hooks/useContributions';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource, Statement } from '@/services/backend/types';

type ContributionsProps = {
    contributions: (Resource & { statementId: string })[];
    paperStatements: Statement[];
    snapshotCreatedAt: string;
};

const Contributions: FC<ContributionsProps> = ({ contributions, paperStatements, snapshotCreatedAt }) => {
    const { resourceId, contributionId } = useParams();

    const { isLoading, isLoadingContributionFailed, selectedContribution } = useContributions({
        paperId: resourceId,
        contributionId,
        contributions,
        paperStatements,
    });
    const router = useRouter();

    const onTabChange = (key: string) => {
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
                        <div className="flex gap-2">
                            <Skeleton className="w-1/5 h-5 rounded" />
                            <Skeleton className="w-1/5 h-5 rounded" />
                            <Skeleton className="w-1/5 h-5 rounded" />
                        </div>
                    )}

                    <Tabs
                        more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                        activeKey={selectedContribution}
                        destroyOnHidden
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
                                <div className="p-6">
                                    {!isLoadingContributionFailed && (
                                        <div>
                                            <div className="mb-3">
                                                <DataBrowser
                                                    isEditMode={false}
                                                    id={contribution.id}
                                                    statementsSnapshot={paperStatements}
                                                    snapshotCreatedAt={snapshotCreatedAt}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {isLoadingContributionFailed && (
                                        <Alert className="mt-6 mb-12" color="danger">
                                            {contributions.length === 0 && 'This paper has no contributions yet!'}
                                            {contributions.length !== 0 && "Contribution doesn't exist."}
                                        </Alert>
                                    )}
                                </div>
                            ),
                        }))}
                    />
                </Col>

                <div className="w-full md:shrink-0 md:grow-0 md:w-3/12 md:basis-3/12 md:max-w-3/12">
                    <ProvenanceBox />
                </div>
            </Row>
        </div>
    );
};

export default Contributions;
