import { useState } from 'react';
import { AnimationContainer, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import { TransitionGroup } from 'react-transition-group';
import Provenance from './Provenance';
import Timeline from './Timeline';
import env from '@beam-australia/react-env';
import PWCProvenanceBox from 'components/Benchmarks/PWCProvenanceBox/PWCProvenanceBox';
import useProvenance from 'components/ViewPaper/hooks/useProvenance';

const ProvenanceBox = () => {
    const {
        paperResource,
        isLoadingProvenance,
        isLoadingContributors,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
        contributors
    } = useProvenance();

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
                        onKeyDown={e => (e.keyCode === 13 ? setActiveTab(1) : undefined)}
                        role="button"
                        tabIndex={0}
                    >
                        Provenance
                    </div>
                    <div
                        id="div2"
                        className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => setActiveTab(2)}
                        onKeyDown={e => (e.keyCode === 13 ? setActiveTab(2) : undefined)}
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
                                contributors={contributors}
                                createdBy={createdBy}
                                isLoadingProvenance={isLoadingProvenance}
                                isLoadingContributors={isLoadingContributors}
                            />
                        </AnimationContainer>
                    ) : (
                        <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <Timeline
                                observatoryInfo={observatoryInfo}
                                organizationInfo={organizationInfo}
                                paperResource={paperResource}
                                versions={versions}
                                createdBy={createdBy}
                                isLoadingContributors={isLoadingContributors}
                            />
                        </AnimationContainer>
                    )}
                </TransitionGroup>
            </SidebarStyledBox>
        </div>
    );
};

export default ProvenanceBox;
