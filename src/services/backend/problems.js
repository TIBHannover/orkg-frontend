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

export const getTopResearchProblems = () => {
    return submitGetRequest(`${problemsUrl}top`);
};
