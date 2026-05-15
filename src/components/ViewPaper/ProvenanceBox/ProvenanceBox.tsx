import { Tabs } from '@heroui/react';
import { orderBy, uniqBy } from 'lodash';
import { env } from 'next-runtime-env';

import PWCProvenanceBox from '@/components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import useParams from '@/components/useParams/useParams';
import useProvenance from '@/components/ViewPaper/hooks/useProvenance';
import useTimeline from '@/components/ViewPaper/hooks/useTimeline';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import Provenance from '@/components/ViewPaper/ProvenanceBox/Provenance';
import Timeline from '@/components/ViewPaper/ProvenanceBox/Timeline';

const ProvenanceBox = () => {
    const { resourceId } = useParams();
    const { isLoadingProvenance, observatoryInfo, organizationInfo, createdBy, versions } = useProvenance();
    const { paper: viewPaper } = useViewPaper({ paperId: resourceId });
    const {
        isNextPageLoading: isNextPageLoadingContributors,
        hasNextPage: hasNextPageContributors,
        contributors,
        handleLoadMore: handleLoadMoreContributors,
    } = useTimeline(resourceId);

    const _versions = orderBy([...contributors, ...versions], ['created_at'], ['desc']);

    if (!viewPaper) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper?.created_by && (
                <div className="mb-2">
                    <PWCProvenanceBox />
                </div>
            )}
            <div className="border border-border shadow-sm rounded-lg bg-surface min-h-[430px] grow overflow-hidden">
                <Tabs variant="secondary" defaultSelectedKey="provenance" className="w-full">
                    <Tabs.ListContainer>
                        <Tabs.List aria-label="Provenance sections" className="grid grid-cols-2 w-full">
                            <Tabs.Tab id="provenance" className="justify-center font-bold text-xs uppercase">
                                Provenance
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="timeline" className="justify-center font-bold text-xs uppercase">
                                Timeline
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                    {viewPaper?.extraction_method === 'AUTOMATIC' && (
                        <div className="bg-surface-secondary text-muted text-xs p-2.5">The data has been partially imported automatically.</div>
                    )}
                    <Tabs.Panel id="provenance">
                        <Provenance
                            observatoryInfo={observatoryInfo}
                            organizationInfo={organizationInfo}
                            paperResource={viewPaper}
                            contributors={uniqBy(contributors, 'created_by.id')}
                            createdBy={createdBy}
                            isLoadingProvenance={isLoadingProvenance}
                            isLoadingContributors={isNextPageLoadingContributors}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel id="timeline">
                        <Timeline
                            paperResource={viewPaper}
                            versions={_versions}
                            createdBy={createdBy}
                            isLoadingContributors={isNextPageLoadingContributors}
                            hasNextPageContributors={hasNextPageContributors}
                            handleLoadMoreContributors={handleLoadMoreContributors}
                        />
                    </Tabs.Panel>
                </Tabs>
            </div>
        </div>
    );
};

export default ProvenanceBox;
