import { UsersApi } from '@orkg/orkg-client';

import { url, urlNoTrailingSlash } from '@/constants/misc';
import backendApi, { configuration } from '@/services/backend/backendApi';

export const userUrl = `${urlNoTrailingSlash}/user`;

const usersApi = new UsersApi(configuration);

export const getUserInformation = () => usersApi.fetchUserData();

// the observatory-membership endpoints have no generated client operation yet, so they stay
// on ky (reported spec gaps: PUT /user/observatory, DELETE /user/{id}/observatory)
const userKyApi = backendApi.extend(() => ({ prefixUrl: `${url}user/` }));

export const addUserToObservatory = (contributor_id: string, observatory_id: string, organization_id: string): Promise<void> =>
    userKyApi
        .put<void>(`observatory`, {
            json: {
                contributor_id,
                observatory_id,
                organization_id,
            },
        })
        .then(() => undefined);

export const deleteUserFromObservatoryById = (id: string) => userKyApi.delete<void>(`${encodeURIComponent(id)}/observatory`).json();
