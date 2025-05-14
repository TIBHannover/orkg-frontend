'use client';

import { env } from 'next-runtime-env';
import { Helmet } from 'react-helmet';
import { Col, Container, Row } from 'reactstrap';

import Benefits from '@/components/Home/Benefits';
import HelpTour from '@/components/Home/HelpTour';
import HomeTabsContainer from '@/components/Home/HomeTabsContainer';
import useResearchFieldSelector from '@/components/Home/hooks/useResearchFieldSelector';
import MastodonTimeline from '@/components/Home/MastodonTimeline';
import News from '@/components/Home/News';
import ObservatoriesBox from '@/components/Home/ObservatoriesBox';
import ResearchFieldCards from '@/components/Home/ResearchFieldCards';
import HomeAlerts from '@/components/HomeAlerts/HomeAlerts';
import LastUpdatesBox from '@/components/LastUpdatesBox/LastUpdatesBox';
import ContributorsBox from '@/components/TopContributors/ContributorsBox';
import { RESOURCES } from '@/constants/graphSettings';

export default function Home() {
    const { selectedFieldId, selectedFieldLabel, researchFields, isLoadingFields } = useResearchFieldSelector();

    return (
        <Container style={{ marginTop: env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true' ? 20 : -70 }}>
            <Helmet>
                <title>Open Research Knowledge Graph</title>
                <meta property="og:title" content="Open Research Knowledge Graph" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:description"
                    content="The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are easier to find and compare."
                />
            </Helmet>
            <HomeAlerts />
            <Row style={{ position: 'relative', zIndex: 99 }}>
                <Col md="12">
                    <div className="box rounded-3 p-3" id="research-field-cards">
                        <ResearchFieldCards
                            selectedFieldLabel={selectedFieldLabel}
                            selectedFieldId={selectedFieldId.toString()}
                            researchFields={researchFields}
                            isLoading={isLoadingFields}
                        />
                    </div>
                </Col>
            </Row>
            {selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && <div className="h4 mt-4 mb-2 ps-3">{selectedFieldLabel}</div>}
            <Row>
                <Col md="8">
                    <div className="mt-3">
                        <HomeTabsContainer researchFieldId={selectedFieldId.toString()} researchFieldLabel={selectedFieldLabel} />
                    </div>
                </Col>
                <Col md="4">
                    <MastodonTimeline />

                    <div className="mt-3 box rounded p-3">
                        <h2 className="h5 mb-0 mt-0">ORKG stories</h2>
                        <hr className="mt-2" />
                        <p className="m-0">
                            See how researchers benefit from using ORKG. <br />
                            <a href="https://orkg.org/about/36/ORKG_Stories" rel="noopener noreferrer">
                                Find out more
                            </a>
                        </p>
                    </div>

                    <News />

                    <div className="mt-3 box rounded d-flex flex-column overflow-hidden">
                        <Benefits />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ObservatoriesBox researchFieldId={selectedFieldId.toString()} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ContributorsBox researchFieldId={selectedFieldId.toString()} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <LastUpdatesBox researchFieldId={selectedFieldId.toString()} />
                    </div>
                </Col>
            </Row>

            <HelpTour />
        </Container>
    );
}
