import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitGetRequest, submitPostRequest, submitDeleteRequest, submitPutRequest } from 'network';
import qs from 'qs';
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

export const getRSTemplate = (id: string): Promise<RosettaStoneTemplate> =>
    submitGetRequest(`${rosettaStoneUrl}templates/${id}`, {
        'Content-Type': 'application/vnd.orkg.rosetta-stone-template.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.rosetta-stone-template.v1+json',
    });

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
}: GetTemplatesParams): Promise<PaginatedResponse<RosettaStoneTemplate>> => {
    const params = qs.stringify(
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

    return submitGetRequest(`${rosettaStoneUrl}templates?${params}`, {
        'Content-Type': 'application/vnd.orkg.rosetta-stone-template.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.rosetta-stone-template.v1+json',
    });
};

export const createRSTemplate = (data: CreateRosettaStoneTemplateParams): Promise<string> =>
    submitPostRequest(
        `${rosettaStoneUrl}templates`,
        {
            'Content-Type': 'application/vnd.orkg.rosetta-stone-template.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.rosetta-stone-template.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header;

export const updateRSTemplate = (id: string, data: UpdateRosettaStoneTemplateParams): Promise<string> =>
    submitPutRequest(
        `${rosettaStoneUrl}templates/${id}`,
        {
            'Content-Type': 'application/vnd.orkg.rosetta-stone-template.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.rosetta-stone-template.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header;

export const deleteRSTemplate = (id: string): Promise<null> =>
    submitDeleteRequest(`${rosettaStoneUrl}templates/${id}`, {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.orkg.rosetta-stone-template.v1+json',
    });

export const getRSStatement = (id: string): Promise<RosettaStoneStatement> =>
    submitGetRequest(`${rosettaStoneUrl}statements/${id}`, {
        'Content-Type': 'application/vnd.orkg.rosetta-stone-statement.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.rosetta-stone-statement.v1+json',
    });

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
}: GetStatementsParams): Promise<PaginatedResponse<RosettaStoneStatement>> => {
    const params = qs.stringify(
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

    return submitGetRequest(`${rosettaStoneUrl}statements?${params}`, {
        'Content-Type': 'application/vnd.orkg.rosetta-stone-statement.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.rosetta-stone-statement.v1+json',
    });
};

export const getRSStatementVersions = ({ id }: { id: string }): Promise<RosettaStoneStatement[]> => {
    return submitGetRequest(`${rosettaStoneUrl}statements/${id}/versions`, {
        'Content-Type': 'application/vnd.orkg.rosetta-stone-statement.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.rosetta-stone-statement.v1+json',
    });
};

export const createRSStatement = (data: CreateRosettaStoneStatementParams): Promise<RosettaStoneStatement> =>
    submitPostRequest(
        `${rosettaStoneUrl}statements`,
        {
            'Content-Type': 'application/vnd.orkg.rosetta-stone-statement.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.rosetta-stone-statement.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header;

export const updateRSStatement = (id: string, data: UpdateRosettaStoneStatementParams): Promise<string> =>
    submitPostRequest(
        `${rosettaStoneUrl}statements/${id}`,
        {
            'Content-Type': 'application/vnd.orkg.rosetta-stone-statement.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.rosetta-stone-statement.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header;

export const deleteRSStatement = (id: string): Promise<null> => submitDeleteRequest(`${rosettaStoneUrl}statements/${id}`);

export const fullyDeleteRSStatement = (id: string): Promise<null> => submitDeleteRequest(`${rosettaStoneUrl}statements/${id}/versions`);
