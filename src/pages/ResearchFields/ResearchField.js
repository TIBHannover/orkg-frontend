import { Container, Row, Col } from 'reactstrap';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ResearchFieldHeader from 'components/ResearchField/ResearchFieldHeader';
import ObservatoriesCarousel from 'components/ObservatoriesCarousel/ObservatoriesCarousel';
import useResearchFieldObservatories from 'components/ResearchField/hooks/useResearchFieldObservatories';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import IntegratedList from 'components/ResearchField/IntegratedList';
import { useParams } from 'react-router-dom';
import ResearchProblemsBox from 'components/ResearchProblemsBox/ResearchProblemsBox';

const ResearchField = () => {
    const { researchFieldId, slug } = useParams();

    const [observatories, isLoadingObservatories] = useResearchFieldObservatories({ researchFieldId });

    return (
        <>
            <Breadcrumbs researchFieldId={researchFieldId} disableLastField />
            <ResearchFieldHeader id={researchFieldId} />

            <Container className="p-0">
                <Row className="mt-3">
                    <Col md="4" className="d-flex">
                        <ResearchProblemsBox id={researchFieldId} />
                    </Col>
                    <Col md="4" className="d-flex mt-3 mt-md-0">
                        <LastUpdatesBox researchFieldId={researchFieldId} />
                    </Col>
                    <Col md="4" className="mt-3 mt-md-0">
                        <div className="box rounded-3 flex-grow-1" style={{ overflow: 'hidden' }}>
                            <h5 className="pe-3 ps-3 pt-3 pb-2 m-0">Observatories</h5>
                            <hr className="mb-3 mt-0" />
                            <ObservatoriesCarousel observatories={observatories} isLoading={isLoadingObservatories} />
                        </div>
                    </Col>
                </Row>
            </Container>

            <IntegratedList slug={slug} id={researchFieldId} boxShadow />
            <ComparisonPopup />
        </>
    );
};

export default ResearchField;
