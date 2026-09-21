import {
    ComparisonRelatedFiguresApi,
    ComparisonRelatedResourcesApi,
    ComparisonsApi,
    ComparisonsApiFindAllRequest,
    ComparisonTablesApi,
    CreateComparisonRelatedFigureRequest,
    CreateComparisonRelatedResourceRequest,
    CreateComparisonRequest,
    PublishComparisonRequest,
    UpdateComparisonRelatedFigureRequest,
    UpdateComparisonRelatedResourceRequest,
    UpdateComparisonRequest,
} from '@orkg/orkg-client';
import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import backendApi, { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toAuthorRequest } from '@/services/backend/mapAuthor';
import { toCamelPage } from '@/services/backend/misc';
import {
    ComparisonUpdateSelectedPath,
    PaginatedResponse,
    PublishedParam,
    UpdateAuthor,
    VisibilityParam,
    WithPaginationParams,
} from '@/services/backend/types';

export const comparisonUrl = `${urlNoTrailingSlash}/comparisons`;

// unlike every other content type, /comparisons has no default representation: the backend
// answers 406 to any Accept header (even */*) other than exactly this media type, so the
// generated read operations need it passed explicitly
const COMPARISON_MEDIA_TYPE = 'application/vnd.orkg.comparison.v3+json';

const comparisonsApi = new ComparisonsApi(configuration);
const comparisonTablesApi = new ComparisonTablesApi(configuration);
const comparisonRelatedFiguresApi = new ComparisonRelatedFiguresApi(configuration);
const comparisonRelatedResourcesApi = new ComparisonRelatedResourcesApi(configuration);

// GET /comparisons/{id}/authors has no generated client operation yet, so it stays on ky
const comparisonsKyApi = backendApi.extend(() => ({ prefixUrl: `${comparisonUrl}/` }));

// wire format (snake_case): the endpoint is only reachable through ky.
// AuthorCard.tsx declares the same info shape — keep them in sync
export type ComparisonTopAuthor = {
    author: {
        value: string;
    };
    info: {
        paper_id: string;
        author_index: number;
        paper_year: number;
    }[];
};

export const getAuthorsByComparisonId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify({ page, size });
    return (
        comparisonsKyApi
            .get<PaginatedResponse<ComparisonTopAuthor>>(`${encodeURIComponent(id)}/authors`, {
                searchParams,
            })
            .json()
            // the endpoint stays on ky pending its rework; normalize the page so pagination
            // consumers only ever see the camelCase shape
            .then(toCamelPage)
    );
};

export const getComparison = (id: string) => comparisonsApi.findById({ id, accept: COMPARISON_MEDIA_TYPE });

export const getComparisonContents = (id: string) => comparisonTablesApi.findTableByComparisonId({ id });

export const updateComparisonContents = ({ id, selectedPaths }: { id: string; selectedPaths: ComparisonUpdateSelectedPath[] }) =>
    comparisonTablesApi.updateTable({ id, updateComparisonTableRequest: { selectedPaths } });

export const getComparisonTablePaths = (id: string) => comparisonTablesApi.findAllPathsByComparisonId({ id });

export const getComparisonTableCsv = (id: string, { transposed = false }: { transposed?: boolean } = {}): Promise<string> =>
    comparisonTablesApi.findTableByComparisonIdAsCsv({ id }, transposed);

export const getComparisonRelatedFigure = ({ comparisonId, relatedFigureId }: { comparisonId: string; relatedFigureId: string }) =>
    comparisonRelatedFiguresApi.findByIdAndComparisonId({ id: comparisonId, comparisonRelatedFigureId: relatedFigureId });

export type UpdateComparisonRelatedFigureParams = UpdateComparisonRelatedFigureRequest;

export const updateComparisonRelatedFigure = ({
    comparisonId,
    relatedFigureId,
    data,
}: {
    comparisonId: string;
    relatedFigureId: string;
    data: UpdateComparisonRelatedFigureParams;
}) =>
    comparisonRelatedFiguresApi.update({
        id: comparisonId,
        comparisonRelatedFigureId: relatedFigureId,
        updateComparisonRelatedFigureRequest: data,
    });

export const createComparisonRelatedFigure = ({ comparisonId, data }: { comparisonId: string; data: CreateComparisonRelatedFigureRequest }) =>
    comparisonRelatedFiguresApi.createRaw({ id: comparisonId, createComparisonRelatedFigureRequest: data }).then(getCreatedId);

export const deleteComparisonRelatedFigure = ({ comparisonId, relatedFigureId }: { comparisonId: string; relatedFigureId: string }) =>
    comparisonRelatedFiguresApi.deleteByIdAndComparisonId({ id: comparisonId, comparisonRelatedFigureId: relatedFigureId });

