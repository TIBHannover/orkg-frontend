import { CreateTemplateRequest, TemplatesApi, TemplatesApiFindAllRequest, UpdateTemplateRequest } from '@orkg/orkg-client';
import { uniqBy } from 'lodash';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toTemplatePropertyRequest } from '@/services/backend/mapTemplateProperty';
import { CreateTemplateParams, Template, UpdateTemplateParams, VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const templatesUrl = `${urlNoTrailingSlash}/templates`;

const templatesApi = new TemplatesApi(configuration);

export const getTemplate = (id: string) => templatesApi.findById({ id });

export const getTemplates = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    ...params
}: Omit<WithPaginationParams<TemplatesApiFindAllRequest>, 'visibility'> & VisibilityParam) =>
    templatesApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as TemplatesApiFindAllRequest['visibility'],
        }),
    );

export const getFeaturedTemplates = async ({
    researchFields = [],
    researchProblems = [],
}: {
    researchFields: string[];
    researchProblems: string[];
}): Promise<Template[]> => {
    const researchFieldTemplates =
        researchFields?.length > 0
            ? researchFields.map((researchField) =>
                  getTemplates({
                      researchField,
                      includeSubfields: false,
                  }),
              )
            : [];

    const researchProblemsTemplates =
        researchProblems?.length > 0
            ? researchProblems.map((researchProblem) =>
                  getTemplates({
                      researchProblem,
                  }),
              )
            : [];

    return Promise.all([...researchFieldTemplates, ...researchProblemsTemplates]).then((fT) =>
        uniqBy(
            fT
                .map((c) => c.content)
                .filter((r) => r.length)
                .flat(),
            'id',
        ),
    );
};

export const toCreateTemplateRequest = (data: CreateTemplateParams): CreateTemplateRequest => ({
    label: data.label,
    targetClass: data.targetClass,
    isClosed: data.isClosed,
    relations: data.relations,
    properties: data.properties.map(toTemplatePropertyRequest),
    observatories: data.observatories ?? [],
    organizations: data.organizations ?? [],
    ...(data.description != null ? { description: data.description } : {}),
    ...(data.formattedLabel != null ? { formattedLabel: data.formattedLabel } : {}),
});

export const toUpdateTemplateRequest = (data: UpdateTemplateParams): UpdateTemplateRequest => ({
    ...(data.label !== undefined ? { label: data.label } : {}),
    ...(data.targetClass !== undefined ? { targetClass: data.targetClass } : {}),
    ...(data.isClosed !== undefined ? { isClosed: data.isClosed } : {}),
    ...(data.relations !== undefined ? { relations: data.relations } : {}),
    ...(data.observatories !== undefined ? { observatories: data.observatories } : {}),
    ...(data.organizations !== undefined ? { organizations: data.organizations } : {}),
    // the editor sends null to clear these, and null is what the backend wants: it rejects ""
    // with "must not be blank" and only nulls the field for an explicit null. The generated type
    // admits string | undefined only, hence the cast.
    ...(data.description !== undefined ? { description: data.description as string } : {}),
    ...(data.formattedLabel !== undefined ? { formattedLabel: data.formattedLabel as string } : {}),
    ...(data.properties ? { properties: data.properties.map(toTemplatePropertyRequest) } : {}),
});

export const createTemplate = (data: CreateTemplateParams) =>
    templatesApi.createRaw({ createTemplateRequest: toCreateTemplateRequest(data) }).then(getCreatedId);

export const updateTemplate = (id: string, data: UpdateTemplateParams) =>
    templatesApi.update({
        id,
        updateTemplateRequest: toUpdateTemplateRequest(data),
    });
