import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';

export const doisUrl = `${url}dois/`;

export const saveFullPaper = (data, mergeIfExists = false) => {
    return submitPostRequest(`${url}papers/?mergeIfExists=${mergeIfExists}`, { 'Content-Type': 'application/json' }, data);
};

export const getPaperByDOI = doi => {
    return submitGetRequest(`${url}widgets/?doi=${doi}`);
};

export const generateDOIForComparison = (comparison_id, title, subject, description, related_resources, authors, url) => {
    return submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json' },
        { comparison_id, title, subject, description, related_resources, authors, url }
    );
};
