import { useState, useEffect } from 'react';
import { Col, Row, Container, Button } from 'reactstrap';
import { getOrganization } from 'services/backend/organizations';
import { getObservatoryById } from 'services/backend/observatories';
import InternalServerError from 'pages/InternalServerError';
import EditObservatory from 'components/Observatory/EditObservatory';
import ResearchProblemsBox from 'components/ResearchProblemsBox/ResearchProblemsBox';
import OrganizationsBox from 'components/Observatory/OrganizationsBox';
import IntegratedList from 'components/Observatory/IntegratedList';
import MembersBox from 'components/Observatory/MembersBox';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import NotFound from 'pages/NotFound';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TitleBar from 'components/TitleBar/TitleBar';

const Observatory = () => {
    const [error, setError] = useState(null);
    const [observatoryId, setObservatoryId] = useState(null);
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
                    setObservatoryId(observatory.id);
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

    const toggleOrganizationItem = organization => {
        setOrganizationsList(v => (v.map(o => o.id).includes(organization.id) ? v.filter(t => t !== organization) : [organization, ...v]));
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && label && (
                <>
                    <Breadcrumbs researchFieldId={researchField?.id} />
                    <TitleBar
                        titleAddition={
                            <>
                                <SubtitleSeparator />
                                <SubTitle>{label}</SubTitle>
                            </>
                        }
                        buttonGroup={
                            !!user &&
                            user.isCurationAllowed && (
                                <Button color="secondary" size="sm" onClick={() => setShowEditDialog(v => !v)}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )
                        }
                        wrap={false}
                    >
                        Observatory
                    </TitleBar>
                    {description && (
                        <Container className="box rounded py-3 px-4 mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                            <p className="m-0">{description}</p>
                        </Container>
                    )}
                    <Container className="p-0">
                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <ResearchProblemsBox id={observatoryId} by="Observatory" organizationsList={organizationsList} />
                            </Col>
                            <Col md="4" className="d-flex">
                                <OrganizationsBox
                                    observatoryId={observatoryId}
                                    organizationsList={organizationsList}
                                    isLoadingOrganizations={isLoadingOrganizations}
                                    toggleOrganizationItem={toggleOrganizationItem}
                                />
                            </Col>
                            <Col md="4" className="d-flex">
                                <MembersBox observatoryId={observatoryId} organizationsList={organizationsList} />
                            </Col>
                        </Row>
                    </Container>

                    <IntegratedList id={observatoryId} slug={id} boxShadow />

                    <EditObservatory
                        showDialog={showEditDialog}
                        toggle={() => setShowEditDialog(v => !v)}
                        label={label}
                        id={observatoryId}
                        description={description}
                        researchField={researchField}
                        updateObservatoryMetadata={updateObservatoryMetadata}
                    />
                </>
            )}
        </>
    );
};

export default Observatory;
