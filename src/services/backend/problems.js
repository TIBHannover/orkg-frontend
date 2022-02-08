import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const problemsUrl = `${url}problems/`;

export const getResearchFieldsByResearchProblemId = problemId => {
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(problemId)}/fields`);
};

export const getContributorsByResearchProblemId = ({ id, page = 0, items = 9999 }) => {
    const params = queryString.stringify(
        { page: page, size: items },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/users?${params}`);
};

export const getAuthorsByResearchProblemId = ({ id, page = 0, items = 9999 }) => {
    const params = queryString.stringify(
        { page: page, size: items },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/authors?${params}`);
};

export const getContentByResearchProblemIdAndClasses = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    featured = null,
    unlisted = null,
    classes = []
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page: page, size: items, sort, featured, unlisted, classes: classes.join(',') },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/?${params}`);
};

export const getTopResearchProblems = () => {
    return submitGetRequest(`${problemsUrl}top`);
};
