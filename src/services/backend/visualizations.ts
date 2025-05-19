import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { prepareParams } from '@/services/backend/misc';
import {
    CreatedByParam,
    CreateVisualizationParams,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    ResearchFieldIdParams,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
    Visualization,
} from '@/services/backend/types';

export const visualizationsUrl = `${url}visualizations/`;
export const visualizationsApi = backendApi.extend(() => ({ prefixUrl: visualizationsUrl }));
const VISUALIZATIONS_CONTENT_TYPE = 'application/vnd.orkg.visualization.v2+json';

export const getVisualizations = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    research_field,
    include_subfields,
    sdg,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & ObservatoryIdParam & ResearchFieldIdParams) => {
    const searchParams = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        research_field,
        include_subfields,
    });
    return visualizationsApi
        .get<PaginatedResponse<Visualization>>('', {
            searchParams,
            headers: {
                Accept: VISUALIZATIONS_CONTENT_TYPE,
            },
        })
        .json();
};

export const getVisualization = (id: string) =>
    visualizationsApi
        .get<Visualization>(encodeURIComponent(id), {
            headers: {
                Accept: VISUALIZATIONS_CONTENT_TYPE,
            },
        })
        .json();

export const createVisualization = (data: CreateVisualizationParams): Promise<string> =>
    visualizationsApi
        .post<void>('', {
            json: data,
            headers: {
                'Content-Type': VISUALIZATIONS_CONTENT_TYPE,
                Accept: VISUALIZATIONS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
