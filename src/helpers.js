export const url = process.env.REACT_APP_SERVER_URL;
export const resourcesUrl = url + 'resources/';
export const predicatesUrl = url + 'predicates/';
export const statementsUrl = url + 'statements/';
export const crossrefUrl = 'https://api.crossref.org/works/';

/**
 * Sends simple GET request to the URL.
 */
export function submitGetRequest(url, onSuccess, onError) {
    fetch(url, { method: 'GET' })
            .then((response) => {
                console.log('Response type: ' + response.type);
                if (!response.ok) {
                    throw new Error('Error response. (' + response.status + ') ' + response.statusText);
                } else {
                    return response.json();
                }
            })
            .then(onSuccess)
            .catch(onError);
}

function submitPostRequest(url, headers, data, onSuccess, onError) {
    fetch(url, { method: 'POST',  headers: headers, body: JSON.stringify(data) })
            .then((response) => {
                console.log('Response type: ' + response.type);
                if (!response.ok) {
                    throw new Error('Error response. (' + response.status + ') ' + response.statusText);
                } else {
                    return response.json();
                }
            })
            .then(onSuccess)
            .catch(onError);
}

export function updateResource(id, label, onSuccess, onError) {
    submitPostRequest(resourcesUrl, {'Content-Type': 'application/json'}, {id: id, label: label}, onSuccess, onError);
}

export function createResource(label, onSuccess, onError) {
    submitPostRequest(resourcesUrl, {'Content-Type': 'application/json'}, {label: label}, onSuccess, onError);
}

export function createResourceStatement(subjectId, predicateId, objectId, onSuccess, onError) {
    submitPostRequest(statementsUrl + subjectId + '/' + predicateId + '/' + objectId + '/',
            {'Content-Type': 'application/json'}, {}, onSuccess, onError);
}

export function createLiteralStatement(subjectId, predicateId, property, onSuccess, onError) {
    submitPostRequest(statementsUrl + subjectId + '/' + predicateId + '/',
            {'Content-Type': 'application/json'}, { 'value' : property, 'type' : 'literal' }, onSuccess, onError);
}

export function getPredicate(id, onSuccess, onError) {
    submitGetRequest(predicatesUrl + encodeURIComponent(id) + '/', onSuccess, onError);
}

export function getResource(id, onSuccess, onError) {
    submitGetRequest(resourcesUrl + encodeURIComponent(id) + '/', onSuccess, onError);
}

export function getPredicatesByLabel(label, onSuccess, onError) {
    submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label), onSuccess, onError)
}

export function hashCode(s) {
  return s.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
  }, 0);
}

export function groupBy(array, group) {
    const hash = Object.create(null);
    const result = [];

    array.forEach((a) => {
        if (!hash[a[group]]) {
            hash[a[group]] = [];
            result.push(hash[a[group]]);
        }
        hash[a[group]].push(a);
    });

    return result;
}

export const guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};