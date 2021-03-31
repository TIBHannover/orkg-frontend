import { useState, useEffect } from 'react';
import { Col, Row, Container, Button, ButtonGroup, Card, CardBody, CardTitle } from 'reactstrap';
import { getOrganization } from 'services/backend/organizations';
import { getObservatoryById } from 'services/backend/observatories';
import InternalServerError from 'pages/InternalServerError';
import EditObservatory from 'components/Observatory/EditObservatory';
import Comparisons from 'components/Observatory/Comparisons';
import Papers from 'components/Observatory/Papers';
import ResearchProblemsBox from 'components/Observatory/ResearchProblemsBox';
import OrganizationsBox from 'components/Observatory/OrganizationsBox';
import MembersBox from 'components/Observatory/MembersBox';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import NotFound from 'pages/NotFound';
import ROUTES from 'constants/routes';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { reverseWithSlug } from 'utils';

const Observatory = () => {
    const [error, setError] = useState(null);
    const [label, setLabel] = useState(null);
    const [description, setDescription] = useState('');
    const [researchField, setResearchField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
    const [organizationsList, setOrganizationsList] = useState([]);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const { id } = useParams();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        const loadObservatory = () => {
            setIsLoading(true);
            getObservatoryById(id)
                .then(observatory => {
                    document.title = `${observatory.name} - Details`;
                    setLabel(observatory.name);
                    setDescription(observatory.description);
                    setIsLoading(false);
                    setResearchField(observatory.research_field);
                    loadOrganizations(observatory.organization_ids);
                })
                .catch(error => {
                    setIsLoading(false);
                    setError(error);
                });
        };
        loadObservatory();
    }, [id]);

    const loadOrganizations = organizationsData => {
        setIsLoadingOrganizations(true);
        Promise.all(organizationsData.map(o => getOrganization(o))).then(data => {
            setOrganizationsList(data);
            setIsLoadingOrganizations(false);
        });
    };

    const updateObservatoryMetadata = (label, description, researchField) => {
        setLabel(label);
        setDescription(description);
        setIsLoading(false);
        setResearchField(researchField);
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && label && (
                <>
                    <Breadcrumbs researchFieldId={researchField?.id} />

                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <h1 className="h5 flex-shrink-0 mb-0">Observatory</h1>
                        <>
                            <SubtitleSeparator />
                            <SubTitle className="h5 mb-0"> {label}</SubTitle>
                        </>
                        {!!user && user.isCurationAllowed && (
                            <ButtonGroup className="flex-shrink-0" style={{ marginLeft: 'auto' }}>
                                <Button color="darkblue" size="sm" onClick={() => setShowEditDialog(v => !v)}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            </ButtonGroup>
                        )}
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <CardTitle tag="h5">Description</CardTitle>
                                {description && <div className="mb-4">{description}</div>}
                                {!description && <div className="mb-4">No description for this observatory yet!</div>}
                            </CardBody>
                        </Card>
                    </Container>
                </>
            )}

            <Container className="p-0">
                <Row className="mt-3">
                    <Col md="4" className="d-flex">
                        <ResearchProblemsBox observatoryId={id} organizationsList={organizationsList} />
                    </Col>
                    <Col md="4" className="d-flex">
                        <OrganizationsBox observatoryId={id} organizationsList={organizationsList} isLoadingOrganizations={isLoadingOrganizations} />
                    </Col>
                    <Col md="4" className="d-flex">
                        <MembersBox observatoryId={id} organizationsList={organizationsList} />
                    </Col>
                </Row>
            </Container>

            <Comparisons observatoryId={id} />

            <Papers observatoryId={id} />

            <EditObservatory
                showDialog={showEditDialog}
                toggle={() => setShowEditDialog(v => !v)}
                label={label}
                id={id}
                description={description}
                researchField={researchField}
                updateObservatoryMetadata={updateObservatoryMetadata}
            />
        </>
    );
};

export default Observatory;
