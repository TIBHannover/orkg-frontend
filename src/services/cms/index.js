/**
 * Services file for CMS service
 */

import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const url = env('CMS_URL');

export const getPage = id => submitGetRequest(`${url}pages/${id}`);

export const getPages = ({ category = null, sort = null, where = '' }) => {
    const params = queryString.stringify(
        { category, _sort: sort },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );

    return submitGetRequest(`${url}pages?${params}${where}`);
};

export const getCategories = ({ isHelpCategory = false, sort = null }) => {
    const params = queryString.stringify(
        { is_help_category: isHelpCategory, _sort: sort },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );

    return submitGetRequest(`${url}categories?${params}`);
};

export const getCategory = id => submitGetRequest(`${url}categories/${id}`);
