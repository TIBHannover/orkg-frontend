import { url as backendURL } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { Contributor, Observatory, Organization, PaginatedResponse, Resource } from '@/services/backend/types';

export const organizationsUrl = `${backendURL}organizations/`;
export const organizationsApi = backendApi.extend(() => ({ prefixUrl: organizationsUrl }));

export const getAllOrganizations = () => organizationsApi.get<Organization[]>('').json();

export const getOrganization = (id: string) => organizationsApi.get<Organization>(encodeURIComponent(id)).json();

export const getOrganizationLogoUrl = (id: string): string => `${organizationsUrl}${encodeURIComponent(id)}/logo`;

export const createOrganization = (
    organization_name: string,
    organization_logo: string,
    created_by: string,
    url: string,
    display_id: string,
    type: string,
) => organizationsApi.post<Organization>('', { json: { organization_name, organization_logo, created_by, url, display_id, type } }).json();

export const updateOrganization = (
    id: string,
    { name, url, type, logo }: { name: string; url: string; type: string; logo: string },
): Promise<void> => {
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
    return organizationsApi.patch(encodeURIComponent(id), { body: formData }).json();
};

export const getAllObservatoriesByOrganizationId = (id: string) =>
    organizationsApi.get<Observatory[]>(`${encodeURIComponent(id)}/observatories`).json();

export const getUsersByOrganizationId = (id: string) => organizationsApi.get<Contributor[]>(`${encodeURIComponent(id)}/users`).json();

export const getConferences = () => organizationsApi.get<Organization[]>(`conferences`).json();

export const getProblemsByOrganizationId = (id: string) =>
    organizationsApi.get<PaginatedResponse<Resource>>(`${encodeURIComponent(id)}/problems`).json();
