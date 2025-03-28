'use client';

import { Col, Container, Row } from 'reactstrap';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import ComparisonPopup from '@/components/ComparisonPopup/ComparisonPopup';
import LastUpdatesBox from '@/components/LastUpdatesBox/LastUpdatesBox';
import ObservatoriesCarousel from '@/components/ObservatoriesCarousel/ObservatoriesCarousel';
import useResearchFieldObservatories from '@/components/ResearchField/hooks/useResearchFieldObservatories';
import ResearchFieldHeader from '@/components/ResearchField/ResearchFieldHeader';
import ResearchFieldTabsContainer from '@/components/ResearchField/ResearchFieldTabsContainer';
import ResearchProblemsBox from '@/components/ResearchProblemsBox/ResearchProblemsBox';
import useParams from '@/components/useParams/useParams';

const ResearchField = () => {
    const { researchFieldId } = useParams();

    const { observatories, isLoading } = useResearchFieldObservatories({ researchFieldId });

    return (
        <>
            <Breadcrumbs researchFieldId={researchFieldId} disableLastField />
            <ResearchFieldHeader id={researchFieldId} />

            <Container className="p-0">
                <Row className="mt-4">
                    <Col md="4" className="d-flex">
                        <ResearchProblemsBox id={researchFieldId} by="ResearchField" />
                    </Col>
                    <Col md="4" className="d-flex mt-3 mt-md-0">
                        <LastUpdatesBox researchFieldId={researchFieldId} />
                    </Col>
                    <Col md="4" className="mt-3 mt-md-0 d-flex">
                        <div className="box rounded-3 flex-grow-1 flex-column d-flex" style={{ overflow: 'hidden' }}>
                            <h5 className="pe-3 ps-3 pt-3 pb-2 m-0">Observatories</h5>
                            <hr className="mb-3 mt-0" />
                            <ObservatoriesCarousel observatories={observatories} isLoading={isLoading} />
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container className="p-0 mt-2">
                <ResearchFieldTabsContainer id={researchFieldId} />
            </Container>

            <ComparisonPopup />
        </>
    );
};

export default ResearchField;
