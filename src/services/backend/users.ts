import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { Contributor, User } from '@/services/backend/types';

export const userUrl = `${url}user/`;
export const userApi = backendApi.extend(() => ({ prefixUrl: userUrl }));

export const getUserInformation = () => userApi.get<User>('').json();

export const addUserToObservatory = (contributor_id: string, observatory_id: string, organization_id: string): Promise<Contributor> => {
    const headers = { 'Content-Type': 'application/json' };
    return userApi
        .put<Contributor>(`observatory`, {
            json: {
                contributor_id,
                observatory_id,
                organization_id,
            },
            headers,
        })
        .json();
};

export const deleteUserFromObservatoryById = (id: string) => userApi.delete<void>(`${id}/observatory`).json();
