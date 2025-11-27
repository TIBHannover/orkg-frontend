/**
 * Services file for the simcomp service
 * https://gitlab.com/TIBHannover/orkg/orkg-simcomp/
 */

import ky from 'ky';
import { env } from 'next-runtime-env';
import qs from 'qs';

export const simCompServiceUrl = env('NEXT_PUBLIC_SIMILARITY_SERVICE_URL');
const simCompServiceApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
    prefixUrl: simCompServiceUrl,
});

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
            contributions: contributionIds?.join(','),
            type,
            format,
        },
        {
            encode: false,
            skipNulls: true,
        },
    );
    return simCompServiceApi
        .get('contribution/compare', {
            searchParams: params,
        })
        .json()
        .then((response) => response.payload.comparison);
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
    return simCompServiceApi
        .get(`thing`, {
            searchParams: params,
        })
        .json()
        .then((response) => response.payload.thing);
};

/**
 * Create thing
 *
 * @param {String} thingKey Key
 * @param {String} thingType Type (Available values : UNKNOWN, COMPARISON, DIAGRAM, VISUALIZATION, DRAFT_COMPARISON, LIST, REVIEW, QUALITY_REVIEW, PAPER_VERSION, ANY)
 */
export const createThing = ({ thingType = 'UNKNOWN', thingKey = '', config = {}, data = {} }) =>
    simCompServiceApi
        .post('thing', {
            json: {
                thing_type: thingType,
                thing_key: thingKey,
                config,
                data,
            },
        })
        .json();

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
    return simCompServiceApi
        .get('thing/export', {
            searchParams: params,
        })
        .json();
};
