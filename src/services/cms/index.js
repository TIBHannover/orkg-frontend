/**
 * Services file for CMS service
 */

import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';

export const url = env('CMS_URL');

export const getCategory = id => submitGetRequest(`${url}categories/${id}`);

export const getPage = id => submitGetRequest(`${url}pages/${id}`);

export const getPageByUrl = _url => submitGetRequest(`${url}pages?url=${_url}`).then(pages => pages[0] ?? null);

export const getAboutPage = id => submitGetRequest(`${url}about-pages/${id}`);

export const getAboutPages = () => submitGetRequest(`${url}about-pages?_sort=order`).catch(() => []);

export const getAboutPagesMenu = () => submitGetRequest(`${url}about-pages/menu?_sort=order`).catch(() => []);

export const getHelpArticle = id => submitGetRequest(`${url}help-articles/${id}`);

export const getHelpArticles = ({ where = '' }) => submitGetRequest(`${url}help-articles?${where}`);

export const getHelpCategories = () => submitGetRequest(`${url}help-categories?_sort=order`);

export const getHelpCategory = id => submitGetRequest(`${url}help-categories/${id}`);

export const getHomeAlerts = () => submitGetRequest(`${url}home-alerts`).catch(() => []);

export const getNewsCards = ({ limit = 10, sort = 'created_at' }) =>
    submitGetRequest(`${url}news-cards?_limit=${limit}&_sort=${sort}`).catch(() => []);
