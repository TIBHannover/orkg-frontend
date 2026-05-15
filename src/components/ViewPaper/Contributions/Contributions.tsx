import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, cn } from '@heroui/react';
import { FC, useEffect } from 'react';

import AddToComparison from '@/components/Cards/PaperCard/AddToComparison';
import AddContributionButton from '@/components/ContributionTabs/AddContributionButton';
import ContributionTab from '@/components/ContributionTabs/ContributionTab';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import RosettaStoneStatements from '@/components/RosettaStone/Statements/RosettaStoneStatements';
import Tabs from '@/components/Tabs/Tabs';
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
import { reverse } from '@/lib/namedRoute';

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
            <div className="flex flex-wrap gap-6">
                <div className="w-full md:shrink-0 md:grow-0 md:basis-[calc(75%-1.5rem)] md:max-w-[calc(75%-1.5rem)]">
                    <Tabs
                        more={{ icon: <FontAwesomeIcon size="lg" icon={faAngleDown} /> }}
                        activeKey={selectedTab}
                        destroyOnHidden
                        onChange={onTabChange}
                        className="rounded bg-surface-secondary"
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
                                                                className={cn(
                                                                    'p-6',
                                                                    contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC && 'bg-smart/10',
                                                                )}
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
                                                                        <div className="mb-4">
                                                                            <DataBrowser
                                                                                isEditMode={enableEdit}
                                                                                id={selectedContributionId}
                                                                                canEditSharedRootLevel
                                                                                researchField={researchFieldId}
                                                                                title={paper?.title}
                                                                                abstract={abstract}
                                                                            />
                                                                        </div>

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
                                            <div className="p-4">
                                                <Alert status="danger">
                                                    <Alert.Indicator />
                                                    <Alert.Content>
                                                        <Alert.Title>Contribution doesn't exist</Alert.Title>
                                                    </Alert.Content>
                                                </Alert>
                                            </div>
                                        )}
                                        {contributions?.length === 0 && (
                                            <div className="p-4">
                                                <Alert status="warning">
                                                    <Alert.Indicator />
                                                    <Alert.Content>
                                                        <Alert.Title>No contributions yet</Alert.Title>
                                                        <Alert.Description>
                                                            {enableEdit
                                                                ? 'Start by adding a contribution using the top right (+) button'
                                                                : 'Please contribute by editing'}
                                                        </Alert.Description>
                                                    </Alert.Content>
                                                </Alert>
                                            </div>
                                        )}
                                    </>
                                ),
                            },
                            {
                                label: <PaperSectionTabLabel paperId={resourceId} paperSection="statements" label="Statements" />,
                                key: 'statements',
                                children: (
                                    <div className="py-6 px-2">
                                        <RosettaStoneStatements context={resourceId} />
                                    </div>
                                ),
                            },
                            {
                                label: <PaperSectionTabLabel paperId={resourceId} paperSection="mentions" label="Mentions" />,
                                key: 'mentions',
                                children: (
                                    <div className="p-6">
                                        <Mentionings id={resourceId} />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>

                <div className="w-full md:shrink-0 md:grow-0 md:basis-1/4 md:max-w-[25%] flex flex-col gap-4">
                    <div className="w-full empty:hidden [&>*]:!flex [&>*]:!w-full">
                        <SustainableDevelopmentGoals isEditable={enableEdit} />
                    </div>

                    {contributions && contributions?.length > 0 && (
                        <div className="flex w-full rounded px-4 py-2 border border-border">
                            <AddToComparison showLabel paper={{ id: resourceId, label: paper?.title, contributions }} />
                        </div>
                    )}

                    {selectedContributionId && contributionId !== 'statements' && contributionId !== 'mentions' && enableEdit && (
                        <SmartSuggestions
                            isLoadingAbstract={isLoadingAbstract}
                            title={paper?.title}
                            abstract={abstract}
                            resourceId={selectedContributionId}
                        />
                    )}

                    <ProvenanceBox />
                </div>
            </div>
        </div>
    );
};

export default Contributions;
