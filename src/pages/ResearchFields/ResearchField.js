import { Container, Row, Col } from 'reactstrap';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ResearchFieldHeader from 'components/ResearchField/ResearchFieldHeader';
import ObservatoriesCarousel from 'components/ObservatoriesCarousel/ObservatoriesCarousel';
import useResearchFieldObservatories from 'components/ResearchField/hooks/useResearchFieldObservatories';
import LastUpdatesBox from 'components/LastUpdatesBox/LastUpdatesBox';
import Comparisons from 'components/ResearchField/Comparisons';
import Papers from 'components/ResearchField/Papers';
import { useParams } from 'react-router-dom';
import ResearchProblemsBox from 'components/ResearchField/ResearchProblemsBox';

const ResearchField = () => {
    const { researchFieldId } = useParams();

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
                    <Col md="4" className="d-flex">
                        <LastUpdatesBox id={researchFieldId} />
                    </Col>
                    <Col md="4">
                        <div className="box rounded-lg flex-grow-1" style={{ overflow: 'hidden' }}>
                            <h5 className="pr-3 pl-3 pt-3 pb-2 m-0">Observatories</h5>
                            <hr className="mb-3 mt-0" />
                            <ObservatoriesCarousel observatories={observatories} isLoading={isLoadingObservatories} />
                        </div>
                    </Col>
                </Row>
            </Container>

            <Comparisons id={researchFieldId} boxShadow />
            <Papers id={researchFieldId} boxShadow />
        </>
    );
};

export default ResearchField;
