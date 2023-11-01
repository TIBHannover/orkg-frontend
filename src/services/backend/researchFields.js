import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';

export const fieldsUrl = `${url}research-fields/`;
export const researchFieldUrl = `${url}research-fields/`;

export const getResearchProblemsByResearchFieldIdCountingPapers = ({ id, page = 0, items = 1 }) => {
    const params = qs.stringify(
        { page, size: items },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/problems?${params}`);
};

export const getContentByResearchFieldIdAndClasses = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    subfields = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, visibility, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}?${params}`);
};

export const getPapersByResearchFieldId = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    subfields = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, visibility },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}papers?${params}`);
};

export const getResearchProblemsByResearchFieldId = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    subfields = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, visibility },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}research-problems?${params}`);
};

// This endpoint is not used anymore!
export const getContributorsByResearchFieldId = ({ id, page = 0, items = 9999, subfields = true }) => {
    const params = qs.stringify(
        { page, size: items },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}contributors?${params}`).then(result => ({
        ...result,
        content: result.content.map(c => ({
            profile: c,
            counts: { total: null },
        })),
    }));
};

export const getFieldChildren = ({ fieldId }) => submitGetRequest(`${researchFieldUrl}${fieldId}/children`).then(res => res.content);
