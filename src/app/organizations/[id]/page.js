'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import OrganizationCard from 'components/Cards/OrganizationCard/OrganizationCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { getAllOrganizations, getConferences } from 'services/backend/organizations';
import useParams from 'components/useParams/useParams';
import ROUTES from 'constants/routes';
import TitleBar from 'components/TitleBar/TitleBar';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';
import { ORGANIZATIONS_TYPES, ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import { capitalize } from 'lodash';
import pluralize from 'pluralize';

const Organizations = () => {
    const params = useParams();
    const [organizations, setOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [route, setRoute] = useState('');
    const typeName = ORGANIZATIONS_TYPES.find((t) => t.label === params.id).alternateLabel;
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const loadOrganizations = (type) => {
            setIsLoading(true);
            let organizationsList = [];
            setOrganizations([]);
            if (type === ORGANIZATIONS_MISC.ORGANIZATION) {
                organizationsList = getAllOrganizations();
                setRoute(ROUTES.ORGANIZATION);
            } else if (type === ORGANIZATIONS_MISC.CONFERENCE) {
                organizationsList = getConferences();
                setRoute(ROUTES.EVENT);
            }

            Promise.resolve(organizationsList)
                .then((orgs) => {
                    if (orgs.length > 0) {
                        setOrganizations(orgs);
                        setIsLoading(false);
                    } else {
                        setIsLoading(false);
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                });
        };
        loadOrganizations(typeName);
        document.title = `${typeName}s - ORKG`;
    }, [typeName]);

    return (
        <>
            <TitleBar
                buttonGroup={
                    !!user &&
                    user.isCurationAllowed && (
                        <RequireAuthentication
                            component={Link}
                            color="secondary"
                            size="sm"
                            className="btn btn-secondary btn-sm flex-shrink-0"
                            href={reverse(ROUTES.ADD_ORGANIZATION, { type: params.id })}
                        >
                            <Icon icon={faPlus} /> Create {typeName}
                        </RequireAuthentication>
                    )
                }
            >
                {capitalize(pluralize(typeName))}
            </TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5 clearfix">
                {organizations.length > 0 && (
                    <div className="mt-3 row justify-content-center">
                        {organizations.map((organization) => (
                            <OrganizationCard key={organization.display_id} organization={{ ...organization }} route={route} type={params.id} />
                        ))}
                    </div>
                )}
                {organizations.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No {typeName}s yet</div>}
                {isLoading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

export default Organizations;
