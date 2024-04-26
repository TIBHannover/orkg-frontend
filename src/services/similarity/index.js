/**
 * Services file for the similarity service
 * https://gitlab.com/TIBHannover/orkg/orkg-simcomp/
 */

import env from 'components/NextJsMigration/env';
import { submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';

export const simCompServiceUrl = env('NEXT_PUBLIC_SIMILARITY_SERVICE_URL');

/**
 * Queries Similar Contributions
 *
 * @param {String} contributionId Contribution id
 */
export const getSimilarContribution = ({ contributionId, nbResults = 5 }) => {
    const params = qs.stringify(
        {
            contribution_id: contributionId,
            n_results: nbResults,
        },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${simCompServiceUrl}/contribution/similar/?${params}`).then((response) => response.payload.contributions);
};

/**
 * Get comparison result
 *
 * @param {Array[String]} contributionIds Contribution id
 * @param {String} type Method used to compare (PATH | MERGE)
 * @param {String} format Response format (Available values : UNKNOWN, CSV, DATAFRAME, HTML, XML)
 */
export const getComparison = ({ contributionIds = [], type = null, format = null }) => {
    const params = qs.stringify(
        {
            contributions: contributionIds,
            type,
            format,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );
    return submitGetRequest(`${simCompServiceUrl}contribution/compare/?${params}`).then((response) => response.payload.comparison);
};
/**
 * Get saved thing result
 *
 * @param {String} thingKey Key
 * @param {String} thingType Type (Available values : UNKNOWN, COMPARISON, DIAGRAM, VISUALIZATION, DRAFT_COMPARISON, LIST, REVIEW, QUALITY_REVIEW, PAPER_VERSION, ANY)
 */
export const getThing = ({ thingType, thingKey }) => {
    const params = qs.stringify(
        {
            thing_type: thingType,
            thing_key: thingKey,
        },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${simCompServiceUrl}thing/?${params}`, {
        'Content-Type': 'application/json',
    }).then((response) => response.payload.thing);
};

/**
 * Create thing
 *
 * @param {String} thingKey Key
 * @param {String} thingType Type (Available values : UNKNOWN, COMPARISON, DIAGRAM, VISUALIZATION, DRAFT_COMPARISON, LIST, REVIEW, QUALITY_REVIEW, PAPER_VERSION, ANY)
 */
export const createThing = ({ thingType = 'UNKNOWN', thingKey = '', config = {}, data = {} }) =>
    submitPostRequest(
        `${simCompServiceUrl}thing/`,
        { 'Content-Type': 'application/json' },
        {
            thing_type: thingType,
            thing_key: thingKey,
            config,
            data,
        },
    );

/**
 * Export thing result
 *
 * @param {String} format Response format (Available values : UNKNOWN, CSV, DATAFRAME, HTML, XML)
 * @param {String} thingKey Key
 * @param {Boolean} likeUI Like UI
 * @param {String} thingType Type (Available values : UNKNOWN, COMPARISON, DIAGRAM, VISUALIZATION, DRAFT_COMPARISON, LIST, REVIEW, QUALITY_REVIEW, PAPER_VERSION, ANY)
 */
export const exportThing = ({ thingType, thingKey, format, likeUI }) => {
    const params = qs.stringify(
        {
            thing_type: thingType,
            thing_key: thingKey,
            format,
            likeUI,
        },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${simCompServiceUrl}thing/export/?${params}`, {
        'Content-Type': 'application/json',
    });
};
