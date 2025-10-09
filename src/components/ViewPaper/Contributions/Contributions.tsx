import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { FC, useEffect } from 'react';

import AddToComparison from '@/components/Cards/PaperCard/AddToComparison';
import AddContributionButton from '@/components/ContributionTabs/AddContributionButton';
import ContributionTab from '@/components/ContributionTabs/ContributionTab';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import RosettaStoneStatements from '@/components/RosettaStone/Statements/RosettaStoneStatements';
import Tabs from '@/components/Tabs/Tabs';
import Alert from '@/components/Ui/Alert/Alert';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import useParams from '@/components/useParams/useParams';
import ContributionComparisons from '@/components/ViewPaper/ContributionComparisons/ContributionComparisons';
import AutomaticContributionWarning from '@/components/ViewPaper/Contributions/AutomaticContributionWarning';
import useContributions from '@/components/ViewPaper/Contributions/hooks/useContributions';
import usePaperSectionStats from '@/components/ViewPaper/Contributions/hooks/usePaperSectionStats';
import PaperSectionTabLabel from '@/components/ViewPaper/Contributions/PaperSectionTabLabel/PaperSectionTabLabel';
import useFetchAbstract from '@/components/ViewPaper/hooks/useFetchAbstract';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import Mentionings from '@/components/ViewPaper/Mentionings/Mentionings';
import ProvenanceBox from '@/components/ViewPaper/ProvenanceBox/ProvenanceBox';
import SmartSuggestions from '@/components/ViewPaper/SmartSuggestions/SmartSuggestions';
import SustainableDevelopmentGoals from '@/components/ViewPaper/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import { EXTRACTION_METHODS } from '@/constants/misc';
import ROUTES from '@/constants/routes';

type ContributionsProps = {
    enableEdit: boolean;
};

type PaperSections = 'contributions' | 'statements' | 'mentions';