export const getComparisonRelatedResource = ({ comparisonId, relatedResourceId }: { comparisonId: string; relatedResourceId: string }) =>
    comparisonRelatedResourcesApi.findByIdAndComparisonId({ id: comparisonId, comparisonRelatedResourceId: relatedResourceId });

export type UpdateComparisonRelatedResourceParams = UpdateComparisonRelatedResourceRequest;

export const updateComparisonRelatedResource = ({
    comparisonId,
    relatedResourceId,
    data,
}: {
    comparisonId: string;
    relatedResourceId: string;
    data: UpdateComparisonRelatedResourceParams;
}) =>
    comparisonRelatedResourcesApi.update({
        id: comparisonId,
        comparisonRelatedResourceId: relatedResourceId,
        updateComparisonRelatedResourceRequest: data,
    });

export const createComparisonRelatedResource = ({
    comparisonId,
    data,
}: {
    comparisonId: string;
    data: CreateComparisonRelatedResourceRequest;
}): Promise<string> => comparisonRelatedResourcesApi.createRaw({ id: comparisonId, createComparisonRelatedResourceRequest: data }).then(getCreatedId);

export const deleteComparisonRelatedResource = ({ comparisonId, relatedResourceId }: { comparisonId: string; relatedResourceId: string }) =>
    comparisonRelatedResourcesApi.deleteByIdAndComparisonId({ id: comparisonId, comparisonRelatedResourceId: relatedResourceId });

// authors come from edit forms, which produce explicit null ids the generated request forbids
export type UpdateComparisonParams = Omit<UpdateComparisonRequest, 'authors'> & {
    authors?: UpdateAuthor[];
};

export const toUpdateComparisonRequest = (data: UpdateComparisonParams): UpdateComparisonRequest => ({
    ...data,
    authors: data.authors?.map(toAuthorRequest),
});

export const updateComparison = (id: string, data: UpdateComparisonParams) =>
    comparisonsApi.update({ id, updateComparisonRequest: toUpdateComparisonRequest(data) });

// the endpoint rejects the request with a 415 unless the comparison v3 media type is sent as
// Content-Type — even though a DELETE carries no body — and the spec doesn't declare that,
// so the generated operation needs it passed explicitly (reported)
export const deleteComparison = (id: string) => comparisonsApi.deleteById({ id, contentType: COMPARISON_MEDIA_TYPE });

export const getComparisons = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    published,
    ...params
}: Omit<WithPaginationParams<ComparisonsApiFindAllRequest>, 'visibility' | 'published'> & VisibilityParam & PublishedParam) =>
    comparisonsApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as ComparisonsApiFindAllRequest['visibility'],
            published: published ?? undefined,
            accept: COMPARISON_MEDIA_TYPE,
        }),
    );

// title stays required so a caller can't silently create an untitled comparison
export type CreateComparisonParams = Partial<Omit<CreateComparisonRequest, 'authors' | 'title'>> &
    Pick<CreateComparisonRequest, 'title'> & {
        authors?: UpdateAuthor[];
    };

export const toCreateComparisonRequest = (data: CreateComparisonParams): CreateComparisonRequest => ({
    title: data.title,
    description: data.description ?? '',
    extractionMethod: data.extractionMethod ?? 'UNKNOWN',
    isAnonymized: data.isAnonymized ?? false,
    observatories: data.observatories ?? [],
    organizations: data.organizations ?? [],
    references: data.references ?? [],
    researchFields: data.researchFields ?? [],
    sources: data.sources ?? [],
    visualizations: data.visualizations ?? [],
    authors: (data.authors ?? []).map(toAuthorRequest),
    ...(data.sdgs !== undefined ? { sdgs: data.sdgs } : {}),
    ...(data.searchProtocol !== undefined ? { searchProtocol: data.searchProtocol } : {}),
    ...(data.type !== undefined ? { type: data.type } : {}),
});

export const createComparison = (data: CreateComparisonParams) =>
    comparisonsApi.createRaw({ createComparisonRequest: toCreateComparisonRequest(data) }).then(getCreatedId);

export type PublishComparisonParams = Omit<PublishComparisonRequest, 'authors'> & {
    authors: UpdateAuthor[];
};

export const toPublishComparisonRequest = (data: PublishComparisonParams): PublishComparisonRequest => ({
    assignDoi: data.assignDoi,
    description: data.description,
    subject: data.subject,
    authors: data.authors.map(toAuthorRequest),
});

export const publishComparison = (comparisonId: string, data: PublishComparisonParams) =>
    comparisonsApi.publishRaw({ id: comparisonId, publishComparisonRequest: toPublishComparisonRequest(data) }).then(getCreatedId);
