import {
    CreateRosettaStoneTemplateRequest,
    RosettaStoneStatementsApi,
    RosettaStoneStatementsApiFindAllRequest,
    RosettaStoneTemplatesApi,
    RosettaStoneTemplatesApiFindAllRequest,
    UpdateRosettaStoneTemplateRequest,
} from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toTemplatePropertyRequest } from '@/services/backend/mapTemplateProperty';
import {
    CreateRosettaStoneStatementParams,
    CreateRosettaStoneTemplateParams,
    UpdateRosettaStoneStatementParams,
    UpdateRosettaStoneTemplateParams,
    VisibilityParam,
    WithPaginationParams,
} from '@/services/backend/types';

export const rosettaStoneUrl = `${urlNoTrailingSlash}/rosetta-stone`;

const rosettaStoneTemplatesApi = new RosettaStoneTemplatesApi(configuration);
const rosettaStoneStatementsApi = new RosettaStoneStatementsApi(configuration);

export const getRSTemplate = (id: string) => rosettaStoneTemplatesApi.findById({ id });

export const getRSTemplates = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    ...params
}: Omit<WithPaginationParams<RosettaStoneTemplatesApiFindAllRequest>, 'visibility'> & VisibilityParam) =>
    rosettaStoneTemplatesApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as RosettaStoneTemplatesApiFindAllRequest['visibility'],
        }),
    );

export const deleteRSTemplate = (id: string) => rosettaStoneTemplatesApi.deleteById({ id });

export const toCreateRosettaStoneTemplateRequest = (data: CreateRosettaStoneTemplateParams): CreateRosettaStoneTemplateRequest => ({
    label: data.label,
    description: data.description,
    exampleUsage: data.exampleUsage,
    formattedLabel: data.formattedLabel,
    observatories: data.observatories,
    organizations: data.organizations,
    properties: data.properties.map(toTemplatePropertyRequest),
});

export const toUpdateRosettaStoneTemplateRequest = (data: UpdateRosettaStoneTemplateParams): UpdateRosettaStoneTemplateRequest => ({
    label: data.label,
    exampleUsage: data.exampleUsage,
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.formattedLabel !== undefined ? { formattedLabel: data.formattedLabel } : {}),
    ...(data.observatories !== undefined ? { observatories: data.observatories } : {}),
    ...(data.organizations !== undefined ? { organizations: data.organizations } : {}),
    ...(data.properties ? { properties: data.properties.map(toTemplatePropertyRequest) } : {}),
});

export const createRSTemplate = (data: CreateRosettaStoneTemplateParams) =>
    rosettaStoneTemplatesApi.createRaw({ createRosettaStoneTemplateRequest: toCreateRosettaStoneTemplateRequest(data) }).then(getCreatedId);

export const updateRSTemplate = (id: string, data: UpdateRosettaStoneTemplateParams) =>
    rosettaStoneTemplatesApi.update({ id, updateRosettaStoneTemplateRequest: toUpdateRosettaStoneTemplateRequest(data) });

export const getRSStatement = (id: string) => rosettaStoneStatementsApi.findById({ id });

export const getRSStatements = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    sortBy = [{ property: 'createdAt', direction: 'asc' }],
    ...params
}: Omit<WithPaginationParams<RosettaStoneStatementsApiFindAllRequest>, 'visibility'> & VisibilityParam) =>
    rosettaStoneStatementsApi.findAll(
        transformPaginationParams({
            ...params,
            sortBy,
            visibility: visibility as RosettaStoneStatementsApiFindAllRequest['visibility'],
        }),
    );

export const getRSStatementVersions = ({ id }: { id: string }) => rosettaStoneStatementsApi.findAllVersionsById({ id });

export const createRSStatement = (data: CreateRosettaStoneStatementParams) =>
    rosettaStoneStatementsApi.createRaw({ createRosettaStoneStatementRequest: data }).then(getCreatedId);

// updating creates a new version; the id of that version comes back in the Location header
export const updateRSStatement = (id: string, data: UpdateRosettaStoneStatementParams) =>
    rosettaStoneStatementsApi.updateRaw({ id, updateRosettaStoneStatementRequest: data }).then(getCreatedId);

export const deleteRSStatement = (id: string) => rosettaStoneStatementsApi.deleteLatestVersionById({ id });

export const fullyDeleteRSStatement = (id: string) => rosettaStoneStatementsApi.deleteAllVersionsById({ id });
