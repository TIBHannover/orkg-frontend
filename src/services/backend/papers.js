import { url } from 'constants/misc';
import { submitPutRequest, submitDeleteRequest, submitPostRequest } from 'network';

export const papersUrl = `${url}papers/`;

export const saveFullPaper = (data, mergeIfExists = false) => {
    return submitPostRequest(`${papersUrl}?mergeIfExists=${mergeIfExists}`, { 'Content-Type': 'application/json' }, data);
};

export const markAsVerified = id => {
    return submitPutRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });
};

export const markAsUnverified = id => {
    return submitDeleteRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });
};
