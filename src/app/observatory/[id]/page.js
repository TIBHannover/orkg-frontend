'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row, Container, Button } from 'reactstrap';
import { getOrganization } from 'services/backend/organizations';
import { getObservatoryById } from 'services/backend/observatories';
import InternalServerError from 'app/error';
import EditObservatory from 'components/Observatory/EditObservatory';
import ResearchProblemsBox from 'components/ResearchProblemsBox/ResearchProblemsBox';
import OrganizationsBox from 'components/Observatory/OrganizationsBox';
import IntegratedList from 'components/Observatory/IntegratedList';
import MembersBox from 'components/Observatory/MembersBox';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { SubTitle } from 'components/styled';
import NotFound from 'app/not-found';
import useParams from 'components/NextJsMigration/useParams';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TitleBar from 'components/TitleBar/TitleBar';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import ObservatoryModal from 'components/Observatory/ObservatoryModal/ObservatoryModal';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';

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
    const [showDialogInfo, setShowDialogInfo] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const { id } = useParams();
    const user = useSelector(state => state.auth.user);

    const loadOrganizations = organizationsData => {
        setIsLoadingOrganizations(true);
        Promise.all(organizationsData.map(o => getOrganization(o))).then(data => {
            setOrganizationsList(data);
            setIsLoadingOrganizations(false);
        });
    };

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
                        titleAddition={<SubTitle>Observatory</SubTitle>}
                        buttonGroup={
                            <RequireAuthentication
                                component={Button}
                                className="flex-shrink-0"
                                color={isEditMode ? 'secondary-darker' : 'secondary'}
                                size="sm"
                                onClick={() => (!!user && user.isCurationAllowed ? setIsEditMode(!isEditMode) : setShowDialogInfo(v => !v))}
                            >
                                {isEditMode ? (
                                    <>
                                        <Icon icon={faTimes} /> Stop Editing
                                    </>
                                ) : (
                                    <>
                                        <Icon icon={faPen} /> Edit
                                    </>
                                )}
                            </RequireAuthentication>
                        }
                        wrap={false}
                    >
                        {label}
                    </TitleBar>

                    <EditModeHeader isVisible={isEditMode} />
                    <Container
                        className={`box py-3 px-4 mb-4 clearfix position-relative 
                              ${isEditMode ? 'rounded-bottom' : 'rounded'}`}
                    >
                        <>
                            {description && (
                                <p className="m-0" style={{ whiteSpace: 'pre-wrap' }}>
                                    {description || <small className="fst-italic">No Description provided</small>}
                                </p>
                            )}

                            {isEditMode && (
                                <div className="flex-grow-1">
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        className="mt-2"
                                        style={{ marginLeft: 'auto' }}
                                        onClick={() => setShowEditDialog(v => !v)}
                                    >
                                        <Icon icon={faPen} /> Edit data
                                    </Button>
                                </div>
                            )}
                        </>
                    </Container>

                    <Container className="p-0">
                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <ResearchProblemsBox isEditMode={isEditMode} id={observatoryId} by="Observatory" />
                            </Col>
                            <Col md="4" className="d-flex">
                                <OrganizationsBox
                                    isEditMode={isEditMode}
                                    observatoryId={observatoryId}
                                    organizationsList={organizationsList}
                                    isLoadingOrganizations={isLoadingOrganizations}
                                    toggleOrganizationItem={toggleOrganizationItem}
                                />
                            </Col>
                            <Col md="4" className="d-flex">
                                <MembersBox isEditMode={isEditMode} observatoryId={observatoryId} organizationsList={organizationsList} />
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
                    <ObservatoryModal isOpen={showDialogInfo} toggle={() => setShowDialogInfo(v => !v)} />

                    <ComparisonPopup />
                </>
            )}
        </>
    );
};

export default Observatory;
