import { submitGetRequest } from 'network';

export const getComparisonDataByDOI = id => {
    return submitGetRequest(`${process.env.REACT_APP_DATACITE_URL}/${process.env.REACT_APP_DATACITE_DOI_PREFIX}/${encodeURIComponent(id)}`);
};

export const getCitationByDOI = (DOI, style = '', header = 'text/x-bibliography') => {
    let headers = '';
    headers = { Accept: `${header}` };
    const myHeaders = headers ? new Headers(headers) : {};
    const url = `${process.env.REACT_APP_DATACITE_URL}/${DOI}?style=${style}`;

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: myHeaders
        })
            .then(response => {
                if (!response.ok) {
                    reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText
                    });
                } else {
                    const text = response.text();
                    if (text.then) {
                        text.then(resolve).catch(reject);
                    } else {
                        return resolve(text);
                    }
                }
            })
            .catch(reject);
    });
};
