/**
 * Services file for the similarity service
 * https://gitlab.com/TIBHannover/orkg/orkg-similarity
 */

import { submitPostRequest, submitGetRequest } from 'network';
import qs from 'qs';
import env from 'components/NextJsMigration/env';

export const similarityServiceUrl = env('SIMILARITY_SERVICE_URL');
export const comparisonUrl = `${similarityServiceUrl}compare/`;
export const similarityUrl = `${similarityServiceUrl}similar/`;
export const visualizationServiceUrl = `${similarityServiceUrl}visualization/`;

export const indexContribution = contributionId => submitGetRequest(`${similarityServiceUrl}internal/index/${contributionId}/`);

export const createShortLink = data => submitPostRequest(`${similarityServiceUrl}shortener/`, { 'Content-Type': 'application/json' }, data);

export const getLongLink = shortCode => submitGetRequest(`${similarityServiceUrl}shortener/${encodeURIComponent(shortCode)}/`);

/**
 * Get comparison result
 *
 * @param {Array[String]} contributionIds Contribution id
 * @param {String} type Method used to compare (path | merge)
 * @param {String} response_hash Response hash
 * @param {Boolean} save_response To return a response hash and save a copy of the result
 */
export const getComparison = ({ contributionIds = [], type = null, response_hash = null, save_response = false }) => {
    const params = qs.stringify(
        {
            contributions: contributionIds.join(','),
            response_hash,
            type,
            save_response,
        },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${comparisonUrl}?${params}`);
};

export const getSimilarContribution = id => submitGetRequest(`${similarityUrl}${encodeURIComponent(id)}/`);

/* TODO: rename this in similarity service */
export const getVisualization = resourceId =>
    submitGetRequest(`${visualizationServiceUrl}?resourceId=${encodeURI(resourceId)}`, {
        'Content-Type': 'application/json',
    });
export const addVisualization = data => submitPostRequest(`${visualizationServiceUrl}`, { 'Content-Type': 'application/json' }, data);

export const getResourceData = resourceId => getVisualization(resourceId);

export const createResourceData = ({ resourceId, data }) =>
    addVisualization({
        resourceId,
        jsonData: data,
    });
