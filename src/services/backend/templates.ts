import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { uniqBy } from 'lodash';
import { getCreatedIdFromHeaders, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { CreateTemplateParams, PaginatedResponse, PaginationParams, Template, UpdateTemplateParams, VisibilityParam } from 'services/backend/types';

export const templatesUrl = `${url}templates/`;

export const getTemplate = (id: string): Promise<Template> =>
    submitGetRequest(`${templatesUrl}${id}`, {
        'Content-Type': 'application/vnd.orkg.template.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.template.v1+json',
    });

export const createTemplate = (data: CreateTemplateParams): Promise<Template> =>
    submitPostRequest(
        `${templatesUrl}`,
        {
            'Content-Type': 'application/vnd.orkg.template.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.template.v1+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers)); // get the id from the location header;

export const updateTemplate = (id: string, data: UpdateTemplateParams): Promise<Template> =>
    submitPutRequest(
        `${templatesUrl}${id}`,
        {
            'Content-Type': 'application/vnd.orkg.template.v1+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.template.v1+json',
        },
        data,
    );

export type getTemplatesParams = {
    q?: string | null;
    exact?: boolean;
    createdBy?: string | null;
    researchField?: string | null;
    includeSubfields?: boolean | null;
    researchProblem?: string | null;
    targetClass?: string | null;
    createdAtStart?: string | null;
    createdAtEnd?: string | null;
    observatoryId?: string | null;
    organizationId?: string | null;
} & PaginationParams &
    VisibilityParam;

export const getTemplates = ({
    q = null,
    exact = false,
    createdBy = null,
    researchField = null,
    includeSubfields = null,
    researchProblem = null,
    targetClass = null,
    createdAtStart = null,
    createdAtEnd = null,
    observatoryId = null,
    organizationId = null,
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}: getTemplatesParams): Promise<PaginatedResponse<Template>> => {
    const params = qs.stringify(
        {
            page,
            size,
            sort: sortBy?.map((p) => `${p.property},${p.direction}`),
            ...(q ? { q, exact } : {}),
            visibility,
            created_by: createdBy,
            research_field: researchField,
            include_subfields: includeSubfields,
            research_problem: researchProblem,
            target_class: targetClass,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            observatory_id: observatoryId,
            organization_id: organizationId,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return submitGetRequest(`${templatesUrl}?${params}`, {
        'Content-Type': 'application/vnd.orkg.template.v1+json;charset=UTF-8',
        Accept: 'application/vnd.orkg.template.v1+json',
    });
};

export const getFeaturedTemplates = async ({
    researchFields = [],
    researchProblems = [],
}: {
    researchFields: string[];
    researchProblems: string[];
}): Promise<Template[]> => {
    const researchFieldTemplates =
        researchFields?.length > 0
            ? researchFields.map((rf) =>
                  getTemplates({
                      researchField: rf,
                      includeSubfields: false,
                  }),
              )
            : [];

    const researchProblemsTemplates =
        researchProblems?.length > 0
            ? researchProblems.map((rp) =>
                  getTemplates({
                      researchProblem: rp,
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
