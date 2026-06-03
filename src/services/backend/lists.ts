import { CreateListRequest, ListsApi, UpdateListRequest } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId } from '@/services/backend/backendApi';

const listsApiClient = new ListsApi(configuration);

export const listsUrl = `${urlNoTrailingSlash}/lists`;

export const getList = (id: string) => listsApiClient.findById({ id });

export const updateList = ({ id, label = null, elements }: UpdateListRequest & { id: string }) =>
    listsApiClient.update({ id, updateListRequest: { label, elements } });

export const createList = (data: CreateListRequest) => listsApiClient.createRaw({ createListRequest: data }).then(getCreatedId);
