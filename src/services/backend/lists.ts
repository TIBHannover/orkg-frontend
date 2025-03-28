import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { List } from '@/services/backend/types';

export const listsUrl = `${url}lists/`;
export const listsApi = backendApi.extend(() => ({ prefixUrl: listsUrl }));

export const getList = (id: string) => listsApi.get<List>(id).json();

export const updateList = ({ id, label = null, elements }: { id: string; label?: string | null; elements: string[] }) =>
    listsApi.patch<void>(id, { json: { label, elements } }).json();

export const createList = ({ label = '', elements = [] }: { label?: string; elements?: string[] }) =>
    listsApi.post<List>('', { json: { label, elements } }).json();
