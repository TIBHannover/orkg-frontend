/**
 * Services file for the similarity service
 * https://gitlab.com/TIBHannover/orkg/orkg-similarity
 */

import { submitPostRequest, submitGetRequest } from 'network';
import queryString from 'query-string';
import env from '@beam-australia/react-env';

export const similarityServiceUrl = env('SIMILARITY_SERVICE_URL');
export const comparisonUrl = `${similarityServiceUrl}compare/`;
export const similarityUrl = `${similarityServiceUrl}similar/`;
export const visualizationServiceUrl = `${similarityServiceUrl}visualization/`;

// TODO: call this function
export const indexContribution = contribution_id => {
    return fetch(`${similarityServiceUrl}internal/index/${encodeURIComponent(contribution_id)}/`, {
        method: 'GET'
    });
};

export const createShortLink = data => {
    return submitPostRequest(`${similarityServiceUrl}shortener/`, { 'Content-Type': 'application/json' }, data);
};

export const getLongLink = shortCode => {
    return submitGetRequest(`${similarityServiceUrl}shortener/${encodeURIComponent(shortCode)}/`);
};

/**
 * Get comparison result
 *
 * @param {Array[String]} contributionIds Contribution id
 * @param {String} type Method used to compare (path | merge)
 * @param {String} response_hash Response hash
 * @param {Boolean} save_response To return a response hash and save a copy of the result
 */
export const getComparison = ({ contributionIds = [], type = null, response_hash = null, save_response = false }) => {
    const params = queryString.stringify(
        {
            contributions: contributionIds.join(','),
            response_hash: response_hash,
            type: type,
            save_response: save_response
        },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${comparisonUrl}?${params}`);
};

export const getSimilarContribution = id => {
    return submitGetRequest(`${similarityUrl}${encodeURIComponent(id)}/`);
};

export const getVisualization = resourceId => {
    return submitGetRequest(`${visualizationServiceUrl}?resourceId=${encodeURI(resourceId)}`, {
        'Content-Type': 'application/json'
    });
};
export const addVisualization = data => {
    return submitPostRequest(`${visualizationServiceUrl}`, { 'Content-Type': 'application/json' }, data);
};
