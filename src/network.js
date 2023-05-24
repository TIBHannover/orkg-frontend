import { Cookies } from 'react-cookie';
import fetch, { Headers } from 'cross-fetch';

export const submitGetRequest = (url, headers, send_token = false) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }
    const myHeaders = headers ? new Headers(headers) : {};
    if (send_token) {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: myHeaders,
        })
            .then(response => {
                if (!response.ok) {
                    reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText,
                    });
                } else {
                    if (response.status === 204) {
                        // 204 No Content
                        return resolve(null);
                    }
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

export const submitPostRequest = (url, headers, data, jsonStringify = true, send_token = true, parseResponse = true) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    const myHeaders = new Headers(headers);

    if (send_token) {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    if (jsonStringify) {
        data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'POST', headers: myHeaders, body: data })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        return json.then(reject);
                    }
                    return reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText,
                    });
                }
                if (response.status === 204 || !parseResponse) {
                    // 204 No Content
                    return resolve(null);
                }
                const json = response.json();
                if (json.then) {
                    json.then(resolve).catch(reject);
                } else {
                    return resolve(json);
                }
            })
            .catch(reject);
    });
};

export const submitPutRequest = (url, headers, data, jsonStringify = true) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    const cookies = new Cookies();
    const token = cookies.get('token') ? cookies.get('token') : null;
    const myHeaders = new Headers(headers);
    if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
    }
    let _data = data;
    if (jsonStringify) {
        _data = JSON.stringify(_data);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'PUT', headers: myHeaders, body: _data })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        return json.then(reject);
                    }
                    return reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText,
                    });
                }
                if (response.status === 204) {
                    // HTTP 204 No Content success status
                    return resolve();
                }
                const json = response.json();
                if (json.then) {
                    json.then(resolve).catch(reject);
                } else {
                    return resolve(json);
                }
            })
            .catch(reject);
    });
};

export const submitPatchRequest = (url, headers, data, jsonStringify = true) => {
    if (!url) {
        throw new Error('Cannot submit PATCH request. URL is null or undefined.');
    }

    const cookies = new Cookies();
    const token = cookies.get('token') ? cookies.get('token') : null;
    const myHeaders = new Headers(headers);
    if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
    }
    let _data = data;
    if (jsonStringify) {
        _data = JSON.stringify(_data);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'PATCH', headers: myHeaders, body: _data })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        return json.then(reject);
                    }
                    return reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText,
                    });
                }
                if (response.status === 204) {
                    // HTTP 204 No Content success status
                    return resolve();
                }
                const json = response.json();
                if (json.then) {
                    json.then(resolve).catch(reject);
                } else {
                    return resolve(json);
                }
            })
            .catch(reject);
    });
};

export const submitDeleteRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit DELETE request. URL is null or undefined.');
    }

    const cookies = new Cookies();
    const token = cookies.get('token') ? cookies.get('token') : null;
    const myHeaders = new Headers(headers);
    if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'DELETE', headers: myHeaders, body: JSON.stringify(data) })
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                } else {
                    return resolve();
                }
            })
            .catch(reject);
    });
};
