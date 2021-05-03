import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const statsUrl = `${url}stats/`;

export const getStats = () => {
    return submitGetRequest(statsUrl);
};

export const getResearchFieldsStats = () => {
    return submitGetRequest(`${statsUrl}fields`);
};

export const getComparisonsCountByObservatoryId = id => {
    return submitGetRequest(`${statsUrl}${encodeURIComponent(id)}/observatoryComparisonsCount`);
};

/* 
    for api/stats/top/contributors
    we need to provide sort=contributions,desc to get sorted by contributions 
    sort=contributions,desc 
    By default it is not sorted
*/
export const getTopContributors = ({ researchFieldId = null, days = 30, page = 0, items = 9999, sortBy = 'contributions', desc = true }) => {
    if (researchFieldId) {
        const params = queryString.stringify(
            { days },
            {
                skipNull: true,
                skipEmptyString: true
            }
        );
        return submitGetRequest(`${statsUrl}research-field/${researchFieldId}/top/contributors?${params}`).then(result => {
            result = {
                content: result,
                last: true,
                totalElements: result.length
            };
            return result;
        });
    } else {
        const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
        const params = queryString.stringify(
            { page: page, size: items, sort },
            {
                skipNull: true,
                skipEmptyString: true
            }
        );
        return submitGetRequest(`${statsUrl}top/contributors?${params}`).then(result => {
            return {
                ...result,
                content: result.content.map(c => {
                    return {
                        profile: c.profile,
                        counts: { total: c.contributions }
                    };
                })
            };
        });
    }
};

export const getChangelogs = ({ researchFieldId = null, page = 0, items = 9999, sortBy = 'createdAt', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page: page, size: items, sort },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${statsUrl}${researchFieldId ? `research-field/${researchFieldId}/` : ''}top/changelog?${params}`);
};

export const getTopResearchProblems = ({ page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    // const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page: page, size: items /*, sort, desc*/ },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${statsUrl}top/research-problems?${params}`);
};
