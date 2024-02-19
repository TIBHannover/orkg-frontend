import { url as backendURL } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPatchRequest } from 'network';
import { Contributor, Observatory, Organization, PaginatedResponse, Resource } from 'services/backend/types';

export const organizationsUrl = `${backendURL}organizations/`;

export const getAllOrganizations = (): Promise<Organization[]> => submitGetRequest(`${organizationsUrl}`);

export const getOrganization = (id: string): Promise<Organization> => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
export const getOrganizationLogoUrl = (id: string): string => `${organizationsUrl}${encodeURIComponent(id)}/logo`;
export const createOrganization = (
    organization_name: string,
    organization_logo: string,
    created_by: string,
    url: string,
    display_id: string,
    type: string,
): Promise<Organization> =>
    submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type },
    );

export const updateOrganization = (
    id: string,
    { name, url, type, logo }: { name: string; url: string; type: string; logo: string },
): Promise<null> => {
    const formData = new FormData();
    if (logo) formData.append('logo', logo);
    if (name || url || type) {
        const _properties: { name?: string; url?: string; type?: string } = {};
        if (name) _properties.name = name;
        if (url) _properties.url = url;
        if (type) _properties.type = type;
        formData.append(
            'properties',
            new Blob([JSON.stringify(_properties)], {
                type: 'application/json',
            }),
        );
    }
    return submitPatchRequest(`${organizationsUrl}${encodeURIComponent(id)}`, {}, formData, false);
};

export const getAllObservatoriesByOrganizationId = (id: string): Promise<Observatory[]> =>
    submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);

export const getUsersByOrganizationId = (id: string): Promise<Contributor[]> =>
    submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);

export const getConferences = (): Promise<Organization[]> => submitGetRequest(`${organizationsUrl}conferences`);

export const getProblemsByOrganizationId = (id: string): Promise<PaginatedResponse<Resource>> =>
    submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/problems`);
