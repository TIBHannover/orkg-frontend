import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { getOrganization } from 'services/backend/organizations';
import InternalServerError from 'pages/InternalServerError';
import Members from 'components/Organization/Members';
import Observatories from 'components/Organization/Observatories';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faGlobe, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from 'pages/NotFound';
import styled from 'styled-components';
import ROUTES from 'constants/routes';
import EditOrganization from 'components/Organization/EditOrganization';
import { SubTitle } from 'components/styled';
import { reverse } from 'named-urls';
import TitleBar from 'components/TitleBar/TitleBar';
import { ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import ConferenceEvents from 'components/Organization/ConferenceEvents';

const StyledOrganizationHeader = styled.div`
    .logoContainer {
        position: relative;
        display: block;
        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 130px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 130px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;

const Organization = () => {
    const [error, setError] = useState(null);
    const [label, setLabel] = useState(null);
    const [url, setURL] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [logo, setLogo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [type, setType] = useState(null);
    const [date, setDate] = useState(null);
    const [isDoubleBlind, setIsDoubleBlind] = useState(false);
    const [doi, setDoi] = useState(null);
    const { id } = useParams();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        const findOrg = () => {
            setIsLoading(true);
            getOrganization(id)
                .then(responseJson => {
                    document.title = `${responseJson.name} - Organization - ORKG`;
                    setOrganizationId(responseJson.id);
                    setLabel(responseJson.name);
                    setURL(responseJson.homepage);
                    setLogo(responseJson.logo);
                    setIsLoading(false);
                    setCreatedBy(responseJson.created_by);
                    setType(responseJson.type);
                    setDate(responseJson.metadata && responseJson.metadata.date ? responseJson.metadata.date : '');
                    setIsDoubleBlind(responseJson.metadata && responseJson.metadata.is_double_blind && responseJson.metadata.is_double_blind);
                    setDoi(responseJson.doi);
                })
                .catch(error => {
                    setIsLoading(false);
                    setError(error);
                });
        };
        findOrg();
    }, [id]);

    const updateOrganizationMetadata = (label, url, logo, type, date, isDoubleBlind) => {
        setLabel(label);
        setURL(url);
        setLogo(logo);
        setType(type);
        setDate(date);
        setIsDoubleBlind(isDoubleBlind);
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && label && (
                <>
                    <TitleBar
                        titleAddition={<SubTitle>Organization</SubTitle>}
                        buttonGroup={
                            !!user &&
                            (user.id === createdBy || user.isCurationAllowed) && (
                                <>
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        tag={Link}
                                        to={reverse(ROUTES.ADD_OBSERVATORY, { id: organizationId })}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faPlus} /> Create observatory
                                    </Button>
                                    <Button color="secondary" size="sm" onClick={() => setShowEditDialog(v => !v)}>
                                        <Icon icon={faPen} /> Edit
                                    </Button>
                                </>
                            )
                        }
                        wrap={false}
                    >
                        {label}
                    </TitleBar>
                    <Container className="p-3 box rounded">
                        <StyledOrganizationHeader className="mb-2 py-2">
                            <Row>
                                <Col md={{ size: 8, order: 1 }} sm={{ size: 12, order: 2 }} xs={{ size: 12, order: 2 }}>
                                    <a className="p-0 mt-2" href={url} target="_blank" rel="noopener noreferrer">
                                        <Icon size="sm" icon={faGlobe} /> {url} {url && <Icon size="sm" icon={faExternalLinkAlt} />}
                                    </a>
                                </Col>
                                {logo && (
                                    <Col md={{ size: 4, order: 2 }} sm={{ size: 12, order: 1 }} xs={{ size: 12, order: 1 }}>
                                        <a className="p-0" href={url} target="_blank" rel="noopener noreferrer">
                                            <div className="logoContainer">
                                                <img className="mx-auto" src={logo} alt={`${label} logo`} />
                                            </div>
                                        </a>
                                    </Col>
                                )}
                            </Row>
                        </StyledOrganizationHeader>
                        <hr />

                        <Members organizationsId={organizationId} />
                    </Container>
                    {type === ORGANIZATIONS_MISC.CONFERENCE && doi ? (
                        <ConferenceEvents organizationId={organizationId} conferenceDoi={doi} />
                    ) : (
                        <Observatories organizationsId={organizationId} />
                    )}
                </>
            )}
            <EditOrganization
                showDialog={showEditDialog}
                toggle={() => setShowEditDialog(v => !v)}
                label={label ?? ''}
                id={organizationId}
                url={url}
                previewSrc={logo}
                updateOrganizationMetadata={updateOrganizationMetadata}
                type={type || ''}
                date={date || ''}
                isDoubleBlind={isDoubleBlind || false}
            />
        </>
    );
};

export default Organization;
