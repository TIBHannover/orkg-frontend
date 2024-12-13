import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import qs from 'qs';
import backendApi, { getCreatedIdFromHeaders } from 'services/backend/backendApi';
import {
    CreateRosettaStoneStatementParams,
    CreateRosettaStoneTemplateParams,
    PaginatedResponse,
    PaginationParams,
    RosettaStoneStatement,
    RosettaStoneTemplate,
    VisibilityParam,
    UpdateRosettaStoneStatementParams,
    UpdateRosettaStoneTemplateParams,
    CreatedByParam,
} from 'services/backend/types';

export const rosettaStoneUrl = `${url}rosetta-stone/`;
export const rosettaStoneApi = backendApi.extend(() => ({ prefixUrl: rosettaStoneUrl }));
const ROSETTA_STONE_TEMPLATE_CONTENT_TYPE = 'application/vnd.orkg.rosetta-stone-template.v1+json';
const ROSETTA_STONE_STATEMENT_CONTENT_TYPE = 'application/vnd.orkg.rosetta-stone-statement.v1+json';

export const getRSTemplate = (id: string) =>
    rosettaStoneApi
        .get<RosettaStoneTemplate>(`templates/${id}`, {
            headers: {
                Accept: ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
            },
        })
        .json();

export type GetTemplatesParams = {
    q?: string | null;
    exact?: boolean;
    createdBy?: string | null;
} & PaginationParams &
    VisibilityParam &
    CreatedByParam;

export const getRSTemplates = ({
    q = null,
    exact = false,
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
}: GetTemplatesParams) => {
    const searchParams = qs.stringify(
        {
            page,
            size,
            sort: sortBy?.map((p) => `${p.property},${p.direction}`),
            ...(q ? { q, exact } : {}),
            visibility,
            created_by,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return rosettaStoneApi
        .get<PaginatedResponse<RosettaStoneTemplate>>(`templates`, {
            searchParams,
            headers: {
                Accept: ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
            },
        })
        .json();
};

export const createRSTemplate = (data: CreateRosettaStoneTemplateParams) =>
    rosettaStoneApi
        .post<void>(`templates`, {
            json: data,
            headers: {
                'Content-Type': ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
                Accept: ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateRSTemplate = (id: string, data: UpdateRosettaStoneTemplateParams) =>
    rosettaStoneApi
        .put<void>(`templates/${id}`, {
            json: data,
            headers: {
                'Content-Type': ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
                Accept: ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const deleteRSTemplate = (id: string) =>
    rosettaStoneApi
        .delete<void>(`templates/${id}`, {
            headers: {
                Accept: ROSETTA_STONE_TEMPLATE_CONTENT_TYPE,
            },
        })
        .json();

export const getRSStatement = (id: string): Promise<RosettaStoneStatement> =>
    rosettaStoneApi
        .get<RosettaStoneStatement>(`statements/${id}`, {
            headers: {
                Accept: ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
            },
        })
        .json();

export type GetStatementsParams = {
    context?: string;
    template_id?: string;
    createdBy?: string | null;
} & PaginationParams &
    VisibilityParam;

export const getRSStatements = ({
    context,
    template_id,
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'asc' }],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}: GetStatementsParams) => {
    const searchParams = qs.stringify(
        {
            page,
            size,
            sort: sortBy?.map((p) => `${p.property},${p.direction}`),
            visibility,
            context,
            template_id,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return rosettaStoneApi
        .get<PaginatedResponse<RosettaStoneStatement>>('statements', {
            searchParams,
            headers: {
                Accept: ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
            },
        })
        .json();
};

export const getRSStatementVersions = ({ id }: { id: string }) => {
    return rosettaStoneApi
        .get<RosettaStoneStatement[]>(`statements/${id}/versions`, {
            headers: {
                Accept: ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
            },
        })
        .json();
};

export const createRSStatement = (data: CreateRosettaStoneStatementParams) =>
    rosettaStoneApi
        .post<RosettaStoneStatement>(`statements`, {
            json: data,
            headers: {
                'Content-Type': ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
                Accept: ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateRSStatement = (id: string, data: UpdateRosettaStoneStatementParams) =>
    rosettaStoneApi
        .post<void>(`statements/${id}`, {
            json: data,
            headers: {
                'Content-Type': ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
                Accept: ROSETTA_STONE_STATEMENT_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const deleteRSStatement = (id: string) => rosettaStoneApi.delete<void>(`statements/${id}`).json();

export const fullyDeleteRSStatement = (id: string) => rosettaStoneApi.delete<void>(`statements/${id}/versions`).json();
