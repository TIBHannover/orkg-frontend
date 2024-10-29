import { url } from 'constants/misc';
import { submitGetRequest, submitPatchRequest, submitPostRequest } from 'network';
import { List } from 'services/backend/types';

export const listsUrl = `${url}lists/`;

export const getList = (id: string): Promise<List> => submitGetRequest(`${listsUrl}${id}`);

export const updateList = ({ id, label = null, elements }: { id: string; label?: string | null; elements: string[] }): Promise<null> =>
    submitPatchRequest(`${listsUrl}${id}`, { 'Content-Type': 'application/json' }, { label, elements });

export const createList = ({ label = '', elements = [] }: { label?: string; elements?: string[] }): Promise<List> =>
    submitPostRequest(`${listsUrl}`, { 'Content-Type': 'application/json' }, { label, elements });
