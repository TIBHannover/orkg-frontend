import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import env from 'components/NextJsMigration/env';
import PWCProvenanceBox from 'components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import useProvenance from 'components/ViewPaper/hooks/useProvenance';
import useTimeline from 'components/ViewPaper/hooks/useTimeline';
import { uniqBy, orderBy } from 'lodash';
import Provenance from 'components/ViewPaper/ProvenanceBox/Provenance';
import Timeline from 'components/ViewPaper/ProvenanceBox/Timeline';
import { AnimationContainer, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from 'components/ViewPaper/ProvenanceBox/styled';

const ProvenanceBox = () => {
    const { paperResource, isLoadingProvenance, observatoryInfo, organizationInfo, createdBy, versions } = useProvenance();

    const {
        isNextPageLoading: isNextPageLoadingContributors,
        hasNextPage: hasNextPageContributors,
        contributors,
        handleLoadMore: handleLoadMoreContributors,
    } = useTimeline(paperResource.id);

    const _versions = orderBy([...contributors, ...versions], ['created_at'], ['desc']); // combining contributors and version with DOI information

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div>
            {env('PWC_USER_ID') === paperResource.created_by && (
                <div className="mb-2">
                    <PWCProvenanceBox />
                </div>
            )}
            <SidebarStyledBox className="box rounded-3" style={{ minHeight: 430, backgroundColor: '#f8f9fb' }}>
                <ProvenanceBoxTabs className="clearfix d-flex">
                    <div
                        id="div1"
                        className={`h6 col-md-6 text-center tab ${activeTab === 1 ? 'active' : ''}`}
                        onClick={() => setActiveTab(1)}
                        onKeyDown={e => (e.key === 'Enter' ? setActiveTab(1) : undefined)}
                        role="button"
                        tabIndex={0}
                    >
                        Provenance
                    </div>
                    <div
                        id="div2"
                        className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => setActiveTab(2)}
                        onKeyDown={e => (e.key === 'Enter' ? setActiveTab(2) : undefined)}
                        role="button"
                        tabIndex={0}
                    >
                        Timeline
                    </div>
                </ProvenanceBoxTabs>
                {paperResource.extraction_method === 'AUTOMATIC' && (
                    <ErrorMessage className="alert-server">The data has been partially imported automatically.</ErrorMessage>
                )}
                <TransitionGroup exit={false}>
                    {activeTab === 1 ? (
                        <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <Provenance
                                observatoryInfo={observatoryInfo}
                                organizationInfo={organizationInfo}
                                paperResource={paperResource}
                                contributors={uniqBy(contributors, 'created_by.id')}
                                createdBy={createdBy}
                                isLoadingProvenance={isLoadingProvenance}
                                isLoadingContributors={isNextPageLoadingContributors}
                            />
                        </AnimationContainer>
                    ) : (
                        <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <Timeline
                                observatoryInfo={observatoryInfo}
                                organizationInfo={organizationInfo}
                                paperResource={paperResource}
                                versions={_versions}
                                createdBy={createdBy}
                                isLoadingContributors={isNextPageLoadingContributors}
                                hasNextPageContributors={hasNextPageContributors}
                                handleLoadMoreContributors={handleLoadMoreContributors}
                            />
                        </AnimationContainer>
                    )}
                </TransitionGroup>
            </SidebarStyledBox>
        </div>
    );
};

export default ProvenanceBox;
