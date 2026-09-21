import { OrganizationFromJSON, OrganizationsApi, OrganizationsApiUpdateRequest } from '@orkg/orkg-client';

import { url as backendURL } from '@/constants/misc';
import backendApi, { configuration, getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { Contributor, Observatory, Organization } from '@/services/backend/types';

export const organizationsUrl = `${backendURL}organizations/`;
// POST /organizations, /{id}/observatories, /{id}/users and /conferences have no generated
// client operation yet (reported spec gaps), so part of this service stays on ky
const organizationsApi = backendApi.extend(() => ({ prefixUrl: organizationsUrl }));

const organizationsApiClient = new OrganizationsApi(configuration);

export const getAllOrganizations = () => organizationsApiClient.findAll();

export const getOrganization = (id: string): Promise<Organization> => organizationsApiClient.findById({ id });

export const getOrganizationLogoUrl = (id: string): string => `${organizationsUrl}${encodeURIComponent(id)}/logo`;

export const createOrganization = (
    organization_name: string,
    organization_logo: string,
    created_by: string,
    url: string,
    display_id: string,
    type: string,
    description?: string,
) =>
    organizationsApi
        .post<Organization>('', { json: { organization_name, organization_logo, created_by, url, display_id, type, description } })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateOrganization = (params: OrganizationsApiUpdateRequest): Promise<void> => organizationsApiClient.update(params);

export const getAllObservatoriesByOrganizationId = (id: string) =>
    organizationsApi.get<Observatory[]>(`${encodeURIComponent(id)}/observatories`).json();

export const getUsersByOrganizationId = (id: string): Promise<Contributor[]> =>
    organizationsApi
        .get<Record<string, string>[]>(`${encodeURIComponent(id)}/users`)
        .json()
        // the endpoint answers in wire format (snake_case); map onto the generated Contributor
        // shape so consumers don't need dual-shape fallbacks
        .then((members) =>
            members.map(
                (member) =>
                    ({
                        id: member.id,
                        displayName: member.display_name,
                        joinedAt: member.joined_at,
                        organizationId: member.organization_id,
                        observatoryId: member.observatory_id,
                        gravatarId: member.gravatar_id,
                        avatarUrl: member.avatar_url,
                    }) as Contributor,
            ),
        );

export const getConferences = (): Promise<Organization[]> =>
    organizationsApi
        .get<unknown[]>(`conferences`)
        .json()
        .then((data) => data.map(OrganizationFromJSON));
