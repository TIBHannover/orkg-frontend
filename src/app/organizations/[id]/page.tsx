'use client';

import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { capitalize } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import { Container } from 'reactstrap';
import useSWR from 'swr';

import OrganizationCard from '@/components/Cards/OrganizationCard/OrganizationCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { getAllOrganizations, getConferences, organizationsUrl } from '@/services/backend/organizations';

const Organizations = () => {
    const params = useParams();

    const { label, alternateLabel } = ORGANIZATIONS_TYPES.find((t) => t.label === params.id) ?? {};

    const { user } = useAuthentication();

    const { data: organizations, isLoading } = useSWR([alternateLabel, organizationsUrl, 'getAllOrganizations'], () =>
        alternateLabel === ORGANIZATIONS_MISC.ORGANIZATION ? getAllOrganizations() : getConferences(),
    );

    useEffect(() => {
        document.title = `${label}s - ORKG`;
    }, [label]);

    const route = alternateLabel === ORGANIZATIONS_MISC.ORGANIZATION ? ROUTES.ORGANIZATION : ROUTES.EVENT;

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
                            <FontAwesomeIcon icon={faPlus} /> Create {label}
                        </RequireAuthentication>
                    )
                }
            >
                {capitalize(pluralize(label ?? ''))}
            </TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5 clearfix">
                {organizations && organizations.length > 0 && (
                    <div className="mt-3 row justify-content-center">
                        {organizations.map((organization) => (
                            <OrganizationCard key={organization.display_id} organization={{ ...organization }} route={route} type={params.id} />
                        ))}
                    </div>
                )}
                {organizations && organizations.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No {label}s yet</div>}
                {isLoading && (
                    <div className="text-center mt-4 mb-4">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

export default Organizations;
