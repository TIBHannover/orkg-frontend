import { OrganizationFromJSON, OrganizationsApi, OrganizationsApiUpdateRequest } from '@orkg/orkg-client';

import { url as backendURL } from '@/constants/misc';
import backendApi, { configuration, getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { Contributor, Observatory, Organization } from '@/services/backend/types';

export const organizationsUrl = `${backendURL}organizations/`;
export const organizationsApi = backendApi.extend(() => ({ prefixUrl: organizationsUrl }));

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

export const getUsersByOrganizationId = (id: string) => organizationsApi.get<Contributor[]>(`${encodeURIComponent(id)}/users`).json();

export const getConferences = (): Promise<Organization[]> =>
    organizationsApi
        .get<unknown[]>(`conferences`)
        .json()
        .then((data) => data.map(OrganizationFromJSON));
