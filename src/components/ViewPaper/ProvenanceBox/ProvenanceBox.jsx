import { AnimatePresence } from 'framer-motion';
import { orderBy, uniqBy } from 'lodash';
import { env } from 'next-runtime-env';
import { useState } from 'react';

import PWCProvenanceBox from '@/components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import useProvenance from '@/components/ViewPaper/hooks/useProvenance';
import useTimeline from '@/components/ViewPaper/hooks/useTimeline';
import Provenance from '@/components/ViewPaper/ProvenanceBox/Provenance';
import { AnimationContainer, ErrorMessage, ProvenanceBoxTabs, SidebarStyledBox } from '@/components/ViewPaper/ProvenanceBox/styled';
import Timeline from '@/components/ViewPaper/ProvenanceBox/Timeline';

const ProvenanceBox = () => {
    const { viewPaper, isLoadingProvenance, observatoryInfo, organizationInfo, createdBy, versions } = useProvenance();

    const {
        isNextPageLoading: isNextPageLoadingContributors,
        hasNextPage: hasNextPageContributors,
        contributors,
        handleLoadMore: handleLoadMoreContributors,
    } = useTimeline(viewPaper.id);

    const _versions = orderBy([...contributors, ...versions], ['created_at'], ['desc']); // combining contributors and version with DOI information

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div>
            {env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper.created_by && (
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
                        onKeyDown={(e) => (e.key === 'Enter' ? setActiveTab(1) : undefined)}
                        role="button"
                        tabIndex={0}
                    >
                        Provenance
                    </div>
                    <div
                        id="div2"
                        className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => setActiveTab(2)}
                        onKeyDown={(e) => (e.key === 'Enter' ? setActiveTab(2) : undefined)}
                        role="button"
                        tabIndex={0}
                    >
                        Timeline
                    </div>
                </ProvenanceBoxTabs>
                {viewPaper.extraction_method === 'AUTOMATIC' && (
                    <ErrorMessage className="alert-server">The data has been partially imported automatically.</ErrorMessage>
                )}
                <AnimatePresence mode="wait">
                    {activeTab === 1 ? (
                        <AnimationContainer
                            key={1}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Provenance
                                observatoryInfo={observatoryInfo}
                                organizationInfo={organizationInfo}
                                paperResource={viewPaper}
                                contributors={uniqBy(contributors, 'created_by.id')}
                                createdBy={createdBy}
                                isLoadingProvenance={isLoadingProvenance}
                                isLoadingContributors={isNextPageLoadingContributors}
                            />
                        </AnimationContainer>
                    ) : (
                        <AnimationContainer
                            key={2}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Timeline
                                observatoryInfo={observatoryInfo}
                                organizationInfo={organizationInfo}
                                paperResource={viewPaper}
                                versions={_versions}
                                createdBy={createdBy}
                                isLoadingContributors={isNextPageLoadingContributors}
                                hasNextPageContributors={hasNextPageContributors}
                                handleLoadMoreContributors={handleLoadMoreContributors}
                            />
                        </AnimationContainer>
                    )}
                </AnimatePresence>
            </SidebarStyledBox>
        </div>
    );
};

export default ProvenanceBox;
