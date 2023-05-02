import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';

export const discussionsUrl = `${url}discussions/topic/`;

export const getDiscussionsByEntityId = ({ entityId, page, size = 5 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${discussionsUrl}${entityId}?${params}`);
};

export const getDiscussionCountByEntityId = async entityId => {
    const params = qs.stringify(
        { page: 0, size: 1 },
        {
            skipNulls: true,
        },
    );

    return (await submitGetRequest(`${discussionsUrl}${entityId}?${params}`)).totalElements;
};

export const createComment = ({ entityId, message }) =>
    submitPostRequest(`${discussionsUrl}${entityId}`, { 'Content-Type': 'application/json' }, { message });

export const deleteComment = ({ entityId, commentId }) => submitDeleteRequest(`${discussionsUrl}${entityId}/${commentId}`);
