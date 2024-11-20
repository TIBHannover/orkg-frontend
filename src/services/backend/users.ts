import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPutRequest } from 'network';
import { env } from 'next-runtime-env';
import { Contributor } from 'services/backend/types';

export const userUrl = `${url}user/`;
export const authenticationUrl = env('NEXT_PUBLIC_BACKEND_URL');

export const getUserInformation = () => submitGetRequest(`${userUrl}`, {}, true);

export const addUserToObservatory = (contributor_id: string, observatory_id: string, organization_id: string): Promise<Contributor> => {
    const headers = { 'Content-Type': 'application/json' };
    return submitPutRequest(`${userUrl}observatory`, headers, { contributor_id, observatory_id, organization_id });
};

export const deleteUserFromObservatoryById = (id: string): Promise<null> =>
    submitDeleteRequest(`${userUrl}${id}/observatory`, { 'Content-Type': 'application/json' });
