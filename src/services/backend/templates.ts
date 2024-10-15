import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { uniqBy } from 'lodash';
import { getCreatedIdFromHeaders, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import {
    CreatedByParam,
    CreateTemplateParams,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    ResearchFieldIdParams,
    Template,
    UpdateTemplateParams,
    VisibilityParam,
} from 'services/backend/types';

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
    researchProblem?: string | null;
    targetClass?: string | null;
    createdAtStart?: string | null;
    createdAtEnd?: string | null;
} & PaginationParams &
    VisibilityParam &
    CreatedByParam &
    ResearchFieldIdParams &
    ObservatoryIdParam &
    OrganizationIdParam;

export const getTemplates = ({
    q = null,
    exact = false,
    created_by = undefined,
    research_field = undefined,
    include_subfields = undefined,
    researchProblem = null,
    targetClass = null,
    createdAtStart = null,
    createdAtEnd = null,
    observatory_id = undefined,
    organization_id = undefined,
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
            created_by,
            research_field,
            include_subfields,
            research_problem: researchProblem,
            target_class: targetClass,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            observatory_id,
            organization_id,
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
                      research_field: rf,
                      include_subfields: false,
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
