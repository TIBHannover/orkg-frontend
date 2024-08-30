/**
 * Services file for CMS service
 */
import { env } from 'next-runtime-env';
import { submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';
import {
    AboutPageCategory,
    Alert,
    CmsResponsePaginated,
    CmsResponseSingle,
    Feedback,
    FeedbackType,
    HelpArticle,
    HelpCategory,
    NewsCard,
} from 'services/cms/types';

export const url = env('NEXT_PUBLIC_CMS_URL');

export const getPageByUrl = (_url: string): Promise<CmsResponsePaginated<HelpArticle>> => submitGetRequest(`${url}pages?filters[url]=${_url}`);

export const getAboutPage = (id: number): Promise<CmsResponseSingle<HelpArticle>> => {
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

export const getAboutPageCategories = (): Promise<CmsResponsePaginated<AboutPageCategory>> => {
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

export const getAboutPages = (categoryId = null): Promise<CmsResponsePaginated<HelpArticle>> => {
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

export const getHelpArticle = (id: string): Promise<CmsResponseSingle<HelpArticle>> => {
    const query = qs.stringify(
        { populate: { help_category: { fields: ['id', 'title'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-articles/${id}?${query}`);
};

export const getHelpArticles = ({ where }: { where: string }): Promise<CmsResponsePaginated<HelpArticle>> =>
    submitGetRequest(`${url}help-articles?${where}`);

export const getHelpCategories = (): Promise<CmsResponsePaginated<HelpArticle>> => {
    const query = qs.stringify(
        { sort: 'order', populate: { help_articles: { fields: ['title', 'order'], sort: ['order'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-categories?${query}`);
};

export const getHelpCategory = (id: string): Promise<CmsResponseSingle<HelpCategory>> => {
    const query = qs.stringify(
        {
            populate: {
                help_articles: {
                    fields: ['title', 'order'],
                    sort: ['order'],
                    filters: {
                        // hide draft articles
                        publishedAt: {
                            $notNull: true,
                        },
                    },
                },
            },
        },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}help-categories/${id}?${query}`);
};

export const getHomeAlerts = (): Promise<CmsResponsePaginated<Alert>> => submitGetRequest(`${url}home-alerts?sort=order`).catch(() => []);

export const getNewsCards = ({ limit = 10, sort = 'created_at' }): Promise<CmsResponsePaginated<NewsCard>> => {
    const query = qs.stringify(
        { pagination: { pageSize: limit }, sort },
        {
            encodeValuesOnly: true,
        },
    );
    return submitGetRequest(`${url}news-cards?${query}`).catch(() => []);
};

export const createFeedback = ({
    llmTask,
    type,
    options,
    comments,
    inputData,
    outputData,
}: {
    llmTask: string;
    type: FeedbackType;
    options: string;
    comments: string;
    inputData: {};
    outputData: {};
}): Promise<CmsResponsePaginated<Feedback>> =>
    submitPostRequest(
        `${url}feedbacks`,
        { 'Content-Type': 'application/json' },
        { data: { llmTask, type, options, comments, inputData, outputData } },
        true,
        false,
    );
