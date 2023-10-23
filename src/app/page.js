'use client';

import { Container, Row, Col } from 'reactstrap';
import ResearchFieldCards from 'components/Home/ResearchFieldCards';
import ObservatoriesBox from 'components/Home/ObservatoriesBox';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Benefits from 'components/Home/Benefits';
import News from 'components/Home/News';
import ContributorsBox from 'components/TopContributors/ContributorsBox';
import useResearchFieldSelector from 'components/Home/hooks/useResearchFieldSelector';
import { RESOURCES } from 'constants/graphSettings';
import { Helmet } from 'react-helmet';
import env from 'components/NextJsMigration/env';
import HomeAlerts from 'components/HomeAlerts/HomeAlerts';
import HelpTour from 'components/Home/HelpTour';
import MastodonTimeline from 'components/Home/MastodonTimeline';
import HomeTabsContainer from 'components/Tabs/HomeTabsContainer';

export default function Home() {
    const { selectedFieldId, selectedFieldLabel, researchFields, isLoadingFields } = useResearchFieldSelector();

    return (
        <Container style={{ marginTop: env('IS_TESTING_SERVER') === 'true' ? -20 : -70 }}>
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
                            selectedFieldId={selectedFieldId}
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
                        <HomeTabsContainer researchFieldId={selectedFieldId} researchFieldLabel={selectedFieldLabel} />
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
                        <ObservatoriesBox researchFieldId={selectedFieldId} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <ContributorsBox researchFieldId={selectedFieldId} />
                    </div>

                    <div className="mt-3 d-flex flex-column">
                        <LastUpdatesBox researchFieldId={selectedFieldId} />
                    </div>
                </Col>
            </Row>

            <HelpTour />
        </Container>
    );
}
