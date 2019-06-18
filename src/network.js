export const url = process.env.REACT_APP_SERVER_URL;
export const resourcesUrl = `${url}resources/`;
export const predicatesUrl = `${url}predicates/`;
export const statementsUrl = `${url}statements/`;
export const literalsUrl = `${url}literals/`;
export const crossrefUrl = process.env.REACT_APP_CROSSREF_URL;
export const comparisonUrl = process.env.REACT_APP_SIMILARITY_SERVICE_URL;


/**
 * Sends simple GET request to the URL.
 */
export const submitGetRequest = (url) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'GET' })
                .then((response) => {
                    if (!response.ok) {
                        reject({
                            error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                            statusCode: response.status,
                            statusText: response.statusText,
                        });
                    } else {
                        const json = response.json();
                        if (json.then) {
                            json.then(resolve).catch(reject);
                        } else {
                            return resolve(json);
                        }
                    }
                })
                .catch(reject);
        }
    );
};

const submitPostRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
                .then((response) => {
                    if (!response.ok) {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    } else {
                        const json = response.json();
                        if (json.then) {
                            json.then(resolve).catch(reject);
                        } else {
                            return resolve(json);
                        }
                    }
                })
                .catch(reject);
        }
    );
};

const submitPutRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(data) })
                .then((response) => {
                    if (!response.ok) {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    } else {
                        const json = response.json();
                        if (json.then) {
                            json.then(resolve).catch(reject);
                        } else {
                            return resolve(json);
                        }
                    }
                })
                .catch(reject);
        }
    );
};

export const updateResource = (id, label) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updateLiteral = (id, label) => {
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResource = (label) => {
    return submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const createLiteral = (label) => {
    return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResourceStatement = (subjectId, predicateId, objectId) => {
    return submitPostRequest(`${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            'subject_id': subjectId,
            'predicate_id': predicateId,
            'object': {
                'id': objectId,
                "_class": "resource"
            }
        });
};

export const createLiteralStatement = (subjectId, predicateId, property) => {
    return submitPostRequest(`${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            'subject_id': subjectId,
            'predicate_id': predicateId,
            'object': {
                'id': property,
                "_class": "literal"
            }
        });
};


export const createPredicate = (label) => {
    return submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const getPredicate = (id) => {
    return submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const getResource = (id) => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);
};

export const getAllResources = () => {
    return submitGetRequest(resourcesUrl);
};

export const getAllStatements = () => {
    return submitGetRequest(statementsUrl);
};

export const getPredicatesByLabel = (label) => {
    return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};

export const getStatementsBySubject = (id) => {
    return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/`);
};

export const getStatementsByObject = async ({id, order = 'asc', limit = null}) => {
    let statements= await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/`);

    // TODO: replace sorting and limit by backend functionalities when ready
    statements.sort((a, b) => {
        if (order === 'asc') {
            return parseInt(a.id.replace('S', '')) - parseInt(b.id.replace('S', ''));
        } else {
            return parseInt(b.id.replace('S', '')) - parseInt(a.id.replace('S', ''));
        }
    });

    if (limit) {
        statements = statements.slice(0, limit);
    }

    return statements;
};

export const getStatementsByPredicate = (id) => {
    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/`);
};