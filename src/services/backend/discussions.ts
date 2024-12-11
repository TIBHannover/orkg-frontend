import { url } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { Comment, PaginatedResponse } from 'services/backend/types';

export const discussionsUrl = `${url}discussions/topic/`;
export const discussionsApi = backendApi.extend(() => ({ prefixUrl: discussionsUrl }));

export const getDiscussionsByEntityId = ({
    entityId,
    page,
    size = 5,
}: {
    entityId: string;
    page: number;
    size?: number;
}): Promise<PaginatedResponse<Comment>> => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );

    return discussionsApi
        .get<PaginatedResponse<Comment>>(entityId, {
            searchParams,
        })
        .json();
};

export const getDiscussionCountByEntityId = async (entityId: string): Promise<number> => {
    const searchParams = qs.stringify(
        { page: 0, size: 1 },
        {
            skipNulls: true,
        },
    );

    return (
        await discussionsApi
            .get<PaginatedResponse<Comment>>(entityId, {
                searchParams,
            })
            .json()
    ).totalElements;
};

export const createComment = ({ entityId, message }: { entityId: string; message: string }) =>
    discussionsApi.post<Comment>(entityId, { json: { message } }).json();

export const deleteComment = ({ entityId, commentId }: { entityId: string; commentId: string }): Promise<void> =>
    discussionsApi.delete<void>(`${entityId}/${commentId}`).json();
