'use client';

import { faExternalLinkAlt, faGlobe, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import ConferenceEvents from 'components/ConferenceEvents/ConferenceEvents';
import EditOrganization from 'components/Organization/EditOrganization';
import Members from 'components/Organization/Members';
import Observatories from 'components/Organization/Observatories';
import { SubTitle } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import useParams from 'components/useParams/useParams';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import { upperFirst } from 'lodash';
import { reverse } from 'named-urls';
import useAuthentication from 'components/hooks/useAuthentication';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'reactstrap';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import styled from 'styled-components';

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
    const { id, type: orgType } = useParams();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState(null);
    const [url, setURL] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [logo, setLogo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const typeName = ORGANIZATIONS_TYPES.find((t) => t.label === orgType).alternateLabel;
    const { user } = useAuthentication();

    useEffect(() => {
        const findOrg = () => {
            setIsLoading(true);
            getOrganization(id)
                .then((responseJson) => {
                    document.title = `${responseJson.name} - ${typeName} - ORKG`;
                    setOrganizationId(responseJson.id);
                    setLabel(responseJson.name);
                    setURL(responseJson.homepage);
                    setLogo(getOrganizationLogoUrl(responseJson?.id));
                    setIsLoading(false);
                    setCreatedBy(responseJson.created_by);
                })
                .catch((_error) => {
                    setIsLoading(false);
                    setError(_error);
                });
        };
        findOrg();
    }, [id, typeName]);

    const updateOrganizationMetadata = (_label, _url, _logo) => {
        setLabel(_label);
        setURL(_url);
        setLogo(_logo);
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />}</>}
            {!isLoading && !error && label && (
                <>
                    <TitleBar
                        titleAddition={<SubTitle>{upperFirst(typeName)}</SubTitle>}
                        buttonGroup={
                            !!user &&
                            (user.id === createdBy || user.isCurationAllowed) && (
                                <>
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        tag={Link}
                                        href={
                                            typeName === 'organization'
                                                ? reverse(`${ROUTES.ADD_OBSERVATORY}?organizationId=${organizationId}`)
                                                : reverse(ROUTES.ADD_EVENT, {
                                                      id: organizationId,
                                                  })
                                        }
                                        style={{ marginRight: 2 }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} /> Create {typeName === 'organization' ? 'observatory' : 'conference event'}
                                    </Button>
                                    <Button color="secondary" size="sm" onClick={() => setShowEditDialog((v) => !v)}>
                                        <FontAwesomeIcon icon={faPen} /> Edit
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
                                        <FontAwesomeIcon size="sm" icon={faGlobe} /> {url}{' '}
                                        {url && <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />}
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
                        {ORGANIZATIONS_MISC.GENERAL === ORGANIZATIONS_TYPES.find((t) => t.label === orgType)?.id && (
                            <>
                                <hr />
                                <Members organizationsId={organizationId} />
                            </>
                        )}
                    </Container>
                    {ORGANIZATIONS_MISC.EVENT === ORGANIZATIONS_TYPES.find((t) => t.label === orgType)?.id && (
                        <ConferenceEvents conferenceId={organizationId} conferenceName={label} />
                    )}
                    {ORGANIZATIONS_MISC.GENERAL === ORGANIZATIONS_TYPES.find((t) => t.label === orgType)?.id && (
                        <Observatories organizationsId={organizationId} />
                    )}
                </>
            )}
            <EditOrganization
                showDialog={showEditDialog}
                toggle={() => setShowEditDialog((v) => !v)}
                label={label ?? ''}
                id={organizationId}
                url={url}
                previewSrc={logo}
                updateOrganizationMetadata={updateOrganizationMetadata}
                typeName={typeName}
            />
        </>
    );
};

export default Organization;
