import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const statsUrl = `${url}stats/`;

export const getStats = (extra = []) => submitGetRequest(`${statsUrl}?extra=${extra.join(',')}`);

export const getResearchFieldsStats = () => submitGetRequest(`${statsUrl}fields`);

export const getComparisonsCountByObservatoryId = id => submitGetRequest(`${statsUrl}${encodeURIComponent(id)}/observatoryComparisonsCount`);

/**
 * Get top contributors
 * @param {String} researchFieldId Research field id
 * @param {Number} days Number of last days (by default it counts all time, from 2010-01-01)
 * @param {Number} page Page number (Doesn't not work!)
 * @param {Number} items Number of items per page
 * @param {String} sortBy Sort field
 * @param {Boolean} desc  ascending order and descending order.
 * @param {Boolean} subfields whether include the subfields or not
 * @return {Object} List of contributors
 */
export const getTopContributors = ({
    researchFieldId = null,
    days = null,
    page = 0,
    size = 9999,
    sortBy = 'contributions',
    desc = true,
    subfields = true,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    if (researchFieldId) {
        const params = queryString.stringify(
            { days, sort },
            {
                skipNull: true,
                skipEmptyString: true,
            },
        );
        return submitGetRequest(`${statsUrl}research-field/${researchFieldId}/${subfields ? 'subfields/' : ''}top/contributors?${params}`).then(
            result => {
                result = {
                    content: result,
                    last: true,
                    totalElements: result.length,
                };
                return result;
            },
        );
    }
    const params = queryString.stringify(
        { page, size, sort, days },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );
    return submitGetRequest(`${statsUrl}top/contributors?${params}`).then(result => ({
        ...result,
        content: result.content.map(c => ({
            profile: c.profile,
            counts: { total: c.contributions },
        })),
    }));
};

export const getChangelogs = ({ researchFieldId = null, page = 0, items = 9999, sortBy = 'createdAt', desc = true }) => {
    const sort = sortBy ? `${sortBy},${desc ? 'desc' : 'asc'}` : null;
    const params = queryString.stringify(
        { page, size: items, sort },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );
    return submitGetRequest(`${statsUrl}${researchFieldId ? `research-field/${researchFieldId}/` : ''}top/changelog?${params}`);
};

export const getTopResearchProblems = ({ page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    // const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size: items /* , sort, desc */ },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );
    return submitGetRequest(`${statsUrl}top/research-problems?${params}`);
};