const Contributions: FC<ContributionsProps> = ({ enableEdit }) => {
    const { resourceId, contributionId } = useParams();
    const { paper, contributions } = useViewPaper({ paperId: resourceId });
    const {
        handleAutomaticContributionVerification,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        router,
        isAddingContribution,
    } = useContributions({
        paperId: resourceId,
    });

    const { count, isLoading } = usePaperSectionStats({ paperId: resourceId });

    const researchFieldId = paper?.research_fields?.[0]?.id;

    const onTabChange = (key: string) => {
        const url = reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId, contributionId: key });
        router.push(`${url}${enableEdit ? `?isEditMode=${enableEdit}` : ''}`);
    };

    const { fetchAbstract, isLoading: isLoadingAbstract, abstract } = useFetchAbstract();

    useEffect(() => {
        if (enableEdit && !abstract) {
            fetchAbstract();
        }
    }, [enableEdit, abstract, fetchAbstract]);

    let selectedTab: PaperSections = contributionId as PaperSections;
    if (!selectedTab && !isLoading) {
        if (count.contributions) {
            selectedTab = 'contributions';
        } else if (count.statements) {
            selectedTab = 'statements';
        } else if (count.mentions) {
            selectedTab = 'mentions';
        } else {
            selectedTab = 'contributions';
        }
    }
    let selectedContributionId = null;
    let failedContributionId = false;
    if (!['statements', 'mentions'].includes(selectedTab)) {
        selectedTab = 'contributions';
        if (contributions && contributions?.length > 0 && (!contributionId || contributionId === 'contributions')) {
            selectedContributionId = contributions[0].id;
        } else {
            selectedContributionId = contributionId;
        }
    }

    if (!['statements', 'mentions', 'contributions'].includes(selectedTab)) {
        if (!contributions?.some((el) => el.id === selectedContributionId)) {
            failedContributionId = true;
        }
    }

    return (
        <div>
            <Row>
                <Col md="9">
                    <Tabs
                        more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                        activeKey={selectedTab}
                        destroyOnHidden
                        onChange={onTabChange}
                        className="rounded"
                        style={{ background: '#F8F9FB' }}
                        items={[
                            {
                                label: <PaperSectionTabLabel paperId={resourceId} paperSection="contributions" label="Contributions" />,
                                key: 'contributions',
                                children: (
                                    <>
                                        {!failedContributionId && (
                                            <Tabs
                                                tabBarExtraContent={
                                                    enableEdit ? (
                                                        <AddContributionButton
                                                            disabled={isAddingContribution}
                                                            onClick={() => handleCreateContribution()}
                                                        />
                                                    ) : null
                                                }
                                                more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                                                activeKey={selectedContributionId ?? undefined}
                                                destroyOnHidden
                                                onChange={onTabChange}
                                                items={[
                                                    ...(contributions?.map((contribution) => ({
                                                        label: (
                                                            <ContributionTab
                                                                handleChangeContributionLabel={handleChangeContributionLabel}
                                                                isSelected={contribution.id === selectedContributionId}
                                                                canDelete={contributions.length !== 1}
                                                                contribution={contribution}
                                                                key={contribution.id}
                                                                toggleDeleteContribution={toggleDeleteContribution}
                                                                enableEdit={enableEdit}
                                                            />
                                                        ),
                                                        key: contribution.id,
                                                        children: (
                                                            <div
                                                                className="p-4"
                                                                style={{
                                                                    backgroundColor:
                                                                        contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC
                                                                            ? '#ecf6f8'
                                                                            : '',
                                                                }}
                                                            >
                                                                {contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC && (
                                                                    <AutomaticContributionWarning
                                                                        contribution={contribution}
                                                                        onVerifyHandler={handleAutomaticContributionVerification}
                                                                        enableEdit={enableEdit}
                                                                    />
                                                                )}
                                                                {selectedContributionId && (
                                                                    <div>
                                                                        <FormGroup>
                                                                            <DataBrowser
                                                                                isEditMode={enableEdit}
                                                                                id={selectedContributionId}
                                                                                canEditSharedRootLevel
                                                                                researchField={researchFieldId}
                                                                                title={paper?.title}
                                                                                abstract={abstract}
                                                                            />
                                                                        </FormGroup>

                                                                        {contribution.id && (
                                                                            <ContributionComparisons contributionId={contribution.id} />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    })) ?? []),
                                                ]}
                                            />
                                        )}
                                        {failedContributionId && (
                                            <Alert className="m-3" color="danger">
                                                Contribution doesn't exist
                                            </Alert>
                                        )}
                                        {contributions?.length === 0 && (
                                            <Alert className="m-3 rounded" color="warning">
                                                This paper has no contributions yet
                                                <br />
                                                {enableEdit ? (
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        Start by adding a contribution using the top right (+) button
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
                                                )}
                                                <br />
                                            </Alert>
                                        )}
                                    </>
                                ),
                            },
                            {
                                label: <PaperSectionTabLabel paperId={resourceId} paperSection="statements" label="Statements" />,
                                key: 'statements',
                                children: (
                                    <div className="p-4">
                                        <RosettaStoneStatements context={resourceId} />
                                    </div>
                                ),
                            },
                            {
                                label: <PaperSectionTabLabel paperId={resourceId} paperSection="mentions" label="Mentions" />,
                                key: 'mentions',
                                children: (
                                    <div className="p-4">
                                        <Mentionings id={resourceId} />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Col>

                <div className="col-md-3">
                    <SustainableDevelopmentGoals isEditable={enableEdit} />

                    {contributions && contributions?.length > 0 && (
                        <div className="d-flex mb-3 rounded px-3 py-2" style={{ border: '1px solid rgb(219,221,229)' }}>
                            <AddToComparison showLabel paper={{ id: resourceId, label: paper?.title, contributions }} />
                        </div>
                    )}

                    {selectedContributionId && contributionId !== 'statements' && contributionId !== 'mentions' && enableEdit && (
                        <div className="mb-3">
                            <SmartSuggestions
                                isLoadingAbstract={isLoadingAbstract}
                                title={paper?.title}
                                abstract={abstract}
                                resourceId={selectedContributionId}
                            />
                        </div>
                    )}

                    <ProvenanceBox />
                </div>
            </Row>
        </div>
    );
};

export default Contributions;
