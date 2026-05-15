'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import LastUpdatesBox from '@/components/LastUpdatesBox/LastUpdatesBox';
import ObservatoriesCarousel from '@/components/ObservatoriesCarousel/ObservatoriesCarousel';
import useResearchFieldObservatories from '@/components/ResearchField/hooks/useResearchFieldObservatories';
import ResearchFieldHeader from '@/components/ResearchField/ResearchFieldHeader';
import ResearchFieldTabsContainer from '@/components/ResearchField/ResearchFieldTabsContainer';
import ResearchProblemsBox from '@/components/ResearchProblemsBox/ResearchProblemsBox';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';

const ResearchField = () => {
    const { researchFieldId } = useParams();

    const { observatories, isLoading } = useResearchFieldObservatories({ researchFieldId });

    return (
        <>
            <Breadcrumbs researchFieldId={researchFieldId} />
            <ResearchFieldHeader id={researchFieldId} />
            <Container className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex">
                        <ResearchProblemsBox id={researchFieldId} by="ResearchField" />
                    </div>
                    <div className="flex">
                        <LastUpdatesBox researchFieldId={researchFieldId} />
                    </div>
                    <div className="flex">
                        <div className="box rounded-lg grow flex-col flex overflow-hidden">
                            <h5 className="pr-4 pl-4 pt-4 pb-2 m-0">Observatories</h5>
                            <hr className="mb-4 mt-0" />
                            <ObservatoriesCarousel observatories={observatories} isLoading={isLoading} />
                        </div>
                    </div>
                </div>
            </Container>
            <Container className="mt-2">
                <ResearchFieldTabsContainer id={researchFieldId} />
            </Container>
        </>
    );
};

export default ResearchField;
