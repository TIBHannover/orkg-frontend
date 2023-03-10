/**
 * Services file for CMS service
 */
import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';

export const url = env('CMS_URL');

export const getPageByUrl = _url => submitGetRequest(`${url}pages?filters[url]=${_url}`);

export const getAboutPage = id => submitGetRequest(`${url}about-pages/${id}?populate[category][fields][0]=id`);

export const getAboutPageCategories = () => submitGetRequest(`${url}about-page-categories?sort=order&fields[0]=label`).catch(() => []);

export const getAboutPages = (categoryId = null) =>
    submitGetRequest(
        `${url}about-pages?sort=order&pagination[pageSize]=100&fields[0]=title,order&populate[category][fields][0]=id${
            categoryId ? `&filters[category][id][$eq]=${categoryId}` : ''
        }`,
    ).catch(() => []);

export const getHelpArticle = id => submitGetRequest(`${url}help-articles/${id}?populate[help_category][fields][0]=id,title`);

export const getHelpArticles = ({ where = '' }) => submitGetRequest(`${url}help-articles?${where}`);

export const getHelpCategories = () =>
    submitGetRequest(`${url}help-categories?sort=order&populate[help_articles][fields][0]=title,order&populate[help_articles][sort][0]=order`);

export const getHelpCategory = id =>
    submitGetRequest(`${url}help-categories/${id}?populate[help_articles][fields][0]=title,order&populate[help_articles][sort][0]=order`);

export const getHomeAlerts = () => submitGetRequest(`${url}home-alerts?sort=order`).catch(() => []);

export const getNewsCards = ({ limit = 10, sort = 'created_at' }) =>
    submitGetRequest(`${url}news-cards?pagination[pageSize]=${limit}&sort=${sort}`).catch(() => []);
