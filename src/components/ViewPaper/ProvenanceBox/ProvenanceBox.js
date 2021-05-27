import { useState, useEffect } from 'react';
import { AnimationContainer, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import { TransitionGroup } from 'react-transition-group';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryById } from 'services/backend/observatories';
import { getContributorsByResourceId } from 'services/backend/resources';
import { getOrganization } from 'services/backend/organizations';
import { useSelector } from 'react-redux';
import { MISC } from 'constants/graphSettings';
import Provenance from './Provenance';
import Timeline from './Timeline';

const ProvenanceBox = () => {
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
    const [isLoadingContributors, setIsLoadingContributors] = useState(true);
    const [observatoryInfo, setObservatoryInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [contributors, setContributors] = useState([]);

    useEffect(() => {
        const loadContributors = () => {
            setIsLoadingContributors(true);
            getContributorsByResourceId(paperResource.id)
                .then(contributors => {
                    setContributors(contributors ? contributors.reverse() : []);
                    setIsLoadingContributors(false);
                })
                .catch(error => {
                    setIsLoadingContributors(false);
                });
        };
        const loadProvenance = () => {
            setIsLoadingProvenance(true);
            const observatoryCall =
                paperResource.observatory_id !== MISC.UNKNOWN_ID
                    ? getObservatoryById(paperResource.observatory_id).catch(e => null)
                    : Promise.resolve(null);

            const organizationCall =
                paperResource.organization_id !== MISC.UNKNOWN_ID
                    ? getOrganization(paperResource.organization_id).catch(e => null)
                    : Promise.resolve(null);

            Promise.all([observatoryCall, organizationCall])
                .then(([observatory, organization]) => {
                    setObservatoryInfo(observatory);
                    setOrganizationInfo(organization);
                    setIsLoadingProvenance(false);
                })
                .catch(() => setIsLoadingProvenance(false));
        };

        const loadCreator = () => {
            if (paperResource.created_by && paperResource.created_by !== MISC.UNKNOWN_ID) {
                getContributorInformationById(paperResource.created_by)
                    .then(creator => {
                        setCreatedBy(creator);
                    })
                    .catch(e => setCreatedBy(null));
            } else {
                setCreatedBy(null);
            }
        };

        loadContributors();
        loadProvenance();
        loadCreator();
    }, [paperResource.created_by, paperResource.id, paperResource.observatory_id, paperResource.organization_id]);

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div className="col-md-3">
            <SidebarStyledBox className="box rounded-lg" style={{ minHeight: 430, backgroundColor: '#f8f9fb' }}>
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
                                contributors={contributors}
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
