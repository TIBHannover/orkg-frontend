/**
 * Services file for CMS service
 */
import env from 'components/NextJsMigration/env';
import { submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';

export const url = env('CMS_URL');

export const getPageByUrl = _url => submitGetRequest(`${url}pages?filters[url]=${_url}`);

export const getAboutPage = id => {
    const query = qs.stringify(
        {
            populate: { category: { fields: ['id'] } },
        },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}about-pages/${id}?${query}`);
};

export const getAboutPageCategories = () => {
    const query = qs.stringify(
        {
            sort: 'order',
            fields: ['label'],
        },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}about-page-categories?${query}`).catch(() => []);
};

export const getAboutPages = (categoryId = null) => {
    const query = qs.stringify(
        {
            sort: 'order',
            pagination: {
                pageSize: 100,
            },
            fields: ['title', 'order'],
            populate: {
                category: {
                    fields: ['id'],
                },
            },

            ...(categoryId
                ? {
                      filters: {
                          category: {
                              id: {
                                  $eq: categoryId,
                              },
                          },
                      },
                  }
                : {}),
        },
        {
            encodeValuesOnly: true,
        },
    );

    return submitGetRequest(`${url}about-pages?${query}`).catch(() => []);
};

export const getHelpArticle = id => {
    const query = qs.stringify(
        { populate: { help_category: { fields: ['id', 'title'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-articles/${id}?${query}`);
};

export const getHelpArticles = ({ where = '' }) => submitGetRequest(`${url}help-articles?${where}`);

export const getHelpCategories = () => {
    const query = qs.stringify(
        { sort: 'order', populate: { help_articles: { fields: ['title', 'order'], sort: ['order'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-categories?${query}`);
};

export const getHelpCategory = id => {
    const query = qs.stringify(
        { populate: { help_articles: { fields: ['title', 'order'], sort: ['order'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-categories/${id}?${query}`);
};

export const getHomeAlerts = () => submitGetRequest(`${url}home-alerts?sort=order`).catch(() => []);

export const getNewsCards = ({ limit = 10, sort = 'created_at' }) => {
    const query = qs.stringify(
        { pagination: { pageSize: limit }, sort },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}news-cards?${query}`).catch(() => []);
};

export const createFeedback = ({ llmTask, type, options, comments, inputData, outputData }) =>
    submitPostRequest(
        `${url}feedbacks`,
        { 'Content-Type': 'application/json' },
        { data: { llmTask, type, options, comments, inputData, outputData } },
        true,
        false,
    );
