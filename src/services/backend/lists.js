import { url } from 'constants/misc';
import { submitPatchRequest, submitPostRequest } from 'network';

export const listsUrl = `${url}lists/`;

export const updateList = ({ id, label = null, elements }) =>
    submitPatchRequest(`${listsUrl}${id}`, { 'Content-Type': 'application/json' }, { label, elements });

export const createList = ({ label = '', elements = [] }) =>
    submitPostRequest(`${listsUrl}`, { 'Content-Type': 'application/json' }, { label, elements });
