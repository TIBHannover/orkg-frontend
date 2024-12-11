/**
 * Services file for CMS service
 */
import ky from 'ky';
import { env } from 'next-runtime-env';
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
const cmsApi = ky.create({ prefixUrl: url });

export const getPageByUrl = (_url: string) =>
    cmsApi
        .get<CmsResponsePaginated<HelpArticle>>('pages', {
            searchParams: `filters[url]=${_url}`,
        })
        .json();

export const getAboutPage = (id: number) => {
    const query = qs.stringify(
        {
            populate: { category: { fields: ['id'] } },
        },
        {
            encodeValuesOnly: true,
        },
    );
    return cmsApi
        .get<CmsResponseSingle<HelpArticle>>(`about-pages/${id}`, {
            searchParams: query,
        })
        .json();
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
    return cmsApi
        .get<CmsResponsePaginated<AboutPageCategory>>(`about-page-categories`, {
            searchParams: query,
        })
        .json()
        .catch(() => {});
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

    return cmsApi
        .get<CmsResponsePaginated<HelpArticle>>(`about-pages`, {
            searchParams: query,
        })
        .json()
        .catch(() => {});
};

export const getHelpArticle = (id: string) => {
    const query = qs.stringify(
        { populate: { help_category: { fields: ['id', 'title'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return cmsApi
        .get<CmsResponseSingle<HelpArticle>>(`help-articles/${id}`, {
            searchParams: query,
        })
        .json();
};

export const getHelpArticles = ({ where }: { where: string }) =>
    cmsApi
        .get<CmsResponsePaginated<HelpArticle>>(`help-articles`, {
            searchParams: where,
        })
        .json();

export const getHelpCategories = () => {
    const query = qs.stringify(
        { sort: 'order', populate: { help_articles: { fields: ['title', 'order'], sort: ['order'] } } },
        {
            encodeValuesOnly: true,
        },
    );
    return cmsApi
        .get<CmsResponsePaginated<HelpArticle>>(`help-categories`, {
            searchParams: query,
        })
        .json();
};

export const getHelpCategory = (id: string) => {
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
    return cmsApi
        .get<CmsResponseSingle<HelpCategory>>(`help-categories/${id}`, {
            searchParams: query,
        })
        .json();
};

export const getHomeAlerts = () =>
    cmsApi
        .get<CmsResponsePaginated<Alert>>(`home-alerts?sort=order`)
        .json()
        .catch(() => {});

export const getNewsCards = ({ limit = 10, sort = 'created_at' }) => {
    const query = qs.stringify(
        { pagination: { pageSize: limit }, sort },
        {
            encodeValuesOnly: true,
        },
    );
    return cmsApi
        .get<CmsResponsePaginated<NewsCard>>(`news-cards`, {
            searchParams: query,
        })
        .json()
        .catch(() => {});
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
    cmsApi.post<CmsResponsePaginated<Feedback>>(`feedbacks`, { json: { data: { llmTask, type, options, comments, inputData, outputData } } }).json();
