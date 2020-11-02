import { url } from 'constants/misc';
import { submitGetRequest, submitPutRequest, submitPostRequest } from 'network';
import env from '@beam-australia/react-env';

export const userUrl = `${url}user/`;
export const authenticationUrl = env('SERVER_URL');

export const getUserInformation = () => {
    return submitGetRequest(`${userUrl}`, {}, true);
};

export const getUserInformationById = userId => {
    return submitGetRequest(`${userUrl}` + userId, {}, true);
};

export const updateUserInformation = ({ email, display_name }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        //email, //back doesn't support this
        display_name: display_name
    };

    return submitPutRequest(`${userUrl}`, headers, data);
};

export const updateUserPassword = ({ current_password, new_password, new_matching_password }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        current_password: current_password,
        new_password: new_password,
        new_matching_password: new_matching_password
    };

    return submitPutRequest(`${userUrl}password/`, headers, data);
};

export const signInWithEmailAndPassword = async (email, password) => {
    // because of the spring oauth implementation, these calls don't send json
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic b3JrZy1jbGllbnQ6c2VjcmV0'
    };

    const data = {
        username: email,
        grant_type: 'password',
        client_id: `${env('AUTHENTICATION_CLIENT_ID')}`,
        password
    };

    const formBody = Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

    return submitPostRequest(`${authenticationUrl}oauth/token`, headers, formBody, false, false);

    /*//TODO: use this setup also in submitPostRequest, and remove the code from there
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
  }*/
};

export const registerWithEmailAndPassword = (email, password, matching_password, name) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        display_name: name,
        email: email,
        password: password,
        matching_password: matching_password
    };

    return submitPostRequest(`${url}auth/register`, headers, data, true, false);
};
