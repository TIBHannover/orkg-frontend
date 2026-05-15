'use client';

import { env } from 'next-runtime-env';

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
import Container from '@/components/Ui/Structure/Container';
import { RESOURCES } from '@/constants/graphSettings';

export default function Home() {
    const { selectedFieldId, selectedFieldLabel, researchFields, isLoadingFields } = useResearchFieldSelector();

    return (
        <Container style={{ marginTop: env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true' ? 0 : -70 }}>
            <HomeAlerts />
            <div className="relative z-10 box rounded-lg p-4" id="research-field-cards">
                <ResearchFieldCards
                    selectedFieldLabel={selectedFieldLabel}
                    selectedFieldId={selectedFieldId.toString()}
                    researchFields={researchFields}
                    isLoading={isLoadingFields}
                />
            </div>
            {selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && <div className="text-2xl mt-6 mb-2 pl-4">{selectedFieldLabel}</div>}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="md:w-2/3 min-w-0">
                    <HomeTabsContainer researchFieldId={selectedFieldId.toString()} researchFieldLabel={selectedFieldLabel} />
                </div>
                <div className="md:w-1/3 min-w-0 flex flex-col gap-4">
                    <MastodonTimeline />

                    <div className="box rounded p-5">
                        <h2 className="text-xl mb-2 mt-0">ORKG stories</h2>
                        <hr className="mb-3 mt-0" />
                        <p className="m-0 leading-relaxed">
                            See how researchers benefit from using ORKG. <br />
                            <a href="https://orkg.org/about/36/ORKG_Stories" rel="noopener noreferrer">
                                Find out more
                            </a>
                        </p>
                    </div>

                    <News />

                    <div className="box rounded flex flex-col overflow-hidden">
                        <Benefits />
                    </div>

                    <ObservatoriesBox researchFieldId={selectedFieldId.toString()} />

                    <ContributorsBox researchFieldId={selectedFieldId.toString()} />

                    <LastUpdatesBox researchFieldId={selectedFieldId.toString()} />
                </div>
            </div>
            <HelpTour />
        </Container>
    );
}
