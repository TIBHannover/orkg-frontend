import { url } from 'constants/misc';
import { submitGetRequest, submitPutRequest, submitPostRequest, submitDeleteRequest } from 'network';
import env from 'components/NextJsMigration/env';
import { Contributor, User } from 'services/backend/types';

export const userUrl = `${url}user/`;
export const authenticationUrl = env('NEXT_PUBLIC_BACKEND_URL');

export const getUserInformation = () => submitGetRequest(`${userUrl}`, {}, true);

export const updateUserInformation = ({ email, display_name }: { email: string; display_name: string }): Promise<User> => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        // email, //back doesn't support this
        display_name,
    };

    return submitPutRequest(`${userUrl}`, headers, data);
};

export const updateUserPassword = ({
    current_password,
    new_password,
    new_matching_password,
}: {
    current_password: string;
    new_password: string;
    new_matching_password: string;
}): Promise<{ status: 'success' }> => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        current_password,
        new_password,
        new_matching_password,
    };

    return submitPutRequest(`${userUrl}password/`, headers, data);
};

export const signInWithEmailAndPassword = async (
    email: string,
    password: string,
): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}> => {
    // because of the spring oauth implementation, these calls don't send json
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic b3JrZy1jbGllbnQ6c2VjcmV0',
    };

    const data = {
        username: email,
        grant_type: 'password',
        client_id: `${env('NEXT_PUBLIC_AUTHENTICATION_CLIENT_ID')}`,
        password,
    };

    const formBody = Object.keys(data)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`)
        .join('&');

    return submitPostRequest(`${authenticationUrl}oauth/token`, headers, formBody, false, false);

    /* //TODO: use this setup also in submitPostRequest, and remove the code from there
  //difference here is that a json is parsed, no matter whether response.ok is true or not
  try {
    const response = await fetch(`${authenticationUrl}oauth/token`,
      {
        headers: headers,
        method: 'POST',
        body: formBody,
      }
    );
    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json;

  } catch (error) {
    throw error;
  } */
};

export const registerWithEmailAndPassword = (
    email: string,
    password: string,
    matching_password: string,
    name: string,
): Promise<{ status: 'success' }> => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const data = {
        display_name: name,
        email,
        password,
        matching_password,
    };

    return submitPostRequest(`${url}auth/register`, headers, data, true, false);
};

export const addUserToObservatory = (user_email: string, observatory_id: string, organization_id: string): Promise<Contributor> => {
    const headers = { 'Content-Type': 'application/json' };
    return submitPutRequest(`${userUrl}observatory`, headers, { user_email, observatory_id, organization_id });
};

export const deleteUserFromObservatoryById = (id: string): Promise<null> =>
    submitDeleteRequest(`${userUrl}${id}/observatory`, { 'Content-Type': 'application/json' });
