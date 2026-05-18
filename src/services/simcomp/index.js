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
 * Get saved thing result
 *
 * @param {Object.string} thingKey Key
 * @param {Object.string} thingType Type (Available values : UNKNOWN, COMPARISON, DIAGRAM, VISUALIZATION, DRAFT_COMPARISON, LIST, REVIEW, QUALITY_REVIEW, PAPER_VERSION, ANY)
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
        .get(`thing/`, {
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
        .post('thing/', {
            json: {
                thing_type: thingType,
                thing_key: thingKey,
                config,
                data,
            },
        })
        .json();
