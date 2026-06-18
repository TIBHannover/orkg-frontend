'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Spinner } from '@heroui/react';
import { capitalize } from 'lodash';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import useSWR from 'swr';

import OrganizationCard from '@/components/Cards/OrganizationCard/OrganizationCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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

    return (
        <>
            <TitleBar
                buttonGroup={
                    !!user &&
                    user.isCurationAllowed && (
                        <RequireAuthentication
                            component={Button}
                            size="sm"
                            className="button--orkg-secondary"
                            href={reverse(ROUTES.CREATE_ORGANIZATION, { type: params.id })}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Create{' '}
                            {label?.toLowerCase() === ORGANIZATIONS_MISC.GENERAL.toLowerCase() ? 'organization' : 'conference'}
                        </RequireAuthentication>
                    )
                }
            >
                {capitalize(pluralize(label?.toLowerCase() === ORGANIZATIONS_MISC.GENERAL.toLowerCase() ? 'organization' : 'conference'))}
            </TitleBar>
            <Container>
                <Card className="box rounded p-12">
                    <Card.Content className="p-0">
                        {organizations && organizations.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {organizations.map((organization) => (
                                    <OrganizationCard key={organization.displayId} organization={{ ...organization }} type={params.id} />
                                ))}
                            </div>
                        )}
                        {organizations && organizations.length === 0 && !isLoading && <div className="my-6 text-center">No {label}s yet</div>}
                        {isLoading && (
                            <div className="my-6 flex items-center justify-center gap-2">
                                <Spinner size="sm" /> Loading
                            </div>
                        )}
                    </Card.Content>
                </Card>
            </Container>
        </>
    );
};

export default Organizations;
