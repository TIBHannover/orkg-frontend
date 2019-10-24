import { Cookies } from 'react-cookie';
import queryString from 'query-string';
export const url = process.env.REACT_APP_SERVER_URL;
export const similaireServiceUrl = process.env.REACT_APP_SIMILARITY_SERVICE_URL;
export const annotationServiceUrl = process.env.REACT_APP_ANNOTATION_SERVICE_URL;
export const resourcesUrl = `${url}resources/`;
export const predicatesUrl = `${url}predicates/`;
export const statementsUrl = `${url}statements/`;
export const literalsUrl = `${url}literals/`;
export const classesUrl = `${url}classes/`;
export const statsUrl = `${url}stats/`;
export const crossrefUrl = process.env.REACT_APP_CROSSREF_URL;
export const arxivUrl = process.env.REACT_APP_ARXIV_URL;
export const semanticScholarUrl = process.env.REACT_APP_SEMANTICSCHOLAR_URL;
export const comparisonUrl = `${similaireServiceUrl}compare/`;
export const similaireUrl = `${similaireServiceUrl}similar/`;
export const authenticationUrl = process.env.REACT_APP_AUTHENTICATION_URL;

/**
 * Sends simple GET request to the URL.
 */
export const submitGetRequest = (url) => {
  if (!url) {
    throw new Error('Cannot submit GET request. URL is null or undefined.');
  }

  const cookies = new Cookies();
  let token = cookies.get('token') ? cookies.get('token') : null;

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
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
  });
};

const submitPostRequest = (url, headers, data) => {
  if (!url) {
    throw new Error('Cannot submit POST request. URL is null or undefined.');
  }
  const cookies = new Cookies();
  let token = cookies.get('token') ? cookies.get('token') : null;
  let myHeaders = new Headers(headers);
  myHeaders.append('Authorization', `Bearer ${token}`);

  return new Promise((resolve, reject) => {
    fetch(url, { method: 'POST', headers: myHeaders, body: JSON.stringify(data) })
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
  });
};

const submitPutRequest = (url, headers, data) => {
  if (!url) {
    throw new Error('Cannot submit PUT request. URL is null or undefined.');
  }

  const cookies = new Cookies();
  let token = cookies.get('token') ? cookies.get('token') : null;
  let myHeaders = new Headers(headers);
  myHeaders.append('Authorization', `Bearer ${token}`);

  return new Promise((resolve, reject) => {
    fetch(url, { method: 'PUT', headers: myHeaders, body: JSON.stringify(data) })
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
  });
};

const submitDeleteRequest = (url, headers, data) => {
  if (!url) {
    throw new Error('Cannot submit DELETE request. URL is null or undefined.');
  }

  return new Promise((resolve, reject) => {
    fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(data) })
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
        } else {
          return resolve();
        }
      })
      .catch(reject);
  });
};

export const updateResource = (id, label) => {
  return submitPutRequest(
    `${resourcesUrl}${id}`,
    { 'Content-Type': 'application/json' },
    { label: label },
  );
};

export const updateLiteral = (id, label) => {
  return submitPutRequest(
    `${literalsUrl}${id}`,
    { 'Content-Type': 'application/json' },
    { label: label },
  );
};

export const createResource = (label, classes = []) => {
  return submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes });
};

export const createLiteral = (label) => {
  return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResourceStatement = (subjectId, predicateId, objectId) => {
  return submitPostRequest(
    `${statementsUrl}`,
    { 'Content-Type': 'application/json' },
    {
      subject_id: subjectId,
      predicate_id: predicateId,
      object: {
        id: objectId,
        _class: 'resource',
      },
    },
  );
};

export const createLiteralStatement = (subjectId, predicateId, property) => {
  return submitPostRequest(
    `${statementsUrl}`,
    { 'Content-Type': 'application/json' },
    {
      subject_id: subjectId,
      predicate_id: predicateId,
      object: {
        id: property,
        _class: 'literal',
      },
    },
  );
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

export const getAllResources = ({ page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  return submitGetRequest(`${resourcesUrl}?${params}`);
};

export const getAllStatements = ({ page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  return submitGetRequest(`${statementsUrl}?${params}`);
};

export const getPredicatesByLabel = (label) => {
  return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};

export const deleteStatementById = (id) => {
  return submitDeleteRequest(statementsUrl + encodeURIComponent(id));
};

export const getStatementsBySubject = ({ id, page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/?${params}`);
};

export const getStatementsByObject = async ({ id, page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  let statements = await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/?${params}`);

  // TODO: replace sorting and limit by backend functionalities when ready
  statements.sort((a, b) => {
    if (!desc) {
      return parseInt(a.id.replace('S', '')) - parseInt(b.id.replace('S', ''));
    } else {
      return parseInt(b.id.replace('S', '')) - parseInt(a.id.replace('S', ''));
    }
  });

  return statements;
};

export const getResourcesByClass = async ({ id, page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  let resources = await submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/resources/?${params}`);

  // TODO: replace sorting and limit by backend functionalities when ready
  resources.sort((a, b) => {
    if (!desc) {
      return parseInt(a.id.replace('R', '')) - parseInt(b.id.replace('R', ''));
    } else {
      return parseInt(b.id.replace('R', '')) - parseInt(a.id.replace('R', ''));
    }
  });

  return resources;
};

export const getStatementsByPredicate = ({ id, page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`);
};

export const getSimilaireContribution = (id) => {
  return submitGetRequest(`${similaireUrl}${encodeURIComponent(id)}/`);
};

export const getAnnotations = (abstract) => {
  return submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });
};

export const indexContribution = (contribution_id) => {
  return fetch(`${similaireServiceUrl}internal/index/${encodeURIComponent(contribution_id)}/`, {
    method: 'GET',
  });
};

export const getStats = () => {
  return submitGetRequest(statsUrl);
};

export const createShortLink = (data) => {
  return submitPostRequest(
    `${similaireServiceUrl}shortener/`,
    { 'Content-Type': 'application/json' },
    data,
  );
};

export const getLongLink = (shortCode) => {
  return submitGetRequest(`${similaireServiceUrl}shortener/${encodeURIComponent(shortCode)}/`);
};

export const getAllClasses = () => {
  return submitGetRequest(classesUrl);
};

export const saveFullPaper = (data) => {
  return submitPostRequest(`${url}papers/`, { 'Content-Type': 'application/json' }, data);
};

export const getAllPredicates = ({ page = 1, items = 9999, sortBy = 'id', desc = true }) => {

  let params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc })

  return submitGetRequest(`${predicatesUrl}?${params}`);
};


export const signInWithEmailAndPassword = (email, password) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic b3JrZy1jbGllbnQ6c2VjcmV0',
  };

  const data = {
    username: email,
    grant_type: 'password',
    client_id: 'orkg-client',
    password
  }

  const formBody = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');

  return new Promise(
    (resolve, reject) => {
      fetch(`${authenticationUrl}oauth/token`, {
        headers: headers,
        method: 'POST',
        body: formBody,
      })
        .then(response => response.json())
        .then(json => {
          if (json.error === 'invalid_grant') {
            return reject(json)
          }
          else {
            return resolve(json)
          }
        }).catch(error =>
          Promise.reject(error)
        )
    });
}

export const registerWithEmailAndPassword = (email, password, name) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const data = {
    username: name,
    email: email,
    password,
    matching_password: password, //TODO: do we want a confirm password in the UI, or leave it like this?
  }

  return submitPostRequest(`${authenticationUrl}auth/register`, headers, data);
}